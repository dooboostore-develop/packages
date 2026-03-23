import { elementDefine, innerHtml } from '../index';
import { SwcHTMLLIElementBase } from './SwcHTMLLIElementBase';

@elementDefine({ name: 'swc-other-li', extends: 'li' })
export class SwcOtherLi extends SwcHTMLLIElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
