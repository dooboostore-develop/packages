import { ElementBase } from './ElementBase';
import {HTMLElement} from "./HTMLElement";

/**
 * The **`HTMLMetaElement`** class represents an HTML `<meta>` element.
 * 
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMetaElement)
 */
export class HTMLMetaElement extends HTMLElement {
    constructor(tagName: string, ownerDocument?: any){
        super(tagName, ownerDocument);
    }
}