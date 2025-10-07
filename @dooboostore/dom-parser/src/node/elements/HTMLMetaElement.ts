import { ElementBase } from './ElementBase';

/**
 * The **`HTMLMetaElement`** class represents an HTML `<meta>` element.
 * 
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMetaElement)
 */
export class HTMLMetaElement extends ElementBase {
    constructor(tagName: string, ownerDocument?: any){
        super(tagName, ownerDocument);
    }
}