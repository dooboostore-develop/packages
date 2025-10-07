import { HTMLElementBase } from './HTMLElementBase';

/**
 * The **`HTMLUListElement`** class represents an HTML `<ul>` element.
 * 
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLUListElement)
 */
export class HTMLUListElement extends HTMLElementBase {
    constructor(tagName: string, ownerDocument?: any) {
        super(tagName, ownerDocument);
    }
}