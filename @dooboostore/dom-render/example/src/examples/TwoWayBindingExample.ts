import { DomRender } from '@dooboostore/dom-render/DomRender';

export class TwoWayBindingExample {
  run() {
    const output = document.getElementById('output');
    if (!output) return;

    const demoDiv = document.createElement('div');
    demoDiv.className = 'demo-box';
    demoDiv.innerHTML = `
      <h3>Two-Way Data Binding</h3>
      <div style="margin: 20px 0;">
        <label>Name: </label>
        <input type="text" id="name-input" dr-value-link="@this@.name" placeholder="Enter your name">
      </div>
      <div style="margin: 20px 0;">
        <label>Email: </label>
        <input type="email" id="email-input" dr-value-link="@this@.email" placeholder="Enter your email">
      </div>
      <div class="result" style="margin-top: 20px;">
        <strong>Current Values:</strong><br>
        Name: <span id="name-display">\${@this@.name}$</span><br>
        Email: <span id="email-display">\${@this@.email}$</span>
      </div>
      <button id="reset-btn" style="margin-top: 10px;">Reset</button>
    `;
    output.appendChild(demoDiv);

    // Initial state
    let state = {
      name: 'John Doe',
      email: 'john@example.com'
    };

    // Initialize DomRender
    const result = new DomRender({
      rootObject: state,
      target: demoDiv,
      config: { window }
    });
    state = result.rootObject;

    // Reset button
    const resetBtn = demoDiv.querySelector('#reset-btn');
    resetBtn?.addEventListener('click', () => {
      state.name = 'John Doe';
      state.email = 'john@example.com';
    });


  }
}
