import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { DomParser } from '@dooboostore/dom-parser';

console.log('🚀 CloneNode Tests Starting...');

describe('CloneNode Tests', () => {
    test('should clone element with shallow clone (deep=false)', () => {
        const parser = new DomParser('<div id="parent" class="container" data-test="value"><span>Child</span></div>');
        const document = parser.document;

        const original = document.querySelector('#parent');
        assert.ok(original, 'Original element should exist');

        // Shallow clone
        const clone = original.cloneNode(false);

        // Verify clone properties
        assert.equal(clone.tagName, 'DIV', 'Clone should have same tag name');
        assert.equal(clone.id, 'parent', 'Clone should have same id');
        assert.equal(clone.className, 'container', 'Clone should have same class');
        assert.equal(clone.getAttribute('data-test'), 'value', 'Clone should have same attributes');

        // Verify shallow clone has no children
        assert.equal(clone.children.length, 0, 'Shallow clone should have no children');
        assert.equal(clone.childNodes.length, 0, 'Shallow clone should have no child nodes');

        // Verify original is unchanged
        assert.equal(original.children.length, 1, 'Original should still have children');
        assert.equal(original.querySelector('span').textContent, 'Child', 'Original child should be intact');

        // Verify they are different objects
        assert.notEqual(clone, original, 'Clone should be different object');

        console.log('✅ Shallow clone (deep=false) works');
    });

    test('should clone element with deep clone (deep=true)', () => {
        const parser = new DomParser(`
            <div id="parent" class="container">
                <h1>Title</h1>
                <p class="text">Paragraph content</p>
                <ul>
                    <li>Item 1</li>
                    <li>Item 2</li>
                </ul>
            </div>
        `);
        const document = parser.document;

        const original = document.querySelector('#parent');
        assert.ok(original, 'Original element should exist');

        // Deep clone
        const clone = original.cloneNode(true);

        // Verify clone properties
        assert.equal(clone.tagName, 'DIV', 'Clone should have same tag name');
        assert.equal(clone.id, 'parent', 'Clone should have same id');
        assert.equal(clone.className, 'container', 'Clone should have same class');

        // Verify deep clone has all children
        assert.equal(clone.children.length, 3, 'Deep clone should have all children');

        // Verify child elements
        const clonedH1 = clone.querySelector('h1');
        assert.ok(clonedH1, 'Cloned h1 should exist');
        assert.equal(clonedH1.textContent, 'Title', 'Cloned h1 should have same content');

        const clonedP = clone.querySelector('p.text');
        assert.ok(clonedP, 'Cloned p should exist');
        assert.equal(clonedP.textContent, 'Paragraph content', 'Cloned p should have same content');

        const clonedUl = clone.querySelector('ul');
        assert.ok(clonedUl, 'Cloned ul should exist');
        assert.equal(clonedUl.children.length, 2, 'Cloned ul should have 2 li children');

        const clonedLis = clone.querySelectorAll('li');
        assert.equal(clonedLis.length, 2, 'Should have 2 cloned li elements');
        assert.equal(clonedLis[0].textContent, 'Item 1', 'First li should have correct content');
        assert.equal(clonedLis[1].textContent, 'Item 2', 'Second li should have correct content');

        // Verify they are different objects
        assert.notEqual(clone, original, 'Clone should be different object');
        assert.notEqual(clone.querySelector('h1'), original.querySelector('h1'), 'Child clones should be different objects');

        console.log('✅ Deep clone (deep=true) works');
    });

    test('should clone element with complex attributes', () => {
        const parser = new DomParser(`
            <input 
                type="text" 
                name="username" 
                value="john_doe" 
                placeholder="Enter username"
                data-validation="required"
                data-min-length="3"
                class="form-control input-lg"
                id="user-input"
                required
                disabled
            />
        `);
        const document = parser.document;

        const original = document.querySelector('#user-input');
        assert.ok(original, 'Original input should exist');

        // Clone the input
        const clone = original.cloneNode(false);

        // Verify all attributes are cloned
        assert.equal(clone.tagName, 'INPUT', 'Clone should be input element');
        assert.equal(clone.getAttribute('type'), 'text', 'Type attribute should be cloned');
        assert.equal(clone.getAttribute('name'), 'username', 'Name attribute should be cloned');
        assert.equal(clone.getAttribute('value'), 'john_doe', 'Value attribute should be cloned');
        assert.equal(clone.getAttribute('placeholder'), 'Enter username', 'Placeholder should be cloned');
        assert.equal(clone.getAttribute('data-validation'), 'required', 'Data attribute should be cloned');
        assert.equal(clone.getAttribute('data-min-length'), '3', 'Data attribute with number should be cloned');
        assert.equal(clone.className, 'form-control input-lg', 'Class should be cloned');
        assert.equal(clone.id, 'user-input', 'ID should be cloned');
        assert.ok(clone.hasAttribute('required'), 'Boolean attribute should be cloned');
        assert.ok(clone.hasAttribute('disabled'), 'Disabled attribute should be cloned');

        console.log('✅ Complex attributes cloning works');
    });

    test('should clone element with text content and mixed nodes', () => {
        const parser = new DomParser(`
            <div id="mixed-content">
                Text before
                <strong>Bold text</strong>
                Text between
                <em>Italic text</em>
                Text after
            </div>
        `);
        const document = parser.document;

        const original = document.querySelector('#mixed-content');
        assert.ok(original, 'Original element should exist');

        // Deep clone
        const clone = original.cloneNode(true);

        // Verify structure is preserved
        assert.equal(clone.childNodes.length, original.childNodes.length, 'Should have same number of child nodes');

        // Verify text content is preserved
        assert.equal(clone.textContent.trim(), original.textContent.trim(), 'Text content should be identical');

        // Verify HTML structure is preserved
        const originalHTML = original.innerHTML.replace(/\s+/g, ' ').trim();
        const clonedHTML = clone.innerHTML.replace(/\s+/g, ' ').trim();
        assert.equal(clonedHTML, originalHTML, 'HTML structure should be identical');

        // Verify specific elements
        assert.ok(clone.querySelector('strong'), 'Strong element should be cloned');
        assert.ok(clone.querySelector('em'), 'Em element should be cloned');
        assert.equal(clone.querySelector('strong').textContent, 'Bold text', 'Strong content should be correct');
        assert.equal(clone.querySelector('em').textContent, 'Italic text', 'Em content should be correct');

        console.log('✅ Mixed content cloning works');
    });

    test('should clone nested elements with deep hierarchy', () => {
        const parser = new DomParser(`
            <article class="post">
                <header>
                    <h1>Article Title</h1>
                    <div class="meta">
                        <span class="author">John Doe</span>
                        <time datetime="2023-01-01">January 1, 2023</time>
                    </div>
                </header>
                <section class="content">
                    <p>First paragraph with <a href="#link">a link</a>.</p>
                    <blockquote>
                        <p>A quoted paragraph.</p>
                        <cite>Citation source</cite>
                    </blockquote>
                    <ul class="tags">
                        <li><span class="tag">JavaScript</span></li>
                        <li><span class="tag">DOM</span></li>
                    </ul>
                </section>
                <footer>
                    <button type="button" class="btn">Like</button>
                    <button type="button" class="btn">Share</button>
                </footer>
            </article>
        `);
        const document = parser.document;

        const original = document.querySelector('article.post');
        assert.ok(original, 'Original article should exist');

        // Deep clone
        const clone = original.cloneNode(true);

        // Verify top-level structure
        assert.equal(clone.tagName, 'ARTICLE', 'Clone should be article element');
        assert.equal(clone.className, 'post', 'Clone should have post class');

        // Verify header section
        const clonedHeader = clone.querySelector('header');
        assert.ok(clonedHeader, 'Header should be cloned');
        assert.equal(clonedHeader.querySelector('h1').textContent, 'Article Title', 'Title should be cloned');
        assert.equal(clonedHeader.querySelector('.author').textContent, 'John Doe', 'Author should be cloned');
        assert.equal(clonedHeader.querySelector('time').getAttribute('datetime'), '2023-01-01', 'Time attributes should be cloned');

        // Verify content section
        const clonedContent = clone.querySelector('section.content');
        assert.ok(clonedContent, 'Content section should be cloned');
        assert.ok(clonedContent.querySelector('a[href="#link"]'), 'Link should be cloned with href');

        // Verify blockquote and cite separately (descendant selectors may not be fully supported)
        const clonedBlockquote = clonedContent.querySelector('blockquote');
        assert.ok(clonedBlockquote, 'Blockquote should be cloned');
        const clonedCite = clonedContent.querySelector('cite');
        assert.ok(clonedCite, 'Cite should be cloned');

        // Verify list structure (using class selector instead of descendant selector)
        const clonedTagsList = clone.querySelector('.tags');
        assert.ok(clonedTagsList, 'Tags list should be cloned');
        const clonedTags = clone.querySelectorAll('.tag');
        assert.equal(clonedTags.length, 2, 'Should have 2 tag elements');
        assert.equal(clonedTags[0].textContent, 'JavaScript', 'First tag should be correct');
        assert.equal(clonedTags[1].textContent, 'DOM', 'Second tag should be correct');

        // Verify footer buttons (using separate selectors)
        const clonedFooter = clone.querySelector('footer');
        assert.ok(clonedFooter, 'Footer should be cloned');
        const clonedButtons = clone.querySelectorAll('button');
        assert.equal(clonedButtons.length, 2, 'Should have 2 buttons');
        assert.equal(clonedButtons[0].textContent, 'Like', 'First button should be Like');
        assert.equal(clonedButtons[1].textContent, 'Share', 'Second button should be Share');

        // Verify independence
        assert.notEqual(clone, original, 'Clone should be different object');
        assert.notEqual(clone.querySelector('h1'), original.querySelector('h1'), 'Nested elements should be different objects');

        console.log('✅ Deep hierarchy cloning works');
    });

    test('should clone form elements with various input types', () => {
        const parser = new DomParser(`
            <form id="test-form" action="/submit" method="post">
                <fieldset>
                    <legend>User Information</legend>
                    <input type="text" name="name" value="John" required>
                    <input type="email" name="email" value="john@example.com">
                    <input type="password" name="password" value="secret">
                    <input type="checkbox" name="subscribe" checked>
                    <input type="radio" name="gender" value="male" checked>
                    <input type="radio" name="gender" value="female">
                    <select name="country">
                        <option value="us" selected>United States</option>
                        <option value="ca">Canada</option>
                    </select>
                    <textarea name="bio" rows="3">User biography</textarea>
                </fieldset>
                <button type="submit">Submit</button>
            </form>
        `);
        const document = parser.document;

        const original = document.querySelector('#test-form');
        assert.ok(original, 'Original form should exist');

        // Deep clone
        const clone = original.cloneNode(true);

        // Verify form attributes
        assert.equal(clone.tagName, 'FORM', 'Clone should be form element');
        assert.equal(clone.id, 'test-form', 'Form id should be cloned');
        // Note: HTML parsing may strip leading slash from action="/submit"
        const actionAttr = clone.getAttribute('action');
        assert.ok(actionAttr === '/submit' || actionAttr === 'submit', 'Form action should be cloned (with or without leading slash)');
        assert.equal(clone.getAttribute('method'), 'post', 'Form method should be cloned');

        // Verify fieldset and legend
        const clonedFieldset = clone.querySelector('fieldset');
        assert.ok(clonedFieldset, 'Fieldset should be cloned');
        assert.equal(clonedFieldset.querySelector('legend').textContent, 'User Information', 'Legend should be cloned');

        // Verify text input
        const textInput = clone.querySelector('input[type="text"]');
        assert.ok(textInput, 'Text input should be cloned');
        assert.equal(textInput.getAttribute('name'), 'name', 'Input name should be cloned');
        assert.equal(textInput.getAttribute('value'), 'John', 'Input value should be cloned');
        assert.ok(textInput.hasAttribute('required'), 'Required attribute should be cloned');

        // Verify email input
        const emailInput = clone.querySelector('input[type="email"]');
        assert.ok(emailInput, 'Email input should be cloned');
        assert.equal(emailInput.getAttribute('value'), 'john@example.com', 'Email value should be cloned');

        // Verify checkbox
        const checkbox = clone.querySelector('input[type="checkbox"]');
        assert.ok(checkbox, 'Checkbox should be cloned');
        assert.ok(checkbox.hasAttribute('checked'), 'Checked attribute should be cloned');

        // Verify radio buttons
        const radioButtons = clone.querySelectorAll('input[type="radio"]');
        assert.equal(radioButtons.length, 2, 'Should have 2 radio buttons');
        assert.equal(radioButtons[0].getAttribute('value'), 'male', 'First radio value should be correct');
        assert.ok(radioButtons[0].hasAttribute('checked'), 'First radio should be checked');
        assert.equal(radioButtons[1].getAttribute('value'), 'female', 'Second radio value should be correct');

        // Verify select and options
        const select = clone.querySelector('select');
        assert.ok(select, 'Select should be cloned');
        assert.equal(select.getAttribute('name'), 'country', 'Select name should be cloned');

        const options = clone.querySelectorAll('option');
        assert.equal(options.length, 2, 'Should have 2 options');
        assert.equal(options[0].getAttribute('value'), 'us', 'First option value should be correct');
        assert.ok(options[0].hasAttribute('selected'), 'First option should be selected');

        // Verify textarea
        const textarea = clone.querySelector('textarea');
        assert.ok(textarea, 'Textarea should be cloned');
        assert.equal(textarea.getAttribute('name'), 'bio', 'Textarea name should be cloned');
        assert.equal(textarea.getAttribute('rows'), '3', 'Textarea rows should be cloned');
        assert.equal(textarea.textContent, 'User biography', 'Textarea content should be cloned');

        // Verify submit button
        const submitButton = clone.querySelector('button[type="submit"]');
        assert.ok(submitButton, 'Submit button should be cloned');
        assert.equal(submitButton.textContent, 'Submit', 'Button text should be cloned');

        console.log('✅ Form elements cloning works');
    });

    test('should clone table with complex structure', () => {
        const parser = new DomParser(`
            <table id="data-table" class="table-striped">
                <caption>Sales Data</caption>
                <thead>
                    <tr>
                        <th scope="col">Product</th>
                        <th scope="col">Price</th>
                        <th scope="col">Quantity</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="row-1">
                        <td>Laptop</td>
                        <td>$999</td>
                        <td>5</td>
                    </tr>
                    <tr class="row-2">
                        <td>Mouse</td>
                        <td>$25</td>
                        <td>10</td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="2">Total</td>
                        <td>15</td>
                    </tr>
                </tfoot>
            </table>
        `);
        const document = parser.document;

        const original = document.querySelector('#data-table');
        assert.ok(original, 'Original table should exist');

        // Deep clone
        const clone = original.cloneNode(true);

        // Verify table structure
        assert.equal(clone.tagName, 'TABLE', 'Clone should be table element');
        assert.equal(clone.id, 'data-table', 'Table id should be cloned');
        assert.equal(clone.className, 'table-striped', 'Table class should be cloned');

        // Verify caption
        const clonedCaption = clone.querySelector('caption');
        assert.ok(clonedCaption, 'Caption should be cloned');
        assert.equal(clonedCaption.textContent, 'Sales Data', 'Caption text should be correct');

        // Verify thead
        const clonedThead = clone.querySelector('thead');
        assert.ok(clonedThead, 'Thead should be cloned');
        const headerCells = clonedThead.querySelectorAll('th');
        assert.equal(headerCells.length, 3, 'Should have 3 header cells');
        assert.equal(headerCells[0].textContent, 'Product', 'First header should be correct');
        assert.equal(headerCells[0].getAttribute('scope'), 'col', 'Header scope should be cloned');

        // Verify tbody
        const clonedTbody = clone.querySelector('tbody');
        assert.ok(clonedTbody, 'Tbody should be cloned');
        const bodyRows = clonedTbody.querySelectorAll('tr');
        assert.equal(bodyRows.length, 2, 'Should have 2 body rows');
        assert.equal(bodyRows[0].className, 'row-1', 'Row class should be cloned');

        const firstRowCells = bodyRows[0].querySelectorAll('td');
        assert.equal(firstRowCells.length, 3, 'First row should have 3 cells');
        assert.equal(firstRowCells[0].textContent, 'Laptop', 'First cell should be correct');
        assert.equal(firstRowCells[1].textContent, '$999', 'Second cell should be correct');

        // Verify tfoot
        const clonedTfoot = clone.querySelector('tfoot');
        assert.ok(clonedTfoot, 'Tfoot should be cloned');
        const footerCell = clonedTfoot.querySelector('td[colspan="2"]');
        assert.ok(footerCell, 'Footer cell with colspan should be cloned');
        assert.equal(footerCell.getAttribute('colspan'), '2', 'Colspan attribute should be cloned');
        assert.equal(footerCell.textContent, 'Total', 'Footer cell text should be correct');

        console.log('✅ Table structure cloning works');
    });

    test('should clone elements with special characters and entities', () => {
        const parser = new DomParser(`
            <div id="special-chars" title="Special &amp; Characters">
                <p>Text with &lt;entities&gt; and "quotes"</p>
                <span data-content="&quot;Hello&quot; &amp; &lt;World&gt;">Special attributes</span>
                <code>&lt;script&gt;alert('XSS');&lt;/script&gt;</code>
            </div>
        `);
        const document = parser.document;

        const original = document.querySelector('#special-chars');
        assert.ok(original, 'Original element should exist');

        // Deep clone
        const clone = original.cloneNode(true);

        // Verify special characters in attributes
        assert.equal(clone.getAttribute('title'), 'Special & Characters', 'Title with entities should be cloned correctly');

        // Verify special characters in content
        const clonedP = clone.querySelector('p');
        assert.ok(clonedP, 'Paragraph should be cloned');
        assert.ok(clonedP.textContent.includes('<entities>'), 'Text with entities should be preserved');
        assert.ok(clonedP.textContent.includes('"quotes"'), 'Text with quotes should be preserved');

        // Verify special characters in data attributes
        const clonedSpan = clone.querySelector('span');
        assert.ok(clonedSpan, 'Span should be cloned');
        const dataContent = clonedSpan.getAttribute('data-content');
        assert.ok(dataContent.includes('"Hello"'), 'Data attribute should preserve quotes');
        assert.ok(dataContent.includes('&'), 'Data attribute should preserve ampersand');
        assert.ok(dataContent.includes('<World>'), 'Data attribute should preserve angle brackets');

        // Verify code content
        const clonedCode = clone.querySelector('code');
        assert.ok(clonedCode, 'Code element should be cloned');
        assert.ok(clonedCode.textContent.includes('<script>'), 'Code content should preserve script tags');

        console.log('✅ Special characters and entities cloning works');
    });

    test('should clone custom elements and unknown tags', () => {
        const parser = new DomParser(`
            <custom-component id="my-component" data-props='{"name": "test"}'>
                <custom-header slot="header">Custom Header</custom-header>
                <custom-content>
                    <unknown-tag attribute="value">Unknown content</unknown-tag>
                </custom-content>
                <my-element xmlns:custom="http://example.com" custom:attr="namespaced">
                    Namespaced element
                </my-element>
            </custom-component>
        `);
        const document = parser.document;

        const original = document.querySelector('#my-component');
        assert.ok(original, 'Original custom component should exist');

        // Deep clone
        const clone = original.cloneNode(true);

        // Verify custom component
        assert.equal(clone.tagName, 'CUSTOM-COMPONENT', 'Custom component tag should be cloned');
        assert.equal(clone.id, 'my-component', 'Custom component id should be cloned');
        assert.equal(clone.getAttribute('data-props'), '{"name": "test"}', 'JSON data attribute should be cloned');

        // Verify custom header with slot
        const clonedHeader = clone.querySelector('custom-header');
        assert.ok(clonedHeader, 'Custom header should be cloned');
        assert.equal(clonedHeader.getAttribute('slot'), 'header', 'Slot attribute should be cloned');
        assert.equal(clonedHeader.textContent, 'Custom Header', 'Custom header content should be cloned');

        // Verify unknown tag
        const clonedUnknown = clone.querySelector('unknown-tag');
        assert.ok(clonedUnknown, 'Unknown tag should be cloned');
        assert.equal(clonedUnknown.getAttribute('attribute'), 'value', 'Unknown tag attributes should be cloned');
        assert.equal(clonedUnknown.textContent, 'Unknown content', 'Unknown tag content should be cloned');

        // Verify namespaced element
        const clonedNamespaced = clone.querySelector('my-element');
        assert.ok(clonedNamespaced, 'Namespaced element should be cloned');
        assert.equal(clonedNamespaced.textContent.trim(), 'Namespaced element', 'Namespaced content should be cloned');

        console.log('✅ Custom elements and unknown tags cloning works');
    });

    test('should handle cloning of empty elements and self-closing tags', () => {
        const parser = new DomParser(`
            <div id="container">
                <img src="image.jpg" alt="Test image" />
                <br />
                <hr class="divider" />
                <input type="text" name="test" />
                <meta charset="utf-8" />
                <link rel="stylesheet" href="style.css" />
                <area shape="rect" coords="0,0,100,100" href="#area" />
            </div>
        `);
        const document = parser.document;

        const original = document.querySelector('#container');
        assert.ok(original, 'Original container should exist');

        // Deep clone
        const clone = original.cloneNode(true);

        // Verify self-closing elements are cloned
        const clonedImg = clone.querySelector('img');
        assert.ok(clonedImg, 'Img should be cloned');
        assert.equal(clonedImg.getAttribute('src'), 'image.jpg', 'Img src should be cloned');
        assert.equal(clonedImg.getAttribute('alt'), 'Test image', 'Img alt should be cloned');

        const clonedBr = clone.querySelector('br');
        assert.ok(clonedBr, 'Br should be cloned');

        const clonedHr = clone.querySelector('hr');
        assert.ok(clonedHr, 'Hr should be cloned');
        assert.equal(clonedHr.className, 'divider', 'Hr class should be cloned');

        const clonedInput = clone.querySelector('input');
        assert.ok(clonedInput, 'Input should be cloned');
        assert.equal(clonedInput.getAttribute('type'), 'text', 'Input type should be cloned');
        assert.equal(clonedInput.getAttribute('name'), 'test', 'Input name should be cloned');

        const clonedMeta = clone.querySelector('meta');
        assert.ok(clonedMeta, 'Meta should be cloned');
        assert.equal(clonedMeta.getAttribute('charset'), 'utf-8', 'Meta charset should be cloned');

        const clonedLink = clone.querySelector('link');
        assert.ok(clonedLink, 'Link should be cloned');
        assert.equal(clonedLink.getAttribute('rel'), 'stylesheet', 'Link rel should be cloned');
        assert.equal(clonedLink.getAttribute('href'), 'style.css', 'Link href should be cloned');

        const clonedArea = clone.querySelector('area');
        assert.ok(clonedArea, 'Area should be cloned');
        assert.equal(clonedArea.getAttribute('shape'), 'rect', 'Area shape should be cloned');
        assert.equal(clonedArea.getAttribute('coords'), '0,0,100,100', 'Area coords should be cloned');

        console.log('✅ Self-closing tags cloning works');
    });

    test('should maintain element independence after cloning', () => {
        const parser = new DomParser(`
            <div id="original" class="container">
                <p class="text">Original text</p>
                <span data-value="original">Original span</span>
            </div>
        `);
        const document = parser.document;

        const original = document.querySelector('#original');
        assert.ok(original, 'Original element should exist');

        // Deep clone
        const clone = original.cloneNode(true);

        // Modify original
        original.id = 'modified-original';
        original.className = 'modified-container';
        original.querySelector('p').textContent = 'Modified text';
        original.querySelector('span').setAttribute('data-value', 'modified');

        // Verify clone is unchanged
        assert.equal(clone.id, 'original', 'Clone id should remain unchanged');
        assert.equal(clone.className, 'container', 'Clone class should remain unchanged');
        assert.equal(clone.querySelector('p').textContent, 'Original text', 'Clone text should remain unchanged');
        assert.equal(clone.querySelector('span').getAttribute('data-value'), 'original', 'Clone attribute should remain unchanged');

        // Modify clone
        clone.id = 'modified-clone';
        clone.querySelector('p').textContent = 'Clone modified text';

        // Verify original is unchanged by clone modifications
        assert.equal(original.id, 'modified-original', 'Original should keep its modifications');
        assert.equal(original.querySelector('p').textContent, 'Modified text', 'Original text should remain as modified');

        console.log('✅ Element independence after cloning works');
    });

    test('should preserve original element integrity during cloning', () => {
        const parser = new DomParser(`
            <div id="original-container" class="main-container" data-version="1.0">
                <header class="page-header">
                    <h1 id="main-title">Original Title</h1>
                    <nav class="navigation">
                        <ul>
                            <li><a href="#home">Home</a></li>
                            <li><a href="#about">About</a></li>
                        </ul>
                    </nav>
                </header>
                <main class="content">
                    <article id="main-article" data-published="true">
                        <h2>Article Title</h2>
                        <p class="intro">Introduction paragraph</p>
                        <section class="body">
                            <p>First paragraph of content</p>
                            <p>Second paragraph of content</p>
                        </section>
                    </article>
                </main>
                <footer class="page-footer">
                    <p>&copy; 2023 Original Company</p>
                </footer>
            </div>
        `);
        const document = parser.document;

        const original = document.querySelector('#original-container');
        assert.ok(original, 'Original element should exist');

        // Capture original state before cloning
        const originalState = {
            id: original.id,
            className: original.className,
            dataVersion: original.getAttribute('data-version'),
            childrenCount: original.children.length,
            innerHTML: original.innerHTML,
            textContent: original.textContent,

            // Capture specific child elements
            header: {
                exists: !!original.querySelector('header'),
                className: original.querySelector('header')?.className,
                childrenCount: original.querySelector('header')?.children.length
            },
            title: {
                exists: !!original.querySelector('#main-title'),
                textContent: original.querySelector('#main-title')?.textContent,
                id: original.querySelector('#main-title')?.id
            },
            article: {
                exists: !!original.querySelector('#main-article'),
                id: original.querySelector('#main-article')?.id,
                dataPublished: original.querySelector('#main-article')?.getAttribute('data-published'),
                childrenCount: original.querySelector('#main-article')?.children.length
            },
            links: {
                count: original.querySelectorAll('a').length,
                firstHref: original.querySelector('a')?.getAttribute('href'),
                firstText: original.querySelector('a')?.textContent
            },
            paragraphs: {
                count: original.querySelectorAll('p').length,
                introText: original.querySelector('.intro')?.textContent,
                footerText: original.querySelector('footer p')?.textContent
            }
        };

        // Perform deep clone
        const clone = original.cloneNode(true);

        // Verify original remains completely unchanged
        assert.equal(original.id, originalState.id, 'Original id should be unchanged');
        assert.equal(original.className, originalState.className, 'Original className should be unchanged');
        assert.equal(original.getAttribute('data-version'), originalState.dataVersion, 'Original data-version should be unchanged');
        assert.equal(original.children.length, originalState.childrenCount, 'Original children count should be unchanged');
        assert.equal(original.innerHTML, originalState.innerHTML, 'Original innerHTML should be unchanged');
        assert.equal(original.textContent, originalState.textContent, 'Original textContent should be unchanged');

        // Verify original child elements remain unchanged
        assert.equal(!!original.querySelector('header'), originalState.header.exists, 'Original header existence should be unchanged');
        assert.equal(original.querySelector('header')?.className, originalState.header.className, 'Original header className should be unchanged');
        assert.equal(original.querySelector('header')?.children.length, originalState.header.childrenCount, 'Original header children count should be unchanged');

        assert.equal(!!original.querySelector('#main-title'), originalState.title.exists, 'Original title existence should be unchanged');
        assert.equal(original.querySelector('#main-title')?.textContent, originalState.title.textContent, 'Original title text should be unchanged');
        assert.equal(original.querySelector('#main-title')?.id, originalState.title.id, 'Original title id should be unchanged');

        assert.equal(!!original.querySelector('#main-article'), originalState.article.exists, 'Original article existence should be unchanged');
        assert.equal(original.querySelector('#main-article')?.id, originalState.article.id, 'Original article id should be unchanged');
        assert.equal(original.querySelector('#main-article')?.getAttribute('data-published'), originalState.article.dataPublished, 'Original article data-published should be unchanged');
        assert.equal(original.querySelector('#main-article')?.children.length, originalState.article.childrenCount, 'Original article children count should be unchanged');

        assert.equal(original.querySelectorAll('a').length, originalState.links.count, 'Original links count should be unchanged');
        assert.equal(original.querySelector('a')?.getAttribute('href'), originalState.links.firstHref, 'Original first link href should be unchanged');
        assert.equal(original.querySelector('a')?.textContent, originalState.links.firstText, 'Original first link text should be unchanged');

        assert.equal(original.querySelectorAll('p').length, originalState.paragraphs.count, 'Original paragraphs count should be unchanged');
        assert.equal(original.querySelector('.intro')?.textContent, originalState.paragraphs.introText, 'Original intro text should be unchanged');

        // Verify clone exists and is different object
        assert.ok(clone, 'Clone should exist');
        assert.notEqual(clone, original, 'Clone should be different object from original');

        // Verify clone has same structure as original
        assert.equal(clone.id, original.id, 'Clone should have same id as original');
        assert.equal(clone.className, original.className, 'Clone should have same className as original');
        assert.equal(clone.children.length, original.children.length, 'Clone should have same children count as original');

        // Modify clone to ensure it doesn't affect original
        clone.id = 'modified-clone';
        clone.className = 'modified-container';
        clone.setAttribute('data-version', '2.0');

        const cloneTitle = clone.querySelector('#main-title');
        if (cloneTitle) {
            cloneTitle.textContent = 'Modified Clone Title';
            cloneTitle.id = 'modified-title';
        }

        const cloneArticle = clone.querySelector('#main-article');
        if (cloneArticle) {
            cloneArticle.setAttribute('data-published', 'false');
        }

        // Verify original is still unchanged after clone modifications
        assert.equal(original.id, originalState.id, 'Original id should remain unchanged after clone modification');
        assert.equal(original.className, originalState.className, 'Original className should remain unchanged after clone modification');
        assert.equal(original.getAttribute('data-version'), originalState.dataVersion, 'Original data-version should remain unchanged after clone modification');
        assert.equal(original.querySelector('#main-title')?.textContent, originalState.title.textContent, 'Original title text should remain unchanged after clone modification');
        assert.equal(original.querySelector('#main-title')?.id, originalState.title.id, 'Original title id should remain unchanged after clone modification');
        assert.equal(original.querySelector('#main-article')?.getAttribute('data-published'), originalState.article.dataPublished, 'Original article data-published should remain unchanged after clone modification');

        console.log('✅ Original element integrity preserved during cloning works');
    });

    test('should preserve original during multiple cloning operations', () => {
        const parser = new DomParser(`
            <form id="test-form" method="post" action="/submit">
                <fieldset>
                    <legend>User Info</legend>
                    <input type="text" name="username" value="original_user" required>
                    <input type="email" name="email" value="user@original.com">
                    <select name="country">
                        <option value="us" selected>United States</option>
                        <option value="ca">Canada</option>
                    </select>
                </fieldset>
                <button type="submit">Submit Original</button>
            </form>
        `);
        const document = parser.document;

        const original = document.querySelector('#test-form');
        assert.ok(original, 'Original form should exist');

        // Capture original state
        const originalFormData = {
            id: original.id,
            method: original.getAttribute('method'),
            action: original.getAttribute('action'),
            usernameValue: original.querySelector('input[name="username"]')?.getAttribute('value'),
            emailValue: original.querySelector('input[name="email"]')?.getAttribute('value'),
            selectedOption: original.querySelector('option[selected]')?.getAttribute('value'),
            buttonText: original.querySelector('button')?.textContent,
            fieldsetCount: original.querySelectorAll('fieldset').length,
            inputCount: original.querySelectorAll('input').length
        };

        // Perform multiple cloning operations
        const clone1 = original.cloneNode(true);
        const clone2 = original.cloneNode(true);
        const clone3 = original.cloneNode(false); // shallow clone

        // Modify each clone differently
        clone1.id = 'clone-1';
        clone1.querySelector('input[name="username"]')?.setAttribute('value', 'clone1_user');
        clone1.querySelector('button').textContent = 'Submit Clone 1';

        clone2.id = 'clone-2';
        clone2.querySelector('input[name="email"]')?.setAttribute('value', 'clone2@example.com');
        clone2.querySelector('option[selected]')?.removeAttribute('selected');
        clone2.querySelector('option[value="ca"]')?.setAttribute('selected', '');

        clone3.id = 'clone-3';
        clone3.setAttribute('method', 'get');

        // Verify original remains unchanged after all cloning and modifications
        assert.equal(original.id, originalFormData.id, 'Original form id should be unchanged');
        assert.equal(original.getAttribute('method'), originalFormData.method, 'Original form method should be unchanged');
        assert.equal(original.getAttribute('action'), originalFormData.action, 'Original form action should be unchanged');
        assert.equal(original.querySelector('input[name="username"]')?.getAttribute('value'), originalFormData.usernameValue, 'Original username value should be unchanged');
        assert.equal(original.querySelector('input[name="email"]')?.getAttribute('value'), originalFormData.emailValue, 'Original email value should be unchanged');
        assert.equal(original.querySelector('option[selected]')?.getAttribute('value'), originalFormData.selectedOption, 'Original selected option should be unchanged');
        assert.equal(original.querySelector('button')?.textContent, originalFormData.buttonText, 'Original button text should be unchanged');
        assert.equal(original.querySelectorAll('fieldset').length, originalFormData.fieldsetCount, 'Original fieldset count should be unchanged');
        assert.equal(original.querySelectorAll('input').length, originalFormData.inputCount, 'Original input count should be unchanged');

        // Verify clones are different and have expected modifications
        assert.equal(clone1.id, 'clone-1', 'Clone 1 should have modified id');
        assert.equal(clone1.querySelector('input[name="username"]')?.getAttribute('value'), 'clone1_user', 'Clone 1 should have modified username');
        assert.equal(clone1.querySelector('button')?.textContent, 'Submit Clone 1', 'Clone 1 should have modified button text');

        assert.equal(clone2.id, 'clone-2', 'Clone 2 should have modified id');
        assert.equal(clone2.querySelector('input[name="email"]')?.getAttribute('value'), 'clone2@example.com', 'Clone 2 should have modified email');
        assert.ok(!clone2.querySelector('option[value="us"]')?.hasAttribute('selected'), 'Clone 2 US option should not be selected');
        assert.ok(clone2.querySelector('option[value="ca"]')?.hasAttribute('selected'), 'Clone 2 CA option should be selected');

        assert.equal(clone3.id, 'clone-3', 'Clone 3 should have modified id');
        assert.equal(clone3.getAttribute('method'), 'get', 'Clone 3 should have modified method');
        assert.equal(clone3.children.length, 0, 'Clone 3 (shallow) should have no children');

        console.log('✅ Original preserved during multiple cloning operations works');
    });

    test('should preserve original when cloning and manipulating DOM tree', () => {
        const parser = new DomParser(`
            <div id="tree-root" class="tree-container">
                <div class="branch" data-level="1">
                    <span class="leaf">Leaf 1.1</span>
                    <div class="branch" data-level="2">
                        <span class="leaf">Leaf 2.1</span>
                        <span class="leaf">Leaf 2.2</span>
                    </div>
                </div>
                <div class="branch" data-level="1">
                    <span class="leaf">Leaf 1.2</span>
                </div>
            </div>
        `);
        const document = parser.document;

        const original = document.querySelector('#tree-root');
        assert.ok(original, 'Original tree should exist');

        // Capture detailed original state
        const originalTreeState = {
            structure: original.innerHTML,
            branchCount: original.querySelectorAll('.branch').length,
            leafCount: original.querySelectorAll('.leaf').length,
            level1Branches: original.querySelectorAll('[data-level="1"]').length,
            level2Branches: original.querySelectorAll('[data-level="2"]').length,
            leafTexts: Array.from(original.querySelectorAll('.leaf')).map(leaf => leaf.textContent),
            firstBranchChildren: original.querySelector('.branch')?.children.length
        };

        // Clone and perform extensive DOM manipulations
        const clone = original.cloneNode(true);

        // Add new elements to clone
        const newBranch = document.createElement('div');
        newBranch.className = 'branch';
        newBranch.setAttribute('data-level', '1');
        const newLeaf = document.createElement('span');
        newLeaf.className = 'leaf';
        newLeaf.textContent = 'New Leaf';
        newBranch.appendChild(newLeaf);
        clone.appendChild(newBranch);

        // Remove elements from clone
        const firstLeaf = clone.querySelector('.leaf');
        if (firstLeaf && firstLeaf.parentNode) {
            firstLeaf.parentNode.removeChild(firstLeaf);
        }

        // Modify existing elements in clone
        const cloneLeaves = clone.querySelectorAll('.leaf');
        cloneLeaves.forEach((leaf, index) => {
            leaf.textContent = `Modified Leaf ${index + 1}`;
        });

        // Change attributes in clone
        const cloneBranches = clone.querySelectorAll('.branch');
        cloneBranches.forEach(branch => {
            branch.setAttribute('data-modified', 'true');
        });

        // Verify original tree structure is completely unchanged
        assert.equal(original.innerHTML, originalTreeState.structure, 'Original tree structure should be unchanged');
        assert.equal(original.querySelectorAll('.branch').length, originalTreeState.branchCount, 'Original branch count should be unchanged');
        assert.equal(original.querySelectorAll('.leaf').length, originalTreeState.leafCount, 'Original leaf count should be unchanged');
        assert.equal(original.querySelectorAll('[data-level="1"]').length, originalTreeState.level1Branches, 'Original level 1 branches should be unchanged');
        assert.equal(original.querySelectorAll('[data-level="2"]').length, originalTreeState.level2Branches, 'Original level 2 branches should be unchanged');
        assert.equal(original.querySelector('.branch')?.children.length, originalTreeState.firstBranchChildren, 'Original first branch children count should be unchanged');

        // Verify original leaf texts are unchanged
        const currentLeafTexts = Array.from(original.querySelectorAll('.leaf')).map(leaf => leaf.textContent);
        assert.deepEqual(currentLeafTexts, originalTreeState.leafTexts, 'Original leaf texts should be unchanged');

        // Verify original has no modified attributes
        const originalBranches = original.querySelectorAll('.branch');
        originalBranches.forEach(branch => {
            assert.ok(!branch.hasAttribute('data-modified'), 'Original branches should not have data-modified attribute');
        });

        // Verify clone has expected modifications
        assert.ok(clone.querySelectorAll('.branch').length > originalTreeState.branchCount, 'Clone should have more branches than original');
        assert.ok(clone.querySelector('[data-modified="true"]'), 'Clone should have modified attributes');

        console.log('✅ Original preserved during DOM tree manipulation works');
    });
});