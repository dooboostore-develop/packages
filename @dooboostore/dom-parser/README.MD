# @dooboostore/dom-parser

[![NPM version](https://img.shields.io/npm/v/@dooboostore/dom-parser.svg?style=flat-square)](https://www.npmjs.com/package/@dooboostore/dom-parser)
[![Build and Test](https://github.com/dooboostore-develop/packages/actions/workflows/main.yaml/badge.svg?branch=main)](https://github.com/dooboostore-develop/packages/actions/workflows/main.yaml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

**Full Documentation:** [https://dooboostore-develop.github.io/@dooboostore/dom-parser](https://dooboostore-develop.github.io/@dooboostore/dom-parser)

A lightweight DOM parser for server-side HTML parsing and manipulation with full DOM API support.

---

## Features

-   **⚡ Server-Side DOM**: Complete DOM implementation for Node.js environments
-   **🔍 CSS Selector Support**: Full `querySelector` and `querySelectorAll` support
-   **📦 Multi-Format**: Available as ESM, CJS, and UMD bundles
-   **🛡️ TypeScript**: Full TypeScript definitions included
-   **🪶 Zero Dependencies**: Lightweight with fast parsing performance
-   **🎯 HTML Templates**: Handles complex HTML templates and attributes

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
- CSS selector parsing with complex expressions
- Event handling and DOM manipulation

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

**Alternative with DomParser class:**
```typescript
import { DomParser } from '@dooboostore/dom-parser';

const parser = new DomParser(templateHtml);
global.document = parser.document;
global.window = parser.window;
```



## Learn More

The detailed API documentation, including all supported DOM methods and usage examples, is available on our documentation website.


## License

This package is licensed under the [MIT License](https://opensource.org/licenses/MIT).