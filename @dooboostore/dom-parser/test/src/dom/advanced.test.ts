import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { DomParser } from '@dooboostore/dom-parser';

console.log('🚀 Advanced DOM Features Tests Starting...');

describe('Advanced DOM Features', () => {
    test('should support element.closest()', () => {
        const parser = new DomParser(`
            <div class="container">
                <section class="content">
                    <p class="text">Find my container</p>
                </section>
            </div>
        `);
        const document = parser.document;

        const p = document.querySelector('.text');
        const container = p.closest('.container');

        assert.ok(container, 'Should find closest container');
        assert.equal(container.className, 'container', 'Should find correct container');

        console.log('✅ element.closest() works');
    });

    test('should support element.matches()', () => {
        const parser = new DomParser('<div class="test" id="example">Test element</div>');
        const document = parser.document;

        const div = document.querySelector('div');

        assert.ok(div.matches('.test'), 'Should match class selector');
        assert.ok(div.matches('#example'), 'Should match ID selector');
        assert.ok(div.matches('div'), 'Should match tag selector');
        assert.ok(!div.matches('.nonexistent'), 'Should not match non-existent class');

        console.log('✅ element.matches() works');
    });

    test('should support classList manipulation', () => {
        const parser = new DomParser('<div class="initial"></div>');
        const document = parser.document;

        const div = document.querySelector('div');
        const classList = div.classList;

        assert.ok(classList.contains('initial'), 'Should contain initial class');

        classList.add('new-class');
        assert.ok(classList.contains('new-class'), 'Should contain added class');

        classList.remove('initial');
        assert.ok(!classList.contains('initial'), 'Should not contain removed class');

        classList.toggle('toggle-class');
        assert.ok(classList.contains('toggle-class'), 'Should contain toggled class');

        classList.toggle('toggle-class');
        assert.ok(!classList.contains('toggle-class'), 'Should not contain toggled class after second toggle');

        console.log('✅ classList manipulation works');
    });
});

describe('Element Containment and Relationships', () => {
    test('should support element.contains()', () => {
        const parser = new DomParser(`
            <div id="parent">
                <div id="child">
                    <span id="grandchild">Text</span>
                </div>
            </div>
            <div id="sibling">Sibling</div>
        `);
        const document = parser.document;

        const parent = document.querySelector('#parent');
        const child = document.querySelector('#child');
        const grandchild = document.querySelector('#grandchild');
        const sibling = document.querySelector('#sibling');

        assert.ok(parent.contains(child), 'Parent should contain direct child');
        assert.ok(parent.contains(grandchild), 'Parent should contain grandchild');
        assert.ok(child.contains(grandchild), 'Child should contain grandchild');
        assert.ok(!parent.contains(sibling), 'Parent should not contain sibling');
        assert.ok(!child.contains(parent), 'Child should not contain parent');
        assert.ok(parent.contains(parent), 'Element should contain itself');

        console.log('✅ element.contains() works');
    });
});

describe('Additional DOM Methods', () => {
    test('should support hasChildNodes()', () => {
        const parser = new DomParser(`
            <div id="empty"></div>
            <div id="with-children"><span>Child</span></div>
        `);
        const document = parser.document;

        const empty = document.querySelector('#empty');
        const withChildren = document.querySelector('#with-children');

        assert.ok(!empty.hasChildNodes(), 'Empty element should not have child nodes');
        assert.ok(withChildren.hasChildNodes(), 'Element with children should have child nodes');

        console.log('✅ hasChildNodes() works');
    });

    test('should support compareDocumentPosition()', () => {
        const parser = new DomParser(`
            <div id="parent">
                <span id="first">First</span>
                <p id="second">Second</p>
            </div>
        `);
        const document = parser.document;

        const first = document.querySelector('#first');
        const second = document.querySelector('#second');

        // Test basic position relationships
        const position = first.compareDocumentPosition(second);
        assert.ok(position & (parser.window.Node as Node).DOCUMENT_POSITION_FOLLOWING, 'Second should follow first');

        console.log('✅ compareDocumentPosition() works');
    });
});