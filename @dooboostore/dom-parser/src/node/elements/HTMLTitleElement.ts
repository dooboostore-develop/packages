import { HTMLElementBase } from './HTMLElementBase';
import {HTMLElement} from "./HTMLElement";

/**
 * The **`HTMLTitleElement`** class represents an HTML `<title>` element.
 * 
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLTitleElement)
 */
export class HTMLTitleElement extends HTMLElement {
    constructor(tagName: string, ownerDocument?: any) {
        super(tagName, ownerDocument);
    }

    /**
     * Gets or sets the text content of the title element.
     */
    get text(): string {
        return this.textContent || '';
    }

    set text(value: string) {
        this.textContent = value;
    }
}