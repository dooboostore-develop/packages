import { elementDefine, innerHtml } from '../index';
import { SwcHTMLParagraphElementBase } from './SwcHTMLParagraphElementBase';

@elementDefine({ name: 'swc-other-p', extends: 'p' })
export class SwcOtherParagraph extends SwcHTMLParagraphElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
