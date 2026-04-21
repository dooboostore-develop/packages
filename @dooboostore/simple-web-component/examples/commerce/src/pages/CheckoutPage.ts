import {elementDefine, onConnected} from '@dooboostore/simple-web-component';

export default (w: Window) => {
  const tagName = 'swc-example-commerce-checkout-page';
  const existing = w.customElements.get(tagName);
  if (existing) {
    return tagName;
  }

  @elementDefine(tagName, { window: w })
  class CheckoutPage extends w.HTMLElement {
    @onConnected
    render() {
      return `
        <div style="padding: 40px; max-width: 1200px; margin: 0 auto;">
          <h1>💳 Checkout</h1>
          <p>Checkout page - to be implemented</p>
        </div>
      `;
    }
  }
  return tagName;
};
