import { HTMLElementBase } from './HTMLElementBase';

export class HTMLGenericElement extends HTMLElementBase {

    constructor(tagName: string, ownerDocument?: any) {
        super(tagName, ownerDocument);
    }


    get localName(): string {
        return this._tagName.toLowerCase();
    }
}