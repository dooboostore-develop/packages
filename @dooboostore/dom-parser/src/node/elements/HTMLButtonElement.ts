import { HTMLElementBase } from './HTMLElementBase';

/**
 * The **`HTMLButtonElement`** class represents an HTML `<button>` element.
 * 
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLButtonElement)
 */
export class HTMLButtonElement extends HTMLElementBase {
    private _type: string = 'submit';
    private _disabled: boolean = false;
    private _value: string = '';

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

    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(value: boolean) {
        this._disabled = value;
        if (value) {
            this.setAttribute('disabled', '');
        } else {
            this.removeAttribute('disabled');
        }
    }

    get value(): string {
        return this._value;
    }

    set value(value: string) {
        this._value = value;
        this.setAttribute('value', value);
    }

    // Override setAttribute to sync with properties
    setAttribute(qualifiedName: string, value: string): void {
        super.setAttribute(qualifiedName, value);
        
        const name = qualifiedName.toLowerCase();
        switch (name) {
            case 'type':
                this._type = value;
                break;
            case 'disabled':
                this._disabled = true;
                break;
            case 'value':
                this._value = value;
                break;
        }
    }

    // Override removeAttribute to sync with properties
    removeAttribute(qualifiedName: string): void {
        super.removeAttribute(qualifiedName);
        
        const name = qualifiedName.toLowerCase();
        switch (name) {
            case 'type':
                this._type = 'submit';
                break;
            case 'disabled':
                this._disabled = false;
                break;
            case 'value':
                this._value = '';
                break;
        }
    }
}