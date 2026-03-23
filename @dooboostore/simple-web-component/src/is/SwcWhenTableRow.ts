import { elementDefine, innerHtml } from '../index';
import { SwcHTMLTableRowElementBase } from './SwcHTMLTableRowElementBase';

@elementDefine({ name: 'swc-when-tr', extends: 'tr' })
export class SwcWhenTableRow extends SwcHTMLTableRowElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
