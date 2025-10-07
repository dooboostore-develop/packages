import { HTMLElementBase } from './HTMLElementBase';
import { Document } from '../Document';

/**
 * The **`HTMLEmbedElement`** interface provides special properties (beyond the regular HTMLElement interface it also has available to it by inheritance) for manipulating `<embed>` elements.
 * 
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLEmbedElement)
 */
export class HTMLEmbedElement extends HTMLElementBase {
    /**
     * A string reflecting the `src` HTML attribute, containing the address of the resource.
     */
    src: string = '';

    /**
     * A string reflecting the `type` HTML attribute, containing the type of the resource.
     */
    type: string = '';

    /**
     * A string reflecting the `width` HTML attribute, containing the displayed width of the resource in CSS pixels.
     */
    width: string = '';

    /**
     * A string reflecting the `height` HTML attribute, containing the displayed height of the resource in CSS pixels.
     */
    height: string = '';

    constructor(ownerDocument: Document) {
        super('embed', ownerDocument);
    }
}