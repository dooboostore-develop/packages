# @dooboostore/simple-boot-http-server

[![NPM version](https://img.shields.io/npm/v/@dooboostore/simple-boot-http-server.svg?style=flat-square)](https://www.npmjs.com/package/@dooboostore/simple-boot-http-server)
[![Build and Test](https://github.com/dooboostore-develop/packages/actions/workflows/main.yaml/badge.svg?branch=main)](https://github.com/dooboostore-develop/packages/actions/workflows/main.yaml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

**Full Documentation:** [https://dooboostore-develop.github.io/packages/simple-boot-http-server](https://dooboostore-develop.github.io/packages/simple-boot-http-server)

A lightweight and powerful HTTP web server framework for Node.js, built on `@dooboostore/simple-boot`.

---

## Features

-   **Declarative Routing**: Use decorators like `@Router`, `@Route`, `@GET`, `@POST`, etc., to map URL paths and HTTP methods directly to your controller methods.
-   **Middleware via Filters**: Intercept the request-response cycle with `Filter` classes to implement cross-cutting concerns like logging, authentication, and CORS.
-   **Lifecycle Endpoints**: Hook into the request lifecycle with `EndPoint` classes that run on request start, close, or error.
-   **Integrated Exception Handling**: Leverage `@simple-boot`'s AOP capabilities to create robust global error handlers.
-   **Built-in Session Management**: Easily manage user sessions with a built-in session manager and customizable storage.
-   **HTTPS and HTTP/2 Support**: Secure your server with HTTPS and HTTP/2 configuration.

## Quick Start

```bash
npx @dooboostore/create-simple-boot-http-server my-server
cd my-server
npm start
```

## Learn More

The detailed API documentation, including all decorators and usage examples, is available on our documentation website.

**[Explore the full @dooboostore/simple-boot-http-server documentation &raquo;](https://dooboostore-develop.github.io/packages/simple-boot-http-server)**

## License

This package is licensed under the [MIT License](https://opensource.org/licenses/MIT).