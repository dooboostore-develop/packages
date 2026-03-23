import { elementDefine, innerHtml } from '../index';
import { SwcHTMLLIElementBase } from './SwcHTMLLIElementBase';

@elementDefine({ name: 'swc-when-li', extends: 'li' })
export class SwcWhenLi extends SwcHTMLLIElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
