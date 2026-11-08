import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { DomParser } from '@dooboostore/dom-parser';

console.log('🚀 Strict selector syntax Tests Starting...');

// Ground truth: Chromium (43-probe matrix, document.querySelectorAll).
// The internal parser stays forgiving for :is()/:where() arguments; the
// PUBLIC entry points must throw SyntaxError like browsers.
describe('invalid selectors throw SyntaxError (happy-dom#2597 class)', () => {
    const doc = () => new DomParser('<html><body><div class="a"></div></body></html>').document as any;
    const throwsSyntaxError = (selector: string) => {
        const d = doc();
        assert.throws(() => d.querySelectorAll(selector), (e: any) => e.name === 'SyntaxError', JSON.stringify(selector));
        assert.throws(() => d.querySelector(selector), (e: any) => e.name === 'SyntaxError', 'querySelector ' + JSON.stringify(selector));
        assert.throws(() => d.body.matches(selector), (e: any) => e.name === 'SyntaxError', 'matches ' + JSON.stringify(selector));
    };

    test('malformed selectors throw', () => {
        for (const s of ['', ' ', '[', ']', 'a >', '>a', 'a ~', '..a', '#', '.', ':', '::', 'a,,b', ',', 'a,', ':not()', ':has()', ':nth-child(', 'a[', '[a=]', ':unknown', 'a b >']) {
            throwsSyntaxError(s);
        }
    });

    test('valid selectors keep working (including the surprising ones)', () => {
        const d = doc();
        for (const s of ['div', '*', '* > *', ':scope', 'a:not(b c)', ':has(> a)', 'a:is(b, )', ':is()', '::before', 'a::before', 'a>b', 'a + b', 'a~b', '[a]', '[a="b"]', '[a="b" i]', '[a=b i]', '[a=""]', ':nth-child(2n+1)', ':nth-child(2 of a)', ':host', ':host(.x)', ':focus-visible', ':user-invalid']) {
            assert.doesNotThrow(() => d.querySelectorAll(s), JSON.stringify(s));
        }
    });

    test('node-mutation errors keep their own names', () => {
        const d = doc();
        const span = d.createElement('span');
        assert.throws(() => d.body.removeChild(span), (e: any) => e.name === 'NotFoundError');
        assert.throws(() => d.body.insertBefore(d.createElement('i'), span), (e: any) => e.name === 'NotFoundError');
        assert.throws(() => d.body.appendChild(d.documentElement), (e: any) => e.name === 'HierarchyRequestError');
    });

    test('forgiving argument lists still do not throw', () => {
        const d = doc();
        // Inside :is()/:where() an unbuildable branch is skipped, not fatal.
        assert.equal(d.querySelectorAll(':is(div, :unknown)').length, 1);
        assert.equal(d.querySelectorAll(':where(div, !!)').length, 1);
    });
});
