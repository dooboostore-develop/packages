import { elementDefine, innerHtml } from '../index';
import { SwcHTMLAudioElementBase } from './SwcHTMLAudioElementBase';

@elementDefine({ name: 'swc-object-audio', extends: 'audio' })
export class SwcObjectAudio extends SwcHTMLAudioElementBase {
  private _swcValue: any = {};
  private _renderedNodes: Node[] = [];

  constructor() {
    super();
  }

  set swcValue(val: any) {
    if (typeof val !== 'object' || val === null) val = {};
    this._swcValue = this.createReactiveProxy(val, () => this.updateUI());
    if (this._masterTplNodes.length === 0) this.initCore();
    this.render();
  }

  get swcValue(): any {
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
      this.render();
    }
  }

  private updateUI() {
    this._renderedNodes.forEach(node => {
      this.applyData(node, this._swcValue);
    });
  }

  private render() {
    this.innerHTML = '';
    this._renderedNodes = [];
    if (this._masterTplNodes.length === 0) return;

    this._masterTplNodes.forEach(tplNode => {
      const clone = tplNode.cloneNode(true) as HTMLElement;
      this.appendChild(clone);
      if (clone.style) clone.style.display = 'contents';
      this._renderedNodes.push(clone);
      this.applyData(clone, this._swcValue);
    });
  }
}
