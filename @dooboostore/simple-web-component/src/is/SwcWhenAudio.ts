import { elementDefine, innerHtml } from '../index';
import { SwcHTMLAudioElementBase } from './SwcHTMLAudioElementBase';

@elementDefine({ name: 'swc-when-audio', extends: 'audio' })
export class SwcWhenAudio extends SwcHTMLAudioElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
