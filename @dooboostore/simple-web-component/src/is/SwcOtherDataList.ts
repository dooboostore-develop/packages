import { elementDefine, innerHtml } from '../index';
import { SwcHTMLDataListElementBase } from './SwcHTMLDataListElementBase';

@elementDefine({ name: 'swc-other-datalist', extends: 'datalist' })
export class SwcOtherDataList extends SwcHTMLDataListElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
