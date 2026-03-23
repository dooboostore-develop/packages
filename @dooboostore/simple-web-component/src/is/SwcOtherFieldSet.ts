import { elementDefine, innerHtml } from '../index';
import { SwcHTMLFieldSetElementBase } from './SwcHTMLFieldSetElementBase';

@elementDefine({ name: 'swc-other-fieldset', extends: 'fieldset' })
export class SwcOtherFieldSet extends SwcHTMLFieldSetElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
