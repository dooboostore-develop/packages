# @dooboostore/dom-parser

[![NPM version](https://img.shields.io/npm/v/@dooboostore/dom-parser.svg?color=cb3837&style=flat-square)](https://www.npmjs.com/package/@dooboostore/dom-parser)
[![Build and Test](https://github.com/dooboostore-develop/packages/actions/workflows/main.yaml/badge.svg?branch=main)](https://github.com/dooboostore-develop/packages/actions/workflows/main.yaml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)


A lightweight DOM parser for server-side HTML parsing and manipulation with full DOM API support.

---

## Features

-   **⚡ Server-Side DOM**: Complete DOM implementation for Node.js environments with zero dependencies
-   **🔍 CSS Selector Support**: Full `querySelector` and `querySelectorAll` with complex selectors support
-   **📦 Multi-Format**: Available as ESM, CJS, and UMD bundles for maximum compatibility
-   **🛡️ TypeScript**: Full TypeScript definitions included with JSDoc documentation
-   **🪶 Zero Dependencies**: Lightweight with fast parsing performance, perfect for serverless environments
-   **🎯 HTML Templates**: Handles complex HTML templates, attributes, and custom elements
-   **🌳 DOM Traversal**: Built-in support for `TreeWalker` and `NodeIterator` for efficient tree navigation
-   **🎭 Custom Elements**: Full `customElements.define()` API for registering and using Web Components on the server
-   **📋 Standards Compliant**: Implements standard DOM APIs (querySelector, appendChild, innerHTML, etc.)
-   **💾 Memory Efficient**: Proper garbage collection with `destroy()` method for long-running processes

## Installation

```bash
# pnpm
pnpm add @dooboostore/dom-parser

# npm
npm install @dooboostore/dom-parser

# yarn
yarn add @dooboostore/dom-parser
```

## Quick Start

### Basic HTML Parsing

```typescript
import { DomParser } from '@dooboostore/dom-parser';

const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Test Page</title>
</head>
<body>
    <div id="app">
        <h1>Hello World</h1>
        <p class="content">This is a test paragraph.</p>
    </div>
</body>
</html>
`;

const parser = new DomParser(html);
const document = parser.document;

// Use standard DOM APIs
const title = document.querySelector('title');
console.log(title?.textContent); // "Test Page"

const app = document.getElementById('app');
console.log(app?.innerHTML); // Contains the div content
```

### Quick Setup with parseHTML Utility

```typescript
import { parseHTML } from '@dooboostore/dom-parser';

// Quick way to get window object for SSR
const window = parseHTML(html);
const document = window.document;

// Perfect for setting up global DOM
global.window = window;
global.document = document;
```

### Template Processing

```typescript
import { DomParser } from '@dooboostore/dom-parser';

// Parse HTML templates with complex attributes
const templateHtml = `
<div class="container">
    <button onclick="handleClick(data)" disabled="false">
        Click Me
    </button>
    <input value="user.name" placeholder="Enter name" />
</div>
`;

const parser = new DomParser(templateHtml);
const document = parser.document;

// Access and modify elements
const button = document.querySelector('button');
console.log(button?.getAttribute('onclick')); // "handleClick(data)"

const input = document.querySelector('input');
input?.setAttribute('value', 'new value');
```

## API Reference

### DomParser Class

#### Constructor
```typescript
new DomParser(html: string, options?: DomParserOptions)
```

Creates a new DOM parser instance with the provided HTML string.

**Parameters:**
- `html`: HTML string to parse
- `options`: Optional configuration object

**DomParserOptions:**
```typescript
interface DomParserOptions {
  href?: string;  // Base URL for the document
}
```

#### Properties

- `document`: Returns the parsed document object with full DOM API support
- `window`: Returns the window object for server-side rendering compatibility

### parseHTML Utility Function

#### Function Signature
```typescript
parseHTML(html: string, options?: DomParserOptions): Window
```

A convenient utility function that creates a DomParser instance and returns the window object directly.

**Usage:**
```typescript
import { parseHTML } from '@dooboostore/dom-parser';

// Quick setup for SSR
const window = parseHTML('<html><body><h1>Hello</h1></body></html>');
const document = window.document;

// Set up globals
global.window = window;
global.document = document;

// Use DOM APIs immediately
const h1 = document.querySelector('h1');
console.log(h1?.textContent); // "Hello"
```

### Supported DOM APIs

- `document.querySelector()` / `document.querySelectorAll()`
- `document.getElementById()` / `document.getElementsByClassName()`
- `element.innerHTML` / `element.textContent`
- `element.setAttribute()` / `element.getAttribute()`
- `element.appendChild()` / `element.removeChild()`
- `document.createElement()` / `document.createTextNode()`
- `document.createDocumentFragment()`
- `NodeIterator` / `TreeWalker`
- CSS selector parsing with complex expressions
- Event handling and DOM manipulation
- Custom Element registration via `customElements.define()`


## Use Cases

### 🎯 HTML Processing & Manipulation

```typescript
import { DomParser } from '@dooboostore/dom-parser';

function processHtml(html: string) {
    const parser = new DomParser(html);
    const document = parser.document;
    
    // Modify the DOM
    const title = document.querySelector('title');
    if (title) {
        title.textContent = 'Processed Title';
    }
    
    // Add meta tags
    const head = document.querySelector('head');
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'description');
    meta.setAttribute('content', 'Processed content');
    head?.appendChild(meta);
    
    return document.documentElement.outerHTML;
}
```

### 🔧 Server-Side Rendering (SSR)

```typescript
import { parseHTML } from '@dooboostore/dom-parser';

// Quick setup with parseHTML utility
const templateHtml = fs.readFileSync('template.html', 'utf8');
const window = parseHTML(templateHtml);

// Set up global DOM for SSR
global.document = window.document;
global.window = window;

// Now your components can use DOM APIs on the server
```

### 📧 Email Template Processing

```typescript
import { DomParser } from '@dooboostore/dom-parser';

function generateEmailHtml(userData: {name: string, orderId: string}) {
    const templateHtml = `
    <html>
    <body>
        <h1>Hello <span class="user-name"></span>!</h1>
        <p>Your order <strong class="order-id"></strong> has been confirmed.</p>
    </body>
    </html>
    `;
    
    const parser = new DomParser(templateHtml);
    const document = parser.document;
    
    // Inject data into the template
    document.querySelector('.user-name')!.textContent = userData.name;
    document.querySelector('.order-id')!.textContent = userData.orderId;
    
    return document.documentElement.outerHTML;
}
```

### 🌐 Web Scraping & Data Extraction

```typescript
import { DomParser } from '@dooboostore/dom-parser';
import { parseHTML } from '@dooboostore/dom-parser';

async function scrapeArticles(html: string) {
    const window = parseHTML(html);
    const document = window.document;
    
    const articles = [];
    const articleElements = document.querySelectorAll('article.post');
    
    articleElements.forEach(el => {
        const title = el.querySelector('h2')?.textContent || '';
        const author = el.querySelector('.author')?.textContent || '';
        const date = el.querySelector('.date')?.getAttribute('data-date') || '';
        
        articles.push({ title, author, date });
    });
    
    return articles;
}
```

### 🎭 Custom Element Registration

```typescript
import { parseHTML } from '@dooboostore/dom-parser';

// Define a custom element
class MyCustomElement extends HTMLElement {
    connectedCallback() {
        this.innerHTML = '<p>Custom Element Works!</p>';
    }
}

const window = parseHTML('<html><body></body></html>');

// Register custom element
window.customElements.define('my-element', MyCustomElement);

// Create and use custom element
const doc = window.document;
const customEl = doc.createElement('my-element');
doc.body?.appendChild(customEl);

console.log(doc.body?.outerHTML);
// <body><my-element><p>Custom Element Works!</p></my-element></body>
```

### 🔍 Advanced DOM Traversal with TreeWalker

```typescript
import { parseHTML } from '@dooboostore/dom-parser';

const html = `
<div class="container">
    <h1>Title</h1>
    <section>
        <article>Item 1</article>
        <article>Item 2</article>
    </section>
</div>
`;

const window = parseHTML(html);
const document = window.document;

// Use TreeWalker for efficient traversal
const root = document.querySelector('.container');
const walker = document.createTreeWalker(
    root,
    window.NodeFilter?.SHOW_ELEMENT,
    null,
    false
);

let node = walker.nextNode();
while (node) {
    console.log((node as Element).tagName, (node as Element).textContent);
    node = walker.nextNode();
}
```

### 🎨 DOM Fragment Creation & Batch Operations

```typescript
import { parseHTML } from '@dooboostore/dom-parser';

const window = parseHTML('<html><body></body></html>');
const document = window.document;

// Create a document fragment for efficient batch operations
const fragment = document.createDocumentFragment();

for (let i = 1; i <= 5; i++) {
    const li = document.createElement('li');
    li.textContent = \`Item \${i}\`;
    fragment.appendChild(li);
}

const ul = document.createElement('ul');
ul.appendChild(fragment);
document.body?.appendChild(ul);

console.log(document.body?.outerHTML);
// Creates <ul> with 5 <li> items (fragment prevents multiple reflows)
```

### 📋 HTML Validation & Cleanup

```typescript
import { DomParser } from '@dooboostore/dom-parser';

function sanitizeHtml(html: string): string {
    const parser = new DomParser(html);
    const document = parser.document;
    
    // Remove all scripts
    document.querySelectorAll('script').forEach(el => {
        el.parentNode?.removeChild(el);
    });
    
    // Remove event attributes
    const allElements = document.querySelectorAll('*');
    allElements.forEach(el => {
        Array.from(el.attributes || []).forEach(attr => {
            if (attr.name.startsWith('on')) {
                el.removeAttribute(attr.name);
            }
        });
    });
    
    return document.documentElement.outerHTML;
}
```

---

## 🚀 Advanced Features

### Document Reloading

Update the parsed document with new HTML content without creating a new parser:

```typescript
import { DomParser } from '@dooboostore/dom-parser';

const parser = new DomParser('<html><body><h1>Original</h1></body></html>');

// Later, load new HTML
parser.loadHTML('<html><body><h2>Updated</h2></body></html>');

const title = parser.document.querySelector('h2');
console.log(title?.textContent); // "Updated"
```

### Memory Management

Properly clean up parser instances for long-running applications:

```typescript
import { DomParser } from '@dooboostore/dom-parser';

const parser = new DomParser(largeHtml);

// Process document
const results = processDocument(parser.document);

// Destroy when done to free memory
parser.destroy();
```

### Base URL Configuration

Set a base URL for relative URL resolution and API calls:

```typescript
import { DomParser } from '@dooboostore/dom-parser';

const parser = new DomParser(html, {
    href: 'https://example.com/page/'
});

// Now relative URLs are resolved correctly
const link = parser.document.querySelector('a');
console.log(link?.getAttribute('href')); // Resolved relative to base URL
```

### CSS Selector Complexity

Supports complex CSS selectors for querying:

```typescript
import { parseHTML } from '@dooboostore/dom-parser';

const html = `
<div class="container">
    <article class="featured">
        <h2>Title</h2>
        <p class="summary">Summary text</p>
    </article>
    <article>
        <h2>Another</h2>
    </article>
</div>
`;

const window = parseHTML(html);
const doc = window.document;

// Complex selectors
const featured = doc.querySelector('article.featured > p.summary');
const allHeadings = doc.querySelectorAll('article > h2');
const byAttribute = doc.querySelectorAll('[class~="featured"]');

console.log(featured?.textContent); // "Summary text"
console.log(allHeadings.length); // 2
```

---

## Performance Characteristics

- **Zero External Dependencies**: No jsdom, cheerio, or other heavyweight parsers
- **Lightweight**: Suitable for microservices and serverless environments  
- **Fast Parsing**: Optimized HTML parsing algorithm
- **Memory Efficient**: Clean separation of concerns with proper garbage collection
- **TreeWalker & NodeIterator**: Efficient DOM traversal without loading entire tree into memory



```typescript
import { parseHTML } from '@dooboostore/dom-parser';

// Quick setup with parseHTML utility
const templateHtml = fs.readFileSync('template.html', 'utf8');
const window = parseHTML(templateHtml);

// Set up global DOM for SSR
global.document = window.document;
global.window = window;

// Now your components can use DOM APIs on the server
```

**Alternative with DomParser class:**
```typescript
import { DomParser } from '@dooboostore/dom-parser';

const parser = new DomParser(templateHtml);
global.document = parser.document;
global.window = parser.window;
```


---

## API Reference

### Core Classes

#### DomParser

Main class for parsing HTML strings and creating DOM environments.

```typescript
// Constructor
new DomParser(html: string, options?: DomParserOptions)

// Methods
get document(): Document              // Access the parsed document
get window(): Window                  // Access the window object
loadHTML(html: string): void          // Load new HTML and replace current document
destroy(): void                       // Destroy parser and free memory

// Options
interface DomParserOptions {
  href?: string;  // Base URL for the document
}
```

#### parseHTML Utility

Quick utility function for SSR setup:

```typescript
const window = parseHTML(html, { href?: string });
// Returns Window object directly
// window.document available immediately
```

### DOM Node Classes

The package provides TypeScript implementations of standard DOM interfaces:

- **DocumentBase**: Full Document implementation with `querySelector`, `getElementById`, `createElement`, etc.
- **ElementBase**: Base element with attribute management
- **HTMLElement**: Standard HTML elements (div, span, p, etc.)
- **TextBase**: Text nodes
- **Comment**: HTML comments  
- **DocumentFragmentBase**: Document fragments for batch operations
- **ShadowRootBase**: Shadow DOM support

### Advanced Interfaces

```typescript
// Node Traversal
NodeIterator: Traverse DOM nodes sequentially
TreeWalker: Efficient DOM tree traversal with filters

// Node Filtering
NodeFilter: Define which nodes to include during traversal

// Standard Interfaces
ParentNodeBase: Manage child nodes
ChildNodeBase: Navigate parent hierarchy
GetRootNodeOptions: Root node access configuration
```

---

## Comparison with Alternatives

### vs. JSDOM
- **dom-parser**: Lightweight, zero dependencies, single-purpose
- **jsdom**: Full browser simulation, larger bundle, more overhead

### vs. Cheerio
- **dom-parser**: Pure DOM API compatibility, TypeScript, no jQuery wrapper needed
- **cheerio**: jQuery API syntax, familiar for jQuery users

### vs. Linked DOM
- **dom-parser**: Simpler core, focused on HTML parsing
- **Linked DOM**: More comprehensive library-level ecosystem

---

## Learn More

The detailed API documentation, including all supported DOM methods and usage examples, is available on our documentation website.


## License

This package is licensed under the [MIT License](https://opensource.org/licenses/MIT).