import { Element } from './Element';
import { Document } from '../Document';
import { HTMLElement } from './HTMLElement';
import { HTMLElementBase } from './HTMLElementBase';
import { HTMLCollection } from '../collection/HTMLCollection'
import { HTMLElementTagNameMap } from './index';

/**
 * The **`HTMLTableElement`** class represents an HTML `<table>` element.
 * 
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLTableElement)
 */
export class HTMLTableElement extends HTMLElementBase {
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

    get tBodies(): HTMLCollection {
        return this.querySelectorAll('tbody') as any;
    }

    get rows(): HTMLCollection {
        return this.querySelectorAll('tr') as any;
    }

    createCaption(): HTMLElement {
        let caption = this.caption;
        if (!caption) {
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