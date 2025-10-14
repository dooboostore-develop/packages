# @dooboostore/core-node

[![NPM version](https://img.shields.io/npm/v/@dooboostore/core-node.svg?style=flat-square)](https://www.npmjs.com/package/@dooboostore/core-node)
[![Build and Test](https://github.com/dooboostore-develop/packages/actions/workflows/main.yaml/badge.svg?branch=main)](https://github.com/dooboostore-develop/packages/actions/workflows/main.yaml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

**Full Documentation:** [https://dooboostore-develop.github.io/@dooboostore/core-node](https://dooboostore-develop.github.io/@dooboostore/core-node)

`@dooboostore/core-node` is a companion library to `@dooboostore/core`, providing utility functions and classes specifically for the Node.js environment. It extends the core functionalities with features that interact with the file system and Node.js processes.

---

## Features

-   **File System Utilities**: A robust `File` class and helper functions for common file operations like writing, moving, renaming, and copying.
-   **Buffer Conversion**: Extends the core `ConvertUtils` for handling `Buffer` conversions, including Base64 decoding.
-   **Node.js Specific**: Designed to work seamlessly within the Node.js runtime.

## Installation

Install `@dooboostore/core-node` using your favorite package manager:

```bash
# pnpm
pnpm add @dooboostore/core-node

# npm
npm install @dooboostore/core-node

# yarn
yarn add @dooboostore/core-node
```

## Peer Dependencies

This package requires `@dooboostore/core` to be installed.

## Learn More

The detailed API documentation, including all modules and usage examples, is available on our documentation website.

## License

This package is licensed under the [MIT License](https://opensource.org/licenses/MIT).