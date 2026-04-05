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
  onconstructor(service: MyService) {
  }
}
```

### 2. **Dependency Injection (@onInitialize)**
Inject services into Web Components using the `@onInitialize` decorator.

```typescript
@elementDefine('dashboard')
class Dashboard extends HTMLElement {
  @onInitialize
  onconstructor(
    @Inject({ symbol: UserService.SYMBOL }) userService: UserService
  ) {
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
onconstructor() {
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


@onConnectedSwcApp
onAppReady(router: Router) {
  // Called after SwcApp.connect() completes on all already-connected components
  // Full DI support available through hostSet
  console.log('Application initialization complete!');
}
```

### 8. **Structural Directives**

Structural Directives allow declarative conditional rendering, list iteration, async handling, and routing with automatic attribute substitution and dynamic expressions.

#### 8.0 **Expression Syntax - Dynamic Evaluation**

SWC supports two types of expression syntax for dynamic value evaluation:

**`{{ }} - Standard Expression Evaluation**
- Used for boolean conditions and value comparisons
- Syntax: `{{ expression }}`
- Example: `{{ $value === 'pending' }}`, `{{ $host.isLoggedIn }}`
- Context variables: `$value`, `$item`, `$index`, `$host`, `$parentHost`, `$appHost`, etc.

**`{{= }} - Function Call & Return Expression**
- Evaluates JavaScript expressions and returns result
- Syntax: `{{= functionCall() }}`  or `{{= computedValue }}`
- Automatically executes functions and captures return values
- Example: `{{= $item.name }}`, `{{= $parentHost.getData() }}`, `{{= formatDate($item.date) }}`
- Used in attributes for dynamic substitution
- Result is converted to string for DOM attributes

**Context Variables Available in All Directives:**
- `$value` - the value passed to the template
- `$host` - the current Web Component instance
- `$parentHost` - parent component
- `$appHost` - root application component
- `$item` - current item (in SwcLoop)
- `$index` - current index (in SwcLoop)
- Helper functions - utility methods from `SwcUtils.getHelperAndHostSet()`

---

#### 8.1 **SwcChoose - Multi-Condition Rendering**

Switch-case style conditional rendering with `swc-when` and `swc-otherwise` sub-templates.

```typescript
// Component with conditional rendering logic
@elementDefine('status-display')
class StatusDisplay extends HTMLElement {
  @attributeHost('status')
  status: string = 'pending';

  @setProperty('#status-template', 'value')
  getStatus() {
    return this.status;
  }

  @onConnectedInnerHtml
  render() {
    return `
      <template id="status-template" is="swc-choose">
        <!-- Pending State: Using {{ }} for condition -->
        <template is="swc-when" value="{{ $value === 'pending' }}">
          <div style="color: orange;">⏳ Processing...</div>
        </template>
        
        <!-- Success State: Using {{ }} for condition -->
        <template is="swc-when" value="{{ $value === 'success' }}">
          <div style="color: green;">✓ Completed</div>
        </template>
        
        <!-- Error State: Using {{ }} for condition -->
        <template is="swc-when" value="{{ $value === 'error' }}">
          <div style="color: red;">✗ Failed</div>
        </template>
        
        <!-- Fallback -->
        <template is="swc-otherwise">
          <div style="color: gray;">Unknown status</div>
        </template>
      </template>
    `;
  }
}
```

**Expression Features:**
- `{{ }} braces` for dynamic condition evaluation
- `$value` contains the value passed to `swc-choose`
- `skip-if-same` attribute prevents re-render when same template selected
- **Attribute substitution with `{{= }}`**: `attribute-name="{{= expression }}"` automatically evaluated
  
**Attribute Substitution Example ({{= }} usage):**
```html
<template is="swc-choose">
  <template is="swc-when" value="{{ $value?.type === 'user' }}">
    <user-card 
      data-username="{{= $value?.name }}" 
      data-email="{{= $value?.email }}"
      data-id="{{= $value?.id }}"
    ></user-card>
  </template>
  
  <template is="swc-when" value="{{ $value?.type === 'product' }}">
    <product-card 
      data-product-name="{{= $value?.title }}"
      data-price="{{= $value?.price }}"
    ></product-card>
  </template>
</template>
```

---

#### 8.2 **SwcIf - Binary Conditional**

If-then-else rendering with optional `swc-default` fallback.

```typescript
@elementDefine('user-profile')
class UserProfile extends HTMLElement {
  private isLoggedIn = false;
  private userData = { userName: 'Alice', userId: 123 };

  @setProperty('#content', 'value')
  checkAuth() {
    return this.isLoggedIn;
  }

  @onConnectedInnerHtml
  render() {
    return `
      <!-- True condition: renders main template using {{ }} -->
      <template id="content" is="swc-if" value="{{ $host.isLoggedIn }}">
        <!-- Attribute substitution with {{= }} expressions -->
        <user-card 
          data-username="{{= $host.userData.userName }}"
          data-userid="{{= $host.userData.userId }}"
        ></user-card>
        <div>
          <h2>Welcome, {{ $host.userData.userName }}</h2>
          <button on-click="logout">Logout</button>
        </div>
        
        <!-- Fallback template: renders if condition is false -->
        <template is="swc-default">
          <div>
            <p>Please log in</p>
            <button on-click="login">Login</button>
          </div>
        </template>
      </template>
    `;
  }
}
```

**Expression Features:**
- Binary true/false logic with `{{ }} condition`
- Main template renders when `value` is truthy
- `swc-default` sub-template renders when value is falsy
- Dynamic attribute substitution with `{{= }}` supported
- Access `$host`, `$value`, and other context variables
- `{{= functionCall() }}` executes functions and returns results for attributes

---

#### 8.3 **SwcAsync - Promise/Loading State**

Automatically handle async operations with loading, success, and error states.

```typescript
@elementDefine('data-loader')
class DataLoader extends HTMLElement {
  private data: any = null;

  async fetchData() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({ id: 1, name: 'Sample Data', description: 'API response' });
      }, 2000);
    });
  }

  @setProperty('#async-content', 'value')
  loadData() {
    return this.fetchData();
  }

  @onConnectedInnerHtml
  render() {
    return `
      <template id="async-content" is="swc-async" value="{{= $host.fetchData() }}">
        <!-- Loading State: Shows while Promise is pending -->
        <template is="swc-loading">
          <div>🔄 Loading data...</div>
        </template>
        
        <!-- Success State: Shows when Promise resolves -->
        <!-- Using {{= }} to extract data from resolved Promise -->
        <template is="swc-success">
          <data-card
            data-id="{{= $value.id }}"
            data-name="{{= $value.name }}"
          ></data-card>
          <div>
            <p>Data ID: {{ $value.id }}</p>
            <p>Data Name: {{ $value.name }}</p>
            <p>Description: {{= $value.description }}</p>
          </div>
        </template>
        
        <!-- Error State: Shows if Promise rejects -->
        <template is="swc-error">
          <div style="color: red;">❌ Failed to load data</div>
        </template>
      </template>
    `;
  }
}
```

**Expression Features:**
- Promise lifecycle management with `{{ }} conditions`
- `{{= $host.fetchData() }}` - function call expression that executes and returns Promise
- `{{= $value.propertyName }}` - extract properties from resolved value
- `swc-loading` - displays during pending state
- `swc-success` - displays on successful resolution, `$value` contains resolved result
- `swc-error` - displays on Promise rejection, `$value` contains error
- Dynamic attribute substitution with `{{= }}` in all states
- `on-clone-node` and `on-clone-nodes` callbacks for DOM manipulation

---

#### 8.4 **SwcLoop - List Rendering**

Iterate over arrays and render templates for each item.

```typescript
@elementDefine('product-list')
class ProductList extends HTMLElement {
  private products = [
    { id: 1, name: 'Laptop', price: 1200, category: 'electronics' },
    { id: 2, name: 'Phone', price: 800, category: 'electronics' },
    { id: 3, name: 'Tablet', price: 500, category: 'electronics' }
  ];

  @setProperty('#products-list', 'value')
  getProducts() {
    return this.products;
  }

  @onConnectedInnerHtml
  render() {
    return `
      <template id="products-list" is="swc-loop" value="{{= $host.products }}">
        <!-- Loop iteration with {{ }} for display and {{= }} for attributes -->
        <div style="margin: 10px; padding: 10px; border: 1px solid #ddd;">
          <!-- Using {{ }} for template content rendering -->
          <h3>{{ $item.name }}</h3>
          <p>Price: ${{ $item.price }}</p>
          <p>ID: {{ $item.id }} (Index: {{ $index }})</p>
          
          <!-- Using {{= }} for dynamic attribute substitution -->
          <product-card
            data-product-id="{{= $item.id }}"
            data-product-name="{{= $item.name }}"
            data-product-price="{{= $item.price }}"
            data-product-category="{{= $item.category }}"
          ></product-card>
          
          <!-- Computed expressions with {{= }} -->
          <button data-id="{{= $item.id }}" data-price="{{= $item.price }}">
            Add to Cart - \${{= $item.price }}
          </button>
        </div>
        
        <!-- Empty fallback: renders when array is empty -->
        <template is="swc-default">
          <p>No products available</p>
        </template>
      </template>
    `;
  }
}
```

**Context Variables (Available in loop):**
- `$item` - current item in iteration
- `$index` - zero-based index (0, 1, 2, ...)
- `$value` - entire array being iterated
- `$nodes` - cloned DOM nodes
- `$elements` - cloned HTML elements
- `$firstElement` - first element in cloned nodes

**Expression Features:**
- `{{= $host.products }}` - function call expression that returns the array to iterate
- `{{ $item.propertyName }}` - display item properties using standard `{{ }}` 
- `{{= $item.propertyName }}` - extract item properties for attributes using `{{= }}`
- `{{= computedValue }}` - compute values in attributes (e.g., calculations, method calls)
- `swc-default` fallback renders when array is empty
- All cloned attributes support `{{ }}` and `{{= }}` substitution
- `on-clone-node` callback fires for each cloned node
- `on-clone-nodes` callback fires after all nodes cloned

**Common Patterns:**
```html
<!-- Template functions with {{= }} -->
<template is="swc-loop" value="{{= filterProducts($host.products) }}">
  <!-- Dynamic calculations -->
  <span>Total: {{= $item.price * $item.quantity }}</span>
  
  <!-- Conditional attributes -->
  <div class="{{= $item.inStock ? 'available' : 'unavailable' }}"></div>
  
  <!-- Method calls as attributes -->
  <button data-formatted="{{= formatPrice($item.price) }}">
    Buy - {{ formatPrice($item.price) }}
  </button>
</template>
```

**Advanced: replace-wrap for Custom Expression Syntax**

Override default `{{ }}` and `{{= }}` syntax with custom wrappers:

```typescript
@elementDefine('custom-loop')
class CustomLoop extends HTMLElement {
  private items = [{ id: 1, name: 'Item 1' }];

  @onConnectedInnerHtml
  render() {
    return `
      <!-- Using custom wrapper syntax [(= ... )] instead of {{= ... }} -->
      <template id="items" is="swc-loop" replace-wrap="[(= )]" value="[(= $host.items )]">
        <div>
          <p>Name: [(= $item.name )]</p>
          <button data-id="[(= $item.id )]">Click me</button>
        </div>
      </template>
    `;
  }
}
```

**replace-wrap attribute options:**
- Change expression wrapper from default `{{= }}` to custom pattern
- Useful when `{{ }}` conflicts with template engines like EJS or Mustache
- Supported on: `SwcLoop`, `SwcChoose`, `SwcIf`, `SwcAsync`, `register()` directives
- Example patterns: `[(= )]`, `{[= ]}`, `<%= %>` (after escaping)

---

#### 8.5 **Declarative Routing with swc-choose**

Combine `@subscribeSwcAppRouteChange` with `swc-choose` for clean, declarative routing without boilerplate.

```typescript
@elementDefine('root-router')
class RootRouter extends HTMLElement {
  private router: Router;

  @onInitialize
  onconstructor(router: Router) {
    this.router = router;
  }

  @setProperty('#router', 'value')
  @subscribeSwcAppRouteChange(['/', '/users', '/users/{id}', '/products/{id}'])
  routeChanged(route: RouterEventType) {
    return route;
  }

  navigate(path: string): void {
    this.router?.go(path);
  }

  @onConnectedInnerHtml
  render() {
    return `
      <template id="router" is="swc-choose">
        <!-- Home Page: Using {{ }} for condition -->
        <template is="swc-when" value="{{ ['', '/'].includes($value?.path) }}">
          <home-page/>
        </template>
        
        <!-- Users List Page -->
        <template is="swc-when" value="{{ $value?.path === '/users' }}">
          <users-list-page/>
        </template>
        
        <!-- User Detail Page: Using {{= }} for dynamic attributes from route params -->
        <template is="swc-when" value="{{ $value?.path.startsWith('/users/') }}">
          <user-detail-page user-id="{{= $value?.pathData?.id }}"></user-detail-page>
        </template>
        
        <!-- Product Detail Page: Using {{= }} for dynamic route parameters -->
        <template is="swc-when" value="{{ $value?.path.startsWith('/products/') }}">
          <product-detail-page product-id="{{= $value?.pathData?.id }}"></product-detail-page>
        </template>
        
        <!-- Not Found -->
        <template is="swc-otherwise">
          <not-found-page/>
        </template>
      </template>
    `;
  }
}
```

**Benefits:**
- ✅ **No imperative route methods** - routes are declarative templates
- ✅ **Automatic re-rendering** - attributes like `user-id` update automatically
- ✅ **Performance optimization** - use `skip-if-same` on templates to prevent re-renders
- ✅ **Dynamic path parameters** - use `{{= $value?.pathData?.id }}` syntax to inject route params with `{{= }}`
- ✅ **Cleaner DX** - single unified routing pattern
- ✅ **Full expression support** - use `{{= }}` for complex parameter transformations

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
    onconstructor(service: MyService) {
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

### 10. **Quickstart - Basic SPA Setup**

Complete example of setting up a production SPA with routing, services, and components.

#### Step 1. HTML Entry Point
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My SPA</title>
  <!-- Web Components polyfill for older browsers -->
  <script src="https://unpkg.com/@ungap/custom-elements"></script>
</head>
<body id="app" is="swc-app-body">
  <!-- Root router will render pages here -->
  <root-router></root-router>
</body>
<script src="bundle.js"></script>
</html>
```

#### Step 2. Services (Dependency Injection)
```typescript
// services/UserService.ts
import { Sim } from '@dooboostore/simple-boot';
import { ConstructorType } from '@dooboostore/core';

export namespace UserService {
  export const SYMBOL = Symbol('UserService');

  export interface User {
    id: number;
    name: string;
    email: string;
  }

  const users: User[] = [
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' }
  ];
}

export interface UserService {
  getUser(id: number): UserService.User | undefined;
  getAllUsers(): UserService.User[];
}

// Factory function: accepts container and returns service class
export default (container: symbol): ConstructorType<any> => {
  @Sim({ symbol: UserService.SYMBOL, container: container })
  class UserServiceImpl implements UserService {
    getUser(id: number) {
      return UserService.users.find(u => u.id === id);
    }

    getAllUsers() {
      return [...UserService.users];
    }
  }

  return UserServiceImpl;
};
```

```typescript
// services/index.ts
import userServiceFactory from './UserService';

export const serviceFactories = [userServiceFactory];
```

#### Step 3. Router Configuration (Declarative with swc-choose)
```typescript
// pages/RootRouter.ts
import { elementDefine, subscribeSwcAppRouteChange, setProperty, onConnectedInnerHtml, onInitialize } from '@dooboostore/simple-web-component';
import { Router, RouterEventType } from '@dooboostore/core-web';

const rootRouterFactory = (w: Window) => {
  const tagName = 'root-router';
  const existing = w.customElements.get(tagName);
  if (existing) return tagName;

  @elementDefine(tagName, { window: w })
  class RootRouter extends w.HTMLElement {
    private router: Router;

    @onInitialize
    onconstructor(router: Router) {
      this.router = router;
    }

    @setProperty('#router', 'value')
    @subscribeSwcAppRouteChange(['/', '/users', '/users/{id}'])
    routeChanged(route: RouterEventType) {
      return route;
    }

    navigate(path: string): void {
      this.router?.go(path);
    }

    @onConnectedInnerHtml
    render() {
      return `
        <template id="router" is="swc-choose">
          <!-- Home Page -->
          <template is="swc-when" value="{{ ['', '/'].includes($value?.path) }}">
            <home-page/>
          </template>
          
          <!-- Users List -->
          <template is="swc-when" value="{{ $value?.path === '/users' }}">
            <users-list-page/>
          </template>
          
          <!-- User Detail -->
          <template is="swc-when" value="{{ $value?.path.startsWith('/users/') }}">
            <user-detail-page user-id="{{$value?.pathData?.id}}"/>
          </template>
          
          <!-- Not Found -->
          <template is="swc-otherwise">
            <not-found-page/>
          </template>
        </template>
      `;
    }
  }

  return tagName;
};

export default rootRouterFactory;
```

#### Step 4. Page Components
```typescript
// pages/HomePage.ts
import { elementDefine, onConnectedInnerHtml } from '@dooboostore/simple-web-component';

const HomePage = (w: Window) => {
  const tagName = 'home-page';
  const existing = w.customElements.get(tagName);
  if (existing) return tagName;

  @elementDefine(tagName, { window: w })
  class HomePage extends w.HTMLElement {
    @onConnectedInnerHtml({ useShadow: true })
    render() {
      return `
        <style>
          :host { display: block; padding: 20px; }
          h1 { color: #333; }
          a { color: #0066cc; text-decoration: none; margin-right: 20px; }
        </style>
        <h1>Welcome to My SPA</h1>
        <nav>
          <a href="/users">View All Users</a>
        </nav>
      `;
    }
  }

  return tagName;
};

export default HomePage;
```

```typescript
// pages/UsersListPage.ts
import { elementDefine, onConnectedInnerHtml, onConnectedSwcApp } from '@dooboostore/simple-web-component';
import { Inject } from '@dooboostore/simple-boot';
import { UserService } from '../services/UserService';

const UsersListPage = (w: Window) => {
  const tagName = 'users-list-page';
  const existing = w.customElements.get(tagName);
  if (existing) return tagName;

  @elementDefine(tagName, { window: w })
  class UsersListPage extends w.HTMLElement {
    private users: any[] = [];

    @onConnectedSwcApp
    onconstructor(@Inject({ symbol: UserService.SYMBOL }) userService: UserService) {
      this.users = userService.getAllUsers();
    }

    @onConnectedInnerHtml({ useShadow: true })
    render() {
      const usersList = this.users
        .map(u => `<li><a href="/users/${u.id}">${u.name}</a></li>`)
        .join('');
      
      return `
        <style>
          :host { display: block; padding: 20px; }
          h1 { color: #333; }
          ul { list-style: none; padding: 0; }
          li { margin: 10px 0; }
          a { color: #0066cc; text-decoration: none; }
        </style>
        <h1>Users</h1>
        <ul>${usersList}</ul>
        <a href="/">Back to Home</a>
      `;
    }
  }

  return tagName;
};

export default UsersListPage;
```

#### Step 4-1. Reusable Components
```typescript
// components/UserCard.ts
import { elementDefine, onConnectedInnerHtml, attributeHost } from '@dooboostore/simple-web-component';

const UserCard = (w: Window) => {
  const tagName = 'user-card';
  const existing = w.customElements.get(tagName);
  if (existing) return tagName;

  @elementDefine(tagName, { window: w })
  class UserCard extends w.HTMLElement {
    @attributeHost('data-username')
    username: string;

    @attributeHost('data-email')
    email: string;

    @onConnectedInnerHtml({ useShadow: true })
    render() {
      return `
        <style>
          :host { display: block; }
          .card { border: 1px solid #ddd; border-radius: 4px; padding: 12px; }
          .name { font-weight: bold; font-size: 14px; }
          .email { color: #666; font-size: 12px; }
        </style>
        <div class="card">
          <div class="name">${this.username}</div>
          <div class="email">${this.email}</div>
        </div>
      `;
    }
  }

  return tagName;
};

export default UserCard;
```

#### Step 5. Export Factories

**services/index.ts** - Export all service factories
```typescript
// services/index.ts
import userServiceFactory from './UserService';

export const serviceFactories = [userServiceFactory];
```

**components/index.ts** - Export all component factories
```typescript
// components/index.ts
import UserCard from './UserCard';

export const componentFactories = [
  UserCard,
];
```

**pages/index.ts** - Export all page factories with router
```typescript
// pages/index.ts
import rootRouterFactory from './RootRouter';
import HomePage from './HomePage';
import UsersListPage from './UsersListPage';
import UserDetailPage from './UserDetailPage';

export const pageFactories = [
  rootRouterFactory,      // Router first
  HomePage,
  UsersListPage,
  UserDetailPage
];
```

#### Step 6. Application Bootstrap
```typescript
// bootFactory.ts
import { register } from '@dooboostore/simple-web-component';
import { serviceFactories } from './services';
import { componentFactories } from './components';
import { pageFactories } from './pages';

export default (w: Window, container: symbol) => {
  // Initialize services with container (dependency injection)
  // Each factory receives the container symbol and registers its service in the DI container
  serviceFactories.forEach(serviceFactory => serviceFactory(container));

  // Register pages and components
  register(w, [...pageFactories, ...componentFactories]);
};
```

#### Step 7. Application Entry Point
```typescript
// index.ts
import 'reflect-metadata';
import { SwcAppInterface } from '@dooboostore/simple-web-component';
import bootFactory from './bootFactory';

const w = window;

w.document.addEventListener('DOMContentLoaded', async () => {
  const container = Symbol('app');
  
  // Initialize services and components
  bootFactory(w, container);

  // Wait for customized built-in element to be defined
  await w.customElements.whenDefined('swc-app-body');

  // Get app root element
  const appElement = w.document.querySelector('#app') as SwcAppInterface;
  
  if (appElement && typeof appElement.connect === 'function') {
    // Connect SPA with routing and DI
    appElement.connect({
      path: '/',
      routeType: 'path',
      container: container,
      window: w,
      onEngineStarted: () => {
        console.log('🚀 Application started successfully');
        // Root router automatically initialized via @elementDefine
      }
    });
  } else {
    console.error('Failed to initialize SPA');
  }
});
```

#### Resulting Application Structure
```
src/
  ├── index.ts                 # Entry point
  ├── index.html              # HTML root with <root-router>
  ├── bootFactory.ts          # Bootstrap services & components via register()
  ├── services/
  │   ├── UserService.ts      # Service factory (export default)
  │   └── index.ts            # Export serviceFactories
  ├── pages/
  │   ├── RootRouter.ts       # Router factory (export default)
  │   ├── HomePage.ts         # Page factory (export default)
  │   ├── UsersListPage.ts    # Page factory (export default)
  │   ├── UserDetailPage.ts   # Page factory (export default)
  │   └── index.ts            # Export pageFactories
  └── components/
      ├── UserCard.ts         # Component factory (export default)
      └── index.ts            # Export componentFactories
```

**Key Flow:**
1. HTML loads → `<root-router>` element already in DOM
2. `index.ts` executes → calls `bootFactory`
3. `bootFactory` registers services and components (including `rootRouterFactory`)
4. App waits for `swc-app-body` to be defined
5. `appElement.connect()` initializes routing & DI
6. `<root-router>` becomes active with `@subscribeSwcAppRouteChange` + `swc-choose` template
7. Route changes automatically trigger `swc-choose` re-evaluation and template re-rendering
8. Template attributes like `user-id="{{$value?.pathData?.id}}"` are dynamically populated with route params
9. All components have access to injected services via `@onInitialize` or `@onConnectedSwcApp`


---

## ⚠️ Critical Rules

### DO NOT Use @Sim on Web Components
`@Sim` is for **Services only**. Web Components should use `@elementDefine`.

```typescript
// ✅ CORRECT
@Sim
export class UserService { }

@elementDefine(tagName, { window: w })
class UserWidget extends w.HTMLElement { }

// ❌ WRONG
@Sim
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
onconstructor(@Inject({ symbol: Service.SYMBOL }) service: Service) {
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
