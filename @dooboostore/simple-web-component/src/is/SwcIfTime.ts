import { elementDefine, innerHtml } from '../index';
import { SwcHTMLTimeElementBase } from './SwcHTMLTimeElementBase';

@elementDefine({ name: 'swc-if-time', extends: 'time' })
export class SwcIfTime extends SwcHTMLTimeElementBase {
  private _swcValue: any = false;

  constructor() {
    super();
  }

  set swcValue(val: any) {
    this._swcValue = val;
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

  private render() {
    const attrValue = this.getAttribute('swc-value') || this.getAttribute('value');
    if (attrValue !== null && attrValue.includes('{{')) return;

    let displayValue = attrValue !== null ? attrValue : this._swcValue;
    let isTruthy = !!displayValue;
    if (typeof displayValue === 'string') {
      if (displayValue === 'false' || displayValue === '0' || displayValue === '') isTruthy = false;
      else {
        try {
          isTruthy = !!new Function('return ' + displayValue)();
        } catch (e) {
          isTruthy = true;
        }
      }
    }

    this.innerHTML = '';
    if (isTruthy && this._masterTplNodes.length > 0) {
      this._masterTplNodes.forEach(tplNode => {
        const clone = tplNode.cloneNode(true) as HTMLElement;
        this.appendChild(clone);
        if (clone.style) clone.style.display = 'contents';
        this.applyData(clone, this._swcValue);
      });
    }
  }
}
