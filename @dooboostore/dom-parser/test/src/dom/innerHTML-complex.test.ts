import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from '@dooboostore/dom-parser';

describe('innerHTML Complex Real-world Cases', () => {
  let document: any;

  beforeEach(() => {
    const window = parseHTML('<html><body></body></html>');
    document = window.document;
  });

  it('should handle complex nested div structure', () => {
    const container = document.createElement('div');

    const complexHTML = `
      <div class="container">
        <header class="hero">
          <div class="hero-content">
            <h1 class="title">Test Title</h1>
            <p class="subtitle">Test Subtitle</p>
          </div>
        </header>
        <section class="demo-section">
          <h2 class="section-title">Demo</h2>
          <div class="button-group">
            <button class="btn btn-primary">Button 1</button>
            <button class="btn btn-secondary">Button 2</button>
          </div>
        </section>
      </div>
    `;

    container.innerHTML = complexHTML;

    // Check structure
    assert.equal(container.children.length, 1);
    const mainDiv = container.children[0];
    assert.equal(mainDiv.tagName, 'DIV');
    assert.equal(mainDiv.className, 'container');

    // Check nested structure
    assert.equal(mainDiv.children.length, 2); // header and section

    const header = mainDiv.children[0];
    assert.equal(header.tagName, 'HEADER');
    assert.equal(header.className, 'hero');

    const section = mainDiv.children[1];
    assert.equal(section.tagName, 'SECTION');
    assert.equal(section.className, 'demo-section');

    // Check innerHTML consistency
    const regeneratedHTML = container.innerHTML;
    assert.ok(regeneratedHTML.includes('<div class="container">'));
    assert.ok(regeneratedHTML.includes('<header class="hero">'));
    assert.ok(regeneratedHTML.includes('<h1 class="title">Test Title</h1>'));
    // Should not have actual broken closing tags
    const actualBrokenTags = /(?<!<)\/\w+>/g.test(regeneratedHTML);
    assert.equal(actualBrokenTags, false);
    assert.ok(regeneratedHTML.includes('</div>'));
  });

  it('should handle mixed content with meta tags and style', () => {
    const body = document.createElement('body');

    const mixedHTML = `
      <meta id="test-start"/>
      <style id="test-style">
        .container { display: flex; }
        .hero { background: red; }
      </style>
      <main>
        <div class="container">
          <div class="content">Hello World</div>
        </div>
      </main>
      <meta id="test-end"/>
    `;

    body.innerHTML = mixedHTML;

    // Check structure
    assert.equal(body.children.length, 4); // meta, style, main, meta

    const meta1 = body.children[0];
    assert.equal(meta1.tagName, 'META');
    assert.equal(meta1.getAttribute('id'), 'test-start');

    const style = body.children[1];
    assert.equal(style.tagName, 'STYLE');
    assert.equal(style.getAttribute('id'), 'test-style');
    assert.ok(style.textContent.includes('.container { display: flex; }'));

    const main = body.children[2];
    assert.equal(main.tagName, 'MAIN');

    const meta2 = body.children[3];
    assert.equal(meta2.tagName, 'META');
    assert.equal(meta2.getAttribute('id'), 'test-end');

    // Check innerHTML regeneration
    const regeneratedHTML = body.innerHTML;
    assert.ok(regeneratedHTML.includes('<meta id="test-start" />'));
    assert.ok(regeneratedHTML.includes('<style id="test-style">'));
    assert.ok(regeneratedHTML.includes('</style>'));
    assert.ok(regeneratedHTML.includes('<main>'));
    assert.ok(regeneratedHTML.includes('</main>'));
    assert.ok(regeneratedHTML.includes('<meta id="test-end" />'));
  });

  it('should handle deeply nested structure without breaking', () => {
    const root = document.createElement('div');

    const deepHTML = `
      <div class="level1">
        <div class="level2">
          <div class="level3">
            <div class="level4">
              <div class="level5">
                <span>Deep content</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    root.innerHTML = deepHTML;

    // Navigate through the structure
    let current = root.children[0]; // level1
    assert.equal(current.className, 'level1');

    current = current.children[0]; // level2
    assert.equal(current.className, 'level2');

    current = current.children[0]; // level3
    assert.equal(current.className, 'level3');

    current = current.children[0]; // level4
    assert.equal(current.className, 'level4');

    current = current.children[0]; // level5
    assert.equal(current.className, 'level5');

    const span = current.children[0];
    assert.equal(span.tagName, 'SPAN');
    assert.equal(span.textContent, 'Deep content');

    // Check innerHTML consistency - should not have broken closing tags
    const regeneratedHTML = root.innerHTML;
    const actualBrokenTags = /(?<!<)\/\w+>/g.test(regeneratedHTML);
    assert.equal(actualBrokenTags, false); // Should not have broken tags
    assert.ok(regeneratedHTML.includes('</div>')); // Should have proper closing tags

    // Count opening and closing div tags
    const openingDivs = (regeneratedHTML.match(/<div/g) || []).length;
    const closingDivs = (regeneratedHTML.match(/<\/div>/g) || []).length;
    assert.equal(openingDivs, closingDivs); // Should be balanced
  });

  it('should handle real-world complex HTML structure', () => {
    const body = document.createElement('body');

    // Simplified version of the problematic HTML
    const realWorldHTML = `
      <meta id="start-marker"/>
      <style id="component-style">
        .container { min-height: 100vh; }
        .hero { text-align: center; }
      </style>
      <main>
        <div class="container">
          <header class="hero">
            <div class="hero-content">
              <h1 class="title">Title</h1>
              <p class="subtitle">Subtitle</p>
            </div>
          </header>
          <section class="demo-section">
            <h2 class="section-title">Demo</h2>
            <div class="button-group">
              <button class="btn btn-primary">
                <span class="btn-icon">📡</span>
                Fetch API
              </button>
            </div>
          </section>
        </div>
      </main>
      <meta id="end-marker"/>
    `;

    body.innerHTML = realWorldHTML;

    // Verify structure is intact
    assert.equal(body.children.length, 4); // meta, style, main, meta

    const main = body.children[2];
    assert.equal(main.tagName, 'MAIN');

    const container = main.children[0];
    assert.equal(container.className, 'container');

    const header = container.children[0];
    assert.equal(header.tagName, 'HEADER');

    const section = container.children[1];
    assert.equal(section.tagName, 'SECTION');

    // Most importantly - check that innerHTML doesn't break the structure
    const regeneratedHTML = body.innerHTML;

    // Should not have actual broken closing tags (not part of proper closing tags)
    const actualBrokenTags = /(?<!<)\/\w+>/g.test(regeneratedHTML);
    assert.equal(actualBrokenTags, false);

    // Should have proper closing tags
    assert.ok(regeneratedHTML.includes('</div>'));
    assert.ok(regeneratedHTML.includes('</main>'));
    assert.ok(regeneratedHTML.includes('</section>'));
    assert.ok(regeneratedHTML.includes('</header>'));

    // Structure should be preserved
    assert.ok(regeneratedHTML.includes('<main>'));
    assert.ok(regeneratedHTML.includes('<div class="container">'));
    assert.ok(regeneratedHTML.includes('<header class="hero">'));
    assert.ok(regeneratedHTML.includes('<section class="demo-section">'));
  });
});
