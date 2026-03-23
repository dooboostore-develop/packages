import { elementDefine, innerHtml } from '../index';
import { SwcHTMLParagraphElementBase } from './SwcHTMLParagraphElementBase';

@elementDefine({ name: 'swc-when-p', extends: 'p' })
export class SwcWhenParagraph extends SwcHTMLParagraphElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
