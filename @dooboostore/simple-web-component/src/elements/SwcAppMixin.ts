import { SwcAppEngine, SwcAttributeConfigType, SwcConfigType } from './SwcAppEngine';
import { SwcAppInterface } from '../types';
import { SwcUtils } from '../utils/Utils';
import { FunctionUtils, Subscription } from '@dooboostore/core';
import { RouterEventType } from '@dooboostore/core-web';
import { getSubscribeSwcAppRouteChangeMetadata } from '../decorators/subscribeSwcAppRouteChange';

export function SwcAppMixin<T extends { new (...args: any[]): HTMLElement }>(Base: T) {
  return class extends Base implements SwcAppInterface {
    __swc_engine = new SwcAppEngine(this as any);
    _swc_connected_instance = new Set<any>();
    _routerSubscription?: Subscription;
    _lastRouterEvent?: RouterEventType;

    get simpleApplication() {
      return this.__swc_engine.simpleApplication;
    }
    get router() {
      return this.__swc_engine.router;
    }

    _invokeRouteChangeSubscribers(instance: any, re: RouterEventType) {
      const routeChangeSubscribers = getSubscribeSwcAppRouteChangeMetadata(instance);
      if (routeChangeSubscribers && Array.isArray(routeChangeSubscribers)) {
        routeChangeSubscribers.forEach((metadata: any) => {
          const methodName = metadata.propertyKey || metadata;
          const pathPattern = metadata.pathPattern;
          const filter = metadata.filter;

          // Path pattern matching (support both string and array)
          let pathMatched = false;
          let pathData: any = null;

          if (!pathPattern) {
            // pathPattern이 없으면 모든 경로 매칭 (와일드카드)
            pathMatched = true;
            pathData = {};
          } else if (Array.isArray(pathPattern)) {
            // 배열: 하나라도 매칭되면 OK
            for (const pattern of pathPattern) {
              const data = SwcUtils.parsePathPattern(pattern, re.path || '/');
              if (data !== null) {
                pathMatched = true;
                pathData = data;
                break;
              }
            }
          } else {
            // 문자열
            pathData = SwcUtils.parsePathPattern(pathPattern, re.path || '/');
            pathMatched = pathData !== null;
          }

          // Filter validation
          const filterPassed = !filter || filter(this.router!);

          // Invoke method if conditions pass
          if (pathMatched && filterPassed) {
            instance[methodName]?.(re, pathData || {});
          }
        });
      }
    }

    _connected(instance: any) {
      // console.log('------------------>', instance);
      if (instance) {
        this._swc_connected_instance.add(instance);

        // Notify current route subscribers immediately after connection
        if (this.router && this._lastRouterEvent) {
          this._invokeRouteChangeSubscribers(instance, this._lastRouterEvent);
        }
      }
    }

    _disconnected(instance: any) {
      if (instance) {
        this._swc_connected_instance.delete(instance);
      }
    }

    _handleRouteChange(route: RouterEventType) {
      if (route.triggerPoint === 'end') {
        // Iterate through all connected component instances
        this._swc_connected_instance.forEach((instance: any) => {
          this._invokeRouteChangeSubscribers(instance, route);
        });
      }

      // Save last router event
      this._lastRouterEvent = route;
    }

    async connect(config?: SwcAttributeConfigType) {
      const swcConfig = {
        routeType: 'element',
        window: config.window,
        ...config
      } as SwcConfigType;

      const mode = config?.connectMode || 'direct';

      if (mode === 'direct') {
        await this.__swc_engine.connect(swcConfig);
        this.setAttribute('swc-connect-mode', 'direct');
      } else if (mode === 'swap' && !this.parentNode) {
        await this.__swc_engine.connect(swcConfig);
        this.setAttribute('swc-connect-mode', 'direct');

        const clonedApp = this.cloneNode(true) as any;
        clonedApp.style.display = 'none';
        this.parentNode.insertBefore(clonedApp, this.nextSibling);

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

      // console.log('vvvvvvv222222', this.router);
      // Subscribe to router changes after connect
      if (!this._routerSubscription && this.router) {
        this._routerSubscription = this.router.observable.subscribe((route: RouterEventType) => {
          // console.log('Route changed:', route);
          this._handleRouteChange(route);
        });

        // Navigate to initial path if specified
        // const config = this.__swc_engine.config;
        // if (config?.path) {
        //   this.router.go(config.path);
        // }
      }
    }

    connectedCallback() {
      // @ts-ignore
      if (super.connectedCallback) super.connectedCallback();

      const configStr = this.getAttribute('swc-get-application-config');
      const win = this.ownerDocument?.defaultView || window;
      if (configStr && win) {
        try {
          // console.log('vvvvvvvvvvvvvvvv->>>>', SwcUtils.findNearestSwcHost(this.host), SwcUtils.getHostSet(this.host))
          const userConfig = FunctionUtils.executeReturn({
            script: configStr,
            context: this,
            args: SwcUtils.getHelperAndHostSet(win, SwcUtils.findNearestSwcHost(this))
          });
          this.connect(userConfig);
        } catch (e) {
          console.error('[SWC-APP-ENGINE] Script execution failed:', e);
        }
      }

      this.__swc_engine?.config?.onConnected?.(this);
    }

    disconnectedCallback() {
      // @ts-ignore
      if (super.disconnectedCallback) super.disconnectedCallback();
      this._routerSubscription?.unsubscribe();
      this._routerSubscription = undefined;
      this._lastRouterEvent = undefined;
      this.__swc_engine.disconnect();
      this.__swc_engine?.config?.onDisconnected?.(this);
    }

    async routing(path: string) {
      await this.__swc_engine.router?.go(path);
    }
  };
}
