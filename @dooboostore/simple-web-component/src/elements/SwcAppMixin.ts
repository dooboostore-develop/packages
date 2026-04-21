import {SwcAppInterface, SwcAppMessage} from "../types";
import {findAllLifecycleMetadata, getSubscribeSwcAppMessageWhileConnectedMetadata, getSubscribeSwcAppRouteChangeWhileConnectedMetadata, ON_CONNECTED_SWC_APP_METADATA_KEY} from "../decorators";
import {SwcAppEngine, SwcAttributeConfigType, SwcConfigType} from "../SwcAppEngine";
import {debounceTimeIntervalLock, FunctionUtils, Subscription} from "@dooboostore/core";
import {RouterEventType} from "@dooboostore/core-web";
import {SwcUtils} from "../utils/Utils";

export const isSSR = (i: HTMLElement) => {
  return i.hasAttribute('swc-use-ssr');
}
export const setSSRAttribute = (i: HTMLElement) => {
  i.setAttribute('swc-use-ssr', (i as any)._swcId ?? '');
}
export const removeSSRAttribute = (i: HTMLElement) => {
  i.removeAttribute('swc-use-ssr');
}

/**
 * SwcAppMixin: SwcApp 기능을 모든 HTMLElement에 추가할 수 있는 Mixin
 * 
 * 사용 예:
 * @elementDefine('custom-app', { window: w })
 * class CustomApp extends SwcAppMixin(w.HTMLElement) implements SwcAppInterface {
 *   // 추가 기능 구현
 * }
 */
export function SwcAppMixin<T extends { new(...args: any[]): HTMLElement }>(Base: T) {
  return class SwcAppMixinClass extends Base implements SwcAppInterface {
    __swc_engine = new SwcAppEngine(this as any);
    _swc_connected_instance = new Set<any>();
    _routerSubscription?: Subscription;
    _lastRouterEvent?: RouterEventType;
    _routeChangeInvocations = 0;
    _connectedInvocations = 0;

    _childrenRouteChangedInterval: any;
    _childrenConnectedDoneInterval: any;

    /**
     * Safari is 속성 처리
     * Safari polyfill에서는 자식부터 만들어지고 부모가 만들어지므로
     * 부모가 자식들을 강제로 등록해주는 형태로 처리
     */
    _connected_safari_and_standby = [];

    constructor(...args: any[]) {
      super(...args);
      console.log('[SWC-APP-MIXIN] constructor')
    }

    get simpleApplication() {
      return this.__swc_engine.simpleApplication;
    }

    get config() {
      return this.__swc_engine?.config;
    }

    get router() {
      return this.__swc_engine?.router;
    }

    async _invokeRouteChangeSubscribers(instance: HTMLElement, re: RouterEventType) {
      if (instance.isConnected === false) return;

      this._routeChangeInvocations++;

      if (this._childrenRouteChangedInterval) {
        this.config.window.clearInterval(this._childrenRouteChangedInterval);
      }
      const intervalConfig = {setInterval: this.config.window.setInterval.bind(this.config.window), clearInterval: this.config.window.clearInterval.bind(this.config.window)};
      this._childrenRouteChangedInterval = debounceTimeIntervalLock(
        () => this._routeChangeInvocations === 0,
        () => {
          this._childrenRouteChangedInterval = null;
          this.config.onChildrenRouteChanged?.(re, this)
        },
        this.config?.childrenConnectedDoneCheckIntervalTime ?? 30,
        intervalConfig
      );

      try {
        const routeChangeSubscribers = getSubscribeSwcAppRouteChangeWhileConnectedMetadata(instance);
        if (routeChangeSubscribers.length > 0) {
          console.log('[SWC-MIXIN] Route change subscribers found')
          
          // Subscribers are already sorted by order from getSubscribeSwcAppRouteChangeWhileConnectedMetadata
          // Execute subscribers in order, stop if one returns a value
          for (const metadata of routeChangeSubscribers) {
            const methodName = metadata.propertyKey;
            let pathPattern = metadata.options?.path as any;
            const filter = metadata.options?.filter;

            if (typeof pathPattern === 'function') {
              pathPattern = (pathPattern as Function)(instance);
            }

            let pathMatched = false;
            let pathData: any = null;

            if (!pathPattern) {
              pathMatched = true;
              pathData = {};
            } else if (Array.isArray(pathPattern)) {
              for (const pattern of pathPattern) {
                const data = SwcUtils.parsePathPattern(pattern, re.path || '/');
                if (data !== null) {
                  pathMatched = true;
                  pathData = data;
                  break;
                }
              }
            } else {
              pathData = SwcUtils.parsePathPattern(pathPattern, re.path || '/');
              pathMatched = pathData !== null;
            }

            const hostSet = SwcUtils.getHelperAndHostSet(this.config.window, this);
            const filterPassed = !filter || filter(this.router!, {helper:hostSet, currentThis:instance});

            if (pathMatched && filterPassed && instance[methodName]) {
              const result = await instance[methodName]({...re, pathData: pathData});
              // If handler returns a value, stop propagation to next handlers
              if (result !== undefined && result !== null) {
                break;
              }
            }
          }
        }
      } finally {
        if (this.config?.ssr) {
          setSSRAttribute(instance);
        } else {
          removeSSRAttribute(instance);
        }
        this._routeChangeInvocations = Math.max(0, this._routeChangeInvocations - 1);
      }
    }

    async _connected(instance: HTMLElement, option?: { noIncrements: boolean }) {
      if (instance) {
        if (!this.simpleApplication && !this.config) {
          this._connected_safari_and_standby.push(instance);
          return;
        }

        this.config.onConnectedChildBefore?.(instance);
        if (!option?.noIncrements) {
          this._connectedInvocations++;
        }
        this._swc_connected_instance.add(instance);

        const connectedSwcAppCallBacks = findAllLifecycleMetadata(instance, ON_CONNECTED_SWC_APP_METADATA_KEY);
        for (let connectedSwcAppCallBack of connectedSwcAppCallBacks) {
          await (instance as any)?._invokeLifecycleMethod?.(connectedSwcAppCallBack.propertyKey);
        }

        if (this._childrenConnectedDoneInterval) {
          this.config.window.clearInterval(this._childrenConnectedDoneInterval);
        }
        const intervalConfig = {setInterval: this.config.window.setInterval.bind(this.config.window), clearInterval: this.config.window.clearInterval.bind(this.config.window)};
        this._childrenConnectedDoneInterval = debounceTimeIntervalLock(
          () => this._connectedInvocations === 0,
          () => {
            this._childrenConnectedDoneInterval = null;
            this.config.onChildrenConnectedDone?.(this)
          },
          this.config?.childrenConnectedDoneCheckIntervalTime ?? 30,
          intervalConfig
        );

        if (this.simpleApplication) {
          try {
            if (this.router && this._lastRouterEvent) {
              await this._invokeRouteChangeSubscribers(instance, this._lastRouterEvent!);
            }
          } catch (e) {
            throw e;
          }
        }

        if (this.config?.ssr) {
          setSSRAttribute(instance);
        } else {
          removeSSRAttribute(instance);
        }
      }

      this.config.onConnectedChildAfter?.(instance);
      return this;
    }

    async _connectedDone(instance: any) {
      try {
        // 내부 연결 처리 로직
      } finally {
        this._connectedInvocations = Math.max(0, this._connectedInvocations - 1);
      }
    }

    _disconnected(instance: any) {
      if (instance) {
        this._swc_connected_instance.delete(instance);
        this.config?.onDisconnectedChildAfter?.(instance);
      }
    }

    async _handleRouteChange(route: RouterEventType) {
      this._lastRouterEvent = route;
      const swcConnectedInstance = Array.from(this._swc_connected_instance);
      const ps = swcConnectedInstance.map((instance: any) => this._invokeRouteChangeSubscribers(instance, route));
      await Promise.allSettled(ps);
    }

    async connect(config?: SwcAttributeConfigType) {
      console.log('[SWC-MIXIN] connect')
      const swcConfig = {
        routeType: 'element',
        window: config?.window,
        ...config
      } as SwcConfigType;

      await this.__swc_engine.connect(swcConfig);

      // Safari is 속성 처리
      this._connected_safari_and_standby.forEach((instance: any) => {
        this._connected(instance, {noIncrements: true});
      });

      // 라우터 변경 구독
      if (!this._routerSubscription && this.router) {
        const config = this.__swc_engine.config;

        this._routerSubscription = this.router.observable.subscribe(async (route: RouterEventType) => {
          console.log('[SWC-MIXIN] Router event received:', route.triggerPoint);
          if (route.triggerPoint === 'end') {
            await this._handleRouteChange(route);
          }
        });

        if (config?.path) {
          console.log('[DEBUG] Navigating to initial path:', config.path);
        }
      }
    }

    connectedCallback() {
      // 부모 클래스의 connectedCallback 호출
      // @ts-ignore
      super.connectedCallback?.();

      const configStr = this.getAttribute('swc-get-application-config');
      const win = this.ownerDocument?.defaultView || window;
      if (configStr && win) {
        try {
          const userConfig = FunctionUtils.executeReturn({
            script: configStr,
            context: this,
            args: SwcUtils.getHelperAndHostSet(win, this)
          });
          this.connect(userConfig);
        } catch (e) {
          console.error('[SWC-MIXIN] Script execution failed:', e);
        }
      }

      this._connected(this);
      this.__swc_engine?.config?.onConnected?.(this);
      this._connectedDone(this);
    }

    disconnectedCallback() {
      // 부모 클래스의 disconnectedCallback 호출
      // @ts-ignore
      super.disconnectedCallback?.();
      
      this._routerSubscription?.unsubscribe();
      this._routerSubscription = undefined;
      this._lastRouterEvent = undefined;
      this.__swc_engine.disconnect();
      this.__swc_engine?.config?.onDisconnected?.(this);
      this._disconnected(this);
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

          let typeMatched = false;
          if (!messageType) {
            typeMatched = true;
          } else if (message.type === messageType) {
            typeMatched = true;
          }

          let filterMatched = true;
          if (filter && typeMatched) {
            filterMatched = filter(message, instance);
          }

          if (typeMatched && filterMatched && typeof instance[methodName] === 'function') {
            instance[methodName](message);
          }
        });
      }
    }
  };
}
