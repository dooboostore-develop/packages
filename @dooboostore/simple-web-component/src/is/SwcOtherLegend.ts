import { elementDefine, innerHtml } from '../index';
import { SwcHTMLLegendElementBase } from './SwcHTMLLegendElementBase';

@elementDefine({ name: 'swc-other-legend', extends: 'legend' })
export class SwcOtherLegend extends SwcHTMLLegendElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
