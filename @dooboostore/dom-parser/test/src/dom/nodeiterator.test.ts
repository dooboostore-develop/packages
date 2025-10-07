import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { DomParser, NodeFilter } from '@dooboostore/dom-parser';

console.log('🚀 NodeIterator Tests Starting...');

describe('NodeIterator Tests', () => {
    test('should create NodeIterator with default parameters', () => {
        const parser = new DomParser(`
            <html>
            <body>
                <div>Hello</div>
                <p>World</p>
            </body>
            </html>
        `);
        const document = parser.document;

        const iterator = document.createNodeIterator(document.body);
        
        assert.ok(iterator, 'NodeIterator should be created');
        assert.equal(iterator.root, document.body, 'Root should be document.body');
        assert.equal(iterator.whatToShow, NodeFilter.SHOW_ALL, 'Should show all nodes by default');
        assert.equal(iterator.filter, null, 'Filter should be null by default');

        console.log('✅ NodeIterator creation with defaults works');
    });

    test('should iterate through all nodes', () => {
        const parser = new DomParser(`
            <html>
            <body>
                <div>Hello</div>
                <p>World</p>
            </body>
            </html>
        `);
        const document = parser.document;
        const iterator = document.createNodeIterator(document.body);

        const nodes = [];
        let node = iterator.nextNode();
        while (node) {
            nodes.push(node);
            node = iterator.nextNode();
        }

        assert.ok(nodes.length > 0, 'Should find nodes');
        assert.equal(nodes[0], document.body, 'First node should be the root');

        console.log('✅ NodeIterator traversal works');
    });
});