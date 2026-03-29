import { HTMLElementBase } from './HTMLElementBase';

/**
 * The **`HTMLAudioElement`** interface provides access to the properties of `<audio>` elements, as well as methods to manipulate them.
 */
export class HTMLAudioElement extends HTMLElementBase {
  constructor(tagName: string = 'AUDIO', ownerDocument?: any) {
    super(tagName, ownerDocument);
  }
}
