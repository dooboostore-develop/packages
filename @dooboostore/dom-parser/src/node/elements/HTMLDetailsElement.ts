import {HTMLElementBase} from './HTMLElementBase';
import {HTMLElement} from "./HTMLElement";

export class HTMLDetailsElement extends HTMLElement {
  constructor(tagName: string = 'DETAILS', ownerDocument?: any) {
    super(tagName, ownerDocument);
  }
}
