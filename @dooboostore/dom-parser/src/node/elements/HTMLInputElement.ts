import { HTMLElementBase } from './HTMLElementBase';
import {HTMLElement} from "./HTMLElement";
import { formOwnerFor } from '../../utils/form-owner';
import {
    sanitizeInputValue,
    parseValueAsNumber,
    isBarredFromValidation,
    createValidityState,
} from '../../utils/input-validation';

/**
 * The **`HTMLInputElement`** class represents an HTML `<input>` element.
 * 
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLInputElement)
 */
export class HTMLInputElement extends HTMLElement {
    private _type: string = 'text';
    private _value: string = '';
    private _placeholder: string = '';
    private _disabled: boolean = false;
    private _readonly: boolean = false;
    private _required: boolean = false;
    private _checked: boolean = false;
    private _validity: any = null;
    private _patternMismatchPattern: string | null = null;

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
        const type = this._type.toLowerCase();
        let sanitized = sanitizeInputValue(type, this._value);
        if (type === 'range' && sanitized !== '') {
            // Range additionally clamps to min/max (Chromium: 999 -> 100).
            const min = Number(this.getAttribute('min') ?? '0');
            const max = Number(this.getAttribute('max') ?? '100');
            const n = Number(sanitized);
            if (Number.isFinite(n)) {
                const lo = Number.isFinite(min) ? min : 0;
                const hi = Number.isFinite(max) ? max : 100;
                sanitized = String(Math.min(hi, Math.max(lo, n)));
            }
        }
        return sanitized;
    }

    set value(value: string) {
        const raw = value === null || value === undefined ? '' : String(value);
        this._value = raw;
        this.setAttribute('value', raw);
    }

    get valueAsNumber(): number {
        return parseValueAsNumber(this._type.toLowerCase(), this.value);
    }

    set valueAsNumber(value: number) {
        this.value = Number.isFinite(value) ? String(value) : '';
    }

    get willValidate(): boolean {
        return !isBarredFromValidation(this);
    }

    get validity(): any {
        if (!this._validity) this._validity = createValidityState(this);
        return this._validity;
    }

    get validationMessage(): string {
        if (!this.willValidate) return '';
        if (this.validity.valueMissing) return 'Please fill out this field.';
        return '';
    }

    checkValidity(): boolean {
        if (!this.willValidate) return true;
        return this.validity.valid;
    }

    reportValidity(): boolean {
        return this.checkValidity();
    }

    setCustomValidity(_message: string): void {
        // Custom validity is not modelled yet; browsers store the message
        // and surface it through validationMessage.
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

    get form(): HTMLElement | null {
        return formOwnerFor(this);
    }
}