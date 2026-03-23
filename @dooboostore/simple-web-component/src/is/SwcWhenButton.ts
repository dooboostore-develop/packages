import { elementDefine, innerHtml } from '../index';
import { SwcHTMLButtonElementBase } from './SwcHTMLButtonElementBase';

@elementDefine({ name: 'swc-when-button', extends: 'button' })
export class SwcWhenButton extends SwcHTMLButtonElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
