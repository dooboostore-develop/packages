import { elementDefine, innerHtml } from '../index';
import { SwcHTMLSlotElementBase } from './SwcHTMLSlotElementBase';

@elementDefine({ name: 'swc-when-slot', extends: 'slot' })
export class SwcWhenSlot extends SwcHTMLSlotElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
