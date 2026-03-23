import { elementDefine, innerHtml } from '../index';
import { SwcHTMLStyleElementBase } from './SwcHTMLStyleElementBase';

@elementDefine({ name: 'swc-when-style', extends: 'style' })
export class SwcWhenStyle extends SwcHTMLStyleElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
