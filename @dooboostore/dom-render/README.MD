# @dooboostore/dom-render

[![NPM version](https://img.shields.io/npm/v/@dooboostore/dom-render.svg?style=flat-square)](https://www.npmjs.com/package/@dooboostore/dom-render)
[![Build and Test](https://github.com/dooboostore-develop/packages/actions/workflows/main.yaml/badge.svg?branch=main)](https://github.com/dooboostore-develop/packages/actions/workflows/main.yaml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

**Full Documentation:** [https://dooboostore-develop.github.io/packages/dom-render](https://dooboostore-develop.github.io/packages/dom-render)

A powerful and reactive view template engine for fine-grained DOM control and rendering. All internal state is managed through a proxy system for automatic UI updates.

---
## Features

-   **Reactive Templating**: Use simple expressions (`${...}$` and `#{...}#`) directly in your HTML to bind to your data.
-   **Attribute & Style Binding**: Dynamically change attributes, classes, and styles with `dr-attr`, `dr-class`, and `dr-style`.
-   **Control Flow**: Full control over rendering logic with directives like `dr-if`, `dr-for`, and `dr-choose`.
-   **Component-Based Architecture**: Build encapsulated components with `ComponentBase` and use powerful decorators like `@attribute`, `@query`, and `@event` to connect your logic to the template.
-   **Declarative Routing**: Simple and effective routing with `<dr-route-match>` to build single-page applications.
-   **Effortless Form Handling**: Bind forms to your objects with `dr-form` and use a rich set of built-in validators.
-   **Asynchronous Rendering**: Handle promises declaratively in your template with `<dr-promise-switch>`.

## Installation

```bash
# pnpm
pnpm add @dooboostore/dom-render

# npm
npm install @dooboostore/dom-render

# yarn
yarn add @dooboostore/dom-render
```

## Learn More

The detailed API documentation, including all directives, components, and usage examples, is available on our documentation website.

**[Explore the full @dooboostore/dom-render documentation &raquo;](https://dooboostore-develop.github.io/packages/dom-render)**

## License

This package is licensed under the [MIT License](https://opensource.org/licenses/MIT).
