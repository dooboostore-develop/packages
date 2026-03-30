import {HTMLElementBase} from './HTMLElementBase';
import {HTMLElement} from "./HTMLElement";

export class HTMLDialogElement extends HTMLElement {
  constructor(tagName: string = 'DIALOG', ownerDocument?: any) {
    super(tagName, ownerDocument);
  }
}
