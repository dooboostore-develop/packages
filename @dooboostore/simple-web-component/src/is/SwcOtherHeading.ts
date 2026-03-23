import { elementDefine, innerHtml } from '../index';
import { SwcHTMLHeadingElementBase } from './SwcHTMLHeadingElementBase';

@elementDefine({ name: 'swc-other-h1', extends: 'h1' })
export class SwcOtherHeading extends SwcHTMLHeadingElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
