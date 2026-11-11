// Usage: pnpm bench   (BENCH_DURATION=seconds per case, default 8; BENCH_SERVERS=a,b to filter)
// Each server runs in its own process; autocannon drives it over loopback. Servers implement identical routes (servers/_common.ts).
import autocannon from 'autocannon';
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { charts, decorate } from './charts.mjs';
import { createRequire } from 'node:module';
import os from 'node:os';

const here = dirname(fileURLToPath(import.meta.url));
const req = createRequire(import.meta.url);
const DURATION = Number(process.env.BENCH_DURATION || 8);
const CONNECTIONS = Number(process.env.BENCH_CONNECTIONS || 64);
const PORT = 39100;

const servers = {
  'node:http (baseline)': { file: 'node-http', pkg: null },
  'simple-boot-http-server': { file: 'simple-boot', pkg: '@dooboostore/simple-boot-http-server' },
  express: { file: 'express', pkg: 'express' },
  fastify: { file: 'fastify', pkg: 'fastify' },
  hono: { file: 'hono', pkg: 'hono' },
  'nest (express)': { file: 'nest', pkg: '@nestjs/core', env: { NEST_ADAPTER: 'express' } },
  'nest (fastify)': { file: 'nest', pkg: '@nestjs/core', env: { NEST_ADAPTER: 'fastify' } },
};
const only = process.env.BENCH_SERVERS?.split(',');
const names = Object.keys(servers).filter((n) => !only || only.includes(n));

const scenarios = [
  { name: 'hello JSON', requests: [{ method: 'GET', path: '/hello' }], expect: '{"hello":"world"}' },
  { name: 'path param + injected service', requests: [{ method: 'GET', path: '/users/42' }], expect: '{"id":"42","name":"user-42"}' },
  { name: 'JSON body echo (POST)', requests: [{ method: 'POST', path: '/echo', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ a: 1, b: [1, 2, 3], c: 'text' }) }], expect: '{"a":1,"b":[1,2,3],"c":"text"}' },
  { name: '100 routes (rotating)', requests: Array.from({ length: 100 }, (_, i) => ({ method: 'GET', path: '/r/' + i })), expect: null },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const rss = (pid) => { try { return parseInt(readFileSync(`/proc/${pid}/status`, 'utf8').match(/VmRSS:\s+(\d+)/)[1]) / 1024; } catch { return NaN; } };
// children of the server process (tsx-less loader spawns none, but be safe)
const fmt = (n) => (n >= 100 ? Math.round(n).toLocaleString('en') : n.toFixed(1));

async function fetchText(port, r) {
  const res = await fetch(`http://127.0.0.1:${port}${r.path}`, { method: r.method, headers: r.headers, body: r.body });
  return { status: res.status, text: await res.text() };
}

const results = []; // {server, scenario, rps, p50, p99, errors, non2xx}
const meta = {};    // {server: {startMs, rssMb, rssIdleMb}}
const warnings = [];
let port = PORT;

for (const name of names) {
  const s = servers[name];
  port++;
  const t0 = Date.now();
  const child = spawn(process.execPath, ['--import', join(here, 'register-loader.mjs'), join(here, 'servers', s.file + '.ts')], {
    env: { ...process.env, PORT: String(port), ...s.env }, cwd: here, stdio: ['ignore', 'ignore', 'inherit'],
  });
  let up = false;
  for (let i = 0; i < 200 && !up; i++) { try { up = (await fetchText(port, scenarios[0].requests[0])).status === 200; } catch { await sleep(50); } }
  if (!up) { warnings.push(`${name}: did not start`); child.kill(); continue; }
  meta[name] = { startMs: Date.now() - t0, rssIdleMb: rss(child.pid) };
  console.log(`\n▶ ${name} (started in ${meta[name].startMs} ms)`);

  for (const sc of scenarios) {
    // correctness first: every server must answer identically, otherwise the numbers are meaningless
    for (const r of sc.requests.slice(0, 3)) {
      const got = await fetchText(port, r);
      const want = sc.expect ?? `{"route":${Number(r.path.slice(3))}}`;
      if ((got.status < 200 || got.status > 299) || got.text.trim() !== want) warnings.push(`${name} / ${sc.name}: ${r.method} ${r.path} -> ${got.status} ${got.text.slice(0, 80)}`);
    }
    const run = (duration) => autocannon({ url: `http://127.0.0.1:${port}`, connections: CONNECTIONS, duration, requests: sc.requests });
    await run(2); // warmup (JIT)
    const r = await run(DURATION);
    results.push({ server: name, scenario: sc.name, rps: r.requests.average, p50: r.latency.p50, p99: r.latency.p99, errors: r.errors + r.timeouts, non2xx: r.non2xx });
    console.log(`  ${sc.name.padEnd(32)} ${fmt(r.requests.average).padStart(8)} req/s   p50 ${r.latency.p50} ms  p99 ${r.latency.p99} ms${r.non2xx || r.errors ? `   ⚠ non2xx=${r.non2xx} errors=${r.errors}` : ''}`);
  }
  meta[name].rssMb = rss(child.pid);
  child.kill('SIGKILL');
  await sleep(300);
}

// ---- markdown ----
const ver = (p) => { try { return JSON.parse(readFileSync(join(here, 'node_modules', p, 'package.json'), 'utf8')).version; } catch { return '?'; } };
let md = `# simple-boot-http-server benchmark\n\n`;
md += `- Node ${process.version}, ${os.cpus()[0].model}, ${os.cpus().length} cores, ${os.platform()} ${os.arch()}\n`;
md += `- Versions: ${names.filter((n) => servers[n].pkg).map((n) => `${n} ${ver(servers[n].pkg)}`).join(', ')}\n`;
md += `- ${new Date().toISOString().slice(0, 10)} · autocannon, ${CONNECTIONS} connections, 2 s warmup + ${DURATION} s measured per case · server and load generator on the same machine (loopback)\n\n`;
const table = (title, key, fmtv, better) => {
  md += `## ${title}\n\n| scenario | ${names.join(' | ')} |\n|---|${names.map(() => '---:').join('|')}|\n`;
  for (const sc of scenarios) {
    const rs = names.map((n) => results.find((r) => r.server === n && r.scenario === sc.name));
    const vals = rs.map((r) => (r ? r[key] : NaN));
    const best = better === 'high' ? Math.max(...vals.filter((v) => !isNaN(v))) : Math.min(...vals.filter((v) => !isNaN(v)));
    md += `| ${sc.name} | ${vals.map((v) => (isNaN(v) ? 'n/a' : v === best ? `**${fmtv(v)}**` : fmtv(v))).join(' | ')} |\n`;
  }
  md += '\n';
};
table('Throughput (requests/sec, higher is better; best in **bold**)', 'rps', fmt, 'high');
table('Latency p99 (ms, lower is better)', 'p99', (v) => String(v), 'low');
md += `## Startup and memory (lower is better)\n\n| | ${names.join(' | ')} |\n|---|${names.map(() => '---:').join('|')}|\n`;
md += `| start to first response (ms) | ${names.map((n) => meta[n] ? meta[n].startMs : 'n/a').join(' | ')} |\n`;
md += `| RSS right after start (MB) | ${names.map((n) => meta[n] ? fmt(meta[n].rssIdleMb) : 'n/a').join(' | ')} |\n`;
md += `| RSS after all load cases (MB) | ${names.map((n) => meta[n] ? fmt(meta[n].rssMb) : 'n/a').join(' | ')} |\n`;
const bad = results.filter((r) => r.errors || r.non2xx);
if (warnings.length || bad.length) md += `\n## ⚠ Warnings\n\n${[...warnings, ...bad.map((r) => `${r.server} / ${r.scenario}: errors=${r.errors} non2xx=${r.non2xx}`)].map((w) => `- ${w}`).join('\n')}\n`;
md = decorate(md);
md += '\n' + charts(md);
if (existsSync(join(here, 'analysis.md'))) md += readFileSync(join(here, 'analysis.md'), 'utf8');
writeFileSync(join(here, 'RESULTS.md'), md);
console.log('\nWrote bench/RESULTS.md' + (warnings.length ? '\nWARNINGS:\n' + warnings.join('\n') : ''));
