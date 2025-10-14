# @dooboostore/simple-boot-front

[![NPM version](https://img.shields.io/npm/v/@dooboostore/simple-boot-front.svg?style=flat-square)](https://www.npmjs.com/package/@dooboostore/simple-boot-front)
[![Build and Test](https://github.com/dooboostore-develop/packages/actions/workflows/main.yaml/badge.svg?branch=main)](https://github.com/dooboostore-develop/packages/actions/workflows/main.yaml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

**Full Documentation:** [https://dooboostore-develop.github.io/@dooboostore/simple-boot-front](https://dooboostore-develop.github.io/@dooboostore/simple-boot-front)

A component-based framework for building fast and modern Single Page Applications (SPAs), built on top of `@dooboostore/simple-boot` and `@dooboostore/dom-render`.

---

## Features

-   **Component-Based Architecture**: Define reusable UI components with the `@Component` decorator, complete with their own templates and styles.
-   **Declarative Routing**: A simple and powerful routing system using the `@Router` decorator to map URLs to components.
-   **Dependency Injection**: Built-in DI container from `@dooboostore/simple-boot` to manage your components and services.
-   **Lifecycle Hooks**: Tap into component lifecycle events like `@PostConstruct` for fine-grained control.
-   **Global Scripts**: Create injectable helper functions (e.g., for i18n) with the `@Script` decorator that can be used directly in your templates.
-   **Extensible**: Leverages the AOP and Exception Handling capabilities of `@dooboostore/simple-boot`.

## Quick Start

```bash
npx @dooboostore/create-simple-boot-front my-app
cd my-app
npm start
```

## Learn More

The detailed API documentation, including all decorators and usage examples, is available on our documentation website.

## License

This package is licensed under the [MIT License](https://opensource.org/licenses/MIT).