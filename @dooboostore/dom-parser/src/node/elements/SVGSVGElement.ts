import { SVGElement } from './SVGElement';

/**
 * The **`SVGSVGElement`** class represents the SVG `<svg>` root element.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/SVGSVGElement)
 */
export class SVGSVGElement extends SVGElement {
    constructor(tagName: string = 'svg', ownerDocument?: any) {
        super(tagName, ownerDocument);
    }
}
