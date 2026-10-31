import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { DomParser, parseHTML } from '@dooboostore/dom-parser';

const tag = (v: unknown) => Object.prototype.toString.call(v);

describe('Symbol.toStringTag browser parity', () => {
    test('elements report their built-in interface', () => {
        const doc = new DomParser('<div id="a"><span>hi</span></div>').document as any;
        assert.equal(tag(doc.querySelector('div')), '[object HTMLDivElement]');
        assert.equal(tag(doc.querySelector('span')), '[object HTMLSpanElement]');
    });

    test('svg elements report SVG interfaces', () => {
        const window = parseHTML('<svg><circle/></svg>');
        assert.equal(tag(window.document.querySelector('svg')), '[object SVGSVGElement]');
        assert.equal(tag(window.document.querySelector('circle')), '[object SVGCircleElement]');
    });

    test('text/comment/document/fragment/attr report WebIDL interfaces', () => {
        const doc = new DomParser('<div id="a">hello<!--c--></div>').document as any;
        const div = doc.querySelector('div');
        assert.equal(tag(div.firstChild), '[object Text]');
        assert.equal(tag(doc.createTextNode('a')), '[object Text]');
        assert.equal(tag(doc.createComment('c')), '[object Comment]');
        assert.equal(tag(doc), '[object HTMLDocument]');
        assert.equal(tag(doc.createDocumentFragment()), '[object DocumentFragment]');
        assert.equal(tag(div.attributes.getNamedItem('id') ?? div.attributes.item(0)), '[object Attr]');
    });

    test('shadow root reports ShadowRoot', () => {
        const window = parseHTML('<div id="host"></div>');
        const host = window.document.querySelector('#host') as any;
        const shadow = host.attachShadow({ mode: 'open' });
        assert.equal(tag(shadow), '[object ShadowRoot]');
    });

    test('custom element reports its built-in base', () => {
        const window = parseHTML('<my-el></my-el>') as any;
        class MyEl extends window.HTMLElement {}
        window.customElements.define('my-el', MyEl);
        const el = window.document.createElement('my-el');
        assert.equal(tag(el), '[object HTMLElement]');
    });
});
