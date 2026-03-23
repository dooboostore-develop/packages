import { elementDefine, innerHtml } from '../index';
import { SwcHTMLSpanElementBase } from './SwcHTMLSpanElementBase';

@elementDefine({ name: 'swc-other-span', extends: 'span' })
export class SwcOtherSpan extends SwcHTMLSpanElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
