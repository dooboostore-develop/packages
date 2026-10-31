import { HTMLElementBase } from './HTMLElementBase';
import {HTMLElement} from "./HTMLElement";
export class HTMLTextAreaElement extends HTMLElement { 
    constructor(tagName: string = 'TEXTAREA', ownerDocument?: any) { 
        super(tagName, ownerDocument); 
    } 

    get value(): string {
        return this.textContent || '';
    }

    set value(val: string) {
        this.textContent = val;
    }

    // Boolean IDL attributes reflect attribute presence (single source of
    // truth is the attribute map, so parsed and programmatic states agree).
    get readOnly(): boolean {
        return this.hasAttribute('readonly');
    }

    set readOnly(value: boolean) {
        if (value) this.setAttribute('readonly', '');
        else this.removeAttribute('readonly');
    }

    get disabled(): boolean {
        return this.hasAttribute('disabled');
    }

    set disabled(value: boolean) {
        if (value) this.setAttribute('disabled', '');
        else this.removeAttribute('disabled');
    }

    get required(): boolean {
        return this.hasAttribute('required');
    }

    set required(value: boolean) {
        if (value) this.setAttribute('required', '');
        else this.removeAttribute('required');
    }

    get name(): string {
        return this.getAttribute('name') ?? '';
    }

    set name(value: string) {
        this.setAttribute('name', value);
    }
}
