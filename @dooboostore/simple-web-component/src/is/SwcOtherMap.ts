import { elementDefine, innerHtml } from '../index';
import { SwcHTMLMapElementBase } from './SwcHTMLMapElementBase';

@elementDefine({ name: 'swc-other-map', extends: 'map' })
export class SwcOtherMap extends SwcHTMLMapElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
