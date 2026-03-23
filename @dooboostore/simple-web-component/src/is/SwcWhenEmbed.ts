import { elementDefine, innerHtml } from '../index';
import { SwcHTMLEmbedElementBase } from './SwcHTMLEmbedElementBase';

@elementDefine({ name: 'swc-when-embed', extends: 'embed' })
export class SwcWhenEmbed extends SwcHTMLEmbedElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
