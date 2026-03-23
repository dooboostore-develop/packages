import { elementDefine, innerHtml } from '../index';
import { SwcHTMLIFrameElementBase } from './SwcHTMLIFrameElementBase';

@elementDefine({ name: 'swc-when-iframe', extends: 'iframe' })
export class SwcWhenIFrame extends SwcHTMLIFrameElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
