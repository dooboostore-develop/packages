import { ChildNodeBase } from './ChildNodeBase';
import { COMMENT_NODE } from './Node';

/**
 * The **`Comment`** interface represents textual notations within markup; although it is generally not visually shown, such comments are available to be read in the source view.
 * 
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Comment)
 */
// export interface Comment {
//     readonly nodeType: typeof COMMENT_NODE;
//     readonly nodeName: '#comment';
//     data: string;
//     readonly length: number;
//     appendData(data: string): void;
//     deleteData(offset: number, count: number): void;
//     insertData(offset: number, data: string): void;
//     replaceData(offset: number, count: number, data: string): void;
//     substringData(offset: number, count: number): string;
// }

/**
 * The **`CommentNode`** class represents a comment node in the DOM.
 */
export class Comment extends ChildNodeBase  {
    private _data: string;

    constructor(data: string, ownerDocument?: any) {
        super(COMMENT_NODE, '#comment', ownerDocument);
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
        return this._data;
    }

    set textContent(value: string | null) {
        this._data = value || '';
        this._nodeValue = this._data;
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

    cloneNode(deep?: boolean): Comment {
        return new Comment(this._data, this._ownerDocument);
    }

    toString(): string {
        return `<!--${this._data}-->`;
    }
}