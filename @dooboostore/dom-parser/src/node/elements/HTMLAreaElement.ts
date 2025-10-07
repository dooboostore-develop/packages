import { HTMLElementBase } from './HTMLElementBase';
import { Document } from '../Document';

/**
 * The **`HTMLAreaElement`** interface provides special properties and methods (beyond those of the regular object HTMLElement interface it also has available to it by inheritance) for manipulating the layout and presentation of `<area>` elements.
 * 
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLAreaElement)
 */
export class HTMLAreaElement extends HTMLElementBase {
    /**
     * A string containing the alternative text for the element.
     */
    alt: string = '';

    /**
     * A string containing the coordinates of the hot-spot region.
     */
    coords: string = '';

    /**
     * A string indicating the shape of the hot-spot.
     */
    shape: string = '';

    /**
     * A string containing the URL that the hyperlink points to.
     */
    href: string = '';

    /**
     * A string indicating where to display the linked resource.
     */
    target: string = '';

    /**
     * A string containing the relationship of the linked resource to the current document.
     */
    rel: string = '';

    /**
     * A string containing the MIME type of the linked resource.
     */
    type: string = '';

    /**
     * A string containing the language of the linked resource.
     */
    hreflang: string = '';

    /**
     * A string containing the media for which the linked resource was designed.
     */
    media: string = '';

    /**
     * A string containing the download attribute, indicating that the linked resource is intended to be downloaded.
     */
    download: string = '';

    /**
     * A string containing the ping attribute, containing a space-separated list of URLs.
     */
    ping: string = '';

    /**
     * A string containing the referrerpolicy attribute.
     */
    referrerPolicy: string = '';

    constructor(ownerDocument: Document) {
        super('area', ownerDocument);
    }
}