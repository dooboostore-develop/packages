import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { DomParser } from '@dooboostore/dom-parser';

console.log('🚀 Attribute name validation Tests Starting...');

// Ground truth: Chromium (19-probe matrix; setAttribute and createAttribute
// agree exactly). Rejected = empty, or any of { U+0000, space, TAB, LF, CR,
// FF, '>', '/', '=' }. Accepted = '<', '"', "'", ':', leading digit, NBSP,
// other controls — Chromium validates against the HTML tokenizer's
// attribute-name set, not the XML Name production.
describe('attribute name validation (xmldom#1053 class, matches Chromium)', () => {
    const doc = () => new DomParser('<html><body></body></html>').document as any;

    test('rejected names throw InvalidCharacterError on both APIs', () => {
        const d = doc();
        const bad = ['a b', '', 'a>', 'a/b', 'a=b', 'a\tb', 'a\nb', 'a\rb', 'a\fb', 'a\u0000b'];
        for (const name of bad) {
            const el = d.createElement('div');
            assert.throws(() => el.setAttribute(name, 'x'), (e: any) => e.name === 'InvalidCharacterError', `setAttribute ${JSON.stringify(name)}`);
            assert.throws(() => d.createAttribute(name), (e: any) => e.name === 'InvalidCharacterError', `createAttribute ${JSON.stringify(name)}`);
        }
    });

    test('accepted names match Chromium (including the spec-divergent ones)', () => {
        const d = doc();
        const good = ['<a', 'a"b', "a'b", 'a:b', '1a', 'a\u00A0b', 'a\u0001b'];
        for (const name of good) {
            const el = d.createElement('div');
            el.setAttribute(name, 'x');
            assert.equal(el.getAttribute(name), 'x', `setAttribute ${JSON.stringify(name)}`);
            assert.equal(d.createAttribute(name).name, name, `createAttribute ${JSON.stringify(name)}`);
        }
    });

    test('parsed markup still sets ordinary attributes', () => {
        const d = new DomParser('<div id="a" data-x="1" aria-label="hi" xlink:href="#y"></div>').document as any;
        const el = d.querySelector('div');
        assert.equal(el.getAttribute('id'), 'a');
        assert.equal(el.getAttribute('data-x'), '1');
        assert.equal(el.getAttribute('aria-label'), 'hi');
        assert.equal(el.getAttribute('xlink:href'), '#y');
    });
});
