import { ChildNodeBase } from './ChildNodeBase';
import { HTMLCollectionImp } from './collection/HTMLCollectionImp';
import { NodeListOfImp } from './collection/NodeListOfImp';
import { ELEMENT_NODE, TEXT_NODE } from './Node';
import { TextBase } from './TextBase';
import { CSSSelector } from '../utils/CSSSelector';

/**
 * Base implementation of the ParentNode interface
 */
export abstract class ParentNodeBase extends ChildNodeBase implements ParentNode {

    // ParentNode interface implementation
    get childElementCount(): number {
        let count = 0;
        for (const child of this._childNodesInternal) {
            if (child && child.nodeType === ELEMENT_NODE) {
                count++;
            }
        }
        return count;
    }

    get children(): HTMLCollection {
        const elements: Element[] = [];
        for (const child of this._childNodesInternal) {
            if (child && child.nodeType === ELEMENT_NODE) {
                elements.push(child as unknown as Element);
            }
        }
        return new HTMLCollectionImp(elements) as unknown as HTMLCollection;
    }

    get firstElementChild(): Element | null {
        for (const child of this._childNodesInternal) {
            if (child && child.nodeType === ELEMENT_NODE) {
                return child as unknown as Element;
            }
        }
        return null;
    }

    get lastElementChild(): Element | null {
        for (let i = this._childNodesInternal.length - 1; i >= 0; i--) {
            const child = this._childNodesInternal[i];
            if (child && child.nodeType === ELEMENT_NODE) {
                return child as unknown as Element;
            }
        }
        return null;
    }

    append(...nodes: (Node | string)[]): void {
        for (const node of nodes) {
            if (typeof node === 'string') {
                const textNode = new TextBase(node, this._ownerDocument);
                this.appendChild(textNode as unknown as Node);
            } else {
                this.appendChild(node);
            }
        }
    }

    prepend(...nodes: (Node | string)[]): void {
        const firstChild = this.firstChild;
        for (const node of nodes) {
            if (typeof node === 'string') {
                const textNode = new TextBase(node, this._ownerDocument);
                this.insertBefore(textNode as unknown as Node, firstChild);
            } else {
                this.insertBefore(node, firstChild);
            }
        }
    }

    replaceChildren(...nodes: (Node | string)[]): void {
        // Remove all existing children
        while (this._childNodesInternal.length > 0) {
            const child = this._childNodesInternal[0];
            if (child) {
                this.removeChild(child as unknown as Node);
            }
        }

        // Add new nodes
        this.append(...nodes);
    }

    // Query selector implementation
    querySelector<E extends Element>(selectors: string): E | null {
        const elements = this.querySelectorAll(selectors);
        return elements.length > 0 ? elements.item(0) as E: null;
    }

    querySelectorAll<E extends Element = Element>(selectors: string): NodeListOf<E> {
        const results: E[] = [];
        
        // Split selectors by comma and process each one
        const selectorList = selectors.split(',').map(s => s.trim());
        
        for (const selector of selectorList) {
            if (selector) {
                this._querySelectorAllRecursive(selector, results);
            }
        }
        
        // Remove duplicates while preserving order
        const uniqueResults: E[] = [];
        const seen = new Set();
        for (const element of results) {
            if (!seen.has(element)) {
                seen.add(element);
                uniqueResults.push(element);
            }
        }
        
        return new NodeListOfImp<E>(uniqueResults) as unknown as NodeListOf<E>;
    }

    // Private helper methods for querySelector
    private _querySelectorAllRecursive(selectors: string, results: Element[]): void {
        for (const child of this._childNodesInternal) {
            if (child && child.nodeType === ELEMENT_NODE) {
                const element = child as unknown as Element;

                // Check if this element matches the selector
                if (CSSSelector.matches(element, selectors)) {
                    results.push(element);
                }

                // Recursively search in child elements
                if (child instanceof ParentNodeBase) {
                    child._querySelectorAllRecursive(selectors, results);
                }
            }
        }
    }


}

// TextNode is now in a separate file