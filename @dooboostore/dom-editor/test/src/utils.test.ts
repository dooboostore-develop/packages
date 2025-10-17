/**
 * @jest-environment jsdom
 */

import {
  isDescendant,
  canDrop,
  calculateDropPosition,
  clearHighlights,
  generateUniqueId,
  animateElement,
  cloneElement,
  getValidHtmlTags,
  isValidHtmlTag,
  sanitizeHtml,
  debounce,
  throttle
} from '../../src/utils';

describe('Utils', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('isDescendant', () => {
    test('should return true if parent is descendant of child', () => {
      const grandparent = document.createElement('div');
      const parent = document.createElement('div');
      const child = document.createElement('div');
      
      grandparent.appendChild(parent);
      parent.appendChild(child);
      
      expect(isDescendant(parent, grandparent)).toBe(true);
      expect(isDescendant(child, grandparent)).toBe(true);
    });

    test('should return false if parent is not descendant of child', () => {
      const parent = document.createElement('div');
      const child = document.createElement('div');
      
      expect(isDescendant(parent, child)).toBe(false);
    });
  });

  describe('canDrop', () => {
    test('should return false if elements are the same', () => {
      const element = document.createElement('div');
      expect(canDrop(element, element)).toBe(false);
    });

    test('should return false if target is descendant of dragged', () => {
      const parent = document.createElement('div');
      const child = document.createElement('div');
      parent.appendChild(child);
      
      expect(canDrop(parent, child)).toBe(false);
    });

    test('should return true for valid drop', () => {
      const element1 = document.createElement('div');
      const element2 = document.createElement('div');
      
      expect(canDrop(element1, element2)).toBe(true);
    });
  });

  describe('calculateDropPosition', () => {
    test('should return child for container elements', () => {
      const container = document.createElement('div');
      container.classList.add('container');
      
      // Mock getBoundingClientRect
      container.getBoundingClientRect = jest.fn(() => ({
        top: 0,
        left: 0,
        bottom: 100,
        right: 100,
        width: 100,
        height: 100,
        x: 0,
        y: 0,
        toJSON: () => {}
      }));
      
      const position = calculateDropPosition(container, 50, 50);
      expect(position).toBe('child');
    });

    test('should calculate position for draggable elements', () => {
      const element = document.createElement('div');
      element.classList.add('draggable');
      
      // Mock getBoundingClientRect
      element.getBoundingClientRect = jest.fn(() => ({
        top: 0,
        left: 0,
        bottom: 100,
        right: 100,
        width: 100,
        height: 100,
        x: 0,
        y: 0,
        toJSON: () => {}
      }));
      
      // Test top area (before)
      expect(calculateDropPosition(element, 50, 10)).toBe('before');
      
      // Test middle area (child)
      expect(calculateDropPosition(element, 50, 50)).toBe('child');
      
      // Test bottom area (after)
      expect(calculateDropPosition(element, 50, 90)).toBe('after');
    });
  });

  describe('clearHighlights', () => {
    test('should remove drag-related classes', () => {
      const element1 = document.createElement('div');
      const element2 = document.createElement('div');
      
      element1.classList.add('drag-over', 'drag-over-before');
      element2.classList.add('drag-over-after', 'drag-over-child');
      
      document.body.appendChild(element1);
      document.body.appendChild(element2);
      
      clearHighlights();
      
      expect(element1.classList.contains('drag-over')).toBe(false);
      expect(element1.classList.contains('drag-over-before')).toBe(false);
      expect(element2.classList.contains('drag-over-after')).toBe(false);
      expect(element2.classList.contains('drag-over-child')).toBe(false);
    });
  });

  describe('generateUniqueId', () => {
    test('should generate unique IDs', () => {
      const id1 = generateUniqueId();
      const id2 = generateUniqueId();
      
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^element-\d+-[a-z0-9]+$/);
    });

    test('should use custom prefix', () => {
      const id = generateUniqueId('custom');
      expect(id).toMatch(/^custom-\d+-[a-z0-9]+$/);
    });
  });

  describe('animateElement', () => {
    test('should add and remove animation class', async () => {
      const element = document.createElement('div');
      const className = 'test-animation';
      
      const promise = animateElement(element, className, { duration: 50 });
      
      expect(element.classList.contains(className)).toBe(true);
      
      await promise;
      
      expect(element.classList.contains(className)).toBe(false);
    });

    test('should call onComplete callback', async () => {
      const element = document.createElement('div');
      const onComplete = jest.fn();
      
      await animateElement(element, 'test', { duration: 50, onComplete });
      
      expect(onComplete).toHaveBeenCalled();
    });
  });

  describe('cloneElement', () => {
    test('should clone element without editor attributes', () => {
      const original = document.createElement('div');
      original.id = 'test';
      original.className = 'test-class';
      original.setAttribute('data-drag-initialized', 'true');
      original.textContent = 'Test content';
      
      // Add action buttons
      const actionButtons = document.createElement('div');
      actionButtons.className = 'action-buttons';
      original.appendChild(actionButtons);
      
      const clone = cloneElement(original);
      
      expect(clone.id).toBe('test');
      expect(clone.className).toBe('test-class');
      expect(clone.textContent).toBe('Test content');
      expect(clone.hasAttribute('data-drag-initialized')).toBe(false);
      expect(clone.querySelector('.action-buttons')).toBeNull();
    });
  });

  describe('getValidHtmlTags', () => {
    test('should return array of valid HTML tags', () => {
      const tags = getValidHtmlTags();
      
      expect(Array.isArray(tags)).toBe(true);
      expect(tags.length).toBeGreaterThan(0);
      expect(tags).toContain('div');
      expect(tags).toContain('span');
      expect(tags).toContain('p');
    });
  });

  describe('isValidHtmlTag', () => {
    test('should validate HTML tag names', () => {
      expect(isValidHtmlTag('div')).toBe(true);
      expect(isValidHtmlTag('DIV')).toBe(true);
      expect(isValidHtmlTag('span')).toBe(true);
      expect(isValidHtmlTag('invalid-tag')).toBe(false);
      expect(isValidHtmlTag('script')).toBe(false);
    });
  });

  describe('sanitizeHtml', () => {
    test('should remove script tags', () => {
      const html = '<div>Safe content</div><script>alert("xss")</script>';
      const sanitized = sanitizeHtml(html);
      
      expect(sanitized).toContain('Safe content');
      expect(sanitized).not.toContain('script');
      expect(sanitized).not.toContain('alert');
    });

    test('should remove dangerous attributes', () => {
      const html = '<div onclick="alert()" onload="evil()">Content</div>';
      const sanitized = sanitizeHtml(html);
      
      expect(sanitized).toContain('Content');
      expect(sanitized).not.toContain('onclick');
      expect(sanitized).not.toContain('onload');
    });
  });

  describe('debounce', () => {
    test('should debounce function calls', (done) => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);
      
      debouncedFn();
      debouncedFn();
      debouncedFn();
      
      expect(mockFn).not.toHaveBeenCalled();
      
      setTimeout(() => {
        expect(mockFn).toHaveBeenCalledTimes(1);
        done();
      }, 150);
    });
  });

  describe('throttle', () => {
    test('should throttle function calls', (done) => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 100);
      
      throttledFn();
      throttledFn();
      throttledFn();
      
      expect(mockFn).toHaveBeenCalledTimes(1);
      
      setTimeout(() => {
        throttledFn();
        expect(mockFn).toHaveBeenCalledTimes(2);
        done();
      }, 150);
    });
  });
});