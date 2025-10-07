import { HTMLElementBase } from './HTMLElementBase';

/**
 * The **`HTMLHtmlElement`** class represents an HTML `<html>` element.
 * This is the root element of an HTML document.
 * 
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLHtmlElement)
 */
export class HTMLHtmlElement extends HTMLElementBase {
    // private _lang: string = '';
    // private _dir: string = '';

    constructor(tagName: string, ownerDocument?: any) {
        super(tagName, ownerDocument);
    }

    // /**
    //  * Gets or sets the language of the document.
    //  */
    // get lang(): string {
    //     return this._lang;
    // }
    //
    // set lang(value: string) {
    //     this._lang = value;
    //     this.setAttribute('lang', value);
    // }
    //
    // /**
    //  * Gets or sets the text direction of the document.
    //  */
    // get dir(): string {
    //     return this._dir;
    // }
    //
    // set dir(value: string) {
    //     this._dir = value;
    //     this.setAttribute('dir', value);
    // }

    /**
     * Gets the version attribute (deprecated in HTML5).
     * @deprecated
     */
    get version(): string {
        return this.getAttribute('version') || '';
    }

    set version(value: string) {
        this.setAttribute('version', value);
    }

    // Override setAttribute to sync with properties
    // setAttribute(qualifiedName: string, value: string): void {
    //     super.setAttribute(qualifiedName, value);
    //
    //     const name = qualifiedName.toLowerCase();
    //     switch (name) {
    //         case 'lang':
    //             this.__lang = value;
    //             break;
    //         case 'dir':
    //             this.__dir = value;
    //             break;
    //     }
    // }

    // Override removeAttribute to sync with properties
    // removeAttribute(qualifiedName: string): void {
    //     super.removeAttribute(qualifiedName);
    //
    //     const name = qualifiedName.toLowerCase();
    //     switch (name) {
    //         case 'lang':
    //             this.__lang = '';
    //             break;
    //         case 'dir':
    //             this.__dir = '';
    //             break;
    //     }
    // }
}