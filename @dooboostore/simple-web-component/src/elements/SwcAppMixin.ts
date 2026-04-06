import { SwcAppEngine, SwcAttributeConfigType, SwcConfigType } from './SwcAppEngine';
import { SwcAppInterface, SwcAppMessage } from '../types';
import { SwcUtils } from '../utils/Utils';
import { FunctionUtils, Subscription } from '@dooboostore/core';
import { Router, RouterEventType } from '@dooboostore/core-web';
import { ON_CONNECTED_SWC_APP_METADATA_KEY, findAllLifecycleMetadata } from '../decorators/lifecycles';
import { getSubscribeSwcAppRouteChangeWhileConnectedMetadata } from '../decorators/subscribeSwcAppRouteChangeWhileConnected';
import { getSubscribeSwcAppMessageWhileConnectedMetadata } from '../decorators/subscribeSwcAppMessageWhileConnected';

export function SwcAppMixin<T extends { new (...args: any[]): HTMLElement }>(Base: T) {
  //@ts-ignore
  return class extends Base implements SwcAppInterface {
    __swc_engine = new SwcAppEngine(this as any);
    _swc_connected_instance = new Set<any>();
    _routerSubscription?: Subscription;
    _lastRouterEvent?: RouterEventType;

    /*
      사파리 is 일경우
    <script src="https://unpkg.com/@ungap/custom-elements"></script>
    이걸사용하는데 is 대응하는거다 그런데 이때 처리되는 순서가  크롬이나 표준에서는 부모부터 만들어지고 자식들이 만들어지는데
     저 polyfill에서는 자식부터 만들어지고 부모가 만들어진다 is일때 아 .. 이문제때문에 자식이 _connected_safari 에 강제로 자기자식넣어준다
     */
    _connected_safari = [];
    get simpleApplication() {
      return this.__swc_engine.simpleApplication;
    }
    get router() {
      return this.__swc_engine.router;
    }

    async _invokeRouteChangeSubscribers(instance: any, re: RouterEventType) {
      const routeChangeSubscribers = getSubscribeSwcAppRouteChangeWhileConnectedMetadata(instance);
      if (routeChangeSubscribers && Array.isArray(routeChangeSubscribers)) {
        const ps = routeChangeSubscribers.map(async metadata => {
          const methodName = metadata.propertyKey;
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
          const filterPassed = !filter || filter(this.router!, instance);

          // Invoke method if conditions pass
          if (pathMatched && filterPassed && instance[methodName]) {
            await instance[methodName]({ ...re, pathData: pathData });
          }
        });
        return await Promise.allSettled(ps);
      }
    }

    _connected(instance: any) {
      // console.log('appmixin--> connected', this, instance);
      if (instance) {
        this._swc_connected_instance.add(instance);
        if (this.simpleApplication) {
          this._invokeOnConnectedSwcAppStarted(instance);
          // Notify current route subscribers immediately after connection
          if (this.router && this._lastRouterEvent) {
            this._invokeRouteChangeSubscribers(instance, this._lastRouterEvent);
          }
        }
      }
    }

    _disconnected(instance: any) {
      if (instance) {
        this._swc_connected_instance.delete(instance);
      }
    }

    async _handleRouteChange(route: RouterEventType) {
      // Save last router event
      this._lastRouterEvent = route;
      if (route.triggerPoint === 'end') {
        // Iterate through all connected component instances
        const swcConnectedInstance = Array.from(this._swc_connected_instance);
        const ps = swcConnectedInstance.map((instance: any) => this._invokeRouteChangeSubscribers(instance, route));
        await Promise.allSettled(ps);
      }
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

      // 사파리일떄 예외이다 is 일때 polyfill되는데 이떄 부모부터 만들어지는게 아니라 자식부터 만들어진다 그래서 부모가 만들어질때 자식들이 이미 만들어져있어서 부모가 자식들을 등록해주는 형태로 강제로 등록해준다
      this._connected_safari.forEach((instance: any) => {
        this._swc_connected_instance.add(instance);
      });
      // Invoke @onConnectedSwcApp lifecycle methods on all connected component instances
      // const hostSet = SwcUtils.getHostSet(this as any);
      this._swc_connected_instance.forEach((instance: any) => {
        this._invokeOnConnectedSwcAppStarted(instance);
      });

      // Subscribe to router changes after connect
      if (!this._routerSubscription && this.router) {
        const config = this.__swc_engine.config;
        this._routerSubscription = this.router.observable.subscribe((route: RouterEventType) => {
          //@ts-ignore
          // console.log('Route changed:', route, this._swcId);
          this._handleRouteChange(route).then(it => {
            config?.onRouteChanged?.(route, this);
          });
        });
        // Navigate to initial path if specified
        // if (config?.path) {
        //   this.router.go(config.path);
        // }
      }
    }

    _invokeOnConnectedSwcAppStarted(instance: any) {
      const startedMethods = findAllLifecycleMetadata(instance, ON_CONNECTED_SWC_APP_METADATA_KEY);
      if (startedMethods) {
        for (const m of startedMethods) {
          instance._invokeLifecycleMethod(m);
        }
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
            args: SwcUtils.getHelperAndHostSet(win, this)
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
      await this.router?.go(path);
    }

    back(): void {
      this.router?.back();
    }

    forward(): void {
      this.router?.forward();
    }

    reload(): void {
      this.router?.reload();
    }

    publishMessage(message: SwcAppMessage): void {
      // 메시지를 모든 connected component instances로 분배
      this._swc_connected_instance.forEach((instance: any) => {
        this._invokeMessageSubscribers(instance, message);
      });
    }

    _invokeMessageSubscribers(instance: any, message: SwcAppMessage) {
      const messageSubscribers = getSubscribeSwcAppMessageWhileConnectedMetadata(instance);
      if (messageSubscribers && Array.isArray(messageSubscribers)) {
        messageSubscribers.forEach(metadata => {
          const methodName = metadata.propertyKey;
          const messageType = metadata.messageType;
          const filter = metadata.filter;

          // 메시지 타입 확인
          let typeMatched = false;
          if (!messageType) {
            // messageType이 없으면 모든 메시지 매칭 (와일드카드)
            typeMatched = true;
          } else if (message.type === messageType) {
            typeMatched = true;
          }

          // 필터 적용
          let filterMatched = true;
          if (filter && typeMatched) {
            filterMatched = filter(message, instance);
          }

          // 조건을 만족하면 메서드 호출
          if (typeMatched && filterMatched && typeof instance[methodName] === 'function') {
            instance[methodName](message);
          }
        });
      }
    }
  };
}
