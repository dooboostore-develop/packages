import { elementDefine, innerHtml } from '../index';
import { SwcHTMLLabelElementBase } from './SwcHTMLLabelElementBase';

@elementDefine({ name: 'swc-other-label', extends: 'label' })
export class SwcOtherLabel extends SwcHTMLLabelElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
