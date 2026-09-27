# 📈 STAY STOCK - Simple Stock Market Platform

A simple, intuitive stock platform example in the style of Toss Securities, built as a modern SPA with a factory-based architecture.

## 🎯 Key Features

- ✅ **Factory Pattern**: explicit DI and factory-based registration
- ✅ **Central Router**: `rootRouterFactory` (`<stock-root-router>`) manages all routes
- ✅ **Declarative Routing**: pattern matching with `@subscribeSwcAppRouteChange`
- ✅ **Dependency Injection**: services injected into a lifecycle method (`@onConnectedBefore` / `@onConnectedAfter`)
- ✅ **Event-driven Navigation**: the header emits `navigate`, the root router routes
- ✅ **Live Simulation**: the detail page price changes every 2 seconds
- ✅ **Responsive Design**: plain CSS

## 🏗️ Project Structure

```
src/
├── index.ts                    # Entry: runs serviceFactories, defineSwcAppBody, connect()
├── index.html                  # <body id="app" is="swc-app-body"><stock-root-router/></body>
├── types/window.d.ts           # Global window typings
├── components/
│   ├── index.ts                # Exports: componentFactories
│   ├── StockHeader.ts          # Sticky header, emits `navigate`
│   └── StockCard.ts            # Stock card component
├── pages/
│   ├── index.ts                # Exports: pageFactories (incl. rootRouterFactory)
│   ├── MainPage.ts             # Dashboard page
│   └── DetailPage.ts           # Stock detail page (@attribute('stock-id'))
└── services/
    ├── index.ts                # Exports: serviceFactories
    └── StockService.ts         # Stock data
```

## 🚀 Getting Started

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm run dev

# Build for production
pnpm run build
```

**Open in browser:** `http://localhost:3000`

## 🏛️ Architecture

### 1. Entry Point (index.ts)
Registers services into the DI container, defines `swc-app-body`, then connects the app. Pages and components are registered lazily:

```typescript
import 'reflect-metadata';
import { defineSwcAppBody, SwcAppInterface } from '@dooboostore/simple-web-component';
import { UrlUtils } from '@dooboostore/core';
import { serviceFactories } from './services';
import { componentFactories } from './components';
import { pageFactories } from './pages';

const w = window;

w.document.addEventListener('DOMContentLoaded', async () => {
  const container = Symbol('container');
  serviceFactories.forEach(it => it(container));
  await defineSwcAppBody(w);

  const appElement = w.document.querySelector('#app') as SwcAppInterface;
  if (appElement) {
    appElement.connect({
      path: UrlUtils.getUrlPath(w.location) ?? '/',
      routeType: 'path',
      onStartedLazyDefineComponent: [...componentFactories, ...pageFactories],
      container,
      window: w
    });
  }
});
```

### 2. Root Router (pages/index.ts)
Central routing hub using `@subscribeSwcAppRouteChange` (simplified):

```typescript
export const rootRouterFactory = (w: Window) => {
  const tagName = 'stock-root-router';
  const existing = w.customElements.get(tagName);
  if (existing) return tagName;

  @elementDefine(tagName, { window: w })
  class RootRouter extends w.HTMLElement {
    private router: Router;
    private stockService: StockService;

    @onConnectedBefore
    onconstructor(@Inject({ symbol: StockService.SYMBOL }) stockService: StockService, router: Router) {
      this.stockService = stockService;
      this.router = router;
    }

    @innerHtmlLight
    @subscribeSwcAppRouteChange(['', '/', '/detail/{id}'])
    routeChanged(routerPathSet: RouterEventType) {
      if (['', '/'].includes(routerPathSet.path)) return `<swc-example-stock-main-page/>`;
      if (routerPathSet.path.startsWith('/detail/'))
        return `<swc-example-stock-detail-page stock-id="${routerPathSet.pathData.id}"/>`;
      // ... 404
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
          :host { display: flex; flex-direction: column; min-height: 100vh; width: 100%; background: #fff; }
          #page-container { flex: 1; display: flex; flex-direction: column; width: 100%; }
        </style>
        <swc-example-stock-stock-header on-navigate="$host.navigate($data.path)"></swc-example-stock-stock-header>
        <main id="page-container"><slot></slot></main>
      `;
    }
  }
  return tagName;
};

export const pageFactories = [MainPage, DetailPage, rootRouterFactory];
```

### 3. Detail Page (pages/DetailPage.ts)
Receives data via an HTML attribute (simplified):

```typescript
export default (w: Window) => {
  const tagName = 'swc-example-stock-detail-page';
  const existing = w.customElements.get(tagName);
  if (existing) return tagName;

  @elementDefine(tagName, { window: w })
  class DetailPage extends w.HTMLElement {
    private stock: Stock | null = null;
    private realTimePrice = 0;
    private timer: any;
    private stockService: StockService;

    @attribute('stock-id')
    stockId: string;

    @onConnectedBefore
    onconstructor(@Inject(StockService.SYMBOL) stockService: StockService) {
      this.stockService = stockService;
      if (this.stockId) {
        this.loadStock(this.stockId);
      }
    }

    private startRealTimeUpdate() {
      this.timer = setInterval(() => {
        this.realTimePrice += (Math.random() - 0.5) * 200;
        this.updatePriceUI();
      }, 2000);
    }

    @innerHtml('#current-price')
    private updatePriceUI() {
      return `${Math.floor(this.realTimePrice).toLocaleString()}`;
    }

    @innerHtml
    @onConnectedBodyShadow
    render() {
      // ...
    }
  }
  return tagName;
};
```

### 4. Component (components/StockHeader.ts)
Navigation via an emitted event:

```typescript
export default (w: Window) => {
  const tagName = 'swc-example-stock-stock-header';
  const existing = w.customElements.get(tagName);
  if (existing) return tagName;

  @elementDefine(tagName, { window: w })
  class StockHeader extends w.HTMLElement {
    @addEventListener('.nav-item, #logo', 'click', { delegate: true })
    @emitCustomEvent('$this', 'navigate', { bubbles: true, attributeName: 'on-navigate' })
    onNavigate(e: any) {
      const target = e.target.closest('[data-path]');
      return { path: target?.dataset.path || '/' };
    }
  }
  return tagName;
};
```

## 📊 Data Flow

```
Services (DI container)
    ↓
index.ts (serviceFactories + connect)
    ↓
stock-root-router (@subscribeSwcAppRouteChange)
    ↓
Pages (receive data via attributes)
    ↓
Components (emit events via @emitCustomEvent / @emitThis)
    ↓
UI Rendering (plain Web Components)
```

## 🔑 Key Patterns

### ⚠️ **CRITICAL: never put @Sim on a class that extends HTMLElement!**

**This applies to every Web Component:**
- ✅ RootRouter
- ✅ Pages (MainPage, DetailPage, ...)
- ✅ Components (StockHeader, StockCard, ...)

Only services use `@Sim`. Web Components use `@elementDefine` only; routing is done with `@subscribeSwcAppRouteChange` on route handler methods.

```typescript
// ✅ CORRECT: Service with @Sim
@Sim({ symbol: StockService.SYMBOL, container })
class StockServiceImp implements StockService { }

// ✅ CORRECT: Web Component with @elementDefine only
@elementDefine(tagName, { window: w })
class DetailPage extends w.HTMLElement {
  @onConnectedBefore
  onconstructor(@Inject(StockService.SYMBOL) service: StockService) { }
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
@subscribeSwcAppRouteChange('/detail/{id}')
@innerHtmlLight
routeMethod(routerPathSet: RouterEventType) {
  return `<component-name stock-id="${routerPathSet.pathData.id}" />`;
}
```

### 4️⃣ **Event Communication**
Header → emit → RootRouter → navigate:

```typescript
// Header emits
@emitThis('navigate', { attributeName: 'on-navigate' })
onNavClick() { return { path: '/detail/123' }; }

// RootRouter binds
<swc-example-stock-stock-header on-navigate="$host.navigate($data.path)"></swc-example-stock-stock-header>

// RootRouter handles
navigate(path: string) { this.router.go(path); }
```

---

**Benefits of this architecture:**
- ✅ Explicit, centralized registration via factories
- ✅ All routing in one RootRouter
- ✅ Parameter passing via HTML attributes
- ✅ Event-driven navigation
- ✅ Full Dependency Injection support
- ✅ Clear data flow with no hidden magic
