import { elementDefine, innerHtml } from '../index';
import { SwcHTMLBaseElementBase } from './SwcHTMLBaseElementBase';

@elementDefine({ name: 'swc-when-base', extends: 'base' })
export class SwcWhenBase extends SwcHTMLBaseElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
