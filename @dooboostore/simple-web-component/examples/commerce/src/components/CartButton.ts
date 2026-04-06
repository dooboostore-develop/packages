import { elementDefine, onConnectedInnerHtml, addEventListenerThis, applyNode, emitCustomEventThis } from '@dooboostore/simple-web-component';

/**
 * Cart Button Component Factory - Custom built-in button element
 */
export default (w: Window) => {
  const tagName = 'swc-example-commerce-cart-button';
  const existing = w.customElements.get(tagName);
  if (existing) return tagName;

  @elementDefine(tagName, { window: w, extends: 'button' })
  class CartButton extends w.HTMLButtonElement {
  #count = 0;

  constructor() {
    super();
  }

  setCount(count: number): void {
    this.#count = count;
    this.updateDisplay();
  }

  @addEventListenerThis('click')
  @emitCustomEventThis('navigate', { attributeName: 'on-navigate' })
  onClick(event: MouseEvent) {
    return { path: '/cart' };
  }

  @applyNode('#badge', { position: 'replace' })
  updateDisplay() {
    return this.#count > 0 ? this.#count.toString() : '';
  }

  @onConnectedInnerHtml({ useShadow: true })
  render() {
    return `
      <style>
        :host {
          position: relative;
          background: #1976d2;
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        :host(:hover) {
          background: #1565c0;
        }

        :host(:active) {
          transform: scale(0.96);
        }

        #badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #ff5252;
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
        }
      </style>

      🛒 Cart <span id="badge"></span>
    `;
  }

  connectedCallback() {
    this.updateDisplay();
  }
  }

  return tagName;
};
