import { elementDefine, innerHtml } from '../index';
import { SwcHTMLUListElementBase } from './SwcHTMLUListElementBase';

@elementDefine({ name: 'swc-other-ul', extends: 'ul' })
export class SwcOtherUl extends SwcHTMLUListElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
