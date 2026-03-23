import { elementDefine, innerHtml } from '../index';
import { SwcHTMLAnchorElementBase } from './SwcHTMLAnchorElementBase';

@elementDefine({ name: 'swc-when-a', extends: 'a' })
export class SwcWhenAnchor extends SwcHTMLAnchorElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
