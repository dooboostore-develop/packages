import { HTMLElementBase } from './HTMLElementBase';

/**
 * The **`HTMLPElement`** class represents an HTML `<p>` element.
 * 
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLParagraphElement)
 */
export class HTMLPElement extends HTMLElementBase  {
    constructor(tagName: string, ownerDocument?: any) {
        super(tagName, ownerDocument);
    }
}