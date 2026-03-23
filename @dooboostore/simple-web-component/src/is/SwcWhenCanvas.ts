import { elementDefine, innerHtml } from '../index';
import { SwcHTMLCanvasElementBase } from './SwcHTMLCanvasElementBase';

@elementDefine({ name: 'swc-when-canvas', extends: 'canvas' })
export class SwcWhenCanvas extends SwcHTMLCanvasElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
