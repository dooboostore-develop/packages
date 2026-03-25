import { Node } from './Node';
import { NodeFilter } from './NodeFilter';

export { NodeFilter };

/**
 * NodeIterator implementation for traversing DOM nodes
 */
export class NodeIterator {
  private _root: Node;
  private _whatToShow: number;
  private _filter: NodeFilter | null;
  private _currentNode: Node;
  private _beforeReferenceNode: boolean = true;

  constructor(root: Node, whatToShow: number = NodeFilter.SHOW_ALL, filter: NodeFilter | null = null) {
    this._root = root;
    this._whatToShow = whatToShow;
    this._filter = filter;
    this._currentNode = root;
  }

  get root(): Node {
    return this._root;
  }

  get whatToShow(): number {
    return this._whatToShow;
  }

  get filter(): NodeFilter | null {
    return this._filter;
  }

  get referenceNode(): Node {
    return this._currentNode;
  }

  get pointerBeforeReferenceNode(): boolean {
    return this._beforeReferenceNode;
  }

  /**
   * Move to the next node in document order
   */
  nextNode(): Node | null {
    let node = this._currentNode;

    if (this._beforeReferenceNode) {
      this._beforeReferenceNode = false;
      if (this._acceptNode(node)) {
        return node;
      }
    }

    while (node) {
      const firstChild = (node as any).firstChild;
      if (firstChild) {
        node = firstChild;
        if (this._acceptNode(node)) {
          this._currentNode = node;
          return node;
        }
        continue;
      }

      while (node && !(node as any).nextSibling) {
        node = (node as any).parentNode;
        if (!node || node === (this._root as any).parentNode) {
          return null;
        }
      }

      if (!node) {
        return null;
      }

      node = (node as any).nextSibling;
      if (this._acceptNode(node)) {
        this._currentNode = node;
        return node;
      }
    }

    return null;
  }

  /**
   * Move to the previous node in document order
   */
  previousNode(): Node | null {
    let node = this._currentNode;

    if (!this._beforeReferenceNode) {
      this._beforeReferenceNode = true;
      if (this._acceptNode(node)) {
        return node;
      }
    }

    while (node && node !== this._root) {
      const prevSibling = (node as any).previousSibling;
      if (prevSibling) {
        node = prevSibling;
        while ((node as any).lastChild) {
          node = (node as any).lastChild;
        }

        if (this._acceptNode(node)) {
          this._currentNode = node;
          return node;
        }
        continue;
      }

      node = (node as any).parentNode;
      if (!node || node === (this._root as any).parentNode) {
        return null;
      }

      if (this._acceptNode(node)) {
        this._currentNode = node;
        return node;
      }
    }

    return null;
  }

  detach(): void {}

  private _acceptNode(node: Node | null): boolean {
    if (!node) {
      return false;
    }

    const nodeTypeMask = 1 << (node.nodeType - 1);
    if (!(this._whatToShow & nodeTypeMask)) {
      return false;
    }

    if (this._filter) {
      const result = this._filter.acceptNode(node);
      return result === NodeFilter.FILTER_ACCEPT;
    }

    return true;
  }
}
