import { HTMLElement } from './HTMLElement';
import { HTMLElementBase } from './HTMLElementBase';
import { HTMLCollection, NodeListOf, NodeList, HTMLCollectionOf } from '../collection';
/**
 * The **`HTMLTrElement`** class represents an HTML `<tr>` element.
 * 
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLTableRowElement)
 */
export class HTMLTrElement extends HTMLElementBase {
    constructor(tagName: string, ownerDocument?: any) {
        super(tagName, ownerDocument);
    }

    get cells(): HTMLCollection {
        return this.querySelectorAll('td, th') as any;
    }

    get rowIndex(): number {
        const table = this.closest('table');
        if (!table) return -1;
        
        const allRows = table.querySelectorAll('tr');
        for (let i = 0; i < allRows.length; i++) {
            const a = allRows[i];
            if (allRows[i] === this) {
                return i;
            }
        }
        return -1;
    }

    get sectionRowIndex(): number {
        const section = this.parentElement;
        if (!section) return -1;
        
        const sectionRows = section.querySelectorAll('tr');
        for (let i = 0; i < sectionRows.length; i++) {
            if (sectionRows[i] === this) {
                return i;
            }
        }
        return -1;
    }

    insertCell(index?: number): HTMLElement {
        const cell = this.ownerDocument.createElement('td');
        const cells = this.cells;
        
        if (index === undefined || index === -1) {
            // Append to the end
            this.appendChild(cell);
        } else {
            // Insert at specific index
            if (index >= 0 && index < cells.length) {
                const referenceCell = cells[index];
                this.insertBefore(cell, referenceCell);
            } else if (index >= cells.length) {
                this.appendChild(cell);
            }
        }
        
        return cell;
    }

    deleteCell(index: number): void {
        const cells = this.cells;
        if (index >= 0 && index < cells.length) {
            const cell = cells[index];
            this.removeChild(cell);
        }
    }
}