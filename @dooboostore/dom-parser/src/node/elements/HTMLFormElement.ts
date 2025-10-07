import { HTMLElementBase } from './HTMLElementBase';

/**
 * The **`HTMLFormElement`** class represents an HTML `<form>` element.
 * 
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLFormElement)
 */
export class HTMLFormElement extends HTMLElementBase {
    private _action: string = '';
    private _method: string = 'get';
    private _enctype: string = 'application/x-www-form-urlencoded';
    private _target: string = '';
    private _noValidate: boolean = false;
    
    constructor(tagName: string, ownerDocument?: any) {
        super(tagName, ownerDocument);
    }

    get action(): string {
        return this._action;
    }

    set action(value: string) {
        this._action = value;
        this.setAttribute('action', value);
    }

    get method(): string {
        return this._method;
    }

    set method(value: string) {
        this._method = value.toLowerCase();
        this.setAttribute('method', value);
    }

    get enctype(): string {
        return this._enctype;
    }

    set enctype(value: string) {
        this._enctype = value;
        this.setAttribute('enctype', value);
    }

    get target(): string {
        return this._target;
    }

    set target(value: string) {
        this._target = value;
        this.setAttribute('target', value);
    }

    get noValidate(): boolean {
        return this._noValidate;
    }

    set noValidate(value: boolean) {
        this._noValidate = value;
        if (value) {
            this.setAttribute('novalidate', '');
        } else {
            this.removeAttribute('novalidate');
        }
    }

    // Form methods
    submit(): void {
        // Form submission logic would go here
        console.log('Form submitted');
    }

    reset(): void {
        // Form reset logic would go here
        console.log('Form reset');
    }

    checkValidity(): boolean {
        // Form validation logic would go here
        return true;
    }

    // Override setAttribute to sync with properties
    setAttribute(qualifiedName: string, value: string): void {
        super.setAttribute(qualifiedName, value);
        
        const name = qualifiedName.toLowerCase();
        switch (name) {
            case 'action':
                this._action = value;
                break;
            case 'method':
                this._method = value.toLowerCase();
                break;
            case 'enctype':
                this._enctype = value;
                break;
            case 'target':
                this._target = value;
                break;
            case 'novalidate':
                this._noValidate = true;
                break;
        }
    }

    // Override removeAttribute to sync with properties
    removeAttribute(qualifiedName: string): void {
        super.removeAttribute(qualifiedName);
        
        const name = qualifiedName.toLowerCase();
        switch (name) {
            case 'action':
                this._action = '';
                break;
            case 'method':
                this._method = 'get';
                break;
            case 'enctype':
                this._enctype = 'application/x-www-form-urlencoded';
                break;
            case 'target':
                this._target = '';
                break;
            case 'novalidate':
                this._noValidate = false;
                break;
        }
    }
}