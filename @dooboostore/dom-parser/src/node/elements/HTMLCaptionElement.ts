import { HTMLElementBase } from './HTMLElementBase';

/**
 * The **`HTMLCaptionElement`** class represents an HTML `<caption>` element.
 * 
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLTableCaptionElement)
 */
export class HTMLCaptionElement extends HTMLElementBase {
    constructor(tagName: string, ownerDocument?: any) {
        super(tagName, ownerDocument);
    }

    /**
     * @deprecated The align property is deprecated. Use CSS text-align instead.
     */
    get align(): string {
        return this.getAttribute('align') || '';
    }

    /**
     * @deprecated The align property is deprecated. Use CSS text-align instead.
     */
    set align(value: string) {
        this.setAttribute('align', value);
    }
}