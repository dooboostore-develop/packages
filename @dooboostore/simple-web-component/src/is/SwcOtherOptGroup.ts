import { elementDefine, innerHtml } from '../index';
import { SwcHTMLOptGroupElementBase } from './SwcHTMLOptGroupElementBase';

@elementDefine({ name: 'swc-other-optgroup', extends: 'optgroup' })
export class SwcOtherOptGroup extends SwcHTMLOptGroupElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
