import { HTMLElementBase } from './HTMLElementBase';

/**
 * The **`HTMLOListElement`** class represents an HTML `<ol>` element.
 * 
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLOListElement)
 */
export class HTMLOListElement extends HTMLElementBase {
    private _start: number = 1;
    private _type: string = '';
    private _reversed: boolean = false;
    
    constructor(tagName: string, ownerDocument?: any) {
        super(tagName, ownerDocument);
    }

    get start(): number {
        return this._start;
    }

    set start(value: number) {
        this._start = value;
        this.setAttribute('start', value.toString());
    }

    get type(): string {
        return this._type;
    }

    set type(value: string) {
        this._type = value;
        this.setAttribute('type', value);
    }

    get reversed(): boolean {
        return this._reversed;
    }

    set reversed(value: boolean) {
        this._reversed = value;
        if (value) {
            this.setAttribute('reversed', '');
        } else {
            this.removeAttribute('reversed');
        }
    }

    // Override setAttribute to sync with properties
    setAttribute(qualifiedName: string, value: string): void {
        super.setAttribute(qualifiedName, value);
        
        const name = qualifiedName.toLowerCase();
        switch (name) {
            case 'start':
                this._start = parseInt(value, 10) || 1;
                break;
            case 'type':
                this._type = value;
                break;
            case 'reversed':
                this._reversed = true;
                break;
        }
    }

    // Override removeAttribute to sync with properties
    removeAttribute(qualifiedName: string): void {
        super.removeAttribute(qualifiedName);
        
        const name = qualifiedName.toLowerCase();
        switch (name) {
            case 'start':
                this._start = 1;
                break;
            case 'type':
                this._type = '';
                break;
            case 'reversed':
                this._reversed = false;
                break;
        }
    }
}