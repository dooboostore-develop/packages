import { HTMLElementBase } from './HTMLElementBase';
import {HTMLElement} from "./HTMLElement";

/**
 * The **`HTMLUListElement`** class represents an HTML `<ul>` element.
 * 
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLUListElement)
 */
export class HTMLUListElement extends HTMLElement {
    constructor(tagName: string, ownerDocument?: any) {
        super(tagName, ownerDocument);
    }
}