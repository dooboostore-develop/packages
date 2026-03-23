import { elementDefine, innerHtml } from '../index';
import { SwcHTMLAreaElementBase } from './SwcHTMLAreaElementBase';

@elementDefine({ name: 'swc-when-area', extends: 'area' })
export class SwcWhenArea extends SwcHTMLAreaElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
