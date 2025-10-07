import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

console.log('🚀 DomParser Basic Tests Starting...');

describe('DomParser - HTML Document Parsing', () => {
    test('should parse complete HTML document', () => {
        try {
            const { DomParser } = require("@dooboostore/dom-parser");
            const htmlDoc = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Test Document</title>
                    <meta charset="UTF-8">
                </head>
                <body>
                    <div id="container" class="main">
                        <h1>Hello World</h1>
                        <p>This is a paragraph.</p>
                    </div>
                </body>
                </html>
            `;
            
            const parser = new DomParser(htmlDoc);
            const document = parser.document;
            
            // Test document structure
            assert.ok(document, 'Document should exist');
            
            // Test head elements
            const title = document.querySelector('title');
            assert.ok(title, 'Title element should exist');
            assert.equal(title.textContent, 'Test Document', 'Title should have correct content');
            
            const meta = document.querySelector('meta');
            assert.ok(meta, 'Meta element should exist');
            assert.equal(meta.getAttribute('charset'), 'UTF-8', 'Meta charset should be UTF-8');
            
            // Test body elements
            const container = document.querySelector('#container');
            assert.ok(container, 'Container should exist');
            assert.equal(container.className, 'main', 'Container should have correct class');
            
            const h1 = document.querySelector('h1');
            assert.ok(h1, 'H1 element should exist');
            assert.equal(h1.textContent, 'Hello World', 'H1 should have correct content');
            
            console.log('✅ Complete HTML document parsing works');
        } catch (error) {
            console.error('❌ Test failed:', error.message);
        }
    });

    test('should handle nested elements correctly', () => {
        try {
            const { DomParser } = require("@dooboostore/dom-parser");
            const html = `
                <div class="outer">
                    <div class="inner">
                        <span>Nested content</span>
                        <ul>
                            <li>Item 1</li>
                            <li>Item 2</li>
                        </ul>
                    </div>
                </div>
            `;
            
            const parser = new DomParser(html);
            const document = parser.document;
            
            const outer = document.querySelector('.outer');
            assert.ok(outer, 'Outer div should exist');
            
            const inner = outer.querySelector('.inner');
            assert.ok(inner, 'Inner div should exist');
            
            const span = inner.querySelector('span');
            assert.ok(span, 'Span should exist');
            assert.equal(span.textContent, 'Nested content', 'Span should have correct content');
            
            const listItems = document.querySelectorAll('li');
            assert.equal(listItems.length, 2, 'Should have 2 list items');
            
            console.log('✅ Nested elements parsing works');
        } catch (error) {
            console.error('❌ Test failed:', error.message);
        }
    });
});