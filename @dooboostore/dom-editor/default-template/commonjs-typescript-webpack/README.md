# Dom Editor - Quick Start Template

A visual drag-and-drop DOM editor for creating and manipulating HTML structures with real-time preview.

## 🚀 Quick Start

### Install Dependencies
```bash
pnpm install
```

### Development Mode
```bash
pnpm dev
```
Open your browser at `http://localhost:9000` (or the port shown in terminal)

### Production Build
```bash
pnpm build
pnpm start
```

## 📁 Project Structure

```
.
├── src/
│   ├── index.html       # Main HTML file
│   └── index.ts         # Application entry point
├── package.json         # Project dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── webpack.config.js    # Webpack bundler configuration
```

## 🔑 Key Concepts

### 1. DOM Editor Initialization
Create a visual editor for HTML elements:

```typescript
import { DomEditor } from '@dooboostore/dom-editor';

const editor = new DomEditor({
  container: document.getElementById('editor-container')!,
  debug: true,
  enableMobileSupport: true,
  dragDelay: 500
});
```

### 2. Core Features

#### Drag & Drop
- **Visual Drag & Drop**: Intuitive element movement
- **Mobile Support**: Touch-friendly with scroll detection
- **Smart Positioning**: Before, after, or inside elements

#### Property Editing
- **Real-time Editing**: Modify attributes and content instantly
- **Attribute Management**: Add, edit, remove HTML attributes
- **Tag Name Changes**: Convert elements between different tags

#### Import/Export
- **HTML Export**: Get clean HTML output
- **Data Export**: Structured JSON representation
- **Content Loading**: Load existing HTML structures

### 3. Mobile Optimization

#### Touch Events
```typescript
const editor = new DomEditor({
  container: editorContainer,
  enableMobileSupport: true,  // Enable touch support
  dragDelay: 500             // Hold delay to prevent accidental drags
});
```

#### Scroll Detection
The editor automatically detects scroll vs drag intentions:
- **Scroll**: Vertical movement > 15px and > 1.5x horizontal movement
- **Drag**: Hold for 500ms to activate drag mode

## 🎨 Features Demo

The template includes a working demo with:

✅ **Visual Drag & Drop** - Move elements around with mouse or touch  
✅ **Property Panel** - Click elements to edit their properties  
✅ **Mobile Support** - Touch-friendly with smart scroll detection  
✅ **Real-time Preview** - See changes instantly  
✅ **Import/Export** - Save and load your HTML structures  
✅ **Custom Styling** - Apply themes and custom CSS  

## 🛠️ Available Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build production bundle
- `pnpm serve` - Serve production build
- `pnpm start` - Alias for `pnpm serve`

## 📚 Core API

### DomEditor Constructor
Initialize the editor:

```typescript
const editor = new DomEditor({
  container: HTMLElement,        // Required: Container element
  initialContent?: string,       // Optional: Initial HTML content
  debug?: boolean,              // Optional: Enable debug mode
  customStyles?: string,        // Optional: Custom CSS styles
  dragDelay?: number,           // Optional: Drag activation delay (ms)
  enableMobileSupport?: boolean // Optional: Enable touch support
});
```

### Content Management
```typescript
// Load HTML content
editor.loadContent('<div>New content</div>');

// Get current HTML
const html = editor.getContent();

// Export structured data
const data = editor.exportData();

// Import structured data
editor.importData(data);

// Clean up
editor.destroy();
```

## 🎯 Creating Custom Elements

### Basic Element
```typescript
// Add a simple element
const newContent = editor.getContent() + `
  <div class="draggable custom-element">
    <h3>My Custom Element</h3>
    <p>This element can be dragged and edited!</p>
  </div>
`;
editor.loadContent(newContent);
```

### With Custom Styles
```typescript
const editor = new DomEditor({
  container: editorContainer,
  customStyles: `
    .custom-element {
      background: linear-gradient(45deg, #ff6b35, #f7931e);
      color: white;
      border-radius: 12px;
      padding: 20px;
    }
    
    .highlight-box {
      border: 2px solid #007bff;
      background: #e7f3ff;
    }
  `
});
```

### Interactive Elements
```typescript
// Elements with event handlers
const interactiveElement = `
  <div class="draggable interactive-card">
    <h4>Interactive Card</h4>
    <button onclick="alert('Hello from DOM Editor!')">Click Me</button>
    <input type="text" placeholder="Type something...">
  </div>
`;
```

## 🐛 Debugging

Enable debug mode to see detailed logs:

```typescript
const editor = new DomEditor({
  container: editorContainer,
  debug: true  // Shows debug information
});
```

Debug information includes:
- Drag activation events
- Element selection/deselection
- Touch event handling
- Scroll detection

## 📱 Mobile Best Practices

### Touch Optimization
```typescript
// Recommended mobile settings
const editor = new DomEditor({
  container: editorContainer,
  enableMobileSupport: true,
  dragDelay: 500,  // Prevents accidental drags
  customStyles: `
    /* Mobile-friendly touch targets */
    @media (max-width: 768px) {
      .dom-editor .draggable {
        min-height: 60px;
        padding: 20px;
        font-size: 16px;
      }
      
      .dom-editor .action-btn {
        min-width: 44px;
        min-height: 44px;
      }
    }
  `
});
```

### Scroll vs Drag
- **Quick tap/scroll**: Normal scrolling behavior
- **Hold 500ms**: Activates drag mode with visual feedback
- **Vertical movement**: Detected as scroll, cancels drag activation

## 📖 Learn More

- **Dom Editor Repository**: [GitHub](https://github.com/dooboostore-develop/packages)
- **TypeScript Documentation**: [typescriptlang.org](https://www.typescriptlang.org/)
- **Webpack Documentation**: [webpack.js.org](https://webpack.js.org/)

## 💡 Tips

1. **Mobile Testing**: Test on actual devices for best touch experience
2. **Performance**: Use `debug: false` in production for better performance
3. **Styling**: Use `customStyles` for theme customization
4. **Content**: Start with `initialContent` for pre-populated editors
5. **Events**: Listen for editor events to build custom workflows

## 🎯 What's Included

✅ TypeScript with strict mode  
✅ Webpack with hot reload  
✅ Visual drag & drop editor  
✅ Mobile touch support  
✅ Property editing panel  
✅ Import/export functionality  
✅ Custom styling system  
✅ Production build optimization  

---

**Happy Building! 🎨**