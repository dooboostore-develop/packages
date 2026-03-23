import { elementDefine, innerHtml } from '../index';
import { SwcHTMLTableCellElementBase } from './SwcHTMLTableCellElementBase';

@elementDefine({ name: 'swc-other-td', extends: 'td' })
export class SwcOtherTableCell extends SwcHTMLTableCellElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
