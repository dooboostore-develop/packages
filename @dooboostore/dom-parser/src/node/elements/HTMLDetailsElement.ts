import {HTMLElementBase} from './HTMLElementBase';
import {HTMLElement} from "./HTMLElement";

export class HTMLDetailsElement extends HTMLElement {
  constructor(tagName: string = 'DETAILS', ownerDocument?: any) {
    super(tagName, ownerDocument);
  }

  get open(): boolean {
      return this.hasAttribute('open');
  }

  set open(value: boolean) {
      if (value) {
          this.setAttribute('open', '');
      } else {
          this.removeAttribute('open');
      }
  }
}
