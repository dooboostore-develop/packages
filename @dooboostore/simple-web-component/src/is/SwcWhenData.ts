import { elementDefine, innerHtml } from '../index';
import { SwcHTMLDataElementBase } from './SwcHTMLDataElementBase';

@elementDefine({ name: 'swc-when-data', extends: 'data' })
export class SwcWhenData extends SwcHTMLDataElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
