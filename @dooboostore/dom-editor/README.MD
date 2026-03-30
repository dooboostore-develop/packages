# @dooboostore/dom-editor

[![NPM version](https://img.shields.io/npm/v/@dooboostore/dom-editor.svg?style=flat-square)](https://www.npmjs.com/package/@dooboostore/dom-editor)
[![Build and Test](https://github.com/dooboostore-develop/packages/actions/workflows/main.yaml/badge.svg?branch=main)](https://github.com/dooboostore-develop/packages/actions/workflows/main.yaml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

**Full Documentation:** [https://dooboostore-develop.github.io/@dooboostore/dom-editor](https://dooboostore-develop.github.io/@dooboostore/dom-editor)

A visual drag-and-drop DOM editor for building, editing, and exporting HTML structures in real time.

## Features

- Visual drag and drop editing for element trees.
- Structured JSON export/import (`NodeData`) for persistence.
- Runtime property panel for attributes and content editing.
- Mobile-friendly interaction with drag delay control.
- Root-first API usage plus `bundle-entry` support.
- ESM/CJS/UMD/ESM-bundle outputs.

## Installation

```bash
npm install @dooboostore/dom-editor
```

```bash
yarn add @dooboostore/dom-editor
```

```bash
pnpm add @dooboostore/dom-editor
```

## Import Guide

### Root import (recommended)

```typescript
import { DomEditor } from '@dooboostore/dom-editor';
```

### Bundle entry import

```typescript
import { DomEditor } from '@dooboostore/dom-editor/bundle-entry';
```

## Quick Start

### Basic Usage

```typescript
import { DomEditor } from '@dooboostore/dom-editor';

const editor = new DomEditor('#editor-container', {
  debug: true,
  enableMobileSupport: true
});

// Get the generated HTML
const html = editor.getContent();
console.log(html);
```

### With Custom Options

```typescript
import { DomEditor, DomEditorOptions } from '@dooboostore/dom-editor';

const options: DomEditorOptions = {
  initialContent: '<section class="hero"><h1>Hello</h1></section>',
  debug: false,
  dragDelay: 500, // milliseconds
  enableMobileSupport: true,
  customStyles: `
    .my-custom-element {
      background: linear-gradient(45deg, #ff6b35, #f7931e);
      color: white;
    }
  `
};

const editor = new DomEditor(document.getElementById('editor-container')!, options);
```

### Structured Data Import

```typescript
import { DomEditor, NodeData } from '@dooboostore/dom-editor';

const initialTree: NodeData = {
  nodeType: 'element',
  tagName: 'div',
  className: 'container',
  children: [
    {
      nodeType: 'element',
      tagName: 'h2',
      children: [{ nodeType: 'text', textContent: 'Welcome' }]
    }
  ]
};

const editor = new DomEditor('#editor', { initialContent: initialTree });
```

### HTML Usage (UMD Bundle)

```html
<!DOCTYPE html>
<html>
<head>
  <title>DOM Editor Example</title>
</head>
<body>
  <div id="editor-container"></div>
  
  <script src="https://unpkg.com/@dooboostore/dom-editor/dist/umd-bundle/dooboostore-dom-editor.umd.js"></script>
  <script>
    const editor = new dooboostoreDomEditor.DomEditor('#editor-container', {
      debug: true
    });
  </script>
</body>
</html>
```

## API Reference

### DomEditor Class

#### Constructor

```typescript
new DomEditor(target: string | HTMLElement, options?: DomEditorOptions)
```

#### Options

```typescript
interface DomEditorOptions {
  /** Initial content: HTML string or structured NodeData */
  initialContent?: string | NodeData;
  /** Enable debug mode */
  debug?: boolean;
  /** Custom CSS styles to inject */
  customStyles?: string;
  /** Drag activation delay in milliseconds (default: 500) */
  dragDelay?: number;
  /** Enable mobile touch support */
  enableMobileSupport?: boolean;
}
```

#### Methods

##### Content I/O

```typescript
// Load HTML string or structured NodeData
editor.loadContent('<div>New content</div>');
editor.loadContent(nodeData);

// Get current HTML content
const html = editor.getContent();

// Export structured root element data
const data = editor.exportData(); // ElementNodeData

// Import structured data
editor.importData(data);
```

##### Lifecycle

```typescript
// Destroy editor and clean up
editor.destroy();
```

### Data Types

#### ElementData

```typescript
interface ElementData {
  nodeType: 'element';
  tagName: string;
  id?: string;
  className?: string;
  attributes?: Record<string, string>;
  children?: NodeData[];
}

interface TextNodeData {
  nodeType: 'text';
  textContent: string;
}

type NodeData = ElementData | TextNodeData;
```

## Features in Detail

### Drag & Drop System

- **Smart Activation**: 500ms hold delay prevents accidental drags
- **Visual Feedback**: Clear indicators for drop zones and positions
- **Mobile Optimized**: Touch-friendly with scroll detection
- **Nested Support**: Drag elements into other elements as children

### Property Editor

- **Live Editing**: Change tag names, attributes, and content in real-time
- **Attribute Management**: Add, edit, and remove HTML attributes
- **Visual Interface**: User-friendly forms for all editing operations

### Content Export/Import

- Export current edited tree as JSON.
- Import JSON into editor and resume editing flow.
- Export HTML string for direct embedding.

### Mobile Support

- **Touch Events**: Full touch event handling for mobile devices
- **Scroll Detection**: Smart detection between scroll and drag intentions
- **Responsive Design**: Works on all screen sizes

### Animation System

- **Smooth Transitions**: CSS-based animations for all interactions
- **Visual Feedback**: Hover effects, selection indicators, and drag previews
- **Performance Optimized**: Hardware-accelerated transforms

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Examples

### Basic HTML Builder

```typescript
import { DomEditor } from '@dooboostore/dom-editor';

const editor = new DomEditor('#builder');

// Add event listener for content changes
document.getElementById('export-btn')?.addEventListener('click', () => {
  const html = editor.getContent();
  console.log('Generated HTML:', html);
});
```

### Persist and Restore

```typescript
const saved = editor.exportData();
localStorage.setItem('dom-editor:data', JSON.stringify(saved));

const raw = localStorage.getItem('dom-editor:data');
if (raw) {
  editor.importData(JSON.parse(raw));
}
```

### Form Builder

```typescript
import { DomEditor } from '@dooboostore/dom-editor';

const formBuilder = new DomEditor('#form-builder', {
  initialContent: `
    <form>
      <div class="form-group">
        <label>Name:</label>
        <input type="text" name="name" />
      </div>
    </form>
  `
});
```

### Page Layout Designer

```typescript
import { DomEditor } from '@dooboostore/dom-editor';

const layoutDesigner = new DomEditor('#layout-designer', {
  customStyles: `
    .layout-section {
      min-height: 200px;
      border: 2px dashed #ccc;
      padding: 20px;
    }
    .layout-header {
      background: #f8f9fa;
      padding: 20px;
    }
  `
});
```

## Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/dooboostore-develop/packages.git
cd packages/source/packages/@dooboostore/dom-editor

# Install dependencies
pnpm install

# Build all formats
pnpm run build

# Watch mode for development
pnpm run watch
```

### Available Scripts

- `pnpm run build` - Build all formats (ESM, CJS, UMD)
- `pnpm run build:esm` - Build ES modules
- `pnpm run build:cjs` - Build CommonJS modules
- `pnpm run build:umd-bundle` - Build UMD bundle
- `pnpm run watch` - Watch mode for development
- `pnpm run typecheck` - Type checking

## Best Practices

- Initialize the editor with a stable container element size.
- Use structured `NodeData` for long-term persistence or server sync.
- Sanitize untrusted HTML before passing it into `loadContent`.
- Call `destroy()` when unmounting to clean up editor resources.

## Troubleshooting

**Issue:** `Element not found: #selector` in constructor  
**Solution:** ensure target element exists before creating `DomEditor`.

**Issue:** Dragging feels too sensitive on touch devices  
**Solution:** increase `dragDelay` in options.

**Issue:** Imported JSON fails  
**Solution:** root object must be `nodeType: 'element'` and follow `NodeData` schema.

## Contributing

We welcome contributions! Please see our [Contributing Guide](https://github.com/dooboostore-develop/packages/blob/main/CONTRIBUTING.md) for details.

## License

MIT © [dooboostore](https://github.com/dooboostore)

## Support

- 📧 Email: dooboostore@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/dooboostore-develop/packages/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/dooboostore-develop/packages/discussions)
