import { event, innerHtml, onConnectedAfter, onConnectedBody, updateClass, addEventListener, applyNode, elementDefine, emitCustomEvent, onConnectedBefore, onConnectedBodyShadow, addEventListenerThis, mutationObserverDelegateShadow, eventDelegate, eventShadowDom, eventDelegateShadowDom, mutationObserverShadow, insertBeforeEndShadow, resizeObserverShadow, resizeObserverDelegateShadow } from '@dooboostore/simple-web-component';
import {Inject} from '@dooboostore/simple-boot';
import {Router} from '@dooboostore/core-web';
import {ProductService} from '../services/ProductService';
import {CartService} from '../services/CartService';
import {OrderService} from "../services/OrderService";

export default (w: Window) => {
  const tagName = 'swc-example-commerce-home-page';
  const existing = w.customElements.get(tagName);
  if (existing) {
    return tagName;
  }

  @elementDefine(tagName, { window: w })
  class HomePage extends w.HTMLElement {
    products: ProductService.Product[] = [];
    selectedCategory: string = 'All';
    private productService: ProductService;
    private cartService: CartService;
    private orderService: OrderService;
    private router: Router;

    @onConnectedAfter
    onconstructor(@Inject(ProductService.SYMBOL) productService: ProductService, @Inject({ symbol: CartService.SYMBOL }) cartService: CartService, @Inject({ symbol: OrderService.SYMBOL }) orderService: OrderService, router: Router) {
      this.productService = productService;
      this.cartService = cartService;
      this.orderService = orderService;
      this.router = router;
      this.products = productService.getAll();
      this.loadCategoryFromQuery();
    }

    loadCategoryFromQuery() {
      const category = this.router.searchParamObject?.category;
      if (category) {
        this.selectedCategory = category as string;
      }
      this.renderProductCards();
    }

    updateCategoryQuery(category: string) {
      this.router.pushUpsertSearchParam({ category });
    }

    getCategories(): string[] {
      const categories = new Set(['All', ...this.products.map(p => p.category)]);
      return Array.from(categories);
    }

    getFilteredProducts(): ProductService.Product[] {
      if (this.selectedCategory === 'All') {
        return this.products;
      }
      return this.products.filter(p => p.category === this.selectedCategory);
    }

    // ─── MutationObserver 테스트 ───
    mutationCards: number = 0;

    @eventShadowDom('.btn-add-card', 'click')
    @insertBeforeEndShadow('.mutation-test-grid')
    onAddCardClick() {
      this.mutationCards++;
      const tpl = document.createElement('template');
      tpl.innerHTML = `<div class="mutation-card" style="width:120px;height:40px"><span>카드 #${this.mutationCards}</span><button class="btn-del-card">삭제</button></div>`;
      return tpl.content.firstChild as Node;
    }

    @eventDelegateShadowDom('.btn-del-card', 'click')
    onDelCardClick(e: Event) {
      const btn = (e.target as HTMLElement).closest('.btn-del-card') as HTMLElement;
      const card = btn?.closest('.mutation-card') as HTMLElement | null;
      card?.remove();
    }

    // 카드 클릭 시 크기 랜덤 변경 (resizeObserver 테스트용)
    @eventDelegateShadowDom('.mutation-card', 'click')
    onCardClick(e: Event) {
      const card = (e.target as HTMLElement).closest('.mutation-card') as HTMLElement | null;
      if (!card || (e.target as HTMLElement).closest('.btn-del-card')) return;
      const w = 100 + Math.round(Math.random() * 150);
      const h = 30 + Math.round(Math.random() * 80);
      card.style.width = `${w}px`;
      card.style.height = `${h}px`;
    }

    // non-delegate: .mutation-card 직접 observe → 크기 변화 감지
    @resizeObserverShadow('.mutation-card')
    onCardResize(matchedEls: HTMLElement[], entries: ResizeObserverEntry[], observer: ResizeObserver) {
      const e = entries[0];
      console.log('[ResizeObserver non-delegate] target:', matchedEls, matchedEls[0]?.className, 'size:', e?.contentRect.width, 'x', e?.contentRect.height);
    }

    // delegate: 동적 추가된 .mutation-card 크기 변화도 감지
    @resizeObserverDelegateShadow('.mutation-card')
    onCardResizeDelegate(matchedEls: HTMLElement[], entries: ResizeObserverEntry[], observer: ResizeObserver) {
      const e = entries[0];
      console.log('[ResizeObserver delegate] target:', matchedEls, matchedEls[0]?.className, 'size:', e?.contentRect.width, 'x', e?.contentRect.height);
    }

    // non-delegate: .mutation-test-grid 컨테이너 직접 observe → 자식 추가/삭제 감지
    @mutationObserverShadow('.mutation-test-grid', { childList: true, subtree: true })
    onCardMutated(matchedEls: HTMLElement[], mutations: MutationRecord[], observer: MutationObserver) {
      console.log('[MutationObserver non-delegate] matched:',matchedEls, matchedEls.length, '| target:', matchedEls[0]?.className, '| total:', mutations.length);
    }

    // delegate: shadow 루트에 subtree observe → 동적 추가된 .mutation-card 감지
    @mutationObserverDelegateShadow('.mutation-card', { childList: true })
    onCardMutatedDelegate(matchedEls: HTMLElement[], mutations: MutationRecord[], observer: MutationObserver) {
      console.log('[MutationObserver delegate] matched:', matchedEls, matchedEls.length, '| target:', matchedEls[0]?.className, '| total:', mutations.length);
    }

    @innerHtml('.products-grid')
    renderProductCards(): string {
      const filtered = this.getFilteredProducts();
      console.log('fffffffff', filtered);
      return filtered
        .map(
          product => `
        <swc-example-commerce-product-card 
          data-product-id="${product.id}"
          on-add-to-cart="$host.onProductAddToCart(event,$data)"
          on-view-product="$host.onProductViewProduct(event,$data)"
        ></swc-example-commerce-product-card>
      `
        )
        .join('');
    }

    @updateClass('.category-btn')
    private syncCategoryUI() {
      return {
        active: (el: HTMLElement) => el.getAttribute('data-category') === this.selectedCategory
      };
    }

    // @event('.hero', 'click', {removeListener: () =>{alert(2)}, delegate: true})
    // @event('click', {removeListener: ()=>alert(2)})
    // @event('click', { delegate: true, root: 'shadow' })
    wow() {
      alert(1);
    }
    @eventDelegate('.category-btn', 'click')
    onCategorySelect(event: Event) {
      const btn = event.target as HTMLElement;
      const category = btn.getAttribute('data-category') || 'All';
      this.selectedCategory = category;

      this.updateCategoryQuery(category);
      this.syncCategoryUI();
      this.renderProductCards();
    }

    onProductAddToCart(e: CustomEvent, set: any) {
      this.addToCart(e.detail.product);
    }

    onProductViewProduct(e: CustomEvent, set: any) {
      this.navigateToProduct(e.detail.productId);
    }

    navigateToProduct(productId: string) {
      this.router.go(`/product/${productId}`);
    }

    addToCart(product: ProductService.Product) {
      this.cartService.addItem(product, 1);
    }

    @onConnectedBodyShadow
    render() {
      const categories = this.getCategories();

      return `
        <style>
          :host {
            display: block;
            background: #f5f5f5;
            min-height: 100%;
          }

          .home-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
          }

          .hero {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 60px 20px;
            border-radius: 12px;
            margin-bottom: 40px;
            text-align: center;
          }

          .hero h1 {
            font-size: 48px;
            margin: 0 0 20px 0;
            font-weight: 700;
          }

          .hero p {
            font-size: 20px;
            margin: 0;
            opacity: 0.95;
          }

          .filters-section {
            margin-bottom: 40px;
          }

          .filter-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 16px;
            color: #333;
          }

          .category-filters {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
          }

          .category-btn {
            padding: 10px 20px;
            border: 2px solid #ddd;
            background: white;
            color: #333;
            border-radius: 24px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.3s ease;
          }

          .category-btn:hover {
            border-color: #667eea;
            color: #667eea;
          }

          .category-btn.active {
            background: #667eea;
            color: white;
            border-color: #667eea;
          }

          .products-section {
            margin-bottom: 40px;
          }

          .section-title {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 24px;
            color: #333;
          }

          .products-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            gap: 24px;
            animation: fadeIn 0.3s ease-in;
          }

          @container (max-width: 768px) {
            .hero h1 {
              font-size: 36px;
            }

            .products-grid {
              grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
              gap: 16px;
            }

            .hero {
              padding: 40px 20px;
            }
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .empty-state {
            text-align: center;
            padding: 60px 20px;
            color: #999;
          }

          .empty-state p {
            font-size: 18px;
          }

          .mutation-test-section {
            margin-top: 40px;
            padding: 20px;
            background: #fff;
            border: 2px dashed #ccc;
            border-radius: 12px;
          }

          .btn-add-card {
            padding: 8px 16px;
            background: #667eea;
            color: #fff;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
          }

          .btn-add-card:hover {
            background: #5a67d8;
          }

          .mutation-test-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 12px;
          }

          .mutation-card {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            padding: 12px 16px;
            background: #f3f4f6;
            border-radius: 8px;
            font-size: 14px;
            cursor: pointer;
            box-sizing: border-box;
          }

          .btn-del-card {
            padding: 4px 8px;
            background: #ef4444;
            color: #fff;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 12px;
          }

          .btn-del-card:hover {
            background: #dc2626;
          }
        </style>

        <div class="home-container">
          <div class="hero">
            <h1>Welcome to DoobooStore</h1>
            <p>Discover premium tech products at unbeatable prices</p>
          </div>

          <div class="filters-section">
            <h3 class="filter-title">📂 Filter by Category</h3>
            <div class="category-filters">
              ${categories
                .map(
                  cat => `
                <button class="category-btn ${cat === this.selectedCategory ? 'active' : ''}" data-category="${cat}">
                  ${cat}
                </button>
              `
                )
                .join('')}
            </div>
          </div>

          <div class="products-section">
            <h2 class="section-title">✨ Featured Products</h2>
            <div class="products-grid"></div>
          </div>

          <div class="mutation-test-section">
            <h3 class="section-title">🧪 MutationObserver Test</h3>
            <button class="btn-add-card">카드 추가</button>
            <div class="mutation-test-grid"></div>
          </div>
        </div>
      `;
    }
  }
  return tagName;
};
