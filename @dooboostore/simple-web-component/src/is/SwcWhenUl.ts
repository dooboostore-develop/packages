import { elementDefine, innerHtml } from '../index';
import { SwcHTMLUListElementBase } from './SwcHTMLUListElementBase';

@elementDefine({ name: 'swc-when-ul', extends: 'ul' })
export class SwcWhenUl extends SwcHTMLUListElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
