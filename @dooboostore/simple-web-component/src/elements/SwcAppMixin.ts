import { SwcAppEngine, SwcAttributeConfigType } from './SwcAppEngine';

export function SwcAppMixin<T extends { new (...args: any[]): HTMLElement }>(Base: T) {
  return class extends Base {
    __swc_engine = new SwcAppEngine(this as any);

    get simpleApplication() {
      return this.__swc_engine.simpleApplication;
    }
    get router() {
      return this.__swc_engine.router;
    }

    async connect(config?: SwcAttributeConfigType) {
      await this.__swc_engine.connect(config);
    }

    connectedCallback() {
      // @ts-ignore
      if (super.connectedCallback) super.connectedCallback();
      this.connect();
    }

    disconnectedCallback() {
      // @ts-ignore
      if (super.disconnectedCallback) super.disconnectedCallback();
      this.__swc_engine.disconnect();
    }

    async routing(path: string) {
      await this.__swc_engine.router?.go(path);
    }
  };
}
