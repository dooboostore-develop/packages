import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { DomParser } from '@dooboostore/dom-parser';

console.log('🚀 Doctype + DOMImplementation Tests Starting...');

// Ground truth: Chromium (DOMParser + document.implementation), measured.
describe('doctype node and DOMImplementation (xmldom#998 class, matches Chromium)', () => {
    const docOf = (html: string) => new DomParser(html).document as any;

    test('parsed doctype exposes name/publicId/systemId like browsers', () => {
        const html5 = docOf('<!doctype html><html></html>').doctype;
        assert.deepEqual([html5.name, html5.publicId, html5.systemId, html5.nodeType], ['html', '', '', 10]);

        const pub = docOf('<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd"><html></html>').doctype;
        assert.deepEqual([pub.name, pub.publicId, pub.systemId], ['html', '-//W3C//DTD HTML 4.01//EN', 'http://www.w3.org/TR/html4/strict.dtd']);

        const sys = docOf('<!DOCTYPE html SYSTEM "about:legacy-compat"><html></html>').doctype;
        assert.deepEqual([sys.name, sys.publicId, sys.systemId], ['html', '', 'about:legacy-compat']);

        assert.equal(docOf('<html></html>').doctype, null, 'no doctype -> null');
    });

    test('doctype is the first child of the document', () => {
        const d = docOf('<!doctype html><html><body>x</body></html>');
        const kids = [...d.childNodes].map((n: any) => n.nodeType);
        assert.deepEqual(kids, [10, 1], 'doctype then html');
    });

    test('implementation.createDocumentType validates the name like Chromium', () => {
        const d = docOf('<div></div>');
        const made = d.implementation.createDocumentType('html', '-//W3C//DTD HTML 4.01//EN', 'http://www.w3.org/TR/html4/strict.dtd');
        assert.deepEqual([made.name, made.publicId, made.systemId, made.nodeType], ['html', '-//W3C//DTD HTML 4.01//EN', 'http://www.w3.org/TR/html4/strict.dtd', 10]);

        // Empty name is allowed here (unlike createElement), but whitespace / '>' throw.
        assert.equal(d.implementation.createDocumentType('', '', '').name, '');
        for (const bad of ['a b', 'a>b', 'a/b', 'a\tb']) {
            assert.throws(() => d.implementation.createDocumentType(bad, '', ''), (e: any) => e.name === 'InvalidCharacterError', JSON.stringify(bad));
        }
        // publicId/systemId are NOT validated by browsers.
        assert.equal(d.implementation.createDocumentType('html', 'a"b', "c'd").publicId, 'a"b');
    });

    test('implementation.hasFeature returns true (deprecated, browser behavior)', () => {
        const d = docOf('<div></div>');
        assert.equal(d.implementation.hasFeature(), true);
        assert.equal(d.implementation.hasFeature('Core', '2.0'), true);
    });

    test('implementation.createDocument builds a document with root and doctype', () => {
        const d = docOf('<div></div>');
        const dt = d.implementation.createDocumentType('html', '', '');
        const made = d.implementation.createDocument(null, 'root', dt);
        assert.equal(made.doctype.name, 'html');
        assert.equal(made.documentElement.localName, 'root');
    });
});
