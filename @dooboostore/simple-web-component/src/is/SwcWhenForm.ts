import { elementDefine, innerHtml } from '../index';
import { SwcHTMLFormElementBase } from './SwcHTMLFormElementBase';

@elementDefine({ name: 'swc-when-form', extends: 'form' })
export class SwcWhenForm extends SwcHTMLFormElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
