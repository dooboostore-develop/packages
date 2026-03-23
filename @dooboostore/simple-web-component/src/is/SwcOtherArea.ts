import { elementDefine, innerHtml } from '../index';
import { SwcHTMLAreaElementBase } from './SwcHTMLAreaElementBase';

@elementDefine({ name: 'swc-other-area', extends: 'area' })
export class SwcOtherArea extends SwcHTMLAreaElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
