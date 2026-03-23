import { elementDefine, innerHtml } from '../index';
import { SwcHTMLFormElementBase } from './SwcHTMLFormElementBase';

@elementDefine({ name: 'swc-other-form', extends: 'form' })
export class SwcOtherForm extends SwcHTMLFormElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
