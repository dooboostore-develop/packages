import { HTMLElementBase } from './HTMLElementBase';

/**
 * The **`HTMLVideoElement`** interface provides special properties and methods for manipulating video objects.
 */
export class HTMLVideoElement extends HTMLElementBase {
  constructor(tagName: string = 'VIDEO', ownerDocument?: any) {
    super(tagName, ownerDocument);
  }
}
