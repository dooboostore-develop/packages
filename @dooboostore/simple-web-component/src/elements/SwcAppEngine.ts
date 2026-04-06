import { SimpleApplication } from '@dooboostore/simple-boot/SimpleApplication';
import { HashRouter, PathRouter, Router, RouterEventType } from '@dooboostore/core-web';
import { ElementRouter } from '../router/ElementRouter';
import { SimOption } from '@dooboostore/simple-boot/SimOption';
import { ConstructorType, OptionalType, Subscription } from '@dooboostore/core';

import { SwcAppInterface } from '../types';
import { SimConfig } from '@dooboostore/simple-boot';

export type SwcConfigType = {
  routeType: 'path' | 'hash' | 'element';
  connectMode?: 'direct' | 'swap';
  container?: symbol;
  otherInstanceSim?: Map<ConstructorType<any> | Function | SimConfig | symbol, any>;
  path?: string;
  window: Window;
  onEngineStarted?: (sp: SimpleApplication, app: SwcAppInterface) => void;
  onConnected?: (app: SwcAppInterface) => void;
  onDisconnected?: (app: SwcAppInterface) => void;
  onRouteChanged?: (event: RouterEventType, app: SwcAppInterface) => void;
};

export type SwcAttributeConfigType = OptionalType<SwcConfigType, 'routeType' | 'window'>;

export class SwcAppEngine {
  public simpleApplication?: SimpleApplication;
  public router?: Router;
  private routerSubscription?: Subscription;
  private _config?: SwcConfigType;

  constructor(private host: HTMLElement) {}

  get config() {
    return this._config;
  }
  async connect(config: SwcConfigType) {
    try {
      this._config = config;

      // Router Selection
      if (this._config.routeType === 'path') {
        this.router = new PathRouter({ window: this._config.window, firstUrl: this._config.path });
      } else if (this._config.routeType === 'hash') {
        this.router = new HashRouter({ window: this._config.window, firstUrl: this._config.path });
      } else if (this._config.routeType === 'element') {
        this.router = new ElementRouter({ window: this._config.window, firstUrl: this._config.path });
      }

      // console.log('vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv', this.router)

      // App start
      this.simpleApplication = new SimpleApplication(
        new SimOption({
          excludeProxys: [Node],
          container: this._config.container
        })
      );

      const otherInstanceSim = new Map<any, any>();
      this.config.otherInstanceSim?.forEach((v, k) => {
        otherInstanceSim.set(k, v);
      });
      if (this.router) otherInstanceSim.set(Router, this.router);
      this.simpleApplication.run(otherInstanceSim);

      if (this._config.onEngineStarted) {
        this._config.onEngineStarted(this.simpleApplication, this.host as unknown as SwcAppInterface);
      }
    } catch (e) {
      console.error('[SWC-APP-ENGINE] Init failed:', e, this._config);
    }
  }

  disconnect() {
    this.routerSubscription?.unsubscribe();
  }
}
