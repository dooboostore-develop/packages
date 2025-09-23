# Chapter 3: Injecting Reactivity - The Birth of `DomRenderProxy`

So far, we have created two independent pieces: a 'reactivity system' that detects data changes and a 'template engine' that renders data to the screen. In this chapter, we will combine these two to complete `DomRenderProxy`, the core of `dom-render`. Through this process, we will uncover the secret of how data changes automatically lead to DOM updates.

## 3.1. Combining Chapters 1 and 2

The core idea is simple: **"When data is accessed (`get`), record which `RawSet` depends on that data, and when data changes (`set`), re-render all recorded `RawSet`s."**

To achieve this, we integrate the `Proxy` handler and `activeEffect` concept from Chapter 1 into the `RawSet` rendering process.

1.  **Modify `RawSet.render` method:** Just before rendering a `RawSet`, assign that `RawSet` itself to a global variable (e.g., `activeRawSet`).

2.  **Modify `Proxy`'s `get` trap:** The `get` trap now checks `activeRawSet` instead of `activeEffect`. If `activeRawSet` exists, it connects the currently accessed data property (e.g., `user.name`) and `activeRawSet` to the dependency map.

3.  **Modify `Proxy`'s `set` trap:** The `set` trap finds all `RawSet`s connected to the changed property (e.g., `user.name`) in the dependency map and calls their `render` methods again.

```javascript
// Conceptual flow of DomRenderProxy.ts

let activeRawSet = null; // Currently rendering RawSet

class DomRenderProxy {
    // ... Proxy handler ...
    get(target, property) {
        // 2. get trap: if activeRawSet exists, record dependency
        if (activeRawSet) {
            track(target, property, activeRawSet);
        }
        return target[property];
    }

    set(target, property, value) {
        target[property] = value;
        // 3. set trap: find all dependent RawSets and re-render
        const dependentRawSets = findDependentRawSets(target, property);
        dependentRawSets.forEach(rawSet => rawSet.render());
        return true;
    }
}

class RawSet {
    render(obj, config) {
        // 1. Just before rendering, set itself as activeRawSet
        activeRawSet = this;

        // ... Template expression evaluation and DOM creation logic ...
        // Accessing properties of obj during this process will trigger the Proxy's get trap
        const value = ScriptUtils.evaluateReturn(this.expression, obj);
        // ...

        // After rendering is complete, reset activeRawSet
        activeRawSet = null;
    }
}
```

## 3.2. Recursive Proxy Application

Changes in nested objects like `user.profile.name` must also be detected. This is solved by applying `Proxy` recursively.

At the time of `DomRenderProxy`'s `set` trap or object initialization, if a newly assigned value is an object and not yet a `Proxy`, a new `DomRenderProxy` is created and wrapped around that object as well.

What's important here is to **record the parent-child relationship in the dependency map**. In `dom-render`, this is stored in the `_domRender_ref` property. For example, if a new object is assigned to the `profile` property of the `user` object, the `Proxy` of the `profile` object references the `user` object as its parent.

This way, when `user.profile.name` changes, the `set` trap of the `profile` object is called first, and this change can also propagate to the parent `user` object. The `root` method of `DomRenderProxy` performs complex logic to trace back these reference relationships and ultimately find which `RawSet` should be re-rendered.

## 3.3. Completing `DomRender.run`

Now we can put all the pieces together to complete the final entry point, the `DomRender.run` class method.

Here's what happens when `DomRender.run(rootObject, targetElement, config)` is called:

1.  **Create `DomRenderProxy`:** The pure data object (`rootObject`) provided by the user is wrapped with `DomRenderProxy` to make it a reactive object.

2.  **Initial Rendering:**
    a.  Parse `targetElement`'s `innerHTML` to create initial `RawSet`s (`RawSet.checkPointCreates`).
    b.  Call the `render` method of all created `RawSet`s for the first time.

3.  **Dependency Collection:** During the initial rendering process, whenever each `RawSet` accesses (`get`) a property of the reactive object to evaluate a template expression, the dependency map is automatically populated.

4.  **Return:** The reactive object wrapped in `Proxy` is returned to the user.

Now, when the user changes a property of the returned object, the `set` trap is automatically called, and the necessary `RawSet`s are precisely re-rendered according to the dependency map. This completes a reactive system where data and DOM are perfectly synchronized.

### Implementation Example: Quick Start

The following is a simple example demonstrating how all the concepts explained so far actually work.

**`index.html`**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>examples</title>
</head>
<body id="app">
<h1>
    ${this.name}$
</h1>
<ul>
    <li dr-for-of="this.friends">
    ${#it#.name}$
    </li>
</ul>
<button dr-event-click="alert(1)">
rr
</button>
</body>
</html>
```

**`index.ts`**
```typescript
import {DomRender} from '@dooboostore/dom-render';

class Data {
    name = 'my name is dom-render';
    friends = [{name: 'a'}, {name: 'b'}, {name: 'c'}];
}

const data = DomRender.run({
    rootObject: () => new Data(),
    target: document.querySelector('#app')!,
    config: { window: window }
});

setInterval(() => {
    // Every second, when the name property is changed, the content of the <h1> tag is automatically updated.
    data.rootObject.name = Date.now().toString();
}, 1000);
```

In this example, `DomRender.run` makes an instance of the `Data` class a reactive object and designates the `#app` element as the rendering target. When the `setInterval` function changes `data.rootObject.name` every second, the `DomRenderProxy`'s `set` trap detects this change, finds the `RawSet` connected to the `<h1>` tag that depends on the `name` property, and re-renders it to update the screen.

In the next chapter, we will learn how to implement directives like `dr-if` and `dr-for` to introduce programmatic control flow into templates, beyond simple value substitution.
