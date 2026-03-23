import { elementDefine, innerHtml } from '../index';
import { SwcHTMLLinkElementBase } from './SwcHTMLLinkElementBase';

@elementDefine({ name: 'swc-when-link', extends: 'link' })
export class SwcWhenLink extends SwcHTMLLinkElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
