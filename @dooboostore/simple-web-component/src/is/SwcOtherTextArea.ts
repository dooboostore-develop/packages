import { elementDefine, innerHtml } from '../index';
import { SwcHTMLTextAreaElementBase } from './SwcHTMLTextAreaElementBase';

@elementDefine({ name: 'swc-other-textarea', extends: 'textarea' })
export class SwcOtherTextArea extends SwcHTMLTextAreaElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
