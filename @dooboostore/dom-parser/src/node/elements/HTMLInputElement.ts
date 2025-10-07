import { HTMLElementBase } from './HTMLElementBase';

/**
 * The **`HTMLInputElement`** class represents an HTML `<input>` element.
 * 
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLInputElement)
 */
export class HTMLInputElement extends HTMLElementBase {
    private _type: string = 'text';
    private _value: string = '';
    private _placeholder: string = '';
    private _disabled: boolean = false;
    private _readonly: boolean = false;
    private _required: boolean = false;
    private _checked: boolean = false;

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

    get value(): string {
        return this._value;
    }

    set value(value: string) {
        this._value = value;
        this.setAttribute('value', value);
    }

    get placeholder(): string {
        return this._placeholder;
    }

    set placeholder(value: string) {
        this._placeholder = value;
        this.setAttribute('placeholder', value);
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

    get readOnly(): boolean {
        return this._readonly;
    }

    set readOnly(value: boolean) {
        this._readonly = value;
        if (value) {
            this.setAttribute('readonly', '');
        } else {
            this.removeAttribute('readonly');
        }
    }

    get required(): boolean {
        return this._required;
    }

    set required(value: boolean) {
        this._required = value;
        if (value) {
            this.setAttribute('required', '');
        } else {
            this.removeAttribute('required');
        }
    }

    get checked(): boolean {
        return this._checked;
    }

    set checked(value: boolean) {
        this._checked = value;
        if (value) {
            this.setAttribute('checked', '');
        } else {
            this.removeAttribute('checked');
        }
    }

    // Override setAttribute to sync with properties
    setAttribute(qualifiedName: string, value: string): void {
        super.setAttribute(qualifiedName, value);
        
        const name = qualifiedName.toLowerCase();
        switch (name) {
            case 'type':
                this._type = value;
                break;
            case 'value':
                this._value = value;
                break;
            case 'placeholder':
                this._placeholder = value;
                break;
            case 'disabled':
                this._disabled = true;
                break;
            case 'readonly':
                this._readonly = true;
                break;
            case 'required':
                this._required = true;
                break;
            case 'checked':
                this._checked = true;
                break;
        }
    }

    // Override removeAttribute to sync with properties
    removeAttribute(qualifiedName: string): void {
        super.removeAttribute(qualifiedName);
        
        const name = qualifiedName.toLowerCase();
        switch (name) {
            case 'type':
                this._type = 'text';
                break;
            case 'value':
                this._value = '';
                break;
            case 'placeholder':
                this._placeholder = '';
                break;
            case 'disabled':
                this._disabled = false;
                break;
            case 'readonly':
                this._readonly = false;
                break;
            case 'required':
                this._required = false;
                break;
            case 'checked':
                this._checked = false;
                break;
        }
    }
}