import { elementDefine, innerHtml } from '../index';
import { SwcHTMLDetailsElementBase } from './SwcHTMLDetailsElementBase';

@elementDefine({ name: 'swc-other-details', extends: 'details' })
export class SwcOtherDetails extends SwcHTMLDetailsElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
