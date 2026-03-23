import { elementDefine, innerHtml } from '../index';
import { SwcHTMLSourceElementBase } from './SwcHTMLSourceElementBase';

@elementDefine({ name: 'swc-other-source', extends: 'source' })
export class SwcOtherSource extends SwcHTMLSourceElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
