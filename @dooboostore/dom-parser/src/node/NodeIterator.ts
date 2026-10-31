import { NodeClassRegistry } from './NodeClassRegistry';
import { DOCUMENT_NODE } from './Node';
// Runtime constants (the global NodeFilter name is types-only here and
// would throw a ReferenceError when evaluated).
import { NodeFilter as NodeFilterValues } from './NodeFilter';

/**
 * Returns the node document of a node: the Document itself for document
 * nodes, otherwise the owner document (may be null for detached nodes).
 */
function nodeDocumentOf(node: any): any {
  if (!node) return null;
  if (node.nodeType === DOCUMENT_NODE) return node;
  return node._ownerDocument ?? null;
}

function isInclusiveAncestor(ancestor: any, node: any): boolean {
  let current: any = node;
  while (current) {
    if (current === ancestor) return true;
    current = current.parentNode;
  }
  return false;
}

/** First node following `node` in tree order, excluding its descendants. */
function firstFollowingNode(node: any): any {
  let current: any = node;
  while (current) {
    if (current.nextSibling) return current.nextSibling;
    current = current.parentNode;
  }
  return null;
}

/** Next node in preorder (includes descendants). */
function nextInPreorder(node: any): any {
  if (node.firstChild) return node.firstChild;
  let current: any = node;
  while (current) {
    if (current.nextSibling) return current.nextSibling;
    current = current.parentNode;
  }
  return null;
}

/** Deepest last inclusive descendant in tree order. */
function lastInclusiveDescendant(node: any): any {
  let current: any = node;
  while (current && current.lastChild) {
    current = current.lastChild;
  }
  return current;
}

/**
 * Runs the DOM Standard "NodeIterator pre-remove steps" for every live
 * iterator whose root is in the removed node's document: an iterator whose
 * reference is the removed node (or one of its descendants) is rewound so
 * traversal continues at the right place instead of dead-ending on the
 * detached node. See https://github.com/jsdom/jsdom/issues/3040 and
 * https://github.com/dooboostore-develop/packages/issues/19.
 */
export function adjustNodeIteratorsOnRemove(toBeRemovedNode: any): void {
  const nodeDoc = nodeDocumentOf(toBeRemovedNode);
  const registry: Set<NodeIterator> | undefined =
    nodeDoc != null ? (nodeDoc as any)._activeNodeIterators : undefined;
  if (!registry || registry.size === 0) {
    // Fall back to the shared registry for iterators whose document is
    // unknown (e.g. directly constructed on detached trees).
    adjustInRegistry(sharedNodeIterators, toBeRemovedNode);
    return;
  }
  adjustInRegistry(registry, toBeRemovedNode);
  if (sharedNodeIterators.size > 0) {
    adjustInRegistry(sharedNodeIterators, toBeRemovedNode);
  }
}

function adjustInRegistry(registry: Set<NodeIterator>, toBeRemovedNode: any): void {
  for (const iterator of Array.from(registry)) {
    adjustIterator(iterator, toBeRemovedNode);
  }
}

/** Shared registry for iterators whose document cannot be determined. */
const sharedNodeIterators = new Set<NodeIterator>();

function registerNodeIterator(iterator: NodeIterator, root: any): void {
  const doc = nodeDocumentOf(root);
  if (doc != null) {
    if (!(doc as any)._activeNodeIterators) {
      (doc as any)._activeNodeIterators = new Set<NodeIterator>();
    }
    (doc as any)._activeNodeIterators.add(iterator);
  } else {
    sharedNodeIterators.add(iterator);
  }
}

/**
 * Adjusts one iterator per "adjust a node pointer":
 * https://dom.spec.whatwg.org/#concept-nodeiterator-adjust-pointer
 *
 * - Not adjusted when the removed node is not an inclusive ancestor of the
 *   reference, or when it is an inclusive ancestor of the root.
 * - With pointer-before-reference: jump to the removed node's first
 *   following node inside the root (fall through when there is none).
 * - Otherwise rewind to the removed node's parent (or to the last
 *   descendant of its previous sibling) with pointer-after-reference.
 */
function adjustIterator(iterator: NodeIterator, toBeRemovedNode: any): void {
  const reference: any = (iterator as any)._currentNode;
  if (reference == null) {
    return;
  }
  if (!isInclusiveAncestor(toBeRemovedNode, reference)) {
    return;
  }
  if (isInclusiveAncestor(toBeRemovedNode, (iterator as any)._root)) {
    return;
  }

  if ((iterator as any)._beforeReferenceNode) {
    let candidate: any = firstFollowingNode(toBeRemovedNode);
    while (candidate != null) {
      if (
        isInclusiveAncestor((iterator as any)._root, candidate) &&
        !isInclusiveAncestor(toBeRemovedNode, candidate)
      ) {
        (iterator as any)._currentNode = candidate;
        (iterator as any)._beforeReferenceNode = true;
        return;
      }
      // A subtree is contiguous in preorder: once outside the root,
      // everything after is outside too.
      if (!isInclusiveAncestor((iterator as any)._root, candidate)) {
        break;
      }
      candidate = nextInPreorder(candidate);
    }
    // No following node inside the root: fall through below.
  }

  const previousSibling: any = toBeRemovedNode.previousSibling ?? null;
  const newNode: any =
    previousSibling == null ? toBeRemovedNode.parentNode : lastInclusiveDescendant(previousSibling);
  (iterator as any)._currentNode = newNode;
  (iterator as any)._beforeReferenceNode = false;
}

/**
 * NodeIterator implementation for traversing DOM nodes
 */
export class NodeIterator {
  private _root: Node;
  private _whatToShow: number;
  private _filter: NodeFilter | null;
  private _currentNode: Node;
  private _beforeReferenceNode: boolean = true;

  constructor(root: Node, whatToShow: number = NodeFilterValues.SHOW_ALL, filter: NodeFilter | null = null) {
    this._root = root;
    this._whatToShow = whatToShow;
    this._filter = filter;
    this._currentNode = root;
    // Register for pre-remove adjustment (see adjustNodeIteratorsOnRemove).
    registerNodeIterator(this, root);
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
    const result = ('acceptNode' in this._filter) ? this._filter.acceptNode(node) : this._filter(node);
    return result === NodeFilterValues.FILTER_ACCEPT;
    }

    return true;
  }
}

NodeClassRegistry.NodeIterator = NodeIterator;
