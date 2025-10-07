import { HTMLElementBase } from './HTMLElementBase';

/**
 * The **`HTMLH1Element`** class represents an HTML `<h1>` element.
 * 
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLHeadingElement)
 */
export class HTMLH1Element extends HTMLElementBase {
    constructor(tagName: string, ownerDocument?: any) {
        super(tagName, ownerDocument);
    }
}