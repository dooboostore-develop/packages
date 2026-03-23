import { elementDefine, innerHtml } from '../index';
import { SwcHTMLDataElementBase } from './SwcHTMLDataElementBase';

@elementDefine({ name: 'swc-other-data', extends: 'data' })
export class SwcOtherData extends SwcHTMLDataElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
