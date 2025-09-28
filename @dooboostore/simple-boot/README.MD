# @dooboostore/simple-boot

[![NPM version](https://img.shields.io/npm/v/@dooboostore/simple-boot.svg?style=flat-square)](https://www.npmjs.com/package/@dooboostore/simple-boot)
[![Build and Test](https://github.com/dooboostore-develop/packages/actions/workflows/main.yaml/badge.svg?branch=main)](https://github.com/dooboostore-develop/packages/actions/workflows/main.yaml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

**Full Documentation:** [https://dooboostore-develop.github.io/packages/simple-boot](https://dooboostore-develop.github.io/packages/simple-boot)

A powerful and flexible framework for backend and service development, providing dependency injection, AOP, routing, and more.

---

## Features

-   **Dependency Injection**: Manage your application's objects with a powerful DI container using the `@Sim` decorator. Supports singleton and transient lifecycles.
-   **Aspect-Oriented Programming (AOP)**: Intercept method calls with `@Before`, `@After`, and `@Around` decorators to handle cross-cutting concerns like logging and transactions.
-   **Powerful Exception Handling**: Use `@ExceptionHandler` to create robust local and global error handling strategies.
-   **Flexible Routing System**: Map URL paths to classes or methods with `@Router` and `@Route` decorators, including support for path variables.
-   **Intent-based Event System**: Decouple your application's components with a simple and effective publish-subscribe event system.
-   **Method-level Caching**: Easily cache the results of expensive methods with the `@Cache` decorator, including TTL and dynamic key support.
-   **Data Validation**: Ensure data integrity with the `@Validation` decorator and a suite of built-in validation rules.

## Quick Start

```bash
npm install @dooboostore/simple-boot my-project
```

## Learn More

The detailed API documentation, including all decorators and usage examples, is available on our documentation website.

**[Explore the full @dooboostore/simple-boot documentation &raquo;](https://dooboostore-develop.github.io/packages/simple-boot)**

## License

This package is licensed under the [MIT License](https://opensource.org/licenses/MIT).
