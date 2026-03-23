import { elementDefine, innerHtml } from '../index';
import { SwcHTMLInputElementBase } from './SwcHTMLInputElementBase';

@elementDefine({ name: 'swc-when-input', extends: 'input' })
export class SwcWhenInput extends SwcHTMLInputElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
