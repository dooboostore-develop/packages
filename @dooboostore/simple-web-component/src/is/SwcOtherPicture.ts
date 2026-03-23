import { elementDefine, innerHtml } from '../index';
import { SwcHTMLPictureElementBase } from './SwcHTMLPictureElementBase';

@elementDefine({ name: 'swc-other-picture', extends: 'picture' })
export class SwcOtherPicture extends SwcHTMLPictureElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
