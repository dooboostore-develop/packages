import { elementDefine, innerHtml } from '../index';
import { SwcHTMLTableSectionElementBase } from './SwcHTMLTableSectionElementBase';

@elementDefine({ name: 'swc-when-tbody', extends: 'tbody' })
export class SwcWhenTableSection extends SwcHTMLTableSectionElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
