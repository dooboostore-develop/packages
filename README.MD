# @dooboostore

[![Build and Test](https://github.com/dooboostore-develop/packages/actions/workflows/main.yaml/badge.svg?branch=main)](https://github.com/dooboostore-develop/packages/actions/workflows/main.yaml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

**The Modern Framework for Web Applications**

This repository is the home for a collection of packages that constitute the `@dooboostore` ecosystem. It's a comprehensive framework designed for building modern, full-stack web applications with ease and efficiency.

---

## Why @dooboostore?

- **Modular Architecture:** Build your applications with a set of cohesive, independent packages. Use only what you need.
- **Full-Stack Solution:** From core utilities to frontend rendering and backend servers, `@dooboostore` provides a complete development experience.
- **TypeScript First:** Written entirely in TypeScript to ensure type safety and improve developer productivity.
- **Extensible:** Designed with extensibility in mind, allowing you to customize and build upon the core framework.

## Packages

This repository is a monorepo containing the following packages:

| Package                                                                 | Description                                                             |
|-------------------------------------------------------------------------|-------------------------------------------------------------------------|
| [core](@dooboostore/core)                                               | Foundational utility library for all other packages.                    |
| [core-node](@dooboostore/core-node)                                     | Node.js-specific utilities extending the core package.                  |
| [core-web](@dooboostore/core-web)                                       | Web-specific utilities for browser environments.                        |
| [dom-render](@dooboostore/dom-render)                                   | A powerful view template engine for DOM manipulation and rendering.     |
| [simple-boot](@dooboostore/simple-boot)                                 | The core framework for dependency injection, AOP, and routing.          |
| [simple-boot-front](@dooboostore/simple-boot-front)                     | A Single Page Application (SPA) framework built on `simple-boot`.       |
| [simple-boot-http-server](@dooboostore/simple-boot-http-server)         | An HTTP web server framework.                                           |
| [simple-boot-http-server-ssr](@dooboostore/simple-boot-http-server-ssr) | Server-Side Rendering (SSR) extension for the HTTP server.              |
| [swt](@dooboostore/swt)                                                 | (Description for swt to be added)                                       |
| [app-system](@dooboostore/app-system)                                   | A comprehensive framework for building single-page applications (SPAs). |

## Getting Started

Each package is individually documented. Click on the package names in the table above to explore their specific documentation and examples.

## Contribution

Contributions are welcome! Please read our contributing guidelines to get started. (A `CONTRIBUTING.md` file can be added later).

## License

All packages in this repository are licensed under the [MIT License](https://opensource.org/licenses/MIT).