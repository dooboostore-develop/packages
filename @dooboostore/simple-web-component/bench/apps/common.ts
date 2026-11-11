// Same rows, same operations for every implementation (js-framework-benchmark style).
export type Row = { id: number; label: string };
export interface BenchApp extends HTMLElement {
  createRows(n: number): void | Promise<void>;   // replace everything with n new rows
  appendRows(n: number): void | Promise<void>;
  updateRows(): void | Promise<void>;            // every 10th row gets "!!!" appended to its label
  selectRow(index: number): void | Promise<void>;
  swapRows(a: number, b: number): void | Promise<void>;
  removeRow(index: number): void | Promise<void>;
  clearRows(): void | Promise<void>;
  countRows(): number;                           // rows actually in the DOM, used to verify every impl did the work
}

let seed = 1;
const rnd = (n: number) => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed % n; };
const A = ['pretty', 'large', 'big', 'small', 'tall', 'short', 'long', 'handsome', 'plain', 'quaint', 'clean', 'elegant', 'easy', 'angry', 'crazy', 'helpful', 'mushy', 'odd', 'unsightly', 'adorable', 'important', 'inexpensive', 'cheap', 'expensive', 'fancy'];
const B = ['red', 'yellow', 'blue', 'green', 'pink', 'brown', 'purple', 'orange', 'white', 'black', 'grey'];
const C = ['table', 'chair', 'house', 'bbq', 'desk', 'car', 'pony', 'cookie', 'sandwich', 'burger', 'pizza', 'mouse', 'keyboard'];
let nextId = 1;
export const build = (n: number): Row[] => Array.from({ length: n }, () => ({ id: nextId++, label: `${A[rnd(A.length)]} ${B[rnd(B.length)]} ${C[rnd(C.length)]}` }));
export const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
export const rowHtml = (r: Row, selected: boolean) => `<tr${selected ? ' class="danger"' : ''}><td>${r.id}</td><td><a>${esc(r.label)}</a></td><td><button>x</button></td></tr>`;
export const publish = (el: BenchApp) => { (window as any).bench = el; (window as any).__ready = performance.now(); };
