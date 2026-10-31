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
        assert.equal(t.matches('.a:has(.a:is(:scope))'), false);
        // ...but sibling branches of a forgiving list still apply
        assert.equal(t.matches(':has(:scope, .b)'), true);
        assert.equal(t.matches(':has(:where(:scope, .b))'), true);
        // :not(:scope) matches everything, so :has is true iff relatives exist
        assert.equal(t.matches(':has(:not(:scope))'), true);
        assert.equal(document.getElementById('e').matches(':has(:not(:scope))'), false);
    });

    test(':is()/:where()/:not() contents stay absolute inside :has() (css-select#1930)', () => {
        const ask = (selector: string, html: string) => {
            const doc = new DomParser(html).document as any;
            return doc.getElementById('t').matches(selector);
        };
        const p = '<div class="p" id="t"></div>';
        assert.equal(ask('.p:has(+ .a:not(.b))', `${p}<div class="a b"></div>`), false);
        assert.equal(ask('.p:has(+ :is(.a))', `${p}<div class="a"></div>`), true);
        assert.equal(ask('.p:has(~ :where(.a, .b))', `${p}<i></i><div class="b"></div>`), true);
        assert.equal(ask('.p:has(+ input:checked)', `${p}<input type="checkbox" checked>`), true);
        assert.equal(ask('.p:has(+ :nth-child(2 of .a))', `<i class="a"></i>${p}<i class="a"></i>`), true);
        assert.equal(ask('.p:has(> .a:is(.x .a))', '<section class="x"><div class="p" id="t"><b class="a"></b></div></section>'), true);
    });

    test(':nth-child() of-syntax counts only matching siblings', () => {
        const document = new DomParser('<div><i class="a"></i><b id="t"></b><i class="a"></i><b></b></div>').document as any;
        const t = document.getElementById('t');
        assert.equal(t.matches(':nth-child(2 of .a, b)'), true, 't is 2nd among .a,b siblings');
        assert.equal(t.matches(':nth-child(3 of .a, b)'), false);
        assert.equal(t.matches(':nth-child(1 of b)'), true);
        assert.equal(t.matches(':nth-last-child(1 of b)'), false, 'last b is the 4th child');
        assert.equal(t.matches(':nth-child(even of .a, b)'), true);
        assert.equal(t.matches(':nth-child(odd of .a, b)'), false);
    });
});
