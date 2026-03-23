import { elementDefine, innerHtml } from '../index';
import { SwcHTMLProgressElementBase } from './SwcHTMLProgressElementBase';

@elementDefine({ name: 'swc-other-progress', extends: 'progress' })
export class SwcOtherProgress extends SwcHTMLProgressElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
