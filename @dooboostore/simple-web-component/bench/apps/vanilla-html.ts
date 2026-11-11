import { BenchApp, Row, build, rowHtml, publish } from './common';

// Same strategy simple-web-component's string rendering uses (state -> HTML string -> innerHTML), without any framework.
class VanillaHtml extends HTMLElement implements BenchApp {
  rows: Row[] = []; tbody!: HTMLTableSectionElement; sel = -1;
  connectedCallback() { this.innerHTML = '<table><tbody></tbody></table>'; this.tbody = this.querySelector('tbody')!; publish(this); }
  paint() { this.tbody.innerHTML = this.rows.map((r, i) => rowHtml(r, i === this.sel)).join(''); }
  createRows(n: number) { this.rows = build(n); this.sel = -1; this.paint(); }
  appendRows(n: number) { this.rows = this.rows.concat(build(n)); this.paint(); }
  updateRows() { this.rows = this.rows.map((r, i) => (i % 10 === 0 ? { ...r, label: r.label + ' !!!' } : r)); this.paint(); }
  selectRow(i: number) { this.sel = i; this.paint(); }
  swapRows(a: number, b: number) { const r = this.rows.slice(); [r[a], r[b]] = [r[b], r[a]]; this.rows = r; this.paint(); }
  removeRow(i: number) { this.rows = this.rows.filter((_, k) => k !== i); this.sel = -1; this.paint(); }
  clearRows() { this.rows = []; this.sel = -1; this.paint(); }
  countRows() { return this.tbody.rows.length; }
}
customElements.define('bench-app', VanillaHtml);
