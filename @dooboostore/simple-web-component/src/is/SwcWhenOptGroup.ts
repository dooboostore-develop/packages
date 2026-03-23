import { elementDefine, innerHtml } from '../index';
import { SwcHTMLOptGroupElementBase } from './SwcHTMLOptGroupElementBase';

@elementDefine({ name: 'swc-when-optgroup', extends: 'optgroup' })
export class SwcWhenOptGroup extends SwcHTMLOptGroupElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
