import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { DomParser } from '@dooboostore/dom-parser';

// Ground truth: WHATWG tokenizer "tag open state" + Chromium/Firefox/Safari.
// '<' followed by a non-letter (e.g. a digit) is literal text, reconsumed.
// Same bug class as happy-dom#2156.
describe('bogus "<" emits literal text (tag open state)', () => {
    test('innerHTML: "<3" stays text, single merged Text node', () => {
        const doc = new DomParser('<div></div>').document as any;
        const container = doc.createElement('div');
        container.innerHTML = '<p>text <3 more</p>';
        const p = container.childNodes[0];
        assert.equal(p.tagName, 'P');
        assert.equal(p.childNodes.length, 1);
        assert.equal(p.childNodes[0].data, 'text <3 more');
        assert.equal(container.querySelector('3'), null);
    });

    test('full document parse: same result', () => {
        const doc = new DomParser('<p>text <3 more</p>').document as any;
        const p = doc.querySelector('p');
        assert.equal(p.childNodes.length, 1);
        assert.equal(p.childNodes[0].data, 'text <3 more');
    });

    test('other non-letters ("<", "<>") also stay text', () => {
        const doc = new DomParser('<div></div>').document as any;
        const container = doc.createElement('div');
        container.innerHTML = '<p>a <> b</p>';
        const p = container.childNodes[0];
        assert.equal(p.childNodes.length, 1);
        assert.equal(p.childNodes[0].data, 'a <> b');
    });
});
