# Chapter 4: Implementing Control Flow - The Directive System

The template engine we've built so far can display data in the DOM, but it cannot perform dynamic structural changes such as showing or hiding elements based on conditions, or displaying array data as a list. In this chapter, we will implement special HTML attributes like `dr-if` and `dr-for-of`, known as **Directives**, to introduce programmatic control flow into templates.

## 4.1. Designing the Operator Pattern

Each directive, such as `dr-if` and `dr-for-of`, has its own unique logic. To manage this systematically, `dom-render` uses the **Operator Pattern**.

-   Each directive (e.g., `dr-if`, `dr-for-of`) corresponds one-to-one with an `Operator` class that has its own logic (e.g., `DrIf`, `DrForOf`).
-   When a `RawSet` is rendered, it checks for `dr-*` attributes on its element and instantiates the corresponding `Operator` class, delegating execution to it.
-   This pattern independently separates the logic of each directive, enhancing code maintainability and extensibility. If you want to add a new directive, you simply need to create a new `Operator` class.

`OperatorExecuter` is an abstract class from which all Operator classes inherit, defining a common `execute` method to standardize the rendering logic execution.

## 4.2. Implementing `dr-if`

`dr-if` is the most basic control flow directive. The `execute` method of the `DrIf` Operator performs the following logic:

1.  **Expression Evaluation:** Evaluates the value of the `dr-if` attribute (e.g., "this.user.isLoggedIn") as a JavaScript expression to obtain a `true` or `false` value.

2.  **DOM Manipulation:**
    -   **When the result is `true`:** Creates a copy (`cloneNode`) of the template element and inserts this copy into the `RawSet`'s position (between the start and end comments). Then, it recursively calls `RawSet.checkPointCreates` on this new DOM fragment to process other internal dynamic elements.
    -   **When the result is `false`:** Removes all DOM nodes at the `RawSet`'s position.

3.  **State Storage:** The `DrIf` Operator must remember the previously evaluated value. If the previous value is the same as the current value, there's no need to manipulate the DOM, so rendering is skipped to optimize performance.

```javascript
// Conceptual logic of DrIf.ts
class DrIf extends OperatorExecuterAttrRequire<string> {
    async executeAttrRequire(attr: string): Promise<ExecuteState> {
        // 1. Evaluate expression
        const condition = ScriptUtils.evaluateReturn(attr, this.source.obj);

        // 3. Compare with previous state; if no change, stop
        if (this.rawSet.data === condition) {
            return ExecuteState.STOP;
        }
        this.rawSet.data = condition; // Store current state

        // 2. DOM manipulation
        if (condition) {
            // Clone and insert element
            const newElement = this.elementSource.element.cloneNode(true);
            // ... remove dr-if attribute from newElement ...
            this.returnContainer.fag.append(newElement);
        } else {
            // No child nodes (consequently, nothing is rendered)
        }

        // ... connect final DocumentFragment to parent node, and recursively create RawSet ...
        return ExecuteState.EXECUTE;
    }
}
```

## 4.3. Implementing `dr-for-of` and `dr-appender`

`dr-for-of` is more complex than `dr-if` because it deals with array data. The `DrForOf` Operator works as follows:

1.  **Array Data Evaluation:** Evaluates the value of the `dr-for-of` attribute (e.g., "this.users") to obtain the array to iterate over.

2.  **Loop Execution:** For each item in the array, repeat the following:
    a.  Clone the original element with `cloneNode(true)`.
    b.  **Scope Creation:** Handle special variables like `#it#` or `#nearForOfIndex#` so they can be used within the cloned element. `dom-render` replaces these variables with temporary unique strings during template parsing and then substitutes them back with actual values (current array item, index, etc.) at rendering time.
    c.  Add the processed element to the `DocumentFragment`, which is the final result.

3.  **DOM Replacement:** Once the loop finishes, replace the entire existing DOM at the `RawSet`'s position with the generated `DocumentFragment`.

```javascript
// Conceptual logic of DrForOf.ts
class DrForOf extends OperatorExecuterAttrRequire<string> {
    async executeAttrRequire(attr: string): Promise<ExecuteState> {
        // 1. Evaluate array data
        const collection = ScriptUtils.evaluateReturn(attr, this.source.obj);

        if (collection) {
            let index = -1;
            for (const item of collection) {
                index++;
                // 2a. Clone element
                const newElement = this.elementSource.element.cloneNode(true);

                // 2b. Substitute scope variables
                // 'destIt' is the actual data path corresponding to '#it#' (e.g., 'this.users[0]')
                const destIt = `${attr}[${index}]`;
                newElement.innerHTML = newElement.innerHTML.replace(/#it#/g, destIt).replace(/#nearForOfIndex#/g, index);
                // ... substitute other attributes ...

                // 2c. Add to final result
                this.returnContainer.fag.append(newElement);
            }
        }
        // ... DOM replacement and recursive RawSet creation ...
        return ExecuteState.EXECUTE;
    }
}
```

### `dr-appender`: Append-Optimized List Rendering

`dr-for-of` uses a simple approach of redrawing the entire list whenever the array changes. While this is not an issue with small data sets, it can be very inefficient when adding a single new item to a large list.

`dr-appender` is a directive designed to solve this problem, specialized for "append" operations. The `DrAppender` Operator cleverly uses `dr-for-of` to add only new items without redrawing the entire list.

1.  **Dynamic `dr-for-of` Creation:** `DrAppender` does not directly iterate the template. Instead, it creates a new element with the `dr-for-of` attribute at runtime.
2.  **Targeting Only the Last Item:** The generated `dr-for-of` is set to point only to the **last item** of the array (`appender[appender.length - 1]`), not the entire array.
3.  **Reserving the Next Item:** Simultaneously, it adds an internal attribute `dr-option-next` to reserve the next item to be processed in the next rendering cycle (`appender,appender.length`).

Through this method, when a `push` occurs on an `Appender` object, the framework performs the rendering logic only for the last added item instead of redrawing the entire list. While this is not a complete implementation of Keyed-Diffing, it is a very effective optimization technique for common scenarios where data is appended to the end of a list.

> **Advanced Topic: Keyed-Diffing**
> In actual high-performance frameworks, when implementing `dr-for-of`, the entire DOM is not cleared and redrawn every time array items are added/deleted/reordered. Instead, a **Keyed-Diffing** algorithm is used, which assigns a unique `key` to each item and performs only the minimum DOM manipulations (move, add, delete) by comparing with the previous rendering result. `dom-render` does not currently fully implement this method, but it could be the next crucial step in framework performance optimization.

Now, our framework can go beyond simple data display and create dynamic UI structures through conditions and loops.

### Implementation Example: Appender

The following is an example of dynamically manipulating a list using `dr-appender`.

**Component setup part of `index.ts`**
```typescript
import { DomRender } from '@dooboostore/dom-render';
import { Appender } from '@dooboostore/dom-render/operators/Appender';
import { RandomUtils } from '@dooboostore/core/random/RandomUtils';
import { ComponentSet } from '@dooboostore/dom-render/components/ComponentSet';

// ... (other class definitions)

export class Sub {
  // Creates an Appender object.
  appender = new Appender();

  constructor(public name: string) {
    // Adds 1, 2 as initial data.
    this.appender.push(1, 2);
  }

  add(): void {
    // Generates a new UUID and adds (sets) it to the Appender.
    const uuid = RandomUtils.uuid();
    this.appender.set(uuid, `new item ${uuid.substring(0, 4)}`);
  }

  delete(): void {
    // Clears all items in the Appender.
    this.appender.clear();
  }

  change(): void {
    // Changes the value of an existing item.
    if (this.appender.list.length > 0) {
        const firstKey = this.appender.list[0][0];
        this.appender.set(firstKey, `changed item ${Date.now()}`);
    }
  }
}

export class Index {
  // Creates a Sub component and uses dr-appender in the template.
  child = new ComponentSet(new Sub('sub0'), {
    template: `
      <div>
        <h1>Appender Example</h1>
        <button dr-event-click="@this@.add()">Add</button>
        <button dr-event-click="@this@.delete()">Delete</button>
        <button dr-event-click="@this@.change()">Change First</button>

        <!--
          dr-appender is bound to the @this@.appender object.
          dr-option-this="#it#" sets the scope of each item to #it#.
        -->
        <div dr-appender="@this@.appender" dr-option-this="#it#">
          Key: ${#it#}$ - Value: ${#it#}$
        </div>
      </div>
    `
  });
}

// Execute DomRender
DomRender.run({
  rootObject: new Index(),
  target: document.querySelector('#app')!
});
```

In this example, the `Sub` class has an `Appender` instance and manipulates this list through the `add`, `delete`, and `change` methods. In the `Index` component's template, the `dr-appender` directive is bound to the `appender` object of the `Sub` component.

-   **When `Add` button is clicked:** When `appender.set()` is called, the `DrAppender` Operator does not redraw the entire list; instead, it creates DOM only for the newly added item and appends it to the end of the list.
-   **When `Delete` button is clicked:** When `appender.clear()` is called, `DrAppender` efficiently removes all related DOM nodes.
-   **When `Change First` button is clicked:** If `appender.set()` is used to assign a different value to an existing key, only the DOM part connected to that key is updated.

As such, `dr-appender` complements the limitations of `dr-for-of`, providing high performance especially in scenarios where list data changes dynamically and frequently.

In the next chapter, we will explore how to turn all of this into reusable, encapsulated units, i.e., 'components', to breathe life and soul into the framework.
