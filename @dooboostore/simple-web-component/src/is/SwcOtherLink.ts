import { elementDefine, innerHtml } from '../index';
import { SwcHTMLLinkElementBase } from './SwcHTMLLinkElementBase';

@elementDefine({ name: 'swc-other-link', extends: 'link' })
export class SwcOtherLink extends SwcHTMLLinkElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
