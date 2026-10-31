import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from '@dooboostore/dom-parser';

console.log('🚀 SVG Namespace + tagName Tests Starting...');

const SVG_NS = 'http://www.w3.org/2000/svg';

// Ground truth: Chrome/Firefox/Safari + WHATWG DOM/HTML specs.
// https://github.com/dooboostore-develop/packages/issues/15
// tagName is upper-cased for HTML-namespace elements only.
describe('SVG tagName keeps spec case (issue #15)', () => {
    test('issue repro: parsed + created SVG elements', () => {
        const window = parseHTML('<!doctype html><html><body><svg><path d="M0 0"/></svg><div></div></body></html>');
        const document = window.document;

        assert.equal(document.createElementNS(SVG_NS, 'path').tagName, 'path');
        assert.equal(document.querySelector('path').tagName, 'path');
        assert.equal(document.querySelector('svg').tagName, 'svg');
        assert.equal(document.querySelector('div').tagName, 'DIV');
    });

    test('SVG elements report the SVG namespace', () => {
        const window = parseHTML('<!doctype html><html><body><svg><path d="M0 0"/></svg></body></html>');
        const document = window.document;

        assert.equal(document.querySelector('svg').namespaceURI, SVG_NS);
        assert.equal(document.querySelector('path').namespaceURI, SVG_NS);
        assert.equal(document.querySelector('path').ownerDocument, document);
    });

    test('camelCase SVG names survive parse + serialize', () => {
        const window = parseHTML('<!doctype html><html><body><svg><foreignObject><div>hi</div></foreignObject></svg></body></html>');
        const document = window.document;
        const fo = document.querySelector('foreignObject');
        assert.ok(fo, 'foreignObject should be found');
        assert.equal(fo.tagName, 'foreignObject');
        assert.ok(fo.outerHTML.includes('<foreignObject>'), `got: ${fo.outerHTML}`);
        assert.ok(fo.outerHTML.includes('<div>hi</div>'), 'foreignObject children are HTML');
        // full round-trip
        assert.ok(document.body.innerHTML.includes('<foreignObject><div>hi</div></foreignObject>'));
    });

    test('div inside foreignObject is HTML, svg outside stays SVG', () => {
        const window = parseHTML('<svg><foreignObject><div></div></foreignObject><circle /></svg>');
        const document = window.document;
        assert.equal(document.querySelector('div').tagName, 'DIV');
        assert.equal(document.querySelector('div').namespaceURI, 'http://www.w3.org/1999/xhtml');
        assert.equal(document.querySelector('circle').tagName, 'circle');
    });

    test('HTML elements still upper-case, createElement stays HTML', () => {
        const window = parseHTML('<!doctype html><html><body><div></div></body></html>');
        const document = window.document;
        assert.equal(document.createElement('path').tagName, 'PATH');
        assert.equal(document.createElement('div').tagName, 'DIV');
        assert.equal(document.querySelector('div').localName, 'div');
    });

    test('innerHTML path also keeps SVG case', () => {
        const window = parseHTML('<!doctype html><html><body></body></html>');
        window.document.body.innerHTML = '<svg><path d="M0 0"/><text>hi</text></svg>';
        const svg = window.document.querySelector('svg');
        assert.ok(svg, 'svg should exist');
        assert.equal(svg.tagName, 'svg');
        assert.equal(svg.querySelector('path').tagName, 'path');
        assert.equal(svg.querySelector('text').textContent, 'hi');
    });

    test('cloneNode preserves SVG namespace', () => {
        const window = parseHTML('<svg><path d="M0 0"/></svg>');
        const path = window.document.querySelector('path');
        const clone = path.cloneNode(false);
        assert.equal(clone.tagName, 'path');
        assert.equal(clone.namespaceURI, SVG_NS);
    });

    test('MathML namespace via createElementNS and parsing', () => {
        const MATHML_NS = 'http://www.w3.org/1998/Math/MathML';
        const window = parseHTML('<!doctype html><html><body><math><mi>x</mi></math></body></html>');
        const document = window.document;
        assert.equal(document.querySelector('mi').tagName, 'mi');
        assert.equal(document.querySelector('mi').namespaceURI, MATHML_NS);
        assert.equal(document.createElementNS(MATHML_NS, 'mi').tagName, 'mi');
    });

    test('selectors match SVG regardless of selector case', () => {
        const window = parseHTML('<svg><path d="M0 0"/></svg>');
        const document = window.document;
        assert.ok(document.querySelector('PATH'), 'upper-case selector finds path');
        assert.equal(document.getElementsByTagName('path').length, 1);
    });

    test('comments keep raw text (no entity decoding)', () => {
        const window = parseHTML('<div><!-- a &amp; b --></div>');
        const document = window.document;
        const div = document.querySelector('div');
        const comment = [...div.childNodes].find(n => n.nodeType === 8);
        assert.ok(comment, 'comment should exist');
        assert.equal(comment.data, ' a &amp; b ');
    });
});
