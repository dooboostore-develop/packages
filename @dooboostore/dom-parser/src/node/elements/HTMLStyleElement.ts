import { HTMLElementBase } from './HTMLElementBase';

/**
 * The **`HTMLStyleElement`** class represents an HTML `<style>` element.
 * 
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLStyleElement)
 */
export class HTMLStyleElement extends HTMLElementBase {
    private _type: string = 'text/css';
    private _media: string = '';
    
    constructor(tagName: string, ownerDocument?: any) {
        super(tagName, ownerDocument);
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
            case 'type':
                this._type = 'text/css';
                break;
            case 'media':
                this._media = '';
                break;
        }
    }
}