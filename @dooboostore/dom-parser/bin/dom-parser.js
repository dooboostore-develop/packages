#!/usr/bin/env node
// dom-parser <url | file | -> [script] [--json]
// HTML 을 가져와 파싱하고, script 를 document/window 와 함께 실행해 마지막 식의 값을 출력한다.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { inspect } from 'node:util';
import { DomParser } from '../dist/esm/index.js';

const HELP = `Usage: dom-parser <url | file | -> [script] [--json]

  Fetch or read HTML, parse it, run script against it and print the result.

  <url | file | ->  https://… / a local file / - for stdin
  [script]          JavaScript run like a browser console: document, window, location …
                    plus $ (querySelector) and $$ (querySelectorAll as an array). A single expression
                    prints its value; statements print what you console.log or return.
                    Without a script the parsed HTML is printed.
  --json            print the result as JSON

Examples:
  npx @dooboostore/dom-parser https://example.com "document.title"
  npx @dooboostore/dom-parser https://example.com "$$('a').map(a => a.getAttribute('href'))" --json
  npx @dooboostore/dom-parser ./page.html "const el = $('#x'); console.log(el.getAttribute('vv'))"
  curl -s https://example.com | npx @dooboostore/dom-parser - "$('h1').textContent"

Scripts inside the page are not executed — pages that render their content with
client-side JavaScript (SPAs) show only what the server sent.`;

const args = process.argv.slice(2);
const json = args.includes('--json');
const [source, script] = args.filter(a => a !== '--json');
if (!source || source === '-h' || source === '--help') {
  console.log(HELP);
  process.exit(source ? 0 : 1);
}

const fail = message => {
  console.error(`dom-parser: ${message}`);
  process.exit(1);
};

const load = async () => {
  if (/^https?:\/\//i.test(source)) {
    if (typeof fetch !== 'function') fail('fetching a URL needs Node.js 18 or later');
    const res = await fetch(source, { redirect: 'follow' }).catch(e => fail(`cannot fetch ${source}: ${e.message}`));
    if (!res.ok) console.error(`dom-parser: ${source} answered ${res.status} — parsing the body anyway`);
    return { html: await res.text(), href: res.url || source };
  }
  if (source === '-') return { html: readFileSync(0, 'utf8'), href: undefined };
  try {
    return { html: readFileSync(source, 'utf8'), href: pathToFileURL(resolve(source)).href };
  } catch (e) {
    return fail(`cannot read ${source}: ${e.message}`);
  }
};

// 요소는 HTML, 목록은 한 줄에 하나, 나머지는 문자열 / inspect
const show = value => {
  if (value === undefined) return;
  if (json) return console.log(JSON.stringify(toPlain(value), null, 2));
  const list = isList(value) ? [...value] : null;
  if (list) return list.forEach(v => console.log(text(v)));
  console.log(text(value));
};
const isNode = v => v && typeof v === 'object' && typeof v.nodeType === 'number';
const isList = v => Array.isArray(v) || (v && typeof v === 'object' && typeof v.length === 'number' && typeof v.item === 'function');
const text = v => (typeof v === 'string' ? v : isNode(v) ? (v.outerHTML ?? v.textContent ?? '') : typeof v === 'object' && v !== null ? inspect(v, { depth: 4 }) : String(v));
const toPlain = v => (isNode(v) ? v.outerHTML ?? v.textContent : isList(v) ? [...v].map(toPlain) : v);

const { html, href } = await load();
const parser = new DomParser(html, { href });
const { window, document } = parser;
let code = 0;
try {
  if (script === undefined) {
    show(document.documentElement?.outerHTML ?? html);
  } else {
    const AsyncFunction = (async () => {}).constructor;
    const names = ['window', 'document', '$', '$$'];
    const values = [window, document, s => document.querySelector(s), s => [...document.querySelectorAll(s)]];
    let fn;
    try {
      // with (window): 브라우저 콘솔처럼 location, navigator … 를 바로 쓴다
      fn = new AsyncFunction(...names, `with (window) { return (${script.trim().replace(/;+$/, '')}\n); }`); // 식 하나면 그 값 (끝의 ; 는 떼고)
    } catch {
      fn = new AsyncFunction(...names, `with (window) {\n${script}\n}`); // 문장들
    }
    show(await fn(...values));
  }
} catch (e) {
  console.error(`dom-parser: ${e instanceof Error ? `${e.name}: ${e.message}` : e}`); // 스크립트 에러 — CLI 내부 스택은 쓸모없다
  code = 1;
} finally {
  parser.destroy();
}
process.exit(code);
