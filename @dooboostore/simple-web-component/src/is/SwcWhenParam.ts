import { elementDefine, innerHtml } from '../index';
import { SwcHTMLParamElementBase } from './SwcHTMLParamElementBase';

@elementDefine({ name: 'swc-when-param', extends: 'param' })
export class SwcWhenParam extends SwcHTMLParamElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
