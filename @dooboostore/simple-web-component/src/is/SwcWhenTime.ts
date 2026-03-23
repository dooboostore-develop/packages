import { elementDefine, innerHtml } from '../index';
import { SwcHTMLTimeElementBase } from './SwcHTMLTimeElementBase';

@elementDefine({ name: 'swc-when-time', extends: 'time' })
export class SwcWhenTime extends SwcHTMLTimeElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
