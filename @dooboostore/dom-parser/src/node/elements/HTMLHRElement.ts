import {HTMLElementBase} from './HTMLElementBase';
import {HTMLElement} from "./HTMLElement";

export class HTMLHRElement extends HTMLElement {
  constructor(tagName: string = 'HR', ownerDocument?: any) {
    super(tagName, ownerDocument);
  }
}
