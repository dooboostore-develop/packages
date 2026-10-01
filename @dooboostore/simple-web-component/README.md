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

**`@elementDefine(name, options?)` options:** `window`, `extends` (customized built-in, e.g. `'body'`), `useShadow` (`true | 'open' | 'closed'`), `observedAttributes`, `customElementRegistry`.

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

#### @onConnectedBodyShadow
Render HTML automatically when component connects to DOM.

```typescript
@onConnectedBodyShadow
render() {
  return `<div>Hello, <span>${this.name}</span>!</div>`;
}
```

#### @innerHtmlLight
Apply HTML to specific host element.

```typescript
@innerHtmlLight
updateContent() {
  return `<p>Updated content</p>`;
}
```

#### @replaceChildrenLight
Replace child nodes with new content.

```typescript
@replaceChildrenLight
renderNode() {
  return this.buildNode(); // Node, Node[] or HTML string
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

  @onConnectedBodyLight
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

  @onConnectedBodyLight
  render() {
    return `
      <div>
        <!-- HTML directive: render HTML content -->
        <!--[html @message@ ]-->
        
        <!-- Text directive: render as text -->
        <!--[text Count: @count@ ]-->
        
        <!-- Attribute binding with a:: prefix -->
        <div a::title="'Count is'+@count@"></div>
        
        <!-- Event binding with e:: prefix -->
        <button e::click="@increment@()">Increment (@count@)</button>
        
        <!-- Conditional rendering -->
        <div a::style="@isActive@ ? 'color: green' : 'color: red'">
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
- `a::attributeName="@state@"` - Bind state to HTML attributes
- `e::eventName="@methodName@()"` - Bind events to methods

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
<button e::click="@increment@()">Increment</button>
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

  @onConnectedBodyShadow
  render() {
    return `
      <div>
        <!-- Display user info -->
        <h2><!--[text @user.name@ ]--></h2>
        <p a::title="Email: @user.email@">Age: @user.age@</p>
        
        <!-- Conditional rendering based on state -->
        <div a::style="@isEditing@ ? 'border: 1px solid blue' : 'border: none'">
          <!--[html @isEditing@ ? '<input type="text" />' : '<span>View Mode</span>' ]-->
        </div>
        
        <button e::click="toggleEdit"> toggleEdit </button>
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
  filter: (event, meta) => {
    return (event.target as HTMLElement)?.id === 'critical-button';
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
- `addEventListenerDelegateLight(selector, type, options)` - Delegate in light DOM
- `eventDelegateLight(selector, type, options)` - Short alias
- `addEventListenerDelegateShadow(selector, type, options)` - Delegate in shadow DOM
- `eventDelegateShadow(selector, type, options)` - Short alias
- `addEventListenerDelegateAll(selector, type, options)` - Delegate in all DOM
- `eventDelegateAll(selector, type, options)` - Short alias
- `addEventListenerLight(selector, type, options)` / `eventLight(...)` - Bind (non-delegated) in light DOM
- `addEventListenerShadow(selector, type, options)` / `eventShadow(...)` - Bind (non-delegated) in shadow DOM
- `addEventListenerAll(selector, type, options)` / `eventAll(...)` - Bind (non-delegated) in both light & shadow DOM
- `addEventListenerMutation(selector, type, options)` / `eventMutation(...)` - Delegate via `MutationObserver` instead of event bubbling (useful for non-bubbling events like `focus`/`blur`); `*Light`/`*Shadow`/`*All` variants also available

**@addEventListener Options:**
- `capture` / `once` / `passive` - standard listener options
- `preventDefault` / `stopPropagation` / `stopImmediatePropagation` - applied before the handler runs
- `filter: (event, { currentThis, helper }) => boolean | Promise<boolean>` - skip the handler when it returns false
- `before: (event, meta, args) => any` - runs after `filter`; its return value is injectable with `@eventBeforeReturn`
- `finally: (event, meta, { args, result, error }) => any` - always runs after the handler
- `debounceTime` / `throttleTime` (ms) / `distinctUntilChanged` - rate-limit the event stream
- `removeListener: (target, options) => void` - cleanup callback on disconnect

**Event-Type-Specific Aliases (eventClick, eventInputThis, ...):**

Beyond the generic `event(selector, type, options)` form, every scope/delegate variant above is also pre-bound to ~59 common DOM event types, so you don't have to repeat the type string:

```typescript
@eventClick('.logo')
onLogoClick() { ... }

// Same as: @eventDelegateLight('.item', 'click')
@eventClickDelegateLight('.item')
onItemClick(event: Event) { ... }

// Same as: @addEventListenerThis('keydown')
// No selector/options needed → bare form works too (no parens)
@eventKeydownThis
onKeydown(event: KeyboardEvent) { ... }

// Still callable with options when you need them
@eventKeydownThis({ filter: (e, meta) => !meta.currentThis.isLocked })
onKeydownFiltered(event: KeyboardEvent) { ... }
```

Naming pattern: `event` + `PascalCase(type)` + scope suffix (`''`(base) / `DelegateLight` / `DelegateShadow` / `DelegateAll` / `Delegate` / `MutationLight` / `MutationShadow` / `MutationAll` / `Mutation` / `Light` / `Shadow` / `All` / `This` / `AppHost` / `Window` / `Document`) — e.g. `eventClick`, `eventClickDelegateShadow`, `eventDblclickThis`, `eventPointerdownDelegateAll`, `eventKeydownWindow`.

The `This`/`AppHost`/`Window`/`Document` variants (e.g. `eventClickThis`, `eventClickWindow`) take no selector — only an optional `options`, so they support both bare usage (`@eventClickThis`) and factory usage (`@eventClickThis({...})`), the same dual-mode pattern `@subscribeSwcAppRouteChange`/`@subscribeSwcAppMessage` already use. The `Delegate*`/`Light`/`Shadow`/`All`/base variants still require a `selector` as their first argument, so they must always be called with parens.

Covered event types include mouse (`click`, `dblclick`, `mousedown`, `mouseup`, `mousemove`, `mouseover`, `mouseout`, `mouseenter`, `mouseleave`, `contextmenu`, `wheel`), keyboard (`keydown`, `keyup`, `keypress`), form (`input`, `change`, `submit`, `reset`, `invalid`, `select`), focus (`focus`, `blur`, `focusin`, `focusout`), drag & drop (`dragstart`, `drag`, `dragend`, `dragenter`, `dragleave`, `dragover`, `drop`), touch (`touchstart`, `touchmove`, `touchend`, `touchcancel`), pointer (`pointerdown`, `pointerup`, `pointermove`, `pointerover`, `pointerout`, `pointerenter`, `pointerleave`, `pointercancel`), clipboard (`copy`, `cut`, `paste`), animation/transition (`animationstart/end/iteration/cancel`, `transitionstart/end/cancel/run`), and misc (`scroll`, `resize`, `load`, `error`, `toggle`).

These aliases are generated in `addEventListener.ts` from a small internal `makeTypedEventAliases<TEvent>(type)` factory — adding a new event type is a one-line addition, not hand-written boilerplate. Any event type not covered still works via the generic `@event(selector, 'your-type', options)` / `@eventDelegateLight(selector, 'your-type', options)` etc.

#### Order-Independent Parameter Decorators (@eventObject, @matchedElement, @hostSet, @helperHostSet, @helperSet)

`@addEventListener`-bound handlers normally receive fixed positional arguments (`(event, legacyHelper1, legacyHelper2)`). If you'd rather not memorize that order, decorate individual parameters instead — order and position no longer matter, and any parameter left undecorated in a method that uses none of these decorators still gets the legacy positional arguments (fully backward-compatible):

```typescript
import { addEventListener, eventObject, matchedElement, hostSet, helperHostSet, helperSet } from '@dooboostore/simple-web-component';

@elementDefine('product-list')
class ProductList extends HTMLElement {
  // Order can be anything you like
  @addEventListenerDelegateLight('.item', 'click')
  onItemClick(@matchedElement $item: Element, @eventObject event: Event) {
    console.log('clicked item:', $item, event);
  }

  // Only need the host tree info? Just ask for @hostSet.
  @eventClickThis()
  onHostClick(@hostSet hs: HostSet) {
    console.log(hs.$appHost, hs.$hosts);
  }

  // Need DOM helpers ($q, $qa, ...) too? Use @helperHostSet (superset of @hostSet) or @helperSet (helpers only).
  @eventClickThis()
  onHostClickFull(@helperHostSet full: HelperHostSet, @helperSet helpers: HelperSet) { ... }
}
```

- `@eventObject` - the original DOM `Event`
- `@matchedElement` - the delegate-matched element (or `event.currentTarget` for direct bindings)
- `@hostSet` - host-ancestor-tree info only (`$host`, `$parentHost`, `$hosts`, `$appHost`, `$appHosts`, `$firstHost`, `$lastHost`, `$firstAppHost`, `$lastAppHost`)
- `@helperHostSet` - `@hostSet` + DOM/window helpers (`$d`, `$w`, `$q`, `$qa`, `$qi`) + `$this`
- `@helperSet` - DOM/window helpers only (`$d`, `$w`, `$q`, `$qa`, `$qi`), no host-tree info

The same mechanism (and the same 5 decorators, plus two more) also applies to:
- **`@onInitialize`/`@onConnectedBefore`/`@onConnectedAfter`/... lifecycle methods** — can freely mix `@hostSet`/`@helperHostSet`/`@helperSet` with `@inject(...)` on the same method.
- **`@subscribeSwcAppRouteChange`** — add `@swcAppRouterEvent` to receive the `RouterEventType` regardless of position.
- **`@subscribeSwcAppMessage`** — add `@appMessage` to receive the `SwcAppMessage` regardless of position.
- **`before` hook results** — `@eventBeforeReturn`, `@routeChangeBeforeReturn`, `@appMessageBeforeReturn`, `@changedAttributeBeforeReturn`, `@mutationObserverBeforeReturn`, `@resizeObserverBeforeReturn`, `@intersectionObserverBeforeReturn`, `@eventMediaBeforeReturn`, `@setIntervalBeforeReturn`, `@setTimeoutBeforeReturn` inject the value returned by that decorator's `before` option.

Note: once any parameter of a method is decorated, only decorated parameters receive values (the legacy positional arguments are no longer passed).

```typescript
@onConnectedAfter
onconstructor(@inject(UserService.SYMBOL) userService: UserService, @hostSet hs: HostSet) { ... }

@subscribeSwcAppRouteChange
onRouteChanged(@helperSet helpers: HelperSet, @swcAppRouterEvent re: RouterEventType) { ... }

@subscribeSwcAppMessage
onMessage(@hostSet hs: HostSet, @appMessage msg: SwcAppMessage) { ... }
```

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
- `emitThis(type, options)` - Emit from $this element (`emitAppHost` / `emitWindow` / `emitDocument` take `(type, options)`; `emitLight` / `emitShadow` / `emitAll` take `(selector, type, options)`)
- Options: `bubbles`, `composed`, `cancelable`, `filter`, `valueKey`, `attributeName`, `root`

#### @publishSwcAppMessage
Publish messages through the message bus when method completes.

```typescript
// No arguments needed → bare form
@publishSwcAppMessage
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
- `publishSwcAppMessage` - Bare decorator, publish without message type (equivalent to `publishSwcAppMessage()`)
- `publishSwcAppMessage()` - Same as bare, but as a factory call — useful when you need the call-with-parens form for consistency with a neighboring decorator
- `publishSwcAppMessage(messageType)` - Publish with specific message type
- `publishSwcAppMessage(messageType, { valueKey: 'customKey' })` - Publish with custom value extraction
- `publishSwcAppMessage({ messageType: 'type', valueKey: 'customKey' })` - Publish with options object
- `publishMessage` / `publishMessage()` - Short alias, same bare/factory duality
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

#### @emitThis
Emit events from $this. Pass `attributeName` so a parent can attach a handler through that attribute
(there is no default attribute name; set it explicitly). The attribute script gets `event` and `$data` (= `event.detail`).

```typescript
@emitThis('navigate', { attributeName: 'on-emit-navigate' })
onNavClick(e: any) {
  return { path: e.target.dataset.path };
}
// Parent: <app-header on-emit-navigate="$host.onHeaderNavigate(event, $data)"></app-header>
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
Query a single element. The default `root: 'auto'` searches the shadow root if one exists, otherwise the light DOM.

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

#### Special selectors, `pick`, and shorthands
Special selectors: `$this`, `$host`, `$parentHost`, `$appHost`, `$firstHost`, `$lastHost`, `$firstAppHost`, `$lastAppHost`, `$hosts`, `$appHosts`, `$window`, `$document`. A function selector `(currentThis, helper) => Element | Element[] | NodeList | null` is also accepted (no `root` option).

```typescript
@query('$this')
self?: HTMLElement;          // the component itself

@query('.item', { pick: 'last' })   // 'first' (default) | 'last' | number → single; 'all' | 'even' | 'odd' → array
lastItem?: HTMLElement;

@queryIn('shadow', 'even')('.row')  // root + pick factory
evenRows?: HTMLElement[];
```

- Shorthands: `queryLight` / `queryShadow` / `queryAllRoots` (single), `queryAllLight` / `queryAllShadow` / `queryAllAll` (arrays)
- `filter: (el, { currentThis, helper }) => boolean` narrows the matches
- Assigning `null` / `undefined` / `[]` to a `@query` field removes the matched elements from the DOM

### 6. **Attribute Binding**

#### @attribute (Field / Method Decorator)
Works on both fields and methods; behavior depends on where it is applied.
- **Field**: getter/setter that reads/writes the element attribute (`type` converts to Number/Boolean)
- **Method**: applies the return value to the attribute. `null` **removes** it, `undefined` does nothing

**One string = attribute name on `$this`**, **two strings = (selector, attribute name)**.

```typescript
@elementDefine('product-card')
class ProductCard extends HTMLElement {
  // Field — product-id on $this
  @attribute('product-id')
  productId: string;

  // Field — data-id on the selector target
  @attribute('#user', 'data-id')
  userId: string;

  // Field — bare (field name = attribute name)
  @attribute
  title: string;

  // Method — return value goes to nav[data-active] (null → removed)
  @attribute('nav', 'data-active')
  updateNav() {
    return this.section; // 'releases' | null
  }

  // Method — data-name on $this
  @attribute('data-name')
  setUserName() {
    return this.userName;
  }
}
```

**Patterns:**
- `@attribute` - `$this`, name = field/method name
- `@attribute('attr-name', options?)` - attr-name on `$this`
- `@attribute('selector', 'attr-name', options?)` - selector target (`nav`, `#user`, `.card`, `$appHost`, ...)
- `@attribute((this, helper) => el, 'attr-name')` - function selector
- `@attribute('selector', 'attr-name', { valueKey: 'k' })` - (method) set only `k` from the returned object
- Options: `type`, `filter`, `valueKey`, `root`. Shorthands: `attrThis`, `attrAppHost`, `attrLight`, `attrShadow`, `attrAll`
- A field getter evaluates a `{{= expr }}` attribute value (see "Attribute Expressions")

#### @removeAttribute (Method Decorator)
Always removes the attribute when the method runs. The return value passes through unchanged,
so it is safe on subscriber handlers that must not return a value (e.g. route changes).

```typescript
// Runs before the other route handlers — reset the nav highlight
@subscribeSwcAppRouteChange({ order: -1 })
@removeAttribute('nav', 'href')
handleNavReset() {
  return undefined; // keep the chain going
}
```

#### @changedAttribute (Method Decorator)
Listen for attribute changes on the component itself (`attributeChangedCallback`). Handler arguments: `(newValue, oldValue, name, helperHostSet)`; `newValue` is converted by `type` (and a `{{= expr }}` value is evaluated first).

```typescript
@elementDefine('reactive-component')
class ReactiveComponent extends HTMLElement {
  @changedAttribute('product-id')
  onProductIdChanged(newValue: string, oldValue: string) {
    console.log(`Product changed from ${oldValue} to ${newValue}`);
    this.loadProduct(newValue);
  }

  @changedAttribute('data-status', { type: Boolean })
  onStatusChanged(newValue: boolean) {
    console.log(`Status is now: ${newValue}`);
  }

  // Bare (or no name) → the method name is used as the attribute name
  @changedAttribute
  status(newValue: string) { }
}
```

**@changedAttribute Options:**
- `attributeName` - Attribute name to listen for (optional, defaults to method name)
- `type` - Type converter: `Number`, `Boolean`, or `String`
- `while` - `'connected'`: skip changes while disconnected, and run once on connect with the current value (if set)
- `filter` / `before` / `finally` - same hook pattern as `@addEventListener` (`before` result → `@changedAttributeBeforeReturn`)

### 6.5 **Property Binding**

#### @property (Field / Method Decorator)
Works on both fields and methods.
- **Field**: getter/setter that reads/writes a property of the target element
  - Bare `@property` (= `$this` + same name) stays a plain field with no getter/setter and is only registered as an **SSR hydration target**
- **Method**: assigns the return value to the target element's property (`undefined` is ignored)

Unlike `@attribute`, **the first string is always a selector**. A property on the element itself is just the field, so a name-only form would be meaningless.

```typescript
@elementDefine('form-handler')
class FormHandler extends HTMLElement {
  // Field — bare: own field (SSR hydration target)
  @property
  declare rows: Row[];

  // Field — property of the selector target
  @property('#chart', 'data')
  chartData: number[];

  // Method — return value goes to #submit-btn.disabled
  @property('#submit-btn', 'disabled')
  updateSubmitState() {
    return this.hasErrors;
  }

  // Method — same-named property on the selector target (input.value)
  @property('input')
  value() {
    return this.initialValue;
  }
}
```

**Patterns:**
- `@property` - `$this`, name = field/method name
- `@property('selector', options?)` - same-named property on the target
- `@property('selector', 'propertyName', options?)` - propertyName on the target
- `@property((this, helper) => el, 'propertyName')` - function selector
- To call a method on the target, use `@callProperty('selector', 'methodName')` (an array return value is spread as arguments; `callPropertyLight` / `callPropertyShadow` / `callPropertyAll` also exist)

### 6.6 **DOM Observers (@mutationObserver, @resizeObserver, @intersectionObserver)**

Observe DOM mutations, element size changes, and viewport intersection declaratively. All three decorators share the same pattern as `@event` — they support optional selector (defaults to `$this`), root-based helpers, and `delegate` mode.

#### @mutationObserver
Detect DOM changes (child add/remove, attribute changes, text changes) and react automatically.

```typescript
@elementDefine('list-observer')
class ListObserver extends HTMLElement {
  // Observe all changes under this component (light DOM)
  @mutationObserverLight({ childList: true, attributes: true, subtree: true })
  onDomChanged(matchedEls: HTMLElement[], mutations: MutationRecord[], observer: MutationObserver) {
    console.log('DOM changed:', matchedEls.length, mutations);
  }

  // Observe a specific selector (delegate mode - catches dynamically added nodes too)
  @mutationObserverDelegateShadow('.item', { childList: true })
  onItemChanged(matchedEls: HTMLElement[], mutations: MutationRecord[], observer: MutationObserver) {
    console.log('Item changed:', matchedEls);
  }
}
```

**Callback signature:**
- `matchedEls: HTMLElement[]` - Elements matching the selector (1st arg)
- `mutations: MutationRecord[]` - Original mutation records (2nd arg)
- `observer: MutationObserver` - The observer instance (3rd arg)

**How delegate works:**
- **delegate=true** - Observes the root with `subtree: true`; dynamically added/removed elements matching the selector are detected in the callback
- **delegate=false** (default) - Observes only the elements matching the selector at connect time

**@mutationObserver Options:**
- Standard `MutationObserverInit` options: `childList`, `attributes`, `characterData`, `subtree`, `attributeFilter`, `attributeOldValue`, `characterDataOldValue`
- `delegate` - Observe root and filter by selector in callback
- `root` - `'light' | 'shadow' | 'all' | 'auto'`
- `filter` - Additional callback filter
- `removeObserver` - Cleanup callback called on disconnect `(target, options)`

**@mutationObserver Decorator Variants:**
- `mutationObserver(selector?, options?)` - Full form (selector defaults to `$this`)
- `mutationObserverLight(selector?, options?)` - Observe light DOM
- `mutationObserverShadow(selector?, options?)` - Observe shadow DOM
- `mutationObserverAll(selector?, options?)` - Observe both light & shadow
- `mutationObserverDelegate(selector?, options?)` - Delegate mode (root observe)
- `mutationObserverDelegateLight(selector?, options?)` - Delegate in light DOM
- `mutationObserverDelegateShadow(selector?, options?)` - Delegate in shadow DOM
- `mutationObserverDelegateAll(selector?, options?)` - Delegate in all DOM

#### @resizeObserver
Detect element size changes and react automatically.

```typescript
@elementDefine('chart-widget')
class ChartWidget extends HTMLElement {
  // Re-render when component size changes (selector defaults to $this)
  @resizeObserverLight()
  onResize(matchedEls: HTMLElement[], entries: ResizeObserverEntry[], observer: ResizeObserver) {
    this.redraw(entries[0]?.contentRect);
  }

  // Watch specific elements (delegate mode tracks dynamically added ones)
  @resizeObserverDelegateShadow('.card')
  onCardResize(matchedEls: HTMLElement[], entries: ResizeObserverEntry[], observer: ResizeObserver) {
    console.log('Card resized:', matchedEls[0]?.clientWidth);
  }
}
```

**Callback signature:**
- `matchedEls: HTMLElement[]` - Elements that were resized (1st arg)
- `entries: ResizeObserverEntry[]` - Original observer entries (2nd arg)
- `observer: ResizeObserver` - The observer instance (3rd arg)

**@resizeObserver Options:**
- `box` - `'content-box' | 'border-box' | 'device-pixel-content-box'`
- `delegate` - Track dynamically added/removed matching elements
- `root` - `'light' | 'shadow' | 'all' | 'auto'`
- `filter` - Additional callback filter
- `removeObserver` - Cleanup callback called on disconnect `(target, options)`

**@resizeObserver Decorator Variants:**
- `resizeObserver(selector?, options?)` - Full form (selector defaults to `$this`)
- `resizeObserverLight(selector?, options?)` - Observe light DOM
- `resizeObserverShadow(selector?, options?)` - Observe shadow DOM
- `resizeObserverAll(selector?, options?)` - Observe both light & shadow
- `resizeObserverDelegate(selector?, options?)` - Delegate mode (root observe)
- `resizeObserverDelegateLight(selector?, options?)` - Delegate in light DOM
- `resizeObserverDelegateShadow(selector?, options?)` - Delegate in shadow DOM
- `resizeObserverDelegateAll(selector?, options?)` - Delegate in all DOM

**Combining with @resizeObserver delegate (dynamic tracking):**
When `delegate: true`, an internal `MutationObserver` automatically observes the root so that elements matching the selector are tracked even after being dynamically added/removed from the DOM.

#### @intersectionObserver
Detect when elements enter/exit the viewport (or a custom scroll container) and react automatically — useful for lazy loading, infinite scroll, and visibility tracking.

```typescript
@elementDefine('lazy-image-list')
class LazyImageList extends HTMLElement {
  // Fire when any matching element crosses the viewport boundary
  @intersectionObserverLight('.lazy-img', { threshold: 0 })
  onImageVisible(matchedEls: HTMLElement[], entries: IntersectionObserverEntry[], observer: IntersectionObserver) {
    entries.forEach(e => {
      if (e.isIntersecting) (e.target as HTMLImageElement).src = (e.target as HTMLElement).dataset.src!;
    });
  }

  // Delegate mode tracks dynamically added elements too
  @intersectionObserverDelegateShadow('.card', { threshold: [0, 0.5, 1] })
  onCardIntersect(matchedEls: HTMLElement[], entries: IntersectionObserverEntry[], observer: IntersectionObserver) {
    console.log('intersection ratio:', entries[0]?.intersectionRatio);
  }
}
```

**Callback signature:**
- `matchedEls: HTMLElement[]` - Elements matching the selector (1st arg)
- `entries: IntersectionObserverEntry[]` - Original observer entries (2nd arg)
- `observer: IntersectionObserver` - The observer instance (3rd arg)

**@intersectionObserver Options:**
- Standard `IntersectionObserverInit` options: `threshold`, `rootMargin` (note: its own scroll-container `root` is passed as `intersectionRoot`, since the decorator's `root` option already means light/shadow/all/auto selector scope)
- `delegate` - Observe root and filter by selector in callback (dynamically added/removed elements are tracked too)
- `root` - `'light' | 'shadow' | 'all' | 'auto'`
- `filter` - Additional callback filter
- `removeObserver` - Cleanup callback called on disconnect `(target, options)`

**@intersectionObserver Decorator Variants:**
- `intersectionObserver(selector?, options?)` - Full form (selector defaults to `$this`)
- `intersectionObserverLight(selector?, options?)` - Observe light DOM
- `intersectionObserverShadow(selector?, options?)` - Observe shadow DOM
- `intersectionObserverAll(selector?, options?)` - Observe both light & shadow
- `intersectionObserverDelegate(selector?, options?)` - Delegate mode (root observe)
- `intersectionObserverDelegateLight(selector?, options?)` - Delegate in light DOM
- `intersectionObserverDelegateShadow(selector?, options?)` - Delegate in shadow DOM
- `intersectionObserverDelegateAll(selector?, options?)` - Delegate in all DOM

**Cleanup:**
All three observers are automatically disconnected when the component is removed from the DOM. `removeObserver` callbacks (if provided) are invoked during cleanup.

### 7. **DOM Manipulation with applyNode**

Surgically add, replace, or remove nodes in the DOM with fine-grained control.

```typescript
@elementDefine('content-updater')
class ContentUpdater extends HTMLElement {
  @addEventListener('button', 'click')
  @replaceChildren()
  updateContent() {
    return `<div>New content</div>`;
  }

  @addEventListener('.append-btn', 'click')
  @insertBeforeEnd()
  appendContent() {
    return `<p>Appended content</p>`;
  }

  @addEventListener('.prepend-btn', 'click')
  @insertAfterBegin()
  prependContent() {
    return `<p>Prepended content</p>`;
  }

  @onConnectedBodyLight
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
- `applyNode(selector?, options?)` / `apply` / `node` - Full form (selector defaults to `$this`, position defaults to `replaceChildren`); `applyThis` / `applyAppHost` / `applyLight` / `applyShadow` / `applyAll`
- `replaceChildren()` / `replaceChildrenLight()` - Replace all children
- `insertBeforeEnd()` / `insertBeforeEndLight()` / `insertBeforeEndShadow()` - Append to end
- `insertAfterBegin()` / `insertAfterBeginLight()` - Prepend to beginning
- `innerHtml()` / `innerHtmlLight()` / `innerHtmlShadow()` - Set innerHTML
- `innerText()` / `innerTextLight()` / `innerTextShadow()` - Set innerText
- `clearChildrenNode()` / `clearChildrenLight()` - Remove all children
- Options: `position`, `root`, `filter`, `fallback`, `valueKey`. Ready-made `filter` helpers: `skipIfSameTagPresent`, `skipIfExists(selector)`, `skipIfEmpty`, `applyIfChanged` (e.g. `@innerHtmlLight({ filter: skipIfExists('my-page') })`)

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
  | 'remove'           // Remove element
  | 'clearChildren';   // Remove all children
```

### 8. **Style & Class Management**

Apply styles and classes dynamically with `@applyStyle` and `@applyClass`.

```typescript
@elementDefine('styled-component')
class StyledComponent extends HTMLElement {
  @state('isActive')
  isActive = false;

  @addEventListener('button', 'click')
  @updateStyle
  toggleStyle() {
    return {
      color: this.isActive ? 'green' : 'red',
      fontSize: '16px'
    };
  }

  @addEventListener('.toggle-btn', 'click')
  @updateClass
  toggleState() {
    return {
      'active': this.isActive,
      'disabled': !this.isActive
    };
  }

  @onConnectedBodyLight
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

**@applyStyle Variants:** (each takes `(selector?, options?)`; bare form targets `$this`)
- `setStyle` - Clear and set styles
- `updateStyle` - Update/merge styles
- `removeStyle` - Remove specific styles
- `applyStyle(selector, action?)` / `style` - action `'set' | 'update' | 'remove'` (default `'update'`); `styleThis(action?)` / `styleAppHost` / `styleLight` / `styleShadow` / `styleAll`

**@applyClass Variants:** (each takes `(selector?, classMapOrOptions?, options?)`; bare form targets `$this`)
- `setClass` - Replace all classes
- `updateClass` - Toggle classes by a `{ className: boolean }` map
- `addClass` / `removeClass` / `toggleClass`
- `applyClass(selector, action?)` / `cls` - action `'set' | 'update' | 'add' | 'remove' | 'toggle'` (default `'update'`); `clsThis(action?)` / `clsAppHost` / `clsLight` / `clsShadow` / `clsAll`
- Note: for the class decorators, an options object in the 2nd position must contain `root` (e.g. `{ root: 'auto', valueKey: 'k' }`); an object without `root` is read as a class map

### 8.5 **Lifecycle Hooks**

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
    // Called on connect, before rendering
  }

  @onConnectedAfter({ order: 1 })
  afterConnected() {
    // Called on connect, after rendering and observer setup
  }

  @onConnectedBody
  render() {
    // Called when element enters DOM — renders the returned HTML (variants: @onConnectedBodyShadow / @onConnectedBodyLight)
    return `<div>...</div>`;
  }

  @onDisconnectedBefore
  beforeDisconnected() {
    // Called before element disconnects from DOM
  }

  @onDisconnected // alias of @onDisconnectedAfter
  onDisconnected() {
    // Called when element leaves DOM
  }

  @onAdoptedBefore
  beforeAdopted() {
    // Called before element is adopted into new document
  }

  @onAdopted // alias of @onAdoptedAfter
  onAdopted() {
    // Called when element is adopted into new document
  }

  @onConnectedSwcApp({ order: 0 })
  onSwcAppConnected() {
    // Called when the element registers with a connected SwcApp host
    // (deferred until SwcApp.connect() if the app is not connected yet)
  }

  @onConnectedCompleted({ order: 0 })
  onConnectedCompleted() {
    // Called after all connected lifecycle hooks complete
  }
}
```

**Lifecycle Execution Order (connectedCallback):**
1. `@onInitialize` - once, on first init (DI via `@inject` parameters)
2. `@onConnectedSwcApp` - the element registers with its app host (deferred until `connect()` if needed)
3. `@onConnectedBefore` - before rendering
4. `@onConnectedBody` (`Shadow` / `Light`) - render the returned HTML/Node (skipped for SSR-rendered elements)
5. Observers / timers / listeners are wired up
6. `@onConnectedAfter` - after rendering
7. `@onConnectedCompleted` - always runs last (in a `finally` block), then `trigger: 'connectedDone'` replays fire

Disconnect: `@onDisconnectedBefore` → cleanup → `@onDisconnected` (`@onDisconnectedAfter`). Adopt: `@onAdoptedBefore` → `@onAdopted` (`@onAdoptedAfter`).

**Order Parameter:**
All lifecycle decorators support `order?: number` for controlling execution sequence:
```typescript
@onConnectedBefore({ order: 0 })  // Runs first
onFirst() { }

@onConnectedBefore({ order: 1 })  // Runs second
onSecond() { }
```

### 8.6 **Timers (@setInterval, @setTimeout, @requestAnimationFrame)**

Declaratively schedule work tied to the component. Every timer the decorator starts is cleared automatically on disconnect. There are two modes (`type` option):

- `type: 'returnValue'` (**default**) - nothing starts automatically. When you call the method, its return value (a function, or the function under `valueKey`) becomes the repeating/delayed callback, called with `(id: number)`. The original return value passes through.
- `type: 'onConnected'` - starts on connect and calls the decorated method itself on every tick/fire.

```typescript
@elementDefine('live-clock')
class LiveClock extends HTMLElement {
  // Auto-start on connect
  @setInterval(1000, {
    type: 'onConnected',
    parameter: (set) => [Date.now()],
    created: (set, id) => console.log('interval started, timer id:', id)
  })
  tick(now: number) {
    this.textContent = new Date(now).toLocaleTimeString();
  }

  // Fires once, 3 seconds after connect
  @setTimeout(3000, { type: 'onConnected' })
  onceAfter3s() {
    console.log('3 seconds have passed');
  }

  // Default 'returnValue': starts when you call startPolling()
  @setInterval(900)
  startPolling() {
    return (id: number) => console.log('interval', id, 'ticked');
  }
}
```

**`@setInterval(interval, options?)` / `@setTimeout(delay, options?)`:**
- `interval` / `delay` - milliseconds. `setInterval` repeats; `setTimeout` fires once.
- `type` - `'returnValue'` (default) | `'onConnected'`
- `parameter?: (set: HelperHostSet) => any[]` - (`onConnected`) arguments for each tick/fire; omitted → no arguments.
- `created?: (set: HelperHostSet, id: number) => void` - called once right after the timer is armed. For logging only; cleanup is automatic.
- `filter` / `before` / `finally` - (`onConnected`) per-tick hooks; `before` result → `@setIntervalBeforeReturn` / `@setTimeoutBeforeReturn`.
- `valueKey?: symbol | string` - which key of the returned object holds the callback function (defaults to `SET_INTERVAL_METADATA_KEY` / `SET_TIMEOUT_METADATA_KEY`).

**`@requestAnimationFrame(options?)`** (bare form also works) - same two modes. The frame callback is `(timestamp, prevValue) => any`: return `undefined`/`null` to stop the loop, anything else is passed as `prevValue` to the next frame. Options: `type`, `created`, `valueKey`.

```typescript
@requestAnimationFrame
animate() {
  return (ts: number, prev = 0) => (prev < 100 ? prev + 1 : null); // stops at 100
}
```

### 8.7 **@around (AOP) and @eventMedia**

`@around` wraps a method (`before(helper, args)` → new args, `after(helper, result)` → new result, `finally(helper, { args, result, error })`) or a field (`get(helper, stored)`, `set(helper, incoming)`). Async hooks are supported when the method is async.

```typescript
@around({ before: (h, args: [string]) => [args[0].trim()], after: (h, r: string) => r + '!' })
greet(name: string) { return `hi ${name}`; }

@around({ set: (h, v: string) => v?.trim() })
label: string = '';
```

`@eventMedia(query, eventType, options?)` / `@eventMediaChange(query, options?)` subscribe to `window.matchMedia(query)` on connect and unsubscribe on disconnect. Handler arguments: `(event: MediaQueryListEvent, helperHostSet)`. Options: `filter`, `before`, `finally`.

```typescript
@eventMediaChange('(max-width: 600px)')
onMobile(e: MediaQueryListEvent) { this.compact = e.matches; }
```

### 9. **Attribute Expressions (`{{= }}`)**

An attribute value of the form `{{= expression }}` is evaluated as JavaScript instead of being used as a string:

```html
<product-detail product-id="{{= $host.selectedId }}"></product-detail>
```

- Evaluated when the value is read by an `@attribute` field getter and before it is passed to `@changedAttribute` handlers
- `this` is the element that owns the attribute; the helper/host variables are in scope: `$this`, `$host`, `$parentHost`, `$hosts`, `$firstHost`, `$lastHost`, `$appHost`, `$appHosts`, `$d`, `$w`, `$q`, `$qa`, `$qi`
- The result keeps its JavaScript type (then `type` conversion applies); on error the raw string is used

Template bindings inside `@onConnectedBody*` HTML (`@state@`, `<!--[html ]-->`, `<!--[text ]-->`, `a::`, `e::`, and `p::` for DOM properties) are described in the `@state` section.

---

### 10. **Component Communication - Message Bus**

SWC provides a powerful message bus system for inter-component communication through SwcApp. Components can publish and subscribe to typed messages while connected.

#### @subscribeSwcAppMessage
Subscribe to messages while component is connected to DOM.

```typescript
@elementDefine('notification-panel')
class NotificationPanel extends HTMLElement {
  @subscribeSwcAppMessage
  onAnyMessage(message: SwcAppMessage) {
    console.log('Received message:', message);
  }

  @subscribeSwcAppMessage('user-login')
  onUserLogin(message: SwcAppMessage<{ username: string }>) {
    console.log(`Welcome ${message.data?.username}`);
  }

  @subscribeSwcAppMessage('user-login', {
    filter: (msg, currentThis) => msg.data?.username === 'admin'
  })
  onAdminLogin(message: SwcAppMessage) {
    console.log('Admin logged in!');
  }
}
```

**@subscribeSwcAppMessage Options:** `filter(message, currentThis)`, `before(message, currentThis)` (result → `@appMessageBeforeReturn`), `finally(message, currentThis, { args, result, error })`, `subject`, `trigger` (see "Message Replay"). Every matching subscriber runs (fire-and-forget); return values do not stop other subscribers.

#### @publishSwcAppMessage
Publish a message from a method's return value.

```typescript
@elementDefine('login-form')
class LoginForm extends HTMLElement {
  // No arguments needed → bare form
  @publishSwcAppMessage
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
- `publishSwcAppMessage` / `publishSwcAppMessage()` - Publish without message type (bare or factory form, both equivalent)
- `publishSwcAppMessage(messageType)` - Publish with specific message type
- `publishSwcAppMessage(messageType, { valueKey: 'customKey' })` - Publish with custom value extraction
- `publishSwcAppMessage({ messageType: 'type', valueKey: 'customKey' })` - Publish with options object
- `publishMessage` / `publishMessage()` - Short alias
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
- ✅ **Centralized** - all messages routed through the nearest SwcApp host (`$appHost`)
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
  @subscribeSwcAppMessage('product-selected')
  onProductSelected(message: SwcAppMessage<Product>) {
    this.displayProduct(message.data);
  }
}
```

---

### 11. **SwcApp - Multiple Element Types with Mixin Pattern**

SWC provides a flexible Mixin-based architecture for creating SwcApp elements that extend different HTMLElement types. This enables building SPAs with any semantic HTML element as the root.

#### Available SwcApp Variants

```typescript
// SwcApp, SwcAppBody, ... are createElement helpers: SwcAppBody(w, data?) creates the element.
// defineSwcApp, defineSwcAppBody, ... register the custom element.
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
      onStartedLazyDefineComponent: [yourComponentFactory1, yourComponentFactory2],
      window: w,
      onEngineStarted: () => {
        console.log('🚀 Application started successfully');
      }
    });
  }
});
```

**Main `connect()` options (`SwcAttributeConfigType`):** `routeType` (`'path' | 'hash' | 'element'`), `path` (first URL), `container` (DI container symbol), `window`, `onStartedLazyDefineComponent` (component factories), `onEngineStarted(sp, app)`, `onConnected` / `onDisconnected`, `onConnectedChildBefore` / `onConnectedChildAfter`, `onDisconnectedChildBefore` / `onDisconnectedChildAfter`, `onChildrenConnectedDone`, `onChildrenRouteChanged`, `messageReplayBufferSize`, `ssr`, `otherInstanceSim`.

App host methods: `routing(path)`, `back()`, `forward()`, `reload()`, `publishMessage(message)`, `observeMessage(...)`, `connectedElements()`.

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

#### 12. **Routing with @subscribeSwcAppRouteChange**

SWC provides declarative routing with automatic path matching, order-based execution, and optional propagation control.

#### Basic Routing Setup

```typescript
@elementDefine('root-router')
class RootRouter extends HTMLElement {
  @subscribeSwcAppRouteChange(['', '/'], { order: 0 })
  @innerHtmlLight
  handleHome(routerPathSet: RouterEventType) {
    return `<landing-page/>`;
  }

  @subscribeSwcAppRouteChange(['/products'], { order: 1 })
  @innerHtmlLight
  handleProducts(routerPathSet: RouterEventType) {
    return `<products-list/>`;
  }

  @subscribeSwcAppRouteChange(['/product/{id}'], { order: 2 })
  @innerHtmlLight
  handleProductDetail(routerPathSet: RouterEventType) {
    const { id } = routerPathSet.pathData;
    return `<product-detail product-id="${id}"/>`;
  }

  @subscribeSwcAppRouteChange(['/{tail:.*}'], { order: 999 })
  @innerHtmlLight
  handle404(routerPathSet: RouterEventType) {
    return `<not-found-page/>`;
  }
}
```

#### Route Handler Features

**1. Path Matching**
- **No path pattern** (omit path): `@subscribeSwcAppRouteChange({ order: -1 })` - matches all routes
- Patterns are matched against the **whole** path (anchored regex); a string, an array (first match wins), or a function `(currentThis) => string | string[]`
- **Exact match**: `['', '/']` - matches home route only; `['/products']` matches `/products` only
- **Sub paths**: `['/products/{tail:.*}']` - use a regex segment to match `/products/...`
- **Dynamic segments**: `['/product/{id}']` - captures `id` (`[^/]+`); custom regex: `{slug:[a-z0-9-]+}`
- **Wildcard**: `['/{tail:.*}']` - matches any path (use for 404)

**2. Order-Based Execution**
Handlers of one element run in `order` (lowest first, default 0). The first matching handler that returns a value stops the rest of **that element's** chain:

```typescript
@subscribeSwcAppRouteChange(['', '/'], { order: 0 })  // Checked first
@subscribeSwcAppRouteChange(['/admin'], { order: 1 })  // Checked second
@subscribeSwcAppRouteChange(['/{tail:.*}'], { order: 999 })  // Checked last (404)
```

**3. Propagation Control**
- **Return a value** (anything other than `undefined`/`null`, after `valueKey` extraction) → stops this element's remaining handlers
- **Return `undefined`/`null`** → continues to the next handler

```typescript
// This handler stops propagation (returns HTML)
@subscribeSwcAppRouteChange(['/admin'], { order: 1 })
@innerHtmlLight
handleAdmin(routerPathSet: RouterEventType) {
  return `<admin-panel/>`; // ✅ Stops here
}

// This handler continues propagation (no return value)
@subscribeSwcAppRouteChange({ order: -1 })
onRouteChange(routerPathSet: RouterEventType) {
  console.log('Route changed:', routerPathSet.path);
  // No return value → continues to next handler
}
```

**4. When to run: `on`** (default `'match'` — the behavior above)

| `on` | Runs when |
|---|---|
| `'match'` | the path matches (every route change) |
| `'enter'` | it didn't match before and matches now (also the replay when the element connects) |
| `'update'` | it keeps matching but the path or query changed |
| `'leave'` | it matched before and doesn't now — only for elements that stay connected (a page that gets replaced should clean up in `onDisconnected`) |
| `'beforeLeave'` | before leaving this route; return `false` (or `Promise<false>`) to cancel the navigation |

A bare `@subscribeSwcAppRouteChange` (no path) matches every route: with `'match'` it runs on every change, `'update'` on every URL change, `'enter'` once.

```typescript
@subscribeSwcAppRouteChange('/releases/{releaseSeq}/tasks/{taskSeq}', { on: 'update' })
@innerHtml('.card')
swapCard(@swcAppRoutePathVariable('taskSeq') taskSeq: string) { ... }   // same page, only the card changes

@subscribeSwcAppRouteChange('/edit/{id}', { on: 'beforeLeave' })
confirmLeave() { return this.dirty ? confirm('Discard your changes?') : true; }
```

`beforeLeave` covers `router.go(...)` and the browser back/forward buttons. Back/forward have already changed the history when the guard runs, so a cancel restores the previous URL with `pushState`. Calling `pushState`/`replaceState` directly and closing the tab (`beforeunload`) are not covered. The handler receives the route being left with `to` (the target `RouteData`).

**5. Route parameter decorators**

No prefix means *first*; `First`/`Last` pick the first/last value when a key repeats; plural forms return every value.

| Query (`?tag=a&tag=b`) | Value | Path (`/a/{id}/b/{id}` ← `/a/1/b/2`) | Value |
|---|---|---|---|
| `@swcAppRouteQueryParam('tag')` | `'a'` (`null` if absent) | `@swcAppRoutePathVariable('id')` | `'1'` |
| `@swcAppRouteFirstQueryParam('tag')` | `'a'` | `@swcAppRouteFirstPathVariable('id')` | `'1'` |
| `@swcAppRouteLastQueryParam('tag')` | `'b'` | `@swcAppRouteLastPathVariable('id')` | `'2'` |
| `@swcAppRouteQueryParams('tag')` | `['a','b']` | `@swcAppRoutePathVariables('id')` | `['1','2']` |
| `@swcAppRouteQueryParamObject` | `{ tag: 'a' }` | `@swcAppRoutePathVariableObject` | `{ id: '1' }` |
| `@swcAppRouteFirstQueryParamObject` | `{ tag: 'a' }` | `@swcAppRouteFirstPathVariableObject` | `{ id: '1' }` |
| `@swcAppRouteLastQueryParamObject` | `{ tag: 'b' }` | `@swcAppRouteLastPathVariableObject` | `{ id: '2' }` |
| `@swcAppRouteQueryParamsObject` | `{ tag: ['a','b'] }` | `@swcAppRoutePathVariablesObject` | `{ id: ['1','2'] }` |
| `@swcAppRouteURLSearchParams` | `URLSearchParams` | | |

```typescript
@subscribeSwcAppRouteChange('/releases/{releaseSeq}')
load(@swcAppRoutePathVariable('releaseSeq') seq: string, @swcAppRouteQueryParam('tab') tab: string | null) { ... }
```

- Once any parameter is decorated, the positional route argument is no longer passed — add `@swcAppRouterEvent` for the whole event.
- `route.pathData` keeps its old behavior: a repeated variable name holds the **last** value. Use the decorators above to pick first/last explicitly.

**6. Navigating: `@swcAppRoute` / `@swcAppRouteGo`**

The method returns where to go; the decorator calls the element's SwcApp router — no `Router` injection needed. `@swcAppRoute({ type })` picks the Router method (default `'go'`); `@swcAppRouteGo`, `@swcAppRoutePush`, ... are aliases with the type fixed.

```typescript
@eventDelegateAll('[data-href]', 'click')
@swcAppRouteGo
onNavigate(@matchedElement el: Element) {
  return el.getAttribute('data-href');
}

@eventShadow('form', 'submit', { preventDefault: true })
@swcAppRouteGo
async onSubmit() {
  await this.authService.login(...);
  return '/releases';            // after an async body too
}
```

| Return value (`go`) | Result |
|---|---|
| `'/path'` / `{ path, searchParams }` | `router.go(...)` |
| `{ path, replace?, state?, scrollToTop? }` | `router.go` with those options |
| a number | history move (`-1` = back) |
| `undefined` / `null` / `false` | no navigation (conditional) |

- Other Router methods: `@swcAppRoute({ type: 'push' })` or the alias with the type fixed (`@swcAppRoutePush` / `@swcAppRoutePush({ state, valueKey })`):

| Alias | `type` | Return value |
|---|---|---|
| `@swcAppRouteGo` | `go` (default) | see the table above |
| `@swcAppRoutePush` / `@swcAppRouteReplace` | `push` / `replace` | `RouteAction` |
| `@swcAppRoutePushUpsertSearchParam` / `@swcAppRouteReplaceUpsertSearchParam` | `pushUpsertSearchParam` / `replaceUpsertSearchParam` | `{ key: value \| value[] }` |
| `@swcAppRoutePushAddSearchParam` / `@swcAppRouteReplaceAddSearchParam` | `pushAddSearchParam` / `replaceAddSearchParam` | `[[key, value], ...]` |
| `@swcAppRoutePushDeleteSearchParam` / `@swcAppRouteReplaceDeleteSearchParam` | `pushDeleteSearchParam` / `replaceDeleteSearchParam` | `string \| string[]` |
| `@swcAppRoutePushDeleteHashSearchParam` / `@swcAppRouteReplaceDeleteHashSearchParam` | `pushDeleteHashSearchParam` / `replaceDeleteHashSearchParam` | `string \| string[]` |

  `push`/`replace` go through `beforeLeave` guards like `go`. The search-param methods keep the path, so they don't count as leaving and skip the guards.
- Options: `@swcAppRoute({ type, state, valueKey, filter })`, plus `replace` / `scrollToTop` for `go` (`@swcAppRouteGo({ replace: true })`). `valueKey` picks the target out of a return object when stacked with other output decorators (default key `SWC_APP_ROUTE_METADATA_KEY`).
- `filter(router, value, { currentThis, helper })` → `false` skips the navigation (same shape as the other output decorators' `filter`; `value` is after `valueKey` extraction). E.g. `@swcAppRouteGo({ filter: (router, to) => to !== router.value.path })`.
- The original return value still passes through, and navigation goes through `router.go`, so `beforeLeave` guards apply.

#### Advanced Example with Logging

```typescript
@elementDefine('accommodation-router')
class AccommodationRouter extends HTMLElement {
  // Global route logger (order: -1 runs first, no path pattern = matches all routes)
  @subscribeSwcAppRouteChange({ order: -1 })
  onRouteChange(routerPathSet: RouterEventType) {
    console.log('[Route Change]', {
      path: routerPathSet.path,
      pathData: routerPathSet.pathData,
      timestamp: new Date().toISOString()
    });
    // No return → continues to route handlers
  }

  // Home route
  @subscribeSwcAppRouteChange(['', '/'], { order: 0 })
  @innerHtmlLight
  handleHome(routerPathSet: RouterEventType) {
    console.log('[Route Handler] Home');
    return `<landing-page/>`;
  }

  // List route
  @subscribeSwcAppRouteChange(['/list'], { order: 1 })
  @innerHtmlLight
  handleList(routerPathSet: RouterEventType) {
    console.log('[Route Handler] List');
    return `<list-page/>`;
  }

  // Detail route with dynamic parameter
  @subscribeSwcAppRouteChange(['/detail/{productId}'], { order: 2 })
  @innerHtmlLight
  handleDetail(routerPathSet: RouterEventType) {
    const { productId } = routerPathSet.pathData;
    console.log('[Route Handler] Detail', { productId });
    return `<detail-page product-id="${productId}"/>`;
  }

  // 404 fallback (order: 999 runs last)
  @subscribeSwcAppRouteChange(['/{tail:.*}'], { order: 999 })
  @innerHtmlLight
  handle404(routerPathSet: RouterEventType) {
    console.log('[Route Handler] 404 Not Found', routerPathSet.path);
    return `<not-found-page/>`;
  }
}
```

#### Router Configuration Options

```typescript
interface SwcAppRouteChangeOptions {
  path?: RoutePathType;  // string | string[] | (currentThis) => string | string[]
  order?: number;        // Execution order (default: 0)
  filter?: (router: Router, meta: { currentThis: any; helper: HelperHostSet }) => boolean | Promise<boolean>;
  before?: (router: Router, meta) => any;           // result → @routeChangeBeforeReturn
  finally?: (router: Router, meta, ctx: { args; result?; error? }) => any;
  valueKey?: symbol | string;                       // value used for the stop check
  trigger?: 'connected' | 'connectedDone';          // replay timing (see "Message Replay")
}
```

Forms: `@subscribeSwcAppRouteChange` (bare, all routes), `('/path')`, `(['/a', '/b'])`, `(path, options)`, `(options)`. Alias: `@changedRoute`.

**Usage:**
```typescript
@subscribeSwcAppRouteChange(
  ['/admin/{section}'],
  {
    order: 5,
    filter: (router, meta) => meta.currentThis.isAdmin === true
  }
)
@innerHtmlLight
handleAdminSection(routerPathSet: RouterEventType) {
  const { section } = routerPathSet.pathData;
  return `<admin-${section}/>`;
}
```

#### Combined Example: Route + Attribute (nav highlight)

Stack several decorators on one method and split the returned object with `valueKey`.
**Note:** returning a value stops the later handlers, so an observer-style handler uses `order: -1` and returns `undefined` to keep the chain going.

```typescript
@replaceChildrenLight({ valueKey: 'element' })
@subscribeSwcAppRouteChange('/releases')
@attribute('nav', 'href', { valueKey: 'href' })
handleExplore() {
  return { element: ExplorePage(w), href: 'releases' }; // highlight nav + render the page
}

@subscribeSwcAppRouteChange({ order: -1 })
@removeAttribute('nav', 'href')
handleNavReset() {
  return undefined; // reset the highlight, keep the chain going
}
```

```css
/* Highlight the current section button */
nav[href="releases"] [data-href="/releases"] { color: var(--color-text); background: var(--color-bg-alt); }
```

#### RouterEventType Structure

```typescript
type RouterEventType = {
  path: string;                   // Current route path
  url: string;
  search: string;
  searchParams: URLSearchParams;
  data?: any;
  pathData?: Record<string, any>; // Extracted path parameters (filled per matched pattern)
  router: Router;
  triggerPoint: 'start' | 'end' | 'first-end';  // Route change phase
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
  @attribute('selector', 'data-state')
  @property('selector', 'value')
  @updateStyle
  @updateClass
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
  @attribute('selector', 'data-state', { valueKey: 'attrValue' })
  @property('selector', 'value', { valueKey: 'propValue' })
  @updateStyle('$this', { valueKey: 'styleValue' })
  @updateClass('$this', { root: 'auto', valueKey: 'classValue' })  // class options need `root`
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
  @attribute('selector', 'data-state')  // Uses default ATTRIBUTE_METADATA_KEY
  @property('selector', 'value', { valueKey: 'customProp' })  // Uses custom key
  @updateStyle('$this', { valueKey: 'styles' })  // Uses custom key
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
- `@applyAttribute` / `@attribute`
- `@applyProperty` / `@property`
- `@applySlot(id, { position, valueKey })` (the `clearSlot` / `appendHtmlSlot` / ... shorthands take no options)
- `@applyNode` / `@replaceChildren` / `@innerHtml` / etc.
- `@applyStyle` / `@updateStyle` / etc.
- `@applyClass` / `@updateClass` / etc.
- `@emitCustomEvent` / `@emit`
- `@publishSwcAppMessage` / `@publishMessage`
- `@subscribeSwcAppRouteChange` - the extracted value decides whether the chain stops
- `@setInterval` / `@setTimeout` / `@requestAnimationFrame` - variant: the extracted value must itself be a function, which becomes the timer/frame callback (see "Timers" above) rather than being applied directly.

Each decorator will use only its corresponding value from the return object, preventing conflicts and allowing clean separation of concerns.

---

### 13. **Accommodation Pattern**
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

## 🔄 Decorator API - Consolidated Pattern (v1.0.43+)

### Simplified Decorator API

Most DOM decorators take an **optional selector** that defaults to `$this` when omitted (or when used bare). Scope shorthands (`*This`, `*AppHost`, `*Light`, `*Shadow`, `*All`) are still provided for brevity.

#### Current Usage Pattern
```typescript
// Single function with optional selector
@applyClass('selector', 'update')
method() { ... }

@applyClass('$this', 'update')  // a single string is treated as the selector, so name $this explicitly (or use @clsThis('update'))
method() { ... }

@applyClass  // Bare decorator - selector defaults to $this
method() { ... }
```

#### Decorator Functions (Current API)

**applyClass.ts:**
- `applyClass(selector?, action?, options?)` - Set/update/add/remove/toggle classes
- `setClass(selector?, options?)` - Replace all classes
- `updateClass(selector?, options?)` - Toggle classes
- `addClass(selector?, options?)` - Add classes
- `removeClass(selector?, options?)` - Remove classes
- `toggleClass(selector?, options?)` - Toggle classes

**applyStyle.ts:**
- `applyStyle(selector?, action?, options?)` - Set/update/remove styles
- `setStyle(selector?, options?)` - Clear and set styles
- `updateStyle(selector?, options?)` - Update/merge styles
- `removeStyle(selector?, options?)` - Remove specific styles

**applyProperty.ts:**
- `property(selector?, propertyKey?, options?)` - field: property get/set; method: return value → property

**applyAttribute.ts:**
- `attribute(attrName | selector?, attrName?, options?)` - field: attribute get/set; method: return value → attribute (one string = $this)

**query.ts:**
- `query(selector, options?)` - Query single element (supports $this, $host, $appHost, etc.; `pick` option)
- `queryAll(selector, options?)` - Query multiple elements (`query` with `pick: 'all'`)

**emitCustomEvent.ts:**
- `emitCustomEvent(target, type, options?)` - Emit custom events
- `emit(target, type, options?)` - Short alias
- `emitCustomEvent(type, options?)` - Emit from `$this`

#### Usage Examples

```typescript
@elementDefine('my-component')
class MyComponent extends HTMLElement {
  // Class management - bare form targets $this
  @updateClass
  toggleActive() {
    return { 'active': this.isActive };
  }

  // Style management - bare form targets $this
  @updateStyle
  applyTheme() {
    return { color: this.theme.color, fontSize: '16px' };
  }

  // Property binding - first string is the selector
  @property('input', 'value')
  updateValue() {
    return this.computedValue;
  }

  // Attribute binding - one string = attribute on $this
  @attribute('data-id')
  updateId() {
    return this.elementId;
  }

  // Query elements
  @query('#input')
  inputElement?: HTMLInputElement;

  @queryAll('li')
  listItems?: HTMLLIElement[];

  // Emit custom events
  @addEventListener('button', 'click')
  @emitCustomEvent('$this', 'item-selected')
  onItemSelect() {
    return { itemId: this.selectedId };
  }

  // With selector and action
  @applyClass('.card', 'update')
  updateCardClass() {
    return { 'highlighted': true };
  }
}
```

#### Key Features

1. **Optional Selector** - Omit the selector (or use the bare form) to target `$this`
2. **Cleaner Code** - Single function name with multiple overloads
3. **Better Discoverability** - Intuitive parameter patterns
4. **Flexible Usage** - Supports bare decorators, with options, and with selectors
5. **Type Safe** - Full TypeScript support with proper type inference

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

### Factory Always Returns (the tag name)
```typescript
export default (w: Window) => {
  const tagName = 'my-element';
  if (w.customElements.get(tagName)) return tagName;

  @elementDefine(tagName, { window: w })
  class MyElement extends w.HTMLElement { }

  return tagName;
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


---

---

## 📨 Message Replay (subject / trigger)

Late subscribers can receive past messages. The buffer keeps every typed message
(`SwcConfigType.messageReplayBufferSize`, default 10, minimum 1 guaranteed).

```typescript
// 'behavior' = last message only, 'replay' = whole buffer in order.
// Unset (or 'subject') = live only.
@subscribeSwcAppMessage('auth-changed', { subject: 'behavior' })
onAuth(@appMessage msg: SwcAppMessage<User | null>) { ... }
```

`trigger` controls when replay happens (default `'connected'`).

- `'connected'`: replay when the element registers with the app host, i.e. before its own
  `@onConnectedBody` render. For handlers that don't need DOM targets.
- `'connectedDone'`: replay after the element finished rendering (after `@onConnectedCompleted`).
  Use it when the handler targets DOM rendered by the element itself, like `@innerHtml('.wrap')`
  (avoids the race where replay arrives before render and gets silently dropped).

```typescript
@subscribeSwcAppMessage('auth-changed', { subject: 'behavior', trigger: 'connectedDone' })
@innerHtml('.wrap')
async load(@appMessage msg: SwcAppMessage<User | null>) { ... }
```

Route subscribers (`@subscribeSwcAppRouteChange`) accept the same `trigger`.
Live broadcasts always reach everyone regardless of trigger.

## 🔌 App Host Hooks (onConnected / onSwcAppConnected / onDisconnected)

The three host hooks of `SwcAppMixin` are **abstract**: a subclass must implement them (use an empty method if there is nothing to do).
`@inject` parameters are resolved via DI (host element itself included).

- `onConnected()` - at connectedCallback (every time it is attached). It runs before `connect()`, so the DI container may not exist yet
- `onSwcAppConnected()` - after `connect()` completes (DI container and router are ready). **Call services here**
- `onDisconnected()` - at disconnectedCallback. Release subscriptions created in `onConnected`

```typescript
class MyAppBody extends SwcAppMixin(w.HTMLBodyElement) {
  onConnected() {}
  async onSwcAppConnected(@inject(AuthService.SYMBOL) auth: AuthService) {
    this.publishMessage({ type: 'auth-changed', data: await auth.me().catch(() => null) });
  }
  onDisconnected() {}
}
```

### observeMessage — the message bus as an Observable

```typescript
host.observeMessage()                                    // all types, live only
host.observeMessage('auth-changed')                      // one type
host.observeMessage('auth-changed', { subject: 'behavior' }) // type + replay of the last value
host.observeMessage({ type: 'auth-changed', subject: 'replay' }) // options-object form
```

- `subject`: `'behavior'` (last one) / `'replay'` (whole buffer) is delivered first at subscribe time, then live messages.
- Replay only works when `type` is given; options without a type receive live messages only.
- Returns an `Observable`; `unsubscribe()` the `Subscription` yourself (usually in `onDisconnected`).

When publishing from the host itself, call `this.publishMessage` directly.
The `@publishSwcAppMessage` decorator publishes through the parent host, and the
host itself has no parent, so the message would be dropped.

Use `connectedElements()` to get the currently connected child elements.

## 🌐 @fetch — Declarative HTTP

```typescript
// bare form: GET by default
@fetch('https://api.example.com/post/1')
async load(@fetchSettled settled: PromiseSettledResult<any>) {
  return settled;
}

// before (default): build request → fetch → inject settled → run method.
// Returns the method result.
@fetch({ url: '/api/post/1', request: 'GET' })
async loadBefore(@fetchSettled settled: PromiseSettledResult<any>) {
  return settled.status === 'fulfilled' ? settled.value : null;
}

// after: run method → use its return value as the body → fetch. Returns the fetch result.
@fetch({ url: '/api/posts', trigger: 'after', process: 'json' })
async save() {
  return { title: 'hello' };
}

// after + valueKey: use returnValue[valueKey] as the body.
@fetch({ url: '/api/echo', trigger: 'after', valueKey: 'form', process: 'form' })
async saveForm() {
  return { form: { title: 'hi' } };
}
```

**Modes**
- **before** (default, or `trigger: 'before'`): build request → fetch → inject the settled result via
  `@fetchSettled` → run the method. Returns the method result. A failed fetch does not
  throw — it arrives as `{ status: 'rejected', reason }`.
- **after** (`trigger: 'after'`, or just `valueKey`): run the method → its return value
  (or `returnValue[valueKey]`) becomes the body → fetch. Returns the fetch result; a failed fetch throws.
  `valueKey` is after-only — combining it with `trigger: 'before'` is a type error.

**Declarative vs manual** — pick one:
- **Declarative**: describe the request with `url` / `request` / `process` and the framework fetches.
- **Manual**: give `manual` and make the request yourself (a service call, your own `fetch`, ...).
  `url` / `request` / `process` are unused then, so combining them with `manual` is a type error.

```typescript
// service call — only the result matters
@fetch({ manual: (self) => self.myService.getProfile({}) })
async load(@fetchSettled settled?: PromiseSettledResult<MyService.ProfileResponse>) { ... }

// your own fetch — pass the signal so an abort cancels the network request too
@fetch({ trigger: 'after', manual: (_self, _helper, _params, signal, returnValue) =>
  window.fetch('/api/save', { method: 'POST', body: JSON.stringify(returnValue), signal }).then(r => r.json()) })
async save() { return { title: 'hi' }; }
```

`manual(this, helper, params, signal, returnValue?)` — `signal` aborts on disconnect / `abortPrevious`;
`returnValue` is the method's return value (or `returnValue[valueKey]`) in after mode, `undefined` in before mode.
Its return value is the fetch result.

**Options (declarative)**
- `url`: a string/`URL`/`Request`, or a factory `(this, helper, params) => url`.
- `request`: an HTTP method string (`'GET'`/`'POST'`/...) or a factory returning `RequestInit` —
  `(this, helper, params) => RequestInit` in before mode, `(this, helper, params, returnValue) => RequestInit`
  in after mode. Absent = GET, or POST when there is a body.
- `process`: body encoding for plain values — `'json'` / `'form'` (multipart) / `'urlencoded'` / `'text'`.
  Values that already are a `BodyInit` (string, `Blob`, `ArrayBuffer`, `FormData`, `URLSearchParams`,
  `ReadableStream`) are sent as-is. Unset = pass through untouched.
- Headers: `request` may return `headers` as an object, array or `Headers` instance. A `Content-Type`
  you set wins over the one `process` would add.
- The request uses the element's window `fetch` (the per-request window under SSR), falling back to `globalThis.fetch`.
- Default response handling: empty body (e.g. 204) → `undefined`, JSON content types (`application/json`,
  `*+json`) → parsed, otherwise text. A non-OK status throws `HttpResponseError` from `@dooboostore/core`
  with `response` (status, headers) and the parsed `body`:

```typescript
@fetch('/api/post/1')
async load(@fetchSettled settled?: PromiseSettledResult<any>) {
  if (settled?.status === 'rejected' && isHttpResponseError(settled.reason)) {
    return settled.reason.response?.status; // e.g. 404
  }
}
```

**Hooks** (same order as every other SWC decorator: `filter → before → handler → finally`)
- `filter(this, helper, params)` → `false` skips the whole call (no method, no fetch; returns `undefined`).
- `before(this, helper, params)` runs first after `filter` and is awaited; its return value is ignored.
- `after(this, helper, params, settled)` runs right after the fetch settles (fulfilled or rejected).
- `finally(this, helper, params, { args, result, error })` always runs around the whole call.
  `result` is what the call returns (the method result in before mode, the fetch result in after mode).

**Cancellation**
- Every call gets its own `AbortController`. Declarative requests get its signal as `init.signal`
  (merged with a `signal` you return from `request`, via `AbortSignal.any` or a fallback); `manual` gets it as
  the `signal` argument.
- When the element disconnects, all its in-flight `@fetch` requests are aborted. Such a call ends
  quietly with `undefined`: the method (before mode) and the `after` hook are skipped so nothing touches
  a detached DOM; `finally` still runs with `ctx.error` set to the `AbortError`.
- A call that *starts* while the element is detached (e.g. a `setTimeout` scheduled just before the user
  navigated away) is skipped the same quiet way. Elements that were never connected are not affected.
- `manual` should pass `signal` on to its own client (`fetch`, axios, ...) so the network
  request is actually cancelled. If it ignores the signal, the call still ends as soon as it's aborted
  (the result is raced against the abort) — the request just keeps running in the background and its
  late result is discarded.
- `abortPrevious: true` aborts the previous in-flight call of the same method when it's called again
  (search-as-you-type) — the superseded call ends quietly the same way, so a late old response can't
  overwrite the newest result.
- Aborting through your own signal is not quiet: it surfaces as a rejected settled result (before mode)
  or a thrown error (after mode), like any other failure.

**Aliases**

| Alias | Same as |
|---|---|
| `@fetchManual(fn, options?)` | `@fetch({ ...options, manual: fn })` |
| `@fetchGet(url, options?)` / `@fetchDelete(url, options?)` | before mode, `method` fixed to GET / DELETE |
| `@fetchPost(url, options?)` / `@fetchPut(...)` / `@fetchPatch(...)` | after mode (the method's return value is the body), `method` fixed |
| `@fetchLatest(url \| options)` | `@fetch({ ...options, abortPrevious: true })` |
| `@fetchBefore(options)` / `@fetchAfter(options)` | `@fetch({ ...options, trigger })` |

For the method aliases, `request` may only be a factory returning `RequestInit` (e.g. headers) — its `method` is overwritten.

```typescript
@fetchManual((self) => self.myService.getProfile({}))
async load(@fetchSettled settled?: PromiseSettledResult<Profile>) { ... }

@fetchPost('/api/posts', { process: 'json' })
async save() { return { title: 'hi' }; }

@fetchDelete((_self, _helper, params) => `/api/posts/${params[0]}`)
async remove(id: number, @fetchSettled settled?: PromiseSettledResult<unknown>) { ... }
```

**Composition** — e.g. form submit:
`@event('form', 'submit', { before: (e) => new FormData(e.target), preventDefault: true })`
stacked on `@fetch({ url: '/api/echo', trigger: 'after', process: 'form' })`, with the method taking
`@eventBeforeReturn formData: FormData` and returning it.

## 💧 @property Hydration Rules

- Attach bare `@property` (no args) to a field to mark it as an SSR hydration target.
- Self fields (`$this` + matching key) stay plain fields with no getter/setter.
- Declare the field with `declare` (both `= null` and `;` initializers get overwritten on upgrade).
