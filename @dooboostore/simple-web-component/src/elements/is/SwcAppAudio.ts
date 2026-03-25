import { elementDefine } from '../../decorators/elementDefine';
import { SwcAppEngine } from '../SwcAppEngine';

@elementDefine({ name: 'swc-app-audio', extends: 'audio' })
export class SwcAppAudio extends HTMLAudioElement {
  private _engine = new SwcAppEngine(this);

  get simpleApplication() {
    return this._engine.simpleApplication;
  }
  get router() {
    return this._engine.router;
  }

  connectedCallback() {
    this._engine.connect();
  }

  disconnectedCallback() {
    this._engine.disconnect();
  }

  async routing(path: string) {
    await this._engine.router?.go(path);
  }
}
