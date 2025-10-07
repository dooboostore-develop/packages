import { ChildNodeBase } from './ChildNodeBase';
import { TEXT_NODE } from './Node';
import { Text } from './Text';

/**
 * The **`TextBase`** class represents a text node implementation in the DOM.
 */
export class TextBase extends ChildNodeBase implements Text {
    private _data: string;
    
    // Override nodeType to match Text interface
    readonly nodeType: 3 = TEXT_NODE as 3;
    readonly nodeName: '#text' = '#text';

    constructor(data: string, ownerDocument?: any) {
        super(TEXT_NODE, '#text', ownerDocument);
        this._data = data;
        this._nodeValue = data;
    }

    get data(): string {
        return this._data;
    }

    set data(value: string) {
        this._data = value;
        this._nodeValue = value;
    }

    get length(): number {
        return this._data.length;
    }

    get textContent(): string | null {
        // Decode HTML entities to return original text
        return this._data ? this.decodeHTMLEntities(this._data) : this._data;
    }

    set textContent(value: string | null) {
        this._data = value || '';
        this._nodeValue = this._data;
    }

    get wholeText(): string {
        // For now, just return the current text
        // In a full implementation, this would collect adjacent text nodes
        return this._data;
    }

    // CharacterData methods
    appendData(data: string): void {
        this._data += data;
        this._nodeValue = this._data;
    }

    deleteData(offset: number, count: number): void {
        if (offset < 0 || offset > this._data.length) {
            throw new Error('Index out of bounds');
        }
        const endOffset = Math.min(offset + count, this._data.length);
        this._data = this._data.slice(0, offset) + this._data.slice(endOffset);
        this._nodeValue = this._data;
    }

    insertData(offset: number, data: string): void {
        if (offset < 0 || offset > this._data.length) {
            throw new Error('Index out of bounds');
        }
        this._data = this._data.slice(0, offset) + data + this._data.slice(offset);
        this._nodeValue = this._data;
    }

    replaceData(offset: number, count: number, data: string): void {
        this.deleteData(offset, count);
        this.insertData(offset, data);
    }

    substringData(offset: number, count: number): string {
        if (offset < 0 || offset > this._data.length) {
            throw new Error('Index out of bounds');
        }
        const endOffset = Math.min(offset + count, this._data.length);
        return this._data.slice(offset, endOffset);
    }

    splitText(offset: number): Text {
        if (offset < 0 || offset > this._data.length) {
            throw new Error('Index out of bounds');
        }

        const newData = this._data.slice(offset);
        this._data = this._data.slice(0, offset);
        this._nodeValue = this._data;

        const newTextNode = new TextBase(newData, this._ownerDocument);

        // Insert the new text node after this one
        if (this._parentNodeInternal) {
            const nextSibling = this.nextSibling;
            this._parentNodeInternal.insertBefore(newTextNode, nextSibling);
        }

        return newTextNode as Text;
    }

    cloneNode(deep?: boolean): Text {
        return new TextBase(this._data, this._ownerDocument) as Text;
    }

    toString(): string {
        return this._data;
    }
}