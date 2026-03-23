import { elementDefine, innerHtml } from '../index';
import { SwcHTMLMetaElementBase } from './SwcHTMLMetaElementBase';

@elementDefine({ name: 'swc-other-meta', extends: 'meta' })
export class SwcOtherMeta extends SwcHTMLMetaElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
