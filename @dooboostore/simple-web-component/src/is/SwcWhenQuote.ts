import { elementDefine, innerHtml } from '../index';
import { SwcHTMLQuoteElementBase } from './SwcHTMLQuoteElementBase';

@elementDefine({ name: 'swc-when-blockquote', extends: 'blockquote' })
export class SwcWhenQuote extends SwcHTMLQuoteElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
