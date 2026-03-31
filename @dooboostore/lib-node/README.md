# @dooboostore/lib-node

[![NPM version](https://img.shields.io/npm/v/@dooboostore/lib-node.svg?color=cb3837&style=flat-square)](https://www.npmjs.com/package/@dooboostore/lib-node)
[![Build and Test](https://github.com/dooboostore-develop/packages/actions/workflows/main.yaml/badge.svg?branch=main)](https://github.com/dooboostore-develop/packages/actions/workflows/main.yaml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)


A Node.js utility package for generating random placeholder images using server-side canvas.

---

## Features

- Generate random image compositions with shapes (`circle`, `rectangle`, `triangle`, `star`).
- Export as `Buffer` for direct upload/response pipelines.
- Export as Base64 data URL for inline preview use cases.
- Save output to disk with sync or async file APIs.
- Root-first and `bundle-entry` import support.

## Installation

```bash
# pnpm
pnpm add @dooboostore/lib-node

# npm
npm install @dooboostore/lib-node

# yarn
yarn add @dooboostore/lib-node
```

## Public API

`@dooboostore/lib-node` exposes:

- `RandomImage`

## Import Guide

### Root import (recommended)

```typescript
import { RandomImage } from '@dooboostore/lib-node';
```

### Bundle entry import

```typescript
import { RandomImage } from '@dooboostore/lib-node/bundle-entry';
```

## Basic Usage

```typescript
import { RandomImage } from '@dooboostore/lib-node';
import * as path from 'path';

async function generateImage() {
  const randomImage = new RandomImage();
  const filePath = path.join(__dirname, 'my-random-image.png');

  await randomImage.writeFile({
    path: filePath,
    size: { w: 200, h: 200 },
    mimeType: 'image/png'
  });

  console.log(`Image saved to ${filePath}`);
}

generateImage();
```

## API Reference

### `RandomImage`

#### `buffer(config)`

Returns image bytes as `Buffer`.

```typescript
const image = new RandomImage();
const buffer = image.buffer({
  size: { w: 400, h: 240 },
  mimeType: 'image/png'
});
```

#### `base64(config)`

Returns a Base64 data URL string.

```typescript
const image = new RandomImage();
const base64 = image.base64({
  size: { w: 300, h: 300 },
  mimeType: 'image/jpeg',
  quality: 0.9
});
```

#### `writeFile(config)`

Writes image to disk asynchronously.

```typescript
await new RandomImage().writeFile({
  path: './out/random-image.png',
  size: { w: 512, h: 512 },
  mimeType: 'image/png'
});
```

#### `writeFileSync(config)`

Writes image to disk synchronously.

```typescript
new RandomImage().writeFileSync({
  path: './out/random-sync.jpg',
  size: { w: 256, h: 256 },
  mimeType: 'image/jpeg'
});
```

## Configuration Shape

All methods use a variant of this config:

```typescript
{
  size: { w: number; h: number; },
  mimeType?: 'image/png' | 'image/jpeg',
  quality?: number,        // only for jpeg base64 output
  path?: string            // required for writeFile/writeFileSync
}
```

## Typical Use Cases

- Generating placeholder images for test fixtures.
- Producing random thumbnails for QA/demo data.
- Returning generated image data from Node HTTP endpoints.
- Batch image generation in scripts.

## Troubleshooting

**Issue:** `canvas` install/build fails on CI or local machine  
**Solution:** install platform build dependencies required by `canvas` before package install.

**Issue:** Output looks too compressed in JPEG mode  
**Solution:** raise `quality` value in `base64({ mimeType: 'image/jpeg', quality })`.

**Issue:** File write fails with ENOENT  
**Solution:** create parent directories before calling `writeFile`/`writeFileSync`.

## Learn More

The detailed API documentation is available on our documentation website.

## Related Packages

- [@dooboostore/core](https://www.npmjs.com/package/@dooboostore/core)
- [@dooboostore/core-node](https://www.npmjs.com/package/@dooboostore/core-node)
- [@dooboostore/lib-web](https://www.npmjs.com/package/@dooboostore/lib-web)

## License

This package is licensed under the [MIT License](https://opensource.org/licenses/MIT).
