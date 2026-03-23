import { elementDefine, innerHtml } from '../index';
import { SwcHTMLButtonElementBase } from './SwcHTMLButtonElementBase';

@elementDefine({ name: 'swc-other-button', extends: 'button' })
export class SwcOtherButton extends SwcHTMLButtonElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
