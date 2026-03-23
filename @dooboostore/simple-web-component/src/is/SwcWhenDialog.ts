import { elementDefine, innerHtml } from '../index';
import { SwcHTMLDialogElementBase } from './SwcHTMLDialogElementBase';

@elementDefine({ name: 'swc-when-dialog', extends: 'dialog' })
export class SwcWhenDialog extends SwcHTMLDialogElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
