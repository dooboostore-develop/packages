import { HTMLElementBase } from './HTMLElementBase';

/**
 * The **`HTMLScriptElement`** class represents an HTML `<script>` element.
 * 
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLScriptElement)
 */
export class HTMLScriptElement extends HTMLElementBase {
    private _src: string = '';
    private _type: string = 'text/javascript';
    private _async: boolean = false;
    private _defer: boolean = false;
    private _crossOrigin: string = '';
    
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

    get type(): string {
        return this._type;
    }

    set type(value: string) {
        this._type = value;
        this.setAttribute('type', value);
    }

    get async(): boolean {
        return this._async;
    }

    set async(value: boolean) {
        this._async = value;
        if (value) {
            this.setAttribute('async', '');
        } else {
            this.removeAttribute('async');
        }
    }

    get defer(): boolean {
        return this._defer;
    }

    set defer(value: boolean) {
        this._defer = value;
        if (value) {
            this.setAttribute('defer', '');
        } else {
            this.removeAttribute('defer');
        }
    }

    get crossOrigin(): string {
        return this._crossOrigin;
    }

    set crossOrigin(value: string) {
        this._crossOrigin = value;
        this.setAttribute('crossorigin', value);
    }

    get text(): string {
        return this.textContent || '';
    }

    set text(value: string) {
        this.textContent = value;
    }

    // Override setAttribute to sync with properties
    setAttribute(qualifiedName: string, value: string): void {
        super.setAttribute(qualifiedName, value);
        
        const name = qualifiedName.toLowerCase();
        switch (name) {
            case 'src':
                this._src = value;
                break;
            case 'type':
                this._type = value;
                break;
            case 'async':
                this._async = true;
                break;
            case 'defer':
                this._defer = true;
                break;
            case 'crossorigin':
                this._crossOrigin = value;
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
            case 'type':
                this._type = 'text/javascript';
                break;
            case 'async':
                this._async = false;
                break;
            case 'defer':
                this._defer = false;
                break;
            case 'crossorigin':
                this._crossOrigin = '';
                break;
        }
    }
}