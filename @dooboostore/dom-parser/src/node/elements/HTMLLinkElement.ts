import { HTMLElementBase } from './HTMLElementBase';

/**
 * The **`HTMLLinkElement`** class represents an HTML `<link>` element.
 * 
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLLinkElement)
 */
export class HTMLLinkElement extends HTMLElementBase {
    private _href: string = '';
    private _rel: string = '';
    private _type: string = '';
    private _media: string = '';
    
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

    get rel(): string {
        return this._rel;
    }

    set rel(value: string) {
        this._rel = value;
        this.setAttribute('rel', value);
    }

    get type(): string {
        return this._type;
    }

    set type(value: string) {
        this._type = value;
        this.setAttribute('type', value);
    }

    get media(): string {
        return this._media;
    }

    set media(value: string) {
        this._media = value;
        this.setAttribute('media', value);
    }

    // Override setAttribute to sync with properties
    setAttribute(qualifiedName: string, value: string): void {
        super.setAttribute(qualifiedName, value);
        
        const name = qualifiedName.toLowerCase();
        switch (name) {
            case 'href':
                this._href = value;
                break;
            case 'rel':
                this._rel = value;
                break;
            case 'type':
                this._type = value;
                break;
            case 'media':
                this._media = value;
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
            case 'rel':
                this._rel = '';
                break;
            case 'type':
                this._type = '';
                break;
            case 'media':
                this._media = '';
                break;
        }
    }
}