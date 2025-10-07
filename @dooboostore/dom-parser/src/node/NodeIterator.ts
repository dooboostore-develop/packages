import { Node } from './Node';
import { NodeBase } from './NodeBase';

/**
 * NodeFilter interface for filtering nodes in NodeIterator
 */
export interface NodeFilter {
    acceptNode(node: Node): number;
}

/**
 * NodeFilter constants
 */
export const NodeFilter = {
    // Constants for acceptNode return values
    FILTER_ACCEPT: 1,
    FILTER_REJECT: 2,
    FILTER_SKIP: 3,
    
    // Constants for whatToShow
    SHOW_ALL: 0xFFFFFFFF,
    SHOW_ELEMENT: 0x1,
    SHOW_ATTRIBUTE: 0x2,
    SHOW_TEXT: 0x4,
    SHOW_CDATA_SECTION: 0x8,
    SHOW_ENTITY_REFERENCE: 0x10,
    SHOW_ENTITY: 0x20,
    SHOW_PROCESSING_INSTRUCTION: 0x40,
    SHOW_COMMENT: 0x80,
    SHOW_DOCUMENT: 0x100,
    SHOW_DOCUMENT_TYPE: 0x200,
    SHOW_DOCUMENT_FRAGMENT: 0x400,
    SHOW_NOTATION: 0x800
};

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
        
        // If we're before the reference node, start from the reference node
        if (this._beforeReferenceNode) {
            this._beforeReferenceNode = false;
            if (this._acceptNode(node)) {
                return node;
            }
        }

        // Traverse in document order
        while (node) {
            // First, try to go to first child
            const firstChild = (node as any).firstChild;
            if (firstChild) {
                node = firstChild;
                if (this._acceptNode(node)) {
                    this._currentNode = node;
                    return node;
                }
                continue;
            }

            // If no children, try next sibling
            while (node && !(node as any).nextSibling) {
                node = (node as any).parentNode;
                // Don't go beyond root
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

        // If we're after the reference node, start from the reference node
        if (!this._beforeReferenceNode) {
            this._beforeReferenceNode = true;
            if (this._acceptNode(node)) {
                return node;
            }
        }

        // Traverse in reverse document order
        while (node && node !== this._root) {
            // Try previous sibling
            const prevSibling = (node as any).previousSibling;
            if (prevSibling) {
                node = prevSibling;
                
                // Go to the deepest last child
                while ((node as any).lastChild) {
                    node = (node as any).lastChild;
                }
                
                if (this._acceptNode(node)) {
                    this._currentNode = node;
                    return node;
                }
                continue;
            }

            // Go to parent
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

    /**
     * Detach the iterator (no-op in this implementation)
     */
    detach(): void {
        // Modern browsers don't require this, but we implement for compatibility
    }

    /**
     * Check if a node should be accepted based on whatToShow and filter
     */
    private _acceptNode(node: Node | null): boolean {
        if (!node) {
            return false;
        }

        // Check whatToShow filter
        const nodeTypeMask = 1 << (node.nodeType - 1);
        if (!(this._whatToShow & nodeTypeMask)) {
            return false;
        }

        // Check custom filter
        if (this._filter) {
            const result = this._filter.acceptNode(node);
            return result === NodeFilter.FILTER_ACCEPT;
        }

        return true;
    }
}