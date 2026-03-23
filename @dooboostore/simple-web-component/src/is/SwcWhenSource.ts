import { elementDefine, innerHtml } from '../index';
import { SwcHTMLSourceElementBase } from './SwcHTMLSourceElementBase';

@elementDefine({ name: 'swc-when-source', extends: 'source' })
export class SwcWhenSource extends SwcHTMLSourceElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
