import { elementDefine, innerHtml } from '../index';
import { SwcHTMLElementBase } from './SwcHTMLElementBase';

@elementDefine({ name: 'swc-if' })
export class SwcIf extends SwcHTMLElementBase {
  private _swcValue: any = false;
  private _observer: MutationObserver | null = null;

  constructor() {
    super();
  }

  set swcValue(val: any) {
    this._swcValue = val;
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
    this._observer = new MutationObserver(() => this.render());
    this._observer.observe(this, { attributes: true });
    this.render();
  }

  disconnectedCallback() {
    this._observer?.disconnect();
  }

  private render() {
    if (!this.shadowRoot) return;

    const attrValue = this.getAttribute('swc-value') || this.getAttribute('value');
    if (attrValue !== null && attrValue.includes('{{')) return;

    let displayValue = attrValue !== null ? attrValue : this._swcValue;
    let isTruthy = !!displayValue;
    if (typeof displayValue === 'string') {
      if (displayValue === 'false' || displayValue === '0' || displayValue === '') isTruthy = false;
      else {
        try {
          isTruthy = !!new Function(`return ${displayValue}`)();
        } catch (e) {
          isTruthy = true;
        }
      }
    }

    Array.from(this.children).forEach(c => {
      if (c.getAttribute('slot') === 'if-content') {
        c.remove();
      }
    });

    const existingSlot = this.shadowRoot.querySelector('slot[name="if-content"]');
    if (existingSlot) existingSlot.remove();

    if (isTruthy && this._masterTplNodes.length > 0) {
      const contentSlot = document.createElement('slot');
      contentSlot.name = 'if-content';
      this.shadowRoot.appendChild(contentSlot);

      this._masterTplNodes.forEach(tplNode => {
        const clone = tplNode.cloneNode(true);
        if (clone.nodeType === Node.ELEMENT_NODE) {
          (clone as HTMLElement).setAttribute('slot', 'if-content');
        } else if (clone.nodeType === Node.TEXT_NODE) {
          if (clone.textContent?.trim().length === 0) return;
          const span = document.createElement('span');
          span.setAttribute('slot', 'if-content');
          span.appendChild(clone);
          this.appendChild(span);
          return;
        }
        this.appendChild(clone);
      });
    }
  }
}
