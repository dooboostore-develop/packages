# Dom Render - Quick Start Template

A reactive DOM rendering library for building dynamic web applications with TypeScript.

## 🚀 Quick Start

### Install Dependencies
```bash
pnpm install
```

### Development Mode
```bash
pnpm dev
```
Open your browser at `http://localhost:8080` (or the port shown in terminal)

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
└── tsconfig.json        # TypeScript configuration
```

## 🔑 Key Concepts

### 1. Reactive Data Binding
Dom Render automatically updates the DOM when your data changes:

```typescript
class App {
  public name = 'World';  // Change this value to see live updates
  
  child = new ComponentSet(this, {
    template: `<div>Hello, \${@this@.name}$!</div>`
  });
}
```

### 2. Template Syntax

#### Variable Interpolation
```html
<div>${@this@.propertyName}$</div>
```

#### Event Binding
```html
<button dr-event-click="@this@.methodName()">Click Me</button>
```

#### Conditional Rendering
```html
<div dr-if="@this@.isVisible">
  This shows when isVisible is true
</div>
```

#### List Rendering with Appender
```typescript
private items = new Appender<ComponentSet>();

// In template:
<div dr-appender="@this@.items">
  <div>${#it#.name}$</div>
</div>
```

### 3. ComponentSet
Wrap data and templates together:

```typescript
const component = new ComponentSet(
  { name: 'John', age: 30 },  // Data object
  { template: '<div>\${@this@.name}$</div>' }  // Template
);
```

## 🎨 Features Demo

The template includes a working demo with:

✅ **Two-way data binding** - Type in the input field (`dr-value-link`) to see live updates  
✅ **Dynamic list management** - Add, update, and clear items  
✅ **Reactive rendering** - DOM updates automatically when data changes  
✅ **Event handling** - Button clicks trigger methods  
✅ **Conditional rendering** - Empty state shows when no items exist  

## 🛠️ Available Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build production bundle
- `pnpm serve` - Serve production build
- `pnpm start` - Alias for `pnpm serve`

## 📚 Core API

### DomRender.run()
Initialize and run Dom Render (returns the proxied `rootObject`):

```typescript
DomRender.run({
  rootObject: app,              // Your root component
  target: document.querySelector('#app')!,  // DOM element
  config: {                     // Configuration
    window,
    scripts: {}                 // Custom helper functions
  }
});
```

### Appender Methods
Manage dynamic lists:

```typescript
appender.push(...items)      // Add items to end
appender.set(key, ...items)  // Add/replace items under a key
appender.delete(key)         // Remove items under a key
appender.clear()             // Remove all items
appender.length              // Item count
```

## 🎯 Creating Components

### Simple Component
```typescript
class MyComponent {
  public message = 'Hello';
  
  child = new ComponentSet(this, {
    template: '<div>\${@this@.message}$</div>'
  });
}
```

### With Methods
```typescript
class Counter {
  public count = 0;
  
  child = new ComponentSet(this, {
    template: `
      <div>
        Count: \${@this@.count}$
        <button dr-event-click="@this@.increment()">+</button>
      </div>
    `
  });
  
  increment(): void {
    this.count++;
  }
}
```

### With Dynamic Lists
```typescript
class TodoList {
  private todos = new Appender<ComponentSet>();
  
  child = new ComponentSet(this, {
    template: `
      <div>
        <button dr-event-click="@this@.addTodo()">Add</button>
        <div dr-appender="@this@.todos">
          <div>\${#it#.text}$</div>
        </div>
      </div>
    `
  });
  
  addTodo(): void {
    const todo = new ComponentSet(
      { text: 'New todo' },
      { template: '' }
    );
    this.todos.push(todo);
  }
}
```

## 🐛 Debugging

`DomRender.run()` returns the proxied root object (`domRenderInstance` in `src/index.ts`). The template does not expose it globally; assign it yourself (e.g. `(window as any).app = domRenderInstance`) to call `app.add()`, `app.change()`, `app.clear()` or set `app.name` from the browser console.

## 📖 Learn More

- **Dom Render Repository**: [GitHub](https://github.com/dooboostore-develop/packages/tree/main/%40dooboostore/dom-render)
- **TypeScript Documentation**: [typescriptlang.org](https://www.typescriptlang.org/)
- **Webpack Documentation**: [webpack.js.org](https://webpack.js.org/)

## 💡 Tips

1. **Reactivity**: Dom Render tracks changes to your properties and updates the DOM automatically
2. **Performance**: Use `dr-if` instead of showing/hiding with CSS for better performance
3. **Debugging**: Check the browser console for logs
4. **Type Safety**: TypeScript provides full type checking for your components

## 🎯 What's Included

✅ TypeScript (`strict: false` in tsconfig)  
✅ Webpack with hot reload  
✅ Reactive data binding  
✅ Event handling  
✅ Conditional rendering  
✅ List rendering with Appender  
✅ Component system  
✅ Production build optimization  

---

**Happy Coding! 🎨**
