import { ElementBase } from './ElementBase';

/**
 * The **`MathMLElement`** class represents the base class for all MathML elements.
 * 
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/MathMLElement)
 */
export class MathMLElement extends ElementBase {
    constructor(tagName: string, ownerDocument?: any) {
        super(tagName.toUpperCase(), ownerDocument);
    }

    get namespaceURI(): string | null {
        return 'http://www.w3.org/1998/Math/MathML';
    }
}