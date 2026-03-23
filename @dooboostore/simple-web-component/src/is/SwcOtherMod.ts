import { elementDefine, innerHtml } from '../index';
import { SwcHTMLModElementBase } from './SwcHTMLModElementBase';

@elementDefine({ name: 'swc-other-del', extends: 'del' })
export class SwcOtherMod extends SwcHTMLModElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
