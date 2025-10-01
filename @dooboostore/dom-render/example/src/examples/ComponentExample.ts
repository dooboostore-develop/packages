import { DomRender } from '@dooboostore/dom-render/DomRender';
import { ComponentSet } from '@dooboostore/dom-render/components/ComponentSet';

// Counter component class
class Counter {
  count = 0;
  
  increment() {
    this.count++;
  }
  
  decrement() {
    this.count--;
  }
  
  reset() {
    this.count = 0;
  }
}

export class ComponentExample {
  run() {
    const output = document.getElementById('output');
    if (!output) return;

    const demoDiv = document.createElement('div');
    demoDiv.className = 'demo-box';
    demoDiv.innerHTML = `
      <h3>ComponentSet - Reusable Components</h3>
      <p>Using DomRender's ComponentSet to create reusable counter components:</p>
      <div id="counter-container" dr-for-of="@this@.counters">
        <div dr-this="#it#" style="background: #f0f0f0; margin: 10px 0; padding: 15px; border-radius: 8px;">
          <!-- ComponentSet content will be rendered here -->
        </div>
      </div>
      <button id="add-counter-btn" style="margin-top: 10px;">Add Counter</button>
    `;
    output.appendChild(demoDiv);

    // State with ComponentSet instances
    let state = {
      counters: [
        new ComponentSet(new Counter(), {
          template: `
            <div>
              <h4>Counter #1</h4>
              <p>Count: <strong>\${@this@.count}$</strong></p>
              <button dr-event-click="@this@.increment()">Increment</button>
              <button dr-event-click="@this@.decrement()">Decrement</button>
              <button dr-event-click="@this@.reset()">Reset</button>
            </div>
          `
        }),
        new ComponentSet(new Counter(), {
          template: `
            <div>
              <h4>Counter #2</h4>
              <p>Count: <strong>\${@this@.count}$</strong></p>
              <button dr-event-click="@this@.increment()">Increment</button>
              <button dr-event-click="@this@.decrement()">Decrement</button>
              <button dr-event-click="@this@.reset()">Reset</button>
            </div>
          `
        }),
        new ComponentSet(new Counter(), {
          template: `
            <div>
              <h4>Counter #3</h4>
              <p>Count: <strong>\${@this@.count}$</strong></p>
              <button dr-event-click="@this@.increment()">Increment</button>
              <button dr-event-click="@this@.decrement()">Decrement</button>
              <button dr-event-click="@this@.reset()">Reset</button>
            </div>
          `
        })
      ]
    };

    // Initialize DomRender
    const result = new DomRender({
      rootObject: state,
      target: demoDiv,
      config: { window }
    });
    state = result.rootObject;

    // Add counter button
    let counterNum = 3;
    const addBtn = demoDiv.querySelector('#add-counter-btn');
    addBtn?.addEventListener('click', () => {
      counterNum++;
      state.counters.push(
        new ComponentSet(new Counter(), {
          template: `
            <div>
              <h4>Counter #${counterNum}</h4>
              <p>Count: <strong>\${@this@.count}$</strong></p>
              <button dr-event-click="@this@.increment()">Increment</button>
              <button dr-event-click="@this@.decrement()">Decrement</button>
              <button dr-event-click="@this@.reset()">Reset</button>
            </div>
          `
        })
      );
    });


  }
}
