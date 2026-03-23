import { elementDefine, innerHtml } from '../index';
import { SwcHTMLSpanElementBase } from './SwcHTMLSpanElementBase';

@elementDefine({ name: 'swc-when-span', extends: 'span' })
export class SwcWhenSpan extends SwcHTMLSpanElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
