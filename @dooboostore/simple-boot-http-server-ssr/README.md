# @dooboostore/simple-boot-http-server-ssr

[![NPM version](https://img.shields.io/npm/v/@dooboostore/simple-boot-http-server-ssr.svg?color=cb3837&style=flat-square)](https://www.npmjs.com/package/@dooboostore/simple-boot-http-server-ssr)
[![Build and Test](https://github.com/dooboostore-develop/packages/actions/workflows/main.yaml/badge.svg?branch=main)](https://github.com/dooboostore-develop/packages/actions/workflows/main.yaml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

`@dooboostore/simple-boot-http-server-ssr` provides a powerful **Server-Side Rendering (SSR)** environment by seamlessly integrating `@dooboostore/simple-boot-front` and `@dooboostore/simple-boot-http-server`.

It ships **five interchangeable rendering strategies** as separate `Filter`s, so you pick the one that fits your app instead of being locked into one DOM backend:

| Filter | DOM backend | Instance reuse | Best for |
| --- | --- | --- | --- |
| `SSRFilter` | `jsdom` | Pooled (`min`/`max`, generation-based eviction) | High-traffic apps that want warm instances ready to render |
| `SSRDomParserFilter` | `@dooboostore/dom-parser` (this monorepo's own lightweight, dependency-free DOM) | Fresh window per request | Lower memory footprint, no jsdom dependency; pairs with the AOP-based data-hydration proxy below |
| `SSRLinkDomFilter` | `linkedom` | Pooled (`poolOption` `min`/`max`, generation-based eviction) | Alternative lightweight DOM backend |
| `SSRSimpleWebComponentDomParserFilter` | `@dooboostore/dom-parser` | Fresh window per request | `@dooboostore/simple-web-component` apps without a browser; `intentServices` injection and SWC `@property` hydration (below) |
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
pnpm add @dooboostore/simple-boot-http-server-ssr reflect-metadata
# jsdom, linkedom, and playwright are regular dependencies; for SSRSimpleWebComponentFilter also run:
npx playwright install chromium
```

---

## 💻 Core Usage

### 1. Universal Bootfactory (bootfactory.ts)
Define a shared function to initialize the SWC app on both server and client.

```typescript
import swcRegister, { type SwcAppInterface } from '@dooboostore/simple-web-component';

export default async (window: Window, otherInstanceSim?: Map<symbol, any>, urlPath?: string) => {
  // Register the built-in SWC elements (swc-app, ...) on this window
  await swcRegister(window);

  const app = window.document.querySelector('#app') as SwcAppInterface;
  await app.connect({
    window,
    path: urlPath ?? '/',
    routeType: 'path',
    otherInstanceSim, // e.g. the `sim` Map from registerComponents
    onStartedLazyDefineComponent: [/* component/page factories */]
  });
  return { app };
};
```

### 2. Backend Configuration (SSR Filter)
Add one of the SSR filters to your server configuration. Example using `SSRSimpleWebComponentDomParserFilter`:

```typescript
const ssrFilter = new SSRSimpleWebComponentDomParserFilter({
  frontDistPath: './dist-client',
  frontDistIndexFileName: 'index.html',
  // Services exposed to SSR: each request gets them with its own `rr` injected, passed as `sim`
  intentServices: [/* SimConfig items with a symbol */],
  registerComponents: async (window: any, rr: RequestResponse, sim: Map<symbol, any>) => {
    const { app } = await bootfactory(window, sim, UrlUtils.getUrlPath(window.location));
    return app; // returning the SwcAppInterface enables @property hydration
  },
  ssrExcludeFilter: rr => /\.(js|css|map|ico|png|json)$/.test(rr.reqUrlPathName)
});

const server = new SimpleBootHttpSSRServer(
  new HttpSSRServerOption({
    listen: { port: 8080 },
    filters: [new ResourceFilter('./dist-client', ['/bundle.js', /\.map$/]), ssrFilter]
  })
);
server.run();
```

`SSRSimpleWebComponentFilter` (real Chromium via Playwright) takes the same `frontDistPath` / `frontDistIndexFileName` / `ssrExcludeFilter` plus `playwright: { waitUntil, waitForSelector, waitForTimeout, timeout, ignoreTags }`. Playwright loads your real bundle, so Custom Elements register themselves and `registerComponents` is usually unnecessary.

For `@dooboostore/simple-boot-front` apps, use `SSRDomParserFilter` (or `SSRFilter` for `jsdom` / `SSRLinkDomFilter` for `linkedom`, both pooled via `poolOption: { min, max, clearIntervalTime? }`) — same `Filter` interface:

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

### SWC `@property` hydration (`SSRSimpleWebComponentDomParserFilter`)

1. `registerComponents` returns the `SwcAppInterface` (host + `connectedElements()`).
2. `@property` metadata is collected from the host and connected elements into
   `{ sel, prop, value }` items (`sel` = `[swc-use-ssr="<id>"]`, JSON-serializable values only).
3. Embedded as a `<script>` that runs before the bundle: finds each node with
   `querySelector` and sets `el[prop] = value`.
4. The JSON is escaped for inline scripts (`<` → `\u003c`, U+2028/U+2029), so a value
   containing `</script>` can't break out of the tag. `JSON.parse` restores it exactly.
5. Works because a custom element keeps own properties set **before** `customElements.define` —
   the upgrade doesn't reset them. Declare hydrated fields with `declare` (see the SWC README).

---

## 📖 Learn More
Check out the detailed guides and tutorials in the `document` folder.
- [SSR Basics & JSDOM Usage](https://github.com/dooboostore-develop/packages/tree/main/@dooboostore/simple-boot-http-server-ssr/document/Create%20a%20SSR%20Server%20Application%20Framework/02_chapter1_ssr_basics_jsdom.md)
- [Data Hydration Guide](https://github.com/dooboostore-develop/packages/tree/main/@dooboostore/simple-boot-http-server-ssr/document/Create%20a%20SSR%20Server%20Application%20Framework/04_chapter3_data_hydration.md)

---

## License
[MIT License](LICENSE.md)
