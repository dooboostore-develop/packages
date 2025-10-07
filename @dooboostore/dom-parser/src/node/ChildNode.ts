import { Node } from './Node';

/**
 * The **`ChildNode`** interface contains methods and properties that are common to all types of Node objects that can have a parent.
 * 
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/ChildNode)
 */
export interface ChildNode extends Node {
    /**
     * Inserts nodes just after node, while replacing strings in nodes with equivalent Text nodes.
     *
     * Throws a "HierarchyRequestError" DOMException if the constraints of the node tree are violated.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CharacterData/after)
     */
    after(...nodes: (Node | string)[]): void;

    /**
     * Inserts nodes just before node, while replacing strings in nodes with equivalent Text nodes.
     *
     * Throws a "HierarchyRequestError" DOMException if the constraints of the node tree are violated.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CharacterData/before)
     */
    before(...nodes: (Node | string)[]): void;

    /**
     * Removes node.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CharacterData/remove)
     */
    remove(): void;

    /**
     * Replaces node with nodes, while replacing strings in nodes with equivalent Text nodes.
     *
     * Throws a "HierarchyRequestError" DOMException if the constraints of the node tree are violated.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CharacterData/replaceWith)
     */
    replaceWith(...nodes: (Node | string)[]): void;
}