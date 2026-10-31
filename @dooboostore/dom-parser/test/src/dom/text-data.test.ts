import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { DomParser, parseHTML } from '@dooboostore/dom-parser';

console.log('🚀 Text.data Entity Decoding Tests Starting...');

// Ground truth: Chrome/Firefox/Safari + HTML "insert a character" algorithm.
// https://github.com/dooboostore-develop/packages/issues/18
describe('Text.data holds decoded text (issue #18)', () => {
    test('named entity: single Text node with decoded data', () => {
        const doc = new DomParser('<!doctype html><html><body><p>a &amp; b</p></body></html>').document;
        const p = doc.querySelector('p');
        assert.ok(p, 'p should exist');
        assert.equal(p.childNodes.length, 1, 'should be a single Text node, not split per entity');
        const text = p.childNodes[0] as Text;
        assert.equal(text.data, 'a & b', '.data must hold decoded text');
        assert.equal(p.textContent, 'a & b', 'textContent must match');
    });

    test('multiple/numeric entities decode into one node', () => {
        const window = parseHTML('<p>x &lt; y &gt; z &#169;</p>');
        const p = window.document.querySelector('p');
        assert.ok(p, 'p should exist');
        assert.equal(p.childNodes.length, 1);
        assert.equal((p.childNodes[0] as Text).data, 'x < y > z ©');
    });

    test('double-encoded entity decodes exactly once', () => {
        const window = parseHTML('<p>A &amp;amp; B</p>');
        const p = window.document.querySelector('p');
        assert.ok(p, 'p should exist');
        assert.equal((p.childNodes[0] as Text).data, 'A &amp; B');
        assert.equal(p.textContent, 'A &amp; B');
    });

    test('innerHTML round-trip preserves entities', () => {
        const window = parseHTML('<p>a &amp; b</p>');
        const p = window.document.querySelector('p');
        assert.ok(p, 'p should exist');
        assert.equal(p.innerHTML, 'a &amp; b', 'serialize must re-escape &');
    });

    test('createTextNode stores the literal string (no decode)', () => {
        const window = parseHTML('<html><body></body></html>');
        const t = window.document.createTextNode('a &amp; b');
        assert.equal(t.data, 'a &amp; b', 'programmatic strings are literal per spec');
        assert.equal(t.textContent, 'a &amp; b');
    });

    test('style/script raw text is not decoded', () => {
        const window = parseHTML('<html><head></head><body></body></html>');
        const style = window.document.createElement('style');
        style.textContent = 'a > b && c';
        assert.equal(style.textContent, 'a > b && c');
        assert.equal((style.childNodes[0] as Text).data, 'a > b && c');
    });

    test('length/substringData operate on decoded data', () => {
        const window = parseHTML('<p>a &amp; b</p>');
        const text = window.document.querySelector('p')!.childNodes[0] as Text;
        assert.equal(text.length, 5, '"a & b" is 5 chars');
        assert.equal(text.substringData(2, 1), '&');
    });
});
