import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { DomParser } from '@dooboostore/dom-parser';

console.log('🚀 createProcessingInstruction Tests Starting...');

// Ground truth: Chromium (via Playwright) for every expectation below.
// DOM §4.5 createProcessingInstruction: target must match the XML Name
// production, data must not contain "?>", both -> InvalidCharacterError.
// Notable measured detail: "xml"/"XML" as target is NOT rejected by browsers,
// and empty data is allowed (serializes as <?target?>).
describe('createProcessingInstruction (matches browsers)', () => {
    const doc = () => new DomParser('<html><body></body></html>').document as any;

    test('valid targets and data', () => {
        const d = doc();
        assert.equal(d.createProcessingInstruction('xml', 'version="1.0"').nodeName, 'xml');
        assert.equal(d.createProcessingInstruction('a:b', 'x').nodeName, 'a:b');
        assert.equal(d.createProcessingInstruction('_a', 'x').nodeName, '_a');
        assert.equal(d.createProcessingInstruction('a-b', 'x').nodeName, 'a-b');
        assert.equal(d.createProcessingInstruction('XML', 'x').nodeName, 'XML');
        assert.equal(d.createProcessingInstruction('t', '').nodeName, 't');
    });

    test('invalid targets throw InvalidCharacterError', () => {
        const d = doc();
        const bad = ['', 'a b', '1abc', '.abc'];
        for (const target of bad) {
            assert.throws(() => d.createProcessingInstruction(target, 'x'), (e: any) => e.name === 'InvalidCharacterError', `target ${JSON.stringify(target)}`);
        }
    });

    test('data containing "?>" throws InvalidCharacterError', () => {
        const d = doc();
        assert.throws(() => d.createProcessingInstruction('t', 'a?>b'), (e: any) => e.name === 'InvalidCharacterError');
        assert.throws(() => d.createProcessingInstruction('t', 'a="?>x"'), (e: any) => e.name === 'InvalidCharacterError');
        assert.throws(() => d.createProcessingInstruction('t', '?>'), (e: any) => e.name === 'InvalidCharacterError');
    });

    test('node shape and serialization', () => {
        const d = doc();
        const pi = d.createProcessingInstruction('t', 'a=b');
        assert.equal(pi.nodeType, 7);
        assert.equal(pi.target, 't');
        assert.equal(pi.data, 'a=b');
        assert.equal(pi.textContent, 'a=b');

        const div = d.createElement('div');
        div.appendChild(d.createProcessingInstruction('t', 'a=b'));
        assert.equal(div.innerHTML, '<?t a=b?>');
        assert.equal(div.getHTML(), '<?t a=b?>');

        const div2 = d.createElement('div');
        div2.appendChild(d.createProcessingInstruction('t', ''));
        assert.equal(div2.innerHTML, '<?t?>', 'empty data serializes without the space');
    });
});
