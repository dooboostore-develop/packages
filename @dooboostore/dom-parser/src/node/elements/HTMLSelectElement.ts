import { HTMLElementBase } from './HTMLElementBase';
import {HTMLElement} from "./HTMLElement";
import {HTMLOptionElement} from "./HTMLOptionElement";

export class HTMLSelectElement extends HTMLElement { 
    constructor(tagName: string = 'SELECT', ownerDocument?: any) { 
        super(tagName, ownerDocument); 
    } 

    get options(): HTMLOptionElement[] {
        const result: HTMLOptionElement[] = [];
        const traverse = (node: any) => {
            if (node.nodeName === 'OPTION') {
                result.push(node as HTMLOptionElement);
            }
            if (node.childNodes) {
                for (let i = 0; i < node.childNodes.length; i++) {
                    traverse(node.childNodes[i]);
                }
            }
        };
        traverse(this);
        return result;
    }

    get selectedIndex(): number {
        const opts = this.options;
        for (let i = 0; i < opts.length; i++) {
            if (opts[i].hasAttribute('selected')) {
                return i;
            }
        }
        return opts.length > 0 ? 0 : -1;
    }

    set selectedIndex(index: number) {
        const opts = this.options;
        for (let i = 0; i < opts.length; i++) {
            if (i === index) {
                opts[i].setAttribute('selected', '');
            } else {
                opts[i].removeAttribute('selected');
            }
        }
    }

    get value(): string {
        const opts = this.options;
        const idx = this.selectedIndex;
        if (idx >= 0 && idx < opts.length) {
            return opts[idx].value;
        }
        return '';
    }

    set value(val: string) {
        const opts = this.options;
        for (const opt of opts) {
            if (opt.value === val) {
                opt.setAttribute('selected', '');
            } else {
                opt.removeAttribute('selected');
            }
        }
    }
}
