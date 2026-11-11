// ASCII bar charts built from the markdown tables of RESULTS.md, so charts and tables can never disagree.
// Library use: charts(md) -> markdown section.  CLI: `node charts.mjs` patches RESULTS.md in place.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const WIDTH = 32;
const BARS = /[█▏▎▍▌▋▊▉]/g;
const num = (s) => { const v = parseFloat(s.replace(BARS, '').replace(/[*,\s]/g, '')); return Number.isFinite(v) ? v : null; };
const CELL = 10; // bar width inside a table cell
const bar = (frac) => { const eighths = Math.max(1, Math.round(frac * CELL * 8)); return '█'.repeat(Math.floor(eighths / 8)) + ['', '▏', '▎', '▍', '▌', '▋', '▊', '▉'][eighths % 8]; };
const fmt = (n) => (n >= 100 ? Math.round(n).toLocaleString('en') : n >= 10 ? n.toFixed(1) : n.toFixed(2));

// Put a bar in front of every number of the results tables; length = value / best-in-row (the row's largest value).
// Idempotent: existing bars are stripped before being recomputed. Latency tables are left alone (sub-ms values make flat bars).
export function decorate(md) {
  const lines = md.split('\n'); let on = false;
  return lines.map((l) => {
    const h = l.match(/^## (.*)$/); if (h) on = !/^(Charts|How to read|Notes|Latency)/.test(h[1]);
    if (on && /^\|[\s|:-]+$/.test(l)) return l.replace(/-+:/g, '---'); // left-align so every bar starts at the same x
    if (!on || !l.startsWith('|')) return l;
    const cells = l.split('|').slice(1, -1), vals = cells.slice(1).map((c) => num(c));
    if (vals.filter((v) => v !== null).length < 2) return l;
    const max = Math.max(...vals.filter((v) => v !== null));
    return '|' + [cells[0], ...cells.slice(1).map((c, i) => {
      if (vals[i] === null) return c;
      const txt = c.replace(BARS, '').trim();
      return ` ${bar(vals[i] / max)} ${txt} `;
    })].join('|') + '|';
  }).join('\n');
}

export function charts(md, { skipBelow = 5 } = {}) {
  const lines = md.split('\n');
  let out = '## Charts\n\nBar length is proportional to the value. Sorted best first; `▲` marks the best of the row.\n';
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^## (.*)$/);
    if (!m || /^(Charts|How to read|Notes|Latency)/.test(m[1])) continue;
    const higher = /higher is better/i.test(m[1]);
    // table = header row starting at the next "|" line
    let j = i + 1; while (j < lines.length && !lines[j].startsWith('|')) j++;
    if (j >= lines.length || !/^\|\s*\S*[^|]*\|/.test(lines[j])) continue;
    const head = lines[j].split('|').slice(2, -1).map((s) => s.trim());
    let blocks = '';
    for (let k = j + 2; k < lines.length && lines[k].startsWith('|'); k++) {
      const cells = lines[k].split('|').slice(1, -1).map((s) => s.trim());
      const rows = head.map((name, c) => ({ name, v: num(cells[c + 1] ?? '') })).filter((r) => r.v !== null);
      if (rows.length < 2 || Math.max(...rows.map((r) => r.v)) < skipBelow) continue; // sub-millisecond latency etc. make flat, pointless bars
      rows.sort((a, b) => (higher ? b.v - a.v : a.v - b.v));
      const max = Math.max(...rows.map((r) => r.v));
      const pad = Math.max(...rows.map((r) => r.name.length));
      blocks += `\n${cells[0].replace(/`/g, "")}${higher ? '' : '  (lower is better)'}\n` + rows.map((r, n) => {
        const len = Math.max(1, Math.round((r.v / max) * WIDTH));
        return `  ${r.name.padEnd(pad)}  ${'█'.repeat(len).padEnd(WIDTH)}  ${fmt(r.v)}${n === 0 ? '  ▲' : ''}`;
      }).join('\n') + '\n';
    }
    if (blocks) out += `\n### ${m[1].replace(/\s*\(.*$/, '')}\n\n\`\`\`text${blocks}\`\`\`\n`;
  }
  return out + '\n';
}

// CLI: decorate the tables and replace (or insert) the Charts section in RESULTS.md, just before the hand-written analysis.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const p = new URL('./RESULTS.md', import.meta.url);
  let md = readFileSync(p, 'utf8').replace(/## Charts[\s\S]*?(?=\n## (?!Charts))/, '');
  md = decorate(md);
  const at = md.search(/\n## How to read this/);
  const section = charts(md);
  md = at === -1 ? md + '\n' + section : md.slice(0, at) + '\n' + section + md.slice(at + 1);
  writeFileSync(p, md);
}
