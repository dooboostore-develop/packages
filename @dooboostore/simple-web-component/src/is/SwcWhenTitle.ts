import { elementDefine, innerHtml } from '../index';
import { SwcHTMLTitleElementBase } from './SwcHTMLTitleElementBase';

@elementDefine({ name: 'swc-when-title', extends: 'title' })
export class SwcWhenTitle extends SwcHTMLTitleElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
