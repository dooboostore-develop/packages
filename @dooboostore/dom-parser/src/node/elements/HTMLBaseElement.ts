import { HTMLElementBase } from './HTMLElementBase';

/**
 * The **`HTMLBaseElement`** class represents an HTML `<base>` element.
 * The base element specifies the base URL to use for all relative URLs in a document.
 * 
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLBaseElement)
 */
export class HTMLBaseElement extends HTMLElementBase {
    private _href: string = '';
    private _target: string = '';
    
    constructor(tagName: string, ownerDocument?: any) {
        super(tagName, ownerDocument);
    }

    /**
     * Gets or sets the base URL for relative URLs in the document.
     */
    get href(): string {
        return this._href;
    }

    set href(value: string) {
        this._href = value;
        this.setAttribute('href', value);
    }

    /**
     * Gets or sets the default target for links and forms in the document.
     */
    get target(): string {
        return this._target;
    }

    set target(value: string) {
        this._target = value;
        this.setAttribute('target', value);
    }

    // Override setAttribute to sync with properties
    setAttribute(qualifiedName: string, value: string): void {
        super.setAttribute(qualifiedName, value);
        
        const name = qualifiedName.toLowerCase();
        switch (name) {
            case 'href':
                this._href = value;
                break;
            case 'target':
                this._target = value;
                break;
        }
    }

    // Override removeAttribute to sync with properties
    removeAttribute(qualifiedName: string): void {
        super.removeAttribute(qualifiedName);
        
        const name = qualifiedName.toLowerCase();
        switch (name) {
            case 'href':
                this._href = '';
                break;
            case 'target':
                this._target = '';
                break;
        }
    }
}