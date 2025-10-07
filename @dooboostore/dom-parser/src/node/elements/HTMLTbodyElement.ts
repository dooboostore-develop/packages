import { HTMLElementBase } from './HTMLElementBase';
import { HTMLCollection } from '../collection';
import {HTMLElement} from "./HTMLElement";

/**
 * The **`HTMLTbodyElement`** class represents an HTML `<tbody>` element.
 * 
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLTableSectionElement)
 */
export class HTMLTbodyElement extends HTMLElementBase {
    constructor(tagName: string, ownerDocument?: any) {
        super(tagName, ownerDocument);
    }

    get rows(): HTMLCollection {
        return this.querySelectorAll('tr') as any;
    }

    insertRow(index?: number): HTMLElement {
        const row = this.ownerDocument.createElement('tr');
        const rows = this.rows;
        
        if (index === undefined || index === -1) {
            // Append to the end
            this.appendChild(row);
        } else {
            // Insert at specific index
            if (index >= 0 && index < rows.length) {
                const referenceRow = rows[index];
                this.insertBefore(row, referenceRow);
            } else if (index >= rows.length) {
                this.appendChild(row);
            }
        }

        return row;
    }

    deleteRow(index: number): void {
        const rows = this.rows;
        if (index >= 0 && index < rows.length) {
            const row = rows[index];
            this.removeChild(row);
        }
    }
}