import { Node } from './Node';
import { NodeListOf } from './collection/NodeListOf';
import { HTMLCollection } from './collection/HTMLCollection';
import { Element } from './elements/Element';
import {HTMLElementDeprecatedTagNameMap, HTMLElementTagNameMap, MathMLElementTagNameMap, SVGElementTagNameMap} from "./elements";

/**
 * The **`ParentNode`** interface contains methods and properties that are common to all types of Node objects that can have children.
 * 
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/ParentNode)
 */
export interface ParentNode extends Node {
    /**
     * Returns the number of child elements of this ParentNode.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/childElementCount)
     */
    readonly childElementCount: number;

    /**
     * Returns the child elements.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/children)
     */
    readonly children: HTMLCollection;

    /**
     * Returns the first child that is an element, and null otherwise.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/firstElementChild)
     */
    readonly firstElementChild: Element | null;

    /**
     * Returns the last child that is an element, and null otherwise.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/lastElementChild)
     */
    readonly lastElementChild: Element | null;

    /**
     * Inserts nodes after the last child of node, while replacing strings in nodes with equivalent Text nodes.
     *
     * Throws a "HierarchyRequestError" DOMException if the constraints of the node tree are violated.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/append)
     */
    append(...nodes: (Node | string)[]): void;

    /**
     * Inserts nodes before the first child of node, while replacing strings in nodes with equivalent Text nodes.
     *
     * Throws a "HierarchyRequestError" DOMException if the constraints of the node tree are violated.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/prepend)
     */
    prepend(...nodes: (Node | string)[]): void;

    /**
     * Returns the first element that is a descendant of node that matches selectors.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/querySelector)
     */
    querySelector<K extends keyof HTMLElementTagNameMap>(selectors: K): HTMLElementTagNameMap[K] | null;
    querySelector<K extends keyof SVGElementTagNameMap>(selectors: K): SVGElementTagNameMap[K] | null;
    querySelector<K extends keyof MathMLElementTagNameMap>(selectors: K): MathMLElementTagNameMap[K] | null;
    /** @deprecated */
    querySelector<K extends keyof HTMLElementDeprecatedTagNameMap>(selectors: K): HTMLElementDeprecatedTagNameMap[K] | null;
    querySelector<E extends Element = Element>(selectors: string): E | null;
    querySelector(selectors: string): Element | null;

    /**
     * Returns all element descendants of node that match selectors.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/querySelectorAll)
     */
    querySelectorAll<K extends keyof HTMLElementTagNameMap>(selectors: K): NodeListOf<HTMLElementTagNameMap[K]>;
    querySelectorAll<K extends keyof SVGElementTagNameMap>(selectors: K): NodeListOf<SVGElementTagNameMap[K]>;
    querySelectorAll<K extends keyof MathMLElementTagNameMap>(selectors: K): NodeListOf<MathMLElementTagNameMap[K]>;
    /** @deprecated */
    querySelectorAll<K extends keyof HTMLElementDeprecatedTagNameMap>(selectors: K): NodeListOf<HTMLElementDeprecatedTagNameMap[K]>;
    querySelectorAll<E extends Element = Element>(selectors: string): NodeListOf<E>;
    querySelectorAll(selectors: string): NodeListOf<Element>;

    /**
     * Replace all children of node with nodes, while replacing strings in nodes with equivalent Text nodes.
     *
     * Throws a "HierarchyRequestError" DOMException if the constraints of the node tree are violated.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/replaceChildren)
     */
    replaceChildren(...nodes: (Node | string)[]): void;
}