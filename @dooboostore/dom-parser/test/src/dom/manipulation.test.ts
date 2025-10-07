import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { DomParser } from '@dooboostore/dom-parser';

console.log('🚀 DOM Manipulation Tests Starting...');

describe('DOM Manipulation - Element Insertion', () => {
    test('should support appendChild', () => {
        const parser = new DomParser('<div id="parent"></div>');
        const document = parser.document;

        const parent = document.querySelector('#parent');
        const child = document.createElement('span');
        child.textContent = 'Child element';
        child.className = 'child';

        parent.appendChild(child);

        assert.equal(parent.children.length, 1, 'Parent should have 1 child');
        assert.equal(parent.children[0].tagName, 'SPAN', 'Child should be a span');
        assert.equal(parent.children[0].textContent, 'Child element', 'Child should have correct content');

        console.log('✅ appendChild works');
    });

    test('should support insertBefore', () => {
        const parser = new DomParser('<div><span id="existing">Existing</span></div>');
        const document = parser.document;

        const parent = document.querySelector('div');
        const existing = document.querySelector('#existing');
        const newElement = document.createElement('p');
        newElement.textContent = 'New element';

        parent.insertBefore(newElement, existing);

        assert.equal(parent.children.length, 2, 'Parent should have 2 children');
        assert.equal(parent.children[0].tagName, 'P', 'First child should be P');
        assert.equal(parent.children[1].tagName, 'SPAN', 'Second child should be SPAN');

        console.log('✅ insertBefore works');
    });

    test('should support removeChild', () => {
        const parser = new DomParser('<div><span>Child 1</span><p>Child 2</p></div>');
        const document = parser.document;

        const parent = document.querySelector('div');
        const span = document.querySelector('span');

        assert.equal(parent.children.length, 2, 'Parent should initially have 2 children');

        parent.removeChild(span);

        assert.equal(parent.children.length, 1, 'Parent should have 1 child after removal');
        assert.equal(parent.children[0].tagName, 'P', 'Remaining child should be P');

        console.log('✅ removeChild works');
    });

    test('should support replaceChild', () => {
        const parser = new DomParser('<div><span>Old element</span></div>');
        const document = parser.document;

        const parent = document.querySelector('div');
        const oldElement = document.querySelector('span');
        const newElement = document.createElement('p');
        newElement.textContent = 'New element';

        parent.replaceChild(newElement, oldElement);

        assert.equal(parent.children.length, 1, 'Parent should still have 1 child');
        assert.equal(parent.children[0].tagName, 'P', 'Child should now be P');
        assert.equal(parent.children[0].textContent, 'New element', 'Child should have new content');

        console.log('✅ replaceChild works');
    });
});

describe('Modern DOM Manipulation Methods', () => {
    test('should support element.append() with multiple nodes', () => {
        const parser = new DomParser('<div id="container"></div>');
        const document = parser.document;

        const container = document.querySelector('#container');

        const span = document.createElement('span');
        span.textContent = 'Span element';

        const p = document.createElement('p');
        p.textContent = 'Paragraph element';

        // Test append with multiple elements
        container.append(span, p, 'Text node');

        assert.equal(container.children.length, 2, 'Should have 2 element children');
        assert.equal(container.childNodes.length, 3, 'Should have 3 total child nodes');

        assert.equal(container.children[0].tagName, 'SPAN', 'First child should be span');
        assert.equal(container.children[1].tagName, 'P', 'Second child should be p');

        console.log('✅ element.append() works');
    });

    test('should support element.prepend() with multiple nodes', () => {
        const parser = new DomParser('<div id="container"><span>Existing</span></div>');
        const document = parser.document;

        const container = document.querySelector('#container');

        const p = document.createElement('p');
        p.textContent = 'Prepended paragraph';

        container.prepend(p, 'Prepended text');

        assert.equal(container.children.length, 2, 'Should have 2 element children');
        assert.equal(container.children[0].tagName, 'P', 'First child should be prepended p');
        assert.equal(container.children[1].tagName, 'SPAN', 'Second child should be existing span');

        console.log('✅ element.prepend() works');
    });

    test('should support element.remove()', () => {
        const parser = new DomParser(`
            <div id="parent">
                <span id="child1">Child 1</span>
                <p id="child2">Child 2</p>
                <div id="child3">Child 3</div>
            </div>
        `);
        const document = parser.document;

        const parent = document.querySelector('#parent');
        const child2 = document.querySelector('#child2');

        assert.equal(parent.children.length, 3, 'Parent should initially have 3 children');

        child2.remove();

        assert.equal(parent.children.length, 2, 'Parent should have 2 children after removal');
        assert.equal(parent.children[0].id, 'child1', 'First child should be child1');
        assert.equal(parent.children[1].id, 'child3', 'Second child should be child3');

        console.log('✅ element.remove() works');
    });

    test('should support element.replaceWith()', () => {
        const parser = new DomParser(`
            <div id="parent">
                <span id="old">Old element</span>
            </div>
        `);
        const document = parser.document;

        const parent = document.querySelector('#parent');
        const oldElement = document.querySelector('#old');

        const newElement = document.createElement('p');
        newElement.id = 'new';
        newElement.textContent = 'New element';

        oldElement.replaceWith(newElement);

        assert.equal(parent.children.length, 1, 'Parent should still have 1 child');
        assert.equal(parent.children[0].tagName, 'P', 'Child should now be P');
        assert.equal(parent.children[0].id, 'new', 'Child should have new ID');
        assert.equal(parent.children[0].textContent, 'New element', 'Child should have new content');

        console.log('✅ element.replaceWith() works');
    });

    test('should support element.before() and element.after()', () => {
        const parser = new DomParser(`
            <div id="parent">
                <span id="middle">Middle element</span>
            </div>
        `);
        const document = parser.document;

        const parent = document.querySelector('#parent');
        const middle = document.querySelector('#middle');

        const before = document.createElement('p');
        before.textContent = 'Before element';

        const after = document.createElement('div');
        after.textContent = 'After element';

        middle.before(before);
        middle.after(after);

        assert.equal(parent.children.length, 3, 'Parent should have 3 children');
        assert.equal(parent.children[0].tagName, 'P', 'First child should be P (before)');
        assert.equal(parent.children[1].tagName, 'SPAN', 'Second child should be SPAN (middle)');
        assert.equal(parent.children[2].tagName, 'DIV', 'Third child should be DIV (after)');

        console.log('✅ element.before() and element.after() work');
    });
});