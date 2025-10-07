import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { DomParser } from '../../../src/index.ts';


console.log('🚀 Append Tests Starting...');

describe('Append Tests', () => {
    test('should append single element to parent', () => {
        const parser: { window: Window, document: Document } = new DomParser('<div id="container"></div>');
        const document = parser.document;

        const container = document.querySelector('#container');
        const newElement = document.createElement('p');
        newElement.textContent = 'Appended paragraph';

        container?.append(newElement);

        assert.equal(container?.children.length, 1, 'Container should have 1 child');
        assert.equal(container?.querySelector('p')?.textContent, 'Appended paragraph', 'Paragraph should be appended');

        console.log('✅ Single element append works');
    });

    test('should append multiple elements to parent', () => {
        const parser = new DomParser('<div id="container"></div>');
        const document = parser.document;

        const container = document.querySelector('#container');
        const span = document.createElement('span');
        span.textContent = 'First';
        const div = document.createElement('div');
        div.textContent = 'Second';
        const p = document.createElement('p');
        p.textContent = 'Third';

        container.append(span, div, p);

        assert.equal(container.children.length, 3, 'Container should have 3 children');
        assert.equal(container.children[0].textContent, 'First', 'First child should be span');
        assert.equal(container.children[1].textContent, 'Second', 'Second child should be div');
        assert.equal(container.children[2].textContent, 'Third', 'Third child should be p');

        console.log('✅ Multiple elements append works');
    });

    test('should append string content as text nodes', () => {
        const parser = new DomParser('<div id="container"></div>');
        const document = parser.document;

        const container = document.querySelector('#container');

        container.append('Hello ', 'World!');

        assert.equal(container.childNodes.length, 2, 'Container should have 2 text nodes');
        assert.equal(container.textContent, 'Hello World!', 'Text content should be concatenated');

        console.log('✅ String content append works');
    });

    test('should append mixed content (elements and strings)', () => {
        const parser = new DomParser('<div id="container"></div>');
        const document = parser.document;

        const container = document.querySelector('#container');
        const strong = document.createElement('strong');
        strong.textContent = 'Bold';

        container.append('Start ', strong, ' End');

        assert.equal(container.childNodes.length, 3, 'Container should have 3 nodes');
        assert.equal(container.textContent, 'Start Bold End', 'Mixed content should be correct');
        assert.equal(container.querySelector('strong').textContent, 'Bold', 'Strong element should be preserved');

        console.log('✅ Mixed content append works');
    });

    test('should append DocumentFragment content', () => {
        const parser = new DomParser('<div id="container"></div>');
        const document = parser.document;

        const container = document.querySelector('#container');
        const fragment = document.createDocumentFragment();

        const h1 = document.createElement('h1');
        h1.textContent = 'Fragment Title';
        const p = document.createElement('p');
        p.textContent = 'Fragment content';

        fragment.appendChild(h1);
        fragment.appendChild(p);

        container.append(fragment);

        assert.equal(container.children.length, 2, 'Container should have 2 children from fragment');
        assert.equal(fragment.children.length, 0, 'Fragment should be empty after append');
        assert.equal(container.querySelector('h1').textContent, 'Fragment Title', 'H1 should be moved to container');
        assert.equal(container.querySelector('p').textContent, 'Fragment content', 'P should be moved to container');

        console.log('✅ DocumentFragment append works');
    });

    test('should append template.content to fragment', () => {
        const parser = new DomParser(`
            <template id="my-template">
                <div class="template-item">
                    <h2>Template Header</h2>
                    <p>Template paragraph</p>
                    <span class="template-meta">Meta info</span>
                </div>
            </template>
        `);
        const document = parser.document;

        const template = document.querySelector('#my-template');
        const fragment = document.createDocumentFragment();

        // This is the key test: fragment.append(template.content)
        fragment.append(template.content);

        // Verify template content was moved to fragment
        assert.equal(fragment.children.length, 1, 'Fragment should have 1 child from template');
        assert.equal(template.content.children.length, 0, 'Template content should be empty after append');

        // Verify structure is preserved
        const templateItem = fragment.querySelector('.template-item');
        assert.ok(templateItem, 'Template item should be in fragment');
        assert.equal(templateItem.querySelector('h2').textContent, 'Template Header', 'Header should be preserved');
        assert.equal(templateItem.querySelector('p').textContent, 'Template paragraph', 'Paragraph should be preserved');
        assert.equal(templateItem.querySelector('.template-meta').textContent, 'Meta info', 'Meta should be preserved');

        console.log('✅ fragment.append(template.content) works');
    });

    test('should append template.content to element', () => {
        const parser = new DomParser(`
            <div id="target"></div>
            <template id="card-template">
                <article class="card">
                    <header class="card-header">
                        <h3>Card Title</h3>
                    </header>
                    <div class="card-body">
                        <p>Card content goes here</p>
                        <button class="btn">Action</button>
                    </div>
                    <footer class="card-footer">
                        <small>Card footer</small>
                    </footer>
                </article>
            </template>
        `);
        const document = parser.document;

        const target = document.querySelector('#target');
        const template = document.querySelector('#card-template');

        // Append template content to target element
        target.append(template.content);

        // Verify template content was moved to target
        assert.equal(target.children.length, 1, 'Target should have 1 child from template');
        assert.equal(template.content.children.length, 0, 'Template content should be empty after append');

        // Verify card structure
        const card = target.querySelector('.card');
        assert.ok(card, 'Card should be in target');
        assert.equal(card.tagName, 'ARTICLE', 'Card should be article element');

        const cardHeader = card.querySelector('.card-header');
        assert.ok(cardHeader, 'Card header should exist');
        const header = cardHeader.querySelector('h3');
        assert.ok(header, 'Card header h3 should exist');
        assert.equal(header.textContent, 'Card Title', 'Card title should be correct');

        const body = card.querySelector('.card-body');
        assert.ok(body, 'Card body should exist');
        assert.equal(body.querySelector('p').textContent, 'Card content goes here', 'Card content should be correct');
        assert.equal(body.querySelector('button').textContent, 'Action', 'Card button should be correct');

        const cardFooter = card.querySelector('.card-footer');
        assert.ok(cardFooter, 'Card footer should exist');
        const footer = cardFooter.querySelector('small');
        assert.ok(footer, 'Card footer small should exist');
        assert.equal(footer.textContent, 'Card footer', 'Card footer text should be correct');

        console.log('✅ element.append(template.content) works');
    });

    test('should append cloned template.content multiple times', () => {
        const parser: { window: Window, document: Document } = new DomParser(`
            <ul id="list"></ul>
            <template id="list-item-template">
                <li class="list-item">
                    <span class="item-text">Item text</span>
                    <button class="item-action">Delete</button>
                </li>
            </template>
        `);
        const document = parser.document;

        const list = document.querySelector('#list');
        const template = document.querySelector<HTMLTemplateElement>('#list-item-template');

        // Append cloned template content multiple times
        for (let i = 1; i <= 3; i++) {
            const clone = template?.content.cloneNode(true) as Element;
            const itemText = clone?.querySelector('.item-text');
            if (itemText)
                itemText.textContent = `Item ${i}`;
            list?.append(clone);
        }

        // Verify multiple items were added
        assert.equal(list?.children.length, 3, 'List should have 3 items');
        assert.equal(template?.content.children.length, 1, 'Template content should still have original item');

        // Verify each item has correct content
        const items = list.querySelectorAll('.list-item');
        assert.equal(items.length, 3, 'Should have 3 list items');
        assert.equal(items[0]?.querySelector('.item-text').textContent, 'Item 1', 'First item should be correct');
        assert.equal(items[1]?.querySelector('.item-text').textContent, 'Item 2', 'Second item should be correct');
        assert.equal(items[2]?.querySelector('.item-text').textContent, 'Item 3', 'Third item should be correct');

        // Verify all items have action buttons
        const buttons = list.querySelectorAll('.item-action');
        assert.equal(buttons.length, 3, 'Should have 3 action buttons');
        buttons.forEach(button => {
            assert.equal(button.textContent, 'Delete', 'Each button should have Delete text');
        });

        console.log('✅ Multiple cloned template.content append works');
    });

    test('should append template.content with complex nested structure', () => {
        const parser = new DomParser(`
            <div id="app"></div>
            <template id="complex-template">
                <section class="component">
                    <header class="component-header">
                        <h1>Component Title</h1>
                        <nav class="component-nav">
                            <ul>
                                <li><a href="#tab1">Tab 1</a></li>
                                <li><a href="#tab2">Tab 2</a></li>
                            </ul>
                        </nav>
                    </header>
                    <main class="component-main">
                        <div class="tab-content" id="tab1">
                            <h2>Tab 1 Content</h2>
                            <p>This is tab 1 content</p>
                            <form class="tab-form">
                                <input type="text" name="field1" placeholder="Field 1">
                                <button type="submit">Submit</button>
                            </form>
                        </div>
                        <div class="tab-content" id="tab2" style="display:none">
                            <h2>Tab 2 Content</h2>
                            <ul class="feature-list">
                                <li>Feature A</li>
                                <li>Feature B</li>
                            </ul>
                        </div>
                    </main>
                    <footer class="component-footer">
                        <p>&copy; 2023 Component Footer</p>
                    </footer>
                </section>
            </template>
        `);
        const document = parser.document;

        const app = document.querySelector('#app');
        const template = document.querySelector('#complex-template');

        // Append complex template content
        app.append(template.content);

        // Verify top-level structure
        assert.equal(app.children.length, 1, 'App should have 1 child');
        const component = app.querySelector('.component');
        assert.ok(component, 'Component should exist');
        assert.equal(component.tagName, 'SECTION', 'Component should be section element');

        // Verify header structure
        const header = component.querySelector('.component-header');
        assert.ok(header, 'Component header should exist');
        assert.equal(header.querySelector('h1').textContent, 'Component Title', 'Header title should be correct');

        const componentNav = header.querySelector('.component-nav');
        assert.ok(componentNav, 'Component navigation should exist');
        const nav = componentNav.querySelector('ul');
        assert.ok(nav, 'Navigation ul should exist');
        const navLinks = nav.querySelectorAll('a');
        assert.equal(navLinks.length, 2, 'Should have 2 navigation links');
        assert.equal(navLinks[0].getAttribute('href'), '#tab1', 'First link should point to tab1');
        assert.equal(navLinks[1].getAttribute('href'), '#tab2', 'Second link should point to tab2');

        // Verify main content structure
        const main = component.querySelector('.component-main');
        assert.ok(main, 'Component main should exist');

        const tab1 = main.querySelector('#tab1');
        assert.ok(tab1, 'Tab 1 should exist');
        assert.equal(tab1.querySelector('h2').textContent, 'Tab 1 Content', 'Tab 1 title should be correct');
        const tabForm = tab1.querySelector('.tab-form');
        assert.ok(tabForm, 'Tab 1 form should exist');
        assert.ok(tabForm.querySelector('input[name="field1"]'), 'Tab 1 form input should exist');
        assert.equal(tab1.querySelector('button[type="submit"]').textContent, 'Submit', 'Tab 1 submit button should exist');

        const tab2 = main.querySelector('#tab2');
        assert.ok(tab2, 'Tab 2 should exist');
        assert.equal(tab2.getAttribute('style'), 'display:none', 'Tab 2 should have display:none style');
        const featureList = tab2.querySelector('.feature-list');
        assert.ok(featureList, 'Feature list should exist');
        assert.equal(featureList.children.length, 2, 'Feature list should have 2 items');

        // Verify footer
        const footer = component.querySelector('.component-footer');
        assert.ok(footer, 'Component footer should exist');
        assert.equal(footer.querySelector('p').textContent, '© 2023 Component Footer', 'Footer text should be correct');

        // Verify template is empty after append
        assert.equal(template.content.children.length, 0, 'Template content should be empty after append');

        console.log('✅ Complex nested template.content append works');
    });

    test('should append template.content with event attributes preserved', () => {
        const parser = new DomParser(`
            <div id="container"></div>
            <template id="interactive-template">
                <div class="interactive-component">
                    <button onclick="handleClick()" data-action="click">Click Me</button>
                    <input type="text" onchange="handleChange()" data-binding="value">
                    <form onsubmit="handleSubmit()" data-form="main">
                        <input type="email" required>
                        <button type="submit">Submit</button>
                    </form>
                </div>
            </template>
        `);
        const document = parser.document;

        const container = document.querySelector('#container');
        const template = document.querySelector('#interactive-template');

        // Append template with event attributes
        container.append(template.content);

        // Verify event attributes are preserved
        const component = container.querySelector('.interactive-component');
        assert.ok(component, 'Interactive component should exist');

        const button = component.querySelector('button[onclick]');
        assert.ok(button, 'Button with onclick should exist');
        assert.equal(button.getAttribute('onclick'), 'handleClick()', 'Button onclick should be preserved');
        assert.equal(button.getAttribute('data-action'), 'click', 'Button data-action should be preserved');

        const input = component.querySelector('input[onchange]');
        assert.ok(input, 'Input with onchange should exist');
        assert.equal(input.getAttribute('onchange'), 'handleChange()', 'Input onchange should be preserved');
        assert.equal(input.getAttribute('data-binding'), 'value', 'Input data-binding should be preserved');

        const form = component.querySelector('form[onsubmit]');
        assert.ok(form, 'Form with onsubmit should exist');
        assert.equal(form.getAttribute('onsubmit'), 'handleSubmit()', 'Form onsubmit should be preserved');
        assert.equal(form.getAttribute('data-form'), 'main', 'Form data-form should be preserved');

        console.log('✅ Template.content with event attributes append works');
    });

    test('should append template.content to multiple different parents', () => {
        const parser = new DomParser(`
            <div id="parent1"></div>
            <div id="parent2"></div>
            <div id="parent3"></div>
            <template id="shared-template">
                <div class="shared-component">
                    <h3>Shared Component</h3>
                    <p>This component can be used in multiple places</p>
                </div>
            </template>
        `);
        const document = parser.document;

        const parent1 = document.querySelector('#parent1');
        const parent2 = document.querySelector('#parent2');
        const parent3 = document.querySelector('#parent3');
        const template = document.querySelector('#shared-template');

        // Clone and append to different parents
        parent1.append(template.content.cloneNode(true));
        parent2.append(template.content.cloneNode(true));
        parent3.append(template.content.cloneNode(true));

        // Verify each parent has the component
        [parent1, parent2, parent3].forEach((parent, index) => {
            assert.equal(parent.children.length, 1, `Parent ${index + 1} should have 1 child`);
            const component = parent.querySelector('.shared-component');
            assert.ok(component, `Parent ${index + 1} should have shared component`);
            assert.equal(component.querySelector('h3').textContent, 'Shared Component', `Parent ${index + 1} component title should be correct`);
            assert.equal(component.querySelector('p').textContent, 'This component can be used in multiple places', `Parent ${index + 1} component text should be correct`);
        });

        // Verify template still has original content
        assert.equal(template.content.children.length, 1, 'Template should still have original content');

        console.log('✅ Template.content append to multiple parents works');
    });

    test('should handle append with empty template.content', () => {
        const parser = new DomParser(`
            <div id="container"></div>
            <template id="empty-template"></template>
        `);
        const document = parser.document;

        const container = document.querySelector('#container');
        const template = document.querySelector('#empty-template');

        // Append empty template content
        container.append(template.content);

        // Verify nothing was added
        assert.equal(container.children.length, 0, 'Container should have no children');
        assert.equal(container.childNodes.length, 0, 'Container should have no child nodes');

        console.log('✅ Empty template.content append works');
    });

    test('should append template.content with special characters and entities', () => {
        const parser = new DomParser(`
            <div id="container"></div>
            <template id="special-template">
                <div class="special-content">
                    <h2>Special &amp; Characters</h2>
                    <p>Content with &lt;entities&gt; and "quotes"</p>
                    <code>&lt;script&gt;alert('XSS');&lt;/script&gt;</code>
                    <span data-content="&quot;Hello&quot; &amp; &lt;World&gt;">Attribute entities</span>
                </div>
            </template>
        `);
        const document = parser.document;

        const container = document.querySelector('#container');
        const template = document.querySelector('#special-template');

        // Append template with special characters
        container.append(template.content);

        // Verify special characters are preserved
        const content = container.querySelector('.special-content');
        assert.ok(content, 'Special content should exist');

        const h2 = content.querySelector('h2');
        assert.ok(h2.textContent.includes('Special & Characters'), 'H2 should contain decoded entities');

        const p = content.querySelector('p');
        assert.ok(p.textContent.includes('<entities>'), 'P should contain decoded entities');
        assert.ok(p.textContent.includes('"quotes"'), 'P should contain quotes');

        const code = content.querySelector('code');
        assert.ok(code.textContent.includes('<script>'), 'Code should contain script tags');

        const span = content.querySelector('span');
        const dataContent = span.getAttribute('data-content');
        assert.ok(dataContent.includes('"Hello"'), 'Data attribute should contain quotes');
        assert.ok(dataContent.includes('&'), 'Data attribute should contain ampersand');

        console.log('✅ Template.content with special characters append works');
    });

    test('should preserve order when appending multiple template.content', () => {
        const parser = new DomParser(`
            <div id="container"></div>
            <template id="template1">
                <div class="item-1">First Template</div>
            </template>
            <template id="template2">
                <div class="item-2">Second Template</div>
            </template>
            <template id="template3">
                <div class="item-3">Third Template</div>
            </template>
        `);
        const document = parser.document;

        const container = document.querySelector('#container');
        const template1 = document.querySelector('#template1');
        const template2 = document.querySelector('#template2');
        const template3 = document.querySelector('#template3');

        // Append multiple template contents in order
        container.append(template1.content);
        container.append(template2.content);
        container.append(template3.content);

        // Verify order is preserved
        assert.equal(container.children.length, 3, 'Container should have 3 children');
        assert.equal(container.children[0].className, 'item-1', 'First child should be item-1');
        assert.equal(container.children[1].className, 'item-2', 'Second child should be item-2');
        assert.equal(container.children[2].className, 'item-3', 'Third child should be item-3');

        assert.equal(container.children[0].textContent, 'First Template', 'First child text should be correct');
        assert.equal(container.children[1].textContent, 'Second Template', 'Second child text should be correct');
        assert.equal(container.children[2].textContent, 'Third Template', 'Third child text should be correct');

        // Verify templates are empty after append
        assert.equal(template1.content.children.length, 0, 'Template 1 should be empty');
        assert.equal(template2.content.children.length, 0, 'Template 2 should be empty');
        assert.equal(template3.content.children.length, 0, 'Template 3 should be empty');

        console.log('✅ Multiple template.content append order preservation works');
    });

    test('should move element from original parent when appending', () => {
        const parser = new DomParser(`
            <div id="source">
                <p id="movable">Movable paragraph</p>
                <span>Sibling element</span>
            </div>
            <div id="target"></div>
        `);
        const document = parser.document;

        const source = document.querySelector('#source');
        const target = document.querySelector('#target');
        const movableElement = document.querySelector('#movable');

        // Verify initial state
        assert.equal(source.children.length, 2, 'Source should initially have 2 children');
        assert.equal(target.children.length, 0, 'Target should initially have 0 children');
        assert.equal(movableElement.parentNode, source, 'Movable element should initially be in source');

        // Append element to target (should move from source)
        target.append(movableElement);

        // Verify element moved from source to target
        assert.equal(source.children.length, 1, 'Source should now have 1 child (element removed)');
        assert.equal(target.children.length, 1, 'Target should now have 1 child (element added)');
        assert.equal(movableElement.parentNode, target, 'Movable element should now be in target');
        assert.equal(target.querySelector('#movable'), movableElement, 'Element should be accessible in target');
        assert.equal(source.querySelector('#movable'), null, 'Element should no longer be in source');

        // Verify remaining sibling is still in source
        assert.equal(source.querySelector('span').textContent, 'Sibling element', 'Sibling should remain in source');

        console.log('✅ Element movement from original parent works');
    });

    test('should move element between multiple parents using appendChild', () => {
        const parser = new DomParser(`
            <div id="parent1">
                <h1 id="title">Moving Title</h1>
                <p>Static content 1</p>
            </div>
            <div id="parent2">
                <p>Static content 2</p>
            </div>
            <div id="parent3">
                <p>Static content 3</p>
            </div>
        `);
        const document = parser.document;

        const parent1 = document.querySelector('#parent1');
        const parent2 = document.querySelector('#parent2');
        const parent3 = document.querySelector('#parent3');
        const title = document.querySelector('#title');

        // Initial state verification
        assert.equal(parent1.children.length, 2, 'Parent1 should have 2 children initially');
        assert.equal(parent2.children.length, 1, 'Parent2 should have 1 child initially');
        assert.equal(parent3.children.length, 1, 'Parent3 should have 1 child initially');
        assert.equal(title.parentNode, parent1, 'Title should be in parent1 initially');

        // Move from parent1 to parent2
        parent2.appendChild(title);

        assert.equal(parent1.children.length, 1, 'Parent1 should have 1 child after move');
        assert.equal(parent2.children.length, 2, 'Parent2 should have 2 children after move');
        assert.equal(title.parentNode, parent2, 'Title should be in parent2 after first move');
        assert.equal(parent1.querySelector('#title'), null, 'Title should not be in parent1');
        assert.equal(parent2.querySelector('#title'), title, 'Title should be in parent2');

        // Move from parent2 to parent3
        parent3.appendChild(title);

        assert.equal(parent1.children.length, 1, 'Parent1 should still have 1 child');
        assert.equal(parent2.children.length, 1, 'Parent2 should have 1 child after second move');
        assert.equal(parent3.children.length, 2, 'Parent3 should have 2 children after move');
        assert.equal(title.parentNode, parent3, 'Title should be in parent3 after second move');
        assert.equal(parent2.querySelector('#title'), null, 'Title should not be in parent2');
        assert.equal(parent3.querySelector('#title'), title, 'Title should be in parent3');

        // Move back to parent1
        parent1.appendChild(title);

        assert.equal(parent1.children.length, 2, 'Parent1 should have 2 children after return');
        assert.equal(parent2.children.length, 1, 'Parent2 should have 1 child');
        assert.equal(parent3.children.length, 1, 'Parent3 should have 1 child after title leaves');
        assert.equal(title.parentNode, parent1, 'Title should be back in parent1');

        console.log('✅ Element movement between multiple parents works');
    });

    test('should move multiple elements and preserve order', () => {
        const parser = new DomParser(`
            <div id="source">
                <div id="item1">Item 1</div>
                <div id="item2">Item 2</div>
                <div id="item3">Item 3</div>
                <div id="static">Static item</div>
            </div>
            <div id="target"></div>
        `);
        const document = parser.document;

        const source = document.querySelector('#source');
        const target = document.querySelector('#target');
        const item1 = document.querySelector('#item1');
        const item2 = document.querySelector('#item2');
        const item3 = document.querySelector('#item3');

        // Initial state
        assert.equal(source.children.length, 4, 'Source should have 4 children initially');
        assert.equal(target.children.length, 0, 'Target should have 0 children initially');

        // Move elements one by one (should preserve order)
        target.append(item1, item2, item3);

        // Verify elements moved and order preserved
        assert.equal(source.children.length, 1, 'Source should have 1 child after move (only static)');
        assert.equal(target.children.length, 3, 'Target should have 3 children after move');
        assert.equal(source.querySelector('#static').textContent, 'Static item', 'Static item should remain in source');

        // Verify order in target
        assert.equal(target.children[0].id, 'item1', 'First child should be item1');
        assert.equal(target.children[1].id, 'item2', 'Second child should be item2');
        assert.equal(target.children[2].id, 'item3', 'Third child should be item3');

        // Verify elements are no longer in source
        assert.equal(source.querySelector('#item1'), null, 'Item1 should not be in source');
        assert.equal(source.querySelector('#item2'), null, 'Item2 should not be in source');
        assert.equal(source.querySelector('#item3'), null, 'Item3 should not be in source');

        console.log('✅ Multiple element movement with order preservation works');
    });

    test('should handle moving element to same parent (reordering)', () => {
        const parser = new DomParser(`
            <div id="container">
                <div id="first">First</div>
                <div id="second">Second</div>
                <div id="third">Third</div>
            </div>
        `);
        const document = parser.document;

        const container = document.querySelector('#container');
        const first = document.querySelector('#first');
        const second = document.querySelector('#second');
        const third = document.querySelector('#third');

        // Initial order: first, second, third
        assert.equal(container.children.length, 3, 'Container should have 3 children');
        assert.equal(container.children[0].id, 'first', 'First position should be first');
        assert.equal(container.children[1].id, 'second', 'Second position should be second');
        assert.equal(container.children[2].id, 'third', 'Third position should be third');

        // Move first element to end
        container.appendChild(first);

        // New order: second, third, first
        assert.equal(container.children.length, 3, 'Container should still have 3 children');
        assert.equal(container.children[0].id, 'second', 'First position should now be second');
        assert.equal(container.children[1].id, 'third', 'Second position should now be third');
        assert.equal(container.children[2].id, 'first', 'Third position should now be first');

        // Move third element to beginning using insertBefore
        container.insertBefore(third, second);

        // New order: third, second, first
        assert.equal(container.children[0].id, 'third', 'First position should now be third');
        assert.equal(container.children[1].id, 'second', 'Second position should now be second');
        assert.equal(container.children[2].id, 'first', 'Third position should still be first');

        console.log('✅ Element reordering within same parent works');
    });

    test('should move DocumentFragment children and empty fragment', () => {
        const parser = new DomParser(`
            <div id="target"></div>
        `);
        const document = parser.document;

        const target = document.querySelector('#target');
        const fragment = document.createDocumentFragment();

        // Add elements to fragment
        const div1 = document.createElement('div');
        div1.textContent = 'Fragment child 1';
        const div2 = document.createElement('div');
        div2.textContent = 'Fragment child 2';
        const div3 = document.createElement('div');
        div3.textContent = 'Fragment child 3';

        fragment.appendChild(div1);
        fragment.appendChild(div2);
        fragment.appendChild(div3);

        // Verify fragment has children
        assert.equal(fragment.children.length, 3, 'Fragment should have 3 children before append');

        // Append fragment to target (should move all children and empty fragment)
        target.appendChild(fragment);

        // Verify children moved to target and fragment is empty
        assert.equal(target.children.length, 3, 'Target should have 3 children after append');
        assert.equal(fragment.children.length, 0, 'Fragment should be empty after append');

        // Verify content moved correctly
        assert.equal(target.children[0].textContent, 'Fragment child 1', 'First child should be correct');
        assert.equal(target.children[1].textContent, 'Fragment child 2', 'Second child should be correct');
        assert.equal(target.children[2].textContent, 'Fragment child 3', 'Third child should be correct');

        console.log('✅ DocumentFragment children movement works');
    });

    test('should move template.content and empty template', () => {
        const parser = new DomParser(`
            <div id="target"></div>
            <template id="source-template">
                <div class="template-item">
                    <h2>Template Header</h2>
                    <p>Template content</p>
                    <button>Template button</button>
                </div>
                <div class="template-footer">
                    <small>Template footer</small>
                </div>
            </template>
        `);
        const document = parser.document;

        const target = document.querySelector('#target');
        const template = document.querySelector('#source-template');

        // Verify template has content initially
        assert.equal(template.content.children.length, 2, 'Template should have 2 children initially');

        // Move template.content to target (should empty template)
        target.appendChild(template.content);

        // Verify content moved to target and template is empty
        assert.equal(target.children.length, 2, 'Target should have 2 children after append');
        assert.equal(template.content.children.length, 0, 'Template content should be empty after append');

        // Verify structure moved correctly
        const templateItem = target.querySelector('.template-item');
        assert.ok(templateItem, 'Template item should be in target');
        assert.equal(templateItem.querySelector('h2').textContent, 'Template Header', 'Header should be preserved');
        assert.equal(templateItem.querySelector('p').textContent, 'Template content', 'Content should be preserved');
        assert.equal(templateItem.querySelector('button').textContent, 'Template button', 'Button should be preserved');

        const templateFooter = target.querySelector('.template-footer');
        assert.ok(templateFooter, 'Template footer should be in target');
        assert.equal(templateFooter.querySelector('small').textContent, 'Template footer', 'Footer text should be preserved');

        console.log('✅ Template content movement and emptying works');
    });

    test('should handle complex nested element movement', () => {
        const parser = new DomParser(`
            <div id="source">
                <div id="complex-item">
                    <h1>Title</h1>
                    <div class="content">
                        <p>Content paragraph</p>
                        <ul>
                            <li>Item 1</li>
                            <li>Item 2</li>
                        </ul>
                    </div>
                </div>
                <div id="static">Static content</div>
            </div>
            <div id="target"></div>
        `);
        const document = parser.document;

        const source = document.querySelector('#source');
        const target = document.querySelector('#target');
        const complexItem = document.querySelector('#complex-item');

        // Verify initial state
        assert.equal(source.children.length, 2, 'Source should have 2 children initially');
        assert.equal(target.children.length, 0, 'Target should have 0 children initially');
        assert.equal(complexItem.parentNode, source, 'Complex item should be in source');

        // Verify nested structure exists before move
        assert.ok(complexItem.querySelector('h1'), 'H1 should exist');
        assert.ok(complexItem.querySelector('.content'), 'Content div should exist');
        assert.ok(complexItem.querySelector('p'), 'Paragraph should exist');
        assert.ok(complexItem.querySelector('ul'), 'List should exist');
        assert.equal(complexItem.querySelectorAll('li').length, 2, 'Should have 2 list items');

        // Move complex nested element
        target.appendChild(complexItem);

        // Verify movement
        assert.equal(source.children.length, 1, 'Source should have 1 child after move');
        assert.equal(target.children.length, 1, 'Target should have 1 child after move');
        assert.equal(complexItem.parentNode, target, 'Complex item should be in target');
        assert.equal(source.querySelector('#complex-item'), null, 'Complex item should not be in source');
        assert.equal(target.querySelector('#complex-item'), complexItem, 'Complex item should be in target');

        // Verify nested structure preserved after move
        const movedItem = target.querySelector('#complex-item');
        assert.ok(movedItem, 'Moved item should be accessible');
        assert.equal(movedItem.querySelector('h1').textContent, 'Title', 'Title should be preserved');
        assert.ok(movedItem.querySelector('.content'), 'Content div should be preserved');
        assert.equal(movedItem.querySelector('p').textContent, 'Content paragraph', 'Paragraph should be preserved');
        assert.ok(movedItem.querySelector('ul'), 'List should be preserved');
        assert.equal(movedItem.querySelectorAll('li').length, 2, 'List items should be preserved');
        assert.equal(movedItem.querySelectorAll('li')[0].textContent, 'Item 1', 'First item should be preserved');
        assert.equal(movedItem.querySelectorAll('li')[1].textContent, 'Item 2', 'Second item should be preserved');

        // Verify static content remains in source
        assert.equal(source.querySelector('#static').textContent, 'Static content', 'Static content should remain in source');

        console.log('✅ Complex nested element movement works');
    });

    test('should move elements with event attributes and preserve them', () => {
        const parser = new DomParser(`
            <div id="source">
                <div class="interactive-element" 
                     onclick="handleClick(event)" 
                     onmouseover="handleHover(this)" 
                     data-action="interactive">
                    <button onclick="buttonClick()" data-btn="primary">Click Me</button>
                    <input type="text" onchange="inputChange(this.value)" data-field="input1">
                    <form onsubmit="formSubmit(event)" data-form="main">
                        <input type="email" required>
                        <button type="submit" onclick="submitClick()">Submit</button>
                    </form>
                </div>
                <div class="static">Static element</div>
            </div>
            <div id="target"></div>
        `);
        const document = parser.document;

        const source = document.querySelector('#source');
        const target = document.querySelector('#target');
        const interactiveElement = source.querySelector('.interactive-element');

        // Verify initial state
        assert.equal(source.children.length, 2, 'Source should have 2 children initially');
        assert.equal(target.children.length, 0, 'Target should have 0 children initially');

        // Move element with event attributes
        target.appendChild(interactiveElement);

        // Verify element moved
        assert.equal(source.children.length, 1, 'Source should have 1 child after move');
        assert.equal(target.children.length, 1, 'Target should have 1 child after move');
        assert.equal(source.querySelector('.interactive-element'), null, 'Interactive element should not be in source');

        // Verify all event attributes preserved
        const movedElement = target.querySelector('.interactive-element');
        assert.ok(movedElement, 'Interactive element should be in target');
        assert.equal(movedElement.getAttribute('onclick'), 'handleClick(event)', 'Main onclick should be preserved');
        assert.equal(movedElement.getAttribute('onmouseover'), 'handleHover(this)', 'Onmouseover should be preserved');
        assert.equal(movedElement.getAttribute('data-action'), 'interactive', 'Data action should be preserved');

        // Verify nested element event attributes
        const button = movedElement.querySelector('button[onclick]');
        assert.ok(button, 'Button with onclick should exist');
        assert.equal(button.getAttribute('onclick'), 'buttonClick()', 'Button onclick should be preserved');
        assert.equal(button.getAttribute('data-btn'), 'primary', 'Button data attribute should be preserved');

        const input = movedElement.querySelector('input[onchange]');
        assert.ok(input, 'Input with onchange should exist');
        assert.equal(input.getAttribute('onchange'), 'inputChange(this.value)', 'Input onchange should be preserved');
        assert.equal(input.getAttribute('data-field'), 'input1', 'Input data attribute should be preserved');

        const form = movedElement.querySelector('form[onsubmit]');
        assert.ok(form, 'Form with onsubmit should exist');
        assert.equal(form.getAttribute('onsubmit'), 'formSubmit(event)', 'Form onsubmit should be preserved');
        assert.equal(form.getAttribute('data-form'), 'main', 'Form data attribute should be preserved');

        const submitButton = form.querySelector('button[type="submit"]');
        assert.ok(submitButton, 'Submit button should exist');
        assert.equal(submitButton.getAttribute('onclick'), 'submitClick()', 'Submit button onclick should be preserved');

        // Verify static element remained in source
        assert.equal(source.querySelector('.static').textContent, 'Static element', 'Static element should remain in source');

        console.log('✅ Element movement with event attributes preservation works');
    });

    // 새로운 fragment.append(template.content) 전용 테스트 추가
    test('should handle fragment.append(template.content) with complex structure', () => {
        const parser = new DomParser(`
            <template id="complex-template">
                <div class="card">
                    <header class="card-header">
                        <h2>Card Title</h2>
                        <button class="close-btn" onclick="closeCard()">×</button>
                    </header>
                    <div class="card-body">
                        <p>Card content with <strong>important</strong> information.</p>
                        <ul class="card-list">
                            <li>Item 1</li>
                            <li>Item 2</li>
                            <li>Item 3</li>
                        </ul>
                        <form class="card-form">
                            <input type="text" name="cardInput" placeholder="Enter data">
                            <button type="submit">Save</button>
                        </form>
                    </div>
                    <footer class="card-footer">
                        <small>Last updated: <time datetime="2023-01-01">Jan 1, 2023</time></small>
                    </footer>
                </div>
            </template>
        `);
        const document = parser.document;

        const template = document.querySelector('#complex-template');
        const fragment = document.createDocumentFragment();

        // Verify initial state
        assert.equal(template.content.children.length, 1, 'Template should have 1 child initially');
        assert.equal(fragment.children.length, 0, 'Fragment should be empty initially');

        // This is the key test: fragment.append(template.content)
        fragment.append(template.content);

        // Verify template content moved to fragment and template is empty
        assert.equal(fragment.children.length, 1, 'Fragment should have 1 child after append');
        assert.equal(template.content.children.length, 0, 'Template content should be empty after append');

        // Verify complete structure preserved in fragment
        const card = fragment.querySelector('.card');
        assert.ok(card, 'Card should be in fragment');

        // Verify header structure
        const header = card.querySelector('.card-header');
        assert.ok(header, 'Card header should exist');
        assert.equal(header.querySelector('h2').textContent, 'Card Title', 'Card title should be preserved');
        const closeBtn = header.querySelector('.close-btn');
        assert.ok(closeBtn, 'Close button should exist');
        assert.equal(closeBtn.getAttribute('onclick'), 'closeCard()', 'Close button onclick should be preserved');

        // Verify body structure
        const body = card.querySelector('.card-body');
        assert.ok(body, 'Card body should exist');
        assert.ok(body.querySelector('strong'), 'Strong element should be preserved');

        const list = body.querySelector('.card-list');
        assert.ok(list, 'Card list should exist');
        assert.equal(list.children.length, 3, 'List should have 3 items');
        assert.equal(list.children[0].textContent, 'Item 1', 'First list item should be correct');

        const form = body.querySelector('.card-form');
        assert.ok(form, 'Card form should exist');
        assert.ok(form.querySelector('input[name="cardInput"]'), 'Form input should exist');
        assert.equal(form.querySelector('button[type="submit"]').textContent, 'Save', 'Submit button should be correct');

        // Verify footer structure
        const footer = card.querySelector('.card-footer');
        assert.ok(footer, 'Card footer should exist');
        const time = footer.querySelector('time');
        assert.ok(time, 'Time element should exist');
        assert.equal(time.getAttribute('datetime'), '2023-01-01', 'Time datetime should be preserved');

        console.log('✅ fragment.append(template.content) with complex structure works');
    });

    test('should handle multiple fragment.append(template.content) operations', () => {
        const parser = new DomParser(`
            <template id="item-template">
                <div class="list-item" data-id="template-item">
                    <span class="item-label">Template Item</span>
                    <button class="item-action" onclick="actionClick()">Action</button>
                </div>
            </template>
        `);
        const document = parser.document;

        const template = document.querySelector('#item-template');
        const fragment1 = document.createDocumentFragment();
        const fragment2 = document.createDocumentFragment();
        const fragment3 = document.createDocumentFragment();

        // Clone template content for multiple uses
        const clone1 = template.content.cloneNode(true);
        const clone2 = template.content.cloneNode(true);

        // Modify clones to have different data
        clone1.querySelector('.item-label').textContent = 'Item 1';
        clone1.querySelector('.list-item').setAttribute('data-id', 'item-1');

        clone2.querySelector('.item-label').textContent = 'Item 2';
        clone2.querySelector('.list-item').setAttribute('data-id', 'item-2');

        // Append clones to different fragments
        fragment1.append(clone1);
        fragment2.append(clone2);

        // Append original template content to third fragment
        fragment3.append(template.content);

        // Verify each fragment has correct content
        assert.equal(fragment1.children.length, 1, 'Fragment1 should have 1 child');
        assert.equal(fragment2.children.length, 1, 'Fragment2 should have 1 child');
        assert.equal(fragment3.children.length, 1, 'Fragment3 should have 1 child');

        // Verify template is empty after original content moved
        assert.equal(template.content.children.length, 0, 'Template should be empty after original content moved');

        // Verify fragment contents
        const item1 = fragment1.querySelector('.list-item');
        assert.equal(item1.getAttribute('data-id'), 'item-1', 'Item 1 should have correct data-id');
        assert.equal(item1.querySelector('.item-label').textContent, 'Item 1', 'Item 1 should have correct label');
        assert.equal(item1.querySelector('.item-action').getAttribute('onclick'), 'actionClick()', 'Item 1 action should be preserved');

        const item2 = fragment2.querySelector('.list-item');
        assert.equal(item2.getAttribute('data-id'), 'item-2', 'Item 2 should have correct data-id');
        assert.equal(item2.querySelector('.item-label').textContent, 'Item 2', 'Item 2 should have correct label');

        const item3 = fragment3.querySelector('.list-item');
        assert.equal(item3.getAttribute('data-id'), 'template-item', 'Item 3 should have original data-id');
        assert.equal(item3.querySelector('.item-label').textContent, 'Template Item', 'Item 3 should have original label');

        console.log('✅ Multiple fragment.append(template.content) operations work');
    });

    test('should verify element removal from original location after append', () => {
        const parser = new DomParser(`
            <div id="container1">
                <div id="movable1" class="item">Item 1</div>
                <div id="movable2" class="item">Item 2</div>
                <div id="static1" class="static">Static 1</div>
            </div>
            <div id="container2">
                <div id="static2" class="static">Static 2</div>
            </div>
            <div id="container3"></div>
        `);
        const document = parser.document;

        const container1 = document.querySelector('#container1');
        const container2 = document.querySelector('#container2');
        const container3 = document.querySelector('#container3');
        const movable1 = document.querySelector('#movable1');
        const movable2 = document.querySelector('#movable2');

        // Verify initial state
        assert.equal(container1.children.length, 3, 'Container1 should have 3 children initially');
        assert.equal(container2.children.length, 1, 'Container2 should have 1 child initially');
        assert.equal(container3.children.length, 0, 'Container3 should be empty initially');

        // Move movable1 from container1 to container2
        container2.append(movable1);

        // Verify movable1 was removed from container1 and added to container2
        assert.equal(container1.children.length, 2, 'Container1 should have 2 children after first move');
        assert.equal(container2.children.length, 2, 'Container2 should have 2 children after first move');
        assert.equal(container1.querySelector('#movable1'), null, 'Movable1 should not be in container1');
        assert.equal(container2.querySelector('#movable1'), movable1, 'Movable1 should be in container2');
        assert.equal(movable1.parentNode, container2, 'Movable1 parentNode should be container2');

        // Move movable2 from container1 to container3
        container3.appendChild(movable2);

        // Verify movable2 was removed from container1 and added to container3
        assert.equal(container1.children.length, 1, 'Container1 should have 1 child after second move');
        assert.equal(container3.children.length, 1, 'Container3 should have 1 child after second move');
        assert.equal(container1.querySelector('#movable2'), null, 'Movable2 should not be in container1');
        assert.equal(container3.querySelector('#movable2'), movable2, 'Movable2 should be in container3');
        assert.equal(movable2.parentNode, container3, 'Movable2 parentNode should be container3');

        // Move movable1 from container2 to container3 (should be removed from container2)
        container3.append(movable1);

        // Verify movable1 was removed from container2 and added to container3
        assert.equal(container2.children.length, 1, 'Container2 should have 1 child after movable1 leaves');
        assert.equal(container3.children.length, 2, 'Container3 should have 2 children after movable1 arrives');
        assert.equal(container2.querySelector('#movable1'), null, 'Movable1 should not be in container2');
        assert.equal(container3.querySelector('#movable1'), movable1, 'Movable1 should be in container3');

        // Verify static elements remained in their original locations
        assert.equal(container1.querySelector('#static1').textContent, 'Static 1', 'Static1 should remain in container1');
        assert.equal(container2.querySelector('#static2').textContent, 'Static 2', 'Static2 should remain in container2');

        // Verify final state
        assert.equal(container1.children.length, 1, 'Container1 should have 1 child finally (static1)');
        assert.equal(container2.children.length, 1, 'Container2 should have 1 child finally (static2)');
        assert.equal(container3.children.length, 2, 'Container3 should have 2 children finally (movable1, movable2)');

        console.log('✅ Element removal from original location after append verified');
    });

    test('should handle dynamic template creation and fragment append chain', () => {
        const parser = new DomParser('<div id="container"></div>');
        const document = parser.document;

        // Replicate the exact sequence: const t = document.createElement('template')
        const t = document.createElement('template');

        // Replicate: const d = document.createElement('div');
        const d = document.createElement('div');

        // Replicate: d.innerHTML = '<a>asd</a>'; (manually create structure)
        const a = document.createElement('a');
        a.textContent = 'asd';
        d.appendChild(a);

        // Replicate: t.content.append(d);
        t.content.append(d);

        // Replicate: const f = document.createDocumentFragment()
        const f = document.createDocumentFragment();

        // Replicate: f.append(t.content);
        f.append(t.content);

        // Basic verification of the chain
        assert.equal(t.content.children.length, 0, 'Template content should be empty after move');
        assert.equal(f.children.length, 1, 'Fragment should have the div');
        assert.equal(d.parentNode, f, 'Div should be in fragment');
        assert.equal(d.children.length, 1, 'Div should have anchor child');

        // Final step: append fragment to container
        const container = document.querySelector('#container');
        container.append(f);

        // Verify final state
        assert.equal(f.children.length, 0, 'Fragment should be empty after final append');
        assert.equal(container.children.length, 1, 'Container should have the div');
        assert.equal(d.parentNode, container, 'Div should be in container');

        console.log('✅ Dynamic template creation and fragment append chain works');
    });

    test('should handle multiple dynamic template operations', () => {
        const parser = new DomParser('<div id="app"></div>');
        const document = parser.document;

        // Create two templates dynamically
        const template1 = document.createElement('template');
        const template2 = document.createElement('template');

        // Create content for templates
        const div1 = document.createElement('div');
        div1.className = 'item1';
        div1.textContent = 'First item';

        const div2 = document.createElement('div');
        div2.className = 'item2';
        div2.textContent = 'Second item';

        // Add to templates
        template1.content.append(div1);
        template2.content.append(div2);

        // Create fragments and move content
        const fragment1 = document.createDocumentFragment();
        const fragment2 = document.createDocumentFragment();

        fragment1.append(template1.content);
        fragment2.append(template2.content);

        // Verify templates are empty and fragments have content
        assert.equal(template1.content.children.length, 0, 'Template1 should be empty');
        assert.equal(template2.content.children.length, 0, 'Template2 should be empty');
        assert.equal(fragment1.children.length, 1, 'Fragment1 should have content');
        assert.equal(fragment2.children.length, 1, 'Fragment2 should have content');

        // Append to app
        const app = document.querySelector('#app');
        app.append(fragment1);
        app.append(fragment2);

        // Verify final state
        assert.equal(app.children.length, 2, 'App should have 2 children');
        assert.equal(app.querySelector('.item1').textContent, 'First item', 'First item should be correct');
        assert.equal(app.querySelector('.item2').textContent, 'Second item', 'Second item should be correct');

        console.log('✅ Multiple dynamic template operations work');
    });

    test('should handle nested template.content and fragment operations', () => {
        const parser = new DomParser('<div id="root"></div>');
        const document = parser.document;

        // Create outer template
        const outerTemplate = document.createElement('template');
        const outerDiv = document.createElement('div');
        outerDiv.className = 'outer-container';

        // Create inner template
        const innerTemplate = document.createElement('template');
        const innerDiv = document.createElement('div');
        innerDiv.className = 'inner-container';
        innerDiv.innerHTML = '<span>Inner content</span><button onclick="innerClick()">Inner Button</button>';

        // Build nested structure: outerDiv contains innerTemplate
        innerTemplate.content.append(innerDiv);
        outerDiv.innerHTML = '<h1>Outer Title</h1>';
        outerDiv.appendChild(innerTemplate);
        outerTemplate.content.append(outerDiv);

        // Create fragment and move outer template content
        const fragment = document.createDocumentFragment();
        fragment.append(outerTemplate.content);

        // Verify outer template is empty and fragment has content
        assert.equal(outerTemplate.content.children.length, 0, 'Outer template should be empty');
        assert.equal(fragment.children.length, 1, 'Fragment should have 1 child');

        // Verify nested structure in fragment
        const fragmentOuter = fragment.querySelector('.outer-container');
        assert.ok(fragmentOuter, 'Fragment should contain outer container');
        assert.equal(fragmentOuter.querySelector('h1').textContent, 'Outer Title', 'Outer title should be preserved');

        // The inner template should still be in the outer container
        const nestedTemplate = fragmentOuter.querySelector('template');
        assert.ok(nestedTemplate, 'Nested template should be preserved');
        assert.equal(nestedTemplate.content.children.length, 1, 'Inner template should still have content');

        // Access inner template content
        const innerContent = nestedTemplate.content.querySelector('.inner-container');
        assert.ok(innerContent, 'Inner template should contain inner container');
        assert.equal(innerContent.querySelector('span').textContent, 'Inner content', 'Inner span should be preserved');
        assert.equal(innerContent.querySelector('button').getAttribute('onclick'), 'innerClick()', 'Inner button onclick should be preserved');

        // Now move inner template content to another fragment
        const innerFragment = document.createDocumentFragment();
        innerFragment.append(nestedTemplate.content);

        // Verify inner template is now empty and inner fragment has content
        assert.equal(nestedTemplate.content.children.length, 0, 'Inner template should now be empty');
        assert.equal(innerFragment.children.length, 1, 'Inner fragment should have 1 child');

        // Verify inner content in inner fragment
        const innerFragmentContent = innerFragment.querySelector('.inner-container');
        assert.ok(innerFragmentContent, 'Inner fragment should contain inner container');
        assert.equal(innerFragmentContent.querySelector('span').textContent, 'Inner content', 'Inner content should be preserved');

        // Append both fragments to root
        const root = document.querySelector('#root');
        root.append(fragment);
        root.append(innerFragment);

        // Verify final state
        assert.equal(root.children.length, 2, 'Root should have 2 children');
        assert.equal(root.querySelector('.outer-container'), fragmentOuter, 'Root should contain outer container');
        assert.equal(root.querySelector('.inner-container'), innerFragmentContent, 'Root should contain inner container');

        console.log('✅ Nested template.content and fragment operations work');
    });

    test('should append TextNode to template.content', () => {
        const parser = new DomParser(`
            <template id="text-template">
                <div class="container">Initial content</div>
            </template>
        `);
        const document = parser.document;

        const template = document.querySelector('#text-template');

        // Create text nodes
        const textNode1 = document.createTextNode('First text node');
        const textNode2 = document.createTextNode(' Second text node');
        const textNode3 = document.createTextNode(' Third text node');

        // Append text nodes to template.content
        template.content.append(textNode1);
        template.content.append(textNode2, textNode3);

        // Verify text nodes were added
        assert.equal(template.content.childNodes.length, 4, 'Template content should have 4 child nodes (1 div + 3 text nodes)');
        assert.equal(template.content.children.length, 1, 'Template content should still have 1 element child');

        // Verify text nodes content
        const textNodes = Array.from(template.content.childNodes).filter(node => node.nodeType === 3); // TEXT_NODE = 3
        assert.equal(textNodes.length, 3, 'Should have 3 text nodes');
        assert.equal(textNodes[0].textContent, 'First text node', 'First text node should be correct');
        assert.equal(textNodes[1].textContent, ' Second text node', 'Second text node should be correct');
        assert.equal(textNodes[2].textContent, ' Third text node', 'Third text node should be correct');

        // Verify original div is still there
        const container = template.content.querySelector('.container');
        assert.ok(container, 'Original container div should still exist');
        assert.equal(container.textContent, 'Initial content', 'Original div content should be preserved');

        // Test moving template.content with text nodes to another element
        const target = document.createElement('div');
        target.id = 'target';
        target.append(template.content);

        // Verify all nodes moved to target
        assert.equal(template.content.childNodes.length, 0, 'Template content should be empty after move');
        assert.equal(target.childNodes.length, 4, 'Target should have 4 child nodes');
        assert.equal(target.children.length, 1, 'Target should have 1 element child');

        // Verify text content in target
        const targetTextNodes = Array.from(target.childNodes).filter(node => node.nodeType === 3);
        assert.equal(targetTextNodes.length, 3, 'Target should have 3 text nodes');
        assert.equal(target.querySelector('.container').textContent, 'Initial content', 'Container should be in target');

        console.log('✅ TextNode append to template.content works');
    });

    test('should append Comment nodes to template.content', () => {
        const parser = new DomParser(`
            <template id="comment-template">
                <div class="wrapper">
                    <p>Paragraph content</p>
                </div>
            </template>
        `);
        const document = parser.document;

        const template = document.querySelector('#comment-template');

        // Create comment nodes
        const comment1 = document.createComment('First comment');
        const comment2 = document.createComment('Second comment with special chars: <>&"');
        const comment3 = document.createComment('Third comment');

        // Append comment nodes to template.content
        template.content.append(comment1);
        template.content.append(comment2, comment3);

        // Verify comment nodes were added
        assert.equal(template.content.childNodes.length, 4, 'Template content should have 4 child nodes (1 div + 3 comments)');
        assert.equal(template.content.children.length, 1, 'Template content should still have 1 element child');

        // Verify comment nodes content
        const commentNodes = Array.from(template.content.childNodes).filter(node => node.nodeType === 8); // COMMENT_NODE = 8
        assert.equal(commentNodes.length, 3, 'Should have 3 comment nodes');
        assert.equal(commentNodes[0].textContent, 'First comment', 'First comment should be correct');
        assert.equal(commentNodes[1].textContent, 'Second comment with special chars: <>&"', 'Second comment should be correct');
        assert.equal(commentNodes[2].textContent, 'Third comment', 'Third comment should be correct');

        // Verify original div is still there
        const wrapper = template.content.querySelector('.wrapper');
        assert.ok(wrapper, 'Original wrapper div should still exist');
        assert.equal(wrapper.querySelector('p').textContent, 'Paragraph content', 'Original paragraph content should be preserved');

        // Test moving template.content with comment nodes to fragment
        const fragment = document.createDocumentFragment();
        fragment.append(template.content);

        // Verify all nodes moved to fragment
        assert.equal(template.content.childNodes.length, 0, 'Template content should be empty after move');
        assert.equal(fragment.childNodes.length, 4, 'Fragment should have 4 child nodes');
        assert.equal(fragment.children.length, 1, 'Fragment should have 1 element child');

        // Verify comment nodes in fragment
        const fragmentComments = Array.from(fragment.childNodes).filter(node => node.nodeType === 8);
        assert.equal(fragmentComments.length, 3, 'Fragment should have 3 comment nodes');
        assert.equal(fragment.querySelector('.wrapper'), wrapper, 'Wrapper should be in fragment');

        console.log('✅ Comment nodes append to template.content works');
    });

    test('should append mixed TextNode and Comment nodes to template.content', () => {
        const parser = new DomParser(`
            <template id="mixed-template">
                <header>Header content</header>
            </template>
        `);
        const document = parser.document;

        const template = document.querySelector('#mixed-template');

        // Create mixed nodes
        const textNode1 = document.createTextNode('Start text');
        const comment1 = document.createComment('Start comment');
        const textNode2 = document.createTextNode(' Middle text ');
        const comment2 = document.createComment('Middle comment');
        const textNode3 = document.createTextNode('End text');
        const comment3 = document.createComment('End comment');

        // Append mixed nodes in specific order
        template.content.append(textNode1, comment1);
        template.content.append(textNode2);
        template.content.append(comment2, textNode3, comment3);

        // Verify all nodes were added in correct order
        assert.equal(template.content.childNodes.length, 7, 'Template content should have 7 child nodes (1 header + 6 mixed nodes)');
        assert.equal(template.content.children.length, 1, 'Template content should still have 1 element child');

        // Verify node order and types
        const allNodes = Array.from(template.content.childNodes);
        assert.equal(allNodes[0].tagName, 'HEADER', 'First node should be header element');
        assert.equal(allNodes[1].nodeType, 3, 'Second node should be text node'); // TEXT_NODE
        assert.equal(allNodes[1].textContent, 'Start text', 'Second node should be start text');
        assert.equal(allNodes[2].nodeType, 8, 'Third node should be comment node'); // COMMENT_NODE
        assert.equal(allNodes[2].textContent, 'Start comment', 'Third node should be start comment');
        assert.equal(allNodes[3].nodeType, 3, 'Fourth node should be text node');
        assert.equal(allNodes[3].textContent, ' Middle text ', 'Fourth node should be middle text');
        assert.equal(allNodes[4].nodeType, 8, 'Fifth node should be comment node');
        assert.equal(allNodes[4].textContent, 'Middle comment', 'Fifth node should be middle comment');
        assert.equal(allNodes[5].nodeType, 3, 'Sixth node should be text node');
        assert.equal(allNodes[5].textContent, 'End text', 'Sixth node should be end text');
        assert.equal(allNodes[6].nodeType, 8, 'Seventh node should be comment node');
        assert.equal(allNodes[6].textContent, 'End comment', 'Seventh node should be end comment');

        // Test cloning template.content with mixed nodes
        const clone = template.content.cloneNode(true);
        assert.equal(clone.childNodes.length, 7, 'Clone should have same number of nodes');

        const cloneNodes = Array.from(clone.childNodes);
        assert.equal(cloneNodes[1].textContent, 'Start text', 'Cloned text node should be correct');
        assert.equal(cloneNodes[2].textContent, 'Start comment', 'Cloned comment node should be correct');

        // Test moving cloned content to document body
        const container = document.createElement('div');
        container.className = 'mixed-container';
        container.append(clone);

        // Verify mixed content in container
        assert.equal(container.childNodes.length, 7, 'Container should have 7 child nodes');
        const containerTextNodes = Array.from(container.childNodes).filter(node => node.nodeType === 3);
        const containerComments = Array.from(container.childNodes).filter(node => node.nodeType === 8);
        assert.equal(containerTextNodes.length, 3, 'Container should have 3 text nodes');
        assert.equal(containerComments.length, 3, 'Container should have 3 comment nodes');
        assert.equal(container.querySelector('header').textContent, 'Header content', 'Header should be preserved');

        console.log('✅ Mixed TextNode and Comment nodes append to template.content works');
    });

    test('should handle empty TextNode and Comment append to template.content', () => {
        const parser = new DomParser(`
            <template id="empty-nodes-template">
                <div>Base content</div>
            </template>
        `);
        const document = parser.document;

        const template = document.querySelector('#empty-nodes-template');

        // Create empty nodes
        const emptyTextNode = document.createTextNode('');
        const emptyComment = document.createComment('');
        const whitespaceTextNode = document.createTextNode('   ');
        const whitespaceComment = document.createComment('   ');

        // Append empty nodes
        template.content.append(emptyTextNode, emptyComment);
        template.content.append(whitespaceTextNode, whitespaceComment);

        // Verify empty nodes were added
        assert.equal(template.content.childNodes.length, 5, 'Template content should have 5 child nodes');
        assert.equal(template.content.children.length, 1, 'Template content should still have 1 element child');

        // Verify empty node content
        const allNodes = Array.from(template.content.childNodes);
        assert.equal(allNodes[1].textContent, '', 'Empty text node should have empty content');
        assert.equal(allNodes[2].textContent, '', 'Empty comment node should have empty content');
        assert.equal(allNodes[3].textContent, '   ', 'Whitespace text node should have whitespace content');
        assert.equal(allNodes[4].textContent, '   ', 'Whitespace comment node should have whitespace content');

        // Test that empty nodes are preserved during operations
        const fragment = document.createDocumentFragment();
        fragment.append(template.content);

        assert.equal(fragment.childNodes.length, 5, 'Fragment should preserve all nodes including empty ones');
        const fragmentNodes = Array.from(fragment.childNodes);
        assert.equal(fragmentNodes[1].textContent, '', 'Empty text node should be preserved in fragment');
        assert.equal(fragmentNodes[2].textContent, '', 'Empty comment node should be preserved in fragment');

        console.log('✅ Empty TextNode and Comment append to template.content works');
    });

    test('should preserve existing text when appending nodes with start/end checkpoints', () => {
        const parser = new DomParser(`
            <template id="checkpoint-template">
                <div>Existing text content that should not be lost</div>
            </template>
        `);
        const document = parser.document;

        const template = document.querySelector('#checkpoint-template');

        // Create start and end checkpoint comments
        const startCheckpoint = document.createComment('START CHECKPOINT');
        const endCheckpoint = document.createComment('END CHECKPOINT');

        // Create a new node to insert
        const newNode = document.createElement('p');
        newNode.textContent = 'Inserted content';

        // Get initial content
        const initialContent = template.content.innerHTML;
        console.log('Initial content:', initialContent);

        // Add start checkpoint before appending the node
        template.content.append(startCheckpoint);

        // Append the actual node
        template.content.append(newNode);

        // Add end checkpoint after appending the node
        template.content.append(endCheckpoint);

        // Verify all content is preserved
        assert.equal(template.content.childNodes.length, 4, 'Template content should have 4 nodes (div + start + p + end)');

        // Verify original div is still there and intact
        const originalDiv = template.content.querySelector('div');
        assert.ok(originalDiv, 'Original div should still exist');
        assert.equal(originalDiv.textContent, 'Existing text content that should not be lost', 'Original div text should be preserved');

        // Verify new paragraph was added
        const insertedP = template.content.querySelector('p');
        assert.ok(insertedP, 'Inserted paragraph should exist');
        assert.equal(insertedP.textContent, 'Inserted content', 'Inserted paragraph text should be correct');

        // Verify checkpoints are in place
        const allNodes = Array.from(template.content.childNodes);
        const commentNodes = allNodes.filter(node => node.nodeType === 8); // COMMENT_NODE
        assert.equal(commentNodes.length, 2, 'Should have 2 comment checkpoints');
        assert.equal(commentNodes[0].textContent, 'START CHECKPOINT', 'Start checkpoint should be correct');
        assert.equal(commentNodes[1].textContent, 'END CHECKPOINT', 'End checkpoint should be correct');

        // Verify node order: div, start, p, end
        assert.equal(allNodes[0].tagName, 'DIV', 'First node should be div');
        assert.equal(allNodes[1].nodeType, 8, 'Second node should be comment (start)');
        assert.equal(allNodes[2].tagName, 'P', 'Third node should be paragraph');
        assert.equal(allNodes[3].nodeType, 8, 'Fourth node should be comment (end)');

        console.log('✅ Text preservation with start/end checkpoints works');
    });

    test('should handle complex content insertion with multiple checkpoints', () => {
        const parser = new DomParser(`
            <template id="complex-checkpoint-template">
                <header>Header content</header>
                <main>Main content with <span>nested elements</span></main>
                <footer>Footer content</footer>
            </template>
        `);
        const document = parser.document;

        const template = document.querySelector('#complex-checkpoint-template');

        // Store initial state
        const initialChildCount = template.content.childNodes.length;
        const initialHTML = template.content.innerHTML;

        // Create multiple insertion points with checkpoints
        const checkpoint1Start = document.createComment('SECTION 1 START');
        const checkpoint1End = document.createComment('SECTION 1 END');
        const checkpoint2Start = document.createComment('SECTION 2 START');
        const checkpoint2End = document.createComment('SECTION 2 END');

        // Create content to insert
        const section1 = document.createElement('section');
        section1.className = 'inserted-section-1';
        section1.innerHTML = '<h2>Inserted Section 1</h2><p>Content for section 1</p>';

        const section2 = document.createElement('section');
        section2.className = 'inserted-section-2';
        section2.innerHTML = '<h2>Inserted Section 2</h2><p>Content for section 2</p>';

        // Insert first section with checkpoints
        template.content.append(checkpoint1Start);
        template.content.append(section1);
        template.content.append(checkpoint1End);

        // Insert second section with checkpoints
        template.content.append(checkpoint2Start);
        template.content.append(section2);
        template.content.append(checkpoint2End);

        // Verify all original content is preserved
        const header = template.content.querySelector('header');
        const main = template.content.querySelector('main');
        const footer = template.content.querySelector('footer');

        assert.ok(header, 'Original header should be preserved');
        assert.ok(main, 'Original main should be preserved');
        assert.ok(footer, 'Original footer should be preserved');

        assert.equal(header.textContent, 'Header content', 'Header text should be preserved');
        console.log('Main textContent:', JSON.stringify(main.textContent));
        // Note: HTML parsing may normalize whitespace, so we check for the essential content
        assert.ok(main.textContent?.includes('Main content'), 'Main text should contain "Main content"');
        assert.ok(main.textContent?.includes('nested elements'), 'Main text should contain "nested elements"');
        assert.equal(footer.textContent, 'Footer content', 'Footer text should be preserved');

        // Verify nested span is still there
        const nestedSpan = main.querySelector('span');
        assert.ok(nestedSpan, 'Nested span should be preserved');
        assert.equal(nestedSpan.textContent, 'nested elements', 'Nested span text should be preserved');

        // Verify inserted sections
        const insertedSection1 = template.content.querySelector('.inserted-section-1');
        const insertedSection2 = template.content.querySelector('.inserted-section-2');

        assert.ok(insertedSection1, 'Inserted section 1 should exist');
        assert.ok(insertedSection2, 'Inserted section 2 should exist');

        assert.equal(insertedSection1.querySelector('h2').textContent, 'Inserted Section 1', 'Section 1 title should be correct');
        assert.equal(insertedSection2.querySelector('h2').textContent, 'Inserted Section 2', 'Section 2 title should be correct');

        // Verify checkpoints
        const allNodes = Array.from(template.content.childNodes);
        const commentNodes = allNodes.filter(node => node.nodeType === 8);
        assert.equal(commentNodes.length, 4, 'Should have 4 comment checkpoints');

        // Verify total node count
        const expectedNodeCount = initialChildCount + 6; // 2 sections + 4 checkpoints
        assert.equal(template.content.childNodes.length, expectedNodeCount, 'Total node count should be correct');

        console.log('✅ Complex content insertion with multiple checkpoints works');
    });

    test('comment append in template ', () => {
        const parser = new DomParser(`
<!DOCTYPE html>
<html lang="ko"  data-theme="dark">
<head>
    <meta charset="UTF-8">
    <base href="/">
    <link rel="icon" type="image/png" href="https://dooboostore.github.io/lazycollect-storage/images/favicon.png">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover,maximum-scale=1.0, user-scalable=no">
    <title>lazycollect</title>
<!--    <meta name="theme-color" content="#5BB7F6">-->
<!--    <meta name="apple-mobile-web-app-status-bar-style" content="#5BB7F6">-->

    <!--    <meta property="og:url" content="공유시 이동 url">-->
    <meta property="og:title" content="lazycollect">
    <meta property="og:type" content="website">
    <meta property="og:image" content="https://dooboostore.github.io/lazycollect-storage/images/favicon.png">
    <meta property="og:description" content="Collect opportunities automatically 🐦">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <link rel="stylesheet" href="assets/css/global.css">
</head>
<body id="app" >
 <div id="target"></div>
</body>
</html>
        `);
        const document = parser.document as Document;
        const target = document.querySelector("#target");
        const template = document.createElement('template');
        const text = document.createTextNode('hello');
        const comment1 = document.createComment('comment1');
        const comment2 = document.createComment('comment2');
        template.content.append(text);
        template.content.append(comment1);
        template.content.append(comment2);

        assert.ok(template, 'template exist');
        assert.equal(template.content.childNodes.length, 3, 'Inserted in Content childrenNodes length');
        assert.equal(template.content.children.length, 0, 'Inserted in Content childrenNodes length');

        assert.equal(template.childNodes.length, 0, 'Inserted childrenNodes length');
        assert.equal(template.children.length, 0, 'Inserted childrenNodes length');

        // Check template.innerHTML should reflect the content
        assert.equal(template.innerHTML, 'hello\x3C!--comment1-->\x3C!--comment2-->', 'template innerHTML should contain the escaped content');
        assert.equal(template.innerText, '', 'innerHTML equal');

        document.body.replaceChild(template.content, target!);
        
        console.log('Body innerHTML after replaceChild:', document.body.innerHTML);
        console.log('Body childNodes after replaceChild:', Array.from(document.body.childNodes).map(n => `${n.nodeType}:${n.nodeName}:${n.textContent?.trim()}`));
        
        assert.ok(document.body.innerHTML.includes('comment1'), 'Body innerHTML');



        console.log('✅ comment append in template');
    });


    test('should preserve text nodes when inserting between existing content', () => {
        const parser = new DomParser(`
            <template id="text-preservation-template">
                Start text
                <div>Middle element</div>
                End text
            </template>
        `);
        const document = parser.document;

        const template = document.querySelector('#text-preservation-template');

        // Get initial text nodes
        const initialNodes = Array.from(template.content.childNodes);
        const initialTextNodes = initialNodes.filter(node => node.nodeType === 3); // TEXT_NODE

        console.log('Initial nodes:', initialNodes.map(n => `${n.nodeType}:${n.nodeName}:${n.textContent?.trim()}`));

        // Create insertion with checkpoints
        const startPoint = document.createComment('INSERT START');
        const insertedElement = document.createElement('span');
        insertedElement.textContent = 'Inserted span';
        const endPoint = document.createComment('INSERT END');

        // Insert with checkpoints
        template.content.append(startPoint);
        template.content.append(insertedElement);
        template.content.append(endPoint);

        // Verify original text nodes are preserved
        const finalNodes = Array.from(template.content.childNodes);
        const finalTextNodes = finalNodes.filter(node => node.nodeType === 3);

        assert.equal(finalTextNodes.length, initialTextNodes.length, 'Original text nodes should be preserved');

        // Find and verify specific content
        const startTextNode = finalTextNodes.find(node => node.textContent?.includes('Start text'));
        const endTextNode = finalTextNodes.find(node => node.textContent?.includes('End text'));

        assert.ok(startTextNode, 'Start text node should be preserved');
        assert.ok(endTextNode, 'End text node should be preserved');

        // Verify middle div is still there
        const middleDiv = template.content.querySelector('div');
        assert.ok(middleDiv, 'Middle div should be preserved');
        assert.equal(middleDiv.textContent, 'Middle element', 'Middle div text should be preserved');

        // Verify inserted content
        const insertedSpan = template.content.querySelector('span');
        assert.ok(insertedSpan, 'Inserted span should exist');
        assert.equal(insertedSpan.textContent, 'Inserted span', 'Inserted span text should be correct');

        // Verify checkpoints
        const comments = finalNodes.filter(node => node.nodeType === 8);
        assert.equal(comments.length, 2, 'Should have 2 checkpoints');

        console.log('Final nodes:', finalNodes.map(n => `${n.nodeType}:${n.nodeName}:${n.textContent?.trim()}`));

        console.log('✅ Text node preservation during insertion works');
    });
});
