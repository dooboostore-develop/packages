# @dooboostore/simple-boot-http-server-ssr

[![NPM version](https://img.shields.io/npm/v/@dooboostore/simple-boot-http-server-ssr.svg?color=cb3837&style=flat-square)](https://www.npmjs.com/package/@dooboostore/simple-boot-http-server-ssr)
[![Build and Test](https://github.com/dooboostore-develop/packages/actions/workflows/main.yaml/badge.svg?branch=main)](https://github.com/dooboostore-develop/packages/actions/workflows/main.yaml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

`@dooboostore/simple-boot-http-server-ssr` provides a powerful **Server-Side Rendering (SSR)** environment by seamlessly integrating `@dooboostore/simple-boot-front` and `@dooboostore/simple-boot-http-server`. 

By utilizing JSDOM, it creates a virtual DOM environment on the server, executing the same frontend code to deliver fully rendered HTML to users instantly.

---

## 🚀 Key Features

-   **Seamless SSR**: Render your SPA on the server without code modifications to maximize SEO and First Contentful Paint (FCP).
-   **JSDOM-based Rendering**: Emulate browser APIs in a Node.js environment to execute frontend components.
-   **Component Pooling**: Optimize resource management by pooling SSR instances to handle concurrent requests efficiently.
-   **Automatic Data Hydration**: Serialize server-fetched data into the HTML, preventing redundant API calls during client-side hydration.
-   **Isomorphic Architecture**: Maintain a single codebase for routing, services, and components shared between server and client.
-   **SWC Optimization**: Dedicated filters for `@dooboostore/simple-web-component` to automate component registration and rendering.

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
Add `SSRSimpleWebComponentFilter` to your server configuration to enable SSR.

```typescript
const swcFilter = new SSRSimpleWebComponentFilter({
  frontDistPath: './dist-client',
  frontDistIndexFileName: 'index.html',
  registerComponents: async (window: any) => {
    // Initialize app in server-side virtual DOM
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

---

## 🌊 Data Hydration
Automate the process of safely transferring async data from server to client.

1.  **Server Side**: Fetches data and embeds it as JSON within the HTML.
2.  **Client Side**: Detects embedded data on load and restores the initial state.
3.  **Result**: Provides a fast UI for users while reducing network load.

---

## 📖 Learn More
Check out the detailed guides and tutorials in the `document` folder.
- [SSR Basics & JSDOM Usage](https://github.com/dooboostore-develop/packages/tree/main/simple-boot-http-server-ssr/document/Create%20a%20SSR%20Server%20Application%20Framework/02_chapter1_ssr_basics_jsdom.md)
- [Data Hydration Guide](https://github.com/dooboostore-develop/packages/tree/main/simple-boot-http-server-ssr/document/Create%20a%20SSR%20Server%20Application%20Framework/04_chapter3_data_hydration.md)

---

## License
[MIT License](LICENSE.md)
