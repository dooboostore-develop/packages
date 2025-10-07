import { HTMLElementBase } from './HTMLElementBase';

/**
 * The **`HTMLHeadElement`** class represents an HTML `<head>` element.
 * 
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLHeadElement)
 */
export class HTMLHeadElement extends HTMLElementBase {
    constructor(tagName: string, ownerDocument?: any) {
        super(tagName, ownerDocument);
    }
}