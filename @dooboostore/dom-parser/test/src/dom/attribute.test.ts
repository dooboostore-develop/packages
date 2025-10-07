import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { DomParser } from '../../../src/index.ts';

console.log('🚀 Attribute Tests Starting...');

describe('Attribute Tests', () => {
    test('should handle basic attributes', () => {
        const parser = new DomParser(`
            <html>
                <body>
                    <div id="test" dr-for-of="zzz" class="container" data-value="123">Content</div>
                </body>
            </html>
        `);

        const document = parser.document;
        const element = document.querySelector('#test');

        assert.ok(element, 'Element should exist');

        // Test getAttribute
        assert.equal(element.getAttribute('id'), 'test', 'Should get id attribute');
        assert.equal(element.getAttribute('dr-for-of'), 'zzz', 'Should get hyphenated attribute');
        assert.equal(element.getAttribute('class'), 'container', 'Should get class attribute');
        assert.equal(element.getAttribute('data-value'), '123', 'Should get data attribute');

        // Test non-existent attribute returns null
        assert.equal(element.getAttribute('non-existent'), null, 'Non-existent attribute should return null');
        assert.equal(element.getAttribute('missing-attr'), null, 'Missing attribute should return null');

        // Test hasAttribute
        assert.equal(element.hasAttribute('id'), true, 'Should have id attribute');
        assert.equal(element.hasAttribute('dr-for-of'), true, 'Should have hyphenated attribute');
        assert.equal(element.hasAttribute('non-existent'), false, 'Should not have non-existent attribute');

        // Test getAttributeNames
        const attributeNames = element.getAttributeNames();
        console.log('Attribute names:', attributeNames);
        assert.ok(attributeNames.includes('id'), 'Should include id in attribute names');
        assert.ok(attributeNames.includes('dr-for-of'), 'Should include hyphenated attribute in names');
        assert.ok(attributeNames.includes('class'), 'Should include class in attribute names');
        assert.ok(attributeNames.includes('data-value'), 'Should include data attribute in names');

        console.log('✅ Basic attributes test passed');
    });

    test('should handle complex attribute values', () => {
        const parser = new DomParser(`
            <html>
                <body>
                    <div data-complex="value with spaces and 'quotes'">Content</div>
                </body>
            </html>
        `);

        const document = parser.document;
        const element = document.querySelector('div');

        assert.ok(element, 'Element should exist');

        // Test complex attribute value with spaces and quotes
        const complexValue = element.getAttribute('data-complex');
        assert.equal(complexValue, "value with spaces and 'quotes'", 'Should handle complex attribute values');

        // Test that quotes are properly preserved
        assert.ok(complexValue.includes("'"), 'Should preserve single quotes in attribute value');
        assert.ok(complexValue.includes(' '), 'Should preserve spaces in attribute value');

        console.log('✅ Complex attribute values test passed');
    });

    test('should handle custom attributes', () => {
        const parser = new DomParser(`
            <html>
                <body>
                    <div custom-attr="custom-value" dr-for-of="@this@.items">Content</div>
                </body>
            </html>
        `);

        const document = parser.document;
        const element = document.querySelector('div');

        assert.ok(element, 'Element should exist');

        // Test custom attributes
        assert.equal(element.getAttribute('custom-attr'), 'custom-value', 'Should handle custom attributes');
        assert.equal(element.getAttribute('dr-for-of'), '@this@.items', 'Should handle framework-specific attributes');

        // Test hasAttribute for custom attributes
        assert.equal(element.hasAttribute('custom-attr'), true, 'Should detect custom attributes');
        assert.equal(element.hasAttribute('dr-for-of'), true, 'Should detect framework attributes');

        // Test non-existent custom attribute returns null
        assert.equal(element.getAttribute('non-custom'), null, 'Non-existent custom attribute should return null');

        console.log('✅ Custom attributes test passed');
    });

    test('should handle attribute manipulation', () => {
        const parser = new DomParser(`
            <html>
                <body>
                    <div id="test">Content</div>
                </body>
            </html>
        `);

        const document = parser.document;
        const element = document.querySelector('#test');

        assert.ok(element, 'Element should exist');

        // Test initial state
        assert.equal(element.getAttribute('id'), 'test', 'Should have initial id');
        assert.equal(element.hasAttribute('class'), false, 'Should not have class initially');

        // Test setAttribute
        element.setAttribute('class', 'new-class');
        assert.equal(element.getAttribute('class'), 'new-class', 'Should set new attribute');
        assert.equal(element.hasAttribute('class'), true, 'Should detect newly set attribute');

        // Test setAttribute overwrite
        element.setAttribute('id', 'new-id');
        assert.equal(element.getAttribute('id'), 'new-id', 'Should overwrite existing attribute');

        // Test removeAttribute
        element.removeAttribute('class');
        assert.equal(element.getAttribute('class'), null, 'Removed attribute should return null');
        assert.equal(element.hasAttribute('class'), false, 'Should not detect removed attribute');

        // Test removing non-existent attribute (should not throw)
        element.removeAttribute('non-existent');
        assert.equal(element.getAttribute('non-existent'), null, 'Non-existent attribute should still return null');

        console.log('✅ Attribute manipulation test passed');
    });

    test('should handle boolean attributes', () => {
        const parser = new DomParser(`
            <html>
                <body>
                    <input type="checkbox" checked disabled>
                    <button hidden>Button</button>
                </body>
            </html>
        `);

        const document = parser.document;
        const input = document.querySelector('input');
        const button = document.querySelector('button');

        assert.ok(input, 'Input element should exist');
        assert.ok(button, 'Button element should exist');

        // Test boolean attributes presence
        assert.equal(input.hasAttribute('checked'), true, 'Should detect checked attribute');
        assert.equal(input.hasAttribute('disabled'), true, 'Should detect disabled attribute');
        assert.equal(button.hasAttribute('hidden'), true, 'Should detect hidden attribute');

        // Test boolean attributes values (should be empty string or attribute name)
        const checkedValue = input.getAttribute('checked');
        const disabledValue = input.getAttribute('disabled');
        const hiddenValue = button.getAttribute('hidden');

        // Boolean attributes can be empty string or the attribute name itself
        assert.ok(checkedValue === '' || checkedValue === 'checked', 'Checked attribute should be empty or "checked"');
        assert.ok(disabledValue === '' || disabledValue === 'disabled', 'Disabled attribute should be empty or "disabled"');
        assert.ok(hiddenValue === '' || hiddenValue === 'hidden', 'Hidden attribute should be empty or "hidden"');

        // Test non-existent boolean attributes
        assert.equal(input.hasAttribute('readonly'), false, 'Should not have readonly attribute');
        assert.equal(input.getAttribute('readonly'), null, 'Non-existent boolean attribute should return null');

        console.log('✅ Boolean attributes test passed');
    });

    test('should handle attribute case sensitivity', () => {
        const parser = new DomParser(`
            <html>
                <body>
                    <div ID="test" CLASS="container" Data-Value="123">Content</div>
                </body>
            </html>
        `);

        const document = parser.document;
        const element = document.querySelector('div');

        assert.ok(element, 'Element should exist');

        // HTML attributes are case-insensitive, so these should work
        assert.equal(element.getAttribute('id'), 'test', 'Should get ID attribute with lowercase');
        assert.equal(element.getAttribute('ID'), 'test', 'Should get ID attribute with uppercase');
        assert.equal(element.getAttribute('class'), 'container', 'Should get CLASS attribute with lowercase');
        assert.equal(element.getAttribute('CLASS'), 'container', 'Should get CLASS attribute with uppercase');

        // Test mixed case
        assert.equal(element.getAttribute('data-value'), '123', 'Should get Data-Value with lowercase');
        assert.equal(element.getAttribute('Data-Value'), '123', 'Should get Data-Value with original case');
        assert.equal(element.getAttribute('DATA-VALUE'), '123', 'Should get Data-Value with uppercase');

        // Test hasAttribute with different cases
        assert.equal(element.hasAttribute('id'), true, 'Should detect id with lowercase');
        assert.equal(element.hasAttribute('ID'), true, 'Should detect ID with uppercase');
        assert.equal(element.hasAttribute('Class'), true, 'Should detect class with mixed case');

        // Test non-existent with different cases
        assert.equal(element.getAttribute('missing'), null, 'Non-existent lowercase should return null');
        assert.equal(element.getAttribute('MISSING'), null, 'Non-existent uppercase should return null');

        console.log('✅ Attribute case sensitivity test passed');
    });

    test('should handle special characters in attributes', () => {
        const parser = new DomParser(`
            <html>
                <body>
                    <div data-special="value with &lt;&gt;&amp; entities">Content</div>
                </body>
            </html>
        `);

        const document = parser.document;
        const element = document.querySelector('div');

        assert.ok(element, 'Element should exist');

        // Test HTML entities in attribute values
        const specialValue = element.getAttribute('data-special');
        assert.equal(specialValue, 'value with <>& entities', 'Should decode HTML entities in attribute values');

        // Test that entities are properly decoded
        assert.ok(specialValue.includes('<'), 'Should decode &lt; to <');
        assert.ok(specialValue.includes('>'), 'Should decode &gt; to >');
        assert.ok(specialValue.includes('&'), 'Should decode &amp; to &');

        // Test setting attributes with special characters
        element.setAttribute('data-test', 'value with <>&"\'');
        const testValue = element.getAttribute('data-test');
        assert.equal(testValue, 'value with <>&"\'', 'Should handle special characters when setting attributes');

        // Test non-existent attribute with special name
        assert.equal(element.getAttribute('data-<special>'), null, 'Non-existent attribute with special chars should return null');

        console.log('✅ Special characters in attributes test passed');
    });

    test('should handle template syntax in attributes', () => {
        const parser = new DomParser(`
            <html>
                <body>
                    <div dr-for-of="@this@.items" data-template="\${value}$">Content</div>
                </body>
            </html>
        `);

        const document = parser.document;
        const element = document.querySelector('div');

        assert.ok(element, 'Element should exist');

        // Test framework-specific template syntax
        assert.equal(element.getAttribute('dr-for-of'), '@this@.items', 'Should preserve template syntax in attributes');
        assert.equal(element.getAttribute('data-template'), '${value}$', 'Should preserve template literals in attributes');

        // Test that special template characters are preserved
        const forOfValue = element.getAttribute('dr-for-of');
        const templateValue = element.getAttribute('data-template');

        assert.ok(forOfValue.includes('@'), 'Should preserve @ symbols in template syntax');
        assert.ok(forOfValue.includes('.'), 'Should preserve dots in template syntax');
        assert.ok(templateValue.includes('$'), 'Should preserve $ symbols in template literals');
        assert.ok(templateValue.includes('{'), 'Should preserve braces in template literals');

        // Test hasAttribute with template syntax
        assert.equal(element.hasAttribute('dr-for-of'), true, 'Should detect template attributes');
        assert.equal(element.hasAttribute('data-template'), true, 'Should detect template literal attributes');

        // Test non-existent template attribute
        assert.equal(element.getAttribute('dr-if'), null, 'Non-existent template attribute should return null');

        console.log('✅ Template syntax in attributes test passed');
    });

    test('should return null for non-existent attributes', () => {
        const parser = new DomParser(`
            <html>
                <body>
                    <div id="test" class="container">Content</div>
                </body>
            </html>
        `);

        const document = parser.document;
        const element = document.querySelector('#test');

        assert.ok(element, 'Element should exist');

        // Test various non-existent attributes return null
        assert.equal(element.getAttribute('non-existent'), null, 'Non-existent attribute should return null');
        assert.equal(element.getAttribute('missing-attr'), null, 'Missing attribute should return null');
        assert.equal(element.getAttribute('undefined-prop'), null, 'Undefined property should return null');
        assert.equal(element.getAttribute(''), null, 'Empty string attribute name should return null');
        assert.equal(element.getAttribute('data-missing'), null, 'Missing data attribute should return null');
        assert.equal(element.getAttribute('aria-missing'), null, 'Missing aria attribute should return null');

        // Test hasAttribute returns false for non-existent attributes
        assert.equal(element.hasAttribute('non-existent'), false, 'Should not have non-existent attribute');
        assert.equal(element.hasAttribute('missing-attr'), false, 'Should not have missing attribute');
        assert.equal(element.hasAttribute(''), false, 'Should not have empty string attribute');

        console.log('✅ Non-existent attributes test passed');
    });

    test('should handle empty and whitespace attribute values', () => {
        const parser = new DomParser(`
            <html>
                <body>
                    <div id="" class="   " data-empty="" data-spaces="   ">Content</div>
                </body>
            </html>
        `);

        const document = parser.document;
        const element = document.querySelector('div');

        assert.ok(element, 'Element should exist');

        // Test empty attribute values
        assert.equal(element.getAttribute('id'), '', 'Empty id should return empty string');
        assert.equal(element.getAttribute('data-empty'), '', 'Empty data attribute should return empty string');

        // Test whitespace-only attribute values
        assert.equal(element.getAttribute('class'), '   ', 'Whitespace class should preserve spaces');
        assert.equal(element.getAttribute('data-spaces'), '   ', 'Whitespace data attribute should preserve spaces');

        // Test hasAttribute still returns true for empty attributes
        assert.equal(element.hasAttribute('id'), true, 'Should detect empty id attribute');
        assert.equal(element.hasAttribute('data-empty'), true, 'Should detect empty data attribute');

        console.log('✅ Empty and whitespace attributes test passed');
    });

    test('should handle numeric attribute values', () => {
        const parser = new DomParser(`
            <html>
                <body>
                    <div data-number="123" data-float="45.67" data-negative="-89" tabindex="0">Content</div>
                </body>
            </html>
        `);

        const document = parser.document;
        const element = document.querySelector('div');

        assert.ok(element, 'Element should exist');

        // Test numeric attribute values (should be returned as strings)
        assert.equal(element.getAttribute('data-number'), '123', 'Numeric attribute should return as string');
        assert.equal(element.getAttribute('data-float'), '45.67', 'Float attribute should return as string');
        assert.equal(element.getAttribute('data-negative'), '-89', 'Negative number should return as string');
        assert.equal(element.getAttribute('tabindex'), '0', 'Tabindex should return as string');

        // Test that they are indeed strings, not numbers
        assert.equal(typeof element.getAttribute('data-number'), 'string', 'Attribute value should be string type');
        assert.equal(typeof element.getAttribute('tabindex'), 'string', 'Tabindex should be string type');

        console.log('✅ Numeric attributes test passed');
    });
});