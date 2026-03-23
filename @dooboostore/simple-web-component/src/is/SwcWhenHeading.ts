import { elementDefine, innerHtml } from '../index';
import { SwcHTMLHeadingElementBase } from './SwcHTMLHeadingElementBase';

@elementDefine({ name: 'swc-when-h1', extends: 'h1' })
export class SwcWhenHeading extends SwcHTMLHeadingElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
