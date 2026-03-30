import {HTMLElementBase} from './HTMLElementBase';
import {HTMLElement} from "./HTMLElement";

export class HTMLFieldSetElement extends HTMLElement {
  constructor(tagName: string = 'FIELDSET', ownerDocument?: any) {
    super(tagName, ownerDocument);
  }
}
