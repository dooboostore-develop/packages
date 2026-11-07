import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { DomParser } from '@dooboostore/dom-parser';

console.log('🚀 createElement name validation Tests Starting...');

// Ground truth: Chromium (36-probe matrix). createElement's rule differs from
// setAttribute's: 'a=b' is fine here (setAttribute throws), '<a' throws here
// (setAttribute accepts), '1a'/'-a'/'.a'/'?a' throw (leading char must be
// ASCII alpha, '_', ':' or non-ASCII), and '/', '>', whitespace, NUL are
// rejected anywhere in the name.
describe('createElement name validation (xmldom#1052 class, matches Chromium)', () => {
    const doc = () => new DomParser('<html><body></body></html>').document as any;

    test('rejected names throw InvalidCharacterError', () => {
        const d = doc();
        const bad = [
            '', 'a b', 'a>', 'a/', 'a>b', 'a/b', 'a\tb', 'a\nb', 'a\rb', 'a\fb', 'a\u0000b',
            '<a', '1a', '?a', '!a', '-a', '.a', '%a', '*a', '#a', '@a', '>a',
        ];
        for (const name of bad) {
            assert.throws(() => d.createElement(name), (e: any) => e.name === 'InvalidCharacterError', `createElement ${JSON.stringify(name)}`);
        }
    });

    test('accepted names match Chromium, including the setAttribute-divergent ones', () => {
        const d = doc();
        const good = ['a=b', 'a"b', "a'b", 'a:b', 'a<b', 'a\u00A0b', 'a\u0001b', '_a', ':a', 'a-b', 'a.b', 'a_b'];
        for (const name of good) {
            const el = d.createElement(name);
            assert.ok(el, `createElement ${JSON.stringify(name)}`);
        }
    });

    test('lowercases ASCII tag names like browsers', () => {
        const d = doc();
        assert.equal(d.createElement('DIV').localName, 'div');
        assert.equal(d.createElement('My-El').localName, 'my-el');
    });

    test('createElementNS applies the same name rule', () => {
        const d = doc();
        assert.throws(() => d.createElementNS('http://www.w3.org/2000/svg', ''), (e: any) => e.name === 'InvalidCharacterError');
        assert.throws(() => d.createElementNS('http://www.w3.org/2000/svg', 'a b'), (e: any) => e.name === 'InvalidCharacterError');
        assert.equal(d.createElementNS('http://www.w3.org/2000/svg', 'path').tagName, 'path');
    });

    test('parsed markup is unaffected', () => {
        const d = new DomParser('<div id="a"><my-el></my-el><span>x</span></div>').document as any;
        assert.equal(d.querySelector('span').localName, 'span');
        assert.equal(d.querySelector('my-el').localName, 'my-el');
    });
});
