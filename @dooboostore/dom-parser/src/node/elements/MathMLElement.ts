import { ElementBase } from './ElementBase';
import {HTMLElement} from "./HTMLElement";

/**
 * The **`MathMLElement`** class represents the base class for all MathML elements.
 * 
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/MathMLElement)
 */
export class MathMLElement extends HTMLElement {
    constructor(tagName: string, ownerDocument?: any) {
        // Preserve the qualified name case (e.g. "annotation-xml");
        // tagName upper-casing applies to HTML-namespace elements only.
        super(tagName, ownerDocument);
    }

    get namespaceURI(): string | null {
        return 'http://www.w3.org/1998/Math/MathML';
    }
}