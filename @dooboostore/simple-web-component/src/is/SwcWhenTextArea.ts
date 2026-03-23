import { elementDefine, innerHtml } from '../index';
import { SwcHTMLTextAreaElementBase } from './SwcHTMLTextAreaElementBase';

@elementDefine({ name: 'swc-when-textarea', extends: 'textarea' })
export class SwcWhenTextArea extends SwcHTMLTextAreaElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
