import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

console.log('🚀 CLI (bin/dom-parser.js) Tests Starting...');

const BIN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../bin/dom-parser.js');
const HTML = '<!doctype html><html><head><title>Hello Page</title></head><body><h1 id="x" vv="42">Hi</h1><a href="/a">A</a><a href="b.html">B</a></body></html>';
const run = (args: string[], input?: string) => {
  const r = spawnSync(process.execPath, [BIN, ...args], { input, encoding: 'utf8' });
  return { out: r.stdout.trim(), err: r.stderr.trim(), code: r.status };
};

describe('dom-parser CLI', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'dom-parser-cli-'));
  const file = path.join(dir, 'page.html');
  writeFileSync(file, HTML);

  test('a single expression prints its value (a trailing ; is fine)', () => {
    assert.equal(run([file, 'document.title;']).out, 'Hello Page');
  });

  test('statements print what they console.log; undeclared assignment works like a browser console', () => {
    assert.equal(run([file, "el = document.getElementById('x'); console.log(el.getAttribute('vv'));"]).out, '42');
  });

  test('$ / $$ helpers; elements print as HTML, lists one per line, --json as JSON', () => {
    assert.equal(run([file, "$('h1')"]).out, '<h1 id="x" vv="42">Hi</h1>');
    assert.equal(run([file, "$$('a').map(a => a.textContent)"]).out, 'A\nB');
    assert.deepEqual(JSON.parse(run([file, "$$('a').map(a => a.getAttribute('href'))", '--json']).out), ['/a', 'b.html']);
  });

  test('stdin with -, and no script prints the parsed HTML', () => {
    assert.equal(run(['-', "$('h1').textContent"], HTML).out, 'Hi');
    assert.match(run([file]).out, /<title>Hello Page<\/title>/);
  });

  test('a script error goes to stderr with exit code 1; no arguments shows usage with exit code 1', () => {
    const r = run([file, 'nope.x']);
    assert.equal(r.code, 1);
    assert.equal(r.err, 'dom-parser: ReferenceError: nope is not defined');
    const u = run([]);
    assert.equal(u.code, 1);
    assert.match(u.out, /^Usage: dom-parser/);
  });

  test('fetches a URL (Node 18+) and sets location to it', async () => {
    const server = createServer((_, res) => res.end(HTML));
    await new Promise<void>(r => server.listen(0, '127.0.0.1', r));
    const url = `http://127.0.0.1:${(server.address() as any).port}/x/page.html`;
    const r = await new Promise<string>(resolve => {
      // spawnSync 은 같은 프로세스의 서버를 막으니 비동기로
      import('node:child_process').then(({ execFile }) => execFile(process.execPath, [BIN, url, "[document.title, location.href].join(' ')"], (_e, out) => resolve(out.trim())));
    });
    server.close();
    assert.equal(r, `Hello Page ${url}`);
  });

  test.after?.(() => rmSync(dir, { recursive: true, force: true }));
});
