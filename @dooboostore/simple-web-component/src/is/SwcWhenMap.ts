import { elementDefine, innerHtml } from '../index';
import { SwcHTMLMapElementBase } from './SwcHTMLMapElementBase';

@elementDefine({ name: 'swc-when-map', extends: 'map' })
export class SwcWhenMap extends SwcHTMLMapElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
