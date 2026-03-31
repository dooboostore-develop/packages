import { elementDefine, onConnectedInnerHtml, addEventListener, updateClass, applyInnerHtmlNode, onInitialize } from '@dooboostore/simple-web-component';
import { Inject } from '@dooboostore/simple-boot';
import { Router } from '@dooboostore/core-web';
import { StockService, Stock } from '../services/StockService';

export default (w: Window) => {
  const tagName = 'swc-example-stock-main-page';
  const existing = w.customElements.get(tagName);
  if (existing) {
    return tagName;
  }

  @elementDefine(tagName, { window: w })
  class MainPage extends w.HTMLElement {
    private stocks: Stock[] = [];
    private rising: Stock[] = [];
    private falling: Stock[] = [];
    private categories: string[] = [];
    private selectedCategory = 'All';
    private stockService: StockService;
    private router: Router;

    @onInitialize
    onconstructor(
      @Inject({ symbol: StockService.SYMBOL }) stockService: StockService,
      router: Router
    ) {
      this.stockService = stockService;
      this.router = router;
      this.stocks = this.stockService.getStocks();
      this.rising = this.stockService.getRisingStocks();
      this.falling = this.stockService.getFallingStocks();
      this.categories = ['All', ...this.stockService.getCategories()];
    }

    connectedCallback() {
      this.updateCards();
    }

    private updateCards() {
      setTimeout(() => {
        this.shadowRoot?.querySelectorAll('swc-example-stock-stock-card').forEach(card => {
          const id = (card as HTMLElement).dataset.id;
          const data = this.stocks.find(s => s.id === id);
          if (data) (card as any).setData(data);
        });
      }, 0);
    }

    @updateClass('.cat-chip')
    private syncCategoryUI() {
        return {
            'active': (el: HTMLElement) => el.dataset.cat === this.selectedCategory
        };
    }

    @applyInnerHtmlNode('.section:nth-child(2) .stock-list')
    private renderInterestStocks() {
      const displayStocks = this.selectedCategory === 'All' ? this.stocks : this.stockService.getStocksByCategory(this.selectedCategory);
      return displayStocks.map(s => `<swc-example-stock-stock-card data-id="${s.id}" class="card-item"></swc-example-stock-stock-card>`).join('');
    }

    @onConnectedInnerHtml({ useShadow: true })
    render() {
      return `
      <style>
        * { box-sizing: border-box; }
        :host { display: block; background: #fff; min-height: 100%; box-sizing: border-box; }
        .container { width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; }
        
        .section { margin-bottom: 40px; }
        .section-title { font-size: 20px; font-weight: 800; color: #191f28; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; }
        .view-all { font-size: 14px; font-weight: 600; color: #4e5968; cursor: pointer; }
 
        .banner { background: #f2f4f6; border-radius: 24px; padding: 24px; margin-bottom: 32px; cursor: pointer; }
        .banner h2 { font-size: 18px; margin: 0 0 8px 0; font-weight: 700; }
        .banner p { margin: 0; color: #4e5968; font-size: 14px; }
 
        .category-scroll { display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; margin-bottom: 24px; }
        .category-scroll::-webkit-scrollbar { display: none; }
        .cat-chip { padding: 8px 16px; border-radius: 100px; background: #f2f4f6; color: #4e5968; font-size: 14px; font-weight: 600; cursor: pointer; white-space: nowrap; transition: all 0.2s; }
        .cat-chip.active { background: #3182f6; color: white; }
 
        .stock-list { display: flex; flex-direction: column; }
        @container (max-width: 480px) {
          .banner { padding: 16px; border-radius: 16px; }
          .banner h2 { font-size: 16px; }
          .section-title { font-size: 18px; }
        }
      </style>
      <div class="container">
        <div class="banner">
          <h2>오늘의 인기 테마는?</h2>
          <p>반도체 관련주가 강세를 보이고 있어요.</p>
        </div>
 
        <div class="section">
          <div class="section-title">많이 오르는 주식</div>
          <div class="stock-list">
            ${this.rising.slice(0, 3).map(s => `<swc-example-stock-stock-card data-id="${s.id}" class="card-item"></swc-example-stock-stock-card>`).join('')}
          </div>
        </div>
 
        <div class="section">
          <div class="section-title">내 관심 주식</div>
          <div class="category-scroll">
            ${this.categories.map(c => `<div class="cat-chip ${this.selectedCategory === c ? 'active' : ''}" data-cat="${c}">${c}</div>`).join('')}
          </div>
          <div class="stock-list">
            ${(this.selectedCategory === 'All' ? this.stocks : this.stockService.getStocksByCategory(this.selectedCategory)).map(s => `<swc-example-stock-stock-card data-id="${s.id}" class="card-item"></swc-example-stock-stock-card>`).join('')}
          </div>
        </div>
 
        <div class="section">
          <div class="section-title">급락 종목</div>
          <div class="stock-list">
            ${this.falling.slice(0, 3).map(s => `<swc-example-stock-stock-card data-id="${s.id}" class="card-item"></swc-example-stock-stock-card>`).join('')}
          </div>
        </div>
      </div>
      `;
    }
 
    @addEventListener('.cat-chip', 'click', { delegate: true })
    onCategorySelect(e: any) {
      this.selectedCategory = e.target.closest('.cat-chip').dataset.cat;
      this.syncCategoryUI();
      this.renderInterestStocks();
      this.updateCards();
    }
 
    @addEventListener('.card-item', 'click', { delegate: true })
    onStockClick(e: any) {
      const id = e.target.closest('swc-example-stock-stock-card').dataset.id;
      this.router.go(`/detail/${id}`);
    }
  }
  return tagName;
};
