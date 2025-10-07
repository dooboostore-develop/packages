import { HTMLElementBase } from './HTMLElementBase';

/**
 * The **`HTMLSpanElement`** class represents an HTML `<span>` element.
 * 
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLSpanElement)
 */
export class HTMLSpanElement extends HTMLElementBase {
    constructor(tagName: string, ownerDocument?: any) {
        super(tagName, ownerDocument);
    }
}