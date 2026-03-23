import { elementDefine, innerHtml } from '../index';
import { SwcHTMLTimeElementBase } from './SwcHTMLTimeElementBase';

@elementDefine({ name: 'swc-other-time', extends: 'time' })
export class SwcOtherTime extends SwcHTMLTimeElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
