import { elementDefine, innerHtml } from '../index';
import { SwcHTMLAnchorElementBase } from './SwcHTMLAnchorElementBase';

@elementDefine({ name: 'swc-other-a', extends: 'a' })
export class SwcOtherAnchor extends SwcHTMLAnchorElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
