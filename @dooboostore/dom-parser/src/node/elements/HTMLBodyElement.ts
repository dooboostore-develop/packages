import { HTMLElementBase } from './HTMLElementBase';

/**
 * The **`HTMLBodyElement`** class represents an HTML `<body>` element.
 * 
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLBodyElement)
 */
export class HTMLBodyElement extends HTMLElementBase {
    constructor(tagName: string, ownerDocument?: any) {
        super(tagName, ownerDocument);
    }
}