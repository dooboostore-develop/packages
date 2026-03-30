import {HTMLElementBase} from './HTMLElementBase';
import {HTMLElement} from "./HTMLElement";

export class HTMLDListElement extends HTMLElement {
  constructor(tagName: string = 'DL', ownerDocument?: any) {
    super(tagName, ownerDocument);
  }
}
