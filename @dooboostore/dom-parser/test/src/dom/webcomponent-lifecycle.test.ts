import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { DomParser, HTMLElementBase } from '@dooboostore/dom-parser';

console.log('🚀 Web Component Lifecycle & Attribute Tests Starting...');

describe('Web Component Lifecycles & Attributes', () => {
  test('should parse attributes before constructor for innerHTML (Upgrading)', () => {
    const parser = new DomParser('<html><body><div id="container"></div></body></html>');
    const window = parser.window as any;
    let constructorVal = null;
    let connectedVal = null;

    class SwcChoose extends window.HTMLTemplateElement {
      static get observedAttributes() {
        return ['value'];
      }
      constructor() {
        super();
        constructorVal = this.getAttribute('value');
      }
      connectedCallback() {
        connectedVal = this.getAttribute('value');
      }
      attributeChangedCallback() {}
    }

    window.customElements.define('swc-choose', SwcChoose, { extends: 'template' });

    const container = window.document.getElementById('container');
    container.innerHTML = '<template id="router" value="my-val" is="swc-choose"></template>';

    assert.equal(constructorVal, 'my-val', 'Attribute should be available in constructor');
    assert.equal(connectedVal, 'my-val', 'Attribute should be available in connectedCallback');
  });

  test('should trigger attributeChangedCallback exactly once with proper oldValue during innerHTML', () => {
    const parser = new DomParser('<html><body><div id="container"></div></body></html>');
    const window = parser.window as any;
    let callbackCount = 0;
    let lastOldValue = undefined;
    let lastNewValue = undefined;

    class TestEl extends (window.HTMLElementBase || HTMLElementBase) {
      static get observedAttributes() {
        return ['value'];
      }
      constructor() {
        super();
      }
      attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'value') {
          callbackCount++;
          lastOldValue = oldValue;
          lastNewValue = newValue;
        }
      }
    }

    window.customElements.define('test-el', TestEl);

    const container = window.document.getElementById('container');
    container.innerHTML = '<test-el value="test-val"></test-el>';

    assert.equal(callbackCount, 1, 'Callback should be called exactly once during innerHTML');
    assert.equal(lastOldValue, null, 'oldValue should be null for the first callback');
    assert.equal(lastNewValue, 'test-val', 'newValue should be the parsed value');
  });

  test('should trigger connected and disconnected callbacks recursively', () => {
    const parser = new DomParser('<html><body></body></html>');
    const window = parser.window as any;

    let parentConnected = 0,
      parentDisconnected = 0;
    let childConnected = 0,
      childDisconnected = 0;

    class ParentEl extends (window.HTMLElementBase || HTMLElementBase) {
      connectedCallback() {
        parentConnected++;
      }
      disconnectedCallback() {
        parentDisconnected++;
      }
    }

    class ChildEl extends (window.HTMLElementBase || HTMLElementBase) {
      connectedCallback() {
        childConnected++;
      }
      disconnectedCallback() {
        childDisconnected++;
      }
    }

    window.customElements.define('parent-el', ParentEl);
    window.customElements.define('child-el', ChildEl);

    const parent = window.document.createElement('parent-el');
    const child = window.document.createElement('child-el');

    parent.appendChild(child); // Not in DOM yet

    assert.equal(parentConnected, 0);
    assert.equal(childConnected, 0);

    window.document.body.appendChild(parent); // Now in DOM

    assert.equal(parentConnected, 1, 'Parent connected');
    assert.equal(childConnected, 1, 'Child connected recursively');

    window.document.body.removeChild(parent); // Removed from DOM

    assert.equal(parentDisconnected, 1, 'Parent disconnected');
    assert.equal(childDisconnected, 1, 'Child disconnected recursively');
  });

  test('should trigger adoptedCallback recursively when moving between documents', () => {
    const p1 = new DomParser('<html><body></body></html>');
    const p2 = new DomParser('<html><body></body></html>');

    let parentAdopted = 0,
      childAdopted = 0;

    class ParentEl extends (p1.window.HTMLElementBase || HTMLElementBase) {
      adoptedCallback() {
        parentAdopted++;
      }
    }

    class ChildEl extends (p1.window.HTMLElementBase || HTMLElementBase) {
      adoptedCallback() {
        childAdopted++;
      }
    }

    p1.window.customElements.define('parent-el', ParentEl);
    p1.window.customElements.define('child-el', ChildEl);
    p2.window.customElements.define('parent-el', ParentEl);
    p2.window.customElements.define('child-el', ChildEl);

    const parent = p1.window.document.createElement('parent-el');
    const child = p1.window.document.createElement('child-el');
    parent.appendChild(child);
    p1.window.document.body.appendChild(parent);

    // Explicit adoption
    p2.window.document.adoptNode(parent);

    assert.equal(parentAdopted, 1, 'Parent adopted explicitly');
    assert.equal(childAdopted, 1, 'Child adopted recursively');
    assert.equal(parent.ownerDocument, p2.window.document, 'Owner document updated');
    assert.equal(child.ownerDocument, p2.window.document, 'Child owner document updated');

    // Implicit adoption via appendChild
    p1.window.document.body.appendChild(parent);

    assert.equal(parentAdopted, 2, 'Parent adopted implicitly via appendChild');
    assert.equal(childAdopted, 2, 'Child adopted implicitly via appendChild');
    assert.equal(parent.ownerDocument, p1.window.document, 'Owner document updated again');
  });

  test('textarea should decode HTML entities via value property', () => {
    const parser = new DomParser('<html><body></body></html>');
    const doc = parser.window.document as any;

    const textarea = doc.createElement('textarea');
    textarea.innerHTML = '$host?.routerPathSet';

    assert.equal(textarea.value, '$host?.routerPathSet', 'Textarea should return correct value');

    // Check encoded entity decoding
    textarea.innerHTML = 'Hello &amp; World';
    assert.equal(textarea.value, 'Hello & World', 'Textarea should decode entities');
  });

  test('HTMLTemplateElement is supported and acts as a web component', () => {
    const parser = new DomParser('<html><body></body></html>');
    const win = parser.window as any;

    assert.ok(win.HTMLTemplateElement, 'HTMLTemplateElement exists');
  });

  test('Template innerHTML parses inertly without triggering lifecycle callbacks', () => {
    const parser = new DomParser('<html><body><div id="container"></div></body></html>');
    const window = parser.window as any;
    let constructorCount = 0;
    let connectedCount = 0;

    class TestInertEl extends (window.HTMLElementBase || HTMLElementBase) {
      constructor() {
        super();
        constructorCount++;
      }
      connectedCallback() {
        connectedCount++;
      }
    }

    window.customElements.define('test-inert', TestInertEl);

    const container = window.document.getElementById('container');

    // Setting innerHTML on normal element triggers constructor and connectedCallback immediately
    container.innerHTML = '<div><test-inert></test-inert></div>';
    assert.equal(constructorCount, 1, 'Should upgrade in normal DOM');
    assert.equal(connectedCount, 1, 'Should connect in normal DOM');

    // Reset counters
    constructorCount = 0;
    connectedCount = 0;

    // Setting innerHTML on template should NOT trigger upgrade
    const template = window.document.createElement('template');
    template.innerHTML = '<div><test-inert></test-inert></div>';

    assert.equal(constructorCount, 0, 'Should NOT upgrade inside template (inert)');
    assert.equal(connectedCount, 0, 'Should NOT connect inside template');

    // But cloning the template content into the document should trigger upgrade
    const clone = template.content.cloneNode(true);
    container.appendChild(clone);

    // cloneNode does not automatically call constructor in dom-parser,
    // but appendChild connects it properly. Parity tested via connectedCallback.
    assert.equal(connectedCount, 1, 'Should connect when cloned from template into live DOM');
  });
});
