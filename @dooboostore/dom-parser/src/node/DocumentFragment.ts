import { Node } from './Node';
import { ParentNode } from './ParentNode';

/**
 * The **`DocumentFragment`** interface represents a minimal document object that has no parent.
 * It is used as a lightweight version of Document that stores a segment of a document structure comprised of nodes just like a standard document.
 * 
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/DocumentFragment)
 */
export interface DocumentFragment extends Node, ParentNode {
    /**
     * Returns the number of child elements of this DocumentFragment.
     */
    readonly childElementCount: number;

    /**
     * Returns the first Element node within the DocumentFragment, in document order, that matches the specified selectors.
     */
    querySelector<K extends keyof HTMLElementTagNameMap>(selectors: K): HTMLElementTagNameMap[K] | null;
    querySelector<K extends keyof SVGElementTagNameMap>(selectors: K): SVGElementTagNameMap[K] | null;
    querySelector<K extends keyof MathMLElementTagNameMap>(selectors: K): MathMLElementTagNameMap[K] | null;
    querySelector<E extends Element = Element>(selectors: string): E | null;
    querySelector(selectors: string): Element | null;

    /**
     * Returns all Element nodes within the DocumentFragment that match the specified selectors.
     */
    querySelectorAll<K extends keyof HTMLElementTagNameMap>(selectors: K): NodeListOf<HTMLElementTagNameMap[K]>;
    querySelectorAll<K extends keyof SVGElementTagNameMap>(selectors: K): NodeListOf<SVGElementTagNameMap[K]>;
    querySelectorAll<K extends keyof MathMLElementTagNameMap>(selectors: K): NodeListOf<MathMLElementTagNameMap[K]>;
    querySelectorAll<E extends Element = Element>(selectors: string): NodeListOf<E>;
    querySelectorAll(selectors: string): NodeListOf<Element>;

    /**
     * Returns the Element within the DocumentFragment that has the specified ID.
     */
    getElementById(elementId: string): HTMLElement | null;
}

// Import types for the interface
import { HTMLElementTagNameMap, SVGElementTagNameMap, MathMLElementTagNameMap } from './elements';
import { Element } from './elements/Element';
import { HTMLElement } from './elements/HTMLElement';
import { NodeListOf } from './collection/NodeListOf';