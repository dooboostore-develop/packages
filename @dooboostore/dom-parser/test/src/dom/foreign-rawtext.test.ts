import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { DomParser } from '@dooboostore/dom-parser';

console.log('🚀 Foreign raw-text Tests Starting...');

// Ground truth: Chromium (via Playwright) for every expectation below.
// <style>/<script> are raw-text elements ONLY in the HTML namespace.
// In foreign content (SVG/MathML) they are normal elements: entities decode
// on parse and must re-escape on serialize (css-select#1910 class is
// different — this is solid#4704's shape: unescaped output breaks out).
describe('foreign style/script are normal elements (matches browsers)', () => {
    const roundtrip = (html: string) => {
        const doc = new DomParser(html).document as any;
        return doc.querySelector('body').innerHTML;
    };

    test('entities in foreign style/script escape on serialize', () => {
        assert.equal(
            roundtrip('<math><style>a &lt; b</style></math>'),
            '<math><style>a &lt; b</style></math>'
        );
        assert.equal(
            roundtrip('<svg><style>a &lt; b</style></svg>'),
            '<svg><style>a &lt; b</style></svg>'
        );
        assert.equal(roundtrip('<div><style>a &lt; b</style></div>'), '<div><style>a &lt; b</style></div>');
    });

    test('literal < in foreign style/script is escaped, not passed through', () => {
        assert.equal(roundtrip('<math><style>a < b</style></math>'), '<math><style>a &lt; b</style></math>');
        // HTML-namespace style keeps raw text verbatim (round-trips as-is).
        assert.equal(roundtrip('<div><style>a < b</style></div>'), '<div><style>a < b</style></div>');
    });

    test('foreign style/script parse markup children, not raw text', () => {
        const doc = new DomParser('<svg><style><rect/></style></svg>').document as any;
        const style = doc.querySelector('style');
        assert.equal(style.childNodes.length, 1);
        assert.equal(style.firstChild.tagName.toLowerCase(), 'rect');
        assert.equal(
            doc.querySelector('body').innerHTML,
            '<svg><style><rect></rect></style></svg>'
        );
    });

    test('HTML style/script stay raw (no entity decoding on parse)', () => {
        const doc = new DomParser('<html><body><div><style>a &lt; b</style></div></body></html>').document as any;
        assert.equal(doc.querySelector('style').textContent, 'a &lt; b');
    });
});
