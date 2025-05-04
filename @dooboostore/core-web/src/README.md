# @dooboostore/core-web

`@dooboostore/core-web` is a specialized utility library for web-based projects, designed to work on top of `@dooboostore/core`. It provides a rich set of tools for interacting with the DOM, browser APIs, and managing web-specific resources.

## Features

- **DOM & Element Manipulation**: Comprehensive utilities for querying the DOM, manipulating nodes, and managing attributes and styles.
- **Browser APIs**: Easy-to-use wrappers for browser features like Clipboard, `localStorage`, `sessionStorage`, and Cookies.
- **Asynchronous Resource Loading**: Functions to asynchronously load images, audio, scripts, and stylesheets.
- **Event Handling**: Helpers to create `Observable` streams from DOM and window events.
- **Animation Utilities**: Tools for working with `requestAnimationFrame` to create smooth animations and monitor FPS.
- **Web-Specific Conversions**: Advanced converters for handling `File`, `Blob`, `ImageBitmap`, `Canvas`, and Base64 data URLs.
- **Environment Validation**: Functions to detect the browser environment, in-app browsers (like KakaoTalk, Naver), and specific mobile webviews.

## Installation

```bash
# Using pnpm
pnpm add @dooboostore/core-web

# Using npm
npm install @dooboostore/core-web

# Using yarn
yarn add @dooboostore/core-web
```

## Peer Dependencies

This package requires `@dooboostore/core` and `rxjs` to be installed as peer dependencies.

```json
"peerDependencies": {
  "@dooboostore/core": "workspace:*",
  "rxjs": "^7.8.2"
}
```

## Modules Overview

### Animation

- **`AnimationFrameUtils`**: Provides functions to work with `requestAnimationFrame`, including an `fps` utility to measure frame rates and `dividePerFpsObservable` to create animation loops that adapt to the display's refresh rate.

### Browser APIs

- **`ClipBoardUtils`**: Simplifies interaction with the Clipboard API for reading and writing text and other data.
- **`CookieUtils`**: A set of helpers to get, set, and remove browser cookies with detailed options (`expires`, `path`, `domain`, etc.).
- **`StorageUtils`**: Wrappers for `localStorage` and `sessionStorage` to easily get, set, remove, and parse JSON items.
- **`LocationUtils`**: A class to parse URL components like the path, hash, and query parameters from `window.location`.

### DOM & Elements

- **`DomUtils`**: Static methods to query elements, manage attributes, and read styles.
- **`NodeUtils`**: Helpers for low-level DOM node manipulation like appending, replacing, and removing child nodes.
- **`ElementUtils`**: Functions to asynchronously load resources like `HTMLImageElement`, `ImageBitmap`, and `HTMLAudioElement`.
- **`DocumentUtils`**: Utilities for interacting with the `document` object, such as creating event observables.
- **`EventUtils`**: A generic helper to create an `Observable` from any `HTMLElement` event.
- **`WindowUtils`**: A helper to create an `Observable` from any `window` event.

### Web-Specific Utilities

- **`ConvertUtils`**: Extends the core `ConvertUtils` with powerful browser-specific converters for:
  - `File` / `Blob` to Object URL.
  - `ImageBitmap`, `Canvas`, `HTMLImageElement` to `Blob` or Base64 data URL.
  - Image compression utilities.
- **`ScriptUtils`**: Dynamically load external JavaScript and CSS files or inject inline scripts into the document.
- **`ValidUtils`**: Extends the core `ValidUtils` with browser-specific checks:
  - `isBrowser()`: Detects if the code is running in a browser.
  - `isSocialNetworkServiceInappBrowser()`: Checks for in-app browsers of popular social networks.
  - `isWkWebview()` / `isAndroidWebview()`: Detects iOS and Android webviews.

## Basic Usage

### StorageUtils

```typescript
import { StorageUtils } from '@dooboostore/core-web/storage/StorageUtils';

// Save an object to localStorage
const user = { id: 1, name: 'John Doe' };
StorageUtils.setLocalStorageItem('currentUser', user, window);

// Retrieve and parse the object
const savedUser = StorageUtils.getLocalStorageJsonItem<{ id: number, name: string }>('currentUser', window);
console.log(savedUser?.name); // "John Doe"

// Remove the item
StorageUtils.removeLocalStorageItem('currentUser', window);
```

### ClipBoardUtils

```typescript
import { ClipBoardUtils } from '@dooboostore/core-web/clipboard/ClipBoardUtils';

async function copyToClipboard(text: string) {
  try {
    await ClipBoardUtils.writeText(text, window);
    console.log('Text copied successfully!');
  } catch (err) {
    console.error('Failed to copy text: ', err);
  }
}

copyToClipboard('Hello, world!');
```

### ElementUtils

```typescript
import { ElementUtils } from '@dooboostore/core-web/element/ElementUtils';

async function displayImage(src: string) {
  try {
    const imgElement = await ElementUtils.loadImage(src);
    document.body.appendChild(imgElement);
  } catch (error) {
    console.error('Failed to load image', error);
  }
}

displayImage('https://via.placeholder.com/150');
```
