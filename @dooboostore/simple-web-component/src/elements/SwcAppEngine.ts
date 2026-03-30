import { SimpleApplication } from '@dooboostore/simple-boot/SimpleApplication';
import { PathRouter } from '@dooboostore/core-web/routers/PathRouter';
import { HashRouter } from '@dooboostore/core-web/routers/HashRouter';
import { ElementRouter } from '../router/ElementRouter';
import { SimOption } from '@dooboostore/simple-boot/SimOption';
import { Router, RouterEventType } from '@dooboostore/core-web/routers/Router';
import { Subscription } from '@dooboostore/core/message/Subscription';
import { ConstructorType, Optional } from '@dooboostore/core/types';
import { FunctionUtils } from '@dooboostore/core/function/FunctionUtils';
import { SwcUtils } from '../utils/Utils';

export type SwcConfigType = {
  rootRouter: ConstructorType<any> | Symbol;
  routeType: 'path' | 'hash' | 'element';
  connectMode?: 'direct' | 'swap';
  path?: string;
  window: Window;
};

export type SwcAttributeConfigType = Optional<SwcConfigType, 'routeType' | 'window'>;

export class SwcAppEngine {
  public simpleApplication?: SimpleApplication;
  public router?: Router;
  private routerSubscription?: Subscription;
  private _isInitialized = false;

  constructor(private host: HTMLElement) {}

  async connect(config?: SwcAttributeConfigType) {
    if (this._isInitialized) return;

    let userConfig = config;
    const win = this.host.ownerDocument?.defaultView || window;
    const Node = (win as any).Node as typeof globalThis.Node;
    if (!userConfig) {
      const configStr = this.host.getAttribute('swc-get-application-config');
      if (configStr) {
        try {
          userConfig = FunctionUtils.executeReturn({
            script: configStr,
            context: this.host,
            args: SwcUtils.getHelperAndHostSet(win, this.host)
          });
        } catch (e) {
          console.error('[SWC-APP-ENGINE] Script execution failed:', e);
        }
      }
    }

    if (!userConfig) return;
    this._isInitialized = true;

    try {
      if (userConfig.rootRouter) {
        const _config: SwcConfigType = {
          routeType: 'element',
          window: win,
          ...userConfig
        } as SwcConfigType;

        // Router Selection
        if (_config.routeType === 'path') {
          this.router = new PathRouter({ window: _config.window, firstUrl: _config.path });
        } else if (_config.routeType === 'hash') {
          this.router = new HashRouter({ window: _config.window, firstUrl: _config.path });
        } else if (_config.routeType === 'element') {
          this.router = new ElementRouter({ window: _config.window, firstUrl: _config.path });
        }

        // Routing sync
        if (this.router) {
          this.routerSubscription = this.router.observable.subscribe((route: RouterEventType) => {
            if (route.triggerPoint === 'end') {
              this.simpleApplication?.routing(route.path);
            }
          });
        }


        // App start
        this.simpleApplication = new SimpleApplication(new SimOption({ excludeProxys: [Node], rootRouter: _config.rootRouter }));

        const otherInstanceSim = new Map<any, any>();
        if (this.router) otherInstanceSim.set(Router, this.router);
        this.simpleApplication.run(otherInstanceSim);

        // Rendering
        const data = this.simpleApplication.sim(_config.rootRouter);
        if (data instanceof Node) {
          if (this.host.shadowRoot) this.host.shadowRoot.replaceChildren(data);
          else this.host.replaceChildren(data);
        }

        if (_config.path) this.router?.go(_config.path);
      }
    } catch (e) {
      console.error('[SWC-APP-ENGINE] Init failed:', e);
    }
  }

  disconnect() {
    this.routerSubscription?.unsubscribe();
  }
}
