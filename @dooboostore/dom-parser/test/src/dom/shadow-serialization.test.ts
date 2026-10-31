import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { DomParser, parseHTML } from '@dooboostore/dom-parser';

// Design intent: this library ships Web Components SSR, so outerHTML/innerHTML
// intentionally carry shadow content as declarative <template shadowrootmode>
// (unlike browsers, which only do that in getHTML). getHTML() follows the
// browser rules exactly; its expectations below were verified against
// Chromium via Playwright.
describe('shadow DOM serialization (SSR-first)', () => {
    function setup() {
        const doc = new DomParser('<div id="host"><p>light</p></div>').document as any;
        const host = doc.querySelector('#host');
        const sr = host.attachShadow({ mode: 'open', serializable: true });
        sr.innerHTML = '<b>shadow</b>';
        return { doc, host, sr };
    }

    test('outerHTML carries nested shadow content for SSR hydration', () => {
        const doc = new DomParser('<div id="wrap"><div id="host"><p>light</p></div></div>').document as any;
        const host = doc.querySelector('#host');
        host.attachShadow({ mode: 'open' }).innerHTML = '<b>shadow</b>';
        assert.equal(host.outerHTML, '<div id="host"><p>light</p></div>');
        assert.equal(
            doc.querySelector('#wrap').outerHTML,
            '<div id="wrap"><div id="host"><template shadowrootmode="open"><b>shadow</b></template><p>light</p></div></div>'
        );
    });

    test('innerHTML of an ancestor carries nested shadow content for SSR', () => {
        const { doc } = setup();
        assert.ok(doc.body.innerHTML.includes('shadowrootmode="open"'));
        assert.ok(doc.body.innerHTML.includes('<p>light</p>'));
    });

    test('getHTML is spec-exact: light DOM only unless the shadow is includable', () => {
        const { host } = setup();
        assert.equal(host.getHTML(), '<p>light</p>');
        assert.equal(
            host.getHTML({ serializableShadowRoots: true }),
            '<template shadowrootmode="open" shadowrootserializable=""><b>shadow</b></template><p>light</p>'
        );
        assert.equal(host.getHTML({ shadowRoots: [host.shadowRoot] }), '<template shadowrootmode="open" shadowrootserializable=""><b>shadow</b></template><p>light</p>');
    });

    test('setHTMLUnsafe attaches open declarative shadow DOM', () => {
        const doc = new DomParser('<div></div>').document as any;
        const el = doc.createElement('div');
        el.setHTMLUnsafe('<div><template shadowrootmode="open"><span>x</span></template></div>');
        const inner = el.querySelector('div');
        assert.ok(inner.shadowRoot);
        assert.equal(inner.shadowRoot.innerHTML, '<span>x</span>');
    });

    test('custom elements keep their tag name through parse and serialize', () => {
        const doc = new DomParser('<my-el data-x="1"><span>light</span></my-el>').document as any;
        class MyEl extends (doc.defaultView as any).HTMLElement {}
        (doc.defaultView as any).customElements.define('my-el', MyEl);
        const el = doc.querySelector('my-el');
        assert.equal(el.outerHTML, '<my-el data-x="1"><span>light</span></my-el>');
    });
});
