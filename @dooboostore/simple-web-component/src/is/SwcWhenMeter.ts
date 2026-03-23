import { elementDefine, innerHtml } from '../index';
import { SwcHTMLMeterElementBase } from './SwcHTMLMeterElementBase';

@elementDefine({ name: 'swc-when-meter', extends: 'meter' })
export class SwcWhenMeter extends SwcHTMLMeterElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
