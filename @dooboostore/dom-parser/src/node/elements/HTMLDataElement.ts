import { HTMLElementBase } from './HTMLElementBase';
export class HTMLDataElement extends HTMLElementBase {
  constructor(tagName: string = 'DATA', ownerDocument?: any) {
    super(tagName, ownerDocument);
  }
}
