import { ELEMENT_NODE } from './Node';
import { NodeBase } from './NodeBase';

/**
 * Base implementation of the ChildNode interface
 */
// @ts-ignore
export abstract class ChildNodeBase extends NodeBase implements ChildNode {
  get nextElementSibling(): Element | null {
    let next = this.nextSibling;
    while (next) {
      if (next.nodeType === ELEMENT_NODE) return next as unknown as Element;
      next = next.nextSibling;
    }
    return null;
  }

  get previousElementSibling(): Element | null {
    let prev = this.previousSibling;
    while (prev) {
      if (prev.nodeType === ELEMENT_NODE) return prev as unknown as Element;
      prev = prev.previousSibling;
    }
    return null;
  }

  get assignedSlot(): any | null {
    return null;
  }

  // ChildNode interface implementation
  after(...nodes: (Node | string)[]): void {
    if (!this.parentNode) return;

    const nextSibling = this.nextSibling;
    for (const node of nodes) {
      if (typeof node === 'string') {
        const { TextBase } = require('./TextBase');
        const textNode = new TextBase(node, this._ownerDocument);
        this.parentNode.insertBefore(textNode, nextSibling);
      } else {
        this.parentNode.insertBefore(node, nextSibling);
      }
    }
  }

  before(...nodes: (Node | string)[]): void {
    if (!this.parentNode) return;

    for (const node of nodes) {
      if (typeof node === 'string') {
        const { TextBase } = require('./TextBase');
        const textNode = new TextBase(node, this._ownerDocument);
        this.parentNode.insertBefore(textNode, this as unknown as Node);
      } else {
        this.parentNode.insertBefore(node, this as unknown as Node);
      }
    }
  }

  remove(): void {
    if (this.parentNode) {
      this.parentNode.removeChild(this as unknown as Node);
    }
  }

  replaceWith(...nodes: (Node | string)[]): void {
    if (!this.parentNode) return;

    this.before(...nodes);
    this.remove();
  }
}

// TextNode is now in a separate file
