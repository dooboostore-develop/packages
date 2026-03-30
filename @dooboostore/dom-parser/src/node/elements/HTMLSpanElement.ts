import { HTMLElementBase } from './HTMLElementBase';
import {HTMLElement} from "./HTMLElement";

/**
 * The **`HTMLSpanElement`** class represents an HTML `<span>` element.
 * 
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLSpanElement)
 */
export class HTMLSpanElement extends HTMLElement {
    constructor(tagName: string, ownerDocument?: any) {
        super(tagName, ownerDocument);
    }
}