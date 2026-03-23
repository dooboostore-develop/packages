import { elementDefine, innerHtml } from '../index';
import { SwcHTMLMetaElementBase } from './SwcHTMLMetaElementBase';

@elementDefine({ name: 'swc-when-meta', extends: 'meta' })
export class SwcWhenMeta extends SwcHTMLMetaElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
