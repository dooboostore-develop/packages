import { elementDefine, innerHtml } from '../index';
import { SwcHTMLElementBase } from './SwcHTMLElementBase';

@elementDefine({ name: 'swc-for-of' })
export class SwcForOf extends SwcHTMLElementBase {
  private _swcValue: any[] = [];

  constructor() {
    super();
  }

  set swcValue(val: any[]) {
    if (!Array.isArray(val)) val = [];
    this._swcValue = this.createReactiveProxy(
      val,
      () => (this as any)._updateState((this as any)._asKey),
      (idx, v) => this.updateSingleRow(idx, v)
    );
    if (this._masterTplNodes.length === 0) this.initCore();
    this.renderAll();
  }

  get swcValue(): any[] {
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
    this.renderAll();
  }

  public updateSingleRow(index: number, newValue: any) {
    const targets = this.querySelectorAll(`[slot="row-${index}"]`);
    if (targets.length > 0) {
      targets.forEach(target => this.applyData(target, newValue, index));
    } else {
      this.renderRow(newValue, index);
    }
  }

  private renderRow(item: any, index: number) {
    if (!this.shadowRoot || this._masterTplNodes.length === 0) return;

    const slotName = `row-${index}`;
    if (!this.shadowRoot.querySelector(`slot[name="${slotName}"]`)) {
      const slot = document.createElement('slot');
      slot.name = slotName;
      this.shadowRoot.appendChild(slot);
    }

    this._masterTplNodes.forEach(tplNode => {
      const clone = tplNode.cloneNode(true);
      if (clone.nodeType === Node.ELEMENT_NODE) {
        (clone as HTMLElement).setAttribute('slot', slotName);
        (clone as HTMLElement).style.display = '';
      } else if (clone.nodeType === Node.TEXT_NODE) {
        if (clone.textContent?.trim().length === 0) return;
        const span = document.createElement('span');
        span.setAttribute('slot', slotName);
        span.appendChild(clone);
        this.appendChild(span);
        this.applyData(span, item, index);
        return;
      }
      this.appendChild(clone);
      this.applyData(clone, item, index);
    });
  }

  private renderAll() {
    if (this._masterTplNodes.length === 0 || !this.shadowRoot) return;

    Array.from(this.children).forEach(c => {
      const slot = c.getAttribute('slot');
      if (slot && slot.startsWith('row-')) {
        c.remove();
      }
    });

    Array.from(this.shadowRoot.querySelectorAll('slot')).forEach(s => {
      if (s.id !== 'tpl-slot') s.remove();
    });

    this._swcValue.forEach((item, index) => this.renderRow(item, index));
  }
}
