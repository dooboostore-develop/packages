import { elementDefine, innerHtml } from '../index';
import { SwcHTMLBaseElementBase } from './SwcHTMLBaseElementBase';

@elementDefine({ name: 'swc-other-base', extends: 'base' })
export class SwcOtherBase extends SwcHTMLBaseElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
