import { HTMLElementBase } from './HTMLElementBase';
import {HTMLElement} from "./HTMLElement";

/**
 * The **`HTMLAudioElement`** interface provides access to the properties of `<audio>` elements, as well as methods to manipulate them.
 */
export class HTMLAudioElement extends HTMLElement {
  constructor(tagName: string = 'AUDIO', ownerDocument?: any) {
    super(tagName, ownerDocument);
  }
}
