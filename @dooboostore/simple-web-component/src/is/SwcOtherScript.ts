import { elementDefine, innerHtml } from '../index';
import { SwcHTMLScriptElementBase } from './SwcHTMLScriptElementBase';

@elementDefine({ name: 'swc-other-script', extends: 'script' })
export class SwcOtherScript extends SwcHTMLScriptElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
