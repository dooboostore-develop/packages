import { elementDefine, innerHtml } from '../index';
import { SwcHTMLTableSectionElementBase } from './SwcHTMLTableSectionElementBase';

@elementDefine({ name: 'swc-other-tbody', extends: 'tbody' })
export class SwcOtherTableSection extends SwcHTMLTableSectionElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
