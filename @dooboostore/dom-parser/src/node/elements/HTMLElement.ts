import {HTMLElementBase} from "./HTMLElementBase";

export class HTMLElement extends HTMLElementBase {
  constructor(tagName?: string, ownerDocument?: any) {
    super(tagName, ownerDocument);
    // console.log('----->',tagName,  this.ownerDocument?.defaultView)
  }

}