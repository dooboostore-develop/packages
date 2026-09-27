# 🛍️ E-Commerce SPA Example

A complete e-commerce application built with **@dooboostore/simple-web-component**, using a factory-based pattern for a clean, composable SPA architecture.

## Features

- ✅ **Factory Pattern**: every page, component and service is a factory; registration is explicit
- ✅ **Central Root Router**: one `rootRouterFactory` (`<commerce-root-router>`) handling all routes
- ✅ **@subscribeSwcAppRouteChange**: declarative route patterns with path parameters (`routerPathSet.pathData`)
- ✅ **Dependency Injection**: services injected into a lifecycle method (`@onConnectedBefore` / `@onConnectedAfter`)
- ✅ **Event-driven Navigation**: the header emits `navigate`, bound with `on-navigate="..."`
- ✅ **Responsive Design**: plain CSS, no CSS framework
- ✅ **Zero Hidden Magic**: explicit decorators, clear control flow

## Project Structure

```
src/
├── index.ts                # Entry: runs serviceFactories, defineSwcAppBody, connect()
├── index.html              # <body id="app" is="swc-app-body"><commerce-root-router/></body>
├── types/window.d.ts       # Global window typings
├── components/
│   ├── index.ts            # Exports: componentFactories
│   ├── Header.ts           # Emits `navigate`, shows cart count
│   ├── ProductCard.ts
│   └── CartButton.ts
├── pages/
│   ├── index.ts            # Exports: pageFactories (incl. rootRouterFactory)
│   ├── HomePage.ts         # Product grid + category filter
│   ├── ProductPage.ts      # @attribute('product-id')
│   ├── CartPage.ts
│   ├── CheckoutPage.ts
│   └── OrdersPage.ts
└── services/               # Business logic
    ├── index.ts            # Exports: serviceFactories
    ├── ProductService.ts
    ├── CartService.ts
    └── OrderService.ts
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

Visit `http://localhost:3006` in your browser.

## Architecture

### 1. Entry Point (index.ts)
Registers services into a DI container, defines `swc-app-body`, then connects the app. Pages and components are registered lazily via `onStartedLazyDefineComponent`:

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
Central routing hub using `@subscribeSwcAppRouteChange` + `@innerHtmlLight` (simplified):

```typescript
export const rootRouterFactory = (w: Window) => {
  const tagName = 'commerce-root-router';
  const existing = w.customElements.get(tagName);
  if (existing) return tagName;

  @elementDefine(tagName, { window: w })
  class RootRouter extends w.HTMLElement {
    private router: Router;

    @onConnectedAfter
    onconstructor(
      @Inject({ symbol: ProductService.SYMBOL }) productService: ProductService,
      @Inject({ symbol: CartService.SYMBOL }) cartService: CartService,
      router: Router
    ) {
      this.router = router;
    }

    @subscribeSwcAppRouteChange(['', '/', '/product/{id}', '/cart', '/checkout', '/orders'])
    @innerHtmlLight
    routeChanged(routerPathSet: RouterEventType) {
      if (['', '/'].includes(routerPathSet.path)) return `<swc-example-commerce-home-page/>`;
      if (routerPathSet.path === '/cart') return `<swc-example-commerce-cart-page/>`;
      if (routerPathSet.path.startsWith('/product/'))
        return `<swc-example-commerce-product-page product-id="${routerPathSet.pathData.id}"/>`;
      // ... checkout, orders, 404
    }

    @replaceChildren({
      root: 'light',
      filter: (host, newNode) => !host.contains(newNode)
    })
    renderContent(node: Node) {
      return node;
    }

    navigate(path: string): void {
      this.router.go(path);
    }

    @onConnectedBodyShadow
    render() {
      return `
        <style>
          :host { display: flex; flex-direction: column; min-height: 100vh; background: #fff; }
        </style>
        <swc-example-commerce-header on-navigate="$host.navigate($data.path)"></swc-example-commerce-header>
        <main id="page-container">
          <slot></slot>
        </main>
      `;
    }
  }
  return tagName;
};

export const pageFactories = [CartPage, ProductPage, CheckoutPage, HomePage, OrdersPage, rootRouterFactory];
```

### 3. Page Component with Attributes (pages/ProductPage.ts)
Pages receive data via HTML attributes (simplified):

```typescript
export default (w: Window) => {
  const tagName = 'swc-example-commerce-product-page';
  const existing = w.customElements.get(tagName);
  if (existing) return tagName;

  @elementDefine(tagName, { window: w })
  class ProductPage extends w.HTMLElement {
    product: ProductService.Product | null = null;

    @attribute('product-id')
    productId: string;

    private productService: ProductService;

    @onConnectedBefore
    onconstructor(@Inject({ symbol: ProductService.SYMBOL }) productService: ProductService) {
      this.productService = productService;
      if (this.productId) {
        this.loadProduct(this.productId);
      }
    }

    async loadProduct(productId: string) {
      this.product = await this.productService.getProductById(productId);
      // ... re-render
    }
  }
  return tagName;
};
```

### 4. Component Emitting Events (components/Header.ts)
Components emit navigation events with `@emitCustomEvent('$this', ...)` (equivalent to `@emitThis(...)`):

```typescript
export default (w: Window) => {
  const tagName = 'swc-example-commerce-header';
  const existing = w.customElements.get(tagName);
  if (existing) return tagName;

  @elementDefine(tagName, { window: w })
  class Header extends w.HTMLElement {
    @addEventListener('#orders-link', 'click')
    @emitCustomEvent('$this', 'navigate', { attributeName: 'on-navigate' })
    onOrdersClick() {
      return { path: '/orders' };
    }

    @applyNode('#cart-count', { position: 'replaceChildren' })
    updateCartCount() {
      return this.#cartService?.getItemCount?.() || 0;
    }
  }
  return tagName;
};
```

## Data Flow

```
Services (DI container, serviceFactories)
    ↓
index.ts (defineSwcAppBody + connect)
    ↓
commerce-root-router (@subscribeSwcAppRouteChange)
    ↓
Pages (receive data via attributes)
    ↓
Components (emit events via @emitCustomEvent / @emitThis)
    ↓
UI Rendering (plain Web Components)
```

## Key Patterns

### ⚠️ **CRITICAL: NO @Sim on ANY Web Component**

**This applies to every class that extends HTMLElement:**
- ✅ RootRouter
- ✅ Pages (HomePage, ProductPage, CartPage, ...)
- ✅ Components (Header, ProductCard, CartButton, ...)

Only services use `@Sim`. Web Components use `@elementDefine` only; routing is done with `@subscribeSwcAppRouteChange` on route handler methods.

```typescript
// ✅ CORRECT: Service with @Sim
@Sim({ symbol: ProductService.SYMBOL, container })
class ProductServiceImp implements ProductService { }

// ✅ CORRECT: Web Component with @elementDefine only
@elementDefine(tagName, { window: w })
class ProductPage extends w.HTMLElement {
  @onConnectedBefore
  onconstructor(@Inject({ symbol: ProductService.SYMBOL }) service: ProductService) { }
}

// ❌ WRONG: ANY Web Component with @Sim
@Sim()
@elementDefine(tagName, { window: w })
class RootRouter extends w.HTMLElement { }  // ← NEVER DO THIS!
```

### 1️⃣ **Factory Returns tagName (String)**
```typescript
export default (w: Window) => {
  const tagName = 'element-name';
  const existing = w.customElements.get(tagName);
  if (existing) return tagName;  // Return string, NOT class

  @elementDefine(tagName, { window: w })
  class ElementName extends w.HTMLElement { }

  return tagName;
};
```

### 2️⃣ **Lifecycle Method for DI**
```typescript
@onConnectedBefore
onconstructor(
  router: Router,
  @Inject({ symbol: Service.SYMBOL }) service: Service
) {
  this.router = router;
  this.service = service;
}
```

### 3️⃣ **@subscribeSwcAppRouteChange for Routes**
```typescript
@subscribeSwcAppRouteChange('/path/{param}')
@innerHtmlLight
routeMethod(routerPathSet: RouterEventType) {
  return `<component-name attribute="${routerPathSet.pathData.param}" />`;
}
```

### 4️⃣ **Event Communication**
Header → emit → RootRouter → navigate:

```typescript
// Header emits
@emitThis('navigate', { attributeName: 'on-navigate' })
onNavClick() { return { path: '/product/123' }; }

// RootRouter binds
<swc-example-commerce-header on-navigate="$host.navigate($data.path)"></swc-example-commerce-header>

// RootRouter handles
navigate(path: string) { this.router.go(path); }
```

## Service Definition Pattern

Each service is a factory that receives the container symbol and returns a class registered with `@Sim` (singleton):

```typescript
// services/ProductService.ts
export namespace ProductService {
  export const SYMBOL = Symbol('ProductService');

  export interface Product {
    id: string;
    name: string;
    price: number;
    // ...
  }
}

export interface ProductService {
  getProducts(): Promise<ProductService.Product[]>;
  getProductById(id: string): Promise<ProductService.Product | null>;
  // ...
}

export default (container: symbol): ConstructorType<any> => {
  @Sim({ symbol: ProductService.SYMBOL, container })
  class ProductServiceImp implements ProductService {
    // ...
  }
  return ProductServiceImp;
};

// services/index.ts
export const serviceFactories = [productServiceFactory, orderServiceFactory, cartServiceFactory];
```

### How it Works:
1. **Factory Pattern:** each service exports a default factory function
2. **@Sim Decorator:** registers the class in the DI container (singleton by default)
3. **SYMBOL Registration:** `@Inject({ symbol: ProductService.SYMBOL })` injects it into components
4. **Container Setup:** `index.ts` calls each factory with the container symbol
5. **Dependency Injection:** Web Components receive services as lifecycle method parameters

---

**This architecture demonstrates:**
- ✅ Explicit registration via factories
- ✅ Centralized routing in one RootRouter
- ✅ Parameter passing via HTML attributes
- ✅ Event-driven navigation
- ✅ Full Dependency Injection support
- ✅ Clear data flow with no hidden magic
