import {onConnectedSwcApp, elementDefine, onConnectedInnerHtml, addEventListener, applyInnerHtmlNode, applyNodeHost, attributeHost, onInitialize } from '@dooboostore/simple-web-component';
import { Inject } from '@dooboostore/simple-boot';
import { StockService, Stock } from '../services/StockService';

export default (w: Window) => {
  const tagName = 'swc-example-stock-detail-page';
  const existing = w.customElements.get(tagName);
  if (existing) {
    return tagName;
  }

  @elementDefine(tagName, { window: w })
  class DetailPage extends w.HTMLElement {
    private stock: Stock | null = null;
    private realTimePrice: number = 0;
    private timer: any;
    private stockService: StockService;

    @attributeHost('stock-id')
    stockId: string;

    @onConnectedSwcApp
    onconstructor(@Inject({ symbol: StockService.SYMBOL }) stockService: StockService) {
      this.stockService = stockService;

      // Load stock if stockId attribute is set
      if (this.stockId) {
        this.loadStock(this.stockId);
      }
    }

    private loadStock(id: string) {
      this.stock = this.stockService.getStockById(id);
      if (this.stock) {
        this.realTimePrice = this.stock.price;
        this.startRealTimeUpdate();
        this.render();
      }
    }

    private startRealTimeUpdate() {
      if (this.timer) clearInterval(this.timer);
      this.timer = setInterval(() => {
        if (!this.stock) return;
        const volatility = (Math.random() - 0.5) * 200;
        this.realTimePrice += volatility;
        this.updatePriceUI();
      }, 2000);
    }

    @applyInnerHtmlNode('#current-price')
    private updatePriceUI() {
      return `${Math.floor(this.realTimePrice).toLocaleString()}원`;
    }

    disconnectedCallback() {
      if (this.timer) clearInterval(this.timer);
    }

    @applyNodeHost({ position: 'innerHtml' })
    @onConnectedInnerHtml({ useShadow: true })
    render() {
      if (!this.stock) return '<div>종목을 찾을 수 없습니다.</div>';
      const { name, code, change, changePercent, description, marketCap, volume, history } = this.stock;
      const isRising = change > 0;
      const color = isRising ? '#f04452' : '#3182f6';

      // Simple SVG Path for Chart
      const max = Math.max(...history);
      const min = Math.min(...history);
      const range = max - min;
      const points = history.map((p, i) => `${i * 100} ${150 - ((p - min) / range) * 100}`).join(' L ');

      return `
      <style>
        :host { display: block; background: #fff; min-height: 100vh; }
        .container { max-width: 600px; margin: 0 auto; padding: 32px 20px; }
        
        .header { margin-bottom: 32px; }
        .name { font-size: 24px; font-weight: 850; color: #191f28; margin-bottom: 4px; }
        .code { font-size: 14px; color: #8b95a1; font-weight: 600; }
        
        .price-area { margin-bottom: 40px; }
        #current-price { font-size: 36px; font-weight: 850; color: #191f28; display: block; margin-bottom: 8px; }
        .change { font-size: 16px; font-weight: 700; color: ${color}; }

        /* Chart */
        .chart-container { width: 100%; height: 200px; margin-bottom: 48px; position: relative; }
        svg { width: 100%; height: 100%; overflow: visible; }
        path { stroke: ${color}; stroke-width: 3; fill: none; stroke-linecap: round; }
        
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; padding: 24px; background: #f9fafb; border-radius: 20px; }
        .info-item { display: flex; flex-direction: column; gap: 4px; }
        .info-label { font-size: 13px; color: #8b95a1; font-weight: 600; }
        .info-value { font-size: 16px; color: #191f28; font-weight: 700; }
        
        .description { margin-top: 40px; line-height: 1.6; color: #4e5968; font-size: 16px; }
        
        .btn-buy { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); width: calc(100% - 40px); max-width: 560px; background: #3182f6; color: white; border: none; padding: 18px; border-radius: 16px; font-size: 18px; font-weight: 700; cursor: pointer; }
      </style>
      
      <div class="container">
        <div class="header">
          <div class="name">${name}</div>
          <div class="code">${code} · 코스피</div>
        </div>

        <div class="price-area">
          <span id="current-price">${Math.floor(this.realTimePrice).toLocaleString()}원</span>
          <div class="change">${change > 0 ? '+' : ''}${change.toLocaleString()}원 (${changePercent}%)</div>
        </div>

        <div class="chart-container">
          <svg viewBox="0 0 400 150">
            <path d="M 0 ${150 - ((history[0] - min) / range) * 100} L ${points}" />
          </svg>
        </div>

        <div class="info-grid">
          <div class="info-item"><span class="info-label">시가총액</span><span class="info-value">${marketCap}</span></div>
          <div class="info-item"><span class="info-label">거래량</span><span class="info-value">${volume}</span></div>
          <div class="info-item"><span class="info-label">52주 최고</span><span class="info-value">82,000원</span></div>
          <div class="info-item"><span class="info-label">52주 최저</span><span class="info-value">55,000원</span></div>
        </div>

        <div class="description">
          <h3 style="color: #191f28; margin-bottom: 12px;">기업 정보</h3>
          ${description}
        </div>
      </div>
      
      <button class="btn-buy">구매하기</button>
      `;
    }
  }
  return tagName;
};
