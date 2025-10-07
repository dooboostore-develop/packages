import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { DomParser } from '@dooboostore/dom-parser';

console.log('🚀 Node Cloning Tests Starting...');

describe('Node Cloning and Copying', () => {
    test('should support cloneNode(false) - shallow clone', () => {
        const parser = new DomParser(`
            <div id="original" class="test">
                <span>Child content</span>
                <p>Another child</p>
            </div>
        `);
        const document = parser.document;

        const original = document.querySelector('#original');
        const clone = original.cloneNode(false);

        assert.ok(clone, 'Clone should exist');
        assert.equal(clone.tagName, 'DIV', 'Clone should have same tag name');
        assert.equal(clone.id, 'original', 'Clone should have same ID');
        assert.equal(clone.className, 'test', 'Clone should have same class');
        assert.equal(clone.children.length, 0, 'Shallow clone should have no children');

        console.log('✅ cloneNode(false) works');
    });

    test('should support cloneNode(true) - deep clone', () => {
        const parser = new DomParser(`
            <div id="original" class="test">
                <span>Child content</span>
                <p>Another child</p>
            </div>
        `);
        const document = parser.document;

        const original = document.querySelector('#original');
        const clone = original.cloneNode(true);

        assert.ok(clone, 'Clone should exist');
        assert.equal(clone.tagName, 'DIV', 'Clone should have same tag name');
        assert.equal(clone.id, 'original', 'Clone should have same ID');
        assert.equal(clone.className, 'test', 'Clone should have same class');
        assert.equal(clone.children.length, 2, 'Deep clone should have same number of children');

        const clonedSpan = clone.querySelector('span');
        assert.ok(clonedSpan, 'Cloned span should exist');
        assert.equal(clonedSpan.textContent, 'Child content', 'Cloned span should have same content');

        console.log('✅ cloneNode(true) works');
    });

    test('should support remove() - element removal', () => {
        const parser = new DomParser(`
            <div id="container">
                <span id="child1">First child</span>
                <p id="child2">Second child</p>
                <div id="child3">Third child</div>
            </div>
        `);
        const document = parser.document;
        
        const container = document.querySelector('#container');
        const child2 = document.querySelector('#child2');
        
        // Check initial state
        assert.equal(container.children.length, 3, 'Container should have 3 children initially');
        assert.ok(child2, 'Child2 should exist');
        assert.equal(child2.parentNode, container, 'Child2 parent should be container');
        
        // Remove the element
        child2.remove();
        
        // Check after removal
        assert.equal(container.children.length, 2, 'Container should have 2 children after removal');
        assert.equal(child2.parentNode, null, 'Child2 should have no parent after removal');
        assert.equal(document.querySelector('#child2'), null, 'Child2 should not be found in document');
        
        // Check remaining children are still there
        assert.ok(document.querySelector('#child1'), 'Child1 should still exist');
        assert.ok(document.querySelector('#child3'), 'Child3 should still exist');
        
        console.log('✅ remove() works');
    });

    test('should support removeChild() - parent removes child', () => {
        const parser = new DomParser(`
            <ul id="list">
                <li id="item1">Item 1</li>
                <li id="item2">Item 2</li>
                <li id="item3">Item 3</li>
            </ul>
        `);
        const document = parser.document;
        
        const list = document.querySelector('#list');
        const item2 = document.querySelector('#item2');
        
        // Check initial state
        assert.equal(list.children.length, 3, 'List should have 3 items initially');
        assert.ok(item2, 'Item2 should exist');
        
        // Remove child using parent
        const removedChild = list.removeChild(item2);
        
        // Check return value
        assert.equal(removedChild, item2, 'removeChild should return the removed element');
        
        // Check after removal
        assert.equal(list.children.length, 2, 'List should have 2 items after removal');
        assert.equal(item2.parentNode, null, 'Item2 should have no parent after removal');
        assert.equal(document.querySelector('#item2'), null, 'Item2 should not be found in document');
        
        // Check remaining items
        assert.ok(document.querySelector('#item1'), 'Item1 should still exist');
        assert.ok(document.querySelector('#item3'), 'Item3 should still exist');
        
        console.log('✅ removeChild() works');
    });

    test('should handle removing non-existent child', () => {
        const parser = new DomParser(`
            <div id="parent">
                <span id="child">Child</span>
            </div>
            <div id="other">
                <p id="orphan">Orphan</p>
            </div>
        `);
        const document = parser.document;
        
        const parent = document.querySelector('#parent');
        const orphan = document.querySelector('#orphan');
        
        // Try to remove a child that doesn't belong to this parent
        let errorThrown = false;
        try {
            parent.removeChild(orphan);
        } catch (error) {
            errorThrown = true;
            assert.ok(error.message.includes('Node not found'), 'Should throw appropriate error message');
        }
        
        assert.ok(errorThrown, 'Should throw error when trying to remove non-child');
        
        // Check that nothing was actually removed
        assert.equal(parent.children.length, 1, 'Parent should still have its child');
        assert.ok(document.querySelector('#orphan'), 'Orphan should still exist');
        
        console.log('✅ removeChild() error handling works');
    });
});