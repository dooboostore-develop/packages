import { elementDefine, innerHtml } from '../index';
import { SwcHTMLElementBase } from './SwcHTMLElementBase';

@elementDefine({ name: 'swc-object' })
export class SwcObject extends SwcHTMLElementBase {
  private _swcValue: any = {};
  private _renderedNodes: Node[] = [];

  constructor() {
    super();
  }

  set swcValue(val: any) {
    if (typeof val !== 'object' || val === null) val = {};
    this._swcValue = this.createReactiveProxy(val, () => {
      if (typeof (this as any)._updateState === 'function') {
        (this as any)._updateState((this as any)._asKey);
      }
      this.updateUI();
    });
    if (this._masterTplNodes.length === 0) this.initCore();
    this.render();
  }

  get swcValue(): any {
    return this._swcValue;
  }

  @innerHtml({ useShadow: true })
  renderTemplate() {
    return `
      <style>:host { display: contents; }</style>
      <slot id="tpl-slot" style="display:none;"></slot>
    `;
  }

  connectedCallback() {
    this.initCore();
    this.render();
  }

  private updateUI() {
    this._renderedNodes.forEach(node => {
      this.applyData(node, this._swcValue);
    });
  }

  private render() {
    this.innerHTML = '';
    this._renderedNodes = [];
    if (!this.shadowRoot || this._masterTplNodes.length === 0) return;

    let slot = this.shadowRoot.querySelector('slot[name="obj-content"]');
    if (!slot) {
      slot = document.createElement('slot');
      (slot as HTMLSlotElement).name = 'obj-content';
      this.shadowRoot.appendChild(slot);
    }

    this._masterTplNodes.forEach(tplNode => {
      const clone = tplNode.cloneNode(true);
      if (clone.nodeType === Node.ELEMENT_NODE) {
        (clone as HTMLElement).setAttribute('slot', 'obj-content');
      } else if (clone.nodeType === Node.TEXT_NODE) {
        if (clone.textContent?.trim().length === 0) return;
        const span = document.createElement('span');
        span.setAttribute('slot', 'obj-content');
        span.appendChild(clone);
        this.appendChild(span);
        this._renderedNodes.push(span);
        this.applyData(span, this._swcValue);
        return;
      }
      this.appendChild(clone);
      this._renderedNodes.push(clone);
      this.applyData(clone, this._swcValue);
    });
  }
}
