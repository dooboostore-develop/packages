import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { DomParser } from '@dooboostore/dom-parser';

console.log('🚀 :has() absolutization Tests Starting...');

// Ground truth: Chromium (via Playwright) for every expectation below.
// The :has() argument absolutizes against :scope (the anchor): compounds
// must match strict relatives only, and an explicit :scope inside never
// matches (css-select#1928 class).
describe(':has() anchoring (matches browsers)', () => {
    const MARKUP = '<div class="a" id="t"><i class="b"></i></div>' +
        '<div class="a" id="u"><div class="a"><i class="b"></i></div></div>' +
        '<div class="a" id="e"></div>';

    test('absolutized compounds exclude the anchor itself', () => {
        const document = new DomParser(MARKUP).document as any;
        const t = document.getElementById('t');
        const u = document.getElementById('u');
        assert.equal(t.matches('.a:has(.a .b)'), false, 'no nested .a -> false');
        assert.equal(u.matches('.a:has(.a .b)'), true, 'nested .a .b -> true');
        assert.equal(t.matches('.a:has(.b)'), true, 'direct descendant -> true');
        assert.equal(t.matches('.a:has(> .b)'), true, 'child combinator -> true');
    });

    test('explicit :scope inside :has() never matches', () => {
        const document = new DomParser(MARKUP).document as any;
        const t = document.getElementById('t');
        assert.equal(t.matches('.a:has(:scope .b)'), false);
        assert.equal(t.matches('.a:has(:scope)'), false);
        assert.equal(t.matches(':has(:scope > .b)'), false);
        assert.equal(t.matches(':has(:is(:scope))'), false);
        // ...but sibling branches of a forgiving list still apply
        assert.equal(t.matches(':has(:scope, .b)'), true);
        assert.equal(t.matches(':has(:where(:scope, .b))'), true);
        // :not(:scope) matches everything, so :has is true iff relatives exist
        assert.equal(t.matches(':has(:not(:scope))'), true);
        assert.equal(document.getElementById('e').matches(':has(:not(:scope))'), false);
    });
});
