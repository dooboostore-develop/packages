import { HTMLElementBase } from './HTMLElementBase';

/**
 * The **`HTMLDivElement`** class represents an HTML `<div>` element.
 * 
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLDivElement)
 */
export class HTMLDivElement extends HTMLElementBase implements HTMLDivElement {
    constructor(tagName: string, ownerDocument?: any) {
        super(tagName, ownerDocument);
    }
}