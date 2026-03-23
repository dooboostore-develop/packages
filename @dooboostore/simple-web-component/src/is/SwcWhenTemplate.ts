import { elementDefine, innerHtml } from '../index';
import { SwcHTMLTemplateElementBase } from './SwcHTMLTemplateElementBase';

@elementDefine({ name: 'swc-when-template', extends: 'template' })
export class SwcWhenTemplate extends SwcHTMLTemplateElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
