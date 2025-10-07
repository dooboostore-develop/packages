import { ElementBase } from './ElementBase';

/**
 * The **`SVGElement`** class represents the base class for all SVG elements.
 * 
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/SVGElement)
 */
export class SVGElement extends ElementBase {
    constructor(tagName: string, ownerDocument?: any) {
        super(tagName, ownerDocument);
    }

    get namespaceURI(): string | null {
        return 'http://www.w3.org/2000/svg';
    }
}