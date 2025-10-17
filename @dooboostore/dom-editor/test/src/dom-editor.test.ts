/**
 * @jest-environment jsdom
 */

import { DomEditor } from '../../src/DomEditor';
import type { DomEditorOptions, ElementData } from '../../src/DomEditor';

describe('DomEditor', () => {
  let container: HTMLElement;
  let editor: DomEditor;

  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = '<div id="test-container"></div>';
    container = document.getElementById('test-container')!;
  });

  afterEach(() => {
    if (editor) {
      editor.destroy();
    }
    document.body.innerHTML = '';
  });

  describe('Initialization', () => {
    test('should create editor with default options', () => {
      editor = new DomEditor({ container });
      
      expect(container.classList.contains('dom-editor')).toBe(true);
      expect(container.querySelector('#rootContainer')).toBeTruthy();
      expect(container.querySelector('#propertyPanel')).toBeTruthy();
    });

    test('should create editor with custom options', () => {
      const options: DomEditorOptions = {
        container,
        debug: true,
        dragDelay: 1000,
        enableMobileSupport: false,
        customStyles: '.custom { color: red; }'
      };

      editor = new DomEditor(options);
      
      expect(container.classList.contains('dom-editor')).toBe(true);
      
      // Check if debug element is visible
      const debugElement = container.querySelector('.debug') as HTMLElement;
      expect(debugElement).toBeTruthy();
      expect(debugElement.style.display).not.toBe('none');
    });

    test('should load initial content', () => {
      const initialContent = '<div class="test-element">Test Content</div>';
      
      editor = new DomEditor({
        container,
        initialContent
      });

      const rootContainer = container.querySelector('#rootContainer');
      expect(rootContainer?.innerHTML).toContain('test-element');
      expect(rootContainer?.innerHTML).toContain('Test Content');
    });
  });

  describe('Content Management', () => {
    beforeEach(() => {
      editor = new DomEditor({ container });
    });

    test('should load content', () => {
      const html = '<div class="loaded-content">Loaded</div>';
      editor.loadContent(html);
      
      expect(editor.getContent()).toContain('loaded-content');
      expect(editor.getContent()).toContain('Loaded');
    });

    test('should get content', () => {
      const html = '<div class="test">Content</div>';
      editor.loadContent(html);
      
      const content = editor.getContent();
      expect(content).toContain('test');
      expect(content).toContain('Content');
    });

    test('should export data', () => {
      const html = '<div id="test-div" class="test-class">Test</div>';
      editor.loadContent(html);
      
      const data = editor.exportData();
      expect(data.tagName).toBe('div');
      expect(data.children).toBeDefined();
      expect(data.children!.length).toBeGreaterThan(0);
    });

    test('should import data', () => {
      const data: ElementData = {
        tagName: 'div',
        id: 'imported-element',
        className: 'imported-class',
        textContent: 'Imported Content',
        children: [
          {
            tagName: 'span',
            textContent: 'Child Element'
          }
        ]
      };

      editor.importData(data);
      
      const content = editor.getContent();
      expect(content).toContain('imported-element');
      expect(content).toContain('imported-class');
      expect(content).toContain('Imported Content');
      expect(content).toContain('Child Element');
    });
  });

  describe('Element Management', () => {
    beforeEach(() => {
      editor = new DomEditor({ container });
    });

    test('should handle element selection', () => {
      // Create a test element
      const testElement = document.createElement('div');
      testElement.className = 'draggable';
      testElement.id = 'test-element';
      testElement.textContent = 'Test Element';
      
      const rootContainer = container.querySelector('#rootContainer')!;
      rootContainer.appendChild(testElement);
      
      // Simulate click to select element
      const clickEvent = new MouseEvent('click', { bubbles: true });
      testElement.dispatchEvent(clickEvent);
      
      // Check if element is selected
      expect(testElement.classList.contains('selected')).toBe(true);
      
      // Check if property panel is shown
      const propertyPanel = container.querySelector('#propertyPanel');
      expect(propertyPanel?.classList.contains('active')).toBe(true);
    });

    test('should handle element deselection', () => {
      // First select an element
      const testElement = document.createElement('div');
      testElement.className = 'draggable selected';
      testElement.id = 'test-element';
      
      const rootContainer = container.querySelector('#rootContainer')!;
      rootContainer.appendChild(testElement);
      
      // Simulate background click to deselect
      const clickEvent = new MouseEvent('click', { bubbles: true });
      document.body.dispatchEvent(clickEvent);
      
      // Check if element is deselected
      expect(testElement.classList.contains('selected')).toBe(false);
      
      // Check if property panel is hidden
      const propertyPanel = container.querySelector('#propertyPanel');
      expect(propertyPanel?.classList.contains('active')).toBe(false);
    });
  });

  describe('Utility Functions', () => {
    beforeEach(() => {
      editor = new DomEditor({ container });
    });

    test('should destroy editor properly', () => {
      const initialHTML = container.innerHTML;
      
      editor.destroy();
      
      // Container should be empty after destroy
      expect(container.innerHTML).toBe('');
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid container', () => {
      expect(() => {
        new DomEditor({ container: null as any });
      }).toThrow();
    });

    test('should handle invalid HTML content', () => {
      editor = new DomEditor({ container });
      
      // Should not throw error with invalid HTML
      expect(() => {
        editor.loadContent('<div><span>Unclosed div');
      }).not.toThrow();
    });
  });

  describe('Mobile Support', () => {
    beforeEach(() => {
      editor = new DomEditor({ 
        container,
        enableMobileSupport: true 
      });
    });

    test('should handle touch events when mobile support is enabled', () => {
      const testElement = document.createElement('div');
      testElement.className = 'draggable';
      testElement.id = 'touch-test';
      
      const rootContainer = container.querySelector('#rootContainer')!;
      rootContainer.appendChild(testElement);
      
      // Simulate touch start
      const touchEvent = new TouchEvent('touchstart', {
        touches: [new Touch({
          identifier: 0,
          target: testElement,
          clientX: 100,
          clientY: 100
        })]
      });
      
      expect(() => {
        testElement.dispatchEvent(touchEvent);
      }).not.toThrow();
    });
  });
});