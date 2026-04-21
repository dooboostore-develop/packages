import {applyNodeThis, elementDefine} from '@dooboostore/simple-web-component';
import type {Stock} from '../services/StockService';

export default (w: Window) => {
  const tagName = 'swc-example-stock-stock-card';
  const existing = w.customElements.get(tagName);
  if (existing) return tagName;


  @elementDefine(tagName, { window: w })
  class StockCard extends w.HTMLElement {
    private stock: Stock | null = null;

    @applyNodeThis({ position: 'innerHtml' })
    setData(data: Stock) {
      this.stock = data;
      return this.render();
    }

    render() {
      if (!this.stock) return '';
      const { name, code, price, change, changePercent } = this.stock;
      const isRising = change > 0;
      const color = isRising ? '#f04452' : '#3182f6';
      const sign = isRising ? '+' : '';

      return `
      <style>
        :host { display: block; cursor: pointer; border-radius: 16px; transition: background 0.2s; }
        :host(:hover) { background: #f9fafb; }
        .card { display: flex; align-items: center; padding: 12px 16px; gap: 16px; }
        .icon { width: 40px; height: 40px; border-radius: 50%; background: #f2f4f6; display: flex; align-items: center; justify-content: center; font-weight: 800; color: #4e5968; font-size: 14px; }
        .name-area { flex: 1; display: flex; flex-direction: column; gap: 2px; }
        .name { font-weight: 700; color: #191f28; font-size: 16px; }
        .code { font-size: 13px; color: #8b95a1; }
        .price-area { text-align: right; display: flex; flex-direction: column; gap: 2px; }
        .price { font-weight: 700; color: #191f28; font-size: 16px; }
        .change { font-size: 13px; font-weight: 600; color: ${color}; }
      </style>
      <div class="card">
        <div class="icon">${name[0]}</div>
        <div class="name-area">
          <div class="name">${name}</div>
          <div class="code">${code}</div>
        </div>
        <div class="price-area">
          <div class="price">${price.toLocaleString()}원</div>
          <div class="change">${sign}${change.toLocaleString()} (${sign}${changePercent}%)</div>
        </div>
      </div>
      `;
    }
  }
  return tagName;
};
