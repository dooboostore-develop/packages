import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { DomParser } from '@dooboostore/dom-parser';

console.log('🚀 DOMTokenList.toggle force Tests Starting...');

// unhappy-dom#2576 class: toggle(token, force) must be a no-op (no attribute
// write, hence no mutation record) when force already matches presence.
// Verified against Chromium.
describe('DOMTokenList.toggle with force', () => {
    test('matching force leaves the attribute byte-identical', () => {
        const document = new DomParser('<html><body><div id="a" class="a"></div></body></html>').document as any;
        const el = document.getElementById('a');

        assert.strictEqual(el.classList.toggle('a', true), true);
        assert.strictEqual(el.getAttribute('class'), 'a', 'no rewrite on matching force');
        assert.strictEqual(el.classList.toggle('b', false), false);
        assert.strictEqual(el.getAttribute('class'), 'a', 'no write for absent token with false');
    });

    test('force is boolean-coerced, not identity-compared', () => {
        const document = new DomParser('<html><body><div id="a" class="a"></div></body></html>').document as any;
        const el = document.getElementById('a');

        assert.strictEqual(el.classList.toggle('b', null as any), false);
        assert.strictEqual(el.getAttribute('class'), 'a', 'null means remove; absent already so no write');
        assert.strictEqual(el.classList.toggle('a', 1 as any), true);
        assert.strictEqual(el.getAttribute('class'), 'a', 'truthy means keep; no rewrite');
        assert.strictEqual(el.classList.toggle('a', 0 as any), false);
        assert.strictEqual(el.getAttribute('class'), '', 'falsy removes');
    });

    test('no-force toggle still flips', () => {
        const document = new DomParser('<html><body><div id="a" class="a"></div></body></html>').document as any;
        const el = document.getElementById('a');

        assert.strictEqual(el.classList.toggle('a'), false);
        assert.strictEqual(el.getAttribute('class'), '');
        assert.strictEqual(el.classList.toggle('b'), true);
        assert.strictEqual(el.getAttribute('class'), 'b');
    });
});
