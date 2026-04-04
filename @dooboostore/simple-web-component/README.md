# @dooboostore/simple-web-component (SWC)
[![NPM version](https://img.shields.io/npm/v/@dooboostore/simple-web-component.svg?color=cb3837&style=flat-square)](https://www.npmjs.com/package/@dooboostore/simple-web-component)
[![Build and Test](https://github.com/dooboostore-develop/packages/actions/workflows/main.yaml/badge.svg?branch=main)](https://github.com/dooboostore-develop/packages/actions/workflows/main.yaml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)


**SWC** is a lightweight, production-ready Web Components framework for building fast, modular, and maintainable SPAs without Virtual DOM overhead.

---

## 🎯 Core Features

### 1. **@elementDefine** - Component Registration
Register Web Components with automatic lifecycle management and DI support.

```typescript
@elementDefine('my-component')
class MyComponent extends HTMLElement {
  @onInitialize
  constructor(private service: MyService) {
    super();
  }
}
```

### 2. **Dependency Injection (@onInitialize)**
Inject services into Web Components using the `@onInitialize` decorator.

```typescript
@elementDefine('dashboard')
class Dashboard extends HTMLElement {
  @onInitialize
  constructor(
    @Inject({ symbol: UserService.SYMBOL }) userService: UserService
  ) {
    super();
    this.userService = userService;
  }
}
```

### 3. **Declarative DOM Updates**

#### @onConnectedInnerHtml
Render HTML automatically when component connects to DOM.

```typescript
@onConnectedInnerHtml({ useShadow: true })
render() {
  return `<div>Hello, <span>${this.name}</span>!</div>`;
}
```

#### @applyInnerHtmlNodeHost
Apply HTML to specific host element.

```typescript
@applyInnerHtmlNodeHost({ root: 'light' })
updateContent() {
  return `<p>Updated content</p>`;
}
```

#### @applyReplaceChildrenNodeHost
Replace child nodes with new content.

```typescript
@applyReplaceChildrenNodeHost({ root: 'light' })
replaceChildren(node: Node) {
  return node;
}
```

### 4. **Event Handling**

#### @addEventListener
Attach event listeners to elements with optional filter support.

```typescript
@addEventListener('#submit-btn', 'click')
onSubmit(event: Event) {
  console.log('Submitted');
}

// Filter events - only process matching events
@addEventListener('button', 'click', {
  filter: (event, helper) => {
    return event.target?.id === 'critical-button';
  }
})
onCriticalClick(event: Event) {
  console.log('Critical action');
}
```

#### @emitCustomEvent
Emit custom events with data.

```typescript
@emitCustomEvent(':appHost', 'user-login')
async onLogin() {
  const user = await this.authService.login();
  return { user };  // Sent as event detail
}
```

#### @emitCustomEventHost
Emit events from a method with custom event name mapping.

```typescript
@emitCustomEventHost('navigate', { attributeName: 'on-navigate' })
onNavClick(e: any) {
  return { path: e.target.dataset.path };
}
```

#### @addEventListenerHost
Listen to events on the component element itself (`:host` selector).

```typescript
@addEventListenerHost('click')
onHostClick(event: Event) {
  console.log('Host element clicked');
}
```

#### @addEventListenerAppHost
Listen to events on the app root host element (`:appHost` selector). Enables selective event handling with filters.

```typescript
// Listen to all user-action events from :appHost
@addEventListenerAppHost('user-action')
onUserAction(e: CustomEvent) {
  console.log('User action:', e.detail);
}

// Filter specific events - loose coupling pattern
@addEventListenerAppHost('user-action', {
  filter: (event, helper) => event.detail?.type === 'login'
})
onUserLogin(e: CustomEvent) {
  console.log('User logged in:', e.detail.userName);
}

// Different component filtering same event differently
@addEventListenerAppHost('user-action', {
  filter: (event, helper) => event.detail?.type === 'logout'
})
onUserLogout(e: CustomEvent) {
  console.log('User logged out');
}
```

### 5. **DOM Querying**

#### @query
Query single element (Light DOM by default).

```typescript
@query('#form-input')
formInput?: HTMLInputElement;

@query('.card', { root: 'shadow' })
shadowCard?: HTMLElement;
```

#### @queryAll
Query multiple elements.

```typescript
@queryAll('input[type="text"]')
textInputs?: HTMLInputElement[];

@queryAll('li', { root: 'shadow' })
listItems?: HTMLLIElement[];
```

#### @queryHost
Query the component element itself.

```typescript
@queryHost
self?: HTMLElement;

printTag() {
  console.log(this.self?.tagName);  // CUSTOM-CARD
}
```

#### @queryAllHost
Query all direct children of the component.

```typescript
@queryAllHost
children?: HTMLElement[];

getChildCount() {
  return this.children?.length ?? 0;
}
```

### 6. **Attribute Binding**

#### @attribute
Bind HTML attributes to properties (automatic sync).

```typescript
@attribute
width: string = '100px';

@attribute('data-id')
resourceId: string = '';
```

#### @attributeHost
Bind attributes on host element itself.

```typescript
@attributeHost('product-id')
productId: string = '';

@onInitialize
constructor() {
  super();
  if (this.productId) {
    this.loadProduct(this.productId);
  }
}
```

### 7. **Lifecycle Hooks**

```typescript
@onConnected
onConnected() {
  // Called when element enters DOM
}

@onDisconnected
onDisconnected() {
  // Called when element leaves DOM
}

@onAttributeChanged
onAttributeChanged(name: string, oldValue: string, newValue: string) {
  // Called when attribute changes
}

@onConnectedSwcApp
onAppReady(hostSet: HostSet) {
  // Called after SwcApp.connect() completes on all already-connected components
  // Full DI support available through hostSet
  console.log('Application initialization complete!');
}
```

### 8. **Routing with @subscribeSwcAppRouteChange**
Declarative route pattern matching with path parameters.

```typescript
@elementDefine('root-router')
class RootRouter extends HTMLElement {
  @subscribeSwcAppRouteChange('/')
  @applyInnerHtmlNodeHost({ root: 'light' })
  homeRoute(router: RouterEventType) {
    return `<home-page/>`;
  }

  @subscribeSwcAppRouteChange('/product/{id}')
  @applyInnerHtmlNodeHost({ root: 'light' })
  productRoute(router: RouterEventType, pathData: any) {
    return `<product-page product-id="${pathData.id}"/>`;
  }
}
```

### 9. **Accommodation Pattern**
Factory-based component registration with explicit DI.

```typescript
// Component factory
export default (w: Window) => {
  const tagName = 'my-component';
  const existing = w.customElements.get(tagName);
  if (existing) return tagName;

  @elementDefine(tagName, { window: w })
  class MyComponent extends w.HTMLElement {
    @onInitialize
    constructor(service: MyService) {
      super();
      this.service = service;
    }
  }
  
  return tagName;
};

// Boot factory
export default (w: Window, container: symbol) => {
  serviceFactories.forEach(s => s(container));
  register(w, [...pageFactories, ...componentFactories]);
};

// Entry point
const container = Symbol('app');
bootFactory(w, container);
appElement.connect({
  container,
  window: w,
  onEngineStarted: () => {
    appElement.innerHTML = '<root-router></root-router>';
  }
});
```

---

## ⚠️ Critical Rules

### DO NOT Use @Sim on Web Components
`@Sim` is for **Services only**. Web Components should use `@elementDefine`.

```typescript
// ✅ CORRECT
@Sim()
export class UserService { }

@elementDefine(tagName, { window: w })
class UserWidget extends w.HTMLElement { }

// ❌ WRONG
@Sim()
@elementDefine(tagName, { window: w })
class UserWidget extends w.HTMLElement { }
```

### Factory Always Returns tagName (String)
```typescript
export default (w: Window) => {
  const tagName = 'my-element';
  const existing = w.customElements.get(tagName);
  if (existing) return tagName;  // ← Return string!

  @elementDefine(tagName, { window: w })
  class MyElement extends w.HTMLElement { }
  
  return tagName;  // ← Always return tagName, never class
};
```

### @onInitialize for DI (Not Constructor Parameters)
```typescript
// ✅ CORRECT
@onInitialize
constructor(@Inject({ symbol: Service.SYMBOL }) service: Service) {
  super();
  this.service = service;
}

// ❌ WRONG
constructor(private service: Service) { super(); }  // Web Components can't have constructor parameters!
```

---

## 📚 Examples

- **[Commerce (E-Commerce SPA)](./examples/commerce)** - Full shopping cart example
- **[Stock (Market Dashboard)](./examples/stock)** - Real-time data with routing
- **[Accommodation (Reference Pattern)](./examples/accommodation)** - Standard setup pattern

---

## 🔗 Related Packages

- **[@dooboostore/simple-boot](../simple-boot)** - DI & AOP Container
- **[@dooboostore/core-web](../core-web)** - Web Utilities & Router
- **[@dooboostore/dom-parser](../dom-parser)** - HTML Parsing & AST

---

## 📄 License
MIT © 2024 dooboostore-develop
