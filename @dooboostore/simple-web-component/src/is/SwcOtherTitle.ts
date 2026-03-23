import { elementDefine, innerHtml } from '../index';
import { SwcHTMLTitleElementBase } from './SwcHTMLTitleElementBase';

@elementDefine({ name: 'swc-other-title', extends: 'title' })
export class SwcOtherTitle extends SwcHTMLTitleElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
