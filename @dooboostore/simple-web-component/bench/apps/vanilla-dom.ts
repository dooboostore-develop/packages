import { BenchApp, Row, build, publish } from './common';

// Hand-written DOM calls: the ceiling a framework can be measured against.
class VanillaDom extends HTMLElement implements BenchApp {
  rows: Row[] = []; trs: HTMLTableRowElement[] = []; tbody!: HTMLTableSectionElement; sel = -1;
  connectedCallback() { this.innerHTML = '<table><tbody></tbody></table>'; this.tbody = this.querySelector('tbody')!; publish(this); }
  tr(r: Row) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${r.id}</td><td><a></a></td><td><button>x</button></td>`;
    tr.querySelector('a')!.textContent = r.label;
    return tr;
  }
  createRows(n: number) { this.clearRows(); this.appendRows(n); }
  appendRows(n: number) {
    const rows = build(n), f = document.createDocumentFragment();
    for (const r of rows) { const tr = this.tr(r); this.trs.push(tr); f.appendChild(tr); }
    this.rows.push(...rows); this.tbody.appendChild(f);
  }
  updateRows() { for (let i = 0; i < this.rows.length; i += 10) { this.rows[i].label += ' !!!'; this.trs[i].querySelector('a')!.textContent = this.rows[i].label; } }
  selectRow(i: number) { if (this.sel >= 0) this.trs[this.sel]?.classList.remove('danger'); this.sel = i; this.trs[i].classList.add('danger'); }
  swapRows(a: number, b: number) {
    const ta = this.trs[a], tb = this.trs[b], na = ta.nextSibling;
    this.tbody.insertBefore(ta, tb); this.tbody.insertBefore(tb, na);
    [this.rows[a], this.rows[b]] = [this.rows[b], this.rows[a]]; [this.trs[a], this.trs[b]] = [this.trs[b], this.trs[a]];
  }
  removeRow(i: number) { this.trs[i].remove(); this.trs.splice(i, 1); this.rows.splice(i, 1); this.sel = -1; }
  clearRows() { this.rows = []; this.trs = []; this.sel = -1; this.tbody.textContent = ''; }
  countRows() { return this.tbody.rows.length; }
}
customElements.define('bench-app', VanillaDom);
