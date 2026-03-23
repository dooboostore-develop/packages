import { elementDefine, innerHtml } from '../index';
import { SwcHTMLDialogElementBase } from './SwcHTMLDialogElementBase';

@elementDefine({ name: 'swc-other-dialog', extends: 'dialog' })
export class SwcOtherDialog extends SwcHTMLDialogElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
