import { HTMLElementBase } from './HTMLElementBase';
import {HTMLElement} from "./HTMLElement";
export class HTMLOptionElement extends HTMLElement { 
    constructor(tagName: string = 'OPTION', ownerDocument?: any) { 
        super(tagName, ownerDocument); 
    } 

    get value(): string {
        return this.hasAttribute('value') ? this.getAttribute('value') || '' : this.textContent || '';
    }

    set value(val: string) {
        this.setAttribute('value', val);
    }

    get selected(): boolean {
        return this.hasAttribute('selected');
    }

    set selected(val: boolean) {
        if (val) {
            this.setAttribute('selected', '');
        } else {
            this.removeAttribute('selected');
        }
    }

    get text(): string {
        return this.textContent || '';
    }
}
