# Chapter 1: The Beginning of Everything - What is Reactivity?

The heart of a framework is 'Reactivity'. Reactivity means that **when data (state) changes, the user interface (UI) that uses this data is automatically updated**. In this chapter, we will compare how modern frameworks implement reactivity and delve deep into JavaScript `Proxy`, which is the foundation of `dom-render`.

## 1.1. Comparison of Reactivity Models in Modern Frameworks

-   **Virtual DOM (React):** When data changes, a virtual DOM tree is created in memory. Then, it compares with the previous virtual DOM tree to find the changed parts (diffing) and applies them to the actual DOM at once. This method minimizes DOM manipulation but incurs memory usage and comparison operation costs.

-   **Compiler-based (Svelte):** At build time, it analyzes the code and generates highly optimized code that directly modifies which parts of the DOM when certain data changes. There is no virtual DOM or complex comparison process at runtime, making it very fast, but the framework can appear "magical."

-   **Proxy-based (Vue 3, `dom-render`):** This is the approach adopted by `dom-render`. It wraps data objects with `Proxy` to intercept operations like accessing (`get`) or changing (`set`) properties. This allows for precise tracking of which data is used where (dependencies) and accurate updates of only the necessary parts when changes occur. It's a balanced approach that avoids the memory overhead of a virtual DOM and doesn't solely rely on a build process like Svelte.

## 1.2. In-depth Exploration of JavaScript `Proxy`

`Proxy` is a special object that allows you to intercept and redefine fundamental operations on an object (such as property access, assignment, enumeration, etc.). We primarily use two 'traps': `get` and `set`.

```javascript
// Pure data object
const user = {
  name: 'Alice',
  age: 30
};

// Proxy handler: an object that defines traps
const handler = {
  get(target, property) {
    console.log(`Accessed property '${property}'.`);
    return target[property];
  },
  set(target, property, value) {
    console.log(`Changing property '${property}' to '${value}'.`);
    target[property] = value;
    return true; // The set trap must return true on success.
  }
};

// Create Proxy object
const reactiveUser = new Proxy(user, handler);

// Usage example
console.log(reactiveUser.name); // Outputs "Accessed property 'name'." then "Alice"
reactiveUser.age = 31;          // Outputs "Changing property 'age' to '31'."
```

This simple example is the core of `dom-render`'s reactivity. When `get` is called, we record "who is using this data," and when `set` is called, we add logic to "notify everyone who was using this data about the change."

## 1.3. The Concept of Dependency Tracking

Dependency tracking consists of two steps:

1.  **Dependency Collection:** While the code is running (when the `get` trap is called), the currently executing task (e.g., a function that updates a specific DOM element) is linked to a particular data property. This is like recording, "If `user.name` changes, this DOM element needs to be updated."

2.  **Change Notification:** When data changes (when the `set` trap is called), all tasks linked to that property (DOM update functions) are re-executed.

This concept can be expressed in code as follows:

```javascript
// Map to store dependencies: { target -> { property -> [effect1, effect2, ...] } }
const dependencyMap = new WeakMap();

// Variable to store the currently active effect
let activeEffect = null;

// Function to track dependencies
function track(target, property) {
  if (activeEffect) {
    let depsMap = dependencyMap.get(target);
    if (!depsMap) {
      dependencyMap.set(target, (depsMap = new Map()));
    }
    let deps = depsMap.get(property);
    if (!deps) {
      depsMap.set(property, (deps = new Set()));
    }
    deps.add(activeEffect);
  }
}

// Function to send change notifications
function trigger(target, property) {
  const depsMap = dependencyMap.get(target);
  if (!depsMap) return;
  const deps = depsMap.get(property);
  if (deps) {
    deps.forEach(effect => effect());
  }
}

// Apply to Proxy handler
const handler = {
  get(target, property) {
    track(target, property);
    return target[property];
  },
  set(target, property, value) {
    target[property] = value;
    trigger(target, property);
    return true;
  }
};

// effect function: a function that performs actual tasks like UI updates
function effect(fn) {
  activeEffect = fn;
  fn();
  activeEffect = null;
}

// --- Usage Example ---
const user = new Proxy({ name: 'Bob' }, handler);

effect(() => {
  // This function depends on user.name.
  console.log('User name is:', user.name);
});

// When user.name is changed, the above effect function will automatically re-execute.
user.name = 'Charlie'; // "User name is: Charlie" is output again
```

Now we understand the principles of the reactivity system, the most fundamental part of a framework. In the next chapter, we will build a template engine that connects this reactivity system to the actual DOM.
