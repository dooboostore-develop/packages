import { elementDefine, innerHtml } from '../index';
import { SwcHTMLOptionElementBase } from './SwcHTMLOptionElementBase';

@elementDefine({ name: 'swc-when-option', extends: 'option' })
export class SwcWhenOption extends SwcHTMLOptionElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
