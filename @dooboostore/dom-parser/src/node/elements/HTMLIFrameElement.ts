import {HTMLElementBase} from './HTMLElementBase';
import {HTMLElement} from "./HTMLElement";

export class HTMLIFrameElement extends HTMLElement {
  constructor(tagName: string = 'IFRAME', ownerDocument?: any) {
    super(tagName, ownerDocument);
  }

  get src(): string {
      return this.getAttribute('src') || '';
  }

  set src(value: string) {
      this.setAttribute('src', value);
  }

  get name(): string {
      return this.getAttribute('name') || '';
  }

  set name(value: string) {
      this.setAttribute('name', value);
  }
}
