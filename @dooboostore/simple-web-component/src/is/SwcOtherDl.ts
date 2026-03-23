import { elementDefine, innerHtml } from '../index';
import { SwcHTMLDListElementBase } from './SwcHTMLDListElementBase';

@elementDefine({ name: 'swc-other-dl', extends: 'dl' })
export class SwcOtherDl extends SwcHTMLDListElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
