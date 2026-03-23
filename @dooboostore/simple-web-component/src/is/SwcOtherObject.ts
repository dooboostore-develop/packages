import { elementDefine, innerHtml } from '../index';
import { SwcHTMLObjectElementBase } from './SwcHTMLObjectElementBase';

@elementDefine({ name: 'swc-other-object', extends: 'object' })
export class SwcOtherObject extends SwcHTMLObjectElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
