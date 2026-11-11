import { LitElement, html } from 'lit';
import { BenchApp, Row, build, publish } from './common';

// Lit with its default list idiom (map). Light DOM so the markup is identical to the others.
class LitBench extends LitElement implements BenchApp {
  static properties = { rows: { state: true }, sel: { state: true } };
  // `declare` keeps TS class fields from shadowing Lit's reactive accessors (that silently disables updates)
  declare rows: Row[]; declare sel: number;
  constructor() { super(); this.rows = []; this.sel = -1; }
  createRenderRoot() { return this; }
  connectedCallback() { super.connectedCallback(); publish(this); }
  render() {
    return html`<table><tbody>${this.rows.map((r, i) => html`<tr class=${i === this.sel ? 'danger' : ''}><td>${r.id}</td><td><a>${r.label}</a></td><td><button>x</button></td></tr>`)}</tbody></table>`;
  }
  async createRows(n: number) { this.rows = build(n); this.sel = -1; await this.updateComplete; }
  async appendRows(n: number) { this.rows = this.rows.concat(build(n)); await this.updateComplete; }
  async updateRows() { this.rows = this.rows.map((r, i) => (i % 10 === 0 ? { ...r, label: r.label + ' !!!' } : r)); await this.updateComplete; }
  async selectRow(i: number) { this.sel = i; await this.updateComplete; }
  async swapRows(a: number, b: number) { const r = this.rows.slice(); [r[a], r[b]] = [r[b], r[a]]; this.rows = r; await this.updateComplete; }
  async removeRow(i: number) { this.rows = this.rows.filter((_, k) => k !== i); this.sel = -1; await this.updateComplete; }
  async clearRows() { this.rows = []; this.sel = -1; await this.updateComplete; }
  countRows() { return this.querySelectorAll('tbody > tr').length; }
}
customElements.define('bench-app', LitBench);
