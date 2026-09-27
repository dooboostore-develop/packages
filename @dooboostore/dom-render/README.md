# @dooboostore/dom-render

[![NPM version](https://img.shields.io/npm/v/@dooboostore/dom-render.svg?color=cb3837&style=flat-square)](https://www.npmjs.com/package/@dooboostore/dom-render)
[![Build and Test](https://github.com/dooboostore-develop/packages/actions/workflows/main.yaml/badge.svg?branch=main)](https://github.com/dooboostore-develop/packages/actions/workflows/main.yaml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)


A reactive and component-oriented DOM template engine for fine-grained rendering. `@dooboostore/dom-render` tracks state changes through proxy-based observation and updates only affected render units.

---

## Features

- Reactive object proxy rendering (`DomRender`, `DomRenderProxy`)
- HTML template bindings (`${...}$`, `#...#`, `@this@`)
- Structural directives (`dr-if`, `dr-for`, `dr-for-of`, `dr-repeat`, `dr-strip`, `dr-appender`)
- Event directives (`dr-event-*`, `dr-window-event-*`, `dr-on-init`, `dr-on-rendered-init`)
- Form directives (`dr-form` and validator integration)
- Component system (`ComponentBase`, `createComponent`, target elements/attrs)
- Lifecycle hooks (`onCreateRender`, `onInitRender`, `onRawSetRendered`, etc.)
- Built-in messenger for inter-component pub/sub
- Router integration (Path/Hash) via config

## Installation

```bash
pnpm add @dooboostore/dom-render
# or
npm install @dooboostore/dom-render
```

## Quick Start

```typescript
import { DomRender } from '@dooboostore/dom-render';

const app = document.querySelector('#app')!;

let state = {
  title: 'Hello DomRender',
  count: 0,
  increment() {
    this.count += 1;
  }
};

app.innerHTML = `
  <h1>${@this@.title}$</h1>
  <p>Count: ${@this@.count}$</p>
  <button dr-event-click="@this@.increment()">+1</button>
`;

const result = new DomRender({
  rootObject: state,
  target: app,
  config: { window }
});

state = result.rootObject;
```

---

## Public API (Root Export)

`@dooboostore/dom-render`'s root entry (`src/index.ts`) re-exports as flat named exports — there is no `components`/`configs`/etc. namespace object to import:

```typescript
import { DomRender, DomRenderProxy, ComponentBase, attribute, Appender, DomRenderConfig } from '@dooboostore/dom-render';
```

This covers: a selected set of built-in components/helpers (`If`, `This`, `AppenderComponent`, `PromiseSwitch`, `Choose`, `CheckBox`, `Radio`, `Select`, `Timer`, `Details`, `Input`, `Route`, `RouterOutlet`, `A`, `ComponentSet`, `ComponentRouterBase`, `ComponentBase`, `attribute`, and the combined `drComponent` map used to register them all at once), plus everything from `configs`, `decorators`, `events`, `lifecycle`, `messenger`, `operators` (including the `Appender` collection class), `rawsets`, `types`, `DomRender` and `DomRenderProxy`.

The `query` and `event` decorators are **not** re-exported from the root; import them via the `./*` subpath export:

```typescript
import { query, event } from '@dooboostore/dom-render/components/ComponentBase';
```

---

## Core Concepts

### 1) Reactive Root Object

`DomRender` wraps your root object with a proxy. Mutating fields on `result.rootObject` triggers reactive rendering.

```typescript
const result = new DomRender({
  rootObject: { name: 'kim', age: 20 },
  target: element,
  config: { window }
});

const root = result.rootObject;
root.age = 21; // dependent template fragments update
```

### 2) Template Expressions

- `${expr}$`: evaluate JS expression in render context
- `#it#`, `#nearForOfIndex#`: loop context placeholders
- `@this@`: current render/component instance pointer

```html
<div>${@this@.user.name}$</div>
<li dr-for-of="@this@.items">${#it#.title}$</li>
```

### 3) Incremental Render Units (`RawSet`)

DOM fragments are segmented into units with dependency tracking. When path changes, only connected units are re-executed.

---

## Structural Directives

### `dr-if`

Conditional rendering based on expression truthiness.

```html
<div dr-if="@this@.isLoggedIn">
  Welcome, ${@this@.user.name}$
</div>
```

### `dr-for`

Classic `for(...)` loop. `dr-option-it` is evaluated per iteration and its value is substituted for `#it#` in the cloned markup.

```html
<li dr-for="let i=0; i<@this@.items.length; i++" dr-option-it="i">
  ${@this@.items[#it#].name}$
</li>
```

### `dr-for-of`

Array/object iteration with `#it#` context replacement.

```html
<ul>
  <li dr-for-of="@this@.items">
    ${#it#.name}$
  </li>
</ul>
```

### `dr-repeat`

Repeat block by count/range expression.

```html
<div dr-repeat="@this@.columns">Cell ${#it#}$</div>
```

### `dr-appender`

Optimized append/update/delete for list-like incremental data.

```html
<ul>
  <li dr-appender="@this@.rows">${#it#}$</li>
</ul>
```

### `dr-strip` / `dr-option-strip`

Strip wrapper element while preserving children.

```html
<div dr-if="@this@.ok" dr-option-strip="true">#innerHTML#</div>
```

---

## Template Utilities

### Dynamic content directives

- `dr-inner-html`: bind `innerHTML`
- `dr-inner-text`: bind `innerText`
- `dr-this`, `dr-this-property`: bind target context object
- `dr-option-before`, `dr-option-after`: pre/post scripts attached alongside another directive on the same element

- `dr-value`, `dr-src`, `dr-checked`, `dr-selected`, `dr-readonly`, `dr-disabled`, `dr-hidden`, `dr-required`, `dr-open`, `dr-class`, `dr-style`: bind the corresponding property/attribute from an expression
- `dr-attr="{key: expr, ...}"`: shorthand that expands each pair into `key="${expr}$"`

Plain attributes can also be bound by putting a template expression inside the attribute value itself:

```html
<div dr-inner-text="@this@.plainText"></div>
<div dr-inner-html="@this@.trustedHtml"></div>
<img src="${@this@.imageUrl}$" alt="${@this@.alt}$" />
<img dr-attr="{src: @this@.imageUrl, alt: @this@.alt}" />
```

### Form utility (`dr-form`)

`dr-form` wires every `[name]` child to the target object (optionally with `Validator`/`ValidatorArray` from `@dooboostore/core`). Per-field options: `dr-form:name`, `dr-form:event` (default `change`), `dr-form:validator`.

```html
<form dr-form="@this@.formState">
  <input name="email" dr-form:name="'email'" dr-form:event="change" />
</form>
```

### Appender utility class

`Appender` supports keyed incremental collection updates.

```typescript
import { Appender } from '@dooboostore/dom-render';

const state = {
  rows: new Appender('A', 'B')
};

state.rows.set('key-1', 'Updated A');
state.rows.delete('key-1');
state.rows.clear();
```

---

## Event System

### `dr-event-*` directive

Bind DOM events declaratively.

```html
<button dr-event-click="@this@.submit($event)">Submit</button>
<input dr-event-input="@this@.onInput($event)" />
```

### `dr-window-event-*` directive

Listen to window-scoped events.

```html
<div dr-window-event-resize="@this@.onResize($event)"></div>
```

### EventManager behavior

- delegated listener strategy for common events
- direct attachment for non-delegatable events
- execution context variables: `$event`, `$target`, and render-bound objects

---

## Component Architecture

## `ComponentBase`

`ComponentBase` provides:

- attribute binding (`@attribute`)
- query binding (`@query`)
- event binding (`@event`)
- child component tracking
- lifecycle integration
- decorator refresh APIs (`refreshDecorators`, `refreshQueryDecorators`, `refreshEventDecorators`)

### `@attribute`

```typescript
import { ComponentBase, attribute } from '@dooboostore/dom-render';

class Card extends ComponentBase {
  @attribute('title')
  title = '';

  @attribute({ name: 'count', converter: (v) => Number(v ?? 0) })
  count = 0;
}
```

### `@query`

```typescript
import { ComponentBase, query } from '@dooboostore/dom-render';

class Panel extends ComponentBase {
  @query('.title')
  titleEl?: HTMLElement;

  @query({ selector: '.row', refreshRawSetRendered: true })
  rows: HTMLElement[] = [];
}
```

### `@event`

```typescript
import { ComponentBase, event } from '@dooboostore/dom-render';

class Toolbar extends ComponentBase {
  @event({ query: '.save-btn', name: 'click' })
  onSave() {
    console.log('saved');
  }
}
```

### `createComponent`

```typescript
import { DomRender } from '@dooboostore/dom-render';

class UserCard {
  name = 'Anonymous';
}

const userCard = DomRender.createComponent({
  type: UserCard,
  tagName: 'user-card',
  template: `<div>${@this@.name}$</div>`
});

// DomRender.run({...}) is a shorthand that returns the proxied rootObject directly.
const app = new DomRender({
  rootObject: { users: [] },
  target: document.querySelector('#app')!,
  config: { window, targetElements: [userCard] }
});
```

---

## Lifecycle Hooks

Implement interfaces to receive lifecycle callbacks:

- `onProxyDomRender(config)`
- `onCreateRender(...args)` / `onCreateRendered(...args)`
- `onCreateRenderData(data)`
- `onCreatedThisChild(child, childData)`
- `onInitRender(param, rawSet)`
- `onRawSetRendered(rawSet, otherData)`
- `onChildRawSetRendered()` (interface in `lifecycle/OnChildRawSetRendered`, not re-exported from `lifecycle/index`)
- `onChildRenderedByProperty(key, value)`
- `onDestroyRender(params)`
- `onChangeAttrRender(name, value, other)`
- `onBeforeReturnGet(name, value, fullPath)` / `onBeforeReturnSet(name, value, fullPath)`

```typescript
class ViewModel {
  onCreateRender() {
    console.log('render create');
  }

  async onInitRender() {
    console.log('render initialized');
  }
}
```

---

## Router Integration

`DomRender` can create router by `routerType`:

- `'hash'` -> `HashRouter`
- `'path'` -> `PathRouter`
- custom router object/factory

```typescript
const app = new DomRender(
  {
    rootObject: { page: 'home' },
    target: document.querySelector('#app')!,
    config: { window, routerType: 'hash' }
  },
  { firstUrl: 'home' }
);

app.router.go('/about');
```

---

## Messenger

`DefaultMessenger` and `Messenger` provide channel-based communication across render roots/components.

Use this when direct parent-child access is not suitable.

---

## Requested Decorator Mapping

This section is added for teams using both `dom-render` and `simple-web-component`.

### `@event` / `@addEventListener` (extended)

`@event` (alias of `@addEventListener`) is a decorator from `@dooboostore/simple-web-component`; it is unrelated to dom-render's own `@event({ query, name })`.

In `dom-render`, equivalent patterns are:

1. Template directive: `dr-event-*`
2. Class decorator in component: `@event({ query, name })`

```html
<button dr-event-click="@this@.handleClick($event)">Click</button>
```

```typescript
class MyComp extends ComponentBase {
  @event({ query: '.btn', name: 'click' })
  onClick(e: Event) {}
}
```

### `@replaceChildren` (extended)

`@replaceChildren` is from `simple-web-component`.

`dom-render` alternatives:

1. structural replacement via directives (`dr-if`, `dr-for-of`, `dr-appender`)
2. explicit DOM strategy in component methods (`replaceChildren`) when needed

```typescript
updateRows(container: HTMLElement, nodes: Node[]) {
  container.replaceChildren(...nodes);
}
```

For reactive templates, prefer declarative updates over manual replacement.

### `@insertBeforeEnd` (extended)

`simple-web-component` appends via `@insertBeforeEnd` (there is no `@appendChild` decorator).

`dom-render` alternatives:

1. `dr-appender` + `Appender` for incremental append/delete
2. direct `appendChild` in imperative setup code

```typescript
state.rows.set('k1', 'first row'); // reactive append through dr-appender
```

---

## Best Practices

1. Always mutate `result.rootObject` (proxied object), not the original plain object.
2. Prefer declarative directives over direct DOM mutation.
3. Use `dr-appender` for large frequently changing collections.
4. For dynamic component trees, call `refreshDecorators()` when bindings need explicit refresh.
5. Use `DomRenderNoProxy` for fields that should never trigger proxy traversal.
6. Keep heavy computations outside template expressions.

---

## Troubleshooting

### UI not updating after mutation

- Check that you are mutating `result.rootObject`, not stale reference.
- Verify expression paths are valid (`@this@.x.y`).

### Event not firing

- Confirm directive name (`dr-event-click`, `dr-event-input`, etc.).
- Check script context variables (`$event`, `$target`).

### Render loop/performance drop

- Avoid expensive script evaluation in template.
- Prefer keyed `Appender` updates instead of full array replacement.

---

## License

This package is licensed under the [MIT License](https://opensource.org/licenses/MIT).
