import { HTMLElementBase } from './HTMLElementBase';
import {HTMLElement} from "./HTMLElement";

/**
 * The **`HTMLPElement`** class represents an HTML `<p>` element.
 * 
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLParagraphElement)
 */
export class HTMLPElement extends HTMLElement  {
    constructor(tagName: string, ownerDocument?: any) {
        super(tagName, ownerDocument);
    }
}