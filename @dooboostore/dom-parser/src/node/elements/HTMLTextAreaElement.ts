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
}
