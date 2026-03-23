import { elementDefine, innerHtml } from '../index';
import { SwcHTMLTableRowElementBase } from './SwcHTMLTableRowElementBase';

@elementDefine({ name: 'swc-other-tr', extends: 'tr' })
export class SwcOtherTableRow extends SwcHTMLTableRowElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
