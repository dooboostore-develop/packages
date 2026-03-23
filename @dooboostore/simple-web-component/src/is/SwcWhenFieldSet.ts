import { elementDefine, innerHtml } from '../index';
import { SwcHTMLFieldSetElementBase } from './SwcHTMLFieldSetElementBase';

@elementDefine({ name: 'swc-when-fieldset', extends: 'fieldset' })
export class SwcWhenFieldSet extends SwcHTMLFieldSetElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
