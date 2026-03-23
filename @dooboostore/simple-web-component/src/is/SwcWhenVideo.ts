import { elementDefine, innerHtml } from '../index';
import { SwcHTMLVideoElementBase } from './SwcHTMLVideoElementBase';

@elementDefine({ name: 'swc-when-video', extends: 'video' })
export class SwcWhenVideo extends SwcHTMLVideoElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
