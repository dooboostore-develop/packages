import { HTMLElementBase } from './HTMLElementBase';

/**
 * The **`HTMLImgElement`** class represents an HTML `<img>` element.
 * 
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLImageElement)
 */
export class HTMLImgElement extends HTMLElementBase  {
    private _src: string = '';
    private _alt: string = '';
    private _width: number = 0;
    private _height: number = 0;

    constructor(tagName: string, ownerDocument?: any) {
        super(tagName, ownerDocument);
    }


    get src(): string {
        return this._src;
    }

    set src(value: string) {
        this._src = value;
        this.setAttribute('src', value);
    }

    get alt(): string {
        return this._alt;
    }

    set alt(value: string) {
        this._alt = value;
        this.setAttribute('alt', value);
    }

    get width(): number {
        return this._width;
    }

    set width(value: number) {
        this._width = value;
        this.setAttribute('width', value.toString());
    }

    get height(): number {
        return this._height;
    }

    set height(value: number) {
        this._height = value;
        this.setAttribute('height', value.toString());
    }

    // Override setAttribute to sync with properties
    setAttribute(qualifiedName: string, value: string): void {
        super.setAttribute(qualifiedName, value);
        
        const name = qualifiedName.toLowerCase();
        switch (name) {
            case 'src':
                this._src = value;
                break;
            case 'alt':
                this._alt = value;
                break;
            case 'width':
                this._width = parseInt(value, 10) || 0;
                break;
            case 'height':
                this._height = parseInt(value, 10) || 0;
                break;
        }
    }

    // Override removeAttribute to sync with properties
    removeAttribute(qualifiedName: string): void {
        super.removeAttribute(qualifiedName);
        
        const name = qualifiedName.toLowerCase();
        switch (name) {
            case 'src':
                this._src = '';
                break;
            case 'alt':
                this._alt = '';
                break;
            case 'width':
                this._width = 0;
                break;
            case 'height':
                this._height = 0;
                break;
        }
    }
}