import { elementDefine, innerHtml } from '../index';
import { SwcHTMLSelectElementBase } from './SwcHTMLSelectElementBase';

@elementDefine({ name: 'swc-when-select', extends: 'select' })
export class SwcWhenSelect extends SwcHTMLSelectElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
