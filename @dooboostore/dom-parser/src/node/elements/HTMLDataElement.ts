import { HTMLElementBase } from './HTMLElementBase';
import {HTMLElement} from "./HTMLElement";
export class HTMLDataElement extends HTMLElement {
  constructor(tagName: string = 'DATA', ownerDocument?: any) {
    super(tagName, ownerDocument);
  }
}
