import { elementDefine, innerHtml } from '../index';
import { SwcHTMLTrackElementBase } from './SwcHTMLTrackElementBase';

@elementDefine({ name: 'swc-when-track', extends: 'track' })
export class SwcWhenTrack extends SwcHTMLTrackElementBase {
  connectedCallback() {
    if (this.style.display !== 'contents') {
       this.style.display = 'none';
    }
  }
}
