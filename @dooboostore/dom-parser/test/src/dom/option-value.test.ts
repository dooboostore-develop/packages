import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { DomParser } from '@dooboostore/dom-parser';

console.log('🚀 Option value/text Tests Starting...');

describe('HTMLOptionElement value/text (HTML spec: strip and collapse)', () => {
    test('option without value attribute uses collapsed text', () => {
        const parser = new DomParser('<html><body><form><select name="fruit"><option selected>\n  Red   Orange\n</option></select></form></body></html>');
        const document = parser.document;

        const select = document.querySelector('select');
        const option = document.querySelector('option');
        assert.ok(select && option, 'select and option should exist');

        // Browsers: select.value/option.value/option.text all collapse to 'Red Orange'.
        assert.equal(option.value, 'Red Orange', 'option.value should strip and collapse whitespace');
        assert.equal(option.text, 'Red Orange', 'option.text should strip and collapse whitespace');
        assert.equal(select.value, 'Red Orange', 'select.value should reflect collapsed option value');
        assert.equal(option.getAttribute('value'), null, 'value attribute should be absent');

        // Setting select.value to the collapsed value must select the option.
        select.value = 'Red Orange';
        assert.equal(option.selected, true, 'collapsed value should select the option');

        console.log('✅ option value/text whitespace handling works correctly');
    });

    test('option with value attribute keeps the attribute verbatim', () => {
        const parser = new DomParser('<html><body><select><option value="  raw  ">  Label   Text  </option></select></body></html>');
        const document = parser.document;

        const option = document.querySelector('option');
        assert.ok(option, 'option should exist');

        assert.equal(option.value, '  raw  ', 'explicit value attribute wins verbatim');
        assert.equal(option.text, 'Label Text', 'option.text still collapses');

        console.log('✅ explicit option value attribute works correctly');
    });

    test('script descendants are excluded from option text', () => {
        const parser = new DomParser('<html><body><select><option>A<script>var x = 1;</script>B</option></select></body></html>');
        const document = parser.document;

        const option = document.querySelector('option');
        assert.ok(option, 'option should exist');

        assert.equal(option.text, 'AB', 'script content should be excluded from option text');

        console.log('✅ script exclusion works correctly');
    });
});
