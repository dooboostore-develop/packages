# 🧪 SWC Pure Architecture Test Suite

This directory contains manual browser test cases for **@dooboostore/simple-web-component** (SWC). They exercise the "Pure Architecture" philosophy: performance and standards compliance by avoiding heavy magic (Proxy, implicit DOM scanning) in favor of explicit decorators and native Web Component features.

> ⚠️ Several cases still import pre-rename decorators (e.g. `onConnectedInnerHtml`, `attributeHost`, `setClassHost`, `updateAttribute`, `replaceChildrenNode`, `onAddEventListener`) and `@Router`, which are no longer exported by `src/`. Those cases need updating before they build.

---

## 🏁 How to Run

1.  **Install**: make sure dependencies are installed (`pnpm install` at the root).
2.  **Start Dev Server** (opens the browser automatically):
    ```bash
    cd packages/@dooboostore/simple-web-component/test/case
    pnpm run dev
    ```
3.  **Open**: `http://localhost:3005` shows the test hub (`src/index.html`). Every folder is its own page: `http://localhost:3005/<folder>/index.html`.

`pnpm run build` produces a production bundle.

---

## 📂 Test Scenario Breakdown

### 1. ⏳ Lifecycles (`lifecycle/`)
Verifies the lifecycle decorators.
- **Hooks**: `@onConnectedBefore`, `@onConnectedBody`, `@onDisconnectedBefore`, `@onDisconnected`, `@onAdoptedBefore`, `@onAdoptedAfter`, plus the add-event-listener hook.
- **Add/Remove**: buttons add and remove elements to trigger connect/disconnect.
- **Adoption**: moves an element from the main document into an `iframe`.

### 2. 🔧 Attributes (`attribute/`, `load-test/`)
- **Host attribute fields**: typed string/number/boolean fields reflected to host attributes, including a custom name (`data-host-value`).
- **`@changedAttribute`**: handlers fire on internal and external attribute changes.
- **`@attribute(':host', 'parent-count')`** + `@changedAttribute('parent-count')` in `load-test/`.

### 3. 🎨 Apply Decorators (`apply-class/`, `apply-style/`, `apply-attribute/`, `apply-advanced/`)
- **Class**: `@applyClass`, `@setClass`, `@toggleClass`, `@updateClass` (+ host variants).
- **Style**: `@applyStyle`, `@setStyle`, `@updateStyle` (+ host variants).
- **Attribute**: `@applyAttribute`, `@removeAttribute`, `@attribute` (+ host variants).
- **Advanced**: combinations of class/style/attribute updates with `@innerHtml`.

### 4. ⚡ Event System (`event/`, `event-attribute/`)
- **Direct Binding**: `@addEventListener(selector, type)`.
- **Delegation**: `{ delegate: true }` handles elements added after connect, in shadow and light roots (`root: 'light'`).
- **Special Selectors**: `:host` and `:parentHost` as event targets.
- **`swc-on-*`**: declarative event scripts (`swc-on-click`, `swc-on-connected`, ...) with automatic context injection.
- **`@emitCustomEvent`**: custom event dispatching, handled declaratively via `swc-on-my-custom-event`.

### 5. 📡 Messaging (`message/`, `messaging-advanced/`)
- **Scoped messaging**: `@emitCustomEvent` with selectors controls message scope between two app scopes, with a window-level observer.
- **Multi-target dispatch**: `:hosts` / `:appHosts` across nested apps (grandparent → parent → leaf).

### 6. 🔍 Queries (`query/`)
- **DOM Query**: `@query` and `@queryAll` property injection for internal elements.

### 7. 🔄 Structural Directives (`swc-loop/`, `swc-if/`, `swc-choose/`)
- **`swc-loop`**: list rendering with `{{ $item }}` / `{{ $index }}`, push and delete (`$parentHost.deleteItem($index)`), `{{ expression }}` syntax.
- **`swc-if`**: conditional rendering, including nested independent `swc-if` templates.
- **`swc-choose`**: multi-case logic with `swc-when` / `swc-otherwise`, and `on-get-value` for dynamic conditions.

### 8. ⏳ Async Handling (`swc-async/`)
Declarative Promise state: `<template is="swc-async">` switching between `swc-default`, `swc-loading`, `swc-error` and `swc-success` templates.

### 9. 🔬 Surgical Updates (`surgical/`)
Fine-grained DOM updates: HTML fragments and `replaceChildren`, text nodes and elements via `@applyNode`, plus class/style updates, alongside `swc-if` / `swc-loop`.

### 10. 🌐 SPA & DI (`spa/`, `app-pre-render/`)
- **App host**: `is="swc-app-div"` / `is="swc-app-body"` with routing and page components.
- **Lifecycle @Inject**: services, `HostSet` and the router injected into `@onConnected*` / `@onInitialize` methods.
- **Nested layouts**: Shadow DOM and `<slot>`-based page swapping.

### 11. 🚀 Performance (`load-test/`)
Adds 100 or 1,000 components in one go and measures rendering time.

---

## 💡 Key Philosophies to Observe

### `$host` and `$parentHost`
`$host` refers to the **current logical owner** of the script. Inside an `swc-loop`, `$host` is the loop template itself, while `$parentHost` is the surrounding component (hence `$parentHost.deleteItem($index)`).

### Explicit Delegation
In `event/`, dynamically added buttons do **not** respond unless `{ delegate: true }` is used. This is by design: SWC never scans your DOM unless you explicitly ask it to.

### Surgical Updates
Unlike VDOM frameworks, SWC encourages direct, targeted DOM updates (e.g. inside `@changedAttribute` or via `@applyNode`). This is why SWC stays fast as the app grows.
