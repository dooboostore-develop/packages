import { elementDefine, innerHtml } from '../index';
import { SwcHTMLOListElementBase } from './SwcHTMLOListElementBase';

@elementDefine({ name: 'swc-when-ol', extends: 'ol' })
export class SwcWhenOl extends SwcHTMLOListElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
