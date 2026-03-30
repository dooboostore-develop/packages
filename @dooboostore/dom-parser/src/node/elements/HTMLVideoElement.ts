import { HTMLElementBase } from './HTMLElementBase';
import {HTMLElement} from "./HTMLElement";

/**
 * The **`HTMLVideoElement`** interface provides special properties and methods for manipulating video objects.
 */
export class HTMLVideoElement extends HTMLElement {
  constructor(tagName: string = 'VIDEO', ownerDocument?: any) {
    super(tagName, ownerDocument);
  }
}
