import { elementDefine, innerHtml } from '../index';
import { SwcHTMLObjectElementBase } from './SwcHTMLObjectElementBase';

@elementDefine({ name: 'swc-when-object', extends: 'object' })
export class SwcWhenObject extends SwcHTMLObjectElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
