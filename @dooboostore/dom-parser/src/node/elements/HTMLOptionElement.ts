import { HTMLElementBase } from './HTMLElementBase';
import {HTMLElement} from "./HTMLElement";
export class HTMLOptionElement extends HTMLElement { 
    constructor(tagName: string = 'OPTION', ownerDocument?: any) { 
        super(tagName, ownerDocument); 
    } 

    get value(): string {
        return this.hasAttribute('value') ? this.getAttribute('value') || '' : this.text;
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
        // HTML spec: concatenation of Text descendants (excluding script
        // subtrees), then strip and collapse ASCII whitespace.
        let data = '';
        const collect = (node: any): void => {
            for (const child of node._childNodesInternal || node.childNodes || []) {
                const nodeType = child.nodeType;
                if (nodeType === 3) {
                    data += child.data ?? child.textContent ?? '';
                } else if (nodeType === 1) {
                    const tag = (child.tagName || '').toUpperCase();
                    if (tag === 'SCRIPT') {
                        continue;
                    }
                    collect(child);
                }
            }
        };
        collect(this);
        return data.replace(/[\t\n\f\r ]+/g, ' ').replace(/^ | $/g, '');
    }
}
