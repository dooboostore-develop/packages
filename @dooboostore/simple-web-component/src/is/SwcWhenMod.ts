import { elementDefine, innerHtml } from '../index';
import { SwcHTMLModElementBase } from './SwcHTMLModElementBase';

@elementDefine({ name: 'swc-when-del', extends: 'del' })
export class SwcWhenMod extends SwcHTMLModElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
