import { elementDefine, innerHtml } from '../index';
import { SwcHTMLTableElementBase } from './SwcHTMLTableElementBase';

@elementDefine({ name: 'swc-when-table', extends: 'table' })
export class SwcWhenTable extends SwcHTMLTableElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
