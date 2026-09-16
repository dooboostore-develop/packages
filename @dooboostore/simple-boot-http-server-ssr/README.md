# @dooboostore/simple-boot-http-server-ssr

[![NPM version](https://img.shields.io/npm/v/@dooboostore/simple-boot-http-server-ssr.svg?color=cb3837&style=flat-square)](https://www.npmjs.com/package/@dooboostore/simple-boot-http-server-ssr)
[![Build and Test](https://github.com/dooboostore-develop/packages/actions/workflows/main.yaml/badge.svg?branch=main)](https://github.com/dooboostore-develop/packages/actions/workflows/main.yaml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

`@dooboostore/simple-boot-http-server-ssr` provides a powerful **Server-Side Rendering (SSR)** environment by seamlessly integrating `@dooboostore/simple-boot-front` and `@dooboostore/simple-boot-http-server`.

It ships **three interchangeable rendering strategies** as separate `Filter`s, so you pick the one that fits your app instead of being locked into one DOM backend:

| Filter | DOM backend | Instance reuse | Best for |
| --- | --- | --- | --- |
| `SSRFilter` | `jsdom` | Pooled (`min`/`max`, generation-based eviction) | High-traffic apps that want warm instances ready to render |
| `SSRDomParserFilter` | `@dooboostore/dom-parser` (this monorepo's own lightweight, dependency-free DOM) | Fresh window per request | Lower memory footprint, no jsdom dependency; pairs with the AOP-based data-hydration proxy below |
| `SSRLinkDomFilter` | `linkedom` | Fresh window per request | Alternative lightweight DOM backend |
| `SSRSimpleWebComponentFilter` | Real headless **Chromium via Playwright** | New browser context per request (browser instance itself is reused) | Pixel/spec-perfect rendering (declarative Shadow DOM, real browser APIs) for `@dooboostore/simple-web-component` apps, at the cost of spinning up a real browser |

All of them execute your existing frontend code (routing, components, services) on the server and return fully rendered HTML — no separate server-only rendering path to maintain.

---

## 🚀 Key Features

-   **Seamless SSR**: Render your SPA on the server without code modifications to maximize SEO and First Contentful Paint (FCP).
-   **Pluggable DOM backend**: Choose `jsdom`, this monorepo's own `@dooboostore/dom-parser`, `linkedom`, or a real headless Chromium (Playwright) — swap the `Filter` without touching your app code.
-   **Component/Instance Pooling** (`SSRFilter`): Optimize resource management by pooling `jsdom`-backed SSR instances (with `min`/`max` pool size and generation-based stale eviction) to handle concurrent requests efficiently.
-   **Automatic Data Hydration**: `SSRDomParserFilterDataHydrationProxy` transparently wraps `@Sim`-registered service methods — on the server it caches the method's result keyed by `symbol.method(args)`, embeds it in the HTML, and on the client it's read back instead of re-fetching, so hydration requires no manual wiring in your services.
-   **Isomorphic Architecture**: Maintain a single codebase for routing, services, and components shared between server and client.
-   **SWC-native rendering**: `SSRSimpleWebComponentFilter` drives a real Chromium instance via Playwright so `@dooboostore/simple-web-component` apps (declarative Shadow DOM, native Custom Elements) render exactly as they would in a real browser.

---

## 📦 Installation

```bash
pnpm add @dooboostore/simple-boot-http-server-ssr @dooboostore/simple-web-component jsdom
```

---

## 💻 Core Usage

### 1. Universal Bootfactory (bootfactory.ts)
Define a shared function to initialize the application on both server and client.

```typescript
export default (window: Window, urlPath?: string) => {
  // Register components
  register(window, [MyComponent, MyPage]);

  const appElement = window.document.querySelector('#app');
  if (appElement?.connect) {
    const isClient = typeof window !== 'undefined' && window === globalThis.window;
    
    appElement.connect({
      rootRouter: RootRouter,
      path: urlPath ?? '/',
      window,
      // Server renders in 'direct' mode, Client hydrates in 'swap' mode
      connectMode: isClient ? 'swap' : 'direct'
    });
  }
  return appElement;
};
```

### 2. Backend Configuration (SSR Filter)
Add one of the SSR filters to your server configuration. Example using `SSRSimpleWebComponentFilter` (real Chromium via Playwright — requires `pnpm add playwright && npx playwright install chromium`):

```typescript
const swcFilter = new SSRSimpleWebComponentFilter({
  frontDistPath: './dist-client',
  frontDistIndexFileName: 'index.html',
  // registerComponents is deprecated for this filter: Playwright loads your real
  // bundle.js in an actual browser, so Custom Elements register themselves —
  // you don't need to manually bootstrap the app here.
  registerComponents: async (window: any) => {
    bootfactory(window, window.location.pathname);
  }
});

const server = new SimpleBootHttpSSRServer(
  new HttpSSRServerOption({
    filters: [new ResourceFilter('./dist-client'), swcFilter]
  })
);
server.run();
```

If you'd rather not spin up a real browser, use `SSRDomParserFilter` (or `SSRFilter` for `jsdom` with pooling, or `SSRLinkDomFilter` for `linkedom`) instead — same `Filter` interface, no Playwright dependency:

```typescript
const domParserFilter = new SSRDomParserFilter({
  frontDistPath: './dist-client',
  frontDistIndexFileName: 'index.html',
  factorySimFrontOption: (window) => new SimFrontOption({ window /* ... */ }),
  factory: mySimpleBootHttpSSRFactory,
  using: [/* components/pages to register */]
});

const server = new SimpleBootHttpSSRServer(
  new HttpSSRServerOption({
    filters: [new ResourceFilter('./dist-client'), domParserFilter]
  })
);
server.run();
```

---

## 🌊 Data Hydration
`SSRDomParserFilter` pairs with `SSRDomParserFilterDataHydrationProxy` (`@Sim`-injected, wraps `@Sim`-registered service methods) to automate transferring async data from server to client with no manual wiring in your services:

1.  **Server Side**: The first call to a wrapped service method runs normally, then its result is cached via `simpleBootFront.saveDataHydration(key, data)` (`key` = `<service symbol>.<method>(<args>)`) and serialized into the HTML.
2.  **Client Side**: On hydration, the same call is intercepted and `simpleBootFront.cutDataHydration(key)` returns the cached value instead of re-running the (async) call.
3.  **Result**: The client shows the exact data the server already rendered, with no redundant fetch.

`SSRFilter`/`SSRWorker` (the `jsdom`-based filters) use a simpler, manual mechanism instead: whatever you assign onto `window.server_side_data` on the server is serialized as an inline `<script>` and available on `window.server_side_data` on the client.

---

## 📖 Learn More
Check out the detailed guides and tutorials in the `document` folder.
- [SSR Basics & JSDOM Usage](https://github.com/dooboostore-develop/packages/tree/main/simple-boot-http-server-ssr/document/Create%20a%20SSR%20Server%20Application%20Framework/02_chapter1_ssr_basics_jsdom.md)
- [Data Hydration Guide](https://github.com/dooboostore-develop/packages/tree/main/simple-boot-http-server-ssr/document/Create%20a%20SSR%20Server%20Application%20Framework/04_chapter3_data_hydration.md)

---

## License
[MIT License](LICENSE.md)
