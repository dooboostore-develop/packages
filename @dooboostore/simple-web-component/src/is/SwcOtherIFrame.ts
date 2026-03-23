import { elementDefine, innerHtml } from '../index';
import { SwcHTMLIFrameElementBase } from './SwcHTMLIFrameElementBase';

@elementDefine({ name: 'swc-other-iframe', extends: 'iframe' })
export class SwcOtherIFrame extends SwcHTMLIFrameElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
