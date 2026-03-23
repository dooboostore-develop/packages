import { elementDefine, innerHtml } from '../index';
import { SwcHTMLLegendElementBase } from './SwcHTMLLegendElementBase';

@elementDefine({ name: 'swc-when-legend', extends: 'legend' })
export class SwcWhenLegend extends SwcHTMLLegendElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
