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
    @inject(UserService.SYMBOL) userService: UserService
  ) {
    this.userService = userService;
  }
}
```

### 3. **Declarative DOM Updates**

#### @onConnectedShadow
Render HTML automatically when component connects to DOM.

```typescript
@onConnectedShadow
render() {
  return `<div>Hello, <span>${this.name}</span>!</div>`;
}
```

#### @innerHtmlLightNodeThis
Apply HTML to specific host element.

```typescript
@innerHtmlLightNodeThis
updateContent() {
  return `<p>Updated content</p>`;
}
```

#### @replaceChildrenLightNodeThis
Replace child nodes with new content.

```typescript
@replaceChildrenLightNodeThis
replaceChildren(node: Node) {
  return node;
}
```
### 3.5 **Slot Management with @applySlot**

Manage dynamic content insertion into named slots using slot decorators. Slots are placeholders in templates that can be updated dynamically.

```typescript
@elementDefine('content-manager')
class ContentManager extends HTMLElement {
  // Method: Replace children in slot with HTML
  @addEventListener('.update-btn', 'click')
  @replaceChildrenHtmlSlot('main-content')
  updateContent() {
    return '<div>Updated content here</div>';
  }

  // Method: Append HTML to slot
  @appendHtmlSlot('main-content')
  addMoreContent() {
    return '<p>Additional content</p>';
  }

  // Method: Append text to slot
  @appendTextSlot('sidebar')
  addSidebarText() {
    return 'Sidebar text: ' + new Date().toISOString();
  }

  // Method: Clear slot content
  @addEventListener('.clear-btn', 'click')
  @clearSlot('main-content')
  clearContent() {
    return true;
  }

  @onConnectedLight
  render() {
    return `
      <div>
        <h2>Main Content</h2>
        <!--[[ main-content ]]-->
        
        <aside>
          <h3>Sidebar</h3>
          <!--[[ sidebar ]]-->
        </aside>
        
        <button class="update-btn">Update Content</button>
        <button class="clear-btn">Clear Content</button>
      </div>
    `;
  }
}
```

**Slot Syntax in Templates:**
- `<!--[[ slot-id ]]-->` - Named slot placeholder (HTML comment syntax)

**@applySlot Decorator Variants:**
- `clearSlot(slotId)` - Clear all content
- `prependHtmlSlot(slotId)` - Add HTML at beginning
- `prependTextSlot(slotId)` - Add text at beginning
- `appendHtmlSlot(slotId)` - Add HTML at end
- `appendTextSlot(slotId)` - Add text at end
- `replaceChildrenHtmlSlot(slotId)` - Replace all with HTML
- `replaceChildrenTextSlot(slotId)` - Replace all with text

**Position Options:**
```typescript
export type ApplySlotPosition = 
  | 'prepend'
  | 'prependHtml'        // Add HTML at beginning
  | 'prependText'        // Add text at beginning
  | 'append'         
  | 'appendHtml'         // Add HTML at end
  | 'appendText'         // Add text at end
  | 'replaceChildren'
  | 'replaceChildrenHtml' // Replace all with HTML
  | 'replaceChildrenText' // Replace all with text
  | 'clear';             // Clear all content
```


### 3.6 **State Management with @state**

Reactive state management with automatic DOM updates when state changes. State values are accessible in templates and scripts using special syntax.

```typescript
@elementDefine('counter-app')
class CounterApp extends HTMLElement {
  // Declare reactive state
  @state('count')
  count: number = 0;

  @state('message')
  message: string = 'Hello';

  @state('isActive')
  isActive: boolean = false;

  @addEventListener('button', 'click')
  increment() {
    this.count++;  // Triggers automatic DOM update
  }

  @onConnectedInnerHtml
  render() {
    return `
      <div>
        <!-- HTML directive: render HTML content -->
        <!--[html @message@ ]-->
        
        <!-- Text directive: render as text -->
        <!--[text Count: @count@ ]-->
        
        <!-- Attribute binding with a: prefix -->
        <div a:title="'Count is'+@count@"></div>
        
        <!-- Event binding with e: prefix -->
        <button e:click="@increment@()">Increment (@count@)</button>
        
        <!-- Conditional rendering -->
        <div a:style="@isActive@ ? 'color: green' : 'color: red'">
        </div>
      </div>
    `;
  }
}
```

**State Syntax in Templates:**

**Reading State Values(read only):**
- `@stateName@` - Read state value as text/attribute
- `@stateName@()` - Call state property as function (if it's a function)
- `@expression@` - Evaluate expressions with state variables

**Template Directives:**
- `<!--[html @state@ ]-->` - Render state value as HTML
- `<!--[text @state@ ]-->` - Render state value as text
- `a:attributeName="@state@"` - Bind state to HTML attributes
- `e:eventName="@methodName@()"` - Bind events to methods

**How @state Works:**
1. Declare property with `@state('stateName')`
2. When property value changes via `this.count++`, setter is triggered
3. Setter automatically applies state context to templates
4. All `@stateName@` expressions in templates are re-evaluated
5. DOM updates automatically with new values

**State Context Available:**
- `@propertyName@` - Access state properties
- `@methodName@()` - Call methods
- `@expression@` - Evaluate JavaScript expressions
- All state variables available in template expressions

**Important: State Properties are Read-Only in Templates**
State values accessed in templates via `@stateName@` syntax are read-only. You cannot assign values to state properties from within template expressions. State must be updated from component methods:

```typescript
// ✅ CORRECT - Update state from method
@addEventListener('button', 'click')
increment() {
  this.count++;  // Direct property assignment in code
}

// ❌ WRONG - Cannot assign in template
<!--[text @count = 5@ ]-->  // This won't work - read-only in templates

// ✅ CORRECT - Call method from template
<button e:click="@increment@()">Increment</button>
```

**Advanced Example:**
```typescript
@elementDefine('user-profile')
class UserProfile extends HTMLElement {
  @state('user')
  user = { name: 'Alice', age: 30, email: 'alice@example.com' };

  @state('isEditing')
  isEditing = false;

  @addEventListener('.edit-btn', 'click')
  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

  @onConnectedShadow
  render() {
    return `
      <div>
        <!-- Display user info -->
        <h2><!--[text @user.name@ ]--></h2>
        <p a:title="Email: @user.email@">Age: @user.age@</p>
        
        <!-- Conditional rendering based on state -->
        <div a:style="@isEditing@ ? 'border: 1px solid blue' : 'border: none'">
          <!--[html @isEditing@ ? '<input type="text" />' : '<span>View Mode</span>' ]-->
        </div>
        
        <button e:click="toggleEdit"> toggleEdit </button>
      </div>
    `;
  }
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

**@addEventListener Decorator Variants:**
- `addEventListener(selector, type, options)` - Full form
- `event(selector, type, options)` - Short alias
- `addEventListenerThis(type, options)` - Listen on $this element
- `addEventListenerAppHost(type, options)` - Listen on $appHost
- `addEventListenerWindow(type, options)` - Listen on window
- `addEventListenerDocument(type, options)` - Listen on document
- `addEventListenerDelegate(selector, type, options)` - Event delegation
- `eventDelegate(selector, type, options)` - Short alias
- `addEventListenerDelegateLightDom(selector, type, options)` - Delegate in light DOM
- `eventDelegateLightDom(selector, type, options)` - Short alias
- `addEventListenerDelegateShadowDom(selector, type, options)` - Delegate in shadow DOM
- `eventDelegateShadowDom(selector, type, options)` - Short alias
- `addEventListenerDelegateAllDom(selector, type, options)` - Delegate in all DOM
- `eventDelegateAllDom(selector, type, options)` - Short alias

#### @emitCustomEvent
Emit custom events with data.

```typescript
@emitCustomEvent('$appHost', 'user-login')
async onLogin() {
  const user = await this.authService.login();
  return { user };  // Sent as event detail
}
```

**@emitCustomEvent Decorator Variants:**
- `emitCustomEvent(target, type, options)` - Full form
- `emit(target, type, options)` - Short alias
- `emitCustomEventThis(type, options)` - Emit from $this element

#### @publishSwcAppMessage
Publish messages through the message bus when method completes.

```typescript
@publishSwcAppMessage()
async onLogin() {
  const user = await this.authService.login();
  return user;  // Published as message with data: user
}

@publishSwcAppMessage('user-profile-updated')
updateProfile() {
  const profile = { name: this.name, email: this.email };
  return profile;  // Published as message with type: 'user-profile-updated'
}
```

**@publishSwcAppMessage Decorator Variants:**
- `publishSwcAppMessage()` - Publish without message type
- `publishSwcAppMessage(messageType)` - Publish with specific message type
- `publishSwcAppMessage(messageType, { valueKey: 'customKey' })` - Publish with custom value extraction
- `publishSwcAppMessage({ messageType: 'type', valueKey: 'customKey' })` - Publish with options object
- `publish()` - Short alias
- `publish(messageType)` - Short alias with message type
- `publish(messageType, options)` - Short alias with options

**Using valueKey for Multiple Decorators:**

```typescript
@publishSwcAppMessage('event1', { valueKey: 'detail1' })
@publishSwcAppMessage('event2', { valueKey: 'detail2' })
handleMultipleEvents() {
  return {
    detail1: { type: 'event1', data: 'value1' },
    detail2: { type: 'event2', data: 'value2' }
  };
}
```

#### @emitCustomEventThis
Emit events from a method with custom event name mapping.

```typescript
@emitCustomEventThis('navigate', { attributeName: 'on-navigate' })
onNavClick(e: any) {
  return { path: e.target.dataset.path };
}
```

#### @addEventListenerThis
Listen to events on the component element itself (`$this` selector).

```typescript
@addEventListenerThis('click')
onHostClick(event: Event) {
  console.log('Host element clicked');
}
```

#### @addEventListenerAppHost
Listen to events on the app root host element (`$appHost` selector). Enables selective event handling with filters.

```typescript
// Listen to all user-action events from $appHost
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

#### @queryThis
Query the component element itself.  == this

```typescript
@queryThis
self?: HTMLElement;

printTag() {
  console.log(this.self?.tagName);  // CUSTOM-CARD
}
```

### 6. **Attribute Binding**

#### @attribute
Bind HTML attributes to properties (automatic sync).

```typescript
@attributeThis
width: string = '100px';  // Bind to this.width

@attribute('data-id')
resourceId: string;  // element attribute first 
```

#### @attributeThis
Bind attributes on host element itself.

```typescript
@attributeThis('product-id')
productId?: string;

@onInitialize
onconstructor() {
  if (this.productId) {
    this.loadProduct(this.productId);
  }
}
```

### 7. **DOM Manipulation with applyNode**

Surgically add, replace, or remove nodes in the DOM with fine-grained control.

```typescript
@elementDefine('content-updater')
class ContentUpdater extends HTMLElement {
  @addEventListener('button', 'click')
  @replaceChildrenLightNodeThis
  updateContent() {
    return `<div>New content</div>`;
  }

  @addEventListener('.append-btn', 'click')
  @beforeEndLightNodeThis
  appendContent() {
    return `<p>Appended content</p>`;
  }

  @addEventListener('.prepend-btn', 'click')
  @afterBeginLightNodeThis
  prependContent() {
    return `<p>Prepended content</p>`;
  }

  @onConnectedLight
  render() {
    return `
      <div>
        <button class="append-btn">Append</button>
        <button class="prepend-btn">Prepend</button>
        <button>Replace</button>
      </div>
    `;
  }
}
```

**@applyNode Decorator Variants:**
- `replaceChildrenNodeThis()` - Replace all children
- `replaceChildrenLightNodeThis()` - Replace children in light DOM
- `beforeEndNodeThis()` - Append to end
- `beforeEndLightNodeThis()` - Append to light DOM end
- `afterBeginNodeThis()` - Prepend to beginning
- `afterBeginLightNodeThis()` - Prepend to light DOM beginning
- `innerHtmlNodeThis()` - Set innerHTML
- `innerHtmlLightNodeThis()` - Set innerHTML in light DOM
- `innerTextNodeThis()` - Set innerText

**Position Options:**
```typescript
export type ApplyNodePosition = 
  | 'beforeBegin'      // Before element
  | 'afterBegin'       // After element opens
  | 'beforeEnd'        // Before element closes
  | 'afterEnd'         // After element closes
  | 'replace'          // Replace element
  | 'replaceChildren'  // Replace children
  | 'innerHtml'        // Set innerHTML
  | 'innerText'        // Set innerText
  | 'remove';          // Remove element
```

### 7.5 **Style & Class Management**

Apply styles and classes dynamically with `@applyStyle` and `@applyClass`.

```typescript
@elementDefine('styled-component')
class StyledComponent extends HTMLElement {
  @state('isActive')
  isActive = false;

  @addEventListener('button', 'click')
  @updateStyleThis
  toggleStyle() {
    return {
      color: this.isActive ? 'green' : 'red',
      fontSize: '16px'
    };
  }

  @addEventListener('.toggle-btn', 'click')
  @updateClassThis
  toggleClass() {
    return {
      'active': this.isActive,
      'disabled': !this.isActive
    };
  }

  @onConnectedLight
  render() {
    return `
      <div>
        <button class="toggle-btn">Toggle</button>
        <button>Update Style</button>
      </div>
    `;
  }
}
```

**@applyStyle Variants:**
- `setStyleThis()` - Clear and set styles
- `updateStyleThis()` - Update/merge styles
- `removeStyleThis()` - Remove specific styles

**@applyClass Variants:**
- `setClassThis()` - Replace all classes
- `updateClassThis()` - Toggle classes
- `addClassThis()` - Add classes
- `removeClassThis()` - Remove classes
- `toggleClassThis()` - Toggle classes

### 7.6 **Lifecycle Hooks**

Lifecycle hooks allow you to execute code at specific points in a component's lifecycle. All lifecycle decorators support optional `order` parameter for execution ordering.

```typescript
@elementDefine('my-component')
class MyComponent extends HTMLElement {
  @onInitialize({ order: 0 })
  onInit() {
    // Called during component construction
    console.log('Component initialized');
  }

  @onConnectedBefore({ order: 0 })
  beforeConnected() {
    // Called before element connects to DOM
  }

  @onConnectedAfter({ order: 1 })
  afterConnected() {
    // Called after element connects to DOM
  }

  @onConnected
  onConnected() {
    // Called when element enters DOM
  }

  @onDisconnectedBefore
  beforeDisconnected() {
    // Called before element disconnects from DOM
  }

  @onDisconnected
  onDisconnected() {
    // Called when element leaves DOM
  }

  @onAdoptedBefore
  beforeAdopted() {
    // Called before element is adopted into new document
  }

  @onAdopted
  onAdopted() {
    // Called when element is adopted into new document
  }

  @onConnectedSwcApp({ order: 0 })
  onSwcAppConnected() {
    // Called after SwcApp.connect() completes
    // Full DI support available through hostSet
  }

  @onConnectedCompleted({ order: 0 })
  onConnectedCompleted() {
    // Called after all connected lifecycle hooks complete
  }
}
```

**Lifecycle Execution Order:**
- `@onInitialize` - Component construction
- `@onConnectedBefore` - Before DOM connection
- `@onConnectedAfter` - After DOM connection
- `@onConnected` - DOM connection (with HTML rendering)
- `@onConnectedSwcApp` - After SwcApp initialization
- `@onConnectedCompleted` - All connected hooks done
- `@onDisconnectedBefore` - Before DOM disconnection
- `@onDisconnected` - DOM disconnection
- `@onAdoptedBefore` - Before document adoption
- `@onAdopted` - Document adoption

**Order Parameter:**
All lifecycle decorators support `order?: number` for controlling execution sequence:
```typescript
@onConnectedBefore({ order: 0 })  // Runs first
onFirst() { }

@onConnectedBefore({ order: 1 })  // Runs second
onSecond() { }
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

### 9. **Component Communication - Message Bus**

SWC provides a powerful message bus system for inter-component communication through SwcApp. Components can publish and subscribe to typed messages while connected.

#### @subscribeSwcAppMessageWhileConnected
Subscribe to messages while component is connected to DOM.

```typescript
@elementDefine('notification-panel')
class NotificationPanel extends HTMLElement {
  @subscribeSwcAppMessageWhileConnected
  onAnyMessage(message: SwcAppMessage) {
    console.log('Received message:', message);
  }

  @subscribeSwcAppMessageWhileConnected('user-login')
  onUserLogin(message: SwcAppMessage<{ username: string }>) {
    console.log(`Welcome ${message.data?.username}`);
  }

  @subscribeSwcAppMessageWhileConnected('user-login', {
    filter: (msg) => msg.data?.username === 'admin'
  })
  onAdminLogin(message: SwcAppMessage) {
    console.log('Admin logged in!');
  }
}
```

#### @publishSwcAppMessage
Publish a message from a method's return value.

```typescript
@elementDefine('login-form')
class LoginForm extends HTMLElement {
  @publishSwcAppMessage()
  async onSubmit() {
    const user = await this.authService.login(
      this.username,
      this.password
    );
    return user;  // Published as message with data: user
  }

  @publishSwcAppMessage('user-profile-updated')
  updateProfile() {
    const profile = { name: this.name, email: this.email };
    return profile;  // Published as message with type: 'user-profile-updated'
  }
}
```

**@publishSwcAppMessage Decorator Variants:**
- `publishSwcAppMessage()` - Publish without message type
- `publishSwcAppMessage(messageType)` - Publish with specific message type
- `publishSwcAppMessage(messageType, { valueKey: 'customKey' })` - Publish with custom value extraction
- `publishSwcAppMessage({ messageType: 'type', valueKey: 'customKey' })` - Publish with options object
- `publishMessage()` - Short alias
- `publishMessage(messageType)` - Short alias with message type
- `publishMessage(messageType, options)` - Short alias with options

**Using valueKey for Multiple Decorators:**

```typescript
@publishSwcAppMessage('event1', { valueKey: 'detail1' })
@publishSwcAppMessage('event2', { valueKey: 'detail2' })
handleMultipleEvents() {
  return {
    detail1: { type: 'event1', data: 'value1' },
    detail2: { type: 'event2', data: 'value2' }
  };
}
```

**SwcAppMessage Structure:**
```typescript
type SwcAppMessage<T = any> = {
  publisher?: any;        // Component that published the message
  data?: T;              // Payload data
  type?: string;         // Optional message type/category
};
```

**Key Features:**
- ✅ **Lifecycle-aware** - subscriptions only active while component is connected
- ✅ **Type-safe** - specify message types for filtering
- ✅ **Filter support** - use custom filter functions to handle specific conditions
- ✅ **Auto-publishing** - return value automatically becomes message payload
- ✅ **Async support** - works with async methods (promises)
- ✅ **Centralized** - all messages routed through SwcApp host
- ✅ **Decoupled** - components don't need to know about each other

**Usage Example:**
```typescript
// Publisher component
@elementDefine('product-list')
class ProductList extends HTMLElement {
  @publishSwcAppMessage('product-selected')
  selectProduct(productId: string) {
    const product = this.findProduct(productId);
    return product;
  }
}

// Subscriber component
@elementDefine('product-detail')
class ProductDetail extends HTMLElement {
  @subscribeSwcAppMessageWhileConnected('product-selected')
  onProductSelected(message: SwcAppMessage<Product>) {
    this.displayProduct(message.data);
  }
}
```

---

### 10. **SwcApp - Multiple Element Types with Mixin Pattern**

SWC provides a flexible Mixin-based architecture for creating SwcApp elements that extend different HTMLElement types. This enables building SPAs with any semantic HTML element as the root.

#### Available SwcApp Variants

```typescript
import {
  SwcApp,           // swc-app (HTMLElement)
  SwcAppBody,       // swc-app-body (HTMLBodyElement, is="body")
  SwcAppDiv,        // swc-app-div (HTMLDivElement, is="div")
  SwcAppSection,    // swc-app-section (HTMLElement, is="section")
  SwcAppMain,       // swc-app-main (HTMLElement, is="main")
  SwcAppArticle,    // swc-app-article (HTMLElement, is="article")
  SwcAppHeader,     // swc-app-header (HTMLElement, is="header")
  SwcAppFooter,     // swc-app-footer (HTMLElement, is="footer")
  SwcAppNav,        // swc-app-nav (HTMLElement, is="nav")
  SwcAppAside,      // swc-app-aside (HTMLElement, is="aside")
  defineSwcAppAll,  // Register all SwcApp variants at once
  swcAppFactories   // Array of all definition functions
} from '@dooboostore/simple-web-component';
```

#### Using SwcAppBody (Recommended for SPAs)

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>My SPA</title>
</head>
<!-- Use is="swc-app-body" for semantic HTML -->
<body id="app" is="swc-app-body">
  <root-router></root-router>
</body>
<script src="bundle.js"></script>
</html>
```

```typescript
// index.ts
import 'reflect-metadata';
import { defineSwcAppBody, SwcAppInterface, defineSwcAppAll } from '@dooboostore/simple-web-component';
import bootFactory from './bootFactory';

const w = window;

w.document.addEventListener('DOMContentLoaded', async () => {
  const container = Symbol('app');
  
  // Initialize services and components
  await defineSwcAppBody(w);


  // Get app root element
  const appElement = w.document.querySelector('#app') as SwcAppInterface;
  
  if (appElement && typeof appElement.connect === 'function') {
    appElement.connect({
      path: '/',
      routeType: 'path',
      container: container,
      onStartedLazyDefineComponent: [yourComponentFactory1, yourComponentFactor2],
      window: w,
      onEngineStarted: () => {
        console.log('🚀 Application started successfully');
      }
    });
  }
});
```

#### Factory Pattern - Component Registration

```typescript
// Component factory
export default (w: Window) => {
  const tagName = 'my-component';
  const existing = w.customElements.get(tagName);
  if (existing) return tagName;

  @elementDefine(tagName, { window: w })
  class MyComponent extends w.HTMLElement {
    @onInitialize
    onconstructor(@inject(MyService.SYMBOL) service: MyService) {
      this.service = service;
    }
  }

  return tagName;
};

// Boot factory
export default (w: Window, container: symbol) => {
  serviceFactories.forEach(s => s(container));
};

// Entry point
const container = Symbol('app');
await defineSwcAppBody(w);
const appElement = w.document.querySelector('#app') as SwcAppInterface;
appElement.connect({
  container,
  window: w,
  onStartedLazyDefineComponent: [...pageFactories, ...componentFactories],
  onEngineStarted: () => {
    appElement.innerHTML = '<root-router></root-router>';
  }
});
```

#### 11. **Routing with @subscribeSwcAppRouteChangeWhileConnected**

SWC provides declarative routing with automatic path matching, order-based execution, and optional propagation control.

#### Basic Routing Setup

```typescript
@elementDefine('root-router')
class RootRouter extends HTMLElement {
  @subscribeSwcAppRouteChangeWhileConnected(['', '/'], { order: 0 })
  @innerHtmlLightNodeThis
  handleHome(routerPathSet: RouterEventType) {
    return `<landing-page/>`;
  }

  @subscribeSwcAppRouteChangeWhileConnected(['/products'], { order: 1 })
  @innerHtmlLightNodeThis
  handleProducts(routerPathSet: RouterEventType) {
    return `<products-list/>`;
  }

  @subscribeSwcAppRouteChangeWhileConnected(['/product/{id}'], { order: 2 })
  @innerHtmlLightNodeThis
  handleProductDetail(routerPathSet: RouterEventType) {
    const { id } = routerPathSet.pathData;
    return `<product-detail product-id="${id}"/>`;
  }

  @subscribeSwcAppRouteChangeWhileConnected(['/{tail:.*}'], { order: 999 })
  @innerHtmlLightNodeThis
  handle404(routerPathSet: RouterEventType) {
    return `<not-found-page/>`;
  }
}
```

#### Route Handler Features

**1. Path Matching**
- **No path pattern** (omit path): `@subscribeSwcAppRouteChangeWhileConnected({ order: -1 })` - matches all routes
- **Exact match**: `['', '/']` - matches home route only
- **Prefix match**: `['/products']` - matches `/products` and `/products/...`
- **Dynamic segments**: `['/product/{id}']` - captures `id` parameter
- **Wildcard**: `['/{tail:.*}']` - matches any remaining path (use for 404)

**2. Order-Based Execution**
Routes are executed in order of `order` value (lowest first). First matching route with a return value stops propagation:

```typescript
@subscribeSwcAppRouteChangeWhileConnected(['', '/'], { order: 0 })  // Checked first
@subscribeSwcAppRouteChangeWhileConnected(['/admin'], { order: 1 })  // Checked second
@subscribeSwcAppRouteChangeWhileConnected(['/{tail:.*}'], { order: 999 })  // Checked last (404)
```

**3. Propagation Control**
- **Return a value** (HTML string) → Stops propagation to next handlers
- **Return undefined/null** → Continues to next handler

```typescript
// This handler stops propagation (returns HTML)
@subscribeSwcAppRouteChangeWhileConnected(['/admin'], { order: 1 })
@innerHtmlLightNodeThis
handleAdmin(routerPathSet: RouterEventType) {
  return `<admin-panel/>`; // ✅ Stops here
}

// This handler continues propagation (no return value)
@subscribeSwcAppRouteChangeWhileConnected({ order: -1 })
onRouteChange(routerPathSet: RouterEventType) {
  console.log('Route changed:', routerPathSet.path);
  // No return value → continues to next handler
}
```

#### Advanced Example with Logging

```typescript
@elementDefine('accommodation-router')
class AccommodationRouter extends HTMLElement {
  // Global route logger (order: -1 runs first, no path pattern = matches all routes)
  @subscribeSwcAppRouteChangeWhileConnected({ order: -1 })
  onRouteChange(routerPathSet: RouterEventType) {
    console.log('[Route Change]', {
      path: routerPathSet.path,
      pathData: routerPathSet.pathData,
      timestamp: new Date().toISOString()
    });
    // No return → continues to route handlers
  }

  // Home route
  @subscribeSwcAppRouteChangeWhileConnected(['', '/'], { order: 0 })
  @innerHtmlLightNodeThis
  handleHome(routerPathSet: RouterEventType) {
    console.log('[Route Handler] Home');
    return `<landing-page/>`;
  }

  // List route
  @subscribeSwcAppRouteChangeWhileConnected(['/list'], { order: 1 })
  @innerHtmlLightNodeThis
  handleList(routerPathSet: RouterEventType) {
    console.log('[Route Handler] List');
    return `<list-page/>`;
  }

  // Detail route with dynamic parameter
  @subscribeSwcAppRouteChangeWhileConnected(['/detail/{productId}'], { order: 2 })
  @innerHtmlLightNodeThis
  handleDetail(routerPathSet: RouterEventType) {
    const { productId } = routerPathSet.pathData;
    console.log('[Route Handler] Detail', { productId });
    return `<detail-page product-id="${productId}"/>`;
  }

  // 404 fallback (order: 999 runs last)
  @subscribeSwcAppRouteChangeWhileConnected(['/{tail:.*}'], { order: 999 })
  @innerHtmlLightNodeThis
  handle404(routerPathSet: RouterEventType) {
    console.log('[Route Handler] 404 Not Found', routerPathSet.path);
    return `<not-found-page/>`;
  }
}
```

#### Router Configuration Options

```typescript
interface SwcAppRouteChangeOptions {
  path?: RoutePathType;  // Route path pattern(s)
  order?: number;        // Execution order (default: 0)
  filter?: (router: Router, meta: {currentThis: any, helper: HelperHostSet}) => boolean;
}
```

**Usage:**
```typescript
@subscribeSwcAppRouteChangeWhileConnected(
  ['/admin/{section}'],
  {
    order: 5,
    filter: (router, meta) => meta.currentThis.isAdmin === true
  }
)
@innerHtmlLightNodeThis
handleAdminSection(routerPathSet: RouterEventType) {
  const { section } = routerPathSet.pathData;
  return `<admin-${section}/>`;
}
```

#### RouterEventType Structure

```typescript
type RouterEventType = {
  path: string;           // Current route path
  pathData: Record<string, any>;  // Extracted path parameters
  triggerPoint: 'start' | 'end';  // Route change phase
};
```

**Example with path parameters:**
```
Route: /product/{id}
URL: /product/123
pathData: { id: '123' }
```

#### Multiple Decorators with Shared Return Value

When using multiple decorators on the same method, each decorator can extract its own value from the return object using its symbol key or custom `valueKey` option.

**How It Works:**
1. Each decorator has a default symbol key (e.g., `ATTRIBUTE_METADATA_KEY`, `PROPERTY_METADATA_KEY`)
2. When a method returns an object, each decorator checks if its key exists in the object
3. If the key exists, the decorator uses that value; otherwise uses the entire return value
4. This allows multiple decorators to extract different values from the same return object

**Method 1: Using Default Symbol Keys**

```typescript
import {
  ATTRIBUTE_METADATA_KEY,
  PROPERTY_METADATA_KEY,
  STYLE_METADATA_KEY,
  CLASS_METADATA_KEY
} from '@dooboostore/simple-web-component';

@elementDefine('multi-decorator-example')
class MultiDecoratorExample extends HTMLElement {
  @setAttribute('selector')
  @setProperty('selector')
  @updateStyleThis
  @updateClassThis
  handleUpdate() {
    return {
      [ATTRIBUTE_METADATA_KEY]: 'attribute-value',
      [PROPERTY_METADATA_KEY]: 'property-value',
      [STYLE_METADATA_KEY]: { color: 'red', fontSize: '16px' },
      [CLASS_METADATA_KEY]: { 'active': true, 'disabled': false }
    };
  }
}
```

**Method 2: Using Custom valueKey Option**

For more readable code, use the `valueKey` option to specify custom keys:

```typescript
@elementDefine('custom-key-example')
class CustomKeyExample extends HTMLElement {
  @setAttribute('selector', { valueKey: 'attrValue' })
  @setProperty('selector', { valueKey: 'propValue' })
  @updateStyleThis({ valueKey: 'styleValue' })
  @updateClassThis({ valueKey: 'classValue' })
  handleUpdate() {
    return {
      attrValue: 'attribute-value',
      propValue: 'property-value',
      styleValue: { color: 'red', fontSize: '16px' },
      classValue: { 'active': true, 'disabled': false }
    };
  }
}
```

**Method 3: Mixing Symbol Keys and Custom Keys**

You can mix both approaches in the same method:

```typescript
@elementDefine('mixed-keys-example')
class MixedKeysExample extends HTMLElement {
  @setAttribute('selector')  // Uses default ATTRIBUTE_METADATA_KEY
  @setProperty('selector', { valueKey: 'customProp' })  // Uses custom key
  @updateStyleThis({ valueKey: 'styles' })  // Uses custom key
  handleUpdate() {
    return {
      [ATTRIBUTE_METADATA_KEY]: 'attr-value',
      customProp: 'prop-value',
      styles: { color: 'blue' }
    };
  }
}
```

**Supported Decorators with valueKey:**
- `@applyAttribute` / `@setAttribute` / `@setAttributeThis`
- `@applyProperty` / `@setProperty` / `@setPropertyThis`
- `@applySlot` / `@clearSlot` / `@appendHtmlSlot` / etc.
- `@applyNode` / `@replaceChildrenNodeThis` / etc.
- `@applyStyle` / `@updateStyleThis` / etc.
- `@applyClass` / `@updateClassThis` / etc.
- `@emitCustomEvent` / `@emit` / `@emitCustomEventThis`
- `@publishSwcAppMessage` / `@publish`

Each decorator will use only its corresponding value from the return object, preventing conflicts and allowing clean separation of concerns.

---

### 12. **Accommodation Pattern**
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
    onconstructor(@inject(MyService.SYMBOL) service: MyService) {
      this.service = service;
    }
  }

  return tagName;
};

// Boot factory
export default (w: Window, container: symbol) => {
  serviceFactories.forEach(s => s(container));
};

// Entry point
const container = Symbol('app');
await defineSwcAppBody(w);
const appElement = w.document.querySelector('#app') as SwcAppInterface;
appElement.connect({
  container,
  window: w,
  onStartedLazyDefineComponent: [...pageFactories, ...componentFactories],
  onEngineStarted: () => {
    appElement.innerHTML = '<root-router></root-router>';
  }
});
```
---

## ⚠️ Critical Rules

### DO NOT Use @Sim on Web Components
`@sim` is for **Services only**. Web Components should use `@elementDefine`.

```typescript
// ✅ CORRECT
@sim
export class UserService { }

@elementDefine(tagName, { window: w })
class UserWidget extends w.HTMLElement { }

// ❌ WRONG
@sim
@elementDefine(tagName, { window: w })
class UserWidget extends w.HTMLElement { }
```

### Factory Always Returns 
```typescript
export default (w: Window) => {
  const tagName = 'my-element';
  const existing = w.customElements.get(tagName);
  if (existing) return existing;  

  @elementDefine(tagName, { window: w })
  class MyElement extends w.HTMLElement { }
  
  return existing; 
};
```

### @onInitialize for DI (Not Constructor Parameters)
```typescript
// ✅ CORRECT
@onInitialize
onconstructor(@inject(Service.SYMBOL) service: Service) {
  this.service = service;
}

// ❌ WRONG
constructor(private service: Service) { super(); }  // Web Components can't have constructor parameters!
```

---

## 📚 Examples

- **[Commerce (E-Commerce SPA)](https://github.com/dooboostore-develop/packages/tree/main/%40dooboostore/simple-web-component/examples/commerce)** - Full shopping cart example
- **[Stock (Market Dashboard)](https://github.com/dooboostore-develop/packages/tree/main/%40dooboostore/simple-web-component/examples/stock)** - Real-time data with routing
- **[Accommodation (Reference Pattern)](https://github.com/dooboostore-develop/packages/tree/main/%40dooboostore/simple-web-component/examples/accommodation)** - Standard setup pattern

---

## 🔗 Related Packages

- **[@dooboostore/simple-boot](https://github.com/dooboostore-develop/packages/tree/main/%40dooboostore/simple-boot)** - DI & AOP Container
- **[@dooboostore/core-web](https://github.com/dooboostore-develop/packages/tree/main/%40dooboostore/core-web)** - Web Utilities & Router
- **[@dooboostore/dom-parser](https://github.com/dooboostore-develop/packages/tree/main/%40dooboostore/dom-parser)** - HTML Parsing & AST

---

## 📄 License
[MIT License](https://github.com/dooboostore-develop/packages/tree/main/%40dooboostore/simple-web-component/LICENSE.md)

