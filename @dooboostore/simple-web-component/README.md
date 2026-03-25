# @dooboostore/simple-web-component (SWC)

> **"Pure, Standards-Compliant, and Blazing Fast Web Components Framework."**

`simple-web-component` (SWC) is a minimalist library designed for building high-performance Web Components and Single Page Applications (SPA). It strips away heavy "magic" features like Proxy-based reactivity and continuous `MutationObserver` scans in favor of a **Pure Architecture** that stays out of your way while offering professional-grade Dependency Injection (DI) and Routing.

---

## 🚀 Why SWC?

- **Zero Magic**: No Proxy traps, no Virtual DOM diffing. Predictive and standard-compliant.
- **Native Inheritance**: Inherit directly from `HTMLElement`, `HTMLDivElement`, etc.
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

### 2. `@innerHtml(options?)`
Defines the template for the component.

```typescript
@elementDefine('my-el')
class MyEl extends HTMLElement {
  @innerHtml({ useShadow: true })
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
Inject internal elements directly into properties. Supports the **`:host`** selector.

| Root Option | Description |
|---|---|
| `auto` (default) | Search in `shadowRoot` if exists, otherwise `this` (Light DOM). |
| `shadow` | **Strictly** search in `shadowRoot`. Returns `null/[]` if no shadow. |
| `light` | **Strictly** search in Light DOM (`this`). |
| `all` | Search in **both** Shadow and Light DOM. |

Inject elements directly into properties. Supports `:host` and scoped root control.

```typescript
@elementDefine('query-demo')
class QueryDemo extends HTMLElement {
  @query('.title') titleEl!: HTMLElement;
  @queryAll('.items') list!: NodeListOf<HTMLElement>;
  
  // Reference the component itself
  @query(':host') self!: HTMLElement;

  // Root options: 'light' | 'shadow' | 'all' | 'auto' (default)
  @query('.btn', { root: 'shadow' }) shadowBtn!: HTMLButtonElement;
}
```

### 5. Smart Event Binding (`@addEventListener`)
Bind events declaratively with support for **Event Delegation**.

```typescript
@elementDefine('event-demo')
class EventDemo extends HTMLElement {
  // 1. Direct binding (Pure Mode)
  @addEventListener('.static-btn', 'click')
  onStaticClick(event: MouseEvent) { ... }

  // 2. Event Delegation (Works for dynamic nodes added LATER)
  @addEventListener('.item', 'click', { delegate: true })
  onItemClick(event: MouseEvent, { $host }: HostSet, target: HTMLElement) {
    console.log('Clicked dynamic item:', target.textContent);
  }
}
```

---

## 🌐 Powerful SPA & Routing

SWC provides a revolutionary way to build SPAs where **each component scope is an independent application**.

### 1. Isolated App Scopes (Micro-Frontends)
Use the `<swc-app>` tag to create an isolated universe. Each instance has its own **DI Container** and **Router**. You can run multiple independent SPAs on a single page without URL conflicts.

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

  // 4. External Control (Anywhere in your JS)
  function navigateFromOutside() {
      const app = document.querySelector('swc-app');
      // Programmatically trigger routing from outside the component
      app.routing('/users/detail/2'); 
  }
</script>

<button onclick="navigateFromOutside()">External Link to User 2</button>
```

### 2. DI-Powered Routing
Define routes using decorators. Components are automatically instantiated and managed by the DI container.

```typescript
import { Router } from '@dooboostore/simple-boot/decorators/route/Router';
import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';

@Sim
@Router({
  path: '/users',
  route: {
    '/list': UserList,
    '/detail/:id': UserDetail
  }
})
@elementDefine('user-router')
class UserRouter extends HTMLElement implements RouterAction.CanActivate {
  @innerHtml({ useShadow: true })
  render() { 
    return `<header>User System</header><main><slot></slot></main>`; 
  }

  async canActivate(url: RoutingDataSet, data?: any) {
    if (data instanceof Node) this.replaceChildren(data);
  }
}

// Pure Service (Business Logic)
@Sim
class UserService {
  async getProfile(id: string) {
    return { id, name: 'Standard User' };
  }
}

// Example Page Components
@Sim
@elementDefine('user-list')
class UserList extends HTMLElement {
  constructor(private router: Router, private userService: UserService) { super(); }

  @innerHtml
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

  @innerHtml
  render() { return `<div>User Detail View <button swc-on-click="$host.router.back()">Back</button></div>`; }
}
```

### 3. Lifecycle @Inject
Inject services or component context directly into lifecycle methods. This is the ultimate way to handle side effects cleanly.

```typescript
import { Inject } from '@dooboostore/simple-boot/decorators/inject/Inject';
import { InjectSituationType, onConnected, HostSet } from '@dooboostore/simple-web-component';
import { Router } from '@dooboostore/core-web/routers/Router';

@elementDefine('profile-page')
class ProfilePage extends HTMLElement {

  @onConnected
  async init(
    @Inject({ situationType: InjectSituationType.HOST_SET }) hostSet: HostSet,
    @Inject({ type: Router }) router: Router,
    @Inject({ type: UserService }) api: UserService
  ) {
    console.log('App scope:', hostSet.$appHost);
    const user = await api.getProfile();
    // Navigate programmatically using injected router
    if (!user) router.go('/login');
  }
}
```

---

## 🏰 Host Hierarchy & Context
SWC automatically traverses the DOM to provide meaningful context to your scripts and listeners:

- **`$host`**: The current component Handling the event (**Self**).
- **`$parentHost`**: The direct parent SWC component.
- **`$appHost`**: The nearest parent `<swc-app>` (the SPA boundary).
- **`$hosts`**: Array of all SWC ancestors `[Root, ..., Parent, Self]`.

---

## 🛠 Lifecycle Hooks
Executed in **Parent -> Child** order.
- `@onBeforeConnected` / `@onAfterConnected` (alias: `@onConnected`)
- `@onBeforeDisconnected` / `@onAfterDisconnected` (alias: `@onDisconnected`)
- `@onBeforeAdopted` / `@onAfterAdopted` (alias: `@onAdopted`)
- `@onAddEventListener`

---

## ⚡ Performance
- **Zero "Deep Scan"**: Listeners are only bound to specific selectors.
- **Surgical Updates**: Manipulate DOM directly in `@changedAttribute` instead of full re-renders.
- **Zero Background Overhead**: No polling, no background observers.

---

## 📜 License
MIT
