# @dooboostore/simple-web-component

An ultra-lightweight, high-performance Web Component library that brings **Modern Reactivity** to **Standard Web Technologies**. Build complex, high-performance UIs using native Shadow DOM, Slots, and MutationObservers without the overhead of a Virtual DOM.

## 🚀 Key Advantages

- **Surgical Updates**: Powered by Proxy-based reactivity. It updates only the specific **Text Nodes or Attributes** bound to data—no full-tree diffing.
- **Standard-First**: Keep your HTML semantic. Use the native `is` attribute to enhance standard tags (`ul`, `table`, `div`, etc.).
- **Zero Boilerplate**: Define queries, events, and lifecycles declaratively using decorators.
- **Scoped Context (`as`)**: Effortlessly isolate and share data between parent and child components using explicit aliases.

---

## 📦 Installation

```bash
pnpm add @dooboostore/simple-web-component
```

### Safari Support (Required)
Include this polyfill at the very top of your entry point to support the `is` attribute in Safari:
```javascript
import '@ungap/custom-elements';
import 'reflect-metadata';
```

---

## 💡 Practical Showcase

### 1. Basic Reactive Component
A counter where only the number part is updated in the DOM when you click.

```typescript
import { elementDefine, innerHtml, state, addEventListener } from '@dooboostore/simple-web-component';

@elementDefine('my-counter')
class MyCounter extends HTMLElement {
  @state count = 0;

  @innerHtml({ useShadow: true })
  render() {
    return `
      <p>Count: <strong>{{count}}</strong></p>
      <button id="inc"> +1 </button>
    `;
  }

  @addEventListener({ type: 'click', query: '#inc' })
  onInc() {
    this.count++; // 👈 Surgical Update!
  }
}
```

### 2. Nested Scopes with `as="alias"`
Access parent data from deeply nested children without naming collisions. You can access local state directly without a prefix.

```typescript
@elementDefine({ name: 'parent-comp' })
class Parent extends HTMLElement {
  @state user = { name: 'Alice', score: 100 };
  @innerHtml({ useShadow: true })
  render() { 
    return `<h3>User: {{user.name}}</h3><slot></slot>`; // 👈 Local state: No prefix needed
  }
}

@elementDefine({ name: 'child-comp' })
class Child extends HTMLElement {
  @state score = 0;
  @innerHtml({ useShadow: true })
  render() {
    return `
      <div>Child Score: {{score}}</div> 
      <div>Parent's User: {{user.name}}</div> <!-- 👈 Automatic Bubbling: No prefix needed -->
    `;
  }
}
```
```html
<!-- HTML Usage -->
<parent-comp as="p">
  <child-comp as="c"></child-comp>
</parent-comp>
```

### 3. Mixed Shadow & Light DOM Rendering
You can distribute templates across both Shadow and Light DOM in a single component.

```typescript
@elementDefine({ name: 'hybrid-comp' })
class HybridComp extends HTMLElement {
  @innerHtml({ useShadow: true })
  renderShadow() {
    return `<div style="border: 1px solid blue;"><slot></slot></div>`;
  }

  @innerHtml
  renderLight() {
    return `<p>I am in the Light DOM!</p>`;
  }
}
```

---

## 📑 Decorator Deep Dive

### `@elementDefine(config)`
Registers the class as a Custom Element.
- `name`: (Required) Tag name.
- `extends`: (Optional) Native tag to extend (e.g., `'ul'`).
- `autoRemoveEventListeners`: (Optional) Auto-cleanup on disconnect.

### `@innerHtml(options?)`
Defines markup. Supports **Async (Promises)**.
- `useShadow`: (Optional) Injects into Shadow DOM if `true` (default: `false`).

### `@state(alias?)`
Declares a property as reactive. Changes trigger **Surgical Updates**.
- `alias`: Custom name for templates (e.g. `{{alias.path}}`).

### `@attribute(options?)`
Syncs property with HTML attribute.
- `name`: HTML attribute name.
- `type`: `String`, `Number`, `Boolean`, `Object`.
- `disableReflect`: If `true`, stops JS -> HTML sync. Default is `false`.

### `@query(selector?, options?)`
Lazy-loads elements from the DOM.
- `selector`: CSS selector. If omitted, targets the **Host**.
- `root`: `'shadow' | 'light' | 'all' | 'auto'` (Default: `'auto'`).

### `@addEventListener(options)`
Declarative event binding. Method receives `(event, targetElement)`.
- `type`: Event type.
- `query`: CSS selector. Omit to bind to **Host**.
- `root`: Search scope for target.
- `stopPropagation`, `preventDefault`, `stopImmediatePropagation`: Event modifiers.

### `@emitCustomEvent(options)`
Dispatches `CustomEvent`. Returns from the method become **`$data`** in parent `on[type]` handlers.

---

## ⏳ Lifecycle Hooks
Provides 6-stage hooks for precise control. Multiple methods per hook are supported.

| Hook | Timing |
| :--- | :--- |
| **`@onBeforeConnected`** | Before template injection. |
| **`@onAfterConnected`** | After injection (Alias: **`@onConnected`**). |
| **`@onBeforeDisconnected`**| Before element removal. |
| **`@onAfterDisconnected`** | After removal and cleanup (Alias: **`@onDisconnected`**). |
| **`@onAttributeChanged(key)`**| When an attribute (or `*` wildcard) changes. Receives `(newVal, oldVal, name)`. |
| **`@onAddEventListener`** | Called when a listener is attached. Receives `(element, type, handler)`. |

---

## 🛠 Built-in Logic Components (`is` Variants)

Enhance any standard HTML tag with logic using the `is` attribute. Use **`swcValue`** to bind data.

- **Looping**: `<ul is="swc-for-of-ul" swcValue="{{items}}" as="item">...</ul>`
- **Conditionals**: `<div is="swc-if-div" swcValue="{{isVisible}}">...</div>`
- **Branching**: `<div is="swc-choose-div" swcValue="{{status}}">...</div>`
- **Object Binding**: `<div is="swc-object-div" swcValue="{{user}}">...</div>`

## 📜 License
MIT
