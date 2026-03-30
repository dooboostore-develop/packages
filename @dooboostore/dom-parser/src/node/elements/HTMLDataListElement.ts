import {HTMLElementBase} from './HTMLElementBase';
import {HTMLElement} from "./HTMLElement";

export class HTMLDataListElement extends HTMLElement {
  constructor(tagName: string = 'DATALIST', ownerDocument?: any) {
    super(tagName, ownerDocument);
  }
}
