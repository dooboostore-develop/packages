# @dooboostore/simple-boot-http-server-ssr

[![NPM version](https://img.shields.io/npm/v/@dooboostore/simple-boot-http-server-ssr.svg?style=flat-square)](https://www.npmjs.com/package/@dooboostore/simple-boot-http-server-ssr)
[![Build and Test](https://github.com/dooboostore-develop/packages/actions/workflows/main.yaml/badge.svg?branch=main)](https://github.com/dooboostore-develop/packages/actions/workflows/main.yaml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

**Full Documentation:** [https://dooboostore-develop.github.io/@dooboostore/simple-boot-http-server-ssr](https://dooboostore-develop.github.io/@dooboostore/simple-boot-http-server-ssr)

A framework for building Server-Side Rendered (SSR) applications by seamlessly integrating `@dooboostore/simple-boot-front` and `@dooboostore/simple-boot-http-server`.

---

## Features

-   **Server-Side Rendering**: Renders your single-page application on the server for fast, SEO-friendly websites.
-   **JSDOM Integration**: Uses `jsdom` to create a virtual DOM environment on the server, allowing front-end code to run.
-   **Component Pooling**: Manages a pool of `SimpleBootFront` instances to handle concurrent SSR requests efficiently.
-   **Automatic Data Hydration**: Serializes data fetched on the server and hydrates it on the client to avoid redundant API calls.
-   **Unified Codebase**: Enables sharing of routing, services, and components between the server and the client.
-   **Intent-based Communication**: Provides a mechanism for client-server communication using custom HTTP headers.
-   **SimpleWebComponent Integration**: Seamless SSR support for `@dooboostore/simple-web-component` with automatic component registration and hydration.

## Quick Start

```bash
npx @dooboostore/create-simple-boot-http-server-ssr my-ssr-app
cd my-ssr-app
npm start
```

---

## SimpleWebComponent SSR Integration

This package enables seamless Server-Side Rendering (SSR) for `@dooboostore/simple-web-component` applications. Here's how it works:

### Backend Setup

Configure the server with `SSRSimpleWebComponentFilter` to handle SWC component registration and rendering:

```typescript
import { SimpleBootHttpSSRServer } from '@dooboostore/simple-boot-http-server-ssr/SimpleBootHttpSSRServer';
import { HttpSSRServerOption } from '@dooboostore/simple-boot-http-server-ssr/option';
import { SSRSimpleWebComponentFilter } from '@dooboostore/simple-boot-http-server-ssr/filters/SSRSimpleWebComponentFilter';
import { ResourceFilter } from '@dooboostore/simple-boot-http-server/filters';
import swcRegister from '@dooboostore/simple-web-component';
import bootfactory from './bootfactory';

const swcFilter = new SSRSimpleWebComponentFilter({
  frontDistPath: './dist-front-end',
  frontDistIndexFileName: 'index.html',
  registerComponents: async (window: any) => {
    // Register SWC components in the virtual DOM
    swcRegister(window);
    const urlPath = window.location.pathname;
    // Initialize your app with bootfactory
    bootfactory(window, urlPath);
  }
});

const server = new SimpleBootHttpSSRServer(
  new HttpSSRServerOption({
    listen: { port: 8080 },
    filters: [new ResourceFilter('./dist-front-end'), swcFilter]
  })
);

server.run();
```

### Universal Bootfactory Pattern

Use a universal bootfactory that runs on both server and client, detecting the environment and choosing the appropriate connection mode:

```typescript
// src/bootfactory.ts
import register from '@dooboostore/simple-web-component';
import { componentFactories } from './components';
import { pageFactories } from './pages';

export default (window: Window, urlPath?: string) => {
  // Register all SWC components
  register(window, [...componentFactories, ...pageFactories]);

  const appElement = window.document.querySelector('#app');
  if (appElement?.connect) {
    const isClientWindow = typeof window !== 'undefined' && window === globalThis.window;
    
    appElement.connect({
      rootRouter: RootRouter.SYMBOL,
      routeType: 'path',
      path: urlPath ?? '/',
      window,
      // Server renders with direct mode, client hydrates with swap mode
      connectMode: isClientWindow ? 'swap' : 'direct'
    });
  }

  return appElement;
};
```

### Client Entry Point

The client-side entry point simply calls the same bootfactory to hydrate the server-rendered markup:

```typescript
// front-end/index.ts
import bootfactory from './bootfactory';
import { UrlUtils } from '@dooboostore/core/url';

console.log('🚀 Hydrating with SwcApplication...');
const w = window;
bootfactory(w, UrlUtils.getUrlPath(w.location));
```

### How It Works

1. **Server Request**: Client sends GET request to `/user/123`
2. **Virtual DOM Rendering**: `SSRSimpleWebComponentFilter` creates a virtual DOM environment via JSDOM
3. **Component Registration**: Your `registerComponents` callback registers all SWC components
4. **Bootfactory Initialization**: Bootfactory connects the app to the root router in **direct mode**
5. **HTML Serialization**: The rendered virtual DOM is serialized to HTML and sent to the client
6. **Client Hydration**: Browser loads the JavaScript and calls bootfactory again in **swap mode**
7. **Zero FOUC**: User sees the fully rendered page immediately; JavaScript takes over seamlessly

### Key Benefits

| Benefit | Description |
|---------|-------------|
| **SEO-Friendly** | Full HTML sent to search engines; all content indexable |
| **Fast FCP** | No "loading..." spinner; page is immediately interactive |
| **Preserved Tags** | Server-rendered DOM tags (data attributes, ARIA labels) remain intact |
| **Code Sharing** | Same routing, services, and components on server and client |
| **Zero FOUC** | Flash of Unstyled Content eliminated; page renders on server first |
| **Progressive Enhancement** | Core content works without JavaScript |

---

## Learn More

The detailed API documentation is available on our documentation website.

## Security Hardening

Use the following baseline controls before deploying SSR applications to production:

- Restrict trusted origins and set strict CORS policy.
- Sanitize any user-derived values injected into HTML templates.
- Set `Content-Security-Policy`, `X-Content-Type-Options`, and `X-Frame-Options` headers.
- Validate and bound request payload size, query parameters, and header length.
- Use secure cookies (`HttpOnly`, `Secure`, `SameSite`) for session-related data.
- Add SSR timeout and concurrency limits to prevent resource exhaustion.
- Keep dependency versions updated and run vulnerability scans in CI.

### Minimal Production Checklist

- HTTPS enforced end-to-end.
- Origin/cookie policy reviewed.
- CSP configured and tested for hydration scripts.
- Error responses avoid leaking stack traces.
- Request logs redact secrets and personal data.
- SSR pool size and queue limits tuned for expected traffic.

## License

This package is licensed under the [MIT License](https://opensource.org/licenses/MIT).
