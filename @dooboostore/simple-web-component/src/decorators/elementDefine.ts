import {ActionExpression, FunctionUtils, ReflectUtils} from '@dooboostore/core';
import {EventListenerLifeCycler} from './addEventListener';
import {MutationObserverLifeCycler} from './mutationObserver';
import {ResizeObserverLifeCycler} from './resizeObserver';
import {IntersectionObserverLifeCycler} from './intersectionObserver';
import {findAllLifecycleMetadata, findAllOnConnectedAfterMetadata, findAllOnConnectedBeforeMetadata, findAllOnConnectedMetadata, ON_AFTER_ADOPTED_METADATA_KEY, ON_AFTER_DISCONNECTED_METADATA_KEY, ON_BEFORE_ADOPTED_METADATA_KEY, ON_BEFORE_DISCONNECTED_METADATA_KEY, ON_CONNECTED_COMPLETED_METADATA_KEY, ON_INITIALIZE_METADATA_KEY} from './lifecycles';
import {EmitCustomEventLifeCycler} from './emitCustomEvent';
import {ChangedAttributeLifeCycler} from './changedAttribute';
import {findAllAttributeApplyMetadata, findAllAttributeMetadata} from './applyAttribute';
import {getQueryMetadata, getQueryAllMetadata} from './query';
import {SwcUtils} from '../utils/Utils';
import {DOM_EVENT_NAMES, HTML_TAG_ENTRIES} from '../config/config';
import {SituationTypeContainer, SituationTypeContainers} from '@dooboostore/simple-boot/decorators/inject/Inject';
import {ElementDefineLifeCycler, HelperHostSet, HostSet, InjectSituationType, IntersectionObserverSet, MutationObserverSet, OnConnectedResult, ResizeObserverSet, ResizeObserverSetEntry, SwcRootType} from '../types';
import {ConvertUtils, ElementApply} from '@dooboostore/core-web';
import {isSSR} from "../elements/SwcAppMixin";
import {findAllStateMetadata} from "./state";
import {findAllPropertyMetadata} from "./applyProperty";
import {MessageSubscribeLifeCycler} from "./subscribeSwcAppMessageWhileConnected";
import {RouteSubscribeLifeCycler} from "./subscribeSwcAppRouteChangeWhileConnected";

// --- Core Interfaces & Types ---

export const ELEMENT_CONFIG_KEY = Symbol.for('simple-web-component:element-config');

export interface ElementConfig {
  extends?: string;
  observedAttributes?: string[];
  customElementRegistry?: any;
  window?: Window;
  useShadow?: boolean | 'open' | 'closed';
}

export interface ElementMetadata extends Omit<ElementConfig, 'window'> {
  name: string;
  window: Window;
}

export const getElementConfig = (target: any): ElementMetadata | undefined => {
  const constructor = target instanceof Function ? target : target.constructor;
  return ReflectUtils.getMetadata(ELEMENT_CONFIG_KEY, constructor);
};

export const ensureInit = (inst: any) => { // HTMLElement
  if (!inst.__swc_initialized) {
    inst._swcId = inst?.getAttribute?.('swc-use-ssr') ?? 's' + Math.random().toString(36).substring(2, 11).toLowerCase();
    inst._emitHandlers = new Map();
    inst.__swc_initialized = true;
    // const attributeList = findAllQ(inst);
    // attributeList.forEach(meta => {
    //   delete (inst as any)[meta.propertyKey];
    // });

    const target = inst instanceof Function ? inst : inst.constructor;

    // ╔════════════════════════════════════════════════════════════════════════════════╗
    // ║ decorator 필드의 own property 삭제                                              ║
    // ║                                                                                ║
    // ║ 이유: own property가 있으면 prototype의 getter/setter는 절대 안 탄다                  ║
    // ║ 1. TypeScript는 초기값이 있는 필드를 constructor에서 own property로 생성       ║
    // ║    @attributeThis('id') myId: string = "default"  →  this.myId = "default"    ║
    // ║                                                                                ║
    // ║ 2. JavaScript의 property lookup은 own property를 먼저 찾음                      ║
    // ║    - this.myId 접근                                                           ║
    // ║    - 1순위: instance의 own property 있나? → 있으면 그것 반환                  ║
    // ║    - 2순위: prototype의 getter 있나? → 있으면 호출                            ║
    // ║                                                                                ║
    // ║ 3. own property가 있으면 prototype의 getter는 절대 호출되지 않음               ║
    // ║    따라서 getter에서 정의된 DOM 동기화 로직이 작동하지 않음                   ║
    // ║                                                                                ║
    // ║ 4. own property를 삭제하면 JavaScript가 prototype의 getter를 찾게 됨          ║
    // ║    → getter 호출됨 → DOM 속성 값 동기화됨                                     ║
    // ╚════════════════════════════════════════════════════════════════════════════════╝
    // 함수는 decorator에서 값자체를 descriptor.value = function (...args: any[]) {...

    // @attribute 필드의 own property 삭제 → getter/setter 작동
    // const attributeList = findAllAttributeMetadata(target);
    const attributeAllList = findAllAttributeMetadata(target).filter(it => it.type === 'property');
    if (attributeAllList) {
      attributeAllList.forEach(meta => {
        // const initUserData = (inst as any)[meta.propertyKey];
        delete (inst as any)[meta.propertyKey];
        // (inst as any)[meta.propertyKey] = initUserData;
      });
    }

    // @query 필드의 own property 삭제 → getter 작동
    const queryList = getQueryMetadata(target);
    if (queryList) {
      queryList.forEach(meta => {
        delete (inst as any)[meta.propertyKey];
      });
    }

    // @queryAll 필드의 own property 삭제 → getter 작동
    const queryAllList = getQueryAllMetadata(target);
    if (queryAllList) {
      queryAllList.forEach(meta => {
        delete (inst as any)[meta.propertyKey];
      });
    }
    // const slotAllList = findAllApplySlotMetadata(target);
    // if (slotAllList) {
    //   slotAllList.filter(it => it.type === 'property').forEach(meta => {
    //     delete (inst as any)[meta.propertyKey];
    //   });
    // }


    const propertyAllList = findAllPropertyMetadata(target).filter(it => it.type === 'property');
    if (propertyAllList) {
      propertyAllList.forEach(meta => {
        delete (inst as any)[meta.propertyKey];
      });
    }

    const stateAllList = findAllStateMetadata(target);
    if (stateAllList) {
      stateAllList.forEach(meta => {
        const initUserData = (inst as any)[meta.propertyKey];
        delete (inst as any)[meta.propertyKey];
        (inst as any)[meta.propertyKey] = initUserData;
      });
    }

    // Call constructor script if present
    const hostSet = SwcUtils.getHostSet(inst);
    const appHosts = SwcUtils.findAllAppHostsIncludingSelfDirect(inst);
    inst._executeSwcScript?.('swc-on-constructor', hostSet);

    // Call @onInitialize lifecycle methods
    const cMethods = findAllLifecycleMetadata(inst, ON_INITIALIZE_METADATA_KEY);
    for (const m of cMethods) inst._invokeLifecycleMethod(m.propertyKey, hostSet);
  }
};


// 훔 이게맞나?? global로 관리하는게..훔... 왜이렇게 했을까..
// --- Global Event Handling ---
const globalDelegatedRoots = new WeakSet<Node>();
// 여기에서 중복 호출안되게 잘막아준다 ..
const handleGlobalSwcEvent = async (event: Event) => {
  if ((event as any).__swc_handled) return;
  const path = event.composedPath();
  const type = event.type;
  const attrName = `swc-on-${type}`;

  for (const node of path) {
    if (!(node instanceof HTMLElement)) continue;
    const script = node.getAttribute?.(attrName);
    if (script && !getElementConfig(node)) {
      const host: any = SwcUtils.findNearestSwcHostIncludingSelf(node);
      if (host && host.isConnected && typeof host.__swc_executeAttributeEvent === 'function') {
        await host.__swc_executeAttributeEvent(node, attrName, script, event);
        (event as any).__swc_handled = true;
        break;
      }
    }
  }
};

function buildEnv(configWindow: Window) {
  const win: Window = configWindow;
  const doc: Document = win?.document;
  const builtInTagMap = new Map<any, string>();
  for (const [cls, tag] of HTML_TAG_ENTRIES) {
    if ((win as any)?.[cls]) builtInTagMap.set((win as any)[cls], tag);
  }
  const domHelpers = SwcUtils.getHelperSet(win);

  return {win, doc, builtInTagMap, domHelpers};
}

const getHandlers = (inst: any) => {
  if (!inst.__swc_attributeEventHandlers) inst.__swc_attributeEventHandlers = new Map();
  return inst.__swc_attributeEventHandlers;
};

const setupPrototype = (proto: any, win: Window) => {
  if (proto.__swc_proto_setup) return;
  proto.__swc_proto_setup = true;


  // proto.createSlotString = function (id: string) {
  //   return NodeSlot.slot(`${this._swcId}-${id}`);
  // }
  // proto.createEaHtml = function (id: string, script: string) {
  //   return ElementApply.html(id, script);
  // }
  // proto.createEaText = function (id: string, script: string) {
  //   return ElementApply.text(id, script);
  // }
  // proto.createEaAttribute = function (id: string, name: string, script: string) {
  //   return ElementApply.attribute(id, name, script);
  // }
  // proto.createEaEvent = function (id: string, name: string, script: string) {
  //   return ElementApply.event(id, name, script);
  // }
  // proto.createEaProperty = function (id: string, name: string, script: string) {
  //   return ElementApply.property(id, name, script);
  // }

  // swc-id-asdasdasdasd-click="  :value=""    {: value fsdfsdafsad :}       {html: aaa :}   {text: asdas :}

  proto._executeSwcScript = function (attrName: string, hostSet: HostSet, extraArgs: Record<string, any> = {}) {
    ensureInit(this);
    const script = this.getAttribute(attrName);
    if (script) {
      try {
        const conf = getElementConfig(this);
        const currentWin = (this as any)._resolveWindow(conf);
        const helpers = SwcUtils.getHelperSet(currentWin);
        const args = {...hostSet, ...helpers, ...extraArgs, $el: this, $root: this.getRootNode()};
        FunctionUtils.execute({script, context: this, args});
      } catch (e) {
        console.error(`[SWC] Failed to execute ${attrName}:`, e);
      }
    }
  };

  proto._resolveWindow = function (localConfig?: ElementConfig): Window {
    ensureInit(this);
    if (localConfig?.window) return localConfig.window;
    const ancestors = SwcUtils.findAllSwcHostsIncludingSelf(this as any);
    for (let i = ancestors.length - 1; i >= 0; i--) {
      const aConf = getElementConfig(ancestors[i]);
      if (aConf?.window) return aConf.window;
    }
    return getElementConfig(this).window ?? ((typeof window !== 'undefined' ? window : undefined) as Window);
  };

  proto._invokeLifecycleMethod = function (methodName: string | symbol, hostSet?: HostSet, extraArgs: any[] = []) {
    ensureInit(this);
    if (typeof (this as any)[methodName] !== 'function') return;
    const useHostSet = hostSet ?? SwcUtils.getHelperAndHostSet(win, this);
    const app = useHostSet?.$appHost?.simpleApplication;
    // console.log('---->hh',app, this, methodName);
    if (app) {
      const otherStorage = new Map<any, any>();
      const situations = new SituationTypeContainers([new SituationTypeContainer({situationType: InjectSituationType.HOST_SET, data: useHostSet}), new SituationTypeContainer({situationType: InjectSituationType.APP_HOST, data: useHostSet.$appHost}), new SituationTypeContainer({situationType: InjectSituationType.APP_HOSTS, data: useHostSet.$appHosts}), new SituationTypeContainer({
        situationType: InjectSituationType.HOST,
        data: useHostSet.$host
      }), new SituationTypeContainer({situationType: InjectSituationType.HOSTS, data: useHostSet.$hosts}), new SituationTypeContainer({situationType: InjectSituationType.FIRST_HOST, data: useHostSet.$firstHost}), new SituationTypeContainer({situationType: InjectSituationType.LAST_HOST, data: useHostSet.$lastHost}), new SituationTypeContainer({
        situationType: InjectSituationType.FIRST_APP_HOST,
        data: useHostSet.$firstAppHost
      }), new SituationTypeContainer({situationType: InjectSituationType.LAST_APP_HOST, data: useHostSet.$lastAppHost})]);
      otherStorage.set(SituationTypeContainers, situations);

      return app.simstanceManager.executeBindParameterSim(
        {
          target: this,
          targetKey: methodName,
          inputParameters: extraArgs
        },
        otherStorage
      );
    } else {
      return (this as any)[methodName](...extraArgs);
    }
  };

  proto._bindAttributeEvent = function (el: HTMLElement, attrName: string, script: string, eventName?: string) {
    ensureInit(this);
    if (!eventName) {
      if (!attrName.startsWith('swc-on-')) return;
      eventName = attrName.substring(7);
    }
    const elHandlers = getHandlers(this);
    let handlers = elHandlers.get(el);
    if (!handlers) {
      handlers = new Map();
      elHandlers.set(el, handlers);
    }

    const oldHandler = handlers.get(attrName);
    if (oldHandler) el.removeEventListener(eventName, oldHandler);

    const handler = async (event: any) => {
      const hostSet = SwcUtils.getHostSet(el);
      const conf = getElementConfig(this);
      const currentWin = (this as any)._resolveWindow(conf);
      const helpers = SwcUtils.getHelperSet(currentWin);
      const args = {
        event,
        $data: (event as CustomEvent).detail,
        ...hostSet,
        ...helpers,
        $el: el,
        $root: this.getRootNode()
      };
      await FunctionUtils.execute({script, context: el, args});
    };

    el.addEventListener(eventName, handler);
    handlers.set(attrName, handler);
  };

  proto.__swc_executeAttributeEvent = async function (el: HTMLElement, attrName: string, script: string, event: Event) {
    ensureInit(this);

    const hostSet = SwcUtils.getHostSet(el);
    const conf = getElementConfig(this);
    const currentWin = (this as any)._resolveWindow(conf);
    const currentHelpers = SwcUtils.getHelperSet(currentWin);
    const detail = (event as CustomEvent).detail;
    const args = {
      event,
      $event: event,
      $data: detail,
      $detail: detail,
      ...hostSet,
      ...currentHelpers,
      $el: el,
      $root: this.getRootNode()
    };
    await FunctionUtils.execute({script, context: el, args});
  };
};

export const elementDefine =
  (name: string, config: Partial<ElementConfig> = {}): ClassDecorator =>
    (constructor: any) => {
      const { win, doc, builtInTagMap: BUILT_IN_TAG_MAP, domHelpers: SWC_DOM_HELPERS } = buildEnv(config.window);
      const metadata: ElementMetadata = { ...config, name, window: win };

      if (!metadata.window) {
        throw new Error('window is required');
      }

      let extendsTagName = metadata.extends;
      if (!extendsTagName) {
        let proto = constructor;
        const BaseHTMLElement = (win as any).HTMLElement;
        while (proto && proto !== BaseHTMLElement && proto !== Function.prototype) {
          extendsTagName = BUILT_IN_TAG_MAP.get(proto);
          if (extendsTagName) break;
          proto = Object.getPrototypeOf(proto);
        }
        metadata.extends = extendsTagName;
      }

      const attributeList = findAllAttributeMetadata(constructor);
      const applyAttributeMap = findAllAttributeApplyMetadata(constructor);

      const swcLifecycleAttributes = ['swc-on-constructor', 'swc-on-connected', 'swc-on-disconnected', 'swc-on-before-connected', 'swc-on-after-connected', 'swc-on-before-disconnected', 'swc-on-after-disconnected', 'swc-on-before-adopted', 'swc-on-after-adopted', 'swc-on-attribute-changed'];
      const swcOnEvents = DOM_EVENT_NAMES.map(e => `swc-on-${e}`);

      const attributeApplyNames = Array.from(applyAttributeMap.values())
        .map(it => it.targetAttributeName)
        .filter(Boolean) as string[];
      const hostAttributes = attributeList.filter(it => it.selector === '$this').map(it => it.propertyKey || String(it.propertyKey));
      // Get original static observedAttributes before they're overwritten by Object.defineProperty
      const originalStaticObservedAttributes = (constructor.observedAttributes ?? []) as string[];

      const proto = constructor.prototype;
      setupPrototype(proto, win);

      // 값을 기대하지않는다.
      let helperHostSet: HelperHostSet | null = null;
      // ── cyclers: 데코레이터별 라이프사이클 위임 클래스 (elementDefine 시 1회 생성, 계속 재사용) ──
      const eventCycler = new EventListenerLifeCycler();
      const cyclers: ElementDefineLifeCycler[] = [
        eventCycler,
        new ChangedAttributeLifeCycler(),
        new EmitCustomEventLifeCycler(),
        new ResizeObserverLifeCycler(),
        new IntersectionObserverLifeCycler(),
        new MutationObserverLifeCycler(),
        new MessageSubscribeLifeCycler(),
        new RouteSubscribeLifeCycler(),
      ];

      // observedAttributes 기여 cycler (define-time, constructor 기반)
      const cyclerObservedAttributes = cyclers.flatMap(c => c.getObservedAttributeNames?.(constructor) ?? []);
      const mergedObservedAttributes = [...new Set([...(metadata.observedAttributes ?? []), ...originalStaticObservedAttributes, ...cyclerObservedAttributes, ...attributeApplyNames, ...hostAttributes, ...swcLifecycleAttributes, ...swcOnEvents])];

      // 렌더 후 모든 시클러 onConnected 호출 → Set 수집 후 observer 생성
      const buildObservers = async (helperHostSet: HelperHostSet): Promise<void> => {
        const inst = helperHostSet.$this;
        const observers: Array<MutationObserver | ResizeObserver | IntersectionObserver> = [];
        let resizeObserverSet: ResizeObserverSet = [];
        let mutationObserverSet: MutationObserverSet = [];
        let intersectionObserverSet: IntersectionObserverSet = [];

        // delegate 추적 root 해석: shadow/light/auto/all → 실제 root 목록
        const resolveDelegateRoots = (delegateRoot: SwcRootType | undefined): (HTMLElement | ShadowRoot)[] => {
          const r = delegateRoot || 'auto';
          const roots: (HTMLElement | ShadowRoot)[] = [];
          if (r === 'auto') roots.push(inst.shadowRoot || inst);
          else if (r === 'light') roots.push(inst);
          else if (r === 'shadow' && inst.shadowRoot) roots.push(inst.shadowRoot);
          else if (r === 'all') { roots.push(inst); if (inst.shadowRoot) roots.push(inst.shadowRoot); }
          return roots;
        };

        // 1. 모든 시클러 onConnected → observer Set 수집 (여러 시클러가 반환한 Set 을 전부 누적)
        for (const c of cyclers) {
          const result = (await c.onConnected?.(helperHostSet, resizeObserverSet)) as OnConnectedResult | void;
          if (!result) continue;
          if (result.resizeObserverSet?.length) resizeObserverSet = [...resizeObserverSet, ...result.resizeObserverSet];
          if (result.mutationObserverSet?.length) mutationObserverSet = [...mutationObserverSet, ...result.mutationObserverSet];
          if (result.intersectionObserverSet?.length) intersectionObserverSet = [...intersectionObserverSet, ...result.intersectionObserverSet];
        }

        // 2. 타입별로 observer 생성
        // ResizeObserver 먼저: mutation callback 이 observe/unobserve 를 주입받아야 함
        // observeTargets 중 delegate 항목은 셀렉터 문자열이라 초기 observe 하지 않는다 (동적 추적 전용).
        // 동적 observe/unobserve 는 중복 호출을 막기 위해 observe 대상 WeakSet 으로 추적한다.
        const resizeDelegates = (resizeObserverSet ?? []).filter(t => t.delegate && typeof t.target === 'string') as Array<ResizeObserverSetEntry & { target: string }>;
        let resizeObserve: ((el: Element, opts?: ResizeObserverOptions) => void) | undefined;
        let resizeUnobserve: ((el: Element) => void) | undefined;
        const resizeObserved = new WeakSet<Element>();
        if (resizeObserverSet?.length) {
          const roCallbacks = [...new Set(resizeObserverSet.map(e => e.callback))];
          const ro = new (win as any).ResizeObserver((entries, obs) => {
            for (const cb of roCallbacks) cb(entries, obs);
          });
          for (const e of resizeObserverSet) {
            if (e.delegate) continue;
            if (typeof e.target === 'string') {
              // 문자열(non-delegate)이면 root 에서 검색된 요소들을 observe 대상으로 추가한다.
              const scope = resolveDelegateRoots(e.delegateRoot);
              for (const sr of scope) {
                sr.querySelectorAll(e.target).forEach(el => {
                  if (!resizeObserved.has(el)) { ro.observe(el, e.options); resizeObserved.add(el); }
                });
              }
              continue;
            }
            ro.observe(e.target as Element, e.options);
            if (e.target instanceof Element) resizeObserved.add(e.target);
          }
          resizeObserve = (el, opts) => {
            if (resizeObserved.has(el)) return;
            ro.observe(el, opts);
            resizeObserved.add(el);
          };
          resizeUnobserve = (el) => {
            if (!resizeObserved.has(el)) return;
            ro.unobserve(el);
            resizeObserved.delete(el);
          };
          observers.push(ro);
        }

        // IntersectionObserver: 옵션 그룹별로 1개씩 생성.
        // delegate 항목은 동적 추적용 셀렉터이므로 observe/unobserve 함수를 MutationObserver 콜백에 넘긴다.
        // 동적 observe/unobserve 중복 방지를 위해 그룹별 WeakSet 으로 추적한다.
        const intersectionDelegates: Array<{ target: string; delegateRoot?: SwcRootType; observe: (el: Element) => void; unobserve: (el: Element) => void }> = [];
        for (const group of intersectionObserverSet) {
          const ioCallbacks = [...new Set(group.observeTargets.map(e => e.callback))];
          const io = new (win as any).IntersectionObserver((entries, obs) => {
            for (const cb of ioCallbacks) cb(entries, obs);
          }, group.options);
          const ioObserved = new WeakSet<Element>();
          for (const e of group.observeTargets) {
            if (e.delegate) {
              const target = e.target as string;
              const observe = (el: Element) => {
                if (ioObserved.has(el)) return;
                io.observe(el);
                ioObserved.add(el);
              };
              const unobserve = (el: Element) => {
                if (!ioObserved.has(el)) return;
                io.unobserve(el);
                ioObserved.delete(el);
              };
              intersectionDelegates.push({ target, delegateRoot: e.delegateRoot, observe, unobserve });
              continue;
            }
            if (typeof e.target === 'string') {
              // 문자열(non-delegate)이면 root 에서 검색된 요소들을 observe 대상으로 추가한다.
              const scope = resolveDelegateRoots(e.delegateRoot);
              for (const sr of scope) {
                sr.querySelectorAll(e.target).forEach(el => {
                  if (!ioObserved.has(el)) { io.observe(el); ioObserved.add(el); }
                });
              }
              continue;
            }
            io.observe(e.target as Element);
            if (e.target instanceof Element) ioObserved.add(e.target);
          }
          observers.push(io);
        }

        // resize/intersection delegate 동적 추적 — MutationObserver 콜백에서 추가/제거된 요소를 observe/unobserve 한다.
        const handleResizeDelegate = (n: Node, observe: boolean) => {
          if (!resizeObserve || !resizeUnobserve || n.nodeType !== 1) return;
          const el = n as HTMLElement;
          for (const d of resizeDelegates) {
            const isThis = d.target === '$this' || d.target === '';
            const matchesSel = (node: any) => {
              if (!node || node.nodeType !== 1) return false;
              if (isThis) return true;
              return (node as HTMLElement).matches?.(d.target) || !!(node as HTMLElement).closest?.(d.target);
            };
            if (matchesSel(el)) {
              observe ? resizeObserve(el, d.options)
                       : resizeUnobserve(el);
            } else if (!isThis) {
              el.querySelectorAll(d.target).forEach(sub => {
                observe ? resizeObserve(sub as HTMLElement, d.options)
                         : resizeUnobserve(sub as HTMLElement);
              });
            }
          }
        };
        const handleIntersectionDelegate = (n: Node, observe: boolean) => {
          if (n.nodeType !== 1) return;
          const el = n as HTMLElement;
          for (const d of intersectionDelegates) {
            const isThis = d.target === '$this' || d.target === '';
            const matchesSel = (node: any) => {
              if (!node || node.nodeType !== 1) return false;
              if (isThis) return true;
              return (node as HTMLElement).matches?.(d.target) || !!(node as HTMLElement).closest?.(d.target);
            };
            if (matchesSel(el)) {
              observe ? d.observe(el) : d.unobserve(el);
            } else if (!isThis) {
              el.querySelectorAll(d.target).forEach(sub => {
                observe ? d.observe(sub as HTMLElement) : d.unobserve(sub as HTMLElement);
              });
            }
          }
        };

        if (mutationObserverSet?.length || resizeDelegates.length > 0 || intersectionDelegates.length > 0) {
          // 하나의 MutationObserver 로 resize/intersection delegate 동적 추적 + mutation 콜백을 함께 처리
          const callbacks = [...new Set((mutationObserverSet ?? []).map(e => e.callback))];
          const mo = new (win as any).MutationObserver((mutations, obs) => {
            for (const mut of mutations) {
              Array.from(mut.addedNodes   || []).forEach(n => { handleResizeDelegate(n as Node, true); handleIntersectionDelegate(n as Node, true); });
              Array.from(mut.removedNodes || []).forEach(n => { handleResizeDelegate(n as Node, false); handleIntersectionDelegate(n as Node, false); });
            }
            for (const cb of callbacks) cb(mutations, obs);
          });

          // observe 대상 전체(엔트리 + delegate 추적 root)를 하나로 모아 중복 observe 를 제거한다.
          // 같은 target 이 여러 소스에서 지정되면 MutationObserverInit 을 합집합(최대 감지범위)으로 병합한다.
          const moObserveTargets = new Map<Element | ShadowRoot, MutationObserverInit>();
          const mergeMutationInit = (existing: MutationObserverInit | undefined, next: MutationObserverInit): MutationObserverInit => {
            if (!existing) return next;
            const mergedFilter = existing.attributeFilter || next.attributeFilter
              ? [...new Set([...(existing.attributeFilter ?? []), ...(next.attributeFilter ?? [])])]
              : undefined;
            return {
              childList: existing.childList || next.childList,
              attributes: existing.attributes || next.attributes,
              characterData: existing.characterData || next.characterData,
              subtree: existing.subtree || next.subtree,
              attributeOldValue: existing.attributeOldValue || next.attributeOldValue,
              characterDataOldValue: existing.characterDataOldValue || next.characterDataOldValue,
              attributeFilter: mergedFilter,
            };
          };
          const addObserveTarget = (target: Element | ShadowRoot, options: MutationObserverInit) => {
            moObserveTargets.set(target, mergeMutationInit(moObserveTargets.get(target), options));
          };

          // 1) mutationObserverSet 엔트리
          for (const e of mutationObserverSet ?? []) {
            if (e.delegate) continue;
            const init = e.options ?? { childList: true };
            if (typeof e.target === 'string') {
              // 문자열(non-delegate)이면 root 에서 검색된 요소들을 observe 대상으로 추가한다.
              const scope = resolveDelegateRoots(e.delegateRoot);
              for (const sr of scope) {
                sr.querySelectorAll(e.target).forEach(el => addObserveTarget(el, init));
              }
              continue;
            }
            addObserveTarget(e.target, init);
          }

          // 2) delegate 추적 root: shadow/light/all/auto 로 해석해 전부 observe
          for (const d of resizeDelegates) {
            for (const r of resolveDelegateRoots(d.delegateRoot)) addObserveTarget(r, { childList: true, subtree: true });
          }
          for (const d of intersectionDelegates) {
            for (const r of resolveDelegateRoots(d.delegateRoot)) addObserveTarget(r, { childList: true, subtree: true });
          }

          for (const [target, options] of moObserveTargets) {
            mo.observe(target, options);
          }
          observers.push(mo);
        }

        inst.__swc_observers = observers;
      };

      const originalConnected = proto.connectedCallback;
      proto.connectedCallback = async function () {
        ensureInit(this);
        // 재연결 시 누적 방지 — cycler 내부 리소스 초기화
        helperHostSet = SwcUtils.getHelperAndHostSet(win, this as any);
        const appHost = helperHostSet.$appHost;
        const useSsr = isSSR(this);
        try {
          if (appHost && typeof (appHost as any)._connected === 'function') {
            await (appHost as any)._connected(this);
          } else if (appHost && typeof (appHost as any)) {
            (appHost as any)._connected_safari_and_standby ??= [];
            (appHost as any)._connected_safari_and_standby.push(this);
          }

          const conf = getElementConfig(this);
          const currentWin = (this as any)._resolveWindow(conf);

          // before-connected 라이프사이클 메서드 (@onConnectedBefore)
          for (const m of findAllOnConnectedBeforeMetadata(this)) await (this as any)._invokeLifecycleMethod(m.propertyKey, helperHostSet);
          (this as any)._executeSwcScript('swc-on-before-connected', helperHostSet);

          // ── 렌더 (@onConnected / @onConnectedBody*) — elementDefine 책임 ──
          const targetConnectedList = useSsr ? [] : findAllOnConnectedMetadata(constructor);
          const shadowMode = conf?.useShadow || targetConnectedList.find(it => it.options.useShadow)?.options.useShadow;
          if (shadowMode && !this.shadowRoot) {
            const mode = shadowMode === true ? 'open' : shadowMode;
            this.attachShadow({ mode: mode as ShadowRootMode });
          }

          const stateContext: any = { ...helperHostSet };
          findAllStateMetadata(this).forEach(it => {
            stateContext[it.name] = this[it.propertyKey];
          });

          const shadowChildren: Node[] = [];
          const lightChildren: Node[] = [];

          if (targetConnectedList.length > 0) {
            for (const meta of targetConnectedList) {
              let res = await (this as any)._invokeLifecycleMethod(meta.propertyKey, helperHostSet);
              if (typeof res === 'string') {
                const htmlTemplateElement = doc.createElement('template');
                htmlTemplateElement.innerHTML = res;
                res = htmlTemplateElement.content;
              }
              if (res) {
                const nodes = Array.isArray(res) ? res : [res];
                if (meta.options.useShadow || conf?.useShadow) {
                  shadowChildren.push(...nodes);
                } else {
                  lightChildren.push(...nodes);
                }
              }
            }
            try {
              if (this.shadowRoot) {
                const applyShadowChildren = SwcUtils.projectProcessHtml(this._swcId, shadowChildren, doc);
                this.shadowRoot.replaceChildren(...applyShadowChildren);
              }
              if (lightChildren.length) {
                const applyLightChildren = SwcUtils.projectProcessHtml(this._swcId, lightChildren, doc);
                this.replaceChildren(...applyLightChildren);
              }
            } catch (e) {
              console.error('[ElementDefine] innerHTML setting error:', e);
            }
            new ElementApply(this, { id: this._swcId }).apply({ context: stateContext, bind: this });
          } else {
            new ElementApply(this, { id: this._swcId }).apply({ exclude: { html: true, text: true, attribute: true }, context: stateContext, bind: this });
          }

          // global delegate event
          const root = this.getRootNode();
          if (!globalDelegatedRoots.has(root)) {
            DOM_EVENT_NAMES.forEach(type => {
              root.addEventListener(type, handleGlobalSwcEvent);
            });
            globalDelegatedRoots.add(root);
          }

          // ── cycler 실행 (렌더 후): 모든 시클러 onConnected → observer Set 수집 → observer 생성 ──
          // helperHostSet 은 클로저 변수라 async 흐름에서 다른 인스턴스로 덮어써질 수 있다.
          // 반드시 현재 인스턴스(this)로 재계산한 값을 사용한다.
          await buildObservers(SwcUtils.getHelperAndHostSet(win, this as any));

          if (originalConnected) await originalConnected.apply(this);

          // after-connected 라이프사이클 메서드 (@onConnectedAfter)
          for (const m of findAllOnConnectedAfterMetadata(this)) await (this as any)._invokeLifecycleMethod(m.propertyKey, helperHostSet);
          (this as any)._executeSwcScript('swc-on-connected', helperHostSet);
          (this as any)._executeSwcScript('swc-on-after-connected', helperHostSet);
          (this as any).__swc_connected = true;
        } finally {
          for (const m of findAllLifecycleMetadata(this, ON_CONNECTED_COMPLETED_METADATA_KEY)) await (this as any)._invokeLifecycleMethod(m.propertyKey, helperHostSet);
          if (appHost && typeof (appHost as any)._connectedDone === 'function') {
            await (appHost as any)._connectedDone(this);
          }
        }
      };

      /////////////////////////////////////////////////
      // disconnectedCallback
      ////////////////////////////////////////////////
      const originalDisconnected = proto.disconnectedCallback;
      proto.disconnectedCallback = function () {
        const appHost = helperHostSet?.$appHost;
        if (appHost && typeof (appHost as any)._disconnected === 'function') {
          (appHost as any)._disconnected(this);
        }

        (this as any)._executeSwcScript('swc-on-before-disconnected', helperHostSet);
        for (const m of findAllLifecycleMetadata(this, ON_BEFORE_DISCONNECTED_METADATA_KEY)) (this as any)._invokeLifecycleMethod(m.propertyKey, helperHostSet);
        for (const c of cyclers) c.onDisconnected?.(helperHostSet!);

        for (const o of (this as any).__swc_observers ?? []) {
          try { (o as any)?.disconnect?.(); } catch (e) { console.error('[SWC] observer disconnect error:', e); }
        }
        (this as any).__swc_observers = [];

        // elementApply event listener 정리
        new ElementApply(this, { id: this._swcId }).removeAllEventListener();

        if (originalDisconnected) originalDisconnected.apply(this);

        for (const m of findAllLifecycleMetadata(this, ON_AFTER_DISCONNECTED_METADATA_KEY)) (this as any)._invokeLifecycleMethod(m.propertyKey, helperHostSet);
        (this as any)._executeSwcScript('swc-on-disconnected', helperHostSet);
        (this as any)._executeSwcScript('swc-on-after-disconnected', helperHostSet);
        (this as any).__swc_connected = false;
      };

      const originalAdopted = proto.adoptedCallback;
      proto.adoptedCallback = function () {
        const hostSet = SwcUtils.getHostSet(this as any);
        (this as any)._executeSwcScript('swc-on-before-adopted', hostSet);
        for (const m of findAllLifecycleMetadata(this, ON_BEFORE_ADOPTED_METADATA_KEY)) (this as any)._invokeLifecycleMethod(m.propertyKey, hostSet);
        for (const c of cyclers) c.onAdopted?.(helperHostSet!);

        if (originalAdopted) originalAdopted.apply(this);

        for (const m of findAllLifecycleMetadata(this, ON_AFTER_ADOPTED_METADATA_KEY)) (this as any)._invokeLifecycleMethod(m.propertyKey, hostSet);
        (this as any)._executeSwcScript('swc-on-adopted', hostSet);
        (this as any)._executeSwcScript('swc-on-after-adopted', hostSet);
      };

      const originalAttributeChanged = proto.attributeChangedCallback;
      proto.attributeChangedCallback = function (name: string, old: string | null, newVal: string | null) {
        if (originalAttributeChanged) originalAttributeChanged.apply(this, [name, old, newVal]);

        // attributeChangedCallback 은 connected 이전에도 호출될 수 있으므로
        // 클로저의 helperHostSet(null 가능) 대신 이 시점에 새로 계산한다.
        const helperAndHostSet = SwcUtils.getHelperAndHostSet(win, this as any);

        // Process expression directive before passing to handlers
        let processedVal: any = newVal;
        if (newVal !== null) {
          const ae = new ActionExpression(newVal);
          const expr = ae.getFirstExpression('callReturn');
          if (expr) {
            const win = (this as any)._resolveWindow?.() || ((typeof window !== 'undefined' ? window : undefined) as any);
            const exprHelperAndHostSet = SwcUtils.getHelperAndHostSet(win, this as any);
            const script = ConvertUtils.decodeHtmlEntity(expr.script, win.document);
            try {
              const result = FunctionUtils.executeReturn({
                script: script,
                context: this,
                args: exprHelperAndHostSet
              });
              processedVal = result;
            } catch (e) {
              console.error(`[SWC] Failed to execute directive {{= ${expr.script} }} on attribute ${name}: ${exprHelperAndHostSet}`, e);
              processedVal = newVal;
            }
          }
        }

        if (name.startsWith('swc-on-') && !swcLifecycleAttributes.includes(name)) {
          if (newVal !== null) {
            const eventName = name.substring(7);
            (this as any)._bindAttributeEvent(this as any, name, newVal, eventName);
          }
        }

        // cycler 위임: attribute 옵저빙(@emitCustomEvent(attributeName) / @changedAttribute 등)
        for (const c of cyclers) c.onAttributeChanged?.(helperAndHostSet, name, old, processedVal);
      };

      Object.defineProperty(constructor, 'observedAttributes', {
        get: () => mergedObservedAttributes,
        configurable: true
      });

      ReflectUtils.defineMetadata(ELEMENT_CONFIG_KEY, metadata, constructor);
      const registry = metadata.customElementRegistry || (win as any)?.customElements;
      if (registry && !registry.get(metadata.name)) {
        registry.define(metadata.name, constructor as any, metadata.extends ? { extends: metadata.extends } : undefined);
      }
      return constructor;
    };
