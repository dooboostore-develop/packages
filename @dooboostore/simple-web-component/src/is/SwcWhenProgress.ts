import { elementDefine, innerHtml } from '../index';
import { SwcHTMLProgressElementBase } from './SwcHTMLProgressElementBase';

@elementDefine({ name: 'swc-when-progress', extends: 'progress' })
export class SwcWhenProgress extends SwcHTMLProgressElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
