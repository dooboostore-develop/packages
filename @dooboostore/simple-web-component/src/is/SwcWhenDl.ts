import { elementDefine, innerHtml } from '../index';
import { SwcHTMLDListElementBase } from './SwcHTMLDListElementBase';

@elementDefine({ name: 'swc-when-dl', extends: 'dl' })
export class SwcWhenDl extends SwcHTMLDListElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
