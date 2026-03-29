import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { DomParser } from '@dooboostore/dom-parser';

console.log('🚀 Web Component Support Tests Starting...');

describe('Web Component Support', () => {
  test('should have customElements registry in window', () => {
    const parser = new DomParser('<html></html>');
    const window = parser.window as any;

    assert.ok(window.customElements, 'window.customElements should be defined');
    console.log('✅ window.customElements exists');
  });

  test('should be able to define and create a custom element', () => {
    const parser = new DomParser('<html><body><div id="app"></div></body></html>');
    const window = parser.window as any;
    const document = parser.document as any;

    // 1. Define custom element
    class MyElement extends window.HTMLElement {
      constructor() {
        super();
      }
      connectedCallback() {
        console.log('MyElement connectedCallback called!');
        this.innerHTML = '<span>My Web Component</span>';
      }
    }

    window.customElements.define('my-element', MyElement);

    // 2. Create and append
    const myEl = document.createElement('my-element');
    const app = document.getElementById('app');
    if (app) {
      app.appendChild(myEl);
    }

    // 3. Verify
    assert.equal(myEl.tagName, 'MY-ELEMENT', 'Tag name should match');
    assert.equal(myEl.innerHTML, '<span>My Web Component</span>', 'connectedCallback should have run');

    console.log('✅ Basic Custom Element works');
  });

  test('should support customized built-in elements (is="")', () => {
    const parser = new DomParser('<html><body></body></html>');
    const window = parser.window as any;
    const document = parser.document as any;

    class MyButton extends window.HTMLButtonElement {
      constructor() {
        super();
      }
      connectedCallback() {
        console.log('MyButton connectedCallback called!');
        this.textContent = 'Customized Button';
      }
    }

    window.customElements.define('my-button', MyButton, { extends: 'button' });

    const btn = document.createElement('button', { is: 'my-button' });
    document.body.appendChild(btn);

    assert.equal(btn.tagName, 'BUTTON', 'Tag name should be BUTTON');
    assert.equal(btn.getAttribute('is'), 'my-button', 'is attribute should be set');
    assert.equal(btn.textContent, 'Customized Button', 'connectedCallback should have run for built-in extension');

    console.log('✅ Customized Built-in Element (is="") works');
  });
});
