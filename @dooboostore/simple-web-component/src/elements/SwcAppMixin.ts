import { SwcAppInterface, SwcAppMessage, SwcAppMessageObserveOptions, SwcElement } from '../types';
import { APPLY_NODE_METADATA_KEY, findAllLifecycleMetadata, getSubscribeSwcAppMessageMetadata, getSubscribeSwcAppRouteChangeMetadata, ON_CONNECTED_SWC_APP_METADATA_KEY, SUBSCRIBE_SWC_APP_ROUTE_CHANGE_METADATA_KEY, buildSwcParameterArgs } from '../decorators';
import { SwcAppEngine, SwcAttributeConfigType, SwcConfigType } from '../SwcAppEngine';
import { debounceTimeIntervalLock, FunctionUtils, Subscription, Subject, Observable } from '@dooboostore/core';
import {RouterEventType, ValidUtils} from '@dooboostore/core-web';
import { SwcUtils } from '../utils/Utils';

type RouteSubscriberState = { matched: boolean; signature: string; pathData?: { [k: string]: string }; pathDataAll?: { [k: string]: string[] } };
const routeStateOf = (instance: any): Map<string | symbol, RouteSubscriberState> => (instance.__swc_routeState ??= new Map());

/** 라우트 파라미터 데코레이터 값 (kind 이름 = 데코레이터 이름). 키를 받는 것은 (key) => 값 */
const routeParamValues = (sp: URLSearchParams, pathDataAll: { [k: string]: string[] }) => {
  const queryAll: { [k: string]: string[] } = Object.fromEntries([...new Set(sp.keys())].map(k => [k, sp.getAll(k)]));
  const pick = (all: { [k: string]: string[] }, at: 'first' | 'last') =>
    Object.fromEntries(Object.entries(all).map(([k, v]) => [k, at === 'first' ? v[0] : v[v.length - 1]]));
  const lastOf = (v: string[] | undefined) => (v && v.length ? v[v.length - 1] : undefined);
  const firstQuery = (k: string) => sp.get(k);
  const firstPath = (k: string) => pathDataAll[k]?.[0];
  return {
    swcAppRouteQueryParam: firstQuery,
    swcAppRouteFirstQueryParam: firstQuery,
    swcAppRouteLastQueryParam: (k: string) => lastOf(sp.getAll(k)) ?? null,
    swcAppRouteQueryParams: (k: string) => sp.getAll(k),
    swcAppRouteQueryParamObject: pick(queryAll, 'first'),
    swcAppRouteFirstQueryParamObject: pick(queryAll, 'first'),
    swcAppRouteLastQueryParamObject: pick(queryAll, 'last'),
    swcAppRouteQueryParamsObject: queryAll,
    swcAppRouteURLSearchParams: sp,
    swcAppRoutePathVariable: firstPath,
    swcAppRouteFirstPathVariable: firstPath,
    swcAppRouteLastPathVariable: (k: string) => lastOf(pathDataAll[k]),
    swcAppRoutePathVariables: (k: string) => pathDataAll[k] ?? [],
    swcAppRoutePathVariableObject: pick(pathDataAll, 'first'),
    swcAppRouteFirstPathVariableObject: pick(pathDataAll, 'first'),
    swcAppRouteLastPathVariableObject: pick(pathDataAll, 'last'),
    swcAppRoutePathVariablesObject: pathDataAll
  };
};

/** 구독자의 path(문자열/배열/함수/없음)를 route 에 매칭. 안 맞으면 null */
const matchRoute = (pathOption: any, instance: any, re: { path?: string }): { pathData: { [k: string]: string }; pathDataAll: { [k: string]: string[] } } | null => {
  let pattern = typeof pathOption === 'function' ? pathOption(instance) : pathOption;
  if (!pattern) return { pathData: {}, pathDataAll: {} };
  const path = re.path || '/';
  for (const p of Array.isArray(pattern) ? pattern : [pattern]) {
    const pathData = SwcUtils.parsePathPattern(p, path);
    if (pathData !== null) return { pathData, pathDataAll: SwcUtils.parsePathPatternAll(p, path) ?? {} };
  }
  return null;
};

export const isSSR = (i: HTMLElement) => {
  return i.hasAttribute('swc-use-ssr');
};
export const setSSRAttribute = (i: HTMLElement) => {
  i.setAttribute('swc-use-ssr', (i as any)._swcId ?? '');
};
export const removeSSRAttribute = (i: HTMLElement) => {
  // 표식은 지워도 "서버가 그린 엘리먼트"였다는 건 기억한다 → 첫 라우트(같은 경로)를 다시 그리지 않게 (_invokeRouteChangeSubscribers)
  if (isSSR(i)) (i as any).__swc_ssrRoute ??= true;
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
  abstract class SwcAppMixinClass extends Base implements SwcAppInterface {
    __swc_engine = new SwcAppEngine(this as any);
    _swcId!: string;
    _swc_connected_instance = new Set<any>();
    _routerSubscription?: Subscription;
    _lastRouterEvent?: RouterEventType;
    // replay 옵션으로 발행된 타입별 마지막 메시지 1개 보관
    _replayedMessages = new Map<string, SwcAppMessage[]>();
    // 코드 구독(observeMessage)용 live 스트림. 데코레이터 구독과 같은 publishMessage에서 흘러나옴.
    _messageSubject = new Subject<SwcAppMessage>();
    // ── 호스트 라이프사이클 훅 (abstract): 상속한 클래스가 반드시 구현. @inject 파라미터가 있으면 DI로 자동 해결됨 ──
    // connectedCallback 시점 (DOM에 붙을 때마다). connect() 전이라 DI 컨테이너가 아직 없을 수 있음.
    abstract onConnected(...args: any[]): void | Promise<void>;
    // disconnectedCallback 시점 (DOM에서 떨어질 때마다). onConnected에서 만든 구독 등을 여기서 해제.
    abstract onDisconnected(...args: any[]): void | Promise<void>;
    // connect() 완료 후 (DI 컨테이너·라우터 준비됨). 서비스 호출은 여기서.
    abstract onSwcAppConnected(...args: any[]): void | Promise<void>;
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
    // connect() 전에 붙은 자식들이 기다리는 곳 — connect() 가 엔진을 띄운 뒤 깨운다
    _appReadyWaiters: Array<() => void> = [];

    get simpleApplication() {
      return this.__swc_engine.simpleApplication;
    }

    get config() {
      return this.__swc_engine?.config;
    }

    get router() {
      return this.__swc_engine?.router;
    }

    // phase: 'live'(기본, 전체 방송) | 'connected' | 'connectedDone' (replay, 해당 trigger만)
    async _invokeRouteChangeSubscribers(instance: HTMLElement, re: RouterEventType, phase: 'live' | 'connected' | 'connectedDone' = 'live') {
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
          // Execute subscribers in order, stop if one returns a value.
          // live는 전부 실행, replay는 해당 trigger 구독자만 실행.
          // on(enter/update/leave) 판정을 위해 구독자별 직전 매칭 상태를 기억한다 (멈춘 뒤에도 상태는 계속 갱신).
          const state = routeStateOf(instance);
          // 서버가 이미 이 경로로 그려 보낸 엘리먼트는 같은 경로에 대해 다시 그리지 않는다 (@onConnected 렌더를 건너뛰는 것과 같은 규칙).
          // 연결 때(connected)와 라우터 시작 때(live) 두 번 오므로 경로를 기억해 둘 다 건너뛰고, 다른 경로로 가면 잊는다.
          // 매칭 상태는 아래에서 그대로 기록해 이후 enter/update/leave 판정은 정상으로 돈다.
          const routeSig = JSON.stringify([re.path ?? '', re.search ?? '']);
          if (ValidUtils.isBrowser() && isSSR(instance)) (instance as any).__swc_ssrRoute ??= true;
          if ((instance as any).__swc_ssrRoute === true) (instance as any).__swc_ssrRoute = routeSig;
          const ssrPainted = (instance as any).__swc_ssrRoute === routeSig;
          if (!ssrPainted) delete (instance as any).__swc_ssrRoute;
          let stopped = false;
          for (const metadata of routeChangeSubscribers) {
            if (phase !== 'live' && (metadata.options?.trigger ?? 'connected') !== phase) continue;
            const on = metadata.options?.on ?? 'match';
            if (on === 'beforeLeave') continue; // 라우터 가드로 처리 (_registerLeaveGuards)
            const methodName = metadata.propertyKey;
            const extractValue = (v: any) => {
              const keyToUse = metadata.options?.valueKey ?? SUBSCRIBE_SWC_APP_ROUTE_CHANGE_METADATA_KEY;
              if (v && typeof v === 'object' && keyToUse in v) {
                return v[keyToUse];
              }
              return v;
            };

            const match = matchRoute(metadata.options?.path, instance, re);
            const prev = state.get(methodName);
            // update 판정 기준: 경로 + query (path 변수는 경로에서 나오므로 포함됨. 패턴 없는 bare 구독도 경로 변경을 감지)
            const signature = match ? JSON.stringify([re.path ?? '', re.search ?? '']) : '';
            state.set(methodName, match ? { matched: true, signature, pathData: match.pathData, pathDataAll: match.pathDataAll } : { matched: false, signature: '' });

            const shouldRun =
              on === 'match' ? !!match
              : on === 'enter' ? !!match && !prev?.matched
              : on === 'update' ? !!match && !!prev?.matched && prev.signature !== signature
              : on === 'leave' ? !match && !!prev?.matched
              : false;
            if (stopped || ssrPainted || !shouldRun || !instance[methodName]) continue;

            // leave 는 지금 경로가 안 맞으므로 직전 매칭의 pathData 로 준다
            const pathData = match ? match.pathData : prev?.pathData ?? {};
            const pathDataAll = match ? match.pathDataAll : prev?.pathDataAll ?? {};

            const filter = metadata.options?.filter;
            const instanceHelperHostSet = SwcUtils.getHelperAndHostSet(instance, this.config.window);
            const filterPassed = !filter || (await filter(this.router!, { helper: instanceHelperHostSet, currentThis: instance }));
            if (!filterPassed) continue;

            const before = metadata.options?.before;
            const finaly = metadata.options?.finally;
            // before를 먼저 돌려 리턴값을 @routeChangeBeforeReturn 으로 주입할 수 있게 캡처.
            const beforeReturn = before ? await before(this.router!, { helper: instanceHelperHostSet, currentThis: instance }) : undefined;
            const routeEventValue = { ...re, pathData };
            const args = this._buildRouteArgs(instance, methodName, routeEventValue, pathDataAll, beforeReturn);
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
              stopped = true;
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

    /** 라우트 핸들러 인자: @swcAppRouterEvent / host 계열 / @routeChangeBeforeReturn / 라우트 파라미터(query·path 변수) */
    _buildRouteArgs(instance: any, methodName: string | symbol, routeEventValue: any, pathDataAll: { [k: string]: string[] }, beforeReturn: any) {
      const instanceHelperHostSet = SwcUtils.getHelperAndHostSet(instance, this.config.window);
      const sp: URLSearchParams = routeEventValue.searchParams ?? new URLSearchParams(routeEventValue.search ?? '');
      return buildSwcParameterArgs(
        instance,
        methodName,
        {
          swcAppRouterEvent: routeEventValue,
          swcAppRouter: this.router,
          swcAppSimpleApplication: this.simpleApplication,
          swcAppHost: this,
          hostSet: instanceHelperHostSet,
          helperHostSet: instanceHelperHostSet,
          helperSet: SwcUtils.getHelperSet(this.config.window),
          routeChangeBeforeReturn: beforeReturn,
          ...routeParamValues(sp, pathDataAll)
        },
        [routeEventValue]
      );
    }

    /**
     * on: 'beforeLeave' 구독을 라우터 가드로 등록. 지금 경로는 맞고 다음 경로는 안 맞을 때 핸들러를 부르고,
     * false 를 리턴하면 이동을 취소한다. 요소가 떨어지면 _disconnected 에서 해제.
     */
    _registerLeaveGuards(instance: any) {
      if (!this.router?.addLeaveGuard) return;
      instance.__swc_leaveGuardOffs?.forEach((off: () => void) => off());
      instance.__swc_leaveGuardOffs = getSubscribeSwcAppRouteChangeMetadata(instance)
        .filter(m => m.options?.on === 'beforeLeave')
        .map(metadata =>
          this.router!.addLeaveGuard(async (to, from) => {
            if (instance.isConnected === false || !instance[metadata.propertyKey]) return true;
            const fromMatch = matchRoute(metadata.options?.path, instance, from);
            if (!fromMatch || matchRoute(metadata.options?.path, instance, to)) return true; // 이 라우트를 떠나는 경우만
            const filter = metadata.options?.filter;
            const helper = SwcUtils.getHelperAndHostSet(instance, this.config.window);
            if (filter && !(await filter(this.router!, { helper, currentThis: instance }))) return true;
            const beforeReturn = metadata.options?.before ? await metadata.options.before(this.router!, { helper, currentThis: instance }) : undefined;
            const routeEventValue = { ...from, pathData: fromMatch.pathData, to };
            const args = this._buildRouteArgs(instance, metadata.propertyKey, routeEventValue, fromMatch.pathDataAll, beforeReturn);
            let result: any, error: any;
            try {
              result = await instance[metadata.propertyKey](...args);
            } catch (e) {
              error = e;
            } finally {
              if (metadata.options?.finally) await metadata.options.finally(this.router!, { helper, currentThis: instance }, { args, result, error });
            }
            if (error) throw error;
            return result !== false;
          })
        );
    }

    async _connected(instance: HTMLElement, option?: { noIncrements: boolean }) {
      if (instance) {
        if (!this.simpleApplication && !this.config) {
          // 자기 자신은 connect() 가 나중에 재생한다
          if (instance === (this as any)) {
            this._connected_safari_and_standby.push(instance);
            return;
          }
          // 앱이 아직 connect 전: 준비될 때까지 기다린다. 안 기다리면 이미 정의된 자식이 DI·라우터 없이
          // 라이프사이클(@inject 등)을 먼저 돌려 undefined 를 받는다 (elementDefine 이 이 await 뒤에 렌더한다).
          await new Promise<void>(resolve => this._appReadyWaiters.push(resolve));
        }

        this.config.onConnectedChildBefore?.(instance);
        if (!option?.noIncrements) {
          this._connectedInvocations++;
        }
        this._swc_connected_instance.add(instance);
        // await 사이에 요소가 떨어지거나 다시 붙으면(elementDefine 의 차례 번호가 바뀌면) 나머지(가드 등록·재생)는 건너뛴다
        const gen = (instance as any).__swc_connectGen;
        const stale = () => (instance as any).__swc_connectGen !== gen;

        const connectedSwcAppCallBacks = findAllLifecycleMetadata(instance, ON_CONNECTED_SWC_APP_METADATA_KEY);
        for (let connectedSwcAppCallBack of connectedSwcAppCallBacks) {
          await (instance as any)?._invokeLifecycleMethod?.(connectedSwcAppCallBack.propertyKey);
          if (stale()) return this;
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
              await this._invokeRouteChangeSubscribers(instance, this._lastRouterEvent!, 'connected');
            }
          } catch (e) {
            throw e;
          }
        }
        if (stale()) return this;

        if (this.simpleApplication) this._registerLeaveGuards(instance);

        // replay 버퍼가 있으면 신규 인스턴스에만 재생 (fire-and-forget, 연결 블로킹 안 함)
        this._replayMessagesTo(instance);

        const isBrowser = ValidUtils.isBrowser();
        if (!isBrowser && this.config?.ssr) {
          setSSRAttribute(instance);
        } else {
          removeSSRAttribute(instance);
        }
      }

      this.config.onConnectedChildAfter?.(instance);
      return this;
    }

    async _connectedDone(instance: any, option?: { aborted?: boolean }) {
      try {
        if (option?.aborted) return; // 중간에 멈춘 연결: 재생 없이 연결 수만 맞춘다
        // trigger 'connectedDone' 구독에만 버퍼 재생 (render 완료 후라 DOM 타겟 안전)
        this._replayMessagesTo(instance, 'connectedDone');
        if (this.simpleApplication) {
          try {
            if (this.router && this._lastRouterEvent) {
              await this._invokeRouteChangeSubscribers(instance, this._lastRouterEvent!, 'connectedDone');
            }
          } catch (e) {
            throw e;
          }
        }
      } finally {
        this._connectedInvocations = Math.max(0, this._connectedInvocations - 1);
      }
    }

    _disconnected(instance: any) {
      if (instance) {
        this._swc_connected_instance.delete(instance);
        // beforeLeave 가드 해제 + on 판정 상태 초기화 (다시 붙으면 enter 부터)
        instance.__swc_leaveGuardOffs?.forEach((off: () => void) => off());
        instance.__swc_leaveGuardOffs = undefined;
        instance.__swc_routeState = undefined;
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
      const swcConfig = {
        routeType: 'element',
        window: config?.window,
        ...config
      } as SwcConfigType;

      await this.__swc_engine.connect(swcConfig);
      this._appReadyWaiters.splice(0).forEach(resolve => resolve());

      // Safari is 속성 처리
      this._connected_safari_and_standby.forEach((instance: any) => {
        this._connected(instance, { noIncrements: true });
      });

      // 라우터 변경 구독
      if (!this._routerSubscription && this.router) {
        this._routerSubscription = this.router.observable.subscribe(async (route: RouterEventType) => {
          if (route.triggerPoint === 'end') {
            await this._handleRouteChange(route);
          }
        });
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
            args: SwcUtils.getHelperAndHostSet(this, win)
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

    publishMessage(message: SwcAppMessage): void {      // 버퍼 먼저 (핸들러가 동기 재발행해도 순서 보장)
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

    connectedElements(): Array<HTMLElement & SwcElement> {
      return Array.from(this._swc_connected_instance);
    }

    /**
     * 데코레이터 없이 코드로 메시지를 구독한다 (RxJS 스타일). 서비스·동적 구독 등 데코레이터를 못 붙이는 곳용.
     *   host.observeMessage<Me>(AUTH_CHANGED).subscribe(msg => ...)  →  Subscription (unsubscribe 필수)
     * type 생략 시 전 타입 live. subject 옵션은 @subscribeSwcAppMessage 와 같은 규칙(type 지정 시에만 재생):
     *   'behavior' = 버퍼 마지막 1개 먼저 / 'replay' = 버퍼 전체 시간순 먼저 / 미지정·'subject' = live만.
     * 호출 형태:
     *   observeMessage()                                  전 타입 live
     *   observeMessage('auth')                            auth live
     *   observeMessage('auth', { subject: 'behavior' })   auth 마지막 1개 + live
     *   observeMessage({ type: 'auth', subject: 'replay' })  옵션 객체 하나로
     */
    observeMessage<T = any>(): Observable<SwcAppMessage<T>>;
    observeMessage<T = any>(type: string): Observable<SwcAppMessage<T>>;
    observeMessage<T = any>(type: string, options: Omit<SwcAppMessageObserveOptions, 'type'>): Observable<SwcAppMessage<T>>;
    observeMessage<T = any>(options: SwcAppMessageObserveOptions): Observable<SwcAppMessage<T>>;
    observeMessage<T = any>(typeOrOptions?: string | SwcAppMessageObserveOptions, options?: Omit<SwcAppMessageObserveOptions, 'type'>): Observable<SwcAppMessage<T>> {
      const { type, subject } = typeof typeOrOptions === 'string' ? { ...options, type: typeOrOptions } : { ...typeOrOptions };
      return new Observable<SwcAppMessage<T>>(subscriber => {
        if (type && (subject === 'behavior' || subject === 'replay')) {
          const buf = this._replayedMessages.get(type) ?? [];
          (subject === 'behavior' ? buf.slice(-1) : buf).forEach(m => subscriber.next(m as SwcAppMessage<T>));
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
    // - trigger 'connectedDone'인 구독은 _connectedDone(render 완료 후)에서 재생. phase로 구분.
    // 이미 연결된 인스턴스는 publishMessage 때 live로 받으므로 여기 오지 않음.
    _replayMessagesTo(instance: any, phase: 'connected' | 'connectedDone' = 'connected') {
      const subs = getSubscribeSwcAppMessageMetadata(instance);
      if (!subs || !Array.isArray(subs)) return;
      const seen = new Set<string>();
      subs.forEach(meta => {
        const type = meta.messageType as string | undefined;
        if (!type || seen.has(type)) return;
        seen.add(type);
        if ((meta.trigger ?? 'connected') !== phase) return;
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

      const instanceHelperHostSet = SwcUtils.getHelperAndHostSet(instance, this.config.window);
      const instanceHelperSet = SwcUtils.getHelperSet(this.config.window);
      // before를 먼저 돌려 리턴값을 @appMessageBeforeReturn 으로 주입할 수 있게 캡처.
      const beforeReturn = before ? await before(message, instance) : undefined;
      const args = buildSwcParameterArgs(
        instance,
        methodName,
        {
          appMessage: message,
          swcAppRouter: this.router,
          swcAppSimpleApplication: this.simpleApplication,
          swcAppHost: this,
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
