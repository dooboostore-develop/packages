import { elementDefine, innerHtml } from '../index';
import { SwcHTMLSlotElementBase } from './SwcHTMLSlotElementBase';

@elementDefine({ name: 'swc-other-slot', extends: 'slot' })
export class SwcOtherSlot extends SwcHTMLSlotElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
