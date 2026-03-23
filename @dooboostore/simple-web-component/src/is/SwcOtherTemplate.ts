import { elementDefine, innerHtml } from '../index';
import { SwcHTMLTemplateElementBase } from './SwcHTMLTemplateElementBase';

@elementDefine({ name: 'swc-other-template', extends: 'template' })
export class SwcOtherTemplate extends SwcHTMLTemplateElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
