import { DomRender } from '@dooboostore/dom-render/DomRender';

export class BasicBindingExample {
  run() {
    const output = document.getElementById('output');
    if (!output) return;

    const demoDiv = document.createElement('div');
    demoDiv.className = 'demo-box';
    demoDiv.innerHTML = `
      <h3>Title: <span id="title-display">\${@this@.title}$</span></h3>
      <p>Description: <span id="desc-display">\${@this@.description}$</span></p>
      <p>Count: <span id="count-display">\${@this@.count}$</span></p>
      <button id="increment-btn">Increment Count</button>
      <button id="update-btn">Update Text</button>
    `;
    output.appendChild(demoDiv);

    // Initial state
    let state = {
      title: 'Hello DomRender!',
      description: 'This is a reactive binding example',
      count: 0
    };

    // Initialize DomRender
    const result = new DomRender({
      rootObject: state,
      target: demoDiv,
      config: { window }
    });
    state = result.rootObject;

    // Button events
    const incrementBtn = demoDiv.querySelector('#increment-btn');
    incrementBtn?.addEventListener('click', () => {
      state.count++;
    });

    const updateBtn = demoDiv.querySelector('#update-btn');
    updateBtn?.addEventListener('click', () => {
      state.title = 'Updated Title!';
      state.description = 'Text has been updated reactively';
    });
  }
}
