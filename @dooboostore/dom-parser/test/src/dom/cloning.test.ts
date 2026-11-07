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
            assert.equal(error.name, 'NotFoundError', 'Should be a NotFoundError like browsers');
        }
        
        assert.ok(errorThrown, 'Should throw error when trying to remove non-child');
        
        // Check that nothing was actually removed
        assert.equal(parent.children.length, 1, 'Parent should still have its child');
        assert.ok(document.querySelector('#orphan'), 'Orphan should still exist');
        
        console.log('✅ removeChild() error handling works');
    });

    test('insertBefore validates before mutating (cheerio#5654 class)', () => {
        const parser = new DomParser('<html><body><main><span>source</span><b>x</b></main></body></html>');
        const document = parser.document;

        const main = document.querySelector('main');
        const span = document.querySelector('span');

        // null reference appends (matches browsers)
        main.insertBefore(span, null);
        assert.equal(main.innerHTML, '<b>x</b><span>source</span>');

        // invalid reference throws NotFoundError and keeps the source (matches browsers)
        const other = document.createElement('i');
        let thrown = null;
        try {
            main.insertBefore(span, other);
        } catch (error) {
            thrown = error;
        }
        assert.ok(thrown, 'Should throw for a non-child reference');
        assert.equal(thrown.name, 'NotFoundError', 'Should be a NotFoundError like browsers');
        assert.equal(main.innerHTML, '<b>x</b><span>source</span>', 'Source must survive the failed insert');

        console.log('✅ insertBefore() validates before mutating');

        const doc2 = new DomParser('<html><body><div id="a"><span id="s">x</span></div></body></html>').document as any;
        const a = doc2.getElementById('a');
        const s = doc2.getElementById('s');

        // Self-insertion must throw HierarchyRequestError, not hang or corrupt.
        assert.throws(() => a.appendChild(a), /HierarchyRequestError/);
        assert.equal(doc2.querySelectorAll('span').length, 1, 'tree intact after self-insert attempt');

        // Inserting an ancestor into its descendant must throw as well.
        assert.throws(() => s.appendChild(a), /HierarchyRequestError/);
        assert.equal(doc2.querySelectorAll('span').length, 1, 'tree intact after ancestor-insert attempt');

        // A fragment containing an ancestor of the target is the same cycle.
        const doc3 = new DomParser('<html><body><div id="o"><div id="p"><span>x</span></div></div></body></html>').document as any;
        const o3 = doc3.getElementById('o');
        const p3 = doc3.getElementById('p');
        const frag3 = doc3.createDocumentFragment();
        frag3.appendChild(o3); // whole subtree (o > p) moves into the fragment
        assert.throws(() => p3.appendChild(frag3), /HierarchyRequestError/);
        assert.equal(frag3.querySelectorAll('span').length, 1, 'fragment untouched by failed insert');

        // Normal fragment insertion still works.
        const frag2 = doc2.createDocumentFragment();
        const b = doc2.createElement('b');
        b.textContent = 'B';
        frag2.appendChild(b);
        a.appendChild(frag2);
        assert.equal(a.querySelectorAll('b').length, 1, 'fragment children move normally');

        console.log('✅ appendChild() rejects cycles with HierarchyRequestError');
    });
});