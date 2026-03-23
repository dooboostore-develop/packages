import { elementDefine, innerHtml } from '../index';
import { SwcHTMLScriptElementBase } from './SwcHTMLScriptElementBase';

@elementDefine({ name: 'swc-when-script', extends: 'script' })
export class SwcWhenScript extends SwcHTMLScriptElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
