import { elementDefine } from '../../decorators/elementDefine';
import { SwcAppEngine } from '../SwcAppEngine';

@elementDefine({ name: 'swc-app-a', extends: 'a' })
export class SwcAppAnchor extends HTMLAnchorElement {
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
