import { elementDefine, innerHtml } from '../index';
import { SwcHTMLOutputElementBase } from './SwcHTMLOutputElementBase';

@elementDefine({ name: 'swc-other-output', extends: 'output' })
export class SwcOtherOutput extends SwcHTMLOutputElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
