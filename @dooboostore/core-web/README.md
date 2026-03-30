# @dooboostore/core-web

[![NPM version](https://img.shields.io/npm/v/@dooboostore/core-web.svg?style=flat-square)](https://www.npmjs.com/package/@dooboostore/core-web)
[![Build and Test](https://github.com/dooboostore-develop/packages/actions/workflows/main.yaml/badge.svg?branch=main)](https://github.com/dooboostore-develop/packages/actions/workflows/main.yaml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

**Browser-first web utilities library** providing DOM manipulation, event handling, storage, routing, animation, and resource loading with TypeScript support and reactive patterns.

## Features

- **🎯 DOM Utilities** – ElementUtils, NodeUtils, DocumentUtils for semantic DOM operations
- **⚡ Event Handling** – EventUtils with Observable stream conversion for reactive event handling
- **💾 Storage Solutions** – StorageUtils (LocalStorage/SessionStorage) and CookieUtils with auto-serialization
- **🔄 Data Conversion** – Canvas/ImageBitmap to Blob/Base64, Clipboard, Download utilities
- **🌐 Network Operations** – DomParser-based HTTP fetching with auto-parse capabilities, ScriptUtils for dynamic script loading
- **🗺️ Navigation & Routing** – LocationUtils and multiple Router implementations (PathRouter, HashRouter, LocationRouter)
- **✨ Animation** – AnimationFrameUtils with FPS monitoring and frame scheduling
- **🎨 Styling** – StyleCssUtils for dynamic CSS manipulation
- **🖼️ Resource Loading** – ImageUtils for image dimension detection, lazy loading
- **🔍 Browser Detection** – ValidUtils for browser capability checking and platform detection
- **📦 Zero Dependencies** – Pure TypeScript, works with any framework

## Installation

```bash
npm install @dooboostore/core-web
# or
pnpm add @dooboostore/core-web
```

### Module Organization

| Category | Modules | Purpose |
|----------|---------|---------|
| **DOM & Elements** | element, node, document | DOM node manipulation, element querying, document operations |
| **Event Handling** | event, window | Event stream conversion, window event management |
| **Storage** | storage, cookie | LocalStorage/SessionStorage, HTTP cookies with JSON support |
| **Data Conversion** | convert, clipboard, download | Binary conversions (Canvas→Blob), clipboard operations, file downloads |
| **Network & Resources** | fetch, script, image | HTTP requests with auto-parsing, dynamic script loading, image utilities |
| **Navigation & Routing** | location, routers | URL/location management, multiple routing implementations |
| **Styling & Effects** | stylecss, animation | Dynamic CSS, animation frame scheduling with FPS monitoring |
| **Platform Detection** | valid | Browser capability and platform detection utilities |

---

## Core Module Reference

### 1. DOM & Element Utilities

#### ElementUtils (element)

High-level DOM element manipulation with strong typing and minimal boilerplate.

```typescript
import { ElementUtils } from '@dooboostore/core-web';

// Query operations
const element = ElementUtils.query<HTMLDivElement>('.my-class');
const elements = ElementUtils.queryAll<HTMLParagraphElement>('p');
const parent = ElementUtils.queryParent<HTMLElement>('.container', '.child');

// Element properties
ElementUtils.setAttr(element, 'aria-label', 'My Label');
ElementUtils.setStyle(element, { color: 'red', fontSize: '16px' });
ElementUtils.addClass(element, 'active', 'highlighted');
ElementUtils.removeClass(element, 'disabled');

// Dimensions & positioning
const rect = ElementUtils.getRect(element);
console.log(rect.width, rect.height, rect.top, rect.left);

// Content manipulation
ElementUtils.setHtml(element, '<b>Bold Text</b>');
ElementUtils.setText(element, 'Plain Text');
const content = ElementUtils.getHtml(element);

// Visibility
ElementUtils.show(element);  // display: block
ElementUtils.hide(element);  // display: none
ElementUtils.toggle(element, 'hidden');

// Traversal helpers
const children = ElementUtils.children(element);
const next = ElementUtils.nextElement(element);
const prev = ElementUtils.previousElement(element);
```

**Use Cases:**
- Component DOM manipulation without jQuery
- Semantic element access with TypeScript types
- Batch styling operations
- Safe parent traversal
- Framework-agnostic DOM utilities

---

#### NodeUtils (node)

Low-level Node operations for DOM tree manipulation, insertion, and removal.

```typescript
import { NodeUtils } from '@dooboostore/core-web';

// Node creation
const div = NodeUtils.createElement('div', { id: 'myDiv', class: 'container' });
const fragment = NodeUtils.createDocumentFragment();

// Tree manipulation
NodeUtils.appendChild(element, newChild);
NodeUtils.insertBefore(element, newChild, referenceNode);
NodeUtils.removeChild(element, child);
NodeUtils.replaceChild(element, newChild, oldChild);

// Bulk operations
NodeUtils.appendChildren(parent, [child1, child2, child3]);
NodeUtils.prependChild(parent, child);  // Insert as first child

// Cloning
const clone = NodeUtils.cloneNode(element, true);  // deep clone
const shallow = NodeUtils.cloneNode(element, false);  // shallow clone

// Content replacement
NodeUtils.replaceWith(oldNode, newNode);
NodeUtils.replaceChildren(parent, ...newChildren);

// Text operations
const text = NodeUtils.createTextNode('Hello World');
```

**Use Cases:**
- Dynamic DOM tree construction
- Efficient batch insertions using DocumentFragment
- Safe node cloning without data loss
- Template rendering
- DOM tree diffing algorithms

---

#### DocumentUtils (document)

Document-level operations including viewport control and element creation.

```typescript
import { DocumentUtils } from '@dooboostore/core-web';

// Element creation with attributes
const button = DocumentUtils.createElement('button', {
  type: 'submit',
  id: 'submitBtn',
  class: 'btn btn-primary'
});

// QuerySelector wrappers
const header = DocumentUtils.querySelector<HTMLHeaderElement>('header');
const items = DocumentUtils.querySelectorAll<HTMLLIElement>('li');

// Viewport info
const viewport = DocumentUtils.getViewportSize();
console.log(viewport.width, viewport.height);

const scrollPos = DocumentUtils.getScrollPosition();
console.log(scrollPos.x, scrollPos.y);

// Scroll control
DocumentUtils.scrollTo(0, 0);  // Top-left
DocumentUtils.scrollBy(100, 50);  // Relative scroll

// Document ready state
DocumentUtils.ready(() => {
  console.log('DOM is ready');
});

// Focus management
DocumentUtils.setFocus(inputElement);
const activeElement = DocumentUtils.getActiveElement();
```

**Use Cases:**
- Page initialization logic
- Responsive viewport handling
- Scroll position management
- Focus management in complex UIs
- Document event delegation setup

---

### 2. Event Handling

#### EventUtils (event)

Convert DOM events to Observable streams for reactive event handling.

```typescript
import { EventUtils } from '@dooboostore/core-web';

// Create Observable streams from events
const clickStream$ = EventUtils.fromEvent<MouseEvent>(element, 'click');
const inputStream$ = EventUtils.fromEvent<InputEvent>(inputElement, 'input');

// Subscribe to reactive event streams
const subscription = clickStream$.subscribe(event => {
  console.log('Clicked at:', event.clientX, event.clientY);
});

// Unsubscribe
subscription.unsubscribe();

// Multiple events
const resizeStream$ = EventUtils.fromEvents(window, [
  'resize',
  'orientationchange'
]);

// Event delegation patterns
const listStream$ = EventUtils.fromEvent<MouseEvent>(listContainer, 'click')
  .pipe(
    filter((event: any) => event.target?.matches?.('li')),
    map(event => event.target)
  );

listStream$.subscribe((listItem: any) => {
  console.log('List item clicked:', listItem.textContent);
});

// Automatic cleanup
const subscription2 = EventUtils.fromEvent(window, 'scroll')
  .pipe(debounceTime(200))
  .subscribe(() => console.log('Scroll detected'));

// Unsubscribe later to avoid memory leaks
subscription2.unsubscribe();
```

**Use Cases:**
- Reactive event handling with RxJS
- Event debouncing/throttling
- Event delegation in lists
- Window/document global events as streams
- Complex event choreography

---

#### WindowUtils (window)

Global window event management and browser interaction.

```typescript
import { WindowUtils } from '@dooboostore/core-web';

// Window events as Observable
const beforeUnload$ = WindowUtils.onBeforeUnload();
const pointerMove$ = WindowUtils.onPointerMove();
const orientationChange$ = WindowUtils.onOrientationChange();

// Safe frame scheduling
WindowUtils.requestAnimationFrame(() => {
  console.log('Next frame');
});

// Timeout/interval helpers
const timeoutId = WindowUtils.setTimeout(() => {
  console.log('After 1000ms');
}, 1000);

const intervalId = WindowUtils.setInterval(() => {
  console.log('Every 500ms');
}, 500);

// Clear scheduled operations
WindowUtils.clearTimeout(timeoutId);
WindowUtils.clearInterval(intervalId);

// Keyboard events as Observable
const keyPress$ = WindowUtils.onKeyDown();
const keyUp$ = WindowUtils.onKeyUp();

keyPress$.subscribe((event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    console.log('Escape pressed');
  }
});
```

**Use Cases:**
- Global event handling (resize, scroll, load)
- Window-level event coordination
- Safe frame scheduling
- Keyboard input handling
- Browser lifecycle events

---

### 3. Storage Solutions

#### StorageUtils (storage)

Typed wrapper around LocalStorage/SessionStorage with auto-serialization.

```typescript
import { StorageUtils, StorageType } from '@dooboostore/core-web';

// Type-safe storage operations
interface UserPreferences {
  theme: 'light' | 'dark';
  fontSize: number;
  language: string;
}

// Set with auto-serialization
const prefs: UserPreferences = { theme: 'dark', fontSize: 14, language: 'ko' };
StorageUtils.set('userPrefs', prefs, StorageType.LOCAL);

// Get with auto-deserialization
const retrieved: UserPreferences = StorageUtils.get('userPrefs', StorageType.LOCAL);
console.log(retrieved.theme);  // 'dark'

// Check existence
if (StorageUtils.has('userPrefs', StorageType.LOCAL)) {
  console.log('Preferences found');
}

// Remove specific key
StorageUtils.remove('userPrefs', StorageType.LOCAL);

// Clear all
StorageUtils.clear(StorageType.LOCAL);

// Session storage (cleared on tab close)
StorageUtils.set('tempData', { id: 123 }, StorageType.SESSION);

// Enumeration
const allKeys = StorageUtils.keys(StorageType.LOCAL);
const allItems = StorageUtils.entries(StorageType.LOCAL);

allItems.forEach(([key, value]) => {
  console.log(`${key}: ${value}`);
});

// Storage events
StorageUtils.onChange$.subscribe(({ key, value, action }) => {
  console.log(`Storage ${action}: ${key} = ${value}`);
});
```

**Use Cases:**
- User preference persistence
- Session state management
- Client-side cache with expiration
- Cross-tab communication
- Safe JSON serialization

---

#### CookieUtils (cookie)

HTTP cookie management with automatic serialization and expiration.

```typescript
import { CookieUtils } from '@dooboostore/core-web';

// Set cookie with options
CookieUtils.set('sessionId', '12345', {
  maxAge: 3600,  // 1 hour in seconds
  path: '/',
  secure: true,  // HTTPS only (production)
  sameSite: 'Strict'
});

// Set with expiration date
CookieUtils.set('token', 'abc123xyz', {
  expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)  // 7 days
});

// Set complex object (auto-serialized)
CookieUtils.set('userData', {
  id: 100,
  name: 'John Doe',
  roles: ['admin', 'user']
}, {
  maxAge: 86400,  // 1 day
  path: '/'
});

// Get cookie (auto-deserialized)
const sessionId: string = CookieUtils.get('sessionId');
const userData: any = CookieUtils.get('userData');

// Check existence
if (CookieUtils.has('sessionId')) {
  console.log('Session cookie exists');
}

// Remove cookie
CookieUtils.remove('sessionId', { path: '/' });

// Get all cookies
const allCookies = CookieUtils.getAll();
console.log(allCookies);  // { sessionId: '12345', token: 'abc123xyz', ... }

// Cookie metadata
const meta = CookieUtils.getMeta('sessionId');
console.log(meta.expires, meta.path, meta.secure);
```

**Use Cases:**
- Authentication token storage
- Session management
- User preference persistence with server sync
- Cross-domain authorization
- Secure user tracking

---

### 4. Data Conversion Utilities

#### ConvertUtils (convert)

Binary and format conversions between Blob, Canvas, ImageBitmap, Base64, and ArrayBuffer.

```typescript
import { ConvertUtils } from '@dooboostore/core-web';

// Canvas to Blob (image export)
const canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
const blob = await ConvertUtils.canvasToBlob(canvas, 'image/png', 0.9);
console.log('Blob size:', blob.size, 'bytes');

// Canvas to Base64 (inline embedding)
const base64 = await ConvertUtils.canvasToBase64(canvas, 'image/jpeg');
const img = new Image();
img.src = base64;  // Display directly

// ImageBitmap to Blob/Canvas
const imageBitmap = await createImageBitmap(blob);
const bitmapBlob = await ConvertUtils.imageBitmapToBlob(imageBitmap, 'image/png');

// Blob to Base64
const blobBase64 = await ConvertUtils.blobToBase64(blob);
console.log(blobBase64.substring(0, 50) + '...');

// Base64 to Blob
const base64String = 'data:image/png;base64,iVBORw0KGgoAAAANS...';
const decodedBlob = await ConvertUtils.base64ToBlob(base64String);

// ArrayBuffer operations
const arrayBuffer = new ArrayBuffer(100);
const base64FromBuffer = ConvertUtils.arrayBufferToBase64(arrayBuffer);
const backToBuffer = ConvertUtils.base64ToArrayBuffer(base64FromBuffer);

// Image URL to Blob (CORS-safe)
try {
  const imageBlob = await ConvertUtils.urlToBlob('https://example.com/image.jpg');
  console.log('Image downloaded:', imageBlob.type);
} catch (error) {
  console.error('CORS issue or network error');
}

// Blob to text content
const textContent = await ConvertUtils.blobToText(blob);
```

**Use Cases:**
- Image export from canvas (screenshot, drawing)
- Image compression
- Format conversion for storage
- In-memory image processing
- Data URI generation for preview

---

#### ClipboardUtils (clipboard)

Read from and write to system clipboard with type safety.

```typescript
import { ClipboardUtils } from '@dooboostore/core-web';

// Write text to clipboard
await ClipboardUtils.writeText('Hello, Clipboard!');
console.log('Text copied to clipboard');

// Read text from clipboard
const text = await ClipboardUtils.readText();
console.log('Clipboard content:', text);

// Write HTML content
await ClipboardUtils.writeHtml('<b>Bold</b> <i>Italic</i> text');

// Write complex data (as JSON string)
const data = { id: 1, name: 'Alice', roles: ['admin', 'user'] };
await ClipboardUtils.writeText(JSON.stringify(data));

// Copy with notification
const success = await ClipboardUtils.writeText('Copied!');
if (success) {
  showNotification('Text copied!', 2000);
}

// Handle clipboard permissions
try {
  const clipboardText = await ClipboardUtils.readText();
} catch (err) {
  if (err.name === 'NotAllowedError') {
    console.log('User denied clipboard access');
  } else if (err.name === 'NotSupportedError') {
    console.log('Clipboard API not supported');
  }
}

// Rich content with files
const files = new FileList();  // Simulated
await ClipboardUtils.write({
  'text/plain': new Blob(['Plain text'], { type: 'text/plain' }),
  'text/html': new Blob(['<b>HTML</b>'], { type: 'text/html' })
});
```

**Use Cases:**
- Share functionality (copy link, code)
- Rich text copy
- Data export to clipboard
- User interaction feedback
- Accessibility shortcuts

---

#### DownloadUtils (download)

Trigger file downloads from Blob, URL, or generated content.

```typescript
import { DownloadUtils } from '@dooboostore/core-web';

// Download Blob as file
const csvContent = 'id,name,email\n1,Alice,alice@example.com\n2,Bob,bob@example.com';
const blob = new Blob([csvContent], { type: 'text/csv' });
DownloadUtils.downloadBlob(blob, 'users.csv');

// Download text content
const jsonData = { users: [{ id: 1, name: 'Alice' }] };
DownloadUtils.downloadText(JSON.stringify(jsonData, null, 2), 'data.json');

// Download from URL
DownloadUtils.downloadUrl('https://example.com/file.pdf', 'document.pdf');

// Generate and download on-the-fly
const canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
canvas.toBlob(blob => {
  if (blob) DownloadUtils.downloadBlob(blob, `screenshot-${Date.now()}.png`);
});

// Download with custom MIME type
const svgContent = '<svg><circle r="50" fill="red"/></svg>';
const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
DownloadUtils.downloadBlob(svgBlob, 'circle.svg');

// Batch downloads
const files = ['file1.txt', 'file2.txt', 'file3.txt'];
files.forEach((filename, index) => {
  setTimeout(() => {
    DownloadUtils.downloadText(`Content of ${filename}`, filename);
  }, index * 300);  // Stagger downloads
});
```

**Use Cases:**
- CSV/JSON export
- Report generation
- Screenshot download
- Form data export
- User-requested file downloads

---

### 5. Network & Resource Loading

#### FetchUtils (fetch)

HTTP client with DomParser auto-parsing for HTML responses.

```typescript
import { FetchUtils } from '@dooboostore/core-web';

// Simple GET with auto-parse HTML
const htmlContent = await FetchUtils.get('https://example.com/page.html');
console.log('Parsed HTML:', htmlContent);

// POST with JSON body
const response = await FetchUtils.post(
  'https://api.example.com/users',
  { name: 'Alice', email: 'alice@example.com' }
);
console.log('Created user:', response);

// PUT/PATCH for updates
await FetchUtils.put(
  'https://api.example.com/users/1',
  { name: 'Alice Updated' }
);

await FetchUtils.patch(
  'https://api.example.com/users/1',
  { email: 'newemail@example.com' }
);

// DELETE
await FetchUtils.delete('https://api.example.com/users/1');

// Custom headers
const htmlPage = await FetchUtils.get(
  'https://example.com/page.html',
  {
    headers: {
      'Authorization': 'Bearer token123',
      'Accept-Language': 'ko-KR'
    }
  }
);

// Error handling
try {
  const data = await FetchUtils.post('https://api.example.com/invalid', {});
} catch (error) {
  console.error('Request failed:', error.message);
  console.error('Status:', error.statusCode);
}

// Timeout capability
const dataWithTimeout = await FetchUtils.get(
  'https://api.example.com/slow-endpoint',
  { timeout: 5000 }  // 5 second timeout
);

// Binary response
const buffer = await FetchUtils.getBuffer('https://example.com/image.png');
console.log('Downloaded', buffer.byteLength, 'bytes');
```

**Use Cases:**
- API integration
- HTML scraping/parsing
- Cross-origin requests with CORS
- File downloads
- Real-time data fetching

---

#### ScriptUtils (script)

Dynamically load external scripts with execution guarantee.

```typescript
import { ScriptUtils } from '@dooboostore/core-web';

// Load single script
await ScriptUtils.load('https://cdn.example.com/lib.js', {
  async: true,
  defer: false
});
console.log('Script loaded');

// Load with integrity check (CSP security)
await ScriptUtils.load(
  'https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js',
  {
    integrity: 'sha384-tsQFqpEReu7ZLhBV2VZlAu7zcOV+rXbYlF2cqB8txI/8aZajjp4Bqd+V6D5IgvKT'
  }
);

// Load multiple scripts (sequential)
await Promise.all([
  ScriptUtils.load('https://cdn.example.com/base.js'),
  ScriptUtils.load('https://cdn.example.com/utils.js')
]);

// Load with error handling
try {
  await ScriptUtils.load('https://cdn.example.com/missing.js', {
    timeout: 3000
  });
} catch (error) {
  console.error('Failed to load script:', error);
  // Fallback logic
  await ScriptUtils.load('https://fallback-cdn.example.com/lib.js');
}

// Check if script already loaded
const isLoaded = ScriptUtils.isLoaded('jQuery');
console.log('jQuery loaded:', isLoaded);

// Unload script (remove from DOM)
ScriptUtils.unload('myScript');
```

**Use Cases:**
- CDN library loading
- Feature detection (load polyfills)
- A/B testing (load variant scripts)
- Analytics/tracking code
- Third-party integrations

---

#### ImageUtils (image)

Image dimension detection, lazy loading, and load verification.

```typescript
import { ImageUtils } from '@dooboostore/core-web';

// Detect image dimensions
const dimensions = await ImageUtils.getImageDimensions('https://example.com/image.jpg');
console.log(`Image: ${dimensions.width}x${dimensions.height}px`);

// Load and verify image
try {
  const loadedImage = await ImageUtils.loadImage('https://example.com/image.jpg', {
    timeout: 5000
  });
  console.log('Image loaded successfully');
} catch (error) {
  console.error('Failed to load image:', error);
}

// Create image element with promise
const img = ImageUtils.createImage('https://example.com/photo.jpg', {
  alt: 'My Photo',
  width: 300,
  height: 300
});

// Wait for load
img.addEventListener('load', () => {
  console.log('Image rendered');
  document.body.appendChild(img);
});

// Generate thumbnail
const thumbnail = await ImageUtils.createThumbnail(
  'https://example.com/large-image.jpg',
  { width: 100, height: 100 }
);
document.body.appendChild(thumbnail);

// Lazy loading support
const lazyImages = document.querySelectorAll('img[data-lazy]');
lazyImages.forEach(async (img: any) => {
  const actualSrc = img.dataset.lazy;
  await ImageUtils.loadImage(actualSrc);
  img.src = actualSrc;
  img.classList.add('loaded');
});

// Preload images
await Promise.all([
  ImageUtils.preloadImage('https://example.com/img1.jpg'),
  ImageUtils.preloadImage('https://example.com/img2.jpg'),
  ImageUtils.preloadImage('https://example.com/img3.jpg')
]);
console.log('All images preloaded');
```

**Use Cases:**
- Image gallery optimization
- Responsive image sizing
- Loading state management
- Performance monitoring
- Progressive image loading

---

### 6. Navigation & Routing

#### LocationUtils (location)

URL and location management with type-safe query parsing.

```typescript
import { LocationUtils } from '@dooboostore/core-web';

// Current URL information
console.log('Full URL:', LocationUtils.getFullUrl());
console.log('Origin:', LocationUtils.getOrigin());  // https://example.com
console.log('Pathname:', LocationUtils.getPathname());  // /users/123
console.log('Search:', LocationUtils.getSearch());  // ?role=admin&page=2
console.log('Hash:', LocationUtils.getHash());  // #profile

// Query parameter parsing (type-safe)
interface QueryParams {
  role?: string;
  page?: string;
  search?: string;
}

const params = LocationUtils.getQueryParams<QueryParams>();
console.log('Role:', params.role);  // 'admin'
console.log('Page:', params.page);  // '2'

// Get individual parameter
const sort = LocationUtils.getQueryParam('sort');  // null if not exists

// URL manipulation
LocationUtils.pushUrl('/users/456?tab=posts');  // Browser history
LocationUtils.replaceUrl('/dashboard');  // Replace history entry

// Hash-based navigation
LocationUtils.setHash('section2');
const currentHash = LocationUtils.getHash();

// Reload and redirect
LocationUtils.reload();  // Refresh page
LocationUtils.redirect('https://example.com/new-page');

// Check navigation capability
const canGoBack = LocationUtils.canGoBack();
if (canGoBack) LocationUtils.goBack();

// Build URL with parameters
const newUrl = LocationUtils.buildUrl({
  pathname: '/search',
  queryParams: { q: 'javascript', page: '1' }
});
console.log(newUrl);  // /search?q=javascript&page=1
```

**Use Cases:**
- Query parameter management
- URL parsing
- Browser history navigation
- Deep linking
- Search parameter handling

---

#### Router Implementations

Multiple routing strategies for different application architectures.

**PathRouter** – URL path-based routing (recommended for modern apps)

```typescript
import { PathRouter } from '@dooboostore/core-web';

interface RouteParams {
  id?: string;
  action?: string;
}

const router = new PathRouter<RouteParams>();

// Register routes
router.register('/users', (params) => {
  console.log('Users list');
  renderUsersList();
});

router.register('/users/:id', (params) => {
  console.log('User detail:', params.id);
  renderUserDetail(params.id);
});

router.register('/users/:id/:action', (params) => {
  console.log('User action:', params.id, params.action);
  if (params.action === 'edit') renderUserEdit(params.id);
  if (params.action === 'delete') confirmDelete(params.id);
});

// Default route
router.setDefault(() => {
  console.log('Default - show home or 404');
  renderNotFound();
});

// Start routing
router.start();

// Navigate programmatically
router.navigate('/users/123/edit');

// Current route
const currentRoute = router.getCurrentRoute();
console.log('Current:', currentRoute);  // '/users/123/edit'
```

**HashRouter** – Hash-based routing (for GitHub Pages, SPA without server)

```typescript
import { HashRouter } from '@dooboostore/core-web';

const hashRouter = new HashRouter();

hashRouter.register('#/home', () => {
  console.log('Home page');
  renderHome();
});

hashRouter.register('#/about', () => {
  console.log('About page');
  renderAbout();
});

hashRouter.register('#/products/:id', (params) => {
  console.log('Product:', params.id);
  renderProduct(params.id);
});

hashRouter.start();

// URLs like: https://example.com/#/home, https://example.com/#/products/123
// Hash changes without full page reload
hashRouter.navigate('#/products/456');
```

**LocationRouter** – Location object wrapper (for advanced scenarios)

```typescript
import { LocationRouter } from '@dooboostore/core-web';

const locRouter = new LocationRouter();

locRouter.on('change', (pathname: string) => {
  console.log('Location changed:', pathname);
  handleRouteChange(pathname);
});

locRouter.push('/new-path');
const currentPath = locRouter.getCurrent();
```

**Use Cases:**
- Single Page App (SPA) navigation
- Client-side routing without server
- URL parameter extraction
- Navigation history management
- Component mounting on route change

---

### 7. Styling & Effects

#### StyleCssUtils (stylecss)

Dynamic CSS manipulation and style injection.

```typescript
import { StyleCssUtils } from '@dooboostore/core-web';

// Inject global stylesheet
const cssRules = `
  .my-button {
    background: #007bff;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  .my-button:hover {
    background: #0056b3;
  }
`;

StyleCssUtils.injectGlobal(cssRules, 'my-styles');

// Inject scoped styles (for component isolation)
const componentStyles = `
  .card {
    border: 1px solid #ddd;
    padding: 20px;
    margin: 10px 0;
    border-radius: 8px;
  }
`;

const styleId = StyleCssUtils.inject(componentStyles);
console.log('Style ID:', styleId);

// Apply inline styles to element
const element = document.querySelector('.my-element');
StyleCssUtils.applyStyles(element, {
  'background-color': '#f0f0f0',
  'font-size': '16px',
  'line-height': '1.5'
});

// Add/remove CSS classes
StyleCssUtils.addClass(element, 'active');
StyleCssUtils.removeClass(element, 'disabled');
StyleCssUtils.toggleClass(element, 'highlighted');

// Get computed style
const backgroundColor = StyleCssUtils.getComputedStyle(element, 'background-color');
console.log('BG Color:', backgroundColor);

// Theme switching (dynamic stylesheet)
const darkTheme = `
  :root { --primary: #333; --bg: #1a1a1a; }
  body { color: var(--primary) !important; }
`;
StyleCssUtils.injectGlobal(darkTheme, 'dark-theme');
StyleCssUtils.removeGlobal('light-theme');

// CSS variables (custom properties)
StyleCssUtils.setCssVariable('--primary-color', '#007bff');
StyleCssUtils.setCssVariable('--spacing-unit', '8px');
const primaryColor = StyleCssUtils.getCssVariable('--primary-color');
```

**Use Cases:**
- Dynamic theming
- Component style scoping
- Runtime CSS generation
- Theme switching
- Responsive style updates

---

#### AnimationUtils (animation)

RequestAnimationFrame scheduling with FPS monitoring.

```typescript
import { AnimationUtils } from '@dooboostore/core-web';

// Schedule animation frame callback
const animationId = AnimationUtils.scheduleFrame(() => {
  console.log('Next animation frame');
  updateCanvas();
});

// Cancel animation
AnimationUtils.cancelFrame(animationId);

// FPS monitoring (for performance debugging)
const fpsMonitor = AnimationUtils.createFpsMonitor({
  onFpsChange: (fps: number) => {
    console.log('Current FPS:', fps);
    if (fps < 30) {
      console.warn('Performance degradation detected');
      enablePerformanceMode();
    }
  },
  updateInterval: 500  // Check every 500ms
});

fpsMonitor.start();

// Get current FPS
const currentFps = fpsMonitor.getFps();
console.log('Measured FPS:', currentFps);

// Stop monitoring
fpsMonitor.stop();

// Smooth animation loop
let lastTime = 0;
const animationLoop = (timestamp: number) => {
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  // Update at fixed delta time
  updateGameState(deltaTime);
  render();

  AnimationUtils.scheduleFrame(animationLoop);
};

AnimationUtils.scheduleFrame(animationLoop);

// Easing animations
const startValue = 0;
const endValue = 100;
const duration = 1000;  // 1 second
let elapsed = 0;

const animate = (timestamp: number) => {
  elapsed = Math.min(timestamp, duration);
  const progress = elapsed / duration;
  const eased = easeInOutCubic(progress);
  const value = startValue + (endValue - startValue) * eased;
  
  element.style.transform = `translateX(${value}px)`;
  
  if (elapsed < duration) {
    AnimationUtils.scheduleFrame(animate);
  }
};

AnimationUtils.scheduleFrame(animate);

// Easing function
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
```

**Use Cases:**
- Smooth animations
- Performance monitoring
- Game loops
- Real-time visualization
- FPS-aware rendering

---

### 8. Browser Detection

#### ValidUtils (valid)

Browser capability and platform detection.

```typescript
import { ValidUtils } from '@dooboostore/core-web';

// Platform detection
console.log('Is Windows:', ValidUtils.isWindows());
console.log('Is Mac:', ValidUtils.isMac());
console.log('Is Linux:', ValidUtils.isLinux());
console.log('Is Mobile:', ValidUtils.isMobileDevice());
console.log('Is Touch Device:', ValidUtils.isTouchDevice());

// Browser detection
console.log('Is Chrome:', ValidUtils.isChrome());
console.log('Is Firefox:', ValidUtils.isFirefox());
console.log('Is Safari:', ValidUtils.isSafari());
console.log('Is Edge:', ValidUtils.isEdge());

// Feature detection (capability checking)
console.log('LocalStorage:', ValidUtils.hasLocalStorage());
console.log('SessionStorage:', ValidUtils.hasSessionStorage());
console.log('Geolocation:', ValidUtils.hasGeolocation());
console.log('WebGL:', ValidUtils.hasWebGL());
console.log('WebWorker:', ValidUtils.hasWebWorker());
console.log('ServiceWorker:', ValidUtils.hasServiceWorker());
console.log('Fetch API:', ValidUtils.hasFetch());
console.log('Canvas:', ValidUtils.hasCanvas());
console.log('SVG:', ValidUtils.hasSvg());
console.log('WebAnimation:', ValidUtils.hasWebAnimation());

// Browser version detection
if (ValidUtils.isChrome()) {
  const chromeVersion = ValidUtils.getBrowserVersion();
  console.log('Chrome version:', chromeVersion);
  if (chromeVersion < 90) {
    console.warn('Unsupported browser version');
    showBrowserUpgradeMessage();
  }
}

// Conditional feature loading
if (ValidUtils.hasServiceWorker()) {
  navigator.serviceWorker.register('/sw.js');
} else {
  console.warn('Progressive enhancement without Service Worker');
}

// Mobile-specific logic
if (ValidUtils.isMobileDevice()) {
  activateMobileUI();
  disableHoverStates();
} else {
  activateDesktopUI();
}

// Performance monitoring capability
if (ValidUtils.hasPerformanceAPI()) {
  const navigationTiming = performance.getEntriesByType('navigation')[0];
  console.log('Page load time:', navigationTiming.loadEventEnd - navigationTiming.fetchStart);
}
```

**Use Cases:**
- Feature detection for progressive enhancement
- Platform-specific UI
- Browser compatibility warnings
- Graceful degradation
- Performance monitoring enabling

---

## Usage Examples

### Example 1: Reactive Click Counter with Storage

```typescript
import {
  ElementUtils,
  EventUtils,
  StorageUtils,
  StorageType
} from '@dooboostore/core-web';
import { debounceTime, map } from 'rxjs/operators';

// Initialize
let count = StorageUtils.get('clickCount', StorageType.LOCAL) ?? 0;

const countButton = ElementUtils.query<HTMLButtonElement>('#count-btn');
const countDisplay = ElementUtils.query<HTMLSpanElement>('#count-display');

// Update display
function updateDisplay() {
  ElementUtils.setText(countDisplay, count.toString());
  StorageUtils.set('clickCount', count, StorageType.LOCAL);
}

updateDisplay();

// Reactive event handling
EventUtils.fromEvent(countButton, 'click')
  .pipe(debounceTime(100))
  .subscribe(() => {
    count++;
    updateDisplay();
  });
```

### Example 2: Dynamic Image Gallery with Lazy Loading

```typescript
import { ImageUtils, ElementUtils, ConvertUtils } from '@dooboostore/core-web';

async function initImageGallery() {
  const images = ElementUtils.queryAll<HTMLImageElement>('img[data-src]');
  
  for (const img of images) {
    const dataSrc = ElementUtils.getAttr(img, 'data-src');
    
    try {
      // Verify image exists
      await ImageUtils.loadImage(dataSrc, { timeout: 5000 });
      
      // Set actual src
      ElementUtils.setAttr(img, 'src', dataSrc);
      ElementUtils.addClass(img, 'loaded');
    } catch (error) {
      console.warn('Failed to load image:', dataSrc);
      ElementUtils.addClass(img, 'error');
    }
  }
  
  // Generate thumbnails
  const largeImages = ElementUtils.queryAll<HTMLImageElement>('img.full-size');
  for (const img of largeImages) {
    const thumb = await ImageUtils.createThumbnail(img.src, {
      width: 100,
      height: 100
    });
    ElementUtils.setAttr(thumb, 'class', 'thumbnail');
    img.parentElement?.insertBefore(thumb, img);
  }
}

// Start when DOM ready
document.addEventListener('DOMContentLoaded', initImageGallery);
```

### Example 3: Router with Dynamic Page Loading

```typescript
import { PathRouter, FetchUtils, ElementUtils } from '@dooboostore/core-web';

interface PageParams {
  id?: string;
  tab?: string;
}

const router = new PathRouter<PageParams>();
const appContainer = ElementUtils.query('#app');

// Register routes
router.register('/home', async () => {
  const html = await FetchUtils.get('/pages/home.html');
  ElementUtils.setHtml(appContainer, html);
});

router.register('/products/:id', async (params) => {
  const html = await FetchUtils.get(`/pages/product.html?id=${params.id}`);
  ElementUtils.setHtml(appContainer, html);
});

router.register('/dashboard/:tab', async (params) => {
  const html = await FetchUtils.get(`/pages/dashboard.html?tab=${params.tab}`);
  ElementUtils.setHtml(appContainer, html);
});

router.setDefault(async () => {
  const html = await FetchUtils.get('/pages/404.html');
  ElementUtils.setHtml(appContainer, html);
});

router.start();

// Navigate on link click
document.addEventListener('click', (event: any) => {
  if (event.target.matches('a[data-navigate]')) {
    event.preventDefault();
    const href = ElementUtils.getAttr(event.target, 'href');
    router.navigate(href);
  }
});
```

### Example 4: Theme Switching with CSS Variables

```typescript
import { StyleCssUtils, StorageUtils, StorageType, ElementUtils } from '@dooboostore/core-web';

const themes = {
  light: {
    '--primary-color': '#007bff',
    '--bg-color': '#ffffff',
    '--text-color': '#000000'
  },
  dark: {
    '--primary-color': '#0d6efd',
    '--bg-color': '#1a1a1a',
    '--text-color': '#ffffff'
  }
};

let currentTheme = StorageUtils.get('theme', StorageType.LOCAL) ?? 'light';

function applyTheme(theme: string) {
  const themeVariables = themes[theme as keyof typeof themes];
  
  Object.entries(themeVariables).forEach(([key, value]) => {
    StyleCssUtils.setCssVariable(key, value);
  });
  
  currentTheme = theme;
  StorageUtils.set('theme', theme, StorageType.LOCAL);
  
  // Update button state
  ElementUtils.removeClass(
    ElementUtils.query(`[data-theme="${currentTheme === 'light' ? 'dark' : 'light'}"]`),
    'active'
  );
  ElementUtils.addClass(
    ElementUtils.query(`[data-theme="${currentTheme}"]`),
    'active'
  );
}

// Initialize theme
applyTheme(currentTheme);

// Theme switcher buttons
document.querySelectorAll('[data-theme]').forEach((btn: any) => {
  ElementUtils.fromEvent(btn, 'click').subscribe(() => {
    applyTheme(btn.dataset.theme);
  });
});
```

### Example 5: Form Data Export

```typescript
import { ElementUtils, ConvertUtils, DownloadUtils } from '@dooboostore/core-web';

async function exportFormAsCSV() {
  const form = ElementUtils.query<HTMLFormElement>('form#data-form');
  const formData = new FormData(form);
  
  // Extract form fields
  const headers = Array.from(formData.keys());
  const values = Array.from(formData.values());
  
  // Create CSV
  const csvContent =
    headers.join(',') + '\n' +
    values.map(v => `"${v}"`).join(',');
  
  // Download
  DownloadUtils.downloadText(csvContent, `form-export-${Date.now()}.csv`);
}

async function exportFormAsJSON() {
  const form = ElementUtils.query<HTMLFormElement>('form#data-form');
  const formData = new FormData(form);
  
  const jsonData = Object.fromEntries(formData);
  DownloadUtils.downloadText(
    JSON.stringify(jsonData, null, 2),
    `form-export-${Date.now()}.json`
  );
}
```

---

## Performance Characteristics

| Operation | Time Complexity | Space | Notes |
|-----------|-----------------|-------|-------|
| ElementUtils.query | O(n) | O(1) | Native QuerySelector |
| StorageUtils.get | O(1) | O(m) | m = object size |
| EventUtils.fromEvent | O(1) | O(1) | Stream setup |
| Router.navigate | O(n) | O(1) | n = registered routes |
| ConvertUtils.canvasToBlob | O(p) | O(p) | p = pixel count |
| ImageUtils.loadImage | O(1) | O(m) | m = image size |
| AnimationUtils FPS monitor | O(1) | O(1) | Per-frame overhead ~0.1ms |

**Optimization Tips:**
- Debounce frequent events (scroll, resize)
- Use DocumentFragment for batch DOM insertions
- Prefer localStorage to repeated DOM queries
- Unsubscribe Observable streams to prevent memory leaks
- Use Canvas/ImageBitmap for heavy image processing

---

## Best Practices

### 1. **Observable Stream Cleanup**
```typescript
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

private destroy$ = new Subject<void>();

ngOnInit() {
  EventUtils.fromEvent(window, 'resize')
    .pipe(
      debounceTime(200),
      takeUntil(this.destroy$)
    )
    .subscribe(() => this.handleResize());
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

### 2. **Type-Safe Storage**
```typescript
interface AppState {
  userId: number;
  preferences: { theme: string; language: string };
}

const appState: AppState = StorageUtils.get('appState', StorageType.LOCAL);
appState.preferences.theme = 'dark';
StorageUtils.set('appState', appState, StorageType.LOCAL);
```

### 3. **Route Parameter Validation**
```typescript
const router = new PathRouter<{ id: string }>();

router.register('/users/:id', (params) => {
  const userId = Number(params.id);
  if (isNaN(userId)) {
    router.navigate('/error');
    return;
  }
  loadUserDetail(userId);
});
```

### 4. **CORS-Safe Image Loading**
```typescript
try {
  await ImageUtils.loadImage(externalUrl, { timeout: 5000 });
  img.src = externalUrl;
} catch {
  img.src = '/placeholder.png';  // Fallback
}
```

### 5. **Graceful Feature Degradation**
```typescript
if (ValidUtils.hasServiceWorker()) {
  registerServiceWorker();
} else if (ValidUtils.hasLocalStorage()) {
  useClientStorage();
} else {
  useSessionOnlyModel();
}
```

---

## Integration with Core Packages

| Task | core-web | @dooboostore/core | @dooboostore/core-node |
|------|----------|-------------------|------------------------|
| **Observable/Reactive** | EventUtils → Observable | ✅ Subject, Observable | N/A |
| **Validation** | ValidUtils | ✅ 30+ Validators | PathUtils validator |
| **Image Processing** | ImageUtils, ConvertUtils | Image utilities | HttpPageDownloader |
| **HTTP Requests** | FetchUtils | HttpFetcher | HttpPageDownloader |
| **Data Conversion** | ConvertUtils | Convert utilities | Convert utilities |
| **Promise Handling** | ✅ FetchUtils promises | ✅ Promise utilities | Promise utilities |
| **Storage** | StorageUtils, CookieUtils | Store utilities | File<E> storage |
| **URL/Query Parsing** | LocationUtils | URL utilities | PathUtils |
| **Scheduling** | AnimationUtils | Schedule/Cron | ProcessUtils |
| **Performance Monitoring** | FPS Monitor | ✅ Performance utils | MemoryUtils |
| **Event Handling** | EventUtils streams | Subject/Observable | N/A |

---

## Advanced Topics

### Server-Side Rendering (SSR) Compatibility

core-web utilities are browser-only, but can be wrapped for SSR:

```typescript
// ssr-wrapper.ts
export const ElementUtilsSSR = {
  query: (selector: string) => {
    if (typeof document === 'undefined') return null;
    return ElementUtils.query(selector);
  },
  // ... other methods with typeof checks
};
```

### Bridge with Core Observable System

```typescript
import { Subject } from '@dooboostore/core';
import { EventUtils } from '@dooboostore/core-web';

const eventSubject = new Subject<MouseEvent>();

EventUtils.fromEvent<MouseEvent>(document, 'click')
  .subscribe(event => {
    eventSubject.next(event);  // Bridge to core Subject
  });

// Now available globally via core Observable system
eventSubject.subscribe(event => {
  console.log('Global click event:', event);
});
```

### Custom Router Implementation

```typescript
import { Subject } from '@dooboostore/core';

class CustomRouter {
  private currentRoute$ = new Subject<string>();
  
  navigate(route: string) {
    this.currentRoute$.next(route);
  }
  
  onRouteChange() {
    return this.currentRoute$.asObservable();
  }
}
```

---

## Troubleshooting

**Issue:** CORS errors in FetchUtils
- **Solution:** Verify server CORS headers or use proxy backend

**Issue:** Storage quota exceeded
- **Solution:** Clear old entries or use compression before storing

**Issue:** Route not matching
- **Solution:** Check route order (specific → general) and parameter formats

**Issue:** Event memory leaks
- **Solution:** Always unsubscribe Observable streams in cleanup

**Issue:** Low FPS in animation loop
- **Solution:** Profile with FPS monitor, optimize calculations, use requestIdleCallback for non-critical work

---

## Learn More

For full examples and API documentation, visit the [official docs](https://dooboostore-develop.github.io/@dooboostore/core-web).

## License

This package is licensed under the [MIT License](https://opensource.org/licenses/MIT).

## Related Packages

- **[@dooboostore/core](https://npmjs.org/package/@dooboostore/core)** – Core utilities (Observables, Validators, Promise, etc.)
- **[@dooboostore/core-node](https://npmjs.org/package/@dooboostore/core-node)** – Node.js utilities (File, Process, Memory)
- **[@dooboostore/simple-web-component](https://npmjs.org/package/@dooboostore/simple-web-component)** – Web Components framework with decorators
- **[@dooboostore/dom-parser](https://npmjs.org/package/@dooboostore/dom-parser)** – DOM parsing library (JSDOM alternative)
