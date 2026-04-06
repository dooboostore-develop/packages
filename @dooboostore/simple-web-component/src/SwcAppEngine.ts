import { SimpleApplication } from '@dooboostore/simple-boot';
import { HashRouter, PathRouter, Router, RouterEventType } from '@dooboostore/core-web';
import { ElementRouter } from './router/ElementRouter';
import { SimOption } from '@dooboostore/simple-boot';
import { ConstructorType, OptionalType, Subscription } from '@dooboostore/core';
import { SwcAppInterface } from './types';
import { SimConfig } from '@dooboostore/simple-boot';

export type SwcConfigType = {
  routeType: 'path' | 'hash' | 'element';
  connectMode?: 'direct' | 'swap' | 'clear-swap'; // hydrate 아직 개발중
  container?: symbol;
  otherInstanceSim?: Map<ConstructorType<any> | Function | SimConfig | symbol, any>;
  path?: string;
  window: Window;
  onEngineStarted?: (sp: SimpleApplication, app: SwcAppInterface) => Promise<void> | void;
  onConnectedChildAfter?: (swcEl: HTMLElement) => void;
  onConnectedChildBefore?: (swcEl: HTMLElement) => void;
  onDisconnectedChildAfter?: (swcEl: HTMLElement) => void;
  onDisconnectedChildBefore?: (swcEl: HTMLElement) => void;
  onConnected?: (app: SwcAppInterface) => void;
  onDisconnected?: (app: SwcAppInterface) => void;
  ssr?: boolean;
  onStartedLazyComponent?: ((w: Window)=> Promise<CustomElementConstructor> | void | string | any | CustomElementConstructor)[];

  onChildrenConnectedDone?: (app: SwcAppInterface) => void;
  // onChildrenSwcAppStartedDone?: (app: SwcAppInterface) => void;
  // childrenSwcAppStartedDoneCheckIntervalTime?: number;
  onChildrenRouteChanged?: (event: RouterEventType, app: SwcAppInterface) => void;
  childrenRouteChangedCheckIntervalTime?: number; // 자식 연결 완료 이벤트 디바운스 타임 (ms)
  childrenConnectedDoneCheckIntervalTime?: number;
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
          excludeProxys: [(this._config.window as any).Node],
          container: this._config.container
        })
      );

      const otherInstanceSim = new Map<any, any>();
      this.config?.otherInstanceSim?.forEach((v, k) => {
        otherInstanceSim.set(k, v);
      });
      if (this.router) otherInstanceSim.set(Router, this.router);
      this.simpleApplication.run(otherInstanceSim);


      if (this._config.onStartedLazyComponent) {
        await Promise.all(this._config.onStartedLazyComponent.map(it => it(this._config.window)))
      }
      if (this._config.onEngineStarted) {
        await this._config.onEngineStarted(this.simpleApplication, this.host as unknown as SwcAppInterface);
      }
    } catch (e) {
      console.error('[SWC-APP-ENGINE] Init failed:', e, this._config);
    }
  }

  disconnect() {
    this.routerSubscription?.unsubscribe();
  }
}
