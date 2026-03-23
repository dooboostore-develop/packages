import { elementDefine, innerHtml } from '../index';
import { SwcHTMLSelectElementBase } from './SwcHTMLSelectElementBase';

@elementDefine({ name: 'swc-for-of-select', extends: 'select' })
export class SwcForOfSelect extends SwcHTMLSelectElementBase {
  private _swcValue: any[] = [];
  private _rowNodes: Node[][] = [];

  constructor() {
    super();
  }

  set swcValue(val: any[]) {
    if (!Array.isArray(val)) val = [];
    this._swcValue = this.createReactiveProxy(
      val,
      () => this.renderAll(),
      (idx, v) => this.updateSingleRow(idx, v)
    );
    if (this._masterTplNodes.length === 0) this.initCore();
    this.renderAll();
  }

  get swcValue(): any[] {
    return this._swcValue;
  }

  @innerHtml
  renderTemplate() {
    return `<slot id="tpl-slot" style="display:none;"></slot>`;
  }

  connectedCallback() {
    this.initCore();
    if (this._masterTplNodes.length > 0) {
      this.innerHTML = '';
      this.renderAll();
    }
  }

  public updateSingleRow(index: number, newValue: any) {
    const nodes = this._rowNodes[index];
    if (nodes && nodes.length > 0) {
      nodes.forEach(node => this.applyData(node, newValue, index));
    } else {
      this.renderRow(newValue, index);
    }
  }

  private renderRow(item: any, index: number) {
    if (this._masterTplNodes.length === 0) return;
    const currentNodes = [];
    this._masterTplNodes.forEach(tplNode => {
      const clone = tplNode.cloneNode(true);
      this.appendChild(clone);
      this.applyData(clone, item, index);
      currentNodes.push(clone);
    });
    this._rowNodes[index] = currentNodes;
  }

  private renderAll() {
    this.innerHTML = '';
    this._rowNodes = [];
    this._swcValue.forEach((item, index) => this.renderRow(item, index));
  }
}
