import { elementDefine, innerHtml } from '../index';
import { SwcHTMLOListElementBase } from './SwcHTMLOListElementBase';

@elementDefine({ name: 'swc-other-ol', extends: 'ol' })
export class SwcOtherOl extends SwcHTMLOListElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
