import { elementDefine, innerHtml } from '../index';
import { SwcHTMLCanvasElementBase } from './SwcHTMLCanvasElementBase';

@elementDefine({ name: 'swc-other-canvas', extends: 'canvas' })
export class SwcOtherCanvas extends SwcHTMLCanvasElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
