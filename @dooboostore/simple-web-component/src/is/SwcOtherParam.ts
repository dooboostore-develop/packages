import { elementDefine, innerHtml } from '../index';
import { SwcHTMLParamElementBase } from './SwcHTMLParamElementBase';

@elementDefine({ name: 'swc-other-param', extends: 'param' })
export class SwcOtherParam extends SwcHTMLParamElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
