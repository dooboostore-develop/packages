import { elementDefine, innerHtml } from '../index';
import { SwcHTMLTableCellElementBase } from './SwcHTMLTableCellElementBase';

@elementDefine({ name: 'swc-when-td', extends: 'td' })
export class SwcWhenTableCell extends SwcHTMLTableCellElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
