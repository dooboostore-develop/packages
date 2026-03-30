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

**Attribute sync rules**
- Initial sync honors DOM-first semantics: if a markup attribute already exists (e.g., `<my-el count="11">`), the first write keeps that DOM value even when the class defines `count = 0`.
- `connectedInitialize: true` flips the direction for that property so the in-memory value is pushed to the DOM during `connectedCallback`.
- Type conversion is automatic through `convertValue` so `Boolean`, `Number`, and `String` fields always expose typed values while still storing the serialized attribute on the element.
- Getters return `null` when the resolved target exists but the attribute is absent, giving you an explicit signal that the DOM is missing that state.

- **`@setAttribute(name?, options?)`**: Reflects the method's **return value** to the DOM attribute. Supports `SwcQueryOptions` for root-aware target resolution (light DOM, shadow DOM, or auto-detect).
- **`@changedAttribute(name?)`**: A handler triggered when the attribute changes.

```typescript
@elementDefine('my-counter')
class MyCounter extends HTMLElement {
  private count = 0;
  @query('#display') displayEl?: HTMLElement;
  @query('#shadow-input', { root: 'shadow' }) shadowInput?: HTMLInputElement;

  @setAttribute('count')
  updateCount(val: number) { return val; } // Sets 'count' attribute in DOM

  @setAttribute('shadow-value', { root: 'shadow' })
  updateShadowValue(val: string) { return val; } // Sets attribute on shadow DOM element

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

#### Root Options
The `root` option controls which DOM tree is searched:
- **`'auto'`** (default): Searches shadow DOM first, then light DOM
- **`'light'`**: Searches only light DOM
- **`'shadow'`**: Searches only shadow DOM
- **`'all'`**: Searches all ancestors, returning `[lightNodes, shadowNodes]` array

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

Bind events declaratively with built-in **Event Delegation**, **Auto-Cleanup**, and **Context Injection**. Events flow through the component hierarchy with full access to parent scopes.

#### Core Features:
- **Direct Binding**: Bind to static selectors present at initialization
- **Event Delegation**: Automatically handle dynamically added elements
- **Auto-Cleanup**: Automatically remove listeners on `disconnectedCallback`
- **Context Injection**: Receive `$host`, `$parentHost`, `$appHost` automatically
- **Special Targets**: `:window`, `:document`, `:parentHost`, `:appHost`

#### Pattern 1: Direct Binding & Static Selectors

```typescript
@Sim
@elementDefine('form-handler')
class FormHandler extends HTMLElement {
  @query('#submit-btn') submitBtn?: HTMLButtonElement;
  @query('#form') form?: HTMLFormElement;

  // Bind to a specific static element
  @addEventListener('#submit-btn', 'click')
  onSubmit(event: MouseEvent) {
    event.preventDefault();
    console.log('Form submitted');
    this.form?.submit();
  }

  // Bind to multiple elements with selector
  @addEventListener('input[type="text"]', 'input')
  onTextInput(event: Event) {
    console.log('Input value:', (event.target as HTMLInputElement).value);
  }

  @onConnectedInnerHtml
  render() {
    return `
      <form id="form">
        <input type="text" placeholder="Enter name">
        <input type="email" placeholder="Enter email">
        <button id="submit-btn">Submit</button>
      </form>
    `;
  }
}
```

#### Pattern 2: Event Delegation (Dynamic Content)

Automatically handle elements added **after component initialization**.

```typescript
@Sim
@elementDefine('todo-app')
class TodoApp extends HTMLElement {
  private todos: any[] = [];

  constructor(private todoService: TodoService) { super(); }

  // Delegate: Handles all current AND future .todo-item elements
  @addEventListener('.todo-item', 'click', { delegate: true })
  onTodoClick(event: MouseEvent, hostSet: any, target: HTMLElement) {
    const todoId = target.getAttribute('data-id');
    console.log('Clicked todo:', todoId);
    this.selectTodo(todoId);
  }

  // Event delegation with checkbox - even newly added items react
  @addEventListener('.todo-checkbox', 'change', { delegate: true })
  onTodoToggle(event: Event, hostSet: any, target: HTMLInputElement) {
    const todoId = target.closest('.todo-item')?.getAttribute('data-id');
    const isChecked = target.checked;
    console.log(`Todo ${todoId} ${isChecked ? 'completed' : 'uncompleted'}`);
  }

  async addTodo(text: string) {
    const newTodo = await this.todoService.create(text);
    this.todos.push(newTodo);
    this.render();
    // New .todo-item elements automatically get event listeners!
  }

  selectTodo(id: string) {
    const todo = this.todos.find(t => t.id === id);
    console.log('Selected:', todo);
  }

  @onConnectedInnerHtml
  render() {
    return `
      <div>
        <input type="text" placeholder="Add todo">
        <button swc-on-click="$host.addTodo(this.previousElementSibling.value)">Add</button>
        <ul>
          ${this.todos.map(t => `
            <li class="todo-item" data-id="${t.id}">
              <input type="checkbox" class="todo-checkbox" ${t.done ? 'checked' : ''}>
              <span>${t.text}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }
}
```

#### Pattern 3: Global Events with Context Access

```typescript
@Sim
@elementDefine('responsive-layout')
class ResponsiveLayout extends HTMLElement {
  private isMobile = false;

  // Listen to window resize with auto-cleanup on disconnect
  @addEventListener(':window', 'resize', { removeOnDisconnected: true })
  onWindowResize() {
    this.isMobile = window.innerWidth < 768;
    this.updateLayout();
  }

  // Listen to global scroll with host context
  @addEventListener(':window', 'scroll', { removeOnDisconnected: true })
  onScroll(event: Event, { $appHost }: any) {
    const scrollPos = window.scrollY;
    console.log('Scrolled in app:', $appHost?.tagName, 'Position:', scrollPos);
  }

  updateLayout() {
    this.className = this.isMobile ? 'mobile-layout' : 'desktop-layout';
  }

  @onConnectedInnerHtml
  render() {
    return `<div class="${this.isMobile ? 'mobile' : 'desktop'}"><slot></slot></div>`;
  }
}
```

### 6. `@replaceChildren(selector)`

Surgically replaces the children of a target element. Perfect for dynamic content updates without full-page re-renders.

**Use Cases:**
- Search results updating without page reload
- Filtering product lists
- Content swaps in tabbed interfaces
- Live data refreshes

#### Pattern 1: Simple Content Replacement

```typescript
@Sim
@elementDefine('search-results')
class SearchResults extends HTMLElement {
  private results: any[] = [];
  private isLoading = false;

  // Replace #results-container with new search results
  @replaceChildren('#results-container')
  async displayResults(query: string) {
    this.isLoading = true;
    const startTime = Date.now();

    try {
      this.results = await fetch(`/api/search?q=${query}`)
        .then(r => r.json());

      return htmlFragment`
        <div class="results-header">
          <p>Found ${this.results.length} results in ${Date.now() - startTime}ms</p>
        </div>
        <div class="results-list">
          ${this.results.map(item => `
            <div class="result-item" data-id="${item.id}">
              <h3>${item.title}</h3>
              <p>${item.description}</p>
              <a href="${item.url}">View</a>
            </div>
          `).join('')}
        </div>
      `;
    } catch (error) {
      return htmlFragment`<p class="error">Search failed: ${error.message}</p>`;
    }
  }

  @onConnectedInnerHtml
  render() {
    return `
      <div>
        <input type="text" class="search-input" placeholder="Search...">
        <button swc-on-click="$host.search($el.previousElementSibling.value)">Search</button>
        <div id="results-container">
          <p>Enter search term...</p>
        </div>
      </div>
    `;
  }

  search(query: string) {
    if (query.trim()) {
      this.displayResults(query);
    }
  }
}
```

#### Pattern 2: Tab Content Switching

```typescript
@Sim
@elementDefine('tabbed-panel')
class TabbedPanel extends HTMLElement {
  private activeTab = 'overview';
  private tabData: any = {
    overview: '<h3>Overview</h3><p>General information...</p>',
    details: '<h3>Details</h3><p>Detailed specifications...</p>',
    reviews: '<h3>Reviews</h3><p>Customer reviews...</p>'
  };

  // Click tab and automatically replace content
  @replaceChildren('.tab-content')
  switchTab(tabName: string) {
    this.activeTab = tabName;

    // Update tab buttons visual state
    Array.from(this.querySelectorAll('.tab-btn')).forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
    });

    // Return new content
    return htmlFragment`${this.tabData[tabName]}`;
  }

  @onConnectedInnerHtml
  render() {
    return `
      <div class="tabs">
        <button class="tab-btn active" data-tab="overview" 
                swc-on-click="$host.switchTab('overview')">Overview</button>
        <button class="tab-btn" data-tab="details" 
                swc-on-click="$host.switchTab('details')">Details</button>
        <button class="tab-btn" data-tab="reviews" 
                swc-on-click="$host.switchTab('reviews')">Reviews</button>
      </div>
      <div class="tab-content">${this.tabData.overview}</div>
    `;
  }
}
```

### 7. `@appendChild(selector, options?)`

Appends or inserts the method's return value relative to a target element. Perfect for dynamically building lists, stacking notifications, or adding children without replacing existing content.

**Position Options:**
- **`'lastChild'`** (default): Append to end
- **`'firstChild'`**: Prepend to beginning
- **`'nextSibling'`**: Insert after element
- **`'previousSibling'`**: Insert before element

#### Pattern 1: Dynamic List Building

```typescript
@Sim
@elementDefine('task-list')
class TaskList extends HTMLElement {
  private tasks: any[] = [];
  private taskIdCounter = 0;

  // Append new task to bottom of list
  @appendChild('#task-list', { position: 'lastChild' })
  addTask(title: string, priority: 'low' | 'medium' | 'high' = 'medium') {
    const id = ++this.taskIdCounter;
    const bgColor = { low: '#e8f5e9', medium: '#fff3e0', high: '#ffebee' }[priority];

    return htmlFragment`
      <div class="task-item" data-id="${id}" style="background: ${bgColor}; padding: 12px; margin: 8px 0; border-radius: 4px;">
        <div class="task-header">
          <input type="checkbox" class="task-checkbox" data-id="${id}">
          <span class="task-title">${title}</span>
          <span class="task-priority">${priority.toUpperCase()}</span>
        </div>
        <button class="task-delete" swc-on-click="$host.deleteTask(${id})">🗑️ Delete</button>
      </div>
    `;
  }

  // Prepend urgent task to top of list
  @appendChild('#task-list', { position: 'firstChild' })
  addUrgentTask(title: string) {
    return htmlFragment`
      <div class="task-item urgent" style="background: #ffcdd2; padding: 12px; border: 2px solid #f44336;">
        <strong>🚨 URGENT: ${title}</strong>
        <button swc-on-click="$host.deleteTask()">Close</button>
      </div>
    `;
  }

  deleteTask(id?: number) {
    console.log('Delete task:', id);
  }

  @onConnectedInnerHtml
  render() {
    return `
      <div>
        <div class="task-input">
          <input type="text" id="new-task" placeholder="Enter task...">
          <select id="priority">
            <option value="low">Low</option>
            <option value="medium" selected>Medium</option>
            <option value="high">High</option>
          </select>
          <button swc-on-click="
            const input = document.getElementById('new-task');
            const priority = document.getElementById('priority').value;
            if (priority === 'high') {
              $host.addUrgentTask(input.value);
            } else {
              $host.addTask(input.value, priority);
            }
            input.value = '';
            input.focus();
          ">Add Task</button>
        </div>
        <div id="task-list"></div>
      </div>
    `;
  }
}
```

#### Pattern 2: Notification Stack

```typescript
@Sim
@elementDefine('notification-stack')
class NotificationStack extends HTMLElement {
  private notificationId = 0;

  // Append notifications to stack (they auto-dismiss)
  @appendChild('.notifications', { position: 'lastChild' })
  notify(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', duration = 5000) {
    const id = ++this.notificationId;
    const bgColor = { info: '#e3f2fd', success: '#e8f5e9', warning: '#fff3e0', error: '#ffebee' }[type];
    const borderColor = { info: '#2196f3', success: '#4caf50', warning: '#ff9800', error: '#f44336' }[type];

    // Auto-remove after duration
    setTimeout(() => {
      const el = document.querySelector(`[data-notify-id="${id}"]`);
      if (el) el.remove();
    }, duration);

    return htmlFragment`
      <div class="notification" data-notify-id="${id}" 
           style="background: ${bgColor}; border-left: 4px solid ${borderColor}; padding: 16px; margin: 8px 0; border-radius: 4px; display: flex; justify-content: space-between;">
        <span>${message}</span>
        <button swc-on-click="this.closest('[data-notify-id]').remove()"
                style="background: none; border: none; cursor: pointer; font-size: 18px;">×</button>
      </div>
    `;
  }

  @onConnectedInnerHtml
  render() {
    return `
      <div class="notifications" style="position: fixed; top: 20px; right: 20px; width: 300px; z-index: 1000;"></div>
    `;
  }
}

// Usage
const notifier = document.querySelector('notification-stack');
notifier.notify('Operation successful!', 'success');
notifier.notify('Something went wrong', 'error');
```

---

## 🛠 Template Utilities

SWC provides powerful utilities to create DOM nodes using **Tagged Template Literals**. These are perfect for use with surgical decorators like `@replaceChildren`, `@appendChild`, and `@replaceChildren`.

### Complete Factory List

SWC provides element factories for **all common HTML tags**:

```typescript
import {
  htmlFragment, textNode,
  htmlDivElement, htmlSpanElement, htmlButtonElement,
  htmlInputElement, htmlFormElement,
  htmlTableElement, htmlTrElement, htmlTdElement,
  htmlUlElement, htmlLiElement,
  htmlHeadingElement, htmlImageElement,
  // ... 50+ more factories
} from '@dooboostore/simple-web-component';
```

### 1. `htmlFragment` - DOM Fragments

Returns a `DocumentFragment` from an HTML string. Perfect for multi-element insertion.

```typescript
@Sim
@elementDefine('fragment-demo')
class FragmentDemo extends HTMLElement {
  @replaceChildren('#container')
  renderMultipleElements() {
    // All elements wrapped in one fragment for efficient insertion
    return htmlFragment`
      <h2>Title</h2>
      <p>First paragraph</p>
      <p>Second paragraph</p>
      <ul>
        <li>Item 1</li>
        <li>Item 2</li>
      </ul>
    `;
  }

  @onConnectedInnerHtml
  render() {
    return `<div id="container"></div>`;
  }
}
```

### 2. `textNode` - Pure Text Nodes

Create raw text nodes (useful for escaping HTML or building text content).

```typescript
@Sim
@elementDefine('text-renderer')
class TextRenderer extends HTMLElement {
  @appendChild('.text-list', { position: 'lastChild' })
  addPlainText(userInput: string) {
    // Create pure text node - prevents XSS
    return textNode`User wrote: ${userInput}`;
  }

  @onConnectedInnerHtml
  render() {
    return `
      <input type="text" id="user-input" placeholder="Enter text...">
      <button swc-on-click="
        const input = document.getElementById('user-input');
        $host.addPlainText(input.value);
        input.value = '';
      ">Add Text</button>
      <div class="text-list"></div>
    `;
  }
}
```

### 3. Element Factories (`html***Element`)

Specific factories for common tags. Each returns a **typed element instance**.

```typescript
@Sim
@elementDefine('element-factory-demo')
class ElementFactoryDemo extends HTMLElement {
  // htmlDivElement returns HTMLDivElement (typed)
  @appendChild('#container')
  addCard(title: string, description: string) {
    return htmlDivElement`
      <div class="card">
        <h3>${title}</h3>
        <p>${description}</p>
        <button class="card-btn">Learn More</button>
      </div>
    `;
  }

  // htmlTableElement for building tables
  @replaceChildren('#table-container')
  buildTable(data: Array<{ name: string; age: number; role: string }>) {
    const headerRow = htmlTrElement`
      <tr style="background: #f0f0f0; font-weight: bold;">
        <td>Name</td>
        <td>Age</td>
        <td>Role</td>
      </tr>
    `;

    const rows = data.map(item => 
      htmlTrElement`
        <tr>
          <td>${item.name}</td>
          <td>${item.age}</td>
          <td>${item.role}</td>
        </tr>
      `
    );

    return htmlTableElement`
      ${headerRow}
      ${rows}
    `;
  }

  // htmlUlElement for lists
  @appendChild('.sidebar')
  addMenuList(items: string[]) {
    const listItems = items.map(item =>
      htmlLiElement`<li><a href="#">${item}</a></li>`
    );

    return htmlUlElement`
      <ul class="menu">
        ${listItems}
      </ul>
    `;
  }

  @onConnectedInnerHtml
  render() {
    return `
      <div id="container"></div>
      <div id="table-container"></div>
      <div class="sidebar"></div>
    `;
  }
}
```

---

## ⚡ Quick Start

```ts
import 'reflect-metadata';
import swcRegister, { elementDefine, onConnectedInnerHtml } from '@dooboostore/simple-web-component';

swcRegister(window);

@elementDefine('hello-swc')
class HelloSwc extends HTMLElement {
  @onConnectedInnerHtml({ useShadow: true })
  render() {
    return `<style>:host{display:block;padding:12px;background:#111;color:#fefefe}</style><slot>Hello SWC</slot>`;
  }
}

// <hello-swc> contents render automatically once the element is connected.
```

- Call `swcRegister(window)` once per window to register structural elements (`swc-if`, `swc-loop`, etc.) globally.
- Decorators rely on `reflect-metadata`, so make sure it is imported before defining elements.

---

## 🧪 Interactive Test Cases

Every decorator and directive ships with runnable playgrounds under [test/case/src](test/case/src). They double as living documentation.

1. Install dependencies at the repo root: `pnpm install`.
2. Start the playground server:
   ```bash
   cd packages/@dooboostore/simple-web-component/test/case
   pnpm run dev
   ```
3. Open `http://localhost:3005` and pick a scenario from the menu.

| Scenario | Folder | Highlights |
| --- | --- | --- |
| Lifecycle hooks | `lifecycle/` | All pre/post connect, disconnect, adopt hooks with parent-child ordering. |
| Attribute flow | `attr/` and `attribute-test/` | DOM-first attribute sync, `@setAttribute`, `@changedAttribute`, `connectedInitialize` edge cases. |
| Events | `event/` and `event-attribute/` | Direct binding, delegation, special selectors, `swc-on-*`, custom event emission. |
| Queries | `query/` | `@query`, `@queryAll`, special selectors like `:appHost`, element injection safety. |
| Structural directives | `swc-loop/`, `swc-if/`, `swc-choose/`, `swc-async/` | Surgical list handling, portal rendering, async template states. |
| SPA & DI | `spa/` | Multiple `<swc-app>` instances, DI containers, nested routers. |
| Performance | `load-test/` | 1,000+ node stress tests showcasing zero MutationObserver overhead. |

Each folder contains an `index.ts` that demonstrates the decorator usage and an `index.html` you can load standalone if needed.

---

## 🧱 Project Layout

- [src/](src) holds the production TypeScript sources (decorators, structural elements, router, utilities).
- [test/case/src](test/case/src) aggregates example applications used in documentation and regression checks.
- [test/case/src/README.md](test/case/src/README.md) provides an overview of every scenario along with the architectural ideas they validate.

---

## 🛠 Developer Scripts

Inside [package.json](package.json) you will find task shortcuts:

- `pnpm run build` – produce ESM, CJS, and bundle artifacts (`dist/`).
- `pnpm run watch` – rebuild all targets on file changes.
- `pnpm run build:esm` / `build:cjs` – individual module formats when you only care about one output.
- `pnpm run test:bundle` – launches the bundle regression playground (`@dooboostore/simple-web-component-bundle-test`).
- `pnpm run typecheck` – validate TypeScript types without emitting output.

Publishing uses `publish:npm`, which runs a clean build, packs artifacts, and pushes them with the correct metadata.

---

## 🌐 Server-Side Rendering (SSR) & Hydration

SWC provides seamless SSR support with automatic tag-name preservation and client-side hydration strategies.

### SSR Features
- **Tag Name Preservation**: Custom element tags (e.g., `<user-route>`, `<index-router>`) are preserved through the SSR virtual DOM layer.
- **Metadata-Based Registration**: The `CustomElementRegistry` stores tagname metadata during `define()`, allowing `HTMLElementBase` to auto-infer correct tag names during construction.
- **Virtual Window Support**: Pass a custom window object to `@elementDefine()` for SSR rendering environments.

### Hydration Modes
When connecting a server-rendered app to the client, choose a connection strategy via the `connectMode` config:

```typescript
const config = {
  rootRouter: RootRouter,
  routeType: 'element',
  connectMode: 'swap' // or 'direct' (default)
};

app.connect(config);
```

#### Mode Behaviors:
- **`'direct'`** (default): Directly connects the existing rendered DOM tree.
- **`'swap'`**: Creates a clone of the rendered app, connects it, and smoothly replaces the original DOM (Zero FOUC - Flash of Unstyled Content).

The swap mode is ideal for SSR workflows where you want to:
1. Render components on the server with proper tag names
2. Send minimal HTML to the client
3. Clone and connect on the client side without visible DOM flashing

---

## 🌐 Revolutionary SPA Architecture

SWC introduces a **paradigm shift** in SPA design: **Each component scope is an independent, self-contained application** with its own DI container, router, and lifecycle. This enables true micro-frontend architectures without iframe overhead while maintaining perfect encapsulation.

### Core Philosophy: Multi-App Composition
Unlike traditional SPAs that force a global router and monolithic state tree, SWC allows:
- **Nested Independent Apps**: Multiple `<swc-app>` instances on the same page, each with zero cross-contamination
- **Autonomous Routing**: Each app handles its own navigation, history, and component lifecycle independently
- **Decentralized DI**: Service dependencies are resolved within app scope, enabling natural code splitting and lazy loading
- **Island Architecture**: Apps boot only when needed, reducing initial JavaScript payload

---

### 1. Isolated App Scopes & Micro-Frontend Pattern

Create a self-contained universe with `<swc-app>`. The tag acts as a **boundary** where routing, DI, and state are completely isolated from sibling apps.

```html
<!-- Example: Multi-tenant dashboard with independent feature modules -->
<div class="dashboard">
  <!-- User Management Module -->
  <swc-app swc-get-application-config="createUserModule()"></swc-app>
  
  <!-- Reports Module -->
  <swc-app swc-get-application-config="createReportsModule()"></swc-app>
  
  <!-- Settings Module -->  
  <swc-app swc-get-application-config="createSettingsModule()"></swc-app>
</div>

<script>
  // Each module is bootstrapped independently
  window.createUserModule = (host) => ({
    rootRouter: UserManagementRouter,  // Entry point router
    routeType: 'element',              // 'element' (in-memory), 'hash', or 'path'
    path: '/dashboard',                // Initial route
    window: window                     // Optional: SSR virtual window
  });

  window.createReportsModule = (host) => ({
    rootRouter: ReportsRouter,
    routeType: 'element',
    path: '/overview',
    window: window
  });

  // External programmatic navigation (from parent scope)
  function switchUserModule(userId) {
    const userApp = document.querySelectorAll('swc-app')[0];
    userApp.routing(`/user/${userId}`); // Navigate within the isolated app
  }

  // Inter-app communication (if needed)
  function notifyModules(eventName, data) {
    document.querySelectorAll('swc-app').forEach(app => {
      app.dispatchEvent(new CustomEvent(eventName, { detail: data }));
    });
  }
</script>
```

**Key Insights:**
- Each `<swc-app>` is **completely isolated**: one app's router state doesn't affect another
- No global namespace pollution: services, routes, and components live within app scope
- Perfect for **dashboard layouts, plugin architectures, and federated frontends**

---

### 2. Advanced DI-Powered Routing with Lifecycle Hooks

SWC routing leverages **Dependency Injection** to inject services directly into components, enabling dynamic route guards, permission checks, and data preloading.

```typescript
// ============================================
// 1. SERVICE LAYER (Shared by all routes)
// ============================================
@Sim
class AuthService {
  private user: { id: string; role: 'admin' | 'user' } | null = null;

  async login(credentials: { username: string; password: string }) {
    // Simulate API call
    this.user = { id: 'user123', role: 'admin' };
    return this.user;
  }

  async logout() {
    this.user = null;
  }

  getCurrentUser() {
    return this.user;
  }

  hasRole(role: string) {
    return this.user?.role === role;
  }
}

@Sim
class UserService {
  constructor(private auth: AuthService) {}

  async getUsers() {
    if (!this.auth.hasRole('admin')) {
      throw new Error('Unauthorized');
    }
    return [
      { id: '1', name: 'John Doe', email: 'john@example.com' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com' }
    ];
  }

  async getUserById(id: string) {
    return { id, name: 'User ' + id, email: `user${id}@example.com` };
  }
}

// ============================================
// 2. ROUTE COMPONENTS (Nested routing)
// ============================================
@Sim
@Router({
  path: '/admin',
  route: {
    '/users': UserListPage,
    '/users/:id': UserDetailPage,
    '/settings': SettingsPage
  }
})
@elementDefine('admin-router')
class AdminRouter extends HTMLElement implements RouterAction.CanActivate {
  constructor(private auth: AuthService) { super(); }

  @onConnectedInnerHtml({ useShadow: true })
  render() {
    return `
      <style>
        :host { display: flex; height: 100vh; }
        .sidebar { width: 200px; background: #333; color: white; padding: 20px; }
        .sidebar nav a { display: block; margin: 10px 0; color: #0066cc; cursor: pointer; }
        .content { flex: 1; padding: 20px; }
      </style>
      <div class="sidebar">
        <h3>Admin Panel</h3>
        <nav>
          <a swc-on-click="$host.router.go('/admin/users')">Users</a>
          <a swc-on-click="$host.router.go('/admin/settings')">Settings</a>
        </nav>
      </div>
      <div class="content">
        <slot></slot>
      </div>
    `;
  }

  // Lifecycle hook: Called BEFORE route transition
  // Used for permission checks, data preloading, etc.
  async canActivate(url: RoutingDataSet, data?: any) {
    // Only admin can enter this route
    if (!this.auth.hasRole('admin')) {
      console.warn('Access Denied: Admin role required');
      return false;
    }

    // If data is a rendered component (Node), inject it into DOM
    if (data instanceof Node) {
      this.replaceChildren(data);
    }

    return true;
  }
}

// ============================================
// 3. PAGE COMPONENTS (Leaf routes)
// ============================================
@Sim
@elementDefine('user-list-page')
class UserListPage extends HTMLElement {
  private users: any[] = [];

  constructor(
    private userService: UserService,
    private router: Router,
    private auth: AuthService
  ) {
    super();
  }

  @onConnected
  async loadUsers() {
    try {
      this.users = await this.userService.getUsers();
      this.render();
    } catch (error) {
      console.error('Failed to load users:', error);
      this.innerHTML = '<p style="color: red;">Failed to load users</p>';
    }
  }

  @classList('active')
  isActive = false;

  @onConnectedInnerHtml
  render() {
    return `
      <style>
        .user-table { width: 100%; border-collapse: collapse; }
        .user-table th, .user-table td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        .user-table tr:hover { background: #f5f5f5; }
      </style>
      <h2>Users</h2>
      <table class="user-table">
        <thead>
          <tr><th>Name</th><th>Email</th><th>Actions</th></tr>
        </thead>
        <tbody>
          ${this.users.map(u => `
            <tr>
              <td>${u.name}</td>
              <td>${u.email}</td>
              <td>
                <button swc-on-click="$host.router.go('/admin/users/${u.id}')">View</button>
                <button swc-on-click="$host.deleteUser('${u.id}')">Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  deleteUser(id: string) {
    if (confirm('Delete this user?')) {
      this.users = this.users.filter(u => u.id !== id);
      this.render();
    }
  }
}

@Sim
@elementDefine('user-detail-page')
class UserDetailPage extends HTMLElement {
  private user: any = null;

  constructor(
    private userService: UserService,
    private router: Router
  ) {
    super();
  }

  @onConnected
  async loadUser() {
    // Extract route parameter (:id)
    const id = this.router.getIntent()?.params?.id;
    if (id) {
      this.user = await this.userService.getUserById(id);
      this.render();
    }
  }

  @onConnectedInnerHtml
  render() {
    if (!this.user) return '<p>Loading...</p>';

    return `
      <style>
        .detail { max-width: 600px; background: #f9f9f9; padding: 20px; border-radius: 8px; }
        .detail-row { margin: 10px 0; }
        .detail-label { font-weight: bold; color: #333; }
      </style>
      <h2>User Details</h2>
      <div class="detail">
        <div class="detail-row">
          <span class="detail-label">ID:</span> ${this.user.id}
        </div>
        <div class="detail-row">
          <span class="detail-label">Name:</span> ${this.user.name}
        </div>
        <div class="detail-row">
          <span class="detail-label">Email:</span> ${this.user.email}
        </div>
      </div>
      <button swc-on-click="$host.router.back()">Back</button>
    `;
  }
}

// ============================================
// 4. ROOT ROUTER (Entry point)
// ============================================
@Sim
@Router({
  path: '/',
  route: {
    '/': HomePage,
    '/login': LoginPage,
    '/admin': AdminRouter
  }
})
@elementDefine('app-router')
class RootRouter extends HTMLElement implements RouterAction.CanActivate {
  constructor(private auth: AuthService) { super(); }

  @onConnectedInnerHtml({ useShadow: true })
  render() {
    const user = this.auth.getCurrentUser();
    return `
      <style>
        :host { display: block; font-family: Arial, sans-serif; }
        header { background: #222; color: white; padding: 15px; }
        header .user-info { float: right; font-size: 12px; }
      </style>
      <header>
        <h1>SWC App</h1>
        <div class="user-info">
          ${user ? `Logged in as: ${user.id} (${user.role})` : 'Not logged in'}
        </div>
      </header>
      <main><slot></slot></main>
    `;
  }

  async canActivate(url: RoutingDataSet, data?: any) {
    if (data instanceof Node) {
      this.replaceChildren(data);
    }
    return true;
  }
}
```

---

### 3. Route Lifecycle & Guard Patterns

**The `canActivate` lifecycle hook** is called **before** entering a route. Use it for:
- **Permission Checks**: Verify user roles and access rights
- **Data Preloading**: Fetch required data before rendering
- **Route Interception**: Redirect to login or error pages
- **Analytics**: Track user navigation

```typescript
@Router({ path: '/protected', route: { '/data': ProtectedDataPage } })
@elementDefine('protected-router')
class ProtectedRouter extends HTMLElement implements RouterAction.CanActivate {
  constructor(private auth: AuthService) { super(); }

  async canActivate(url: RoutingDataSet, data?: any) {
    // Guard: Redirect if not authenticated
    if (!this.auth.getCurrentUser()) {
      console.log('Redirecting to login...');
      this.parentElement?.querySelector('app-router')?.routing('/login');
      return false;
    }

    // Data injection: Component receives pre-fetched data
    if (data instanceof Node) {
      this.replaceChildren(data);
    }

    return true;
  }
}
```

---

### 4. Advanced Patterns: Nested Routers & State Management

```typescript
// Real-world: Multi-level nested routing with shared state
@Sim
class GridStateService {
  private sortBy = 'name';
  private filterRole = '';

  setSortBy(field: string) { this.sortBy = field; }
  setFilterRole(role: string) { this.filterRole = role; }
  getSortBy() { return this.sortBy; }
  getFilterRole() { return this.filterRole; }
}

@Sim
@Router({
  path: '/crm',
  route: {
    '/contacts': ContactsRouter,
    '/accounts': AccountsRouter
  }
})
@elementDefine('crm-app')
class CRMApp extends HTMLElement implements RouterAction.CanActivate {
  async canActivate(url: RoutingDataSet, data?: any) {
    if (data instanceof Node) this.replaceChildren(data);
    return true;
  }

  @onConnectedInnerHtml
  render() {
    return `<div><slot></slot></div>`;
  }
}
```

---

## ✉️ Declarative & Scoped Messaging System

SWC provides a **hierarchical messaging architecture** using native browser events with intelligent scoping. No external event bus or state manager needed—messages flow naturally through the DOM hierarchy.

### Message Scope Hierarchy

Messages can target different scopes using **Special Selectors**:

| Selector | Scope | Use Case |
|----------|-------|----------|
| **`:appHost`** | Same `<swc-app>` instance | Module-to-module communication (confined) |
| **`:parentHost`** | Direct parent SWC component | Parent-child coordination |
| **`:window` / `:document`** | Entire page | Global broadcasts (Cross-app signals) |
| **`:firstHost` / `:firstAppHost`** | Root of hierarchy | Communication with top-level container |
| **`selector`** (CSS) | Direct query result | Point-to-point messaging |

### Pattern 1: App-Scoped Communication

Communicate within a micro-app without affecting siblings.

```typescript
// ========== SENDER COMPONENT ==========
@Sim
@elementDefine('auth-panel')
class AuthPanel extends HTMLElement {
  constructor(private auth: AuthService) { super(); }

  @onConnectedInnerHtml
  render() {
    return `
      <div style="padding: 10px; background: #f0f0f0; border-radius: 4px;">
        <button swc-on-click="$host.onLogin()">Login</button>
        <button swc-on-click="$host.onLogout()">Logout</button>
      </div>
    `;
  }

  // Emit event to the nearest parent <swc-app>
  @emitCustomEvent(':appHost', 'auth-changed')
  async onLogin() {
    await this.auth.login({ username: 'demo', password: 'demo' });
    return { user: this.auth.getCurrentUser(), timestamp: Date.now() };
  }

  @emitCustomEvent(':appHost', 'auth-changed')
  async onLogout() {
    await this.auth.logout();
    return { user: null, timestamp: Date.now() };
  }
}

// ========== RECEIVER COMPONENT (SAME APP) ==========
@Sim
@elementDefine('user-widget')
class UserWidget extends HTMLElement {
  private user: any = null;

  @onConnectedInnerHtml
  render() {
    return `
      <div style="padding: 10px; background: #e8f4f8; border-radius: 4px;">
        ${this.user ? `<p>Welcome, ${this.user.name}!</p>` : '<p>Not logged in</p>'}
      </div>
    `;
  }

  // Listen for auth changes within the same app
  @addEventListener(':appHost', 'auth-changed')
  onAuthChanged(event: CustomEvent) {
    const { detail } = event;
    this.user = detail.user;
    this.render();
    console.log('Auth state changed at:', new Date(detail.timestamp).toLocaleTimeString());
  }
}

// HTML
<swc-app swc-get-application-config="dashboardConfig()">
  <auth-panel></auth-panel>
  <user-widget></user-widget>  <!-- Reacts to auth-changed event -->
</swc-app>
```

**Result**: When user clicks "Login" in `<auth-panel>`, `<user-widget>` is notified and updates automatically. No explicit imperative connection needed.

---

### Pattern 2: Cross-Module (Global) Broadcasting

Send a signal that reaches all apps on the page.

```typescript
// ========== SENDER (In Module A) ==========
@Sim
@elementDefine('notification-sender')
class NotificationSender extends HTMLElement {
  @emitCustomEvent(':window', 'system-notification')
  announceSystemMaintenance() {
    return {
      title: 'System Maintenance',
      message: 'Server will be down for 2 hours',
      severity: 'warning',
      timestamp: new Date().toISOString()
    };
  }

  @onConnectedInnerHtml
  render() {
    return `
      <button swc-on-click="$host.announceSystemMaintenance()">
        📢 Broadcast Maintenance Alert
      </button>
    `;
  }
}

// ========== RECEIVER (In Module B, Different App) ==========
@Sim
@elementDefine('notification-display')
class NotificationDisplay extends HTMLElement {
  private notifications: any[] = [];

  @addEventListener(':window', 'system-notification')
  onSystemNotification(event: CustomEvent) {
    this.notifications.push(event.detail);
    this.render();
  }

  @onConnectedInnerHtml
  render() {
    return `
      <div style="position: fixed; top: 10px; right: 10px; font-size: 12px;">
        ${this.notifications.map(n => `
          <div style="background: ${n.severity === 'warning' ? '#fff3cd' : '#fff'}; 
                      border: 1px solid #ffc107; padding: 10px; margin: 5px 0; 
                      border-radius: 4px; max-width: 300px;">
            <strong>${n.title}</strong><br>
            ${n.message}
          </div>
        `).join('')}
      </div>
    `;
  }
}

<!-- Two independent apps receiving the same broadcast -->
<swc-app swc-get-application-config="moduleAConfig()">
  <notification-sender></notification-sender>
</swc-app>

<swc-app swc-get-application-config="moduleBConfig()">
  <notification-display></notification-display>
</swc-app>
```

**Result**: Clicking the button in Module A instantly triggers the notification in Module B, even though they're in separate `<swc-app>` instances.

---

### Pattern 3: Hierarchical Parent-Child Messaging

Communicate up and down the component tree with `$parentHost` and `:hosts` selector.

```typescript
// ========== PARENT CONTAINER ==========
@Sim
@elementDefine('modal-container')
class ModalContainer extends HTMLElement {
  private modals: any[] = [];

  @onConnectedInnerHtml
  render() {
    return `
      <div style="position: relative;">
        <slot></slot>
        ${this.modals.map(m => `
          <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                      background: white; border: 2px solid #333; padding: 20px; 
                      border-radius: 8px; z-index: 1000;">
            ${m.content}
            <button swc-on-click="$host.closeModal()">Close</button>
          </div>
        `).join('')}
      </div>
    `;
  }

  // Listen for child components requesting to open a modal
  @addEventListener(':hosts', 'request-modal')
  onModalRequest(event: CustomEvent) {
    this.modals.push({ id: Date.now(), content: event.detail.html });
    this.render();
    event.stopPropagation();
  }

  closeModal() {
    this.modals.pop();
    this.render();
  }
}

// ========== CHILD COMPONENT ==========
@Sim
@elementDefine('form-with-modal')
class FormWithModal extends HTMLElement {
  @emitCustomEvent(':parentHost', 'request-modal')
  showHelpModal() {
    return {
      html: '<h3>Help</h3><p>Fill in all required fields and click Submit.</p>'
    };
  }

  @onConnectedInnerHtml
  render() {
    return `
      <form>
        <input type="text" placeholder="Full Name" required>
        <button type="button" swc-on-click="$host.showHelpModal()">?</button>
        <button type="submit">Submit</button>
      </form>
    `;
  }
}

<!-- Structure -->
<modal-container>
  <form-with-modal></form-with-modal>
</modal-container>
```

**Result**: Clicking "?" in the child form opens a modal managed by the parent container.

---

### Pattern 4: Event Detail Payloads

Send rich data structures through events.

```typescript
@Sim
@elementDefine('data-grid')
class DataGrid extends HTMLElement {
  private rows: any[] = [];

  @onConnected
  loadData() {
    this.rows = [
      { id: 1, name: 'Alice', age: 28, department: 'Engineering' },
      { id: 2, name: 'Bob', age: 34, department: 'Sales' }
    ];
    this.render();
  }

  // Emit complex payload when row is clicked
  @emitCustomEvent(':appHost', 'row-selected', false) // 3rd arg: whether to bubble
  selectRow(rowId: number) {
    const row = this.rows.find(r => r.id === rowId);
    return {
      rowId,
      rowData: row,
      timestamp: Date.now(),
      gridId: this.id,
      userAgent: navigator.userAgent
    };
  }

  @onConnectedInnerHtml
  render() {
    return `
      <table>
        <tbody>
          ${this.rows.map(row => `
            <tr swc-on-click="$host.selectRow(${row.id})">
              <td>${row.name}</td>
              <td>${row.age}</td>
              <td>${row.department}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }
}

// Listener receives all payload details
@Sim
@elementDefine('detail-panel')
class DetailPanel extends HTMLElement {
  private selectedData: any = null;

  @addEventListener(':appHost', 'row-selected')
  onRowSelect(event: CustomEvent) {
    const { rowData, timestamp } = event.detail;
    this.selectedData = rowData;
    console.log(`Selected at ${new Date(timestamp).toLocaleTimeString()}`);
    this.render();
  }

  @onConnectedInnerHtml
  render() {
    if (!this.selectedData) return '<p>No selection</p>';
    return `
      <div>
        <h3>${this.selectedData.name}</h3>
        <p>Age: ${this.selectedData.age}</p>
        <p>Department: ${this.selectedData.department}</p>
      </div>
    `;
  }
}
```

---

## 🏰 Host Hierarchy, Context Propagation & Template Events

SWC automatically traverses the component tree to provide meaningful **context** to scripts and event handlers. This eliminates the need for prop drilling and global state managers.

### Context Variables (In Templates & Event Handlers)

When you use `swc-on-*` inline events or callback functions, these variables are automatically injected:

| Variable | Type | Description |
|----------|------|-------------|
| **`$host`** | `HTMLElement` | The component that owns the event handler (the element itself) |
| **`$parentHost`** | `HTMLElement` | The direct parent SWC component |
| **`$appHost`** | `SwcAppInterface` | The nearest parent `<swc-app>` boundary |
| **`$hosts`** | `HTMLElement[]` | Array of ALL SWC ancestors: `[Root, Parent, ..., Self]` |
| **`$el`** | `HTMLElement` | The actual DOM element that triggered the event |
| **`$item`** | `any` | (In `swc-loop`) Current iteration item |
| **`$index`** | `number` | (In `swc-loop`) Current iteration index |

### Pattern 1: Declarative Inline Events (`swc-on-*`)

Bind events directly in HTML templates. The context is automatically available.

```typescript
@Sim
@elementDefine('todo-item')
class TodoItem extends HTMLElement {
  private title = '';
  private done = false;

  constructor(private todoService: TodoService) { super(); }

  @onConnectedInnerHtml
  render() {
    return `
      <style>
        .completed { text-decoration: line-through; color: #ccc; }
        button { margin-left: 10px; padding: 2px 8px; cursor: pointer; }
      </style>
      <li class="${this.done ? 'completed' : ''}">
        <!-- Access $host (self), $appHost (parent app), and $item -->
        <span>${this.title}</span>
        
        <!-- Inline script with full context -->
        <button swc-on-click="
          $host.toggleDone();
          console.log('Current item:', $item);
          console.log('App instance:', $appHost);
        ">
          ${this.done ? '✓ Done' : '○ Pending'}
        </button>

        <button swc-on-click="$host.deleteTodo($index)">
          🗑️ Delete
        </button>

        <!-- Access element coordinates -->
        <button swc-on-click="
          console.log('Clicked at:', $el.getBoundingClientRect());
        ">
          Info
        </button>
      </li>
    `;
  }

  toggleDone() {
    this.done = !this.done;
    this.render();
  }

  deleteTodo(index: number) {
    console.log('Deleting todo at index:', index);
  }
}
```

### Pattern 2: Loop Iteration Context

`swc-loop` provides special iteration variables you can access in inline events.

```typescript
@Sim
@elementDefine('todo-list')
class TodoList extends HTMLElement {
  private todos = [
    { id: 1, title: 'Learn SWC', done: false },
    { id: 2, title: 'Build an app', done: false }
  ];

  @onConnectedInnerHtml
  render() {
    return `
      <ul>
        <template is="swc-loop" on-get-value="todos"
            on-clone-node="
              if ($isElement) {
                console.log('Cloning item:', $item, 'at index:', $index);
                $node.querySelector('.index').textContent = $index + 1;
              }
            ">
          <li class="todo-item">
            <span class="index">0</span>. 
            <span class="title">${'${item.title}'}</span>
            <!-- Callback receives full context -->
            <button swc-on-click="
              $host.editTodo($item.id, $index, $el);
              console.log('Hosts hierarchy:', $hosts.map(h => h.tagName));
            ">
              Edit
            </button>
          </li>
        </template>
      </ul>
    `;
  }

  editTodo(id: number, index: number, element: HTMLElement) {
    console.log(`Editing todo #${id} (index: ${index}):`, element);
  }
}
```

### Pattern 3: Accessing Ancestor Services via Context

Use `$appHost` to access services from the parent app's DI container.

```typescript
@Sim
@elementDefine('child-component')
class ChildComponent extends HTMLElement {
  @onConnectedInnerHtml
  render() {
    return `
      <div>
        <!-- Access parent app's router to navigate -->
        <button swc-on-click="$appHost.routing('/dashboard')">
          Go to Dashboard
        </button>

        <!-- Access other components in the app -->
        <button swc-on-click="
          const sibling = document.querySelector('other-component');
          sibling.triggerUpdate();
        ">
          Notify Sibling
        </button>

        <!-- Emit event up the tree to parent app -->
        <button swc-on-click="
          $appHost.dispatchEvent(new CustomEvent('child-ready', {
            detail: { child: $host, timestamp: Date.now() }
          }));
        ">
          Notify Parent App
        </button>
      </div>
    `;
  }
}
```

### Pattern 4: Host Hierarchy Traversal

Manually traverse the component tree to find ancestors or siblings.

```typescript
@Sim
@elementDefine('deep-child')
class DeepChild extends HTMLElement {
  findRootApp() {
    // Traverse up until you find <swc-app> or root
    let current = this.parentElement as any;
    while (current && current.tagName !== 'SWC-APP') {
      current = current.parentElement;
    }
    return current;
  }

  getSiblingCount() {
    // Count siblings at same level
    return this.parentElement?.querySelectorAll(':scope > *').length || 0;
  }

  @onConnectedInnerHtml
  render() {
    return `
      <div>
        <p>Root app: ${this.findRootApp()?.getAttribute('id')}</p>
        <p>Sibling count: ${this.getSiblingCount()}</p>
      </div>
    `;
  }
}
```

### Real-World Example: Multi-Level Navigation with Context

```typescript
// ============ ROOT ROUTER ============
@Sim
@Router({ path: '/', route: { '/dashboard': Dashboard, '/profile': Profile } })
@elementDefine('app-root')
class AppRoot extends HTMLElement {
  private breadcrumbs: string[] = [];

  @onConnectedInnerHtml
  render() {
    return `
      <div>
        <header>
          <h1>My App</h1>
          <nav>
            <button swc-on-click="$host.router.go('/dashboard')">Dashboard</button>
            <button swc-on-click="$host.router.go('/profile')">Profile</button>
          </nav>
          <p>Breadcrumbs: ${this.breadcrumbs.join(' > ')}</p>
        </header>
        <main><slot></slot></main>
      </div>
    `;
  }
}

// ============ CHILD ROUTE ============
@Sim
@elementDefine('dashboard-page')
class DashboardPage extends HTMLElement {
  @onConnectedInnerHtml
  render() {
    return `
      <div>
        <h2>Dashboard</h2>
        <button swc-on-click="
          console.log('App router:', $appHost.routing);
          console.log('My tag:', $host.tagName);
          console.log('All ancestors:', $hosts.map(h => h.tagName).join(' -> '));
        ">
          Debug Context
        </button>
      </div>
    `;
  }
}
```

---

## 🏰 Advanced Host Context: Query & Portal Patterns

### Custom Query with Root Options

Combine `@query/@queryAll` with the `root` option from host methods to precision-target elements.

```typescript
@Sim
@elementDefine('form-validator')
class FormValidator extends HTMLElement {
  @query('form', { root: 'light' }) lightForm?: HTMLFormElement;
  @query('.hidden-form', { root: 'shadow' }) shadowForm?: HTMLFormElement;
  @queryAll('input', { root: 'all' }) allInputs?: HTMLInputElement[];

  @onConnectedInnerHtml({ useShadow: true })
  render() {
    return `
      <form class="shadow-form">
        <input type="text" placeholder="Shadow DOM input">
      </form>
      <slot></slot>
    `;
  }

  validateAllForms() {
    // Validate both light and shadow DOM forms
    const allInputs = Array.from(this.allInputs || []);
    return allInputs.every(input => input.value.trim() !== '');
  }
}
```

### Portal Pattern: Render Content Anywhere

Use `on-get-portal` to render content at a completely different location in the DOM.

```typescript
@Sim
@elementDefine('tooltip-manager')
class TooltipManager extends HTMLElement {
  private tooltips: any[] = [];

  @onConnectedInnerHtml
  render() {
    return `
      <style>
        .tooltip { position: fixed; background: #222; color: white; 
                   padding: 8px 12px; border-radius: 4px; font-size: 12px; }
      </style>
      <template is="swc-loop" on-get-value="tooltips"
          on-get-portal="document.body">
        <div class="tooltip" style="left: ${'${item.x}px'}; top: ${'${item.y}px'}">
          ${'${item.text}'}
        </div>
      </template>
    `;
  }

  addTooltip(text: string, x: number, y: number) {
    this.tooltips.push({ text, x, y });
    this.render();
  }
}

// Usage: Tooltip renders outside component hierarchy
const tooltipMgr = document.querySelector('tooltip-manager');
tooltipMgr.addTooltip('Hover info', 100, 50);
```



## 🔄 Structural Directives (Advanced)

SWC provides 4 core templates that empower your HTML without wrapper elements: `swc-loop`, `swc-if`, `swc-choose`, and `swc-async`. They all share a consistent, high-performance API with **zero wrapper elements** and **surgical DOM updates**.

### Common Attributes:
- **`on-get-value`**: Script to fetch data (evaluated in component context).
- **`on-clone-node`**: Callback fired for **each individual node clone** (Args: `$node`, `$item`, `$index`, `$isElement`, etc.).
- **`on-clone-nodes`**: Callback fired **once after all nodes cloned** (Args: `$nodes`, `$elements`, `$state`, etc.).
- **`on-get-portal`**: Render nodes at a different DOM location using a selector.
- **`on-state-changed`**: Track rendering state changes.

### 1. `swc-if` - Binary Conditional Rendering

Show/hide content based on a boolean expression. No DOM wrapper.

```typescript
@Sim
@elementDefine('access-control')
class AccessControl extends HTMLElement {
  private user: any = null;
  private isLoading = false;

  @onConnectedInnerHtml
  render() {
    return `
      <div class="access-panel">
        <!-- Show ONLY if loading (no wrapper) -->
        <template is="swc-if" on-get-value="isLoading">
          <div class="loading-spinner">
            <spinner-component></spinner-component>
            <p>Verifying access...</p>
          </div>
        </template>

        <!-- Show ONLY if user is authenticated -->
        <template is="swc-if" on-get-value="user">
          <template is="swc-default">
            <p class="not-authorized">⛔ You are not authorized to view this content.</p>
          </template>
          <div class="admin-content">
            <h2>Welcome, \${user?.name}! 🎉</h2>
            <p>VIP Access Level: \${user?.role}</p>
          </div>
        </template>
      </div>
    `;
  }
}
```

### 2. `swc-loop` - High-Performance List Rendering

Iterate over arrays with **index-preserving stability** and zero virtual DOM overhead.

```typescript
@Sim
@elementDefine('product-grid')
class ProductGrid extends HTMLElement {
  private products = [
    { id: 1, name: 'Laptop', price: 999 },
    { id: 2, name: 'Mouse', price: 29 }
  ];

  @onConnectedInnerHtml
  render() {
    return `
      <template is="swc-loop" on-get-value="products"
          on-clone-node="
            if ($isElement) {
              $node.querySelector('.price').textContent = '$' + $item.price;
            }
          ">
        <div class="product-card">
          <h3>\${item.name}</h3>
          <p class="price">$\${item.price}</p>
        </div>
      </template>
    `;
  }
}
```

### 3. `swc-choose` - Multi-Branch Conditional

Switch-like behavior for multiple conditions.

```typescript
@templateIsSim
@elementDefine('order-status')
class OrderStatus extends HTMLElement {
  private order = { status: 'shipped' };

  @onConnectedInnerHtml
  render() {
    return `
      <template is="swc-choose" on-get-value="order.status">
        <template is="swc-when" on-get-value="'pending'">
          <p>⏳ Your order is being prepared...</p>
        </template>
        <template is="swc-when" on-get-value="'shipped'">
          <p>📦 Your order has shipped!</p>
        </template>
        <template is="swc-default">
          <p>❌ Order status unknown</p>
        </template>
      </template>
    `;
  }
}
```

### 4. `swc-async` - Async Content Loading

Automatically handle Promise rendering states.

```typescript
@Sim
@elementDefine('async-data')
class AsyncData extends HTMLElement {
  async fetchUserData(userId: string) {
    const response = await fetch(`/api/users/\${userId}`);
    return response.json();
  }

  @onConnectedInnerHtml
  render() {
    return `
      <template is="swc-async" on-get-value="fetchUserData('user123')">
        <template is="swc-pending">
          <p>Loading...</p>
        </template>
        <template is="swc-fulfilled">
          <h2>\${data.name}</h2>
          <p>Email: \${data.email}</p>
        </template>
        <template is="swc-rejected">
          <p>❌ Error: \${error.message}</p>
        </template>
      </template>
    `;
  }
}
```

---

## 🚀 Server-Side Rendering (SSR) Project Example

SWC integrates seamlessly with `@dooboostore/simple-boot-http-server-ssr` to provide **full-stack SSR** applications with automatic tag-name preservation, hydration, and isomorphic routing.

### Project Structure

```
ssr-project/
├── back-end/              # Express/HTTP server with SSR
│   └── index.ts          # SSR entry point
├── front-end/            # Client-side app
│   └── index.ts          # Client bootstrap
├── src/
│   ├── bootfactory.ts    # Universal app configuration
│   ├── components/       # Shared components
│   └── pages/            # Route components (routers + pages)
```

### 1. Backend SSR Setup

The backend renders components on the server and sends HTML to the client:

```typescript
// back-end/index.ts
import { SimpleBootHttpSSRServer } from '@dooboostore/simple-boot-http-server-ssr';
import { SSRSimpleWebComponentFilter } from '@dooboostore/simple-boot-http-server-ssr';
import swcRegister from '@dooboostore/simple-web-component';
import bootfactory from '@swc-src/bootfactory';

const swcFilter = new SSRSimpleWebComponentFilter({
  frontDistPath: path.resolve(__dirname, '../dist-front-end'),
  frontDistIndexFileName: 'index.html',
  registerComponents: async (window: any) => {
    // 1. Register core SWC elements (swc-if, swc-loop, etc.)
    swcRegister(window);

    // 2. Register and bootstrap your app with routing
    const urlPath = window.location.pathname;
    bootfactory(window, urlPath);

    console.log('✅ Components registered for SSR');
  }
});

const server = new SimpleBootHttpSSRServer({
  listen: { port: 8080 },
  filters: [swcFilter]
});

server.listen();
console.log('🚀 SSR Server running on http://localhost:8080');
```

### 2. Universal Bootfactory

The bootfactory runs on **both server and client** with different connection modes:

```typescript
// src/bootfactory.ts
import register from '@dooboostore/simple-web-component';
import { IndexRouter } from './pages/index.router';

export default (window: Window, initialPath?: string) => {
  // Register all components globally
  register(window, [...componentFactories, ...pageFactories]);

  const app = window.document.querySelector('#app') as any;

  const config = {
    rootRouter: IndexRouter.SYMBOL,
    routeType: 'path',                    // Use browser path: /users, /pages/about
    path: initialPath ?? '/',
    window: window
  };

  // Detect client vs server environment
  const isClientWindow = typeof window !== 'undefined' && window === globalThis.window;

  if (isClientWindow) {
    // CLIENT: Use 'swap' mode for zero FOUC hydration
    app.connect({
      ...config,
      connectMode: 'swap'  // Clone → Connect → Replace original
    });
  } else {
    // SERVER: Use 'direct' mode (no swap needed)
    app.connect(config);
  }

  return app;
};
```

### 3. Isomorphic Router & Pages

Define routers that work the same way on server and client:

```typescript
// src/pages/index.router.ts
import { Sim } from '@dooboostore/simple-boot';
import { Router } from '@dooboostore/simple-boot';
import { elementDefine, onConnectedInnerHtml, setAttribute } from '@dooboostore/simple-web-component';
import { RouterAction } from '@dooboostore/simple-boot';

@Sim
@Router({
  path: '',
  route: {
    '/': HomePage.SYMBOL,
    '/user': UserPage.SYMBOL
  }
})
@elementDefine('index-router')
class IndexRouter extends HTMLElement implements RouterAction.CanActivate {
  constructor(private router: Router) {
    super();
  }

  // Lifecycle hook: Called BEFORE entering route
  async canActivate(url: RoutingDataSet, data?: any) {
    // Inject rendered page component
    if (data instanceof Node) {
      console.log(`✅ Rendering: \${data.nodeName}`);
      this.replaceChildren(data);
    }
  }

  @onConnectedInnerHtml({ useShadow: true })
  render() {
    return `
      <style>
        :host { display: block; }
        header { background: #222; color: white; padding: 20px; }
        nav button { margin: 5px; padding: 10px 15px; cursor: pointer; }
        section { padding: 20px; }
      </style>
      <header>
        <h1>SWC + SSR App</h1>
        <nav>
          <button swc-on-click="$host.router.go('/')">🏠 Home</button>
          <button swc-on-click="$host.router.go('/user')">👤 Users</button>
        </nav>
      </header>
      <section><slot></slot></section>
    `;
  }
}
```

### 4. Page Components

```typescript
// src/pages/home.page.ts - Leaf route (no children)
@Sim
@elementDefine('home-page')
class HomePage extends HTMLElement {
  @onConnectedInnerHtml
  render() {
    return `
      <h2>Welcome! 👋</h2>
      <p>This page was rendered on the server and hydrated on the client.</p>
      <template is="swc-loop" on-get-value="[1,2,3]">
        <div style="padding: 10px; background: #f5f5f5; margin: 5px;">
          Item \${item}
        </div>
      </template>
    `;
  }
}

// src/pages/user.router.ts - Nested router with sub-routes
@Sim
@Router({
  path: '/user',
  route: {
    '': UserListPage.SYMBOL,
    '/:id': UserDetailPage.SYMBOL
  }
})
@elementDefine('user-router')
class UserRouter extends HTMLElement implements RouterAction.CanActivate {
  async canActivate(url: RoutingDataSet, data?: any) {
    if (data instanceof Node) {
      this.replaceChildren(data);
    }
  }

  @onConnectedInnerHtml({ useShadow: true })
  render() {
    return `
      <div style="margin-left: 20px;">
        <h2>User Management</h2>
        <slot></slot>
      </div>
    `;
  }
}
```

### 5. Client Entry Point

The client reuses the same bootfactory:

```typescript
// front-end/index.ts
import bootfactory from '@swc-src/bootfactory';
import { UrlUtils } from '@dooboostore/core/url';

console.log('🚀 Client-side app initializing...');

// Get current URL path from browser
const currentPath = UrlUtils.getUrlPath(window.location);

// Bootstrap with swap mode (zero FOUC)
bootfactory(window, currentPath);

console.log('✅ Client app hydrated');
```

### 6. Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     User Request                        │
│                   GET /user/123                         │
└──────────────────────┬──────────────────────────────────┘
                       │
        ┌──────────────▼──────────────┐
        │  Backend SSR Renderer       │
        ├─────────────────────────────┤
        │ 1. bootfactory(virtualWin)  │
        │ 2. IndexRouter routes       │
        │ 3. UserRouter renders       │
        │ 4. UserDetailPage → HTML    │
        └──────────────┬──────────────┘
                       │
        ┌──────────────▼──────────────┐
        │   Sent to Client as HTML    │
        │  <swc-app>                  │
        │   <index-router>            │
        │    <user-router>            │
        │     <user-detail-page>      │
        │    </user-detail-page>      │
        │    </user-router>           │
        │   </index-router>           │
        │  </swc-app>                 │
        └──────────────┬──────────────┘
                       │
        ┌──────────────▼──────────────┐
        │   Client Hydration Swap     │
        ├─────────────────────────────┤
        │ 1. Clone SSR HTML           │
        │ 2. Connect listeners        │
        │ 3. Replace original DOM     │
        │ 4. Fully interactive        │
        └─────────────────────────────┘
```

### 7. Key Benefits

| Aspect | Benefit |
|--------|---------|
| **SEO** | Server renders initial HTML (searchable) |
| **Performance** | Faster First Contentful Paint (FCP) |
| **Tag Preservation** | Custom element tags survive SSR → client |
| **Zero FOUC** | Swap mode clones & replaces seamlessly |
| **Code Sharing** | Same router code on server & client |
| **Island Architecture** | Multiple independent `<swc-app>` instances |
| **Progressive Enhancement** | Works without JavaScript (graceful fallback) |

### 8. Build & Run

```bash
# Build backend (Node.js server)
cd back-end && npm run build

# Build frontend (browser bundle)
cd front-end && npm run build

# Run SSR server on http://localhost:8080
npm start

# Visit http://localhost:8080/user/123
# Server renders UserDetailPage → Client hydrates with swap mode
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
