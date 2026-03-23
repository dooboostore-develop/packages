import { elementDefine, innerHtml } from '../index';
import { SwcHTMLDivElementBase } from './SwcHTMLDivElementBase';

@elementDefine({ name: 'swc-when-div', extends: 'div' })
export class SwcWhenDiv extends SwcHTMLDivElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
