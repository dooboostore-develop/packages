import { HTMLElementBase } from './HTMLElementBase';

/**
 * The **`HTMLLIElement`** class represents an HTML `<li>` element.
 * 
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLLIElement)
 */
export class HTMLLIElement extends HTMLElementBase {
    private _value: number = 0;
    
    constructor(tagName: string, ownerDocument?: any) {
        super(tagName, ownerDocument);
    }

    get value(): number {
        return this._value;
    }

    set value(value: number) {
        this._value = value;
        this.setAttribute('value', value.toString());
    }

    // Override setAttribute to sync with properties
    setAttribute(qualifiedName: string, value: string): void {
        super.setAttribute(qualifiedName, value);
        
        const name = qualifiedName.toLowerCase();
        switch (name) {
            case 'value':
                this._value = parseInt(value, 10) || 0;
                break;
        }
    }

    // Override removeAttribute to sync with properties
    removeAttribute(qualifiedName: string): void {
        super.removeAttribute(qualifiedName);
        
        const name = qualifiedName.toLowerCase();
        switch (name) {
            case 'value':
                this._value = 0;
                break;
        }
    }
}