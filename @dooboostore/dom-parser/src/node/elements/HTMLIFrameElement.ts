import {HTMLElementBase} from './HTMLElementBase';
import {HTMLElement} from "./HTMLElement";

export class HTMLIFrameElement extends HTMLElement {
  constructor(tagName: string = 'IFRAME', ownerDocument?: any) {
    super(tagName, ownerDocument);
  }
}
