import { elementDefine, innerHtml } from '../index';
import { SwcHTMLOutputElementBase } from './SwcHTMLOutputElementBase';

@elementDefine({ name: 'swc-when-output', extends: 'output' })
export class SwcWhenOutput extends SwcHTMLOutputElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
