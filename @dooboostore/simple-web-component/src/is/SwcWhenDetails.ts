import { elementDefine, innerHtml } from '../index';
import { SwcHTMLDetailsElementBase } from './SwcHTMLDetailsElementBase';

@elementDefine({ name: 'swc-when-details', extends: 'details' })
export class SwcWhenDetails extends SwcHTMLDetailsElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
