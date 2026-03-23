import { elementDefine, innerHtml } from '../index';
import { SwcHTMLQuoteElementBase } from './SwcHTMLQuoteElementBase';

@elementDefine({ name: 'swc-other-blockquote', extends: 'blockquote' })
export class SwcOtherQuote extends SwcHTMLQuoteElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
