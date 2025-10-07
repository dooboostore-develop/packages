import { ParentNodeBase } from './ParentNodeBase';
import { DocumentFragment } from './DocumentFragment';
import { Document } from './Document';
import {DOCUMENT_FRAGMENT_NODE, ELEMENT_NODE, Node} from './Node';
import { NodeBase } from './NodeBase';
import { Element } from './elements/Element';
import { HTMLElement } from './elements/HTMLElement';
import { HTMLElementTagNameMap, SVGElementTagNameMap, MathMLElementTagNameMap } from './elements';
import { NodeListOf } from './collection/NodeListOf';

/**
 * The **`DocumentFragmentBase`** class is the concrete implementation of the DocumentFragment interface.
 * 
 * DocumentFragment is a minimal document object that has no parent. It is used as a lightweight version of Document
 * that stores a segment of a document structure comprised of nodes just like a standard document.
 */
export class DocumentFragmentBase extends ParentNodeBase implements DocumentFragment {
    constructor(ownerDocument?: Document) {
        super(DOCUMENT_FRAGMENT_NODE, '#document-fragment', ownerDocument); // DOCUMENT_FRAGMENT_NODE = 11
    }

    /**
     * Returns the number of child elements of this DocumentFragment.
     */
    get childElementCount(): number {
        let count = 0;
        for (const child of this._childNodesInternal) {
            if (child && child.nodeType === ELEMENT_NODE) { // ELEMENT_NODE
                count++;
            }
        }
        return count;
    }

    /**
     * Returns the first Element node within the DocumentFragment that matches the specified selectors.
     */
    querySelector<K extends keyof HTMLElementTagNameMap>(selectors: K): HTMLElementTagNameMap[K] | null;
    querySelector<K extends keyof SVGElementTagNameMap>(selectors: K): SVGElementTagNameMap[K] | null;
    querySelector<K extends keyof MathMLElementTagNameMap>(selectors: K): MathMLElementTagNameMap[K] | null;
    querySelector<E extends Element = Element>(selectors: string): E | null;
    querySelector(selectors: string): Element | null;
    querySelector(selectors: string): Element | null {
        const elements = this.querySelectorAll(selectors);
        return elements.length > 0 ? elements.item(0) : null;
    }

    /**
     * Returns all Element nodes within the DocumentFragment that match the specified selectors.
     */
    querySelectorAll<K extends keyof HTMLElementTagNameMap>(selectors: K): NodeListOf<HTMLElementTagNameMap[K]>;
    querySelectorAll<K extends keyof SVGElementTagNameMap>(selectors: K): NodeListOf<SVGElementTagNameMap[K]>;
    querySelectorAll<K extends keyof MathMLElementTagNameMap>(selectors: K): NodeListOf<MathMLElementTagNameMap[K]>;
    querySelectorAll<E extends Element = Element>(selectors: string): NodeListOf<E>;
    querySelectorAll(selectors: string): NodeListOf<Element>;
    querySelectorAll(selectors: string): NodeListOf<Element> {
        // Use the inherited querySelectorAll from ParentNodeBase
        return super.querySelectorAll(selectors);
    }

    /**
     * Returns the Element within the DocumentFragment that has the specified ID.
     */
    getElementById(elementId: string): HTMLElement | null {
        const element = this.querySelector(`#${elementId}`);
        return element as HTMLElement | null;
    }

    /**
     * Override cloneNode to return DocumentFragment
     */
    cloneNode(deep?: boolean): DocumentFragmentBase {
        const clone = new DocumentFragmentBase(this._ownerDocument as Document);
        
        if (deep) {
            for (const child of this._childNodesInternal) {
                if (child && 'cloneNode' in child) {
                    clone.appendChild((child as any).cloneNode(true));
                }
            }
        }
        
        return clone;
    }

    /**
     * Override appendChild to handle DocumentFragment behavior
     * When a DocumentFragment is appended to another node, its children are moved, not the fragment itself
     */
    appendChild<T extends Node>(node: T): T {
        // If the node being appended is a DocumentFragment, move its children instead
        if (node.nodeType === DOCUMENT_FRAGMENT_NODE) {
            const fragment = node as any;
            
            // Move all children from fragment to this node
            while (fragment._childNodesInternal && fragment._childNodesInternal.length > 0) {
                const child = fragment._childNodesInternal[0];
                if (child) {
                    fragment.removeChild(child);
                    super.appendChild(child);
                }
            }
            
            return node;
        }
        
        return super.appendChild(node);
    }
}