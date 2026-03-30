# @dooboostore/lib-web

[![NPM version](https://img.shields.io/npm/v/@dooboostore/lib-web.svg?style=flat-square)](https://www.npmjs.com/package/@dooboostore/lib-web)
[![Build and Test](https://github.com/dooboostore-develop/packages/actions/workflows/main.yaml/badge.svg?branch=main)](https://github.com/dooboostore-develop/packages/actions/workflows/main.yaml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

**Full Documentation:** [https://dooboostore-develop.github.io/@dooboostore/lib-web](https://dooboostore-develop.github.io/@dooboostore/lib-web)

Canvas-centered UI components for building rich browser editors and map-like visual tools.

---

## Features

- **ImageEditorCanvas**: multi-layer canvas editor with object transform, ordering, and export.
- **GpsMarkerCanvas**: route/point visualization canvas with pan and zoom.
- **ImageCropCanvas**: polygon crop workflow for image trimming.
- **Root-first exports**: consume all public APIs from package root.
- **Bundle entry support**: dedicated `./bundle-entry` subpath for bundlers or UMD/ESM interop workflows.

## Public API

`@dooboostore/lib-web` root currently exposes:

- `ImageEditorCanvas`
- `GpsMarkerCanvas`
- `ImageCropCanvas`

## Import Guide

### Root import (recommended)

```typescript
import { ImageEditorCanvas, GpsMarkerCanvas, ImageCropCanvas } from '@dooboostore/lib-web';
```

### Bundle entry import

```typescript
import { ImageEditorCanvas } from '@dooboostore/lib-web/bundle-entry';
```

### Namespace access from bundle entry

```typescript
import { LibWebModule } from '@dooboostore/lib-web/bundle-entry';

const editor = new LibWebModule.ImageEditorCanvas(/* ... */);
```

## Installation

```bash
# pnpm
pnpm add @dooboostore/lib-web

# npm
npm install @dooboostore/lib-web

# yarn
yarn add @dooboostore/lib-web
```

## Quick Start

### Image editor

```typescript
import { ImageEditorCanvas } from '@dooboostore/lib-web';

const editor = new ImageEditorCanvas({
    target: document.getElementById('app') as HTMLElement,
    width: 1024,
    height: 768
});

// Typical operations vary by app implementation:
// - add image/text/shape layers
// - update position/scale/rotation
// - export final image
```

### GPS marker map

```typescript
import { GpsMarkerCanvas } from '@dooboostore/lib-web';

const map = new GpsMarkerCanvas({
    target: document.getElementById('map') as HTMLElement,
    width: 800,
    height: 600
});

// Render points and tracks, then support zoom/pan interactions.
```

### Image crop

```typescript
import { ImageCropCanvas } from '@dooboostore/lib-web';

const cropper = new ImageCropCanvas({
    target: document.getElementById('crop') as HTMLElement
});

// Load image, draw polygon region, export cropped result.
```

## Best Practices

- Keep canvas dimensions explicit for stable rendering quality.
- Debounce high-frequency pointer events in host application state updates.
- Export from finalized state rather than per-frame snapshots.
- Use root import paths (`@dooboostore/lib-web`) as default; keep deep imports internal.

## Troubleshooting

**Issue:** Blurry canvas output on high-DPI displays  
**Solution:** align canvas internal size with device pixel ratio and scale drawing context.

**Issue:** Slow interaction with many objects  
**Solution:** reduce redraw region, batch operations, and disable expensive effects while dragging.

**Issue:** Import path errors in consumers  
**Solution:** use root path or `@dooboostore/lib-web/bundle-entry`, not internal source paths.

## Learn More

The detailed API documentation for each component is available on our documentation website.

## Related Packages

- [@dooboostore/core](https://www.npmjs.com/package/@dooboostore/core)
- [@dooboostore/core-web](https://www.npmjs.com/package/@dooboostore/core-web)
- [@dooboostore/dom-render](https://www.npmjs.com/package/@dooboostore/dom-render)

## License

This package is licensed under the [MIT License](https://opensource.org/licenses/MIT).