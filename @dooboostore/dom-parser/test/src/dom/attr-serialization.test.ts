import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { DomParser } from '@dooboostore/dom-parser';

// Ground truth: Chromium (via Playwright) for every expectation below.
// '>' is legal inside quoted attribute values; '&'/U+00A0 must be escaped
// on serialize so a round-trip loses no levels (linkedom#340/#341 class).
describe('attribute serialization round-trips', () => {
    test('">" inside quoted attribute value (main path)', () => {
        const doc = new DomParser('<div title="a>b">x</div>').document as any;
        assert.equal(doc.querySelector('div').getAttribute('title'), 'a>b');
    });

    test('"&" in attribute value escapes and round-trips without level loss', () => {
        const doc = new DomParser('<div title="a &amp;amp; b">x</div>').document as any;
        const el = doc.querySelector('div');
        assert.equal(el.getAttribute('title'), 'a &amp; b');
        assert.equal(el.outerHTML, '<div title="a &amp;amp; b">x</div>');
        const back = new DomParser(el.outerHTML).document.querySelector('div');
        assert.equal(back.getAttribute('title'), 'a &amp; b');
    });

    test('"&nbsp;" decodes to U+00A0 and serializes back to &nbsp;', () => {
        const doc = new DomParser('<div title="a&nbsp;b">x</div>').document as any;
        const el = doc.querySelector('div');
        assert.deepEqual([...el.getAttribute('title')].map((c: string) => c.charCodeAt(0)), [97, 160, 98]);
        assert.equal(el.outerHTML, '<div title="a&nbsp;b">x</div>');
    });

    test('text elements keep text with "><" in an attribute (linkedom#341 shape)', () => {
        const doc = new DomParser('<!doctype html><html><head></head><body></body></html>').document as any;
        for (const tag of ['style', 'script', 'title', 'textarea']) {
            const el = doc.createElement(tag);
            el.setAttribute('data-src', 'a><b.css');
            el.textContent = '.caption{color:red}';
            const back = new DomParser(`<!doctype html><html><body>${el.outerHTML}</body></html>`).document.querySelector(tag);
            assert.equal(back.textContent, '.caption{color:red}', tag);
            assert.equal(back.getAttribute('data-src'), 'a><b.css', tag);
        }
    });
});
