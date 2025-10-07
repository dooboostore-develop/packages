import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { DomParser } from '@dooboostore/dom-parser';

console.log('🚀 DocumentFragment and Template Tests Starting...');

describe('DocumentFragment Support', () => {
    test('should create DocumentFragment', () => {
        const parser = new DomParser('<div></div>');
        const document = parser.document;

        const fragment = document.createDocumentFragment();
        assert.ok(fragment, 'DocumentFragment should be created');
        assert.equal(fragment.nodeType, (parser.window.Node as Node).DOCUMENT_FRAGMENT_NODE, 'DocumentFragment should have correct nodeType');

        console.log('✅ DocumentFragment creation works');
    });

    test('should append multiple elements to DocumentFragment', () => {
        const parser = new DomParser('<div></div>');
        const document = parser.document;

        const fragment = document.createDocumentFragment();

        const span1 = document.createElement('span');
        span1.textContent = 'Fragment child 1';
        const span2 = document.createElement('span');
        span2.textContent = 'Fragment child 2';

        fragment.appendChild(span1);
        fragment.appendChild(span2);

        assert.equal(fragment.children.length, 2, 'Fragment should have 2 children');

        // Append fragment to document
        const parent = document.querySelector('div');
        parent.appendChild(fragment);

        assert.equal(parent.children.length, 2, 'Parent should have 2 children from fragment');
        assert.equal(fragment.children.length, 0, 'Fragment should be empty after appending');

        console.log('✅ DocumentFragment manipulation works');
    });
});

describe('Template Element Support', () => {
    test('should create template element', () => {
        const parser = new DomParser('<template><div>Template content</div></template>');
        const document = parser.document;

        const template = document.querySelector('template');
        assert.ok(template, 'Template element should exist');
        assert.ok(template.content, 'Template should have content property');

        console.log('✅ Template element creation works');
    });

    test('should return correct innerHTML from template content', () => {
        const parser = new DomParser('<template id="test-template"><div class="item">Simple content</div></template>');
        const document = parser.document;

        const template = document.querySelector('#test-template');

        // Verify content fragment structure
        assert.equal(template.content.children.length, 1, 'Content should have 1 child element');

        const firstChild = template.content.children[0];
        assert.equal(firstChild.tagName, 'DIV', 'First child should be a DIV element');
        assert.equal(firstChild.textContent, 'Simple content', 'First child should have correct text content');
        assert.equal(firstChild.childNodes.length, 1, 'First child should have 1 child node (text node)');

        // Verify innerHTML
        const innerHTML = template.innerHTML;
        assert.ok(innerHTML.includes('<div class="item">'), 'innerHTML should contain div with class');
        assert.ok(innerHTML.includes('Simple content'), 'innerHTML should contain text content');

        console.log('✅ Template innerHTML works');
    });

    test('should set and get innerHTML on template', () => {
        const parser = new DomParser('<template id="test-template"></template>');
        const document = parser.document;

        const template = document.querySelector('#test-template');

        // Set innerHTML - should populate content fragment
        template.innerHTML = '<div class="dynamic">Dynamic content</div><p>Paragraph</p>';

        // Get innerHTML - should return content from fragment
        const innerHTML = template.innerHTML;
        assert.ok(innerHTML.includes('<div class="dynamic">Dynamic content</div>'), 'innerHTML should contain div');
        assert.ok(innerHTML.includes('<p>Paragraph</p>'), 'innerHTML should contain p');

        // Verify content fragment has the elements
        assert.equal(template.content.children.length, 2, 'Content should have 2 children');
        assert.equal(template.content.querySelector('.dynamic').textContent, 'Dynamic content', 'Content should be accessible via querySelector');

        console.log('✅ Template innerHTML setter/getter works');
    });

    test('should append elements directly to template content', () => {
        const parser = new DomParser('<template id="content-template"></template>');
        const document = parser.document;

        const template = document.querySelector('#content-template');

        // Create elements and append to content
        const div = document.createElement('div');
        div.className = 'appended-div';
        div.textContent = 'Appended content';

        const span = document.createElement('span');
        span.textContent = 'Span content';

        template.content.appendChild(div);
        template.content.appendChild(span);

        // Verify content fragment
        assert.equal(template.content.children.length, 2, 'Content should have 2 children');
        assert.equal(template.content.querySelector('.appended-div').textContent, 'Appended content', 'Div should be in content');
        assert.equal(template.content.querySelector('span').textContent, 'Span content', 'Span should be in content');

        // Verify innerHTML reflects the content
        const innerHTML = template.innerHTML;
        assert.ok(innerHTML.includes('class="appended-div"'), 'innerHTML should reflect appended content');
        assert.ok(innerHTML.includes('<span>Span content</span>'), 'innerHTML should include span');

        console.log('✅ Template content appendChild works');
    });

    test('should automatically move children to content when appended to template', () => {
        const parser = new DomParser('<template id="auto-template"></template>');
        const document = parser.document;

        const template = document.querySelector('#auto-template');

        // Create element and append directly to template (should go to content)
        const article = document.createElement('article');

        // Create child elements manually instead of using innerHTML
        const h2 = document.createElement('h2');
        h2.textContent = 'Article Title';
        const p = document.createElement('p');
        p.textContent = 'Article content';

        article.appendChild(h2);
        article.appendChild(p);

        template.appendChild(article); // This should automatically go to content

        // Verify template itself has the direct child
        assert.equal(template.children.length, 1, 'Template should have 1 direct child');

        // Verify template has the article as direct child
        const articleInTemplate = template.querySelector('article');
        assert.ok(articleInTemplate, 'Article should be in template');

        const h2InTemplate = articleInTemplate.querySelector('h2');
        assert.ok(h2InTemplate, 'H2 should be in article');
        assert.equal(h2InTemplate.textContent, 'Article Title', 'H2 should have correct text');

        console.log('✅ Template appendChild works');
    });

    test('should clone template content', () => {
        const parser = new DomParser(`
            <template id="my-template">
                <div class="template-item">Template content</div>
            </template>
            <div id="container"></div>
        `);
        const document = parser.document;

        const template = document.querySelector('#my-template');
        const container = document.querySelector('#container');

        // Clone template content
        const clone = template.content.cloneNode(true);
        container.appendChild(clone);

        const templateItem = container.querySelector('.template-item');
        assert.ok(templateItem, 'Template item should be cloned');
        assert.equal(templateItem.textContent, 'Template content', 'Template content should be correct');

        console.log('✅ Template cloning works');
    });

    test('should support template.content.append() with multiple nodes', () => {
        const parser = new DomParser('<template id="append-template"></template>');
        const document = parser.document;

        const template = document.querySelector('#append-template');

        // Create various types of nodes
        const div = document.createElement('div');
        div.className = 'appended-div';
        div.textContent = 'Div content';

        const textNode = document.createTextNode('Plain text node');
        const span = document.createElement('span');
        span.textContent = 'Span content';

        // Use append() to add multiple nodes at once
        template.content.append(div, textNode, span);

        // Verify all nodes were added
        assert.equal(template.content.childNodes.length, 3, 'Content should have 3 child nodes');
        assert.equal(template.content.children.length, 2, 'Content should have 2 element children');

        // Verify content order and types
        assert.equal(template.content.childNodes[0], div, 'First child should be div');
        assert.equal(template.content.childNodes[1], textNode, 'Second child should be text node');
        assert.equal(template.content.childNodes[2], span, 'Third child should be span');

        // Verify innerHTML includes all content
        const innerHTML = template.innerHTML;
        assert.ok(innerHTML.includes('<div class="appended-div">Div content</div>'), 'Should contain div');
        assert.ok(innerHTML.includes('Plain text node'), 'Should contain text node content');
        assert.ok(innerHTML.includes('<span>Span content</span>'), 'Should contain span');

        console.log('✅ Template content append() with multiple nodes works');
    });

    test('should support template.content.append() with text nodes and elements', () => {
        const parser = new DomParser('<template id="mixed-template"></template>');
        const document = parser.document;

        const template = document.querySelector('#mixed-template');

        // Create start and end markers
        const startMarker = document.createTextNode('<!-- Start -->');
        const endMarker = document.createTextNode('<!-- End -->');

        // Create content elements
        const header = document.createElement('h3');
        header.textContent = 'Section Header';

        const content = document.createElement('p');
        content.textContent = 'Section content goes here';

        // Append in specific order: start, header, content, end
        template.content.append(startMarker);
        template.content.append(header);
        template.content.append(content);
        template.content.append(endMarker);

        // Verify structure
        assert.equal(template.content.childNodes.length, 4, 'Content should have 4 child nodes');
        assert.equal(template.content.children.length, 2, 'Content should have 2 element children');

        // Verify order
        assert.equal(template.content.childNodes[0].textContent, '<!-- Start -->', 'First should be start marker');
        assert.equal(template.content.childNodes[1].tagName, 'H3', 'Second should be header');
        assert.equal(template.content.childNodes[2].tagName, 'P', 'Third should be paragraph');
        assert.equal(template.content.childNodes[3].textContent, '<!-- End -->', 'Fourth should be end marker');

        // Verify innerHTML preserves order
        const innerHTML = template.innerHTML;
        assert.ok(innerHTML.indexOf('<!-- Start -->') < innerHTML.indexOf('<h3>'), 'Start marker should come before header');
        assert.ok(innerHTML.indexOf('</h3>') < innerHTML.indexOf('<p>'), 'Header should come before paragraph');
        assert.ok(innerHTML.indexOf('</p>') < innerHTML.indexOf('<!-- End -->'), 'Paragraph should come before end marker');

        console.log('✅ Template content append() with mixed nodes works');
    });

    test('should support template.content.append() with string content', () => {
        const parser = new DomParser('<template id="string-template"></template>');
        const document = parser.document;

        const template = document.querySelector('#string-template');

        // Append string content (should be converted to text nodes)
        template.content.append('Hello ', 'world!');

        // Verify text nodes were created
        assert.equal(template.content.childNodes.length, 2, 'Content should have 2 text nodes');
        assert.equal(template.content.childNodes[0].textContent, 'Hello ', 'First text node should be "Hello "');
        assert.equal(template.content.childNodes[1].textContent, 'world!', 'Second text node should be "world!"');

        // Verify innerHTML
        const innerHTML = template.innerHTML;
        assert.equal(innerHTML, 'Hello world!', 'innerHTML should contain concatenated text');

        console.log('✅ Template content append() with strings works');
    });

    test('should support complex template content manipulation', () => {
        const parser = new DomParser('<template id="complex-template"></template>');
        const document = parser.document;

        const template = document.querySelector('#complex-template');

        // Create complex structure with start/end points
        const startPoint = document.createTextNode('{{start}}');
        const endPoint = document.createTextNode('{{end}}');

        // Create wrapper element
        const wrapper = document.createElement('div');
        wrapper.className = 'template-wrapper';

        // Create nested content
        const list = document.createElement('ul');
        const item1 = document.createElement('li');
        item1.textContent = 'Item 1';
        const item2 = document.createElement('li');
        item2.textContent = 'Item 2';

        list.appendChild(item1);
        list.appendChild(item2);
        wrapper.appendChild(list);

        // Use append to add start point, wrapper, and end point
        template.content.append(startPoint, wrapper, endPoint);

        // Verify structure
        assert.equal(template.content.childNodes.length, 3, 'Content should have 3 child nodes');
        assert.equal(template.content.children.length, 1, 'Content should have 1 element child');

        // Verify start and end points
        assert.equal(template.content.childNodes[0].textContent, '{{start}}', 'Should have start point');
        assert.equal(template.content.childNodes[2].textContent, '{{end}}', 'Should have end point');

        // Verify wrapper and nested content
        const wrapperInContent = template.content.querySelector('.template-wrapper');
        assert.ok(wrapperInContent, 'Wrapper should be in content');
        assert.equal(wrapperInContent.querySelector('ul').children.length, 2, 'List should have 2 items');

        // Verify innerHTML structure
        const innerHTML = template.innerHTML;
        assert.ok(innerHTML.startsWith('{{start}}'), 'Should start with start point');
        assert.ok(innerHTML.endsWith('{{end}}'), 'Should end with end point');
        assert.ok(innerHTML.includes('<div class="template-wrapper">'), 'Should contain wrapper');
        assert.ok(innerHTML.includes('<ul><li>Item 1</li><li>Item 2</li></ul>'), 'Should contain list structure');

        console.log('✅ Complex template content manipulation works');
    });

    test('should support template.content.append() with DocumentFragment', () => {
        const parser = new DomParser('<template id="fragment-template"></template>');
        const document = parser.document;

        const template = document.querySelector('#fragment-template');

        // Create a DocumentFragment with content
        const fragment = document.createDocumentFragment();

        const section = document.createElement('section');
        section.className = 'fragment-section';

        const title = document.createElement('h4');
        title.textContent = 'Fragment Title';

        const description = document.createElement('p');
        description.textContent = 'This content came from a fragment';

        section.appendChild(title);
        section.appendChild(description);
        fragment.appendChild(section);

        // Append fragment to template content
        template.content.append(fragment);

        // Verify fragment content was moved to template
        assert.equal(template.content.children.length, 1, 'Template content should have 1 child');
        assert.equal(fragment.children.length, 0, 'Fragment should be empty after append');

        // Verify structure
        const sectionInTemplate = template.content.querySelector('.fragment-section');
        assert.ok(sectionInTemplate, 'Section should be in template content');
        assert.equal(sectionInTemplate.querySelector('h4').textContent, 'Fragment Title', 'Title should be correct');
        assert.equal(sectionInTemplate.querySelector('p').textContent, 'This content came from a fragment', 'Description should be correct');

        console.log('✅ Template content append() with DocumentFragment works');
    });

    test('should support template content manipulation with start/end points', () => {
        const parser = new DomParser('<template id="boundary-template"></template>');
        const document = parser.document;

        const template = document.querySelector('#boundary-template');

        // Create start and end boundary points
        const startEndPoint = {
            start: document.createTextNode('{{#each items}}'),
            end: document.createTextNode('{{/each}}')
        };

        // Create template item structure
        const itemTemplate = document.createElement('div');
        itemTemplate.className = 'item-template';
        itemTemplate.setAttribute('data-id', '{{id}}');

        const itemTitle = document.createElement('h5');
        itemTitle.textContent = '{{title}}';

        const itemContent = document.createElement('p');
        itemContent.textContent = '{{content}}';

        itemTemplate.appendChild(itemTitle);
        itemTemplate.appendChild(itemContent);

        // Append start point, template structure, and end point
        template.content.append(startEndPoint.start);
        template.content.append(itemTemplate);
        template.content.append(startEndPoint.end);

        // Verify boundary structure
        assert.equal(template.content.childNodes.length, 3, 'Content should have 3 nodes');
        assert.equal(template.content.childNodes[0].textContent, '{{#each items}}', 'Should start with each loop');
        assert.equal(template.content.childNodes[2].textContent, '{{/each}}', 'Should end with each close');

        // Verify template item structure
        const itemInContent = template.content.querySelector('.item-template');
        assert.ok(itemInContent, 'Item template should be in content');
        assert.equal(itemInContent.getAttribute('data-id'), '{{id}}', 'Should have template attribute');
        assert.equal(itemInContent.querySelector('h5').textContent, '{{title}}', 'Should have template title');
        assert.equal(itemInContent.querySelector('p').textContent, '{{content}}', 'Should have template content');

        // Verify innerHTML preserves template syntax
        const innerHTML = template.innerHTML;
        assert.ok(innerHTML.includes('{{#each items}}'), 'Should contain loop start');
        assert.ok(innerHTML.includes('{{/each}}'), 'Should contain loop end');
        assert.ok(innerHTML.includes('data-id="{{id}}"'), 'Should contain template attributes');
        assert.ok(innerHTML.includes('{{title}}'), 'Should contain template variables');

        console.log('✅ Template content with start/end points works');
    });

    test('should support nested template content operations', () => {
        const parser = new DomParser('<template id="nested-template"></template>');
        const document = parser.document;

        const template = document.querySelector('#nested-template');

        // Create nested template structure
        const outerContainer = document.createElement('div');
        outerContainer.className = 'outer-container';

        const innerTemplate = document.createElement('template');
        innerTemplate.id = 'inner-template';

        // Add content to inner template
        const innerDiv = document.createElement('div');
        innerDiv.textContent = 'Inner template content';
        innerTemplate.content.appendChild(innerDiv);

        // Create sibling content
        const siblingText = document.createTextNode('Sibling text');
        const siblingElement = document.createElement('span');
        siblingElement.textContent = 'Sibling element';

        // Append everything to outer template content
        outerContainer.appendChild(innerTemplate);
        template.content.append(outerContainer, siblingText, siblingElement);

        // Verify nested structure
        assert.equal(template.content.children.length, 2, 'Outer content should have 2 element children');
        assert.equal(template.content.childNodes.length, 3, 'Outer content should have 3 total nodes');

        // Verify inner template exists and has content
        const innerTemplateInContent = template.content.querySelector('#inner-template');
        assert.ok(innerTemplateInContent, 'Inner template should exist');
        assert.equal(innerTemplateInContent.content.children.length, 1, 'Inner template should have content');
        assert.equal(innerTemplateInContent.content.querySelector('div').textContent, 'Inner template content', 'Inner content should be correct');

        // Verify sibling nodes
        assert.equal(template.content.childNodes[1].textContent, 'Sibling text', 'Should have sibling text');
        assert.equal(template.content.childNodes[2].tagName, 'SPAN', 'Should have sibling span');

        console.log('✅ Nested template content operations work');
    });

    test('should support template content with dynamic text node creation', () => {
        const parser = new DomParser('<template id="dynamic-template"></template>');
        const document = parser.document;

        const template = document.querySelector('#dynamic-template');

        // Simulate dynamic content creation
        const items = [
            { content: 'First item content' },
            { content: 'Second item content' },
            { content: 'Third item content' }
        ];

        // Create dynamic structure
        const container = document.createElement('div');
        container.className = 'dynamic-container';

        items.forEach((item, index) => {
            // Create separator if not first item
            if (index > 0) {
                const separator = document.createTextNode(' | ');
                container.appendChild(separator);
            }

            // Create text node for item content
            const itemTextNode = document.createTextNode(item.content);
            container.appendChild(itemTextNode);
        });

        // Append container to template content
        template.content.append(container);

        // Verify structure
        assert.equal(template.content.children.length, 1, 'Content should have 1 element child');
        assert.equal(container.childNodes.length, 5, 'Container should have 5 nodes (3 text + 2 separators)');

        // Verify content
        const innerHTML = template.innerHTML;
        assert.ok(innerHTML.includes('First item content'), 'Should contain first item');
        assert.ok(innerHTML.includes('Second item content'), 'Should contain second item');
        assert.ok(innerHTML.includes('Third item content'), 'Should contain third item');
        assert.ok(innerHTML.includes(' | '), 'Should contain separators');

        // Verify innerHTML contains expected content (textContent might be null for templates)
        const templateHTML = template.innerHTML;
        assert.ok(templateHTML.includes('First item content'), 'innerHTML should contain first item');
        assert.ok(templateHTML.includes('Second item content'), 'innerHTML should contain second item');
        assert.ok(templateHTML.includes('Third item content'), 'innerHTML should contain third item');
        assert.ok(templateHTML.includes(' | '), 'innerHTML should contain separators');

        console.log('✅ Template content with dynamic text nodes works');
    });

    test('should support template content with mixed append operations', () => {
        const parser = new DomParser('<template id="mixed-ops-template"></template>');
        const document = parser.document;

        const template = document.querySelector('#mixed-ops-template');

        // First, append some initial content
        const header = document.createElement('header');
        header.textContent = 'Template Header';
        template.content.appendChild(header);

        // Then use append() to add multiple items
        const nav = document.createElement('nav');
        const navText = document.createTextNode('Navigation: ');
        const link1 = document.createElement('a');
        link1.href = '#page1';
        link1.textContent = 'Page 1';
        const linkSeparator = document.createTextNode(' | ');
        const link2 = document.createElement('a');
        link2.href = '#page2';
        link2.textContent = 'Page 2';

        nav.append(navText, link1, linkSeparator, link2);
        template.content.append(nav);

        // Finally, append footer content
        const footer = document.createElement('footer');
        const footerText = document.createTextNode('Footer content');
        template.content.append(footer);
        footer.appendChild(footerText);

        // Verify final structure
        assert.equal(template.content.children.length, 3, 'Content should have 3 element children');
        assert.equal(template.content.querySelector('header').textContent, 'Template Header', 'Header should be correct');
        assert.equal(template.content.querySelector('nav').childNodes.length, 4, 'Nav should have 4 child nodes');
        assert.equal(template.content.querySelector('footer').textContent, 'Footer content', 'Footer should be correct');

        // Verify innerHTML structure
        const innerHTML = template.innerHTML;
        assert.ok(innerHTML.includes('<header>Template Header</header>'), 'Should contain header');
        assert.ok(innerHTML.includes('<nav>Navigation: <a href="#page1">Page 1</a> | <a href="#page2">Page 2</a></nav>'), 'Should contain nav structure');
        assert.ok(innerHTML.includes('<footer>Footer content</footer>'), 'Should contain footer');

        console.log('✅ Template content with mixed operations works');
    });

    test('should support template.content.prepend() with multiple nodes', () => {
        const parser = new DomParser('<template id="prepend-template"></template>');
        const document = parser.document;

        const template = document.querySelector('#prepend-template');

        // First add some existing content
        const existingDiv = document.createElement('div');
        existingDiv.textContent = 'Existing content';
        template.content.appendChild(existingDiv);

        // Create nodes to prepend
        const prependDiv = document.createElement('div');
        prependDiv.className = 'prepended-div';
        prependDiv.textContent = 'Prepended content';

        const prependText = document.createTextNode('Prepended text ');
        const prependSpan = document.createElement('span');
        prependSpan.textContent = 'Prepended span';

        // Use prepend() to add multiple nodes at the beginning
        template.content.prepend(prependDiv, prependText, prependSpan);

        // Verify all nodes were prepended in correct order
        assert.equal(template.content.childNodes.length, 4, 'Content should have 4 child nodes');
        assert.equal(template.content.childNodes[0], prependDiv, 'First child should be prepended div');
        assert.equal(template.content.childNodes[1], prependText, 'Second child should be prepended text');
        assert.equal(template.content.childNodes[2], prependSpan, 'Third child should be prepended span');
        assert.equal(template.content.childNodes[3], existingDiv, 'Fourth child should be existing div');

        // Verify innerHTML order
        const innerHTML = template.innerHTML;
        assert.ok(innerHTML.indexOf('Prepended content') < innerHTML.indexOf('Prepended text'), 'Prepended div should come first');
        assert.ok(innerHTML.indexOf('Prepended text') < innerHTML.indexOf('Prepended span'), 'Prepended text should come second');
        assert.ok(innerHTML.indexOf('Prepended span') < innerHTML.indexOf('Existing content'), 'Existing content should come last');

        console.log('✅ Template content prepend() with multiple nodes works');
    });

    test('should support template.content.replaceChildren() method', () => {
        const parser = new DomParser('<template id="replace-template"></template>');
        const document = parser.document;

        const template = document.querySelector('#replace-template');

        // Add initial content
        const oldDiv1 = document.createElement('div');
        oldDiv1.textContent = 'Old content 1';
        const oldDiv2 = document.createElement('div');
        oldDiv2.textContent = 'Old content 2';
        template.content.append(oldDiv1, oldDiv2);

        // Verify initial content
        assert.equal(template.content.children.length, 2, 'Should have 2 initial children');

        // Create replacement content
        const newHeader = document.createElement('h1');
        newHeader.textContent = 'New Header';
        const newParagraph = document.createElement('p');
        newParagraph.textContent = 'New paragraph content';
        const newText = document.createTextNode('New text node');

        // Replace all children
        template.content.replaceChildren(newHeader, newParagraph, newText);

        // Verify replacement
        assert.equal(template.content.childNodes.length, 3, 'Should have 3 new child nodes');
        assert.equal(template.content.children.length, 2, 'Should have 2 new element children');
        assert.equal(template.content.querySelector('h1').textContent, 'New Header', 'Should have new header');
        assert.equal(template.content.querySelector('p').textContent, 'New paragraph content', 'Should have new paragraph');

        // Verify old content is gone
        assert.equal(template.content.textContent.includes('Old content'), false, 'Old content should be removed');

        console.log('✅ Template content replaceChildren() works');
    });

    test('should support template content manipulation with conditional rendering patterns', () => {
        const parser = new DomParser('<template id="conditional-template"></template>');
        const document = parser.document;

        const template = document.querySelector('#conditional-template');

        // Simulate conditional rendering pattern
        const conditions = [
            { show: true, content: 'Visible content 1' },
            { show: false, content: 'Hidden content' },
            { show: true, content: 'Visible content 2' }
        ];

        // Create conditional structure
        conditions.forEach((condition, index) => {
            if (condition.show) {
                const conditionalDiv = document.createElement('div');
                conditionalDiv.className = `conditional-${index}`;
                conditionalDiv.setAttribute('data-visible', 'true');
                conditionalDiv.textContent = condition.content;

                // Add conditional markers
                const startComment = document.createTextNode(`{{#if condition${index}}}`);
                const endComment = document.createTextNode(`{{/if}}`);

                template.content.append(startComment, conditionalDiv, endComment);
            }
        });

        // Verify only visible content is rendered
        assert.equal(template.content.children.length, 2, 'Should have 2 visible elements');
        assert.equal(template.content.childNodes.length, 6, 'Should have 6 total nodes (2 elements + 4 comments)');

        // Verify visible content
        const visibleDivs = template.content.querySelectorAll('[data-visible="true"]');
        assert.equal(visibleDivs.length, 2, 'Should have 2 visible divs');
        assert.equal(visibleDivs[0].textContent, 'Visible content 1', 'First visible content should be correct');
        assert.equal(visibleDivs[1].textContent, 'Visible content 2', 'Second visible content should be correct');

        // Verify conditional markers are preserved
        const innerHTML = template.innerHTML;
        assert.ok(innerHTML.includes('{{#if condition0}}'), 'Should contain first condition marker');
        assert.ok(innerHTML.includes('{{#if condition2}}'), 'Should contain second condition marker');
        assert.ok(!innerHTML.includes('Hidden content'), 'Should not contain hidden content');

        console.log('✅ Template content with conditional rendering works');
    });

    test('should support template content with loop rendering patterns', () => {
        const parser = new DomParser('<template id="loop-template"></template>');
        const document = parser.document;

        const template = document.querySelector('#loop-template');

        // Simulate loop rendering pattern
        const items = [
            { id: 1, title: 'First Item', description: 'First description' },
            { id: 2, title: 'Second Item', description: 'Second description' },
            { id: 3, title: 'Third Item', description: 'Third description' }
        ];

        // Create loop structure
        const loopStart = document.createTextNode('{{#each items}}');
        template.content.append(loopStart);

        items.forEach((item, index) => {
            // Create item container
            const itemDiv = document.createElement('div');
            itemDiv.className = 'loop-item';
            itemDiv.setAttribute('data-index', index.toString());
            itemDiv.setAttribute('data-id', `{{items.${index}.id}}`);

            // Create item title
            const titleElement = document.createElement('h4');
            titleElement.textContent = `{{items.${index}.title}}`;
            titleElement.setAttribute('data-binding', 'title');

            // Create item description
            const descElement = document.createElement('p');
            descElement.textContent = `{{items.${index}.description}}`;
            descElement.setAttribute('data-binding', 'description');

            // Add separator between items
            if (index > 0) {
                const separator = document.createTextNode('{{#unless @last}}, {{/unless}}');
                template.content.append(separator);
            }

            itemDiv.appendChild(titleElement);
            itemDiv.appendChild(descElement);
            template.content.append(itemDiv);
        });

        const loopEnd = document.createTextNode('{{/each}}');
        template.content.append(loopEnd);

        // Verify loop structure
        assert.equal(template.content.children.length, 3, 'Should have 3 loop items');
        assert.equal(template.content.querySelectorAll('.loop-item').length, 3, 'Should have 3 loop item divs');

        // Verify loop markers
        const innerHTML = template.innerHTML;
        assert.ok(innerHTML.startsWith('{{#each items}}'), 'Should start with loop marker');
        assert.ok(innerHTML.endsWith('{{/each}}'), 'Should end with loop marker');

        // Verify item structure
        const firstItem = template.content.querySelector('[data-index="0"]');
        assert.ok(firstItem, 'First item should exist');
        assert.equal(firstItem.querySelector('[data-binding="title"]').textContent, '{{items.0.title}}', 'Title binding should be correct');
        assert.equal(firstItem.querySelector('[data-binding="description"]').textContent, '{{items.0.description}}', 'Description binding should be correct');

        console.log('✅ Template content with loop rendering works');
    });

    test('should support template content with event handler patterns', () => {
        const parser = new DomParser('<template id="event-template"></template>');
        const document = parser.document;

        const template = document.querySelector('#event-template');

        // Create interactive elements with event handler patterns
        const form = document.createElement('form');
        form.setAttribute('data-action', '{{handleSubmit}}');

        const input = document.createElement('input');
        input.type = 'text';
        input.setAttribute('data-model', '{{inputValue}}');
        input.setAttribute('data-change', '{{handleInputChange}}');

        const button = document.createElement('button');
        button.type = 'submit';
        button.textContent = 'Submit';
        button.setAttribute('data-click', '{{handleButtonClick}}');
        button.setAttribute('data-disabled', '{{isSubmitting}}');

        const resetButton = document.createElement('button');
        resetButton.type = 'button';
        resetButton.textContent = 'Reset';
        resetButton.setAttribute('data-click', '{{handleReset}}');

        // Create event binding comments
        const eventStart = document.createTextNode('{{! Event handlers start }}');
        const eventEnd = document.createTextNode('{{! Event handlers end }}');

        form.appendChild(input);
        form.appendChild(button);
        form.appendChild(resetButton);

        template.content.append(eventStart, form, eventEnd);

        // Verify event handler structure
        assert.equal(template.content.children.length, 1, 'Should have 1 form element');
        assert.equal(template.content.querySelector('form').children.length, 3, 'Form should have 3 child elements');

        // Verify event handler attributes
        const formElement = template.content.querySelector('form');
        assert.equal(formElement.getAttribute('data-action'), '{{handleSubmit}}', 'Form should have submit handler');

        const inputElement = template.content.querySelector('input');
        assert.equal(inputElement.getAttribute('data-model'), '{{inputValue}}', 'Input should have model binding');
        assert.equal(inputElement.getAttribute('data-change'), '{{handleInputChange}}', 'Input should have change handler');

        const submitButton = template.content.querySelector('button[type="submit"]');
        assert.equal(submitButton.getAttribute('data-click'), '{{handleButtonClick}}', 'Submit button should have click handler');
        assert.equal(submitButton.getAttribute('data-disabled'), '{{isSubmitting}}', 'Submit button should have disabled binding');

        const resetButtonElement = template.content.querySelector('button[type="button"]');
        assert.equal(resetButtonElement.getAttribute('data-click'), '{{handleReset}}', 'Reset button should have click handler');

        // Verify innerHTML preserves event patterns
        const innerHTML = template.innerHTML;
        assert.ok(innerHTML.includes('data-action="{{handleSubmit}}"'), 'Should preserve form action handler');
        assert.ok(innerHTML.includes('data-model="{{inputValue}}"'), 'Should preserve input model binding');
        assert.ok(innerHTML.includes('{{! Event handlers start }}'), 'Should preserve event comments');

        console.log('✅ Template content with event handler patterns works');
    });

    test('should support template content with slot patterns', () => {
        const parser = new DomParser('<template id="slot-template"></template>');
        const document = parser.document;

        const template = document.querySelector('#slot-template');

        // Create component structure with slots
        const component = document.createElement('div');
        component.className = 'component-wrapper';

        // Default slot
        const defaultSlot = document.createElement('slot');
        defaultSlot.textContent = 'Default slot content';

        // Named slots
        const headerSlot = document.createElement('slot');
        headerSlot.setAttribute('name', 'header');
        headerSlot.innerHTML = '<h2>Default Header</h2>';

        const footerSlot = document.createElement('slot');
        footerSlot.setAttribute('name', 'footer');
        footerSlot.innerHTML = '<p>Default Footer</p>';

        // Scoped slot
        const scopedSlot = document.createElement('slot');
        scopedSlot.setAttribute('name', 'item');
        scopedSlot.setAttribute('data-scope', '{{item}}');
        scopedSlot.innerHTML = '<div data-item="{{item.id}}">{{item.name}}</div>';

        // Create slot markers
        const slotStart = document.createTextNode('{{! Slots start }}');
        const slotEnd = document.createTextNode('{{! Slots end }}');

        // Assemble component structure
        component.appendChild(headerSlot);
        component.appendChild(defaultSlot);
        component.appendChild(scopedSlot);
        component.appendChild(footerSlot);

        template.content.append(slotStart, component, slotEnd);

        // Verify slot structure
        assert.equal(template.content.children.length, 1, 'Should have 1 component wrapper');
        assert.equal(template.content.querySelectorAll('slot').length, 4, 'Should have 4 slot elements');

        // Verify named slots
        const namedSlots = template.content.querySelectorAll('slot[name]');
        assert.equal(namedSlots.length, 3, 'Should have 3 named slots');

        const headerSlotElement = template.content.querySelector('slot[name="header"]');
        assert.ok(headerSlotElement, 'Header slot should exist');
        assert.ok(headerSlotElement.innerHTML.includes('<h2>Default Header</h2>'), 'Header slot should have default content');

        const footerSlotElement = template.content.querySelector('slot[name="footer"]');
        assert.ok(footerSlotElement, 'Footer slot should exist');
        assert.ok(footerSlotElement.innerHTML.includes('<p>Default Footer</p>'), 'Footer slot should have default content');

        // Verify scoped slot
        const scopedSlotElement = template.content.querySelector('slot[name="item"]');
        assert.ok(scopedSlotElement, 'Scoped slot should exist');
        assert.equal(scopedSlotElement.getAttribute('data-scope'), '{{item}}', 'Scoped slot should have scope attribute');
        assert.ok(scopedSlotElement.innerHTML.includes('{{item.id}}'), 'Scoped slot should have item binding');

        // Verify default slot (first slot without name attribute)
        const allSlots = template.content.querySelectorAll('slot');
        const defaultSlotElement = Array.from(allSlots).find(slot => !slot.hasAttribute('name'));
        assert.ok(defaultSlotElement, 'Default slot should exist');
        assert.equal(defaultSlotElement.textContent, 'Default slot content', 'Default slot should have content');

        console.log('✅ Template content with slot patterns works');
    });

    test('should support template content with component composition patterns', () => {
        const parser = new DomParser('<template id="composition-template"></template>');
        const document = parser.document;

        const template = document.querySelector('#composition-template');

        // Create parent component
        const parentComponent = document.createElement('div');
        parentComponent.className = 'parent-component';
        parentComponent.setAttribute('data-component', 'ParentComponent');

        // Create child components
        const childComponent1 = document.createElement('div');
        childComponent1.className = 'child-component';
        childComponent1.setAttribute('data-component', 'ChildComponent');
        childComponent1.setAttribute('data-props', '{{childProps1}}');

        const childComponent2 = document.createElement('div');
        childComponent2.className = 'child-component';
        childComponent2.setAttribute('data-component', 'ChildComponent');
        childComponent2.setAttribute('data-props', '{{childProps2}}');

        // Create nested component
        const nestedComponent = document.createElement('div');
        nestedComponent.className = 'nested-component';
        nestedComponent.setAttribute('data-component', 'NestedComponent');
        nestedComponent.setAttribute('data-nested-props', '{{nestedProps}}');

        // Create component hierarchy
        childComponent1.appendChild(nestedComponent);
        parentComponent.appendChild(childComponent1);
        parentComponent.appendChild(childComponent2);

        // Add component markers
        const componentStart = document.createTextNode('{{! Component composition start }}');
        const componentEnd = document.createTextNode('{{! Component composition end }}');

        template.content.append(componentStart, parentComponent, componentEnd);

        // Verify component structure
        assert.equal(template.content.children.length, 1, 'Should have 1 parent component');
        assert.equal(template.content.querySelectorAll('[data-component]').length, 4, 'Should have 4 components total');

        // Verify parent component
        const parentElement = template.content.querySelector('.parent-component');
        assert.ok(parentElement, 'Parent component should exist');
        assert.equal(parentElement.getAttribute('data-component'), 'ParentComponent', 'Parent should have correct component type');

        // Verify child components
        const childComponents = template.content.querySelectorAll('.child-component');
        assert.equal(childComponents.length, 2, 'Should have 2 child components');
        assert.equal(childComponents[0].getAttribute('data-props'), '{{childProps1}}', 'First child should have props');
        assert.equal(childComponents[1].getAttribute('data-props'), '{{childProps2}}', 'Second child should have props');

        // Verify nested component
        const nestedElement = template.content.querySelector('.nested-component');
        assert.ok(nestedElement, 'Nested component should exist');
        assert.equal(nestedElement.getAttribute('data-component'), 'NestedComponent', 'Nested should have correct component type');
        assert.equal(nestedElement.getAttribute('data-nested-props'), '{{nestedProps}}', 'Nested should have props');

        // Verify component hierarchy
        assert.equal(childComponents[0].contains(nestedElement), true, 'Nested component should be inside first child');

        console.log('✅ Template content with component composition works');
    });

    test('should support template content with data binding and reactive patterns', () => {
        const parser = new DomParser('<template id="reactive-template"></template>');
        const document = parser.document;

        const template = document.querySelector('#reactive-template');

        // Create reactive data structure
        const reactiveContainer = document.createElement('div');
        reactiveContainer.className = 'reactive-container';
        reactiveContainer.setAttribute('data-reactive', 'true');

        // Create computed property elements
        const computedTitle = document.createElement('h3');
        computedTitle.setAttribute('data-computed', '{{fullName}}');
        computedTitle.setAttribute('data-deps', 'firstName,lastName');
        computedTitle.textContent = '{{firstName}} {{lastName}}';

        const computedCounter = document.createElement('div');
        computedCounter.className = 'counter';
        computedCounter.setAttribute('data-computed', '{{doubleCount}}');
        computedCounter.setAttribute('data-deps', 'count');
        computedCounter.textContent = 'Count: {{count}}, Double: {{doubleCount}}';

        // Create reactive list
        const reactiveList = document.createElement('ul');
        reactiveList.setAttribute('data-list', '{{items}}');
        reactiveList.setAttribute('data-key', 'id');

        const listItemTemplate = document.createElement('li');
        listItemTemplate.setAttribute('data-item', '{{item}}');
        listItemTemplate.setAttribute('data-key', '{{item.id}}');
        listItemTemplate.innerHTML = '{{item.name}} - {{item.status}}';

        reactiveList.appendChild(listItemTemplate);

        // Create watchers
        const watcherComment1 = document.createTextNode('{{! watch: firstName -> updateFullName }}');
        const watcherComment2 = document.createTextNode('{{! watch: count -> logCountChange }}');

        // Assemble reactive structure
        reactiveContainer.appendChild(computedTitle);
        reactiveContainer.appendChild(computedCounter);
        reactiveContainer.appendChild(reactiveList);

        template.content.append(watcherComment1, watcherComment2, reactiveContainer);

        // Verify reactive structure
        assert.equal(template.content.children.length, 1, 'Should have 1 reactive container');
        assert.equal(template.content.querySelectorAll('[data-computed]').length, 2, 'Should have 2 computed properties');

        // Verify computed properties
        const titleElement = template.content.querySelector('[data-computed="{{fullName}}"]');
        assert.ok(titleElement, 'Computed title should exist');
        assert.equal(titleElement.getAttribute('data-deps'), 'firstName,lastName', 'Title should have correct dependencies');

        const counterElement = template.content.querySelector('[data-computed="{{doubleCount}}"]');
        assert.ok(counterElement, 'Computed counter should exist');
        assert.equal(counterElement.getAttribute('data-deps'), 'count', 'Counter should have correct dependencies');

        // Verify reactive list
        const listElement = template.content.querySelector('[data-list="{{items}}"]');
        assert.ok(listElement, 'Reactive list should exist');
        assert.equal(listElement.getAttribute('data-key'), 'id', 'List should have key attribute');

        const listItem = listElement.querySelector('[data-item="{{item}}"]');
        assert.ok(listItem, 'List item template should exist');
        assert.equal(listItem.getAttribute('data-key'), '{{item.id}}', 'List item should have key binding');

        // Verify watchers in comments
        const innerHTML = template.innerHTML;
        assert.ok(innerHTML.includes('{{! watch: firstName -> updateFullName }}'), 'Should contain firstName watcher');
        assert.ok(innerHTML.includes('{{! watch: count -> logCountChange }}'), 'Should contain count watcher');

        console.log('✅ Template content with reactive patterns works');
    });
});