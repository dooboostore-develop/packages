import { type NodeListOf } from './collection/NodeListOf';
import { NodeList } from './collection/NodeList';
import { type ChildNode } from './ChildNode';
import { type ParentNode } from './ParentNode';
import { type Document } from './Document';
import { type HTMLElement } from './elements/HTMLElement';
import { type GetRootNodeOptions } from './GetRootNodeOptions';
// Node 상수들을 별도로 export
export const ELEMENT_NODE = 1 as const;
export const ATTRIBUTE_NODE = 2 as const;
export const TEXT_NODE = 3 as const;
export const CDATA_SECTION_NODE = 4 as const;
export const ENTITY_REFERENCE_NODE = 5 as const;
export const ENTITY_NODE = 6 as const;
export const PROCESSING_INSTRUCTION_NODE = 7 as const;
export const COMMENT_NODE = 8 as const;
export const DOCUMENT_NODE = 9 as const;
export const DOCUMENT_TYPE_NODE = 10 as const;
export const DOCUMENT_FRAGMENT_NODE = 11 as const;
export const NOTATION_NODE = 12 as const;
export const DOCUMENT_POSITION_DISCONNECTED = 0x01 as const;
export const DOCUMENT_POSITION_PRECEDING = 0x02 as const;
export const DOCUMENT_POSITION_FOLLOWING = 0x04 as const;
export const DOCUMENT_POSITION_CONTAINS = 0x08 as const;
export const DOCUMENT_POSITION_CONTAINED_BY = 0x10 as const;
export const DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC = 0x20 as const;

// Forward declarations for circular dependencies
// interface ChildNode extends Node {}
// interface ParentNode extends Node {}
// interface Document extends Node {}
// interface HTMLElement {}
// interface GetRootNodeOptions {
//     composed?: boolean;
// }

export interface Node {
    /** node is an element. */
    readonly ELEMENT_NODE: 1;
    readonly ATTRIBUTE_NODE: 2;
    /** node is a Text node. */
    readonly TEXT_NODE: 3;
    /** node is a CDATASection node. */
    readonly CDATA_SECTION_NODE: 4;
    readonly ENTITY_REFERENCE_NODE: 5;
    readonly ENTITY_NODE: 6;
    /** node is a ProcessingInstruction node. */
    readonly PROCESSING_INSTRUCTION_NODE: 7;
    /** node is a Comment node. */
    readonly COMMENT_NODE: 8;
    /** node is a document. */
    readonly DOCUMENT_NODE: 9;
    /** node is a doctype. */
    readonly DOCUMENT_TYPE_NODE: 10;
    /** node is a DocumentFragment node. */
    readonly DOCUMENT_FRAGMENT_NODE: 11;
    readonly NOTATION_NODE: 12;
    /** Set when node and other are not in the same tree. */
    readonly DOCUMENT_POSITION_DISCONNECTED: 0x01;
    /** Set when other is preceding node. */
    readonly DOCUMENT_POSITION_PRECEDING: 0x02;
    /** Set when other is following node. */
    readonly DOCUMENT_POSITION_FOLLOWING: 0x04;
    /** Set when other is an ancestor of node. */
    readonly DOCUMENT_POSITION_CONTAINS: 0x08;
    /** Set when other is a descendant of node. */
    readonly DOCUMENT_POSITION_CONTAINED_BY: 0x10;
    readonly DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC: 0x20;


    /**
     * The read-only **`baseURI`** property of the Node interface returns the absolute base URL of the document containing the node.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/baseURI)
     */
    readonly baseURI: string;
    /**
     * The read-only **`childNodes`** property of the Node interface returns a live the first child node is assigned index `0`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/childNodes)
     */
    readonly childNodes: NodeListOf<ChildNode>;
    /**
     * The read-only **`firstChild`** property of the Node interface returns the node's first child in the tree, or `null` if the node has no children.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/firstChild)
     */
    readonly firstChild: ChildNode | null;
    /**
     * The read-only **`isConnected`** property of the Node interface returns a boolean indicating whether the node is connected (directly or indirectly) to a Document object.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/isConnected)
     */
    readonly isConnected: boolean;
    /**
     * The read-only **`lastChild`** property of the Node interface returns the last child of the node, or `null` if there are no child nodes.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/lastChild)
     */
    readonly lastChild: ChildNode | null;
    /**
     * The read-only **`nextSibling`** property of the Node interface returns the node immediately following the specified one in their parent's Node.childNodes, or returns `null` if the specified node is the last child in the parent element.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/nextSibling)
     */
    readonly nextSibling: ChildNode | null;
    /**
     * The read-only **`nodeName`** property of Node returns the name of the current node as a string.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/nodeName)
     */
    readonly nodeName: string;
    /**
     * The read-only **`nodeType`** property of a Node interface is an integer that identifies what the node is.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/nodeType)
     */
    readonly nodeType: number;
    /**
     * The **`nodeValue`** property of the Node interface returns or sets the value of the current node.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/nodeValue)
     */
    nodeValue: string | null;
    /**
     * The read-only **`ownerDocument`** property of the Node interface returns the top-level document object of the node.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/ownerDocument)
     */
    readonly ownerDocument: Document | null;
    /**
     * The read-only **`parentElement`** property of Node interface returns the DOM node's parent Element, or `null` if the node either has no parent, or its parent isn't a DOM Element.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/parentElement)
     */
    readonly parentElement: HTMLElement | null;
    /**
     * The read-only **`parentNode`** property of the Node interface returns the parent of the specified node in the DOM tree.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/parentNode)
     */
    readonly parentNode: ParentNode | null;
    /**
     * The read-only **`previousSibling`** property of the Node interface returns the node immediately preceding the specified one in its parent's or `null` if the specified node is the first in that list.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/previousSibling)
     */
    readonly previousSibling: ChildNode | null;
    /**
     * The **`textContent`** property of the Node interface represents the text content of the node and its descendants.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/textContent)
     */
    textContent: string | null;
    /**
     * The **`appendChild()`** method of the Node interface adds a node to the end of the list of children of a specified parent node.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/appendChild)
     */
    appendChild<T extends Node>(node: T): T;
    /**
     * The **`cloneNode()`** method of the Node interface returns a duplicate of the node on which this method was called.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/cloneNode)
     */
    cloneNode(subtree?: boolean): Node;
    /**
     * The **`compareDocumentPosition()`** method of the Node interface reports the position of its argument node relative to the node on which it is called.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/compareDocumentPosition)
     */
    compareDocumentPosition(other: Node): number;
    /**
     * The **`contains()`** method of the Node interface returns a boolean value indicating whether a node is a descendant of a given node, that is the node itself, one of its direct children (Node.childNodes), one of the children's direct children, and so on.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/contains)
     */
    contains(other: Node | null): boolean;
    /**
     * The **`getRootNode()`** method of the Node interface returns the context object's root, which optionally includes the shadow root if it is available.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/getRootNode)
     */
    getRootNode(options?: GetRootNodeOptions): Node;
    /**
     * The **`hasChildNodes()`** method of the Node interface returns a boolean value indicating whether the given Node has child nodes or not.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/hasChildNodes)
     */
    hasChildNodes(): boolean;
    /**
     * The **`insertBefore()`** method of the Node interface inserts a node before a _reference node_ as a child of a specified _parent node_.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/insertBefore)
     */
    insertBefore<T extends Node>(node: T, child: Node | null): T;
    /**
     * The **`isDefaultNamespace()`** method of the Node interface accepts a namespace URI as an argument.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/isDefaultNamespace)
     */
    isDefaultNamespace(namespace: string | null): boolean;
    /**
     * The **`isEqualNode()`** method of the Node interface tests whether two nodes are equal.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/isEqualNode)
     */
    isEqualNode(otherNode: Node | null): boolean;
    /**
     * The **`isSameNode()`** method of the Node interface is a legacy alias the for the `===` strict equality operator.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/isSameNode)
     */
    isSameNode(otherNode: Node | null): boolean;
    /**
     * The **`lookupNamespaceURI()`** method of the Node interface takes a prefix as parameter and returns the namespace URI associated with it on the given node if found (and `null` if not).
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/lookupNamespaceURI)
     */
    lookupNamespaceURI(prefix: string | null): string | null;
    /**
     * The **`lookupPrefix()`** method of the Node interface returns a string containing the prefix for a given namespace URI, if present, and `null` if not.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/lookupPrefix)
     */
    lookupPrefix(namespace: string | null): string | null;
    /**
     * The **`normalize()`** method of the Node interface puts the specified node and all of its sub-tree into a _normalized_ form.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/normalize)
     */
    normalize(): void;
    /**
     * The **`removeChild()`** method of the Node interface removes a child node from the DOM and returns the removed node.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/removeChild)
     */
    removeChild<T extends Node>(child: T): T;
    /**
     * The **`replaceChild()`** method of the Node interface replaces a child node within the given (parent) node.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/replaceChild)
     */
    replaceChild<T extends Node>(node: Node, child: T): T;
}