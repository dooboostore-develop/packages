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

## Quick Start

```bash
npx @dooboostore/create-simple-boot-http-server-ssr my-ssr-app
cd my-ssr-app
npm start
```

## Learn More

The detailed API documentation is available on our documentation website.

## License

This package is licensed under the [MIT License](https://opensource.org/licenses/MIT).
