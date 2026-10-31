import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { DomParser } from '@dooboostore/dom-parser';

// Ground truth: Chromium (via Playwright) for every expectation below.
// Covers happy-dom#2540 (i modifier) and #2506 (empty-value) classes.
describe('attribute selector modifiers and empty values', () => {
    test('case-insensitive modifier ([attr="v" i])', () => {
        const doc = new DomParser('<div id="a" type="Button"></div><div id="b" type="button"></div>').document as any;
        assert.equal(doc.querySelectorAll('[type="button" i]').length, 2);
        assert.equal(doc.querySelectorAll('[type="BUTTON" I]').length, 2);
        assert.equal(doc.querySelectorAll('[type="button"]').length, 1);
        // unquoted value with modifier also matches; bare [type i] matches nothing (browsers throw)
        assert.equal(doc.querySelectorAll('[type=button i]').length, 2);
        assert.equal(doc.querySelectorAll('[type i]').length, 0);
    });

    test('empty-string values never match substring operators', () => {
        const doc = new DomParser('<div data-x="foo"></div>').document as any;
        assert.equal(doc.querySelectorAll('[data-x^=""]').length, 0);
        assert.equal(doc.querySelectorAll('[data-x$=""]').length, 0);
        assert.equal(doc.querySelectorAll('[data-x*=""]').length, 0);
        // ~= with empty value never matches either (css-select#1910 class)
        const doc2 = new DomParser('<i a=""></i><i a=" x"></i><i a="x "></i><i a="x  y"></i>').document as any;
        assert.equal(doc2.querySelectorAll('[a~=""]').length, 0);
        assert.equal(doc2.querySelectorAll('[a~="x"]').length, 3);
        assert.equal(doc2.querySelectorAll('[a~="y"]').length, 1);
        // |= keeps dash-list semantics: "" matches "" and "-x"
        const doc3 = new DomParser('<i a=""></i><i a=" x"></i><i a="x"></i><i a="-x"></i>').document as any;
        assert.equal(doc3.querySelectorAll('[a|=""]').length, 2);
    });

    test('empty-string exact match still works', () => {
        const doc = new DomParser('<div data-x=""></div><div data-x="foo"></div>').document as any;
        assert.equal(doc.querySelectorAll('[data-x=""]').length, 1);
    });
});
