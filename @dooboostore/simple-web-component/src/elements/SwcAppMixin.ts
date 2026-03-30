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
      const mode = config?.connectMode || 'direct';

      if (mode !== 'swap') {
        await this.__swc_engine.connect(config);
        this.setAttribute('swc-connect-mode', 'direct');
        return;
      }

      const parent = this.parentNode;
      if (!parent) {
        await this.__swc_engine.connect(config);
        this.setAttribute('swc-connect-mode', 'direct');
        return;
      }

      const clonedApp = this.cloneNode(true) as any;
      clonedApp.style.display = 'none';
      parent.insertBefore(clonedApp, this.nextSibling);

      try {
        await clonedApp.connect({ ...(config || {}), connectMode: 'direct' });
        if (this.parentNode) {
          this.parentNode.removeChild(this);
        }
        clonedApp.setAttribute('swc-connect-mode', 'swap');
        clonedApp.style.display = '';
      } catch (e) {
        if (clonedApp.parentNode) {
          clonedApp.parentNode.removeChild(clonedApp);
        }
        throw e;
      }
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
