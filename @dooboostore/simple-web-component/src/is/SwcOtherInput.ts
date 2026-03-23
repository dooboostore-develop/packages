import { elementDefine, innerHtml } from '../index';
import { SwcHTMLInputElementBase } from './SwcHTMLInputElementBase';

@elementDefine({ name: 'swc-other-input', extends: 'input' })
export class SwcOtherInput extends SwcHTMLInputElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
