import { elementDefine, innerHtml } from '../index';
import { SwcHTMLDivElementBase } from './SwcHTMLDivElementBase';

@elementDefine({ name: 'swc-other-div', extends: 'div' })
export class SwcOtherDiv extends SwcHTMLDivElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
