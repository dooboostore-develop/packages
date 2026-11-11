// Usage: pnpm bench   (BENCH_TIME=ms per case, default 1000; BENCH_LIBS=a,b to filter)
import { Bench } from 'tinybench';
import { spawnSync } from 'node:child_process';
import { writeFileSync, readFileSync, existsSync, readdirSync, statSync, realpathSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import os from 'node:os';
import { createRequire } from 'node:module';
import { libs } from './libs.mjs';
import { fixtures, selectors } from './fixtures.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const TIME = Number(process.env.BENCH_TIME || 1000);
const names = (process.env.BENCH_LIBS || Object.keys(libs).join(',')).split(',');

// ---- child modes: run in a fresh process so import cost / heap are not polluted ----
const [, , mode, libName] = process.argv;
if (mode === 'cold') {
  const t0 = process.hrtime.bigint();
  const a = await libs[libName]();
  a.parse(fixtures.small);
  console.log(Number(process.hrtime.bigint() - t0) / 1e6);
  process.exit(0);
}
if (mode === 'mem') {
  const a = await libs[libName]();
  a.parse(fixtures.medium); // warm
  global.gc(); global.gc();
  const before = process.memoryUsage().heapUsed;
  const keep = [];
  for (let i = 0; i < 20; i++) keep.push(a.parse(fixtures.medium));
  global.gc(); global.gc();
  const per = (process.memoryUsage().heapUsed - before) / 20 / 1024;
  console.log(per, keep.length);
  process.exit(0);
}

// ---- helpers ----
const fmt = (n) => n >= 100 ? Math.round(n).toLocaleString('en') : n >= 10 ? n.toFixed(1) : n.toFixed(2);
const child = (m, lib) => spawnSync(process.execPath, ['--expose-gc', fileURLToPath(import.meta.url), m, lib], { encoding: 'utf8' });
const median = (xs) => xs.sort((a, b) => a - b)[Math.floor(xs.length / 2)];

function dirSize(p) {
  let s = 0;
  for (const e of readdirSync(p, { withFileTypes: true })) {
    const f = join(p, e.name);
    s += e.isDirectory() ? dirSize(f) : statSync(f).size;
  }
  return s;
}
const req = createRequire(import.meta.url);
function installSize(pkg) {
  try {
    let d = dirname(req.resolve(pkg + '/package.json'));
    return dirSize(realpathSync(d)) / 1024 / 1024;
  } catch { return null; }
}
const pkgOf = { 'dom-parser': '@dooboostore/dom-parser', jsdom: 'jsdom', 'happy-dom': 'happy-dom', linkedom: 'linkedom', cheerio: 'cheerio' };
const versionOf = (pkg) => { try { return req(pkg + '/package.json').version; } catch { return '?'; } };

// ---- throughput scenarios ----
const adapters = {};
for (const n of names) adapters[n] = await libs[n]();

const scenarios = [];
for (const size of ['small', 'medium', 'large']) {
  scenarios.push({ name: `parse ${size} (${Math.round(fixtures[size].length / 1024)} KB)`, run: (a) => { const d = a.parse(fixtures[size]); a.dispose?.(d); }, heavy: size === 'large' });
}
for (const sel of selectors) {
  scenarios.push({ name: `query \`${sel}\` (medium)`, setup: (a) => a.parse(fixtures.medium), run: (a, d) => a.query(d, sel), check: true });
}
scenarios.push({ name: 'mutate: create+append 2000 nodes', setup: (a) => a.parse(fixtures.small), run: (a, d) => a.mutate(d, 2000), check: true });
scenarios.push({ name: 'innerHTML set 1000 <li>', setup: (a) => a.parse(fixtures.small), run: (a, d) => a.innerHTML(d), check: true });
scenarios.push({ name: 'serialize outerHTML (medium)', setup: (a) => a.parse(fixtures.medium), run: (a, d) => a.serialize(d) });

const rows = []; // {scenario, lib, ops, rme}
const warnings = [];
for (const sc of scenarios) {
  console.log(`\n▶ ${sc.name}`);
  const bench = new Bench({ time: sc.heavy ? TIME * 2 : TIME, warmupTime: Math.min(300, TIME / 3), iterations: sc.heavy ? 3 : 10, warmupIterations: 1 });
  const results = {};
  for (const n of names) {
    const a = adapters[n];
    // mutate/innerHTML change the doc, so a fresh doc each iteration; query/serialize reuse one.
    const reuse = sc.setup && !sc.name.startsWith('mutate') && !sc.name.startsWith('innerHTML');
    const shared = reuse ? sc.setup(a) : null;
    bench.add(n, () => { results[n] = sc.run(a, reuse ? shared : sc.setup ? sc.setup(a) : undefined); },
      // untimed hook: keeps garbage from one library from starving the next on multi-MB inputs
      sc.heavy ? { afterEach: () => global.gc?.() } : {});
  }
  await bench.run();
  for (const t of bench.tasks) {
    const r = t.result;
    rows.push({ scenario: sc.name, lib: t.name, ops: r.throughput.mean, rme: r.latency.rme });
    console.log(`  ${t.name.padEnd(11)} ${fmt(r.throughput.mean).padStart(10)} ops/s  ±${r.latency.rme.toFixed(1)}%`);
  }
  if (sc.check) {
    const vals = new Set(Object.values(results).map(String));
    if (vals.size > 1) warnings.push(`${sc.name}: libraries returned different results ${JSON.stringify(results)}`);
  }
}

// ---- cold start + memory (fresh process each) ----
const cold = {}, mem = {};
for (const n of names) {
  cold[n] = median(Array.from({ length: 7 }, () => parseFloat(child('cold', n).stdout)));
  mem[n] = parseFloat(child('mem', n).stdout);
  console.log(`\n${n}: cold ${fmt(cold[n])} ms, ${fmt(mem[n])} KB heap / medium doc`);
}

// ---- markdown ----
const scenarioNames = [...new Set(rows.map((r) => r.scenario))];
let md = `# dom-parser benchmark\n\n`;
md += `- Node ${process.version}, ${os.cpus()[0].model}, ${os.cpus().length} cores, ${os.platform()} ${os.arch()}\n`;
md += `- Versions: ${names.map((n) => `${n} ${versionOf(pkgOf[n])}`).join(', ')}\n`;
md += `- ${new Date().toISOString().slice(0, 10)} · ${TIME} ms per case · fixtures are synthetic (see \`fixtures.mjs\`)\n\n`;
md += `## Throughput (ops/sec, higher is better; best in **bold**)\n\n| scenario | ${names.join(' | ')} |\n|---|${names.map(() => '---:').join('|')}|\n`;
for (const s of scenarioNames) {
  const rs = rows.filter((r) => r.scenario === s);
  const best = Math.max(...rs.map((r) => r.ops));
  md += `| ${s} | ${names.map((n) => { const r = rs.find((x) => x.lib === n); return r.ops === best ? `**${fmt(r.ops)}**` : fmt(r.ops); }).join(' | ')} |\n`;
}
md += `\n## Cold start, memory, size\n\n| | ${names.join(' | ')} |\n|---|${names.map(() => '---:').join('|')}|\n`;
md += `| import + first parse (ms, median of 7) | ${names.map((n) => fmt(cold[n])).join(' | ')} |\n`;
md += `| heap per parsed ~100 KB doc (KB) | ${names.map((n) => fmt(mem[n])).join(' | ')} |\n`;
md += `| install size on disk (MB, incl. own files only) | ${names.map((n) => { const s = installSize(pkgOf[n]); return s == null ? 'n/a' : s.toFixed(1); }).join(' | ')} |\n`;
md += `\n## Notes\n\n- cheerio is a jQuery-style API, not a DOM implementation; it is the "fast HTML parser" reference, not a like-for-like.\n- jsdom additionally implements scripting/layout-adjacent behaviour that the others skip, so parse cost differs by scope, not only by quality.\n- Install size counts the package directory only, not its dependencies.\n- Throughput says nothing about correctness; see the compat tests.\n`;
if (warnings.length) md += `\n## ⚠ Result mismatches (libraries disagreed on the same query)\n\n${warnings.map((w) => `- ${w}`).join('\n')}\n`;
if (existsSync(join(here, 'analysis.md'))) md += readFileSync(join(here, 'analysis.md'), 'utf8'); // hand-written commentary survives regeneration
writeFileSync(join(here, 'RESULTS.md'), md);
console.log('\nWrote bench/RESULTS.md');
if (warnings.length) console.log('\nWARNINGS:\n' + warnings.join('\n'));
