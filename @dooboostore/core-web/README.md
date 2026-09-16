# @dooboostore/core-web

[![NPM version](https://img.shields.io/npm/v/@dooboostore/core-web.svg?color=cb3837&style=flat-square)](https://www.npmjs.com/package/@dooboostore/core-web)
[![Build and Test](https://github.com/dooboostore-develop/packages/actions/workflows/main.yaml/badge.svg?branch=main)](https://github.com/dooboostore-develop/packages/actions/workflows/main.yaml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

**Browser-first web utilities library** — small, mostly-static-method namespaces over DOM elements/nodes, events-as-Observables, storage/cookies, canvas/clipboard/download conversions, an HTML-auto-parsing fetcher, script loading, a reactive `Router` family, dynamic CSS, animation-frame FPS helpers, and browser/platform detection. Built on top of `@dooboostore/core`'s `Observable`/`Subject` reactive primitives.

## Features

- **DOM Utilities** – `ElementUtils`, `NodeUtils`, `CanvasUtils`, `DocumentUtils` for low-level element/node/canvas operations
- **Event Handling** – `EventUtils` / `WindowUtils` convert `addEventListener` into `@dooboostore/core` `Observable` streams
- **Storage** – `StorageUtils` (Local/Session storage, explicit `window` per call) and `CookieUtils`
- **Data Conversion** – `ConvertUtils` (Canvas/ImageBitmap/File/Blob ⇄ Base64/ArrayBuffer, image compression), `ClipBoardUtils`, `DownloadUtils`
- **Network** – `HttpDomParserFetcher`, an `HttpFetcher` (from `@dooboostore/core`) subclass that auto-parses HTML/XML/SVG responses into a `Document`
- **Script Loading** – `ScriptUtils` for injecting `<script>`/`<link>` tags
- **Routing** – a reactive `Router` family (`PathRouter`, `HashRouter`, `LocationRouter`) backed by a `BehaviorSubject` of route changes
- **Styling** – `StyleCssUtils` for computed styles and CSS custom properties
- **Animation** – `AnimationFrameUtils` for FPS measurement over `requestAnimationFrame`
- **Platform Detection** – `ValidUtils` for browser/webview/mobile checks
- **Zero runtime dependencies** besides `@dooboostore/core` (workspace peer)

## Installation

```bash
npm install @dooboostore/core-web
# or
pnpm add @dooboostore/core-web
```

All exports are available from the package root only (`import { ... } from '@dooboostore/core-web'`) — there is no subpath export map.

### Module Organization

| Category | Exports | Real shape |
|----------|---------|------------|
| **DOM & Elements** | `ElementUtils`, `CanvasUtils`, `ElementApply` | namespaces (`ElementUtils`/`CanvasUtils`), utility class (`ElementApply`) |
| **Node tree** | `NodeUtils`, `NodeSlot`, `Slot` | namespace + classes |
| **Document** | `DocumentUtils` | namespace, 2 functions |
| **Events** | `EventUtils`, `WindowUtils` | namespaces, 1 function each |
| **Storage** | `StorageUtils`, `CookieUtils` | class with static methods / namespace |
| **Conversion** | `ConvertUtils`, `ClipBoardUtils`, `DownloadUtils` | namespaces |
| **Network** | `HttpDomParserFetcher` | class (extends `@dooboostore/core`'s `HttpFetcher`) |
| **Script loading** | `ScriptUtils` | class with static methods |
| **Images** | `ImageUtils` | namespace — **currently empty, no exported members** |
| **Navigation** | `LocationUtils`, `Router`, `PathRouter`, `HashRouter`, `LocationRouter` | namespace + reactive class hierarchy |
| **Styling** | `StyleCssUtils` | namespace |
| **Animation** | `AnimationFrameUtils` | namespace |
| **Platform detection** | `ValidUtils` | namespace |

---

## Core Module Reference

### ElementUtils

```typescript
import { ElementUtils } from '@dooboostore/core-web';

ElementUtils.removeAllChildren(el);              // clear all children
ElementUtils.removeAllChildren(el, newChild);     // clear then insert one or many

// Promise-based image/audio preloading
const img = await ElementUtils.loadImage('/photo.jpg');
ElementUtils.loadImage('/photo.jpg', { onload: img => console.log(img), onerror: e => console.error(e) });
const audio = await ElementUtils.loadAudio('/clip.mp3');

// Fragment <-> HTML string
const fragment = ElementUtils.htmlToFragment('<b>Hi</b>');
const html = ElementUtils.toInnerHTML(fragment, { document });

ElementUtils.replaceWith(oldEl, newEl);
const children = ElementUtils.nodeList(fragment);
const cloned = ElementUtils.cloneNodeList(fragment);

// querySelector/All also accept a { start, end } sibling range instead of an Element
const one = ElementUtils.querySelector(container, '.item');
const ranged = ElementUtils.querySelectorAll({ start: markerA, end: markerB }, '.item');

const attrsObj = ElementUtils.getAttributeToObject(el);   // { [attrName]: value }
const styleObj = ElementUtils.getStyleToObject(el);        // { [cssProp]: value }
ElementUtils.setAttribute(el, ['disabled', 'hidden']);      // sets each to ''
ElementUtils.setAttributeAttr(el, [{ name: 'data-id', value: '42' }]);
ElementUtils.removeAttribute(el, ['disabled']);
```

### CanvasUtils

```typescript
import { CanvasUtils } from '@dooboostore/core-web';

const ctx = canvas.getContext('2d')!;
CanvasUtils.Context2D.resetTransform(ctx);         // ctx.setTransform(1,0,0,1,0,0)

// Binary-search the largest font size that fits text in a box (no auto line-wrap)
const size = CanvasUtils.fontSize(ctx, { text: 'Hello\nWorld', maxWidth: 200, maxHeight: 80 });

const metrics = CanvasUtils.textMetrics(ctx, 'Hello');
```

### ElementApply / NodeSlot / Slot

`ElementApply` is the comment-marker template patching engine (`<!--ea:id:start...-->`) that scans an element (and its `shadowRoot`) and re-evaluates `${...}`-style bindings — this is the low-level primitive that `@dooboostore/simple-web-component`'s `@state`/`@applyNode` decorators are built on. `NodeSlot`/`Slot` are a similar comment-marker mechanism for named content regions (`append`/`appendHtml`/`appendText`/`prepend`/`nodes`), backing `@dooboostore/simple-web-component`'s `@applySlot`. Both are exported for advanced/direct use, but are primarily meant to be consumed through that framework rather than used standalone.

### NodeUtils

```typescript
import { NodeUtils } from '@dooboostore/core-web';

NodeUtils.removeAllChildNode(node);
NodeUtils.removeAllChildNodeAndAppend(node, newChildOrArray);
NodeUtils.appendChild(parent, child);
NodeUtils.replaceNode(oldNode, newNode);   // replaces oldNode within its parent
NodeUtils.insertAfter(targetNode, newNode);
const clone = NodeUtils.cloneNode(el, true);   // deep clone, typed

// Walk a tree, deciding per-node whether to collect it and/or descend into its children
const matches = NodeUtils.findNodes(root, node =>
  (node as Element).nodeName === 'SPAN'
    ? NodeUtils.FindNodesFilterResult.MATCH_AND_CONTINUE
    : NodeUtils.FindNodesFilterResult.NO_MATCH_AND_CONTINUE
);
```

### DocumentUtils

```typescript
import { DocumentUtils } from '@dooboostore/core-web';

// Every element in the document/subtree that carries a given attribute, with its value
const marked = DocumentUtils.querySelectorAllByAttributeName(document, 'data-track');
// -> [{ element, value }, ...]

// Note: despite the `document` parameter, this binds via window.addEventListener internally
const resize$ = DocumentUtils.eventObservable(document, 'scroll');
resize$.subscribe(e => console.log('scrolled'));
```

### EventUtils / WindowUtils

Both convert native DOM events into `@dooboostore/core` `Observable`s (`subscribe` returns a `Subscription` with `.unsubscribe()`):

```typescript
import { EventUtils, WindowUtils } from '@dooboostore/core-web';

const click$ = EventUtils.htmlElementEventObservable(button, 'click');
const sub = click$.subscribe(e => console.log('clicked', e.clientX));
sub.unsubscribe();

const resize$ = WindowUtils.eventObservable(window, 'resize');
resize$.subscribe(() => console.log('resized'));
```

### StorageUtils

A static-method class — every method takes the target `window` explicitly (no implicit global, and no unified `key/value` API — Local and Session each have their own method names):

```typescript
import { StorageUtils } from '@dooboostore/core-web';

StorageUtils.setLocalStorageItem('theme', 'dark', window);       // objects are JSON.stringify'd automatically
const theme = StorageUtils.getLocalStorageItem('theme', window);  // raw string back
const prefs = StorageUtils.getLocalStorageJsonItem<{ fontSize: number }>('prefs', window); // JSON.parse'd, or undefined

StorageUtils.removeLocalStorageItem('theme', window);
const cut = StorageUtils.cutLocalStorageItem('theme', window);    // get then remove
StorageUtils.clearLocalStorage(window);

// Session-storage equivalents mirror every method above:
// setSessionStorageItem / getSessionStorageItem / getSessionStorageJsonItem /
// cutSessionStorageItem / cutSessionStorageJsonItem / removeSessionStorageItem / clearSessionStorage
```

### CookieUtils

```typescript
import { CookieUtils } from '@dooboostore/core-web';

CookieUtils.set('sessionId', '12345', { maxAge: 3600, path: '/', secure: true, sameSite: 'Strict' });
// expireSecond (not a Date) controls expiry: null clears it immediately, a number sets seconds-from-now
CookieUtils.set('token', 'abc', { expireSecond: 7 * 24 * 60 * 60 });

const sessionId = CookieUtils.get('sessionId');   // string | null, URI-decoded
const all = CookieUtils.names();                   // string[] of every cookie name

CookieUtils.remove('sessionId', { path: '/' });
const cookieString = CookieUtils.make('k', 'v', { path: '/' }); // build the raw "k=v; path=/" string without setting it
```

### ConvertUtils

Canvas/ImageBitmap/File/Blob conversions, keyed around a `{ data, config }` shape rather than one-function-per-pair:

```typescript
import { ConvertUtils } from '@dooboostore/core-web';

const config = { type: 'image/png' as const, quality: 0.9 };
const blob = await ConvertUtils.toBlob({ data: canvas, config });         // also accepts a File directly (passthrough)
const base64 = await ConvertUtils.toBase64(blob, config);                  // accepts File/Blob/Image/ImageBitmap/Canvas (or a Promise of one)
const file = await ConvertUtils.toFile(canvas, { ...config, filename: 'shot.png' });
const arrayBuffer = await ConvertUtils.toArrayBuffer({ data: canvas, config });
const bitmap = await ConvertUtils.toImageBitmap(file);
const blobUrl = await ConvertUtils.toBlobURL({ data: canvas, config });

// Downscale to a max width, either as a compressed Blob or a resized ImageBitmap
const compressed = await ConvertUtils.compressImage(bitmap, { maxWidth: 800, type: 'image/jpeg', quality: 0.7 });
const compressedBase64 = await ConvertUtils.compressImageToBase64(bitmap, { maxWidth: 800, type: 'image/jpeg', quality: 0.7 });

const obj = ConvertUtils.toObject<{ name: string }>(formElement);   // HTMLFormElement -> plain object
const objectUrl = ConvertUtils.toObjectUrl(file);                     // URL.createObjectURL
const decoded = ConvertUtils.decodeHtmlEntity('&amp;amp;', document);

// Re-exports @dooboostore/core's own ConvertUtils under one namespace
ConvertUtils.coreConvertUtils;
```

### ClipBoardUtils

```typescript
import { ClipBoardUtils } from '@dooboostore/core-web';

await ClipBoardUtils.writeText('copied!', window);   // falls back to a hidden textarea + execCommand('copy') if the Clipboard API is unavailable
const text = await ClipBoardUtils.readText(window);
const items = await ClipBoardUtils.read(window);
await ClipBoardUtils.write(clipboardItems);           // raw ClipboardItems, e.g. multiple MIME types at once
```

### DownloadUtils

```typescript
import { DownloadUtils } from '@dooboostore/core-web';

DownloadUtils.download(window, blob, 'report.csv');          // accepts a Blob or a plain URL string
DownloadUtils.download(window, 'https://example.com/f.pdf', 'file.pdf');

DownloadUtils.csvDownload(window, rows, { headers: ['id', 'name'], includeHeader: 'true' });
```

### HttpDomParserFetcher

An `HttpFetcher<CONFIG, Document, PIPE>` (from `@dooboostore/core`) subclass — instantiate it and call the inherited HTTP-verb methods; responses are parsed into a `Document` via `DOMParser`, picking `text/html`, `application/xml`, or `image/svg+xml` from the response's `content-type` (override with `forceParserType`, or skip parsing entirely with `bypassTransform: true` to get the raw `Response`):

```typescript
import { HttpDomParserFetcher } from '@dooboostore/core-web';

const fetcher = new HttpDomParserFetcher();
const doc = await fetcher.get({ target: { url: 'https://example.com/page.html' } });
console.log(doc.querySelector('title')?.textContent);
```

### ScriptUtils

Static methods that build and inject the tag themselves — you always pass the `document` to inject into:

```typescript
import { ScriptUtils } from '@dooboostore/core-web';

await ScriptUtils.loadScript(document, 'https://cdn.example.com/lib.js', { async: 'true' });
await ScriptUtils.loadStyleSheet(document, '/theme.css');
await ScriptUtils.loadScriptBody(document, 'console.log("inline")');
```

### ImageUtils

`export namespace ImageUtils {}` currently has **no exported members** — the file only contains a commented-out draft. There is nothing to import from it yet.

### LocationUtils

Every function takes the `Window` explicitly (no implicit global `window` access):

```typescript
import { LocationUtils } from '@dooboostore/core-web';

LocationUtils.path(window);                 // location.pathname
LocationUtils.search(window);               // location.search, '' if none
LocationUtils.hash(window);                 // location.hash without the leading '#'
LocationUtils.hashPath(window);             // the part of the hash before '?'
LocationUtils.hashSearch(window);           // the '?...' part of the hash, '' if none

LocationUtils.pathQueryParams(window);          // Map<string, string> from location.search
LocationUtils.pathQueryParamsObject(window);    // same, as a plain object
LocationUtils.hashQueryParams(window);          // Map<string, string> from the hash's query
LocationUtils.hashQueryParamsObject(window);    // same, as a plain object

LocationUtils.queryStringToMap('a=1&b=2');
LocationUtils.queryStringToObject('a=1&b=2');
```

### Router family (`Router`, `PathRouter`, `HashRouter`, `LocationRouter`)

A reactive router: each instance exposes a `BehaviorSubject`-backed `.observable` of route changes (`RouterEventType`, with `triggerPoint: 'start' | 'end' | 'first-end'`) rather than a callback-registration table. All three concrete routers share the same `Router` API and differ only in how they read/write the URL (path segment, `#hash`, or a full navigation via `LocationRouter`):

```typescript
import { PathRouter } from '@dooboostore/core-web';

const router = new PathRouter({ window });

router.observable.subscribe(route => {
  console.log(route.triggerPoint, route.path, route.searchParams);
});

router.push('/users/123');                                   // history.pushState
router.replace('/dashboard');                                 // history.replaceState
router.pushUpsertSearchParam({ tab: 'posts' });                // merge into current search params
router.pushDeleteSearchParam('tab');
router.go(-1);                                                 // history.go(-1) — or router.back() / router.forward()
router.reload();

router.getPathName();          // current pathname
router.getUrl();               // pathname + search
router.searchParamObject;      // current search params as a plain object
router.getPathData('/users/{id}');  // extract path params against a pattern, or null if it doesn't match
```

`HashRouter` reads/writes `location.hash` instead of `pathname` (e.g. for static hosting without server-side routing); `LocationRouter` performs a real navigation (`location.href =`/`location.replace()`) instead of using the History API.

### StyleCssUtils

```typescript
import { StyleCssUtils } from '@dooboostore/core-web';

const value = StyleCssUtils.getPropertyValue('--primary-color', { el, window });
StyleCssUtils.setPropertyValue('--primary-color', '#6366f1', el);
const computed = StyleCssUtils.getComputedStyle({ el, window });

// Every custom property (--*) in effect on an element, or on :root + all same-origin stylesheets if no el is given
const cssVars = StyleCssUtils.getPropertyEntries({ window });   // [[name, value], ...]
```

### AnimationFrameUtils

```typescript
import { AnimationFrameUtils } from '@dooboostore/core-web';

const sub = AnimationFrameUtils.fps({ window, second: 1 }, ({ fps }) => {
  console.log('current fps:', fps.toFixed(1));
});
sub.unsubscribe();   // stop the requestAnimationFrame loop

// Throttle a per-frame callback to fire only `divideSize` times per second worth of frames
AnimationFrameUtils.dividePerFpsObservable({ fpsConfig: { window }, divideSize: 10 })
  .subscribe(({ fps, gapPosition, gapSize }) => draw());
```

### ValidUtils

```typescript
import { ValidUtils } from '@dooboostore/core-web';

ValidUtils.isBrowser();                 // typeof window/Window !== 'undefined'
ValidUtils.isBrowser(win => console.log(win));  // also invokes callback with window if true
ValidUtils.hasParentWindow(window);     // running inside an iframe with a different parent
ValidUtils.isMobile();                  // navigator.userAgent test (/Mobi/i)
ValidUtils.isiPhone();
ValidUtils.isAndroidWebview();          // heuristic: window.System bridge present
ValidUtils.isWkWebview();               // heuristic: webkit.messageHandlers.System present
ValidUtils.isSocialNetworkServiceInappBrowser();  // KakaoTalk/Naver/Facebook/Instagram in-app browser UA sniff

// Re-exports @dooboostore/core's own ValidUtils under one namespace
ValidUtils.coreValidUtils;
```

---

## Usage Example: reactive click counter with storage

```typescript
import { EventUtils, StorageUtils } from '@dooboostore/core-web';

let count = StorageUtils.getLocalStorageJsonItem<number>('clickCount', window) ?? 0;

const button = document.querySelector('#count-btn')!;
const display = document.querySelector('#count-display')!;
display.textContent = String(count);

EventUtils.htmlElementEventObservable(button, 'click').subscribe(() => {
  count++;
  display.textContent = String(count);
  StorageUtils.setLocalStorageItem('clickCount', count, window);
});
```

## Related Packages

- **[@dooboostore/core](https://npmjs.org/package/@dooboostore/core)** – `Observable`/`Subject`/`HttpFetcher` and the other core utilities this package builds on
- **[@dooboostore/core-node](https://npmjs.org/package/@dooboostore/core-node)** – the Node.js-side counterpart (files, process, memory)
- **[@dooboostore/simple-web-component](https://npmjs.org/package/@dooboostore/simple-web-component)** – the Web Components framework that consumes `ElementApply`, `NodeSlot`/`Slot`, and the `Router` family from this package
- **[@dooboostore/dom-parser](https://npmjs.org/package/@dooboostore/dom-parser)** – a server-side DOM implementation, used alongside `HttpDomParserFetcher`-style parsing in SSR contexts

## License

This package is licensed under the [MIT License](https://opensource.org/licenses/MIT).
