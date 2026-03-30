import { HTMLElementBase } from './HTMLElementBase';
import {HTMLElement} from "./HTMLElement";

/**
 * The **`HTMLBodyElement`** class represents an HTML `<body>` element.
 * 
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLBodyElement)
 */
export class HTMLBodyElement extends HTMLElement {
    constructor(tagName: string, ownerDocument?: any) {
        super(tagName, ownerDocument);
    }
}