import { describe, it, expect, beforeEach } from 'vitest';
import { parserHTML } from '../../../src/index';

describe('innerHTML Complex Real-world Cases', () => {
  let document: any;

  beforeEach(() => {
    const window = parserHTML('<html><body></body></html>');
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
    expect(container.children.length).toBe(1);
    const mainDiv = container.children[0];
    expect(mainDiv.tagName).toBe('DIV');
    expect(mainDiv.className).toBe('container');
    
    // Check nested structure
    expect(mainDiv.children.length).toBe(2); // header and section
    
    const header = mainDiv.children[0];
    expect(header.tagName).toBe('HEADER');
    expect(header.className).toBe('hero');
    
    const section = mainDiv.children[1];
    expect(section.tagName).toBe('SECTION');
    expect(section.className).toBe('demo-section');
    
    // Check innerHTML consistency
    const regeneratedHTML = container.innerHTML;
    expect(regeneratedHTML).toContain('<div class="container">');
    expect(regeneratedHTML).toContain('<header class="hero">');
    expect(regeneratedHTML).toContain('<h1 class="title">Test Title</h1>');
    // Should not have actual broken closing tags
    const actualBrokenTags = /(?<!<)\/\w+>/g.test(regeneratedHTML);
    expect(actualBrokenTags).toBe(false);
    expect(regeneratedHTML).toContain('</div>');
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
    expect(body.children.length).toBe(4); // meta, style, main, meta
    
    const meta1 = body.children[0];
    expect(meta1.tagName).toBe('META');
    expect(meta1.getAttribute('id')).toBe('test-start');
    
    const style = body.children[1];
    expect(style.tagName).toBe('STYLE');
    expect(style.getAttribute('id')).toBe('test-style');
    expect(style.textContent).toContain('.container { display: flex; }');
    
    const main = body.children[2];
    expect(main.tagName).toBe('MAIN');
    
    const meta2 = body.children[3];
    expect(meta2.tagName).toBe('META');
    expect(meta2.getAttribute('id')).toBe('test-end');
    
    // Check innerHTML regeneration
    const regeneratedHTML = body.innerHTML;
    expect(regeneratedHTML).toContain('<meta id="test-start" />');
    expect(regeneratedHTML).toContain('<style id="test-style">');
    expect(regeneratedHTML).toContain('</style>');
    expect(regeneratedHTML).toContain('<main>');
    expect(regeneratedHTML).toContain('</main>');
    expect(regeneratedHTML).toContain('<meta id="test-end" />');
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
    expect(current.className).toBe('level1');
    
    current = current.children[0]; // level2
    expect(current.className).toBe('level2');
    
    current = current.children[0]; // level3
    expect(current.className).toBe('level3');
    
    current = current.children[0]; // level4
    expect(current.className).toBe('level4');
    
    current = current.children[0]; // level5
    expect(current.className).toBe('level5');
    
    const span = current.children[0];
    expect(span.tagName).toBe('SPAN');
    expect(span.textContent).toBe('Deep content');
    
    // Check innerHTML consistency - should not have broken closing tags
    const regeneratedHTML = root.innerHTML;
    const actualBrokenTags = /(?<!<)\/\w+>/g.test(regeneratedHTML);
    expect(actualBrokenTags).toBe(false); // Should not have broken tags
    expect(regeneratedHTML).toContain('</div>'); // Should have proper closing tags
    
    // Count opening and closing div tags
    const openingDivs = (regeneratedHTML.match(/<div/g) || []).length;
    const closingDivs = (regeneratedHTML.match(/<\/div>/g) || []).length;
    expect(openingDivs).toBe(closingDivs); // Should be balanced
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
    expect(body.children.length).toBe(4); // meta, style, main, meta
    
    const main = body.children[2];
    expect(main.tagName).toBe('MAIN');
    
    const container = main.children[0];
    expect(container.className).toBe('container');
    
    const header = container.children[0];
    expect(header.tagName).toBe('HEADER');
    
    const section = container.children[1];
    expect(section.tagName).toBe('SECTION');
    
    // Most importantly - check that innerHTML doesn't break the structure
    const regeneratedHTML = body.innerHTML;
    
    // Should not have actual broken closing tags (not part of proper closing tags)
    const actualBrokenTags = /(?<!<)\/\w+>/g.test(regeneratedHTML);
    expect(actualBrokenTags).toBe(false);
    
    // Should have proper closing tags
    expect(regeneratedHTML).toContain('</div>');
    expect(regeneratedHTML).toContain('</main>');
    expect(regeneratedHTML).toContain('</section>');
    expect(regeneratedHTML).toContain('</header>');
    
    // Structure should be preserved
    expect(regeneratedHTML).toContain('<main>');
    expect(regeneratedHTML).toContain('<div class="container">');
    expect(regeneratedHTML).toContain('<header class="hero">');
    expect(regeneratedHTML).toContain('<section class="demo-section">');
  });
});