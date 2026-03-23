import { elementDefine, innerHtml } from '../index';
import { SwcHTMLPictureElementBase } from './SwcHTMLPictureElementBase';

@elementDefine({ name: 'swc-when-picture', extends: 'picture' })
export class SwcWhenPicture extends SwcHTMLPictureElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
