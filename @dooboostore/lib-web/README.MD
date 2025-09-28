# @dooboostore/lib-web

[![NPM version](https://img.shields.io/npm/v/@dooboostore/lib-web.svg?style=flat-square)](https://www.npmjs.com/package/@dooboostore/lib-web)
[![Build and Test](https://github.com/dooboostore-develop/packages/actions/workflows/main.yaml/badge.svg?branch=main)](https://github.com/dooboostore-develop/packages/actions/workflows/main.yaml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

**Full Documentation:** [https://dooboostore-develop.github.io/packages/lib-web](https://dooboostore-develop.github.io/packages/lib-web)

A library of advanced, canvas-based components for web applications.

---

## Features

-   **Image Editor (`ImageEditorCanvas`)**:
    -   A multi-layer image editor.
    -   Add and manipulate images, text, and various shapes (rectangles, circles, stars, hearts, etc.).
    -   Layers can be moved, resized, rotated, flipped, and reordered (z-index).
    -   Features for polygonal cropping and erasing parts of layers.
    -   Undo/Redo history management.
    -   Export the final composition as a single image.

-   **GPS Marker Map (`GpsMarkerCanvas`)**:
    -   Display GPS points and paths on an interactive canvas map.
    -   Supports panning and zooming.
    -   Option to use Mercator projection for more accurate map representation.
    -   Customizable markers (images or colors) and paths.

-   **Image Cropper (`ImageCropCanvas`)**:
    -   Load an image and draw a freeform polygon to crop it.
    -   Exports the cropped area as a new image.

## Installation

```bash
# pnpm
pnpm add @dooboostore/lib-web

# npm
npm install @dooboostore/lib-web

# yarn
yarn add @dooboostore/lib-web
```

## Learn More

The detailed API documentation for each component is available on our documentation website.

**[Explore the full @dooboostore/lib-web documentation &raquo;](https://dooboostore-develop.github.io/packages/lib-web)**

## License

This package is licensed under the [MIT License](https://opensource.org/licenses/MIT).