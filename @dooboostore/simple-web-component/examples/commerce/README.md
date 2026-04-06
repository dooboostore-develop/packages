# 🛍️ E-Commerce SPA Example

A complete e-commerce application built with **@dooboostore/simple-web-component** using the modern **Accommodation Pattern** for Clean, Composable SPA Architecture.

## Features

- ✅ **Accommodation Pattern**: Factory-based registration with explicit DI
- ✅ **Central Root Router**: One `rootRouterFactory` managing all routes
- ✅ **@subscribeSwcAppRouteChange**: Declarative route patterns with parameter extraction
- ✅ **Dependency Injection**: Services injected via `@onInitialize`
- ✅ **Event-driven Navigation**: Header navigation via `on-navigate` custom events
- ✅ **Responsive Design**: Pure CSS without framework overhead
- ✅ **Zero Hidden Magic**: Explicit decorators, clear control flow

## Project Structure

```
src/
├── index.ts                # Entry: calls bootFactory, mounts app
├── index.html              # Root: <body id="app" is="swc-app-body">
├── bootFactory.ts          # Central: registers all factories
├── components/
│   ├── index.ts            # Exports: componentFactories
│   ├── Header.ts           # @elementDefine, returns tagName
│   ├── ProductCard.ts
│   └── CartButton.ts
├── pages/
│   ├── index.ts            # Exports: pageFactories, rootRouterFactory
│   ├── HomePage.ts         # Factory returns tagName
│   ├── ProductPage.ts      # @attributeThis('product-id')
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

## Architecture: The Accommodation Pattern

### 1. Service Registration (bootFactory.ts)
Central boot factory coordinating all registrations:

```typescript
import register from '@dooboostore/simple-web-component';
import { serviceFactories } from './services';
import { componentFactories } from "./components";
import { pageFactories } from "./pages";

export default (w: Window, container: symbol) => {
  // Initialize services with DI container
  serviceFactories.forEach(s => s(container));
  
  // Register all pages, components, and root router
  register(w, [...pageFactories, ...componentFactories]);
};
```

### 2. Root Router with Route Decorators (pages/index.ts)
Central routing hub using `@subscribeSwcAppRouteChange`:

```typescript
export const rootRouterFactory = (w: Window) => {
  const tagName = 'commerce-root-router';
  const existing = w.customElements.get(tagName);
  if (existing) return tagName;

  @elementDefine(tagName, { window: w })
  class RootRouter extends w.HTMLElement {
    private router: Router;
    private productService: ProductService;
    private cartService: CartService;

    @onInitialize
    onconstructor(
      router: Router,
      @Inject({ symbol: ProductService.SYMBOL }) productService: ProductService,
      @Inject({ symbol: CartService.SYMBOL }) cartService: CartService
    ) {
      this.router = router;
      this.productService = productService;
      this.cartService = cartService;
    }

    // Pattern 1: Simple route
    @subscribeSwcAppRouteChange(['', '/'])
    @applyInnerHtmlNodeThis({ root: 'light' })
    homeRoute(router: RouterEventType) {
      return `<swc-example-commerce-home-page/>`;
    }

    // Pattern 2: Route with path parameters
    @subscribeSwcAppRouteChange('/product/{id}')
    @applyInnerHtmlNodeThis({ root: 'light' })
    productRoute(router: RouterEventType, pathData: any) {
      return `<swc-example-commerce-product-page product-id="${pathData.id}"/>`;
    }

    @applyReplaceChildrenNodeThis({
      root: 'light',
      filter: (host, newNode) => !host.contains(newNode)
    })
    renderContent(node: Node) {
      return node;
    }

    navigate(path: string): void {
      this.router.go(path);
    }

    @onConnectedInnerHtml({ useShadow: true })
    render() {
      return `
        <style>
          :host display: flex; flex-direction: column; min-height: 100vh; background: #fff; }
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

export const pageFactories = [
  rootRouterFactory,
  HomePage,
  ProductPage,
  CartPage,
  CheckoutPage,
  OrdersPage
];
```

### 3. Page Component with Attributes (pages/ProductPage.ts)
Pages receive data via HTML attributes:

```typescript
export default (w: Window) => {
  const tagName = 'swc-example-commerce-product-page';
  const existing = w.customElements.get(tagName);
  if (existing) return tagName;

  @elementDefine(tagName, { window: w })
  class ProductPage extends w.HTMLElement {
    private router: Router;
    private productService: ProductService;
    private productId: string = '';

    @attributeThis('product-id')
    productIdAttr: string = '';

    @onInitialize
    onconstructor(
      router: Router,
      @Inject({ symbol: ProductService.SYMBOL }) productService: ProductService
    ) {
      this.router = router;
      this.productService = productService;

      // Listen to attribute changes
      if (this.productIdAttr) {
        this.loadProduct(this.productIdAttr);
      }
    }

    private loadProduct(id: string) {
      if (this.productId !== id) {
        this.productId = id;
        // Fetch and render product
        this.render();
      }
    }

    @addEventListener('#go-back', 'click')
    onBack() {
      this.router.go('/');
    }
  }
  return tagName;
};
```

### 4. Component Emitting Events (components/Header.ts)
Components emit navigation events via `@emitCustomEventThis`:

```typescript
export default (w: Window) => {
  const tagName = 'swc-example-commerce-header';
  const existing = w.customElements.get(tagName);
  if (existing) return tagName;

  @elementDefine(tagName, { window: w })
  class Header extends w.HTMLElement {
    @emitCustomEventThis('navigate')
    @addEventListener('.nav-link', 'click', { delegate: true })
    onNavClick(e: any) {
      const path = e.target.closest('[data-path]')?.dataset?.path;
      return { path };
    }
  }
  return tagName;
};
```

### 5. Entry Point (index.ts)
Bootstraps the app with DI container and mounts root router:

```typescript
import 'reflect-metadata';
import { SwcAppInterface } from '@dooboostore/simple-web-component';
import { UrlUtils } from "@dooboostore/core";
import bootFactory from "./bootFactory";

const w = window;

w.document.addEventListener('DOMContentLoaded', () => {
  const container = Symbol('container');
  bootFactory(w, container);
  
  const appElement = w.document.querySelector('#app') as SwcAppInterface;
  const path = UrlUtils.getUrlPath(w.location) ?? '/';
  
  if (appElement) {
    appElement.connect({
      path: path,
      routeType: 'path',
      container: container,
      window: w,
      onEngineStarted: () => {
        console.log('[Commerce] Engine started');
        appElement.innerHTML = '<commerce-root-router></commerce-root-router>';
      }
    });
  }
});
```

## Data Flow

```
Services (DI Container)
    ↓
bootFactory (initialize services)
    ↓
rootRouterFactory (@subscribeSwcAppRouteChange)
    ↓
Pages (receive data via attributes)
    ↓
Components (emit events via @emitCustomEventThis)
    ↓
UI Rendering (Pure Web Components)
```

## Key Patterns

### ⚠️ **CRITICAL: NO @Sim for ANY Web Component (including examples!)**

**This rule applies to ALL classes that extend HTMLElement, including:**
- ✅ RootRouter
- ✅ Pages (HomePage, ProductPage, CartPage, etc.)
- ✅ Components (Header, ProductCard, CartButton, etc.)

Only Services should use `@Sim` decorator! Web Components should use `@elementDefine` only. Routing is now handled via `@subscribeSwcAppRouteChange` decorators on individual route handler methods.

```typescript
// ✅ CORRECT: Service with @Sim
@Sim()
export class ProductService {
  async getProducts() { }
}

// ✅ CORRECT: RootRouter with @subscribeSwcAppRouteChange (NO @Sim, NO @Router)
@elementDefine(tagName, { window: w })
class RootRouter extends w.HTMLElement {
  @onInitialize
  onconstructor(service: ProductService) { }

  @subscribeSwcAppRouteChange('/')
  @applyInnerHtmlNodeThis({ root: 'light' })
  homeRoute(router: RouterEventType) {
    return `<page-home/>`;
  }

  @subscribeSwcAppRouteChange('/product/{id}')
  @applyInnerHtmlNodeThis({ root: 'light' })
  productRoute(router: RouterEventType, pathData: any) {
    return `<page-product product-id="${pathData.id}"/>`;
  }
}

// ✅ CORRECT: Page with @elementDefine (NO @Sim, NO @Router)
@elementDefine(tagName, { window: w })
class ProductPage extends w.HTMLElement {
  @onInitialize
  onconstructor(service: ProductService) { }
}

// ✅ CORRECT: Component with @elementDefine (NO @Sim)
@elementDefine(tagName, { window: w })
class Header extends w.HTMLElement { }

// ❌ WRONG: ANY Web Component with @Sim
@Sim()
@elementDefine(tagName, { window: w })
class RootRouter extends w.HTMLElement { }  // ← NEVER DO THIS!

// ❌ WRONG: Old pattern with @Router (completely removed)
@Sim()
@Router(routerConfig)
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
  class ElementName { }
  
  return tagName;  // Always return string
};
```

### 2️⃣ **@onInitialize for DI**
```typescript
@onInitialize
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
@applyInnerHtmlNodeThis({ root: 'light' })
routeMethod(router: RouterEventType, pathData: any) {
  return `<component-name attribute="${pathData.param}" />`;
}
```

### 4️⃣ **Event Communication**
Header → emit → RootRouter → navigate:

```typescript
// Header emits
@emitCustomEventThis('navigate')
onNavClick() { return { path: '/product/123' }; }

// RootRouter receives
<header on-navigate="$host.navigate($data.path)"></header>

// RootRouter handles
navigate(path: string) { this.router.go(path); }
```

## Service Definition Pattern

Services are implemented as factories that return classes wrapped with `@Sim` for Dependency Injection and Singleton lifetime management:

```typescript
// services/ProductService.ts
export namespace ProductService {
  export const SYMBOL = Symbol('ProductService');
  
  export interface Product {
    id: string;
    name: string;
    price: number;
    // ... more fields
  }
}

export interface ProductService {
  getProducts(): Promise<ProductService.Product[]>;
  searchProducts(query: string): Promise<ProductService.Product[]>;
  getProductById(id: string): Promise<ProductService.Product>;
}

// Factory function: receives container and returns Service class
export default (container: symbol): ConstructorType<any> => {
  @Sim({ symbol: ProductService.SYMBOL, container })
  class ProductServiceImpl implements ProductService {
    async getProducts() {
      // Implementation
    }
    
    async searchProducts(query: string) {
      // Implementation
    }
    
    async getProductById(id: string) {
      // Implementation
    }
  }
  
  return ProductServiceImpl;
};

// services/index.ts
import productServiceFactory from './ProductService';
import orderServiceFactory from './OrderService';
import cartServiceFactory from './CartService';

export const serviceFactories = [
  productServiceFactory,
  orderServiceFactory,
  cartServiceFactory
];
```

### How it Works:
1. **Factory Pattern:** Each service exports a default factory function
2. **@Sim Decorator:** Marks the class for DI container (Singleton by default)
3. **SYMBOL Registration:** `@Inject({ symbol: ProductService.SYMBOL })` to inject into components
4. **Container Setup:** `bootFactory` calls each factory with the container symbol
5. **Dependency Injection:** Web Components receive services via `@onInitialize`

---

**This architecture demonstrates true Accommodation:**
- ✅ Explicit registration via bootFactory
- ✅ Centralized routing in one RootRouter
- ✅ Parameter passing via HTML attributes
- ✅ Event-driven navigation
- ✅ Full Dependency Injection support
- ✅ Clear data flow with no hidden magic
