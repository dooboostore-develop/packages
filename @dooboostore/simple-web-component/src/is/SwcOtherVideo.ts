import { elementDefine, innerHtml } from '../index';
import { SwcHTMLVideoElementBase } from './SwcHTMLVideoElementBase';

@elementDefine({ name: 'swc-other-video', extends: 'video' })
export class SwcOtherVideo extends SwcHTMLVideoElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
