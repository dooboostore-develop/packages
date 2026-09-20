# 🛍️ simple-web-component Example / Test App

A small e-commerce SPA built with **@dooboostore/simple-web-component**, doubling as a **live test bed** for the framework's decorators — routing, DI, events (including delegation), timers, slots, and the RxJS-style event operators.

## Features

- ✅ Route-driven SPA via a single `RootRouter` (`@subscribeSwcAppRouteChangeWhileConnected`)
- ✅ Dependency Injection via `@dooboostore/simple-boot`'s `@Inject`, mixed with SWC's own parameter decorators
- ✅ Event-driven navigation via custom events (`@emitCustomEvent` / `on-navigate`)
- ✅ Live test pages for: timers/animation frames, slots, RxJS-style event operators, event delegation, and order-independent parameter injection
- ✅ Zero hidden magic: explicit decorators, `@elementDefine` factories, clear control flow

## Project Structure

```
src/
├── index.ts                # Entry: reflect-metadata → defineSwcAppBody → appElement.connect(...)
├── index.html               # <body id="app" is="swc-app-body">
├── components/
│   ├── index.ts             # Exports: componentFactories
│   ├── Header.ts            # Nav + cart badge; DI via @onConnectedBefore + @Inject
│   ├── CartButton.ts        # Customized built-in element (extends HTMLButtonElement)
│   └── ProductCard.ts
├── pages/
│   ├── index.ts             # Exports: pageFactories + rootRouterFactory (RootRouter)
│   ├── HomePage.ts / CartPage.ts / CheckoutPage.ts / OrdersPage.ts
│   ├── ProductPage.ts       # @attribute('product-id')
│   ├── TimerTestPage.ts          # @setInterval / @setTimeout / @requestAnimationFrame
│   ├── SlotTestPage.ts           # @applySlot family + <!--[[ id ]]--> template directive
│   ├── RxjsOperatorsTestPage.ts  # @addEventListener debounceTime/throttleTime/distinctUntilChanged/filter
│   ├── EventDelegateTestPage.ts  # delegate:true (bubbling) vs delegate:'mutation'
│   └── LifecycleParamTestPage.ts # @eventObject/@matchedElement/@hostSet/... parameter decorators
├── services/
│   ├── index.ts             # Exports: serviceFactories
│   └── ProductService.ts / CartService.ts / OrderService.ts
└── types/
    └── window.d.ts          # Window type augmentation (ResizeObserver/MutationObserver/etc.)
```

## Getting Started

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm run dev

# Build for production
pnpm run build
```

Visit `http://localhost:3007` in your browser (see `webpack.config.cjs`; overridable via the `PORT` env var).

## Architecture

### 1. Bootstrap (index.ts)

```typescript
import 'reflect-metadata';
import { SwcAppInterface, defineSwcAppBody } from '@dooboostore/simple-web-component';
import { UrlUtils } from '@dooboostore/core';
import { componentFactories } from './components';
import { pageFactories } from './pages';
import { serviceFactories } from './services';

const w = window;

w.document.addEventListener('DOMContentLoaded', async () => {
  const container = Symbol('container');
  serviceFactories.forEach(it => it(container));
  await defineSwcAppBody(w);

  const appElement = w.document.querySelector('#app') as SwcAppInterface;
  const path = UrlUtils.getUrlPath(w.location) ?? '/';

  if (appElement) {
    appElement.connect({
      path,
      routeType: 'path',
      onStartedLazyDefineComponent: [...componentFactories, ...pageFactories],
      container,
      window: w
    });
  }
});
```

### 2. Root Router (pages/index.ts)

A single `RootRouter` owns all routing via `@subscribeSwcAppRouteChangeWhileConnected` — no `@Router`/`@Sim` on the Web Component itself:

```typescript
@elementDefine('commerce-root-router', { window: w })
class RootRouter extends w.HTMLElement {
  private router: Router;

  @onConnectedAfter
  onconstructor(
    @Inject({ symbol: ProductService.SYMBOL }) productService: ProductService,
    @Inject({ symbol: CartService.SYMBOL }) cartService: CartService,
    @Inject({ symbol: OrderService.SYMBOL }) orderService: OrderService,
    router: Router
  ) {
    this.router = router;
    // ...
  }

  @publishSwcAppMessage
  publishMessage(message: string) {
    return message;
  }

  @subscribeSwcAppRouteChangeWhileConnected(['', '/', '/product/{id}', '/cart', '/checkout', '/orders', '/timer-test', '/slot-test', '/rxjs-operators-test', '/event-delegate-test', '/lifecycle-param-test'])
  @innerHtmlLight
  routeChanged(routerPathSet: RouterEventType) {
    if (['', '/'].includes(routerPathSet.path)) return `<swc-example-commerce-home-page/>`;
    if (routerPathSet.path.startsWith('/product/')) return `<swc-example-commerce-product-page product-id="${routerPathSet.pathData.id}"/>`;
    // ...other routes, 404 fallback
  }

  @replaceChildren({ root: 'light', filter: (host, newNode) => !host.contains(newNode) })
  renderContent(node: Node) {
    return node;
  }

  navigate(path: string): void {
    this.router.go(path);
  }

  @onConnectedBodyShadow
  render() {
    return `
      <swc-example-commerce-header on-navigate="$host.navigate($data.path)"></swc-example-commerce-header>
      <main id="page-container"><slot></slot></main>
    `;
  }
}
```

### 3. Page with an Attribute (pages/ProductPage.ts)

```typescript
@elementDefine('swc-example-commerce-product-page', { window: w })
class ProductPage extends w.HTMLElement {
  @attribute('product-id')
  productId: string;

  @onConnectedBefore
  onconstructor(@Inject({ symbol: ProductService.SYMBOL }) productService: ProductService, /* ...more @Inject */) {
    if (this.productId) this.loadProduct(this.productId);
  }
}
```

### 4. Component Emitting Navigation Events (components/Header.ts)

```typescript
@elementDefine('swc-example-commerce-header', { window: w })
class Header extends w.HTMLElement {
  @onConnectedBefore
  async gg(@inject({ symbol: CartService.SYMBOL }) cartService: CartService) {
    await cartService.load();
    cartService.store.subscribe(cart => this.updateCartCount());
  }

  @addEventListener('#home-link', 'click')
  @emitCustomEvent('$this', 'navigate', { attributeName: 'on-navigate' })
  onHomeClick() {
    return { path: '/' };
  }

  @applyNode('#cart-count', { position: 'replaceChildren' })
  updateCartCount() {
    return this.cartService?.getItemCount?.() || 0;
  }
}
```

### 5. Service Definition (services/ProductService.ts)

```typescript
export default (container: symbol) => {
  @Sim({ symbol: ProductService.SYMBOL, container })
  class ProductServiceImpl implements ProductService {
    async getProducts() { /* ... */ }
  }
  return ProductServiceImpl;
};
```

`@Sim` is for **services only** — Web Components use `@elementDefine`, never `@Sim`/`@Router`.

---

## Decorator Feature Test Pages

Beyond the storefront pages, this app doubles as a live test bed for framework features that are hard to verify with static docs. Each route below is a self-contained, click-through demo (navigable from the header nav bar):

| Route | Page | Demonstrates |
|---|---|---|
| `/timer-test` | `TimerTestPage.ts` | `@setInterval` / `@setTimeout` / `@requestAnimationFrame` — `type: 'onConnected'` vs `'returnValue'` modes, `parameter`/`created` callbacks, `valueKey` fallback, and safe stacking with `@applyNode` regardless of decorator order. |
| `/slot-test` | `SlotTestPage.ts` | `@applySlot` (`@appendSlot`/`@prependSlot`/`@replaceChildrenSlot`/`@clearSlot`) using the `<!--[[ id ]]-->` template directive — the declarative way to embed a slot marker (`SwcUtils.projectProcessHtml` converts it automatically; no manual `NodeSlot` construction needed). |
| `/rxjs-operators-test` | `RxjsOperatorsTestPage.ts` | `@addEventListener`'s RxJS-style options: `debounceTime`, `throttleTime`, `distinctUntilChanged`, `filter`. Includes the gotcha that `debounceTime`/`throttleTime` defer processing past the point where a shadow-crossing event's `.target` is still reliable — read live DOM state instead of the event inside a delayed handler. |
| `/event-delegate-test` | `EventDelegateTestPage.ts` | `eventDelegateLight`/`eventDelegateShadow` (`delegate: true`, bubbling-based — one listener, catches elements added *after* connect with zero rebinding, but only for bubbling events) vs `eventMutation` (`delegate: 'mutation'`, MutationObserver-based — binds directly per element, so it also covers non-bubbling events like `focus`). |
| `/lifecycle-param-test` | `LifecycleParamTestPage.ts` | The order-independent parameter decorators (below), including mixing `@dooboostore/simple-boot`'s `@Inject` with SWC's own `@hostSet`/`@helperHostSet`/`@helperSet` on the *same* method, and route-change / app-message subscribers receiving their payload via `@routerEvent` / `@appMessage`. |

## Order-Independent Parameter Decorators (`@dooboostore/simple-web-component` → `decorators/parameter.ts`)

Handlers for `@addEventListener` (incl. delegate variants), SWC lifecycle methods (`@onConnected*`), `@subscribeSwcAppRouteChangeWhileConnected`, and `@subscribeSwcAppMessageWhileConnected` are normally called with **fixed positional arguments**. These parameter decorators let you request exactly the values you need, **in any order**, mirroring `@dooboostore/simple-boot`'s `@Inject` (index-based metadata, not call-order-based):

| Decorator | Injects | Usable in |
|---|---|---|
| `@eventObject` | the raw `Event` | `@addEventListener` handlers |
| `@matchedElement` | the delegate-matched element (`$matchedElement`) | `@addEventListener` delegate handlers |
| `@hostSet` | `HostSet` — `$host`/`$hosts`/`$firstHost`/`$appHost`/... (host-tree info only) | all four families below |
| `@helperHostSet` | `HelperHostSet` — `HelperSet & HostSet & {$this}` (everything) | all four families |
| `@helperSet` | `HelperSet` — `$d`/`$w`/`$q`/`$qa`/`$qi` (pure DOM/window helpers, no host-tree info) | all four families |
| `@routerEvent` | `{ ...RouterEventType, pathData }` | `@subscribeSwcAppRouteChangeWhileConnected` handlers |
| `@appMessage` | the `SwcAppMessage` payload | `@subscribeSwcAppMessageWhileConnected` handlers |

If a method uses **none** of these, it falls back to the exact legacy positional call — fully backward compatible.

```typescript
// Reordered, and mixed with simple-boot's own @Inject in one method:
@onConnectedAfter
onConnectedCheck(
  @Inject({ symbol: ProductService.SYMBOL }) productService: ProductService,
  @hostSet hs: HostSet,
  @helperHostSet full: HelperHostSet,
  @helperSet helpers: HelperSet
) { /* ... */ }

// Delegate handler with matched element requested before the event:
@eventDelegateLight('.dyn-btn', 'click')
onClick(@matchedElement el: Element, @eventObject e: Event) { /* ... */ }
```

## Key Patterns

### ⚠️ **`@Sim` is for services only**

Any class extending `HTMLElement` — pages, components, the root router — uses `@elementDefine` and nothing else. Never `@Sim`/`@Router` on a Web Component.

```typescript
// ✅ Service
@Sim({ symbol: ProductService.SYMBOL, container })
class ProductServiceImpl implements ProductService { /* ... */ }

// ✅ Web Component
@elementDefine(tagName, { window: w })
class ProductPage extends w.HTMLElement { /* ... */ }

// ❌ NEVER
@Sim()
@elementDefine(tagName, { window: w })
class ProductPage extends w.HTMLElement { /* ... */ }
```

### Factory returns `tagName` (string)

```typescript
export default (w: Window) => {
  const tagName = 'element-name';
  const existing = w.customElements.get(tagName);
  if (existing) return tagName;

  @elementDefine(tagName, { window: w })
  class ElementName extends w.HTMLElement { /* ... */ }

  return tagName;
};
```

### Event → custom event → router navigation

```typescript
// Header emits
@addEventListener('.logo', 'click')
@emitCustomEvent('$this', 'navigate', { attributeName: 'on-navigate' })
onLogoClick() { return { path: '/' }; }

// RootRouter's shadow template wires the attribute
// <header on-navigate="$host.navigate($data.path)"></header>

// RootRouter handles it
navigate(path: string) { this.router.go(path); }
```

---

**License**: MIT (same as the parent package).
