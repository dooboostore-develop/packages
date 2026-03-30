import { HTMLElementBase } from './HTMLElementBase';
import { HTMLCollectionImp } from '../collection/HTMLCollectionImp'
import {HTMLElement} from "./HTMLElement";

/**
 * The **`HTMLTableElement`** class represents an HTML `<table>` element.
 * 
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLTableElement)
 */
export class HTMLTableElement extends HTMLElement {
    constructor(tagName: string, ownerDocument?: any) {
        super(tagName, ownerDocument);
    }

    get caption(): HTMLElement | null {
        return this.querySelector('caption');
    }

    get tHead(): HTMLElement | null {
        return this.querySelector('thead');
    }

    get tFoot(): HTMLElement | null {
        return this.querySelector('tfoot');
    }

    get tBodies(): HTMLCollectionImp {
        return this.querySelectorAll('tbody') as any;
    }

    get rows(): HTMLCollectionImp {
        return this.querySelectorAll('tr') as any;
    }

    createCaption(): HTMLElement {
        let caption = this.caption;
        if (!caption) {
            // @ts-ignore
            caption = this.ownerDocument.createElement('caption');
            this.insertBefore(caption, this.firstChild);
        }
        return caption;
    }

    deleteCaption(): void {
        const caption = this.caption;
        if (caption) {
            this.removeChild(caption);
        }
    }

    createTHead(): HTMLElement {
        let thead = this.tHead;
        if (!thead) {
            // @ts-ignore
            thead = this.ownerDocument.createElement('thead');
            const firstTBody = this.querySelector('tbody');
            this.insertBefore(thead, firstTBody);
        }
        return thead;
    }

    deleteTHead(): void {
        const thead = this.tHead;
        if (thead) {
            this.removeChild(thead);
        }
    }

    createTFoot(): HTMLElement {
        let tfoot = this.tFoot;
        if (!tfoot) {
            // @ts-ignore
            tfoot = this.ownerDocument.createElement('tfoot');
            this.appendChild(tfoot);
        }
        return tfoot;
    }

    deleteTFoot(): void {
        const tfoot = this.tFoot;
        if (tfoot) {
            this.removeChild(tfoot);
        }
    }

    insertRow(index?: number): HTMLElement {
        const row = this.ownerDocument.createElement('tr');
        const rows = this.rows;
        
        if (index === undefined || index === -1) {
            // Append to the end
            const lastTBody = this.querySelector('tbody:last-child');
            if (lastTBody) {
                lastTBody.appendChild(row);
            } else {
                this.appendChild(row);
            }
        } else {
            // Insert at specific index
            if (index >= 0 && index < rows.length) {
                const referenceRow = rows[index];
                referenceRow.parentNode?.insertBefore(row, referenceRow);
            }
        }
        
        // @ts-ignore
        return row;
    }

    deleteRow(index: number): void {
        const rows = this.rows;
        if (index >= 0 && index < rows.length) {
            const row = rows[index];
            row.parentNode?.removeChild(row);
        }
    }
}