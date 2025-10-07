import { HTMLElementBase } from './HTMLElementBase';

/**
 * The **`HTMLThElement`** class represents an HTML `<th>` element.
 * 
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLTableCellElement)
 */
export class HTMLThElement extends HTMLElementBase {
    constructor(tagName: string, ownerDocument?: any) {
        super(tagName, ownerDocument);
    }

    get cellIndex(): number {
        const row = this.parentElement;
        if (!row) return -1;
        
        const cells = row.querySelectorAll('td, th');
        for (let i = 0; i < cells.length; i++) {
            if (cells[i] === this) {
                return i;
            }
        }
        return -1;
    }

    get colSpan(): number {
        const value = this.getAttribute('colspan');
        return value ? parseInt(value, 10) : 1;
    }

    set colSpan(value: number) {
        this.setAttribute('colspan', value.toString());
    }

    get rowSpan(): number {
        const value = this.getAttribute('rowspan');
        return value ? parseInt(value, 10) : 1;
    }

    set rowSpan(value: number) {
        this.setAttribute('rowspan', value.toString());
    }

    get headers(): string {
        return this.getAttribute('headers') || '';
    }

    set headers(value: string) {
        this.setAttribute('headers', value);
    }

    get scope(): string {
        return this.getAttribute('scope') || '';
    }

    set scope(value: string) {
        this.setAttribute('scope', value);
    }

    get abbr(): string {
        return this.getAttribute('abbr') || '';
    }

    set abbr(value: string) {
        this.setAttribute('abbr', value);
    }
}