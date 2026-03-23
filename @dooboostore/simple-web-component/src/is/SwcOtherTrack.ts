import { elementDefine, innerHtml } from '../index';
import { SwcHTMLTrackElementBase } from './SwcHTMLTrackElementBase';

@elementDefine({ name: 'swc-other-track', extends: 'track' })
export class SwcOtherTrack extends SwcHTMLTrackElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
