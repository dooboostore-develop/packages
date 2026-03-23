import { elementDefine, innerHtml } from '../index';
import { SwcHTMLImageElementBase } from './SwcHTMLImageElementBase';

@elementDefine({ name: 'swc-when-img', extends: 'img' })
export class SwcWhenImage extends SwcHTMLImageElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
