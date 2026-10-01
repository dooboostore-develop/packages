// swc 테스트 러너 — 테스트 파일을 브라우저용으로 묶어 playwright(Chromium)에서 돌린다. jsdom 은 쓰지 않는다.
//   node test/unit/run.mjs                 모든 *.test.ts
//   node test/unit/run.mjs query event     파일 이름 일부로 고르기
//   SWC_TEST_GREP='bare @query' node ...   테스트 이름(정규식)으로 고르기
//   SWC_TEST_DEBUG=1 / SWC_TEST_SERVE=1    페이지 console 출력 / 브라우저 없이 서버만 띄워 직접 열기
import { build } from 'esbuild';
import esbuildPluginTsc from 'esbuild-plugin-tsc';
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readdirSync, readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const filters = process.argv.slice(2);
const grep = process.env.SWC_TEST_GREP ? new RegExp(process.env.SWC_TEST_GREP) : null;
const files = readdirSync(here)
  .filter(f => f.endsWith('.test.ts') && f !== 'index.test.ts')
  .filter(f => !filters.length || filters.some(x => f.includes(x)))
  .sort();

const outdir = mkdtempSync(path.join(tmpdir(), 'swc-test-'));
// node:test / node:assert 는 브라우저용 대체 모듈로 연결
const nodeShims = {
  name: 'node-shims',
  setup(b) {
    b.onResolve({ filter: /^node:(test|assert)$/ }, a => ({ path: path.join(here, 'runtime', a.path === 'node:test' ? 'node-test.ts' : 'node-assert.ts') }));
  },
};
await build({
  entryPoints: Object.fromEntries(files.map(f => [f.replace(/\.ts$/, ''), path.join(here, f)])),
  outdir, bundle: true, format: 'esm', platform: 'browser', target: 'es2022', sourcemap: 'inline', logLevel: 'error',
  plugins: [nodeShims, esbuildPluginTsc({ tsconfigPath: path.join(here, 'tsconfig.json') })],
});

const page = (file) => `<!doctype html><meta charset="utf-8"><title>${file}</title><body><script type="module" src="/${file}.js"></script>`;
const server = createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  if (url.pathname.endsWith('.js')) {
    let body;
    try { body = readFileSync(path.join(outdir, path.basename(url.pathname))); } catch { res.writeHead(404).end(); return; }
    res.writeHead(200, { 'content-type': 'text/javascript' }).end(body);
    return;
  }
  // createWindow(html) 가 여는 iframe 문서 — html 을 그대로 응답해 브라우저가 파싱한다 (같은 origin 실제 URL 이라 history/popstate 도 그대로)
  if (url.pathname === '/__frame') { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }).end(url.searchParams.get('html') ?? '<!doctype html><html><body></body></html>'); return; }
  // 라우터 테스트가 pushState 로 경로를 바꾸므로 어떤 경로든 테스트 페이지를 돌려준다
  res.writeHead(200, { 'content-type': 'text/html' }).end(page(url.searchParams.get('f') ?? ''));
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

// SWC_TEST_SERVE=1: 브라우저 없이 서버만 띄워 직접 열어 보기 (디버깅용)
if (process.env.SWC_TEST_SERVE) {
  console.log(files.map(f => `${base}/?f=${encodeURIComponent(f.replace(/\.ts$/, ''))}`).join('\n'));
  await new Promise(() => {});
}
// labelcatch e2e 와 같게: playwright 전용 Chromium 이 없으면 설치된 Chrome 으로
const browser = await chromium.launch().catch(() => chromium.launch({ channel: 'chrome' }));
const totals = { tests: 0, pass: 0, fail: 0, todo: 0, skip: 0 };
const failures = [];
try {
  for (const f of files) {
    const name = f.replace(/\.ts$/, '');
    console.log(`▶ ${f}`);
    const ctx = await browser.newContext();
    const p = await ctx.newPage();
    const pageErrors = [];
    p.on('pageerror', e => pageErrors.push(String(e.stack ?? e)));
    // SWC_TEST_DEBUG=1: 페이지 console 과 테스트 시작(▷ 이름)을 그대로 출력
    if (process.env.SWC_TEST_DEBUG) { p.on('console', m => console.log(`    [${m.type()}] ${m.text()}`)); await p.addInitScript(() => { globalThis.__swcTestDebug = true; }); }
    if (grep) await p.addInitScript(src => { globalThis.__swcTestGrep = src; }, grep.source);
    await p.goto(`${base}/?f=${encodeURIComponent(name)}`);
    let results;
    try {
      await p.waitForFunction(() => globalThis.__swcTest?.done, null, { timeout: 60_000 });
      results = await p.evaluate(() => globalThis.__swcTest.results);
    } catch (e) {
      // 끝나지 않은 파일: 끝난 테스트 결과 + 멈춘 테스트 이름
      const st = await p.evaluate(() => ({ results: globalThis.__swcTest?.results ?? [], current: globalThis.__swcTest?.current })).catch(() => ({ results: [], current: null }));
      results = [...st.results, { name: `${st.current ?? f} (did not finish)`, status: 'fail', ms: 0, error: [String(e.message), ...pageErrors].join('\n') }];
    }
    for (const r of results) {
      totals.tests++;
      totals[r.status]++;
      const mark = { pass: '✔', fail: '✖', todo: '﹣', skip: '﹣' }[r.status];
      console.log(`  ${mark} ${r.name} (${r.ms}ms)${r.status === 'todo' ? ` # TODO ${r.todo}` : ''}${r.status === 'skip' ? ' # SKIP' : ''}`);
      if (r.status === 'fail') failures.push({ file: f, ...r });
    }
    await ctx.close();
  }
} finally {
  await browser.close();
  server.close();
  rmSync(outdir, { recursive: true, force: true });
}

if (failures.length) {
  console.log('\n✖ failing tests:');
  for (const x of failures) console.log(`\n${x.file} › ${x.name}\n${x.error}`);
}
console.log(`\nℹ tests ${totals.tests}\nℹ pass ${totals.pass}\nℹ fail ${totals.fail}\nℹ todo ${totals.todo}\nℹ skip ${totals.skip}`);
process.exit(totals.fail ? 1 : 0);
