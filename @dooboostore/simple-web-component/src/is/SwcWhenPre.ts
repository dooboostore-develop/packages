import { elementDefine, innerHtml } from '../index';
import { SwcHTMLPreElementBase } from './SwcHTMLPreElementBase';

@elementDefine({ name: 'swc-when-pre', extends: 'pre' })
export class SwcWhenPre extends SwcHTMLPreElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
