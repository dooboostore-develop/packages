import { elementDefine, innerHtml } from '../index';
import { SwcHTMLTableElementBase } from './SwcHTMLTableElementBase';

@elementDefine({ name: 'swc-other-table', extends: 'table' })
export class SwcOtherTable extends SwcHTMLTableElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
