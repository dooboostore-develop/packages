import { event, innerHtml, onConnectedAfter, onConnectedBody, updateClass, applyNode, elementDefine, emitCustomEvent, onConnectedBefore, onConnectedBodyShadow, addEventListenerThis, mutationObserverDelegateShadow, eventDelegate, eventShadow, eventDelegateShadow, mutationObserverShadow, insertBeforeEndShadow, resizeObserverShadow, resizeObserverDelegateShadow, mutationObserver, resizeObserver, styleShadow, clsShadow, applyShadow, propWindow, emitThis, eventThis } from '@dooboostore/simple-web-component';
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

    @eventShadow('.btn-add-card', 'click')
    @insertBeforeEndShadow('.mutation-test-grid')
    onAddCardClick() {
      this.mutationCards++;
      const tpl = document.createElement('template');
      tpl.innerHTML = `<div class="mutation-card" style="width:120px;height:40px"><span>카드 #${this.mutationCards}</span><button class="btn-del-card">삭제</button></div>`;
      return tpl.content.firstChild as Node;
    }

    @eventDelegateShadow('.btn-del-card', 'click')
    onDelCardClick(e: Event) {
      const btn = (e.target as HTMLElement).closest('.btn-del-card') as HTMLElement;
      const card = btn?.closest('.mutation-card') as HTMLElement | null;
      card?.remove();
    }

    // 카드 클릭 시 크기 랜덤 변경 (resizeObserver 테스트용)
    @eventDelegateShadow('.mutation-card', 'click')
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

    // ─── event(delegate:'mutation') 테스트 ───
    // focus는 비버블링 이벤트 → closest 델리게이션으로는 안 잡힘. mutation 모드는 직접 바인딩이라 동작해야 함.
    focusCards: number = 0;

    @eventShadow('.btn-add-focus', 'click')
    @insertBeforeEndShadow('.focus-test-grid')
    onAddFocusInput() {
      this.focusCards++;
      const tpl = document.createElement('template');
      tpl.innerHTML = `<div class="focus-card"><input class="focus-input" placeholder="focus #${this.focusCards}" /><span class="focus-status">-</span></div>`;
      return tpl.content.firstChild as Node;
    }

    @event('.focus-input', 'focus', {
      delegate: 'mutation',
      root: 'shadow',
      removeListener: (target, opts) => {
        console.log('[event delegate:mutation][removeListener] focus target:', target, '| opts:', opts);
      }
    })
    onFocusInput(e: Event) {
      const input = e.target as HTMLInputElement;
      const status = input.closest('.focus-card')?.querySelector('.focus-status');
      if (status) status.textContent = 'focus!';
      console.log('[event delegate:mutation] focus →', input.placeholder, input.className);
    }

    @event('.focus-input', 'blur', {
      delegate: 'mutation',
      root: 'shadow',
      removeListener: (target, opts) => {
        console.log('[event delegate:mutation][removeListener] blur target:', target, '| opts:', opts);
      }
    })
    onBlurInput(e: Event) {
      const input = e.target as HTMLInputElement;
      const status = input.closest('.focus-card')?.querySelector('.focus-status');
      if (status) status.textContent = 'blur';
      console.log('[event delegate:mutation] blur →', input.placeholder);
    }

    // ─── 함수 셀렉터 MutationObserver 테스트 ───
    // selector 함수를 한 번 호출해 반환 요소(.fn-mut-grid)를 observe → 그 요소의 mutation만 콜백
    @mutationObserver((t: any, h: any) => t.shadowRoot?.querySelector('.fn-mut-grid') ?? null, { childList: true })
    onFnMutGridChanged(matchedEls: HTMLElement[], mutations: MutationRecord[], observer: MutationObserver) {
      console.log('[MO fn-selector] grid changed | matched:', matchedEls, matchedEls.length, '| target:', matchedEls[0]?.className, '| total:', mutations.length);
    }

    @eventShadow('.btn-add-fn-item', 'click')
    @insertBeforeEndShadow('.fn-mut-grid')
    onAddFnItem() {
      const tpl = document.createElement('template');
      tpl.innerHTML = `<div class="fn-mut-item">item #${Date.now() % 100000}</div>`;
      return tpl.content.firstChild as Node;
    }

    // ─── 자기 자신(attribute) 변경 테스트 ───
    // attributes:true → observe한 요소(그리드 자신)의 attribute가 바뀔 때 콜백 (자식 추가가 아니라)
    @mutationObserver((t: any, h: any) => t.shadowRoot?.querySelector('.fn-mut-grid') ?? null, { attributes: true, attributeFilter: ['data-mark'], attributeOldValue: true })
    onFnMutGridAttrChanged(matchedEls: HTMLElement[], mutations: MutationRecord[], observer: MutationObserver) {
      const m = mutations[0];
      console.log('[MO fn-selector attributes] grid attr changed | target:', matchedEls, matchedEls[0]?.className, '| attr:', m?.attributeName, '| old:', m?.oldValue, '| new:', (matchedEls[0] as HTMLElement | undefined)?.getAttribute('data-mark'));
    }

    @eventShadow('.btn-change-fn-attr', 'click')
    onChangeFnAttr() {
      const grid = this.shadowRoot?.querySelector('.fn-mut-grid');
      if (grid) grid.setAttribute('data-mark', `v-${Date.now() % 1000}`);
    }

    // ─── 함수 셀렉터 ResizeObserver 테스트 ───
    // selector 함수가 반환한 .ro-fn-box 요소들을 observe → 크기 변화만 콜백
    @resizeObserver((t: any, h: any) => t.shadowRoot?.querySelectorAll('.ro-fn-box') ?? [])
    onFnBoxResize(matchedEls: HTMLElement[], entries: ResizeObserverEntry[], observer: ResizeObserver) {
      const e = entries[0];
      console.log('[RO fn-selector] resized | target:', matchedEls, matchedEls[0]?.className, '| size:', e?.contentRect.width, 'x', e?.contentRect.height);
    }

    @eventShadow('.btn-resize-fn-box', 'click')
    onResizeFnBox() {
      this.shadowRoot?.querySelectorAll('.ro-fn-box').forEach(box => {
        const el = box as HTMLElement;
        const w = 120 + Math.round(Math.random() * 120);
        el.style.width = `${w}px`;
      });
    }

    // ─── 편의 헬퍼 테스트 (styleShadow / clsShadow / applyShadow / propWindow / emitThis / eventThis) ───
    @eventShadow('.btn-helper-style', 'click')
    @styleShadow('.helper-box', 'update')
    onApplyHelperStyle() {
      return { color: '#fff', backgroundColor: '#7c3aed', borderRadius: '10px', padding: '12px 16px' };
    }

    @eventShadow('.btn-helper-cls', 'click')
    @clsShadow('.helper-btn', 'toggle')
    onToggleHelperClass() {
      return { active: true };
    }

    @eventShadow('.btn-helper-node', 'click')
    @applyShadow('.helper-grid', { position: 'beforeEnd' })
    onAddHelperNode() {
      const tpl = document.createElement('template');
      tpl.innerHTML = `<span class="helper-chip">added</span>`;
      return tpl.content.firstChild as Node;
    }

    @eventShadow('.btn-helper-prop', 'click')
    @propWindow('swcHelperTest')
    onSetWindowProp() {
      return { value: 42, at: Date.now() };
    }

    helperEventCount: number = 0;
    @eventShadow('.btn-helper-emit', 'click')
    @emitThis('helper-custom-event')
    onEmitHelperEvent() {
      this.helperEventCount++;
      return { count: this.helperEventCount };
    }

    @eventThis('helper-custom-event')
    onHelperEventReceived(e: Event) {
      console.log('[emitThis] received helper-custom-event | detail:', (e as CustomEvent).detail);
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

          .focus-test-section {
            margin-top: 40px;
            padding: 20px;
            background: #fff;
            border: 2px dashed #34d399;
            border-radius: 12px;
          }

          .btn-add-focus {
            padding: 8px 16px;
            background: #10b981;
            color: #fff;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
          }

          .btn-add-focus:hover {
            background: #059669;
          }

          .focus-test-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 12px;
          }

          .focus-card {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            background: #ecfdf5;
            border: 1px solid #d1fae5;
            border-radius: 8px;
            font-size: 12px;
          }

          .focus-input {
            padding: 6px 10px;
            border: 1px solid #a7f3d0;
            border-radius: 6px;
            font-size: 13px;
            outline: none;
            width: 130px;
          }

          .focus-input:focus {
            border-color: #10b981;
            box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
          }

          .focus-status {
            min-width: 36px;
            text-align: center;
            font-weight: 700;
            color: #10b981;
          }

          .fn-mut-test-section {
            margin-top: 40px;
            padding: 20px;
            background: #fff;
            border: 2px dashed #f59e0b;
            border-radius: 12px;
          }
          .ro-fn-test-section {
            margin-top: 40px;
            padding: 20px;
            background: #fff;
            border: 2px dashed #6366f1;
            border-radius: 12px;
          }
          .helper-test-section {
            margin-top: 40px;
            padding: 20px;
            background: #fff;
            border: 2px dashed #ec4899;
            border-radius: 12px;
          }
          .fn-mut-grid, .helper-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 12px;
            min-height: 24px;
          }
          .fn-mut-item {
            padding: 6px 10px;
            background: #fef3c7;
            border: 1px solid #fde68a;
            border-radius: 6px;
            font-size: 12px;
          }
          .ro-fn-boxes {
            display: flex;
            gap: 10px;
            margin-top: 12px;
          }
          .ro-fn-box {
            width: 120px;
            height: 60px;
            background: #e0e7ff;
            border: 1px solid #c7d2fe;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            transition: width 0.3s ease;
            box-sizing: border-box;
          }
          .btn-add-fn-item, .btn-resize-fn-box {
            padding: 8px 16px;
            background: #667eea;
            color: #fff;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            margin-right: 8px;
          }
          .btn-add-fn-item { background: #f59e0b; }
          .btn-add-fn-item:hover { background: #d97706; }
          .btn-resize-fn-box:hover { background: #5a67d8; }
          .helper-toolbar button {
            padding: 8px 14px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 13px;
            margin: 4px 6px 4px 0;
            background: #ec4899;
            color: #fff;
          }
          .helper-toolbar button:hover { background: #db2777; }
          .helper-box {
            margin-top: 12px;
            padding: 12px 16px;
            background: #fdf2f8;
            border: 1px solid #fbcfe8;
            border-radius: 10px;
            font-size: 13px;
            display: inline-block;
          }
          .helper-btn {
            padding: 8px 14px;
            border: 1px solid #ddd;
            background: #fff;
            border-radius: 8px;
            cursor: pointer;
            font-size: 13px;
            margin-left: 8px;
          }
          .helper-btn.active {
            background: #ec4899;
            color: #fff;
            border-color: #ec4899;
          }
          .helper-chip {
            padding: 4px 8px;
            background: #fce7f3;
            border: 1px solid #fbcfe8;
            border-radius: 999px;
            font-size: 11px;
          }
          .helper-test-log {
            margin-top: 12px;
            font-size: 12px;
            color: #888;
            line-height: 1.6;
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

          <div class="focus-test-section">
            <h3 class="section-title">🎯 event(delegate: 'mutation') Test</h3>
            <button class="btn-add-focus">포커스 인풋 추가</button>
            <div class="focus-test-grid"></div>
            <p style="font-size:12px;color:#888;margin-top:10px;">
              동적 추가된 <code>input</code>에 <code>focus</code>/<code>blur</code>(비버블링) 이벤트를
              MutationObserver(subtree)로 직접 바인딩하는 테스트. 인풋을 클릭/벗어나면 상태가 바뀌고 콘솔에 로그가 남습니다.
            </p>
          </div>

          <div class="fn-mut-test-section">
            <h3 class="section-title">🔍 함수 셀렉터 MutationObserver Test</h3>
            <button class="btn-add-fn-item">아이템 추가 (자식)</button>
            <button class="btn-change-fn-attr">속성 변경 (자기 자신)</button>
            <div class="fn-mut-grid"></div>
            <p style="font-size:12px;color:#888;margin-top:10px;">
              <code>@mutationObserver((t,h) => t.shadowRoot.querySelector('.fn-mut-grid'), { childList:true })</code> —
              함수를 한 번 호출해 반환 요소를 observe. <strong>아이템 추가</strong>는 자식 mutation, <strong>속성 변경</strong>은
              <code>{ attributes:true, attributeFilter:['data-mark'] }</code>로 자기 자신 attribute 변경을 감지. 콘솔 로그 확인.
            </p>
          </div>

          <div class="ro-fn-test-section">
            <h3 class="section-title">📐 함수 셀렉터 ResizeObserver Test</h3>
            <button class="btn-resize-fn-box">박스 크기 변경</button>
            <div class="ro-fn-boxes">
              <div class="ro-fn-box">Box A</div>
              <div class="ro-fn-box">Box B</div>
            </div>
            <p style="font-size:12px;color:#888;margin-top:10px;">
              <code>@resizeObserver((t,h) => t.shadowRoot.querySelectorAll('.ro-fn-box'))</code> —
              함수가 반환한 요소들을 observe, 크기 변화만 콜백.
            </p>
          </div>

          <div class="helper-test-section">
            <h3 class="section-title">🧰 편의 헬퍼 Test (styleShadow/clsShadow/applyShadow/propWindow/emitThis)</h3>
            <div class="helper-toolbar">
              <button class="btn-helper-style">스타일 적용</button>
              <button class="btn-helper-cls">클래스 토글</button>
              <button class="btn-helper-node">노드 추가</button>
              <button class="btn-helper-prop">window prop</button>
              <button class="btn-helper-emit">이벤트 emit</button>
            </div>
            <div>
              <span class="helper-box">Helper Box</span>
              <button class="helper-btn">Helper Btn</button>
            </div>
            <div class="helper-grid"></div>
            <div class="helper-test-log">
              window.swcHelperTest 값 확인 · 콘솔에서 <code>[emitThis] received helper-custom-event</code> 로그 확인
            </div>
          </div>
        </div>
      `;
    }
  }
  return tagName;
};
