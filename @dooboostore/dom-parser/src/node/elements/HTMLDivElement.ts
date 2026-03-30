import { HTMLElementBase } from './HTMLElementBase';
import {HTMLElement} from "./HTMLElement";

/**
 * The **`HTMLDivElement`** class represents an HTML `<div>` element.
 * 
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLDivElement)
 */
export class HTMLDivElement extends HTMLElement {
    constructor(tagName: string, ownerDocument?: any) {
        super(tagName, ownerDocument);
    }
}