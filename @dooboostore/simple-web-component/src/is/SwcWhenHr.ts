import { elementDefine, innerHtml } from '../index';
import { SwcHTMLHRElementBase } from './SwcHTMLHRElementBase';

@elementDefine({ name: 'swc-when-hr', extends: 'hr' })
export class SwcWhenHr extends SwcHTMLHRElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
