// Usage: pnpm bench   (BENCH_RUNS=samples per operation, default 15; BENCH_IMPLS=a,b to filter)
// Every implementation is a custom element with the same API (apps/common.ts), bundled by esbuild and driven in real Chrome by Playwright.
// Time per operation = script + style + layout (a forced layout ends each sample); paint/raster is not included.
import { build } from 'esbuild';
import esbuildPluginTsc from 'esbuild-plugin-tsc';
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, existsSync, mkdtempSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import { charts, decorate } from './charts.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const RUNS = Number(process.env.BENCH_RUNS || 15);
const impls = {
  'vanilla (DOM calls)': 'vanilla-dom',
  'vanilla (innerHTML)': 'vanilla-html',
  lit: 'lit',
  'simple-web-component': 'swc',
};
const only = process.env.BENCH_IMPLS?.split(',');
const names = Object.keys(impls).filter((n) => !only || only.includes(n));

// ---- bundle ----
const out = mkdtempSync(join(tmpdir(), 'swc-bench-'));
await build({
  entryPoints: Object.fromEntries(Object.values(impls).map((f) => [f, join(here, 'apps', f + '.ts')])),
  outdir: out, bundle: true, format: 'esm', platform: 'browser', target: 'es2022', minify: true, logLevel: 'error',
  plugins: [esbuildPluginTsc({ tsconfigPath: join(here, 'tsconfig.json') })],
});
const size = Object.fromEntries(Object.entries(impls).map(([n, f]) => { const b = readFileSync(join(out, f + '.js')); return [n, { min: b.length / 1024, gz: gzipSync(b).length / 1024 }]; }));

// ---- server ----
const server = createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  if (u.pathname.endsWith('.js')) { res.writeHead(200, { 'content-type': 'text/javascript' }).end(readFileSync(join(out, u.pathname.slice(1)))); return; }
  res.writeHead(200, { 'content-type': 'text/html' }).end(`<!doctype html><meta charset="utf-8"><style>.danger{background:#fbb}</style><body><bench-app></bench-app><script type="module" src="/${u.searchParams.get('f')}.js"></script>`);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

// ---- operations: prep (untimed) -> op (timed) -> expected DOM row count ----
const ops = [
  { name: 'create 1,000 rows', prep: 'b.clearRows()', run: 'b.createRows(1000)', expect: 1000 },
  { name: 'replace 1,000 rows', prep: 'b.createRows(1000)', run: 'b.createRows(1000)', expect: 1000 },
  { name: 'update every 10th row', prep: 'b.createRows(1000)', run: 'b.updateRows()', expect: 1000 },
  { name: 'select a row', prep: 'b.createRows(1000)', run: 'b.selectRow(500)', expect: 1000 },
  { name: 'swap two rows', prep: 'b.createRows(1000)', run: 'b.swapRows(1, 998)', expect: 1000 },
  { name: 'remove a row', prep: 'b.createRows(1000)', run: 'b.removeRow(500)', expect: 999 },
  { name: 'append 1,000 to 1,000', prep: 'b.createRows(1000)', run: 'b.appendRows(1000)', expect: 2000 },
  { name: 'create 10,000 rows', prep: 'b.clearRows()', run: 'b.createRows(10000)', expect: 10000 },
  { name: 'clear 1,000 rows', prep: 'b.createRows(1000)', run: 'b.clearRows()', expect: 0 },
];

const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
const fmt = (n) => (n >= 100 ? Math.round(n).toLocaleString('en') : n >= 10 ? n.toFixed(1) : n.toFixed(2));
const browser = await chromium.launch({ channel: 'chrome', args: ['--js-flags=--expose-gc'] });
const results = {}; // impl -> {op: median ms}
const meta = {};    // impl -> {startup, heap1k, heap10k}
const warnings = [];

for (const name of names) {
  const file = impls[name];
  console.log(`\n▶ ${name}`);
  const startups = [];
  for (let i = 0; i < 5; i++) { // startup: navigation to "component ready", fresh page each time
    const ctx = await browser.newContext(); const p = await ctx.newPage();
    await p.goto(`${base}/?f=${file}`); await p.waitForFunction('window.__ready');
    startups.push(await p.evaluate('window.__ready')); await ctx.close();
  }
  const ctx = await browser.newContext(); const page = await ctx.newPage();
  page.on('pageerror', (e) => warnings.push(`${name}: page error ${e.message}`));
  const cdp = await ctx.newCDPSession(page);
  await page.goto(`${base}/?f=${file}`); await page.waitForFunction('window.bench');
  const gc = () => cdp.send('HeapProfiler.collectGarbage');
  const heap = async () => { await gc(); await gc(); return (await cdp.send('Performance.getMetrics')).metrics.find((m) => m.name === 'JSHeapUsedSize').value / 1024; };
  await cdp.send('Performance.enable');

  const sample = (prep, run) => page.evaluate(async ([prep, run]) => {
    const b = window.bench; const settle = () => { void document.body.offsetHeight; };
    await eval(prep); settle();
    const t0 = performance.now(); await eval(run); settle(); const t = performance.now() - t0;
    return { t, count: b.countRows() };
  }, [prep, run]);

  // warmup so JIT and first-time paths are not measured
  for (let i = 0; i < 4; i++) for (const o of ops.slice(0, 3)) await sample(o.prep, o.run);
  results[name] = {};
  for (const o of ops) {
    const ts = [];
    for (let i = 0; i < RUNS; i++) {
      await gc();
      const { t, count } = await sample(o.prep, o.run);
      if (count !== o.expect && !warnings.some((w) => w.startsWith(`${name} / ${o.name}`))) warnings.push(`${name} / ${o.name}: expected ${o.expect} rows in the DOM, found ${count}`);
      ts.push(t);
    }
    results[name][o.name] = median(ts);
    console.log(`  ${o.name.padEnd(24)} ${fmt(results[name][o.name]).padStart(8)} ms`);
  }
  await page.evaluate('b = window.bench; b.clearRows()'); const base0 = await heap();
  await page.evaluate('window.bench.createRows(1000)'); const h1 = (await heap()) - base0;
  await page.evaluate('window.bench.createRows(10000)'); const h10 = (await heap()) - base0;
  meta[name] = { startup: median(startups), heap1k: h1, heap10k: h10 };
  console.log(`  startup ${fmt(meta[name].startup)} ms, heap 1k ${fmt(h1)} KB, 10k ${fmt(h10)} KB`);
  await ctx.close();
}
await browser.close(); server.close();

// ---- markdown ----
const ver = (p) => { try { return JSON.parse(readFileSync(join(here, 'node_modules', p, 'package.json'), 'utf8')).version; } catch { return '?'; } };
let md = `# simple-web-component benchmark\n\n`;
md += `- Chrome ${'(channel chrome, headless)'}, Node ${process.version}, ${os.cpus()[0].model}, ${os.cpus().length} cores, ${os.platform()} ${os.arch()}\n`;
md += `- Versions: simple-web-component ${ver('@dooboostore/simple-web-component')}, lit ${ver('lit')}\n`;
md += `- ${new Date().toISOString().slice(0, 10)} · median of ${RUNS} samples per operation, GC before every sample · time = script + style + layout (paint not included)\n\n`;
md += `## Operation time (ms, lower is better; best in **bold**)\n\n| operation | ${names.join(' | ')} |\n|---|${names.map(() => '---:').join('|')}|\n`;
for (const o of ops) {
  const vals = names.map((n) => results[n][o.name]); const best = Math.min(...vals);
  md += `| ${o.name} | ${vals.map((v) => (v === best ? `**${fmt(v)}**` : fmt(v))).join(' | ')} |\n`;
}
md += `\n## Size, startup and memory (lower is better)\n\n| | ${names.join(' | ')} |\n|---|${names.map(() => '---:').join('|')}|\n`;
md += `| bundle, minified (KB) | ${names.map((n) => fmt(size[n].min)).join(' | ')} |\n`;
md += `| bundle, minified + gzip (KB) | ${names.map((n) => fmt(size[n].gz)).join(' | ')} |\n`;
md += `| navigation to component ready (ms, median of 5) | ${names.map((n) => fmt(meta[n].startup)).join(' | ')} |\n`;
md += `| JS heap, 1,000 rows (KB) | ${names.map((n) => fmt(meta[n].heap1k)).join(' | ')} |\n`;
md += `| JS heap, 10,000 rows (KB) | ${names.map((n) => fmt(meta[n].heap10k)).join(' | ')} |\n`;
if (warnings.length) md += `\n## ⚠ Warnings\n\n${warnings.map((w) => `- ${w}`).join('\n')}\n`;
md = decorate(md);
md += '\n' + charts(md);
if (existsSync(join(here, 'analysis.md'))) md += readFileSync(join(here, 'analysis.md'), 'utf8');
writeFileSync(join(here, 'RESULTS.md'), md);
console.log('\nWrote bench/RESULTS.md' + (warnings.length ? '\nWARNINGS:\n' + warnings.join('\n') : ''));
