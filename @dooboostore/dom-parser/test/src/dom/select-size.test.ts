import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { DomParser } from '@dooboostore/dom-parser';

console.log('🚀 HTMLSelectElement size/multiple Tests Starting...');

describe('HTMLSelectElement size/multiple IDL reflection (matches browsers)', () => {
    test('size getter reflects the content attribute with fallback 0', () => {
        const parser = new DomParser('<html><body></body></html>');
        const document = parser.document;

        const fresh = () => document.createElement('select') as any;
        assert.equal(fresh().size, 0, 'absent -> 0');
        const invalid = fresh(); invalid.setAttribute('size', 'abc');
        assert.equal(invalid.size, 0, 'invalid -> 0');
        const neg = fresh(); neg.setAttribute('size', '-2');
        assert.equal(neg.size, 0, 'negative -> 0');
        const three = fresh(); three.setAttribute('size', '3');
        assert.equal(three.size, 3, '"3" -> 3');
        const spaces = fresh(); spaces.setAttribute('size', ' 4 ');
        assert.equal(spaces.size, 4, 'whitespace tolerated');
        const hex = fresh(); hex.setAttribute('size', '0x10');
        assert.equal(hex.size, 0, 'no hex parsing');
        const trail = fresh(); trail.setAttribute('size', '3x');
        assert.equal(trail.size, 3, 'trailing garbage ignored');

        console.log('✅ size getter works correctly');
    });

    test('size setter clamps and reflects', () => {
        const parser = new DomParser('<html><body></body></html>');
        const document = parser.document;

        const s3 = document.createElement('select') as any;
        s3.size = 3;
        assert.equal(s3.size, 3, 'set 3 reads back 3');
        assert.equal(s3.getAttribute('size'), '3', 'set 3 reflects "3"');

        const sNeg = document.createElement('select') as any;
        sNeg.size = -1;
        assert.equal(sNeg.size, 0, 'set -1 clamps to 0');
        assert.equal(sNeg.getAttribute('size'), '0', 'set -1 reflects "0"');

        const sFloat = document.createElement('select') as any;
        sFloat.size = 2.9;
        assert.equal(sFloat.size, 2, 'set 2.9 truncates to 2');

        console.log('✅ size setter works correctly');
    });

    test('multiple reflects as boolean', () => {
        const parser = new DomParser('<html><body><select id="a" multiple></select><select id="b"></select></body></html>');
        const document = parser.document;

        const a = document.getElementById('a') as any;
        const b = document.getElementById('b') as any;
        assert.equal(a.multiple, true, 'multiple attribute -> true');
        assert.equal(b.multiple, false, 'absent -> false');
        b.multiple = true;
        assert.equal(b.hasAttribute('multiple'), true, 'setter adds attribute');
        b.multiple = false;
        assert.equal(b.hasAttribute('multiple'), false, 'setter removes attribute');

        console.log('✅ multiple works correctly');
    });
});
