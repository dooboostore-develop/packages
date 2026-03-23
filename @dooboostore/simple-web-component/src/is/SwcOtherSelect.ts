import { elementDefine, innerHtml } from '../index';
import { SwcHTMLSelectElementBase } from './SwcHTMLSelectElementBase';

@elementDefine({ name: 'swc-other-select', extends: 'select' })
export class SwcOtherSelect extends SwcHTMLSelectElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
