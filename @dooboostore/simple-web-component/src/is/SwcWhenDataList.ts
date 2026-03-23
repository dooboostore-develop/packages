import { elementDefine, innerHtml } from '../index';
import { SwcHTMLDataListElementBase } from './SwcHTMLDataListElementBase';

@elementDefine({ name: 'swc-when-datalist', extends: 'datalist' })
export class SwcWhenDataList extends SwcHTMLDataListElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
