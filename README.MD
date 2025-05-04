# @dooboostore Packages
====

This repository contains a collection of packages that form the @dooboostore ecosystem, a comprehensive framework for building modern web applications. These packages work together to provide a complete solution for frontend and backend development.

## Package Overview

### Core Utilities

- [core](%40dooboostore/core) - A comprehensive utility library with modules for array manipulation, date handling, entity management, promise utilities, string utilities, validation, and more. This serves as the foundation for all other packages.

- [core-node](%40dooboostore/core-node) - Node.js-specific utilities that extend the core package functionality with file system operations, process management, and data conversion utilities.

- [core-web](%40dooboostore/core-web) - Web-specific utilities that extend the core package functionality with browser-related utilities such as DOM manipulation, cookie handling, storage, animation, clipboard, and window management.

### Rendering and UI

- [dom-render](%40dooboostore/dom-render) - A view template engine for DOM control, rendering, and management. It uses a proxy-based approach to manage internal variables and provides features like expression syntax, attribute binding, style handling, and component lifecycle hooks.

- [app-system](%40dooboostore/app-system) - A comprehensive framework for building single-page applications (SPAs). It provides a collection of utilities, services, and components including ApiService for HTTP requests, alert system, UI components, proxy system, and state management.

### Application Framework

- [simple-boot](%40dooboostore/simple-boot) - A core framework that provides object management with dependency injection, aspect-oriented programming, exception handling, router system, and intent event system.

- [simple-boot-front](%40dooboostore/simple-boot-front) - A Single Page Application (SPA) framework for web development built on top of simple-boot-core and dom-render. It provides a component-based architecture, routing system, and template system.

### Server Framework

- [simple-boot-http-server](%40dooboostore/simple-boot-http-server) - An HTTP web server framework built on top of simple-boot-core. It provides URL and method mapping, filters for request/response processing, endpoints for handling requests, and exception handling.

- [simple-boot-http-server-ssr](%40dooboostore/simple-boot-http-server-ssr) - A server-side rendering (SSR) extension for the simple-boot-http-server package that combines simple-boot-front and simple-boot-http-server to render frontend components on the server side.

## Dependencies

The packages have dependencies on each other, forming a layered architecture:

1. `core` is the foundation with no dependencies on other @dooboostore packages
2. `core-node` and `core-web` depend on `core`
3. `dom-render` depends on `core-web`
4. `simple-boot` has no dependencies on other @dooboostore packages
5. `simple-boot-front` depends on `simple-boot` and `dom-render`
6. `simple-boot-http-server` depends on `simple-boot`
7. `simple-boot-http-server-ssr` depends on `simple-boot-front` and `simple-boot-http-server`
8. `app-system` depends on all other packages

## Getting Started

Each package has its own documentation and examples. Click on the package links above to learn more about each one.

## License

All packages are licensed under the MIT License.
