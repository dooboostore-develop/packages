import { elementDefine, innerHtml } from '../index';
import { SwcHTMLAudioElementBase } from './SwcHTMLAudioElementBase';

@elementDefine({ name: 'swc-other-audio', extends: 'audio' })
export class SwcOtherAudio extends SwcHTMLAudioElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
