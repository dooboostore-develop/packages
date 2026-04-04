import { SimpleApplication } from '@dooboostore/simple-boot/SimpleApplication';
import { PathRouter } from '@dooboostore/core-web';
import { HashRouter } from '@dooboostore/core-web';
import { ElementRouter } from '../router/ElementRouter';
import { SimOption } from '@dooboostore/simple-boot/SimOption';
import { Router, RouterEventType } from '@dooboostore/core-web';
import { Subscription } from '@dooboostore/core';
import { ConstructorType, OptionalType } from '@dooboostore/core';
import { FunctionUtils } from '@dooboostore/core';
import { SwcUtils } from '../utils/Utils';

import { SwcAppInterface } from '../types';
import {Intent} from "@dooboostore/simple-boot";

export type SwcConfigType = {
  routeType: 'path' | 'hash' | 'element';
  connectMode?: 'direct' | 'swap';
  container?: symbol;
  path?: string;
  window: Window;
  onEngineStarted?: (sp: SimpleApplication, app: SwcAppInterface) => void;
  onConnected?: (app: SwcAppInterface) => void;
  onDisconnected?: (app: SwcAppInterface) => void;
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
        this.router = new PathRouter({ window: this._config.window });
      } else if (this._config.routeType === 'hash') {
        this.router = new HashRouter({ window: this._config.window });
      } else if (this._config.routeType === 'element') {
        this.router = new ElementRouter({ window: this._config.window });
      }

      // console.log('vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv', this.router)

      // App start
      const containerSymbol = this._config.container || (this.host as any).getContainerSymbol?.();
      this.simpleApplication = new SimpleApplication(
        new SimOption({
          excludeProxys: [Node],
          container: containerSymbol
        })
      );

      const otherInstanceSim = new Map<any, any>();
      if (this.router) otherInstanceSim.set(Router, this.router);
      this.simpleApplication.run(otherInstanceSim);

      if (this._config.onEngineStarted) {
        this._config.onEngineStarted(this.simpleApplication, this.host as unknown as SwcAppInterface);
      }
    } catch (e) {
      console.error('[SWC-APP-ENGINE] Init failed:', e);
    }
  }

  disconnect() {
    this.routerSubscription?.unsubscribe();
  }
}
