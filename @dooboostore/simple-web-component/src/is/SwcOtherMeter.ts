import { elementDefine, innerHtml } from '../index';
import { SwcHTMLMeterElementBase } from './SwcHTMLMeterElementBase';

@elementDefine({ name: 'swc-other-meter', extends: 'meter' })
export class SwcOtherMeter extends SwcHTMLMeterElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
