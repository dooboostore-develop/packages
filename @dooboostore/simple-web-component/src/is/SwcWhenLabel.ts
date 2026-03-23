import { elementDefine, innerHtml } from '../index';
import { SwcHTMLLabelElementBase } from './SwcHTMLLabelElementBase';

@elementDefine({ name: 'swc-when-label', extends: 'label' })
export class SwcWhenLabel extends SwcHTMLLabelElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
