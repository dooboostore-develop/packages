# 🧪 SWC Comprehensive Test Suite

This directory contains a rich set of test cases designed to verify the core features, performance, and edge cases of **@dooboostore/simple-web-component**. Use these as both a verification tool and a practical reference for building your own applications.

---

## 🏁 How to Run Tests

1. Install dependencies at the workspace root.
2. Navigate to this package: `cd packages/@dooboostore/simple-web-component`.
3. Start the test hub: `pnpm run test:case`.
4. Open your browser at `http://localhost:3005`.

---

## 📂 Test Scenarios

### 1. 🚀 Full Suite (`/full-suite`)
**Goal**: Stress-test the entire engine with complex nesting and deep reactivity.
- **Nesting**: Parent-Child-Grandchild data propagation using `as="alias"`.
- **Bubbling**: How deep nodes find state in distant ancestors.
- **Surgical Updates**: Verifying that changing a single property only touches the specific Text Node tied to it.

### 2. 🌐 SPA & Advanced Routing (`/spa`)
**Goal**: Demonstrate the "Sexy" routing pattern using native Web standards.
- **Slot-based Routing**: Using `replaceChildren` to swap pages in the Light DOM while maintaining layout in the Shadow DOM.
- **DI Integration**: Injecting `WebRouter` and `SimpleApplication` directly into Web Components via `simple-boot`.
- **Hierarchical Events**: Using `$host`, `$hosts`, and `$firstHost` to navigate and control the routing flow from deep within the UI.

### 3. 🔁 Dynamic For-Of (`/for-of`)
**Goal**: Performance and integrity of list rendering.
- **Efficient Updates**: Using `addRow(item)` and `removeRow(index)` instead of re-rendering the entire list.
- **Index Integrity**: Verifying that `{{index}}` bindings update correctly when rows are removed from the middle of a list.
- **Variants**: Comparing `swc-for-of-children` (wrapper stays) vs `swc-for-of` (physical removal).

### 4. 🧪 Template-based Logic (`/if` & `/choose`)
**Goal**: Wrapper-less conditional rendering using the `Range` API.
- **Physical Removal**: Elements are truly removed and replaced with a `Comment` placeholder, ensuring CSS layout remains pristine.
- **Pure Text Support**: Testing IF blocks that only contain raw text nodes without any HTML tags.
- **Complex Branching**: Nested `<template is="swc-choose">` structures with multiple `swc-when` conditions.

### 5. ⏳ Lifecycles & 🔧 Attributes (`/lifecycle` & `/attr`)
**Goal**: Reliability of the underlying Web Component hooks.
- **6-Stage Lifecycle**: Precise firing of `before/after` hooks for connection, disconnection, and adoption.
- **Bi-directional Sync**: `@attribute` changes reflecting in DOM and vice-versa.
- **Type Safety**: Proper conversion of `String`, `Number`, `Boolean`, and `Object` types during attribute updates.

---

## 💡 Key Patterns to Observe

### The `$host` Variable
In almost every test, notice how `swc-on-click="$host.doSomething()"` is used. This is the recommended way to communicate from a template element back to its logic-owner without complex event bubbling.

### Explicit Value Binding
Always look for the `value="{{state}}"` or `swc-value="{{state}}"` pattern. It is the heart of the reactivity system that enables surgical updates.

### Shadow vs Light DOM
Tests like the SPA suite show how to mix Shadow DOM for styling/layout with Light DOM for content/slots to get the best of both worlds.
