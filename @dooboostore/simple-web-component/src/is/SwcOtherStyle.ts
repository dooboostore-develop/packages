import { elementDefine, innerHtml } from '../index';
import { SwcHTMLStyleElementBase } from './SwcHTMLStyleElementBase';

@elementDefine({ name: 'swc-other-style', extends: 'style' })
export class SwcOtherStyle extends SwcHTMLStyleElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
