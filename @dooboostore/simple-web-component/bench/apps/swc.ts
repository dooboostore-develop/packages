import 'reflect-metadata';
import { elementDefine, onConnectedBodyLight, replaceChildrenLight } from '@dooboostore/simple-web-component';
import { BenchApp, Row, build, rowHtml, publish } from './common';

// simple-web-component as its README documents it: state in fields, a decorated method returns the HTML
// string and the decorator replaces the target's children (no virtual DOM, no diffing).
@elementDefine('bench-app', { window })
class SwcBench extends HTMLElement implements BenchApp {
  rows: Row[] = [];
  sel = -1;

  @onConnectedBodyLight
  shell() { queueMicrotask(() => publish(this)); return '<table><tbody></tbody></table>'; }

  @replaceChildrenLight('tbody')
  paint() { return this.rows.map((r, i) => rowHtml(r, i === this.sel)).join(''); }

  createRows(n: number) { this.rows = build(n); this.sel = -1; return this.paint(); }
  appendRows(n: number) { this.rows = this.rows.concat(build(n)); return this.paint(); }
  updateRows() { this.rows = this.rows.map((r, i) => (i % 10 === 0 ? { ...r, label: r.label + ' !!!' } : r)); return this.paint(); }
  selectRow(i: number) { this.sel = i; return this.paint(); }
  swapRows(a: number, b: number) { const r = this.rows.slice(); [r[a], r[b]] = [r[b], r[a]]; this.rows = r; return this.paint(); }
  removeRow(i: number) { this.rows = this.rows.filter((_, k) => k !== i); this.sel = -1; return this.paint(); }
  clearRows() { this.rows = []; this.sel = -1; return this.paint(); }
  countRows() { return this.querySelectorAll('tbody > tr').length; }
}
