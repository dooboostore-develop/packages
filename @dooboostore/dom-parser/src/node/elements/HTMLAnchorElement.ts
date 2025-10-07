import { HTMLElementBase } from './HTMLElementBase';

/**
 * The **`HTMLAElement`** class represents an HTML `<a>` element.
 * 
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLAnchorElement)
 */
export class HTMLAnchorElement extends HTMLElementBase  {
    private _href: string = '';
    private _target: string = '';

    constructor(tagName: string, ownerDocument?: any) {
        super(tagName, ownerDocument);
    }

    get href(): string {
        return this._href;
    }

    set href(value: string) {
        this._href = value;
        this.setAttribute('href', value);
    }

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