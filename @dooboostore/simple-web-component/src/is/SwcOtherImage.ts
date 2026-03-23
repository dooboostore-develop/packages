import { elementDefine, innerHtml } from '../index';
import { SwcHTMLImageElementBase } from './SwcHTMLImageElementBase';

@elementDefine({ name: 'swc-other-img', extends: 'img' })
export class SwcOtherImage extends SwcHTMLImageElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
