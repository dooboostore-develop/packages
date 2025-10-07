import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { DomParser } from '@dooboostore/dom-parser';

console.log('🚀 InnerText and TextContent Tests Starting...');

describe('InnerText and TextContent - HTML Entity Escaping', () => {
    test('should escape HTML entities when setting innerText', () => {
        const parser = new DomParser('<html><body><div id="test"></div></body></html>');
        const document = parser.document;
        
        const testDiv = document.querySelector('#test');
        assert.ok(testDiv, 'Test div should exist');
        
        // Set innerText with HTML content
        testDiv.innerText = '<div>aaa</div>';
        
        // Get innerText back - should be escaped
        const result = testDiv.innerText;
        assert.equal(result, '<div>aaa</div>', 'innerText should return the exact text without HTML parsing');
        
        // Check that innerHTML contains escaped entities
        const innerHTML = testDiv.innerHTML;
        assert.ok(innerHTML.includes('&lt;div&gt;'), 'innerHTML should contain escaped HTML entities');
        assert.ok(innerHTML.includes('&lt;/div&gt;'), 'innerHTML should contain escaped closing tag');
        
        console.log('✅ innerText HTML escaping works correctly');
    });

    test('should escape HTML entities when setting textContent', () => {
        const parser = new DomParser('<html><body><div id="test"></div></body></html>');
        const document = parser.document;
        
        const testDiv = document.querySelector('#test');
        assert.ok(testDiv, 'Test div should exist');
        
        // Set textContent with HTML content
        testDiv.textContent = '<script>alert("XSS")</script>';
        
        // Get textContent back - should be the same
        const result = testDiv.textContent;
        assert.equal(result, '<script>alert("XSS")</script>', 'textContent should return the exact text');
        
        // Check that innerHTML contains escaped entities
        const innerHTML = testDiv.innerHTML;
        assert.ok(innerHTML.includes('&lt;script&gt;'), 'innerHTML should contain escaped script tag');
        assert.ok(innerHTML.includes('&lt;/script&gt;'), 'innerHTML should contain escaped closing script tag');
        assert.ok(innerHTML.includes('&quot;XSS&quot;'), 'innerHTML should contain escaped quotes');
        
        console.log('✅ textContent HTML escaping works correctly');
    });

    test('should handle special characters in innerText', () => {
        const parser = new DomParser('<html><body><div id="test"></div></body></html>');
        const document = parser.document;
        
        const testDiv = document.querySelector('#test');
        assert.ok(testDiv, 'Test div should exist');
        
        // Set innerText with special characters
        const specialText = 'Price: $19.99 < $29.99 && "Save 33%!" & more...';
        testDiv.innerText = specialText;
        
        // Get innerText back - should be the same
        const result = testDiv.innerText;
        assert.equal(result, specialText, 'innerText should preserve special characters');
        
        // Check that innerHTML contains properly escaped entities
        const innerHTML = testDiv.innerHTML;
        assert.ok(innerHTML.includes('&lt;'), 'Should escape < to &lt;');
        assert.ok(innerHTML.includes('&amp;&amp;'), 'Should escape && to &amp;&amp;');
        assert.ok(innerHTML.includes('&quot;'), 'Should escape quotes to &quot;');
        
        console.log('✅ Special characters in innerText work correctly');
    });

    test('should handle mixed content with entities', () => {
        const parser = new DomParser('<html><body><div id="test"></div></body></html>');
        const document = parser.document;
        
        const testDiv = document.querySelector('#test');
        assert.ok(testDiv, 'Test div should exist');
        
        // Set content with mixed entities and special chars
        const mixedContent = 'Template: ${variable} & <component attr="value">content</component>';
        testDiv.textContent = mixedContent;
        
        // Get textContent back
        const result = testDiv.textContent;
        assert.equal(result, mixedContent, 'textContent should preserve all characters');
        
        // Check innerHTML escaping
        const innerHTML = testDiv.innerHTML;
        assert.ok(innerHTML.includes('&amp;'), 'Should escape ampersand');
        assert.ok(innerHTML.includes('&lt;component'), 'Should escape opening tag');
        assert.ok(innerHTML.includes('&lt;/component&gt;'), 'Should escape closing tag');
        assert.ok(innerHTML.includes('&quot;value&quot;'), 'Should escape attribute quotes');
        
        console.log('✅ Mixed content with entities works correctly');
    });

    test('should handle Unicode characters in text content', () => {
        const parser = new DomParser('<html><body><div id="test"></div></body></html>');
        const document = parser.document;
        
        const testDiv = document.querySelector('#test');
        assert.ok(testDiv, 'Test div should exist');
        
        // Set content with Unicode characters
        const unicodeContent = '🚀 Rocket & 中文 < English > العربية "test"';
        testDiv.innerText = unicodeContent;
        
        // Get innerText back
        const result = testDiv.innerText;
        assert.equal(result, unicodeContent, 'innerText should preserve Unicode characters');
        
        // Check that only HTML-specific characters are escaped
        const innerHTML = testDiv.innerHTML;
        assert.ok(innerHTML.includes('🚀'), 'Should preserve emoji');
        assert.ok(innerHTML.includes('中文'), 'Should preserve Chinese characters');
        assert.ok(innerHTML.includes('العربية'), 'Should preserve Arabic characters');
        assert.ok(innerHTML.includes('&amp;'), 'Should escape ampersand');
        assert.ok(innerHTML.includes('&lt;'), 'Should escape less than');
        assert.ok(innerHTML.includes('&gt;'), 'Should escape greater than');
        assert.ok(innerHTML.includes('&quot;'), 'Should escape quotes');
        
        console.log('✅ Unicode characters in text content work correctly');
    });

    test('should handle empty and whitespace content', () => {
        const parser = new DomParser('<html><body><div id="test"></div></body></html>');
        const document = parser.document;
        
        const testDiv = document.querySelector('#test');
        assert.ok(testDiv, 'Test div should exist');
        
        // Test empty string
        testDiv.innerText = '';
        assert.equal(testDiv.innerText, '', 'Empty innerText should work');
        assert.equal(testDiv.innerHTML, '', 'Empty innerHTML should work');
        
        // Test whitespace
        testDiv.textContent = '   \n\t   ';
        assert.equal(testDiv.textContent, '   \n\t   ', 'Whitespace should be preserved');
        
        // Test null/undefined handling
        testDiv.innerText = null as any;
        assert.equal(testDiv.innerText, 'null', 'null should be converted to string');
        
        testDiv.textContent = undefined as any;
        assert.equal(testDiv.textContent, 'undefined', 'undefined should be converted to string');
        
        console.log('✅ Empty and whitespace content handling works correctly');
    });
});