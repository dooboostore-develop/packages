import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from '@dooboostore/dom-parser';

console.log('🚀 Attribute Serialization + innerHTML Coercion Tests Starting...');

// Ground truth: Chrome/Firefox/Safari + HTML fragment serialization algorithm.
// https://github.com/dooboostore-develop/packages/issues/16
// https://github.com/dooboostore-develop/packages/issues/17
describe('Attribute escaping on serialize (issue #16)', () => {
    test('& in attribute value is escaped', () => {
        const window = parseHTML('<html><body><div id="t"></div></body></html>');
        const el = window.document.getElementById('t');
        el.setAttribute('data-x', 'A &amp; B'); // literal 9-char value
        assert.equal(el.outerHTML, '<div id="t" data-x="A &amp;amp; B"></div>');
    });

    test('parse + serialize round-trip is stable', () => {
        const window = parseHTML('<html><body><div data-x="A &amp; B"></div></body></html>');
        const el = window.document.querySelector('div');
        assert.equal(el.getAttribute('data-x'), 'A & B');
        assert.equal(el.outerHTML, '<div data-x="A &amp; B"></div>');
        // Second round-trip must be identical (no level loss)
        const window2 = parseHTML(`<html><body>${el.outerHTML}</body></html>`);
        assert.equal(window2.document.querySelector('div').outerHTML, '<div data-x="A &amp; B"></div>');
    });

    test('< > are escaped in attrs like browsers do (quotes too)', () => {
        const window = parseHTML('<html><body><div id="t"></div></body></html>');
        const el = window.document.getElementById('t');
        el.setAttribute('title', 'say "hi" <now>');
        assert.equal(el.outerHTML, '<div id="t" title="say &quot;hi&quot; &lt;now&gt;"></div>');
    });

    test('NBSP in attribute value is escaped', () => {
        const window = parseHTML('<html><body><div id="t"></div></body></html>');
        const el = window.document.getElementById('t');
        el.setAttribute('data-x', 'a b');
        assert.ok(el.outerHTML.includes('data-x="a&nbsp;b"'), `got: ${el.outerHTML}`);
    });
});

describe('innerHTML setter coerces non-strings (issue #17)', () => {
    test('number is coerced to string', () => {
        const window = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
        (window.document.body as any).innerHTML = 1;
        assert.equal(window.document.body.innerHTML, '1');
        assert.equal(window.document.body.textContent, '1');
    });
});
