import {SwcAppInterface, SwcAppMessage} from "../types";
import {elementDefine, findAllLifecycleMetadata, getSubscribeSwcAppMessageWhileConnectedMetadata, getSubscribeSwcAppRouteChangeWhileConnectedMetadata, ON_CONNECTED_SWC_APP_METADATA_KEY} from "../decorators";
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


export const tagName = 'swc-app';
export default async (w: Window) => {
  const existing = w.customElements.get(tagName);
  if (existing) return existing;

  @elementDefine(tagName, {window: w})
  class SwcApp extends w.HTMLElement implements SwcAppInterface {
    __swc_engine = new SwcAppEngine(this as any);
    _swc_connected_instance = new Set<any>();
    // _swc_notified_routes = new WeakMap<any, RouterEventType>();
    _routerSubscription?: Subscription;
    _lastRouterEvent?: RouterEventType;
    _routeChangeInvocations = 0;
    _connectedInvocations = 0;

    _childrenRouteChangedInterval: any;
    _childrenConnectedDoneInterval: any;

    /*
      사파리 is 일경우
    <script src="https://unpkg.com/@ungap/custom-elements"></script>
    이걸사용하는데 is 대응하는거다 그런데 이때 처리되는 순서가  크롬이나 표준에서는 부모부터 만들어지고 자식들이 만들어지는데
     저 polyfill에서는 자식부터 만들어지고 부모가 만들어진다 is일때 아 .. 이문제때문에 자식이 _connected_safari 에 강제로 자기자식넣어준다
     */
    _connected_safari_and_standby = [];

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
        // {setInterval: window.setInterval, clearInterval: window.clearInterval}
      );


      // debounceTimeIntervalLock({
      //   unlockChecker: () => this._routeChangeInvocations === 0,
      //   unlocked: () => this.config.onChildrenRouteChanged(re, this)
      // }, {
      //   intervalId: this._childrenRouteChangedInterval,
      //   setIntervalId: (id) => this._childrenRouteChangedInterval = id,
      //   intervalTime: this.config?.childrenRouteChangedCheckIntervalTime ?? 30
      // }, {
      //   setInterval: window.setInterval,
      //   clearInterval: window.clearInterval
      // });

      try {
        // if (this._swc_notified_routes.get(instance) === re) {
        //   return;
        // }
        // this._swc_notified_routes.set(instance, re);

        const routeChangeSubscribers = getSubscribeSwcAppRouteChangeWhileConnectedMetadata(instance);
        if (routeChangeSubscribers && Array.isArray(routeChangeSubscribers)) {
          const ps = routeChangeSubscribers.map(async metadata => {
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

            const hostSet = SwcUtils.getHelperAndHostSet(w, this);
            const filterPassed = !filter || filter(this.router!, {helper:hostSet, currentThis:instance});

            if (pathMatched && filterPassed && instance[methodName]) {
              await instance[methodName]({...re, pathData: pathData});
            }
          });
          await Promise.allSettled(ps);
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
        // console.log('_connected-->', instance.tagName, this._connectedInvocations)

        if (!this.simpleApplication && !this.config) {
          this._connected_safari_and_standby.push(instance);
          return;
        }

        this.config.onConnectedChildBefore?.(instance);
        if (!option?.noIncrements) {
          this._connectedInvocations++;
        }
        this._swc_connected_instance.add(instance);

        const connectedSwcAppCallBacks = findAllLifecycleMetadata(instance, ON_CONNECTED_SWC_APP_METADATA_KEY) ?? [];
        for (let connectedSwcAppCallBack of connectedSwcAppCallBacks) {
          await (instance as any)?._invokeLifecycleMethod?.(connectedSwcAppCallBack);
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

        // console.log('onChildConnectedDone-->')

        if (this.simpleApplication) {
          try {
            // await this._invokeOnConnectedSwcAppStarted(instance);

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
        // 내부 연결 처리 로직이 있다면 여기에 추가
        // console.log('_connectedDone-->', instance, this._connectedInvocations)
      } finally {
        this._connectedInvocations = Math.max(0, this._connectedInvocations - 1);
      }
    }

    _disconnected(instance: any) {
      // console.log('_disconnected', instance);
      if (instance) {
        this._swc_connected_instance.delete(instance);
        this.config?.onDisconnectedChildAfter?.(instance);
        // this._swc_notified_routes.delete(instance);
      }
    }

    async _handleRouteChange(route: RouterEventType) {
      // Save last router event
      this._lastRouterEvent = route;
      // if (route.triggerPoint === 'end') {
      // Iterate through all connected component instances
      const swcConnectedInstance = Array.from(this._swc_connected_instance);
      // console.log('routing handle-->', swcConnectedInstance)
      const ps = swcConnectedInstance.map((instance: any) => this._invokeRouteChangeSubscribers(instance, route));
      await Promise.allSettled(ps);
      // }
    }

    async connect(config?: SwcAttributeConfigType) {
      console.log('[SWC] connect')
      const swcConfig = {
        routeType: 'element',
        window: config?.window,
        ...config
      } as SwcConfigType;

      const mode = config?.connectMode || 'direct';

      if (mode === 'direct') {
        this.setAttribute('swc-connect-mode', mode);
        await this.__swc_engine.connect(swcConfig);
      } else if (mode === 'swap' || mode === 'clear-swap') {
        if (!this.parentNode) {
          // 부모가 없으면 swap을 할 수 없으므로 direct로 폴백합니다.
          await this.__swc_engine.connect(swcConfig);
          this.setAttribute('swc-connect-mode', 'direct');
        } else {
          // 1. 현재 SSR 상태(화면)를 그대로 유지한 채로, 백그라운드용 클론을 만듭니다.
          const clonedApp = this.cloneNode(mode === 'swap') as any; // clear-swap 모드면 자식 노드를 클론하지 않음(false)
          clonedApp.style.display = 'none';

          // 2. DOM에 클론을 몰래 붙입니다.
          this.parentNode.insertBefore(clonedApp, this.nextSibling);

          try {
            // 3. 클론을 direct 모드로 연결(초기화/렌더링) 시킵니다.
            await clonedApp.connect({...(config || {}), connectMode: 'direct'});

            // 4. 클론의 렌더링이 완전히 끝나면, 기존 SSR 화면(this)을 지우고 클론을 보여줍니다.
            if (this.parentNode) {
              this.parentNode.removeChild(this);
            }
            clonedApp.style.display = '';
            clonedApp.setAttribute('swc-connect-mode', mode);

            // ★ 매우 중요: 교체가 완료되었으므로 기존 앱(this)은 여기서 즉시 종료하여 불필요한 라우터/이벤트 구독을 막아야 합니다!
            return;
          } catch (e) {
            // 실패 시 클론을 지우고 원본을 direct로 강제 연결합니다.
            if (clonedApp.parentNode) {
              clonedApp.parentNode.removeChild(clonedApp);
            }
            await this.__swc_engine.connect(swcConfig);
            this.setAttribute('swc-connect-mode', 'direct');
          }
        }
      }

      // 사파리일떄 예외이다 is 일때 polyfill되는데 이떄 부모부터 만들어지는게 아니라 자식부터 만들어진다 그래서 부모가 만들어질때 자식들이 이미 만들어져있어서 부모가 자식들을 등록해주는 형태로 강제로 등록해준다
      this._connected_safari_and_standby.forEach((instance: any) => {
        // console.log('safari!!!!!!!!!!', instance)
        this._connected(instance, {noIncrements: true});
        // this._swc_connected_instance.add(instance);
      });
      // Invoke @onConnectedSwcApp lifecycle methods on all connected component instances
      // const hostSet = SwcUtils.getHostSet(this as any);

      // const scis = Array.from(this._swc_connected_instance);
      // await Promise.allSettled(scis.map(instance => this._invokeOnConnectedSwcAppStarted(instance)));

      // this._swc_connected_instance.forEach((instance: any) => {
      //   this._invokeOnConnectedSwcAppStarted(instance);
      // });

      // Subscribe to router changes after connect
      if (!this._routerSubscription && this.router) {
        const config = this.__swc_engine.config;

        this._routerSubscription = this.router.observable.subscribe(async (route: RouterEventType) => {
          console.log('[SWC] Router event received:', route.triggerPoint);
          if (route.triggerPoint === 'end') {
            // 1. 모든 기존 연결된 자식들에게 라우트 이벤트 알림
            await this._handleRouteChange(route);
          }
        });

        // Navigate to initial path if specified
        if (config?.path) {
          console.log('[DEBUG] Navigating to initial path:', config.path);
          // this.router.go(config.path);
        }
      }
    }

    // async _invokeOnConnectedSwcAppStarted(instance: any) {
    //   this._swcAppStartedInvocations++;
    //   try {
    //     // 이미 시작된 인스턴스라면 스킵 (비동기 병렬 중복 호출 방지)
    //     if (this._swc_started_instances.has(instance)) return;
    //     this._swc_started_instances.add(instance);
    //
    //     const startedMethods = findAllLifecycleMetadata(instance, ON_CONNECTED_SWC_APP_METADATA_KEY);
    //     if (startedMethods) {
    //       const ps = startedMethods.map(m => instance._invokeLifecycleMethod(m));
    //       await Promise.allSettled(ps);
    //     }
    //   } finally {
    //     this._swcAppStartedInvocations--;
    //   }
    // }

    connectedCallback() {
      // this.innerHTML='';
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

      // 자기자신은 apphost로 포함이 도지않으니(부모)  내자신은 self로 넣는다
      this._connected(this);
      this.__swc_engine?.config?.onConnected?.(this);
      this._connectedDone(this);
    }

    disconnectedCallback() {
      // @ts-ignore
      if (super.disconnectedCallback) super.disconnectedCallback();
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

    // async completedSwcApp() {
    //   const ss = Array.from(this._swc_connected_instance).flatMap((it) => {
    //     const ms = findAllLifecycleMetadata(it, ON_CONNECTED_COMPLETED_SWC_APP_METADATA_KEY) ?? [];
    //     return ms.map((sit) => it[sit](this));
    //   });
    //   await Promise.allSettled(ss);
    // }

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
  }

  return w.customElements.whenDefined(tagName);
}