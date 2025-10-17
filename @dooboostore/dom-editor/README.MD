# @dooboostore/dom-editor

A visual drag-and-drop DOM editor for creating and manipulating HTML structures with real-time preview, property editing, and mobile support.

## Features

- 🎯 **Visual Drag & Drop**: Intuitive drag-and-drop interface for HTML elements
- 📱 **Mobile Support**: Touch-friendly with smart scroll detection
- ⚡ **Real-time Preview**: See changes instantly as you build
- 🎨 **Property Editor**: Edit element attributes, styles, and content
- 🔧 **TypeScript**: Full type safety and IntelliSense support
- 📦 **Multiple Formats**: ESM, CJS, UMD bundles available
- 🎪 **Animation Support**: Smooth transitions and visual feedback
- 💾 **Import/Export**: Save and load your HTML structures

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

## Quick Start

### Basic Usage

```typescript
import { DomEditor } from '@dooboostore/dom-editor';

// Create editor instance
const editor = new DomEditor({
  container: document.getElementById('editor-container')!,
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
  container: document.getElementById('editor-container')!,
  initialContent: '<div class="my-element">Hello World</div>',
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

const editor = new DomEditor(options);
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
    const editor = new dooboostoreDomEditor.DomEditor({
      container: document.getElementById('editor-container'),
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
new DomEditor(options: DomEditorOptions)
```

#### Options

```typescript
interface DomEditorOptions {
  /** Container element where the editor will be mounted */
  container: HTMLElement;
  /** Initial HTML content to load */
  initialContent?: string;
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

##### Content Management

```typescript
// Load HTML content
editor.loadContent('<div>New content</div>');

// Get current HTML content
const html = editor.getContent();

// Export structured data
const data = editor.exportData();

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
  tagName: string;
  id?: string;
  className?: string;
  attributes?: Record<string, string>;
  textContent?: string;
  children?: ElementData[];
}
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

const editor = new DomEditor({
  container: document.getElementById('builder')!
});

// Add event listener for content changes
document.getElementById('export-btn')?.addEventListener('click', () => {
  const html = editor.getContent();
  console.log('Generated HTML:', html);
});
```

### Form Builder

```typescript
import { DomEditor } from '@dooboostore/dom-editor';

const formBuilder = new DomEditor({
  container: document.getElementById('form-builder')!,
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

const layoutDesigner = new DomEditor({
  container: document.getElementById('layout-designer')!,
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

## Contributing

We welcome contributions! Please see our [Contributing Guide](https://github.com/dooboostore-develop/packages/blob/main/CONTRIBUTING.md) for details.

## License

MIT © [dooboostore](https://github.com/dooboostore)

## Support

- 📧 Email: dooboostore@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/dooboostore-develop/packages/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/dooboostore-develop/packages/discussions)

---

Made with ❤️ by the dooboostore team