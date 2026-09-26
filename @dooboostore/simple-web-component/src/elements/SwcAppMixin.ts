import { SwcAppInterface, SwcAppMessage } from '../types';
import { APPLY_NODE_METADATA_KEY, findAllLifecycleMetadata, getSubscribeSwcAppMessageMetadata, getSubscribeSwcAppRouteChangeMetadata, ON_CONNECTED_SWC_APP_METADATA_KEY, SUBSCRIBE_SWC_APP_ROUTE_CHANGE_METADATA_KEY, buildSwcParameterArgs } from '../decorators';
import { SwcAppEngine, SwcAttributeConfigType, SwcConfigType } from '../SwcAppEngine';
import { debounceTimeIntervalLock, FunctionUtils, Subscription, Subject, Observable } from '@dooboostore/core';
import {RouterEventType, ValidUtils} from '@dooboostore/core-web';
import { SwcUtils } from '../utils/Utils';

export const isSSR = (i: HTMLElement) => {
  return i.hasAttribute('swc-use-ssr');
};
export const setSSRAttribute = (i: HTMLElement) => {
  i.setAttribute('swc-use-ssr', (i as any)._swcId ?? '');
};
export const removeSSRAttribute = (i: HTMLElement) => {
  i.removeAttribute('swc-use-ssr');
};

/**
 * SwcAppMixin: SwcApp 기능을 모든 HTMLElement에 추가할 수 있는 Mixin
 *
 * 사용 예:
 * @elementDefine('custom-app', { window: w })
 * class CustomApp extends SwcAppMixin(w.HTMLElement) implements SwcAppInterface {
 *   // 추가 기능 구현
 * }
 */
export function SwcAppMixin<T extends { new (...args: any[]): HTMLElement }>(Base: T) {
  class SwcAppMixinClass extends Base implements SwcAppInterface {
    __swc_engine = new SwcAppEngine(this as any);
    _swc_connected_instance = new Set<any>();
    _routerSubscription?: Subscription;
    _lastRouterEvent?: RouterEventType;
    // replay 옵션으로 발행된 타입별 마지막 메시지 1개 보관
    _replayedMessages = new Map<string, SwcAppMessage[]>();
    // 코드 구독(observeMessage)용 live 스트림. 데코레이터 구독과 같은 publishMessage에서 흘러나옴.
    _messageSubject = new Subject<SwcAppMessage>();
    // ── 호스트 라이프사이클 훅: 필요하면 override. 기본은 no-op. @inject 파라미터가 있으면 DI로 자동 해결됨 ──
    // connectedCallback 시점 (DOM에 붙을 때마다). connect() 전이라 DI 컨테이너가 아직 없을 수 있음.
    onConnected(...args: any[]): void | Promise<void> {}
    // disconnectedCallback 시점 (DOM에서 떨어질 때마다). onConnected에서 만든 구독 등을 여기서 해제.
    onDisconnected(...args: any[]): void | Promise<void> {}
    // connect() 완료 후 (DI 컨테이너·라우터 준비됨). 서비스 호출은 여기서.
    onSwcAppConnected(...args: any[]): void | Promise<void> {}
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
      console.log('[SWC-APP-MIXIN] constructor');
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
      const intervalConfig = { setInterval: this.config.window.setInterval.bind(this.config.window), clearInterval: this.config.window.clearInterval.bind(this.config.window) };
      this._childrenRouteChangedInterval = debounceTimeIntervalLock(
        () => this._routeChangeInvocations === 0,
        () => {
          this._childrenRouteChangedInterval = null;
          this.config.onChildrenRouteChanged?.(re, this);
        },
        this.config?.childrenConnectedDoneCheckIntervalTime ?? 30,
        intervalConfig
      );

      try {
        const routeChangeSubscribers = getSubscribeSwcAppRouteChangeMetadata(instance);

        if (routeChangeSubscribers.length > 0) {
          // Subscribers are already sorted by order from getSubscribeSwcAppRouteChangeMetadata
          // Execute subscribers in order, stop if one returns a value
          for (const metadata of routeChangeSubscribers) {
            const methodName = metadata.propertyKey;
            let pathPattern = metadata.options?.path as any;
            const filter = metadata.options?.filter;
            const extractValue = (v: any) => {
              const keyToUse = metadata.options?.valueKey ?? SUBSCRIBE_SWC_APP_ROUTE_CHANGE_METADATA_KEY;
              if (v && typeof v === 'object' && keyToUse in v) {
                return v[keyToUse];
              }
              return v;
            };

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
            const filterPassed = !filter || (await filter(this.router!, { helper: hostSet, currentThis: instance }));

            if (pathMatched && filterPassed && instance[methodName]) {
              const routeEventValue = { ...re, pathData: pathData };
              const instanceHelperHostSet = SwcUtils.getHelperAndHostSet(this.config.window, instance);
              const instanceHelperSet = SwcUtils.getHelperSet(this.config.window);
              const before = metadata.options?.before;
              const finaly = metadata.options?.finally;
              // before를 먼저 돌려 리턴값을 @routeChangeBeforeReturn 으로 주입할 수 있게 캡처.
              const beforeReturn = before ? await before(this.router!, { helper: instanceHelperHostSet, currentThis: instance }) : undefined;
              const args = buildSwcParameterArgs(
                instance,
                methodName,
                {
                  routerEvent: routeEventValue,
                  hostSet: instanceHelperHostSet,
                  helperHostSet: instanceHelperHostSet,
                  helperSet: instanceHelperSet,
                  routeChangeBeforeReturn: beforeReturn
                },
                [routeEventValue]
              );
              let rawResult: any, error: any;
              try {
                rawResult = await instance[methodName](...args);
              } catch (e) {
                error = e;
              } finally {
                if (finaly) await finaly(this.router!, { helper: instanceHelperHostSet, currentThis: instance }, { args, result: rawResult, error });
              }
              if (error) throw error;
              const result = extractValue(rawResult);
              // If handler returns a value, stop propagation to next handlers
              if (result !== undefined && result !== null) {
                break;
              }
            }
          }
        }
      } finally {
        // this.config?.window
        const isBrowser = ValidUtils.isBrowser();
        if (!isBrowser && this.config?.ssr) {
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
        const intervalConfig = { setInterval: this.config.window.setInterval.bind(this.config.window), clearInterval: this.config.window.clearInterval.bind(this.config.window) };
        this._childrenConnectedDoneInterval = debounceTimeIntervalLock(
          () => this._connectedInvocations === 0,
          () => {
            this._childrenConnectedDoneInterval = null;
            this.config.onChildrenConnectedDone?.(this);
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

        // replay 버퍼가 있으면 신규 인스턴스에만 재생 (fire-and-forget, 연결 블로킹 안 함)
        this._replayMessagesTo(instance);

        const isBrowser = ValidUtils.isBrowser();
        console.log('------>', isBrowser, this.config?.ssr);
        if (!isBrowser && this.config?.ssr) {
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
      console.log('[SWC-MIXIN] connect');
      const swcConfig = {
        routeType: 'element',
        window: config?.window,
        ...config
      } as SwcConfigType;

      await this.__swc_engine.connect(swcConfig);

      // Safari is 속성 처리
      this._connected_safari_and_standby.forEach((instance: any) => {
        this._connected(instance, { noIncrements: true });
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

      // onSwcAppConnected 훅 (@inject 파라미터 있으면 DI 해결 — _invokeLifecycleMethod 경로)
      await this._invokeHook('onSwcAppConnected');
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
          if (userConfig instanceof Promise) {
            userConfig
              .then(resolvedConfig => {
                this.connect(resolvedConfig);
              })
              .catch(e => {
                console.error('[SWC-MIXIN] Script execution failed:', e);
              });
          } else {
            this.connect(userConfig);
          }
        } catch (e) {
          console.error('[SWC-MIXIN] Script execution failed:', e);
        }
      }

      this._connected(this);
      this.__swc_engine?.config?.onConnected?.(this);
      this._connectedDone(this);
      void this._invokeHook('onConnected').catch(e => console.error('[SWC-MIXIN] onConnected error:', e));
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
      void this._invokeHook('onDisconnected').catch(e => console.error('[SWC-MIXIN] onDisconnected error:', e));
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
      // 버퍼 먼저 (핸들러가 동기 재발행해도 순서 보장)
      // 전 타입 과거 메시지 보관 (늦게 연결될 인스턴스에 재생). 개수는 앱 설정 1곳.
      if (message.type) {
        const buf = [...(this._replayedMessages.get(message.type) ?? []), message];
        this._replayedMessages.set(message.type, buf.slice(-Math.max(1, this.config?.messageReplayBufferSize ?? 10)));
      }
      this._swc_connected_instance.forEach((instance: any) => {
        this._invokeMessageSubscribers(instance, message);
      });
      this._messageSubject.next(message);
    }

    /**
     * 데코레이터 없이 코드로 메시지를 구독한다 (RxJS 스타일). 서비스·동적 구독 등 데코레이터를 못 붙이는 곳용.
     *   host.observeMessage<Me>(AUTH_CHANGED).subscribe(msg => ...)  →  Subscription (unsubscribe 필수)
     * type 생략 시 전 타입 live. subject 옵션은 @subscribeSwcAppMessage 와 같은 규칙(type 지정 시에만 재생):
     *   'behavior' = 버퍼 마지막 1개 먼저 / 'replay' = 버퍼 전체 시간순 먼저 / 미지정·'subject' = live만.
     */
    observeMessage<T = any>(type?: string, options?: { subject?: 'subject' | 'behavior' | 'replay' }): Observable<SwcAppMessage<T>> {
      return new Observable<SwcAppMessage<T>>(subscriber => {
        if (type && (options?.subject === 'behavior' || options?.subject === 'replay')) {
          const buf = this._replayedMessages.get(type) ?? [];
          (options.subject === 'behavior' ? buf.slice(-1) : buf).forEach(m => subscriber.next(m as SwcAppMessage<T>));
        }
        const sub = this._messageSubject.subscribe(m => {
          if (!type || m.type === type) subscriber.next(m as SwcAppMessage<T>);
        });
        return () => sub.unsubscribe();
      });
    }

    // hook 실행 + @inject 파라미터 DI 해결 (host 본체 포함.
    // _invokeLifecycleMethod는 host/hostSet 상황 분기가 달라 호스트 본체에서 주입이 안 됨)
    async _invokeHook(methodName: string | symbol) {
      const fn = (this as any)[methodName];
      if (typeof fn !== 'function') return;
      const manager = (this as any).simpleApplication?.simstanceManager;
      if (!manager) {
        return fn.call(this);
      }
      return manager.executeBindParameterSimPromise({ target: this, targetKey: methodName });
    }

    // 신규 연결 인스턴스 1곳에만 버퍼 재생. 구독자별 subject 선언 기준:
    // - 'behavior': 마지막 1개 / 'replay': 버퍼 전체 시간순 / 미지정·'subject': live만 (재생 안 함)
    // 이미 연결된 인스턴스는 publishMessage 때 live로 받으므로 여기 오지 않음.
    _replayMessagesTo(instance: any) {
      const subs = getSubscribeSwcAppMessageMetadata(instance);
      if (!subs || !Array.isArray(subs)) return;
      const seen = new Set<string>();
      subs.forEach(meta => {
        const type = meta.messageType as string | undefined;
        if (!type || seen.has(type)) return;
        seen.add(type);
        const buf = this._replayedMessages.get(type) ?? [];
        if (meta.subject === 'behavior') {
          const last = buf[buf.length - 1];
          if (last) this._invokeMessageSubscribers(instance, last);
        } else if (meta.subject === 'replay') {
          buf.forEach(msg => this._invokeMessageSubscribers(instance, msg));
        }
      });
    }

    _invokeMessageSubscribers(instance: any, message: SwcAppMessage) {
      const messageSubscribers = getSubscribeSwcAppMessageMetadata(instance);
      if (messageSubscribers && Array.isArray(messageSubscribers)) {
        // 메시지 구독은 fire-and-forget — async filter/before/finally를 위해 구독자마다 비동기 러너로 돌리되
        // 호출측(publishMessage)은 논블로킹 유지. 미처리 rejection은 로깅만.
        messageSubscribers.forEach(metadata => {
          void this._runMessageSubscriber(instance, message, metadata).catch(e => console.error('[SWC] subscribeSwcAppMessage error:', e));
        });
      }
    }

    async _runMessageSubscriber(instance: any, message: SwcAppMessage, metadata: any) {
      const methodName = metadata.propertyKey;
      const messageType = metadata.messageType;
      const { filter, before, finally: finaly } = metadata;

      const typeMatched = !messageType || message.type === messageType;
      if (!typeMatched) return;
      if (filter && !(await filter(message, instance))) return;
      if (typeof instance[methodName] !== 'function') return;

      const instanceHelperHostSet = SwcUtils.getHelperAndHostSet(this.config.window, instance);
      const instanceHelperSet = SwcUtils.getHelperSet(this.config.window);
      // before를 먼저 돌려 리턴값을 @appMessageBeforeReturn 으로 주입할 수 있게 캡처.
      const beforeReturn = before ? await before(message, instance) : undefined;
      const args = buildSwcParameterArgs(
        instance,
        methodName,
        {
          appMessage: message,
          hostSet: instanceHelperHostSet,
          helperHostSet: instanceHelperHostSet,
          helperSet: instanceHelperSet,
          appMessageBeforeReturn: beforeReturn
        },
        [message]
      );

      let result: any, error: any;
      try {
        result = await instance[methodName](...args);
      } catch (e) {
        error = e;
      } finally {
        if (finaly) await finaly(message, instance, { args, result, error });
      }
      if (error) throw error;
    }
  }

  return SwcAppMixinClass;
}
