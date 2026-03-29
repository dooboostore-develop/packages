import {NodeFilter} from "./NodeFilter";

/**
 * TreeWalker implementation for traversing DOM nodes
 */
export class TreeWalker {
  private _root: Node;
  private _whatToShow: number;
  private _filter: NodeFilter | null;
  private _currentNode: Node;

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

  get currentNode(): Node {
    return this._currentNode;
  }

  set currentNode(node: Node) {
    this._currentNode = node;
  }

  /**
   * Move to the parent node
   */
  parentNode(): Node | null {
    let node = this._currentNode;
    while (node && node !== this._root) {
      node = (node as any).parentNode;
      if (node && this._acceptNode(node) === NodeFilter.FILTER_ACCEPT) {
        this._currentNode = node;
        return node;
      }
    }
    return null;
  }

  /**
   * Move to the first child node
   */
  firstChild(): Node | null {
    let node = (this._currentNode as any).firstChild;
    while (node) {
      const result = this._acceptNode(node);
      if (result === NodeFilter.FILTER_ACCEPT) {
        this._currentNode = node;
        return node;
      }
      if (result === NodeFilter.FILTER_SKIP) {
        const child = (node as any).firstChild;
        if (child) {
          node = child;
          continue;
        }
      }
      while (node) {
        const next = (node as any).nextSibling;
        if (next) {
          node = next;
          break;
        }
        const parent = (node as any).parentNode;
        if (!parent || parent === this._root || parent === this._currentNode) {
          return null;
        }
        node = parent;
      }
    }
    return null;
  }

  /**
   * Move to the last child node
   */
  lastChild(): Node | null {
    let node = (this._currentNode as any).lastChild;
    while (node) {
      const result = this._acceptNode(node);
      if (result === NodeFilter.FILTER_ACCEPT) {
        this._currentNode = node;
        return node;
      }
      if (result === NodeFilter.FILTER_SKIP) {
        const child = (node as any).lastChild;
        if (child) {
          node = child;
          continue;
        }
      }
      while (node) {
        const prev = (node as any).previousSibling;
        if (prev) {
          node = prev;
          break;
        }
        const parent = (node as any).parentNode;
        if (!parent || parent === this._root || parent === this._currentNode) {
          return null;
        }
        node = parent;
      }
    }
    return null;
  }

  /**
   * Move to the previous sibling node
   */
  previousSibling(): Node | null {
    let node = this._currentNode;
    if (node === this._root) return null;

    while (node) {
      let sibling = (node as any).previousSibling;
      while (sibling) {
        const result = this._acceptNode(sibling);
        if (result === NodeFilter.FILTER_ACCEPT) {
          this._currentNode = sibling;
          return sibling;
        }
        if (result === NodeFilter.FILTER_SKIP) {
          const lastChild = (sibling as any).lastChild;
          if (lastChild) {
            sibling = lastChild;
            continue;
          }
        }
        sibling = (sibling as any).previousSibling;
      }
      node = (node as any).parentNode;
      if (!node || node === this._root || this._acceptNode(node) === NodeFilter.FILTER_ACCEPT) {
        return null;
      }
    }
    return null;
  }

  /**
   * Move to the next sibling node
   */
  nextSibling(): Node | null {
    let node = this._currentNode;
    if (node === this._root) return null;

    while (node) {
      let sibling = (node as any).nextSibling;
      while (sibling) {
        const result = this._acceptNode(sibling);
        if (result === NodeFilter.FILTER_ACCEPT) {
          this._currentNode = sibling;
          return sibling;
        }
        if (result === NodeFilter.FILTER_SKIP) {
          const firstChild = (sibling as any).firstChild;
          if (firstChild) {
            sibling = firstChild;
            continue;
          }
        }
        sibling = (sibling as any).nextSibling;
      }
      node = (node as any).parentNode;
      if (!node || node === this._root || this._acceptNode(node) === NodeFilter.FILTER_ACCEPT) {
        return null;
      }
    }
    return null;
  }

  /**
   * Move to the previous node in document order
   */
  previousNode(): Node | null {
    let node = this._currentNode;
    while (node && node !== this._root) {
      const sibling = (node as any).previousSibling;
      if (sibling) {
        node = sibling;
        while (true) {
          const result = this._acceptNode(node);
          if (result !== NodeFilter.FILTER_REJECT && (node as any).lastChild) {
            node = (node as any).lastChild;
          } else {
            if (result === NodeFilter.FILTER_ACCEPT) {
              this._currentNode = node;
              return node;
            }
            break;
          }
        }
        continue;
      }

      node = (node as any).parentNode;
      if (node) {
        if (this._acceptNode(node) === NodeFilter.FILTER_ACCEPT) {
          this._currentNode = node;
          return node;
        }
      }
    }
    return null;
  }

  /**
   * Move to the next node in document order
   */
  nextNode(): Node | null {
    let node = this._currentNode;
    let result = NodeFilter.FILTER_ACCEPT;

    while (true) {
      if (result !== NodeFilter.FILTER_REJECT) {
        const firstChild = (node as any).firstChild;
        if (firstChild) {
          node = firstChild;
          result = this._acceptNode(node);
          if (result === NodeFilter.FILTER_ACCEPT) {
            this._currentNode = node;
            return node;
          }
          continue;
        }
      }

      while (node) {
        if (node === this._root) return null;
        const nextSibling = (node as any).nextSibling;
        if (nextSibling) {
          node = nextSibling;
          break;
        }
        node = (node as any).parentNode;
      }

      if (!node) return null;

      result = this._acceptNode(node);
      if (result === NodeFilter.FILTER_ACCEPT) {
        this._currentNode = node;
        return node;
      }
    }
  }

  /**
   * Check node acceptance
   */
  private _acceptNode(node: Node): number {
    const nodeTypeMask = 1 << (node.nodeType - 1);
    if (!(this._whatToShow & nodeTypeMask)) {
      return NodeFilter.FILTER_SKIP;
    }

    if (this._filter) {
      if (typeof this._filter === 'function') {
        return (this._filter as any)(node);
      }
      return this._filter.acceptNode(node);
    }

    return NodeFilter.FILTER_ACCEPT;
  }
}
