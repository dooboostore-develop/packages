// Deterministic synthetic pages (no network, reproducible). Replace/add real pages in ./fixtures/*.html if wanted.
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

function page(sections) {
  let body = '';
  for (let i = 0; i < sections; i++) {
    body += `<section class="sec s${i % 7}" id="sec-${i}" data-idx="${i}">
  <h2 class="title">Section ${i}</h2>
  <p class="lead">Lorem ipsum <b>dolor</b> sit <a href="/p/${i}" class="link">amet</a> &amp; more &lt;text&gt;.</p>
  <ul class="list">${'<li class="item"><span>item</span></li>'.repeat(5)}</ul>
  <table><tbody><tr><td>${i}</td><td class="cell">a</td><td>b</td></tr></tbody></table>
  <img src="/i/${i}.png" alt="img ${i}"><input type="text" name="f${i}" value="v${i}">
</section>\n`;
  }
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Bench</title></head><body><main id="app">${body}</main></body></html>`;
}

export const fixtures = {
  small: page(2),     // ~1 KB
  medium: page(250),  // ~100 KB
  large: page(5000),  // ~2 MB
};

const dir = join(dirname(fileURLToPath(import.meta.url)), 'fixtures');
if (existsSync(dir)) for (const f of readdirSync(dir)) if (f.endsWith('.html')) fixtures[f.replace(/\.html$/, '')] = readFileSync(join(dir, f), 'utf8');

export const selectors = ['section', '.item', 'section.s3 > ul li.item', '#sec-120 .cell', 'a[href^="/p/1"]', 'tr > td:nth-child(2)'];
