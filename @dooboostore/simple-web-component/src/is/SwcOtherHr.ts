import { elementDefine, innerHtml } from '../index';
import { SwcHTMLHRElementBase } from './SwcHTMLHRElementBase';

@elementDefine({ name: 'swc-other-hr', extends: 'hr' })
export class SwcOtherHr extends SwcHTMLHRElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
