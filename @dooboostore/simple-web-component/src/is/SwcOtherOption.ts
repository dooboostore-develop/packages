import { elementDefine, innerHtml } from '../index';
import { SwcHTMLOptionElementBase } from './SwcHTMLOptionElementBase';

@elementDefine({ name: 'swc-other-option', extends: 'option' })
export class SwcOtherOption extends SwcHTMLOptionElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
