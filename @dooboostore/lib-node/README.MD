# @dooboostore/lib-node

[![NPM version](https://img.shields.io/npm/v/@dooboostore/lib-node.svg?style=flat-square)](https://www.npmjs.com/package/@dooboostore/lib-node)
[![Build and Test](https://github.com/dooboostore-develop/packages/actions/workflows/main.yaml/badge.svg?branch=main)](https://github.com/dooboostore-develop/packages/actions/workflows/main.yaml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

**Full Documentation:** [https://dooboostore-develop.github.io/packages/lib-node](https://dooboostore-develop.github.io/packages/lib-node)

A Node.js library for generating random placeholder images.

---

## Features

-   **Generate Placeholder Images**: Create images of a specified size with random background colors.
-   **Custom Text**: Add custom text to the generated images, which is automatically centered.
-   **Save to File**: Save the generated image as a PNG file.
-   **Uses `canvas`**: Built on top of the powerful `canvas` library for server-side image generation.

## Installation

```bash
# pnpm
pnpm add @dooboostore/lib-node

# npm
npm install @dooboostore/lib-node

# yarn
yarn add @dooboostore/lib-node
```

## Basic Usage

```typescript
import { RandomImage } from '@dooboostore/lib-node';
import * as path from 'path';

async function generateImage() {
  const randomImage = new RandomImage();
  const filePath = path.join(__dirname, 'my-random-image.png');

  await randomImage.generate(200, 200, 'Hello, Node!', filePath);

  console.log(`Image saved to ${filePath}`);
}

generateImage();
```

## Learn More

The detailed API documentation is available on our documentation website.

**[Explore the full @dooboostore/lib-node documentation &raquo;](https://dooboostore-develop.github.io/packages/lib-node)**

## License

This package is licensed under the [MIT License](https://opensource.org/licenses/MIT).
