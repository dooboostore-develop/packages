# 🧪 SWC Pure Architecture Test Suite

This directory contains dedicated test cases for **@dooboostore/simple-web-component** (SWC). These tests verify the "Pure Architecture" philosophy: maximizing performance and standard compliance by removing heavy magic (Proxy, MutationObservers) in favor of explicit decorators and native Web Component features.

---

## 🏁 How to Run

1.  **Install**: Ensure dependencies are installed (`pnpm install` at root).
2.  **Start Dev Server**:
    ```bash
    cd packages/@dooboostore/simple-web-component/test/case
    pnpm run dev
    ```
3.  **Open**: Navigate to `http://localhost:3005` in your browser.

---

## 📂 Test Scenario Breakdown

### 1. ⏳ Lifecycles (`/lifecycle`)
Verifies the execution order and reliability of all 8 lifecycle decorators.
- **Hooks**: `@onBeforeConnected`, `@onAfterConnected`, `@onBeforeDisconnected`, `@onAfterDisconnected`, `@onBeforeAdopted`, `@onAfterAdopted`.
- **Order**: Ensures **Parent -> Child** execution sequence.
- **Adoption**: Tests moving elements between the main document and an `iframe`.

### 2. 🔧 Attributes (`/attr`)
Verifies the **Method-Based Reflection** approach.
- **`@setAttribute`**: Checks if method return values are correctly reflected to DOM attributes.
- **`@changedAttribute`**: Verifies that handlers trigger on both internal and external attribute changes.
- **Instantiation**: Tests behavior when created via `document.createElement`, `new Class()`, or `innerHTML`.

### 3. ⚡ Event System (`/event` & `/event-attribute`)
Verifies the robust, non-intrusive event binding system.
- **Direct Binding**: Testing `@addEventListener(selector, type)`.
- **Delegation**: Verifies `{ delegate: true }` handles elements added dynamically after connection.
- **Special Selectors**: Validates `:host`, `:window`, and `:document` as event targets.
- **`swc-on-*`**: Tests declarative event scripts on host elements and their automatic context injection.
- **`@emitCustomEvent`**: Verifies custom event dispatching and declarative handling via `swc-on-{{type}}`.

### 4. 🔍 Queries & Injection (`/query`)
Tests the automatic injection of elements and host contexts into class properties.
- **DOM Query**: `@query` and `@queryAll` for internal element access.
- **Hierarchy Navigation**: Using special selectors like `:parentHost`, `:appHost`, and `:hosts` to inject ancestor instances directly.
- **Safety**: Verifies that `@query` is restricted to class properties only.

### 5. 🔄 Structural Directives (`/swc-loop`, `/swc-if`, `/swc-choose`)
Verifies the high-performance template-based logic components.
- **`swc-loop`**: Tests surgical list updates, `append()`, and index-preserving `remove()`.
- **`swc-if`**: Tests conditional rendering and the `swc-default` fallback state.
- **`swc-choose`**: Tests multi-case logic using `swc-when`, `swc-otherwise`, and `swc-default`.
- **Context**: Verifies `$item`, `$index`, `$value`, `$nodes`, and `$firstElement` availability in callbacks.

### 6. ⏳ Async Handling (`/swc-async`)
Tests declarative Promise state management.
- **States**: Seamless switching between `swc-loading`, `swc-error`, and `swc-success` templates.
- **Race Conditions**: Ensures only the latest requested Promise is rendered.

### 7. 🌐 SPA & DI (`/spa`)
Verifies full application orchestration.
- **Scoped DI**: Independent dependency containers for different `<swc-app>` instances.
- **Lifecycle @Inject**: Injecting services and routers directly into `@onConnected` methods.
- **Nested Routing**: Managing complex layouts using Shadow DOM and `<slot>` based page swapping.

### 8. 🚀 Performance (`/load-test`)
Benchmarks the library under heavy stress.
- **Scenario**: Dynamically adding 1,000+ reactive items.
- **Verification**: Proves that the lack of `MutationObserver` and "Deep Scanning" results in near-native rendering speeds.

---

## 💡 Key Philosophies to Observe

### The `$host` and `$parentHost`
In the "Pure" model, `$host` always refers to the **current logical owner** of the script. For nodes inside an `swc-loop`, `$host` is the loop template itself, while `$parentHost` is the surrounding component.

### Explicit Delegation
Notice in the `/event` test how dynamic buttons do **not** work by default unless `{ delegate: true }` is used. This is by design—SWC never scans your DOM unless you explicitly ask it to.

### Surgical Updates
Unlike VDOM frameworks, SWC encourages direct DOM manipulation inside `@changedAttribute` or `on-clone-node`. This "Surgical" approach is why SWC remains fast even as your application grows.
