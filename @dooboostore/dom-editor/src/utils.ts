/**
 * Utility functions for DOM Editor
 */

import type { DragPosition, AnimationOptions } from './types';

/**
 * Check if an element is a descendant of another element
 */
export function isDescendant(parent: HTMLElement, child: HTMLElement): boolean {
  let node = parent.parentNode;
  while (node != null) {
    if (node === child) return true;
    node = node.parentNode;
  }
  return false;
}

/**
 * Check if a drop operation is valid
 */
export function canDrop(draggedElement: HTMLElement, targetElement: HTMLElement): boolean {
  if (draggedElement === targetElement) return false;
  if (isDescendant(targetElement, draggedElement)) return false;
  return true;
}

/**
 * Calculate drop position based on mouse/touch coordinates
 */
export function calculateDropPosition(
  targetElement: HTMLElement, 
  x: number, 
  y: number
): DragPosition {
  const rect = targetElement.getBoundingClientRect();

  // Container elements always accept as child
  if (targetElement.classList.contains('container')) {
    return 'child';
  }

  // For draggable elements, determine position based on Y coordinate
  if (targetElement.classList.contains('draggable')) {
    const topThreshold = rect.top + rect.height * 0.3;
    const bottomThreshold = rect.top + rect.height * 0.7;

    if (y >= topThreshold && y <= bottomThreshold) {
      return 'child';
    } else if (y < topThreshold) {
      return 'before';
    } else {
      return 'after';
    }
  }

  return 'child';
}

/**
 * Clear all drag-related CSS classes
 */
export function clearHighlights(): void {
  document.querySelectorAll('.drag-over, .drag-over-before, .drag-over-after, .drag-over-child')
    .forEach(el => {
      el.classList.remove('drag-over', 'drag-over-before', 'drag-over-after', 'drag-over-child');
    });
}

/**
 * Generate a unique ID for elements
 */
export function generateUniqueId(prefix: string = 'element'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Animate element with CSS transitions
 */
export function animateElement(
  element: HTMLElement, 
  className: string, 
  options: AnimationOptions = {}
): Promise<void> {
  return new Promise((resolve) => {
    const { duration = 300, onComplete } = options;
    
    element.classList.add(className);
    
    const cleanup = () => {
      element.classList.remove(className);
      if (onComplete) onComplete();
      resolve();
    };
    
    setTimeout(cleanup, duration);
  });
}

/**
 * Deep clone an element with all its properties
 */
export function cloneElement(element: HTMLElement): HTMLElement {
  const clone = element.cloneNode(true) as HTMLElement;
  
  // Remove any editor-specific attributes
  clone.removeAttribute('data-drag-initialized');
  
  // Remove action buttons if present
  const actionButtons = clone.querySelector('.action-buttons');
  if (actionButtons) {
    actionButtons.remove();
  }
  
  return clone;
}

/**
 * Get all valid HTML tag names
 */
export function getValidHtmlTags(): string[] {
  return [
    'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'header', 'nav', 'main', 'section', 'article', 'aside', 'footer',
    'ul', 'ol', 'li', 'a', 'img', 'button', 'input', 'textarea',
    'select', 'form', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'canvas', 'svg', 'video', 'audio', 'iframe', 'embed', 'object'
  ];
}

/**
 * Validate HTML tag name
 */
export function isValidHtmlTag(tagName: string): boolean {
  return getValidHtmlTags().includes(tagName.toLowerCase());
}

/**
 * Sanitize HTML content
 */
export function sanitizeHtml(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  
  // Remove script tags and event handlers
  div.querySelectorAll('script').forEach(script => script.remove());
  
  // Remove dangerous attributes
  const dangerousAttrs = ['onload', 'onerror', 'onclick', 'onmouseover'];
  div.querySelectorAll('*').forEach(el => {
    dangerousAttrs.forEach(attr => {
      el.removeAttribute(attr);
    });
  });
  
  return div.innerHTML;
}

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number | undefined;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = window.setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function calls
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}