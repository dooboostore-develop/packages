# @dooboostore/simple-web-component (SWC)

> **"Pure, Standards-Compliant, and Blazing Fast Web Components Framework."**

`simple-web-component` (SWC) is a minimalist library designed for building high-performance Web Components and Single Page Applications (SPA). It strips away heavy "magic" features like Proxy-based reactivity and continuous `MutationObserver` scans in favor of a **Pure Architecture** that adheres strictly to browser standards.

---

## 🚀 Why SWC?

- **Zero Magic**: No Proxy traps, no Virtual DOM diffing. Predictive and standard-compliant.
- **Native Inheritance**: Inherit directly from `HTMLElement`, `HTMLDivElement`, or `HTMLTemplateElement`.
- **Extreme Performance**: Ideal for high-load UIs (1,000+ nodes) with minimal memory overhead.
- **Micro-Frontend Ready**: Independent routing and DI containers for every component scope.
- **Standard-First**: Works directly with native Custom Elements, Shadow DOM, and Slots.

---

## 📦 Installation & Setup

```bash
npm install @dooboostore/simple-web-component reflect-metadata
```

### Browser Support
For **Safari** support of the `is` attribute, add this to your `<head>`:
```html
<script src="https://unpkg.com/@ungap/custom-elements"></script>
```

---

## 💡 Core Decorators

### 1. `@elementDefine(config)`
Registers the class as a custom element.

| Option | Type | Description |
|---|---|---|
| `name` | `string` | The custom element tag name (e.g., `'my-el'`). |
| `extends` | `string` | (Optional) The native tag to extend. |
| `observedAttributes` | `string[]` | (Optional) Extra attributes to observe. |
| `window` | `Window` | (Optional) Custom window object (useful for SSR). |

### 2. `@onConnectedInnerHtml(options?)`
Defines the template for the component. Executed when the component is connected to the DOM.

```typescript
@elementDefine('my-el')
class MyEl extends HTMLElement {
  @onConnectedInnerHtml({ useShadow: true })
  render() {
    return `<style>:host { color: blue; }</style><div>Hello World</div>`;
  }
}
```

### 3. Modern Attribute Management
SWC uses a **Method-Based Reflection** approach. You control exactly how data flows.

- **`@setAttribute(name?)`**: Reflects the method's **return value** to the DOM attribute.
- **`@changedAttribute(name?)`**: A handler triggered when the attribute changes.

```typescript
@elementDefine('my-counter')
class MyCounter extends HTMLElement {
  private count = 0;
  @query('#display') displayEl?: HTMLElement;

  @setAttribute('count')
  updateCount(val: number) { return val; } // Sets 'count' attribute in DOM

  @changedAttribute('count')
  onCountChange(newVal: string, oldVal: string, name: string) {
    this.count = Number(newVal);
    // Surgical Update: Only update the specific node
    if (this.displayEl) this.displayEl.textContent = newVal;
  }
}
```

### 4. Powerful Queries (`@query`, `@queryAll`)
Inject internal elements or host instances directly into properties. Assigning `null` or `[]` to these properties will surgically remove the target elements from the DOM.

#### Usage with Special Targets:
Special targets (starting with `:`) navigate the hierarchy and environment.
```typescript
@query(':host') self!: HTMLElement;
@query(':parentHost') parent!: HTMLElement;
@query(':appHost') app!: SwcAppInterface;
@query(':window') win!: Window;
@query(':document') doc!: Document;
@queryAll(':hosts') ancestors!: HTMLElement[];
```

#### Usage with Selectors & Root Options:
Standard CSS selectors support precise root control.
```typescript
// root options: 'light' | 'shadow' | 'all' | 'auto' (default)
@query('.btn', { root: 'shadow' }) shadowBtn!: HTMLButtonElement;
```

### 5. Smart Event Binding (`@addEventListener`)
Bind events declaratively with support for **Event Delegation** and special targets.

```typescript
@elementDefine('event-demo')
class EventDemo extends HTMLElement {
  // 1. Direct binding (Pure Mode)
  @addEventListener('.static-btn', 'click')
  onStaticClick(event: MouseEvent) { ... }

  // 2. Event Delegation (Handles dynamic nodes)
  @addEventListener('.dynamic-item', 'click', { delegate: true })
  onItemClick(event: MouseEvent, { $host }: HostSet, target: HTMLElement) {
    console.log('Clicked in:', $host.tagName);
  }

  // 3. Global Events with Auto-Cleanup
  @addEventListener(':window', 'resize', { removeOnDisconnected: true })
  onResize() { ... }
}
```

### 6. `@replaceChildren(selector)`
Surgically replaces the children of a target element with the method's return value (`string`, `Node`, or `Array<Node|string>`).

```typescript
@elementDefine('surgical-demo')
class SurgicalDemo extends HTMLElement {
  // Replaces all children of #display-area with a new HTML fragment
  @replaceChildren('#display-area')
  updateView(title: string) {
    return htmlFragment`<h2>${title}</h2><p>Updated successfully.</p>`;
  }
}
```

### 7. `@appendChild(selector, options?)`
Appends or inserts the method's return value relative to a target element.
- **position**: `'firstChild'`, `'lastChild'` (default), `'nextSibling'`, `'previousSibling'`.

```typescript
@elementDefine('list-manager')
class ListManager extends HTMLElement {
  // Prepends a new item to the top of the #my-list element
  @appendChild('#my-list', { position: 'firstChild' })
  addNewItem(text: string) {
    return htmlDivElement`<li>${text}</li>`;
  }
}
```

---

## 🛠 Template Utilities

SWC provides powerful utilities to create DOM nodes using Tagged Template Literals. These are perfect for use with surgical decorators like `@replaceChildren`.

### 1. `htmlFragment` & `textNode`
- **`htmlFragment\`...\``**: Returns a `DocumentFragment` from an HTML string.
- **`textNode\`...\``**: Returns a pure `Text` node.

### 2. Element Factories (`html***Element`)
Specific factories for common tags like `htmlDivElement`, `htmlSpanElement`, `htmlButtonElement`, etc.

```typescript
import { htmlDivElement, htmlSpanElement } from '@dooboostore/simple-web-component';

const el = htmlDivElement`<span>Hello ${name}</span>`; // Returns HTMLDivElement
```

### 3. `createElement(info, attributes)`
Structured element creation.
```typescript
const el = createElement(
  { tagName: 'div', innerHtml: '<b>Bold</b>' },
  { class: 'my-class', 'data-id': '123' }
);
```

---

## 🌐 Powerful SPA & Routing

SWC provides a revolutionary way to build SPAs where **each component scope is an independent application**.

### 1. Isolated App Scopes (Micro-Frontends)
Use the `<swc-app>` tag to create an isolated universe. Each instance has its own **DI Container** and **Router**.

```html
<!-- index.html -->
<swc-app swc-get-application-config="myAppConfig(this)"></swc-app>

<script>
  // This function returns the configuration needed to bootstrap the SWC App
  window.myAppConfig = (host) => {
    return {
      rootRouter: RootRouter, // The entry point class (must be @Sim)
      routeType: 'element',   // 'element' (in-memory history), 'hash', or 'path'
      path: '/users/list',    // Initial route path
      window: window          // Optional: custom window object
    };
  };

  // External Control
  function navigateFromOutside() {
      const app = document.querySelector('swc-app');
      app.routing('/users/detail/2'); 
  }
</script>
```

### 2. DI-Powered Routing
```typescript
@Sim
@Router({
  path: '/users',
  route: { '/list': UserList, '/detail/:id': UserDetail }
})
@elementDefine('user-router')
class UserRouter extends HTMLElement implements RouterAction.CanActivate {
  @onConnectedInnerHtml({ useShadow: true })
  render() { 
    return `<header>User System</header><main><slot></slot></main>`; 
  }

  async canActivate(url: RoutingDataSet, data?: any) {
    if (data instanceof Node) this.replaceChildren(data);
  }
}

@Sim
class UserService {
  async getProfile(id: string) { return { id, name: 'Standard User' }; }
}

@Sim
@elementDefine('user-list')
class UserList extends HTMLElement {
  constructor(private router: Router, private userService: UserService) { super(); }

  @onConnectedInnerHtml
  render() { 
    return `
      <ul><li>User A</li><li>User B</li></ul>
      <button swc-on-click="$host.router.go('/users/detail/1')">Go to Detail</button>
    `; 
  }
}

@Sim
@elementDefine('user-detail')
class UserDetail extends HTMLElement {
  constructor(private router: Router, private userService: UserService) { super(); }

  @onConnected
  async init() {
     const id = this.router.getIntent()?.params?.id;
     const profile = await this.userService.getProfile(id);
     console.log('Viewing User:', profile.name);
  }

  @onConnectedInnerHtml
  render() { return `<div>User Detail View <button swc-on-click="$host.router.back()">Back</button></div>`; }
}
```

---

## ✉️ Integrated Messaging System

SWC leverages its **Special Selectors** to provide a powerful, scoped messaging system using native browser events without any external manager.

### Scoped Messaging Example
- **`:appHost`**: Communicate within the same Micro-App (Isolated scope).
- **`:window` / `:document`**: Broadcast to the entire page (Global scope).
- **`:parentHost`**: Send a direct message to the immediate parent host.
- **`:firstHost` / `:firstAppHost`**: Target the absolute root component or the top-level SPA.

```typescript
@elementDefine('message-sender')
class Sender extends HTMLElement {
  // Dispatches a message to the nearest parent <swc-app>
  @emitCustomEvent(':appHost', 'user-login')
  login() { return { id: 1, name: 'John' }; }
}

@elementDefine('message-receiver')
class Receiver extends HTMLElement {
  // Listens for messages from the parent <swc-app>
  @addEventListener(':appHost', 'user-login')
  onLogin(e: CustomEvent) {
    console.log('User logged in within my app:', e.detail.name);
  }
}
```

---

## 🏰 Host Hierarchy & Context Hierarchy & Declarative Events
SWC automatically traverses the DOM to provide meaningful context to your scripts and listeners:

- **`$host`**: The current component Handling the event (**Self**).
- **`$parentHost`**: The direct parent SWC component.
- **`$appHost`**: The nearest parent SPA boundary.
- **`$hosts`**: Array of all SWC ancestors `[Root, ..., Parent, Self]`.

### Declarative Inline Events (`swc-on-*`)
Bind events directly in HTML. These scripts have full access to the context above and the actual element via **`$el`**.

```html
<template is="swc-loop" on-get-value="users">
  <!-- The script can access $item, $index, $host, and $el -->
  <button swc-on-click="console.log('Clicked:', $el); $host.deleteUser($index)">
    Delete Item
  </button>
</template>
```

---

## 🔄 Structural Directives (Advanced)

SWC provides 4 core templates that empower your HTML without wrapper elements: `swc-loop`, `swc-if`, `swc-choose`, and `swc-async`. They all share a consistent, high-performance API.

### Common Attributes:
- **`on-get-value`**: Script to fetch data (supports return-less expressions).
- **`on-clone-nodes`**: Callback after a group of nodes is cloned (Args: `$index`, `$item`, `$nodes`, `$elements`, `$firstElement`, `$state`).
- **`on-clone-node`**: Callback for each individual node (Args: `$node`, `$nodeIndex`, and all group args).
- **`on-get-portal`**: Script that returns an `Element` or selector string to render content in a different part of the DOM.

### 1. `swc-if` (Conditional Rendering)
```html
<template is="swc-if" on-get-value="isAdmin">
  <template is="swc-default"><p>Please login as admin.</p></template>
  <div class="admin-panel">Welcome, Master!</div>
</template>
```

### 2. `swc-loop` (High-Performance Iteration)
```html
<template is="swc-loop" on-get-value="users" 
    on-clone-node="if($isElement) $node.querySelector('.name').textContent = $item.name">
  <template is="swc-default"><p>No users found.</p></template>
  <div class="user-row"><span class="name"></span></div>
</template>
```

---

## ⚡ Performance Features
- **Zero "Deep Scan"**: Listeners and queries are only bound to specific selectors.
- **Surgical Updates**: Manipulate DOM directly in `@changedAttribute` instead of full re-renders.
- **Zero Background Overhead**: No polling, no background observers.
- **Smart Delegation**: Host-level delegation with `__swc_handled` duplicate protection.
- **Index-Preserving Removal**: `SwcLoop` maintains stable indices during item removal for maximum UI consistency.

---

## 📜 License
MIT
