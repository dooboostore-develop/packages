import { elementDefine, innerHtml } from '../index';
import { SwcHTMLEmbedElementBase } from './SwcHTMLEmbedElementBase';

@elementDefine({ name: 'swc-other-embed', extends: 'embed' })
export class SwcOtherEmbed extends SwcHTMLEmbedElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
