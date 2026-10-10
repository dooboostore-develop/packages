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
import {FirstCheckMaker} from '@dooboostore/simple-boot';
import {buildSwcParameterArgs, buildDomStorageKindValues, getParameterMetadata} from './parameter';
import {ElementDefineLifeCycler, HelperHostSet, HostSet, InjectSituationType, IntersectionObserverSet, MutationObserverSet, MutationObserverSetEntry, ObserverScope, OnConnectedResult, ResizeObserverSet, ResizeObserverSetEntry, SwcRootType} from '../types';
import {ConvertUtils, ElementApply} from '@dooboostore/core-web';
import {isSSR} from "../elements/SwcAppMixin";
import {findAllStateMetadata} from "./state";
import {findAllAroundMetadata} from "./around";
import {findAllPropertyMetadata} from "./applyProperty";
import {MessageSubscribeLifeCycler} from "./subscribeSwcAppMessage";
import {RouteSubscribeLifeCycler} from "./subscribeSwcAppRouteChange";
import {SetIntervalLifeCycler} from "./setInterval";
import {SetTimeoutLifeCycler} from "./setTimeout";
import {RequestAnimationFrameLifeCycler} from "./requestAnimationFrame";
import {EventMediaLifeCycler} from "./eventMedia";
import {FetchLifeCycler} from "./fetch";

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
  const constructor = typeof target === 'function' ? target : target.constructor;
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

    const target = typeof inst === 'function' ? inst : inst.constructor;

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
        // getter가 없으면(순수 필드: declare·하이드레이션 값 등) 지우지 않음.
        // getter가 있을 때만 own 값을 지워 getter가 DOM을 새로 읽게 한다.
        let proto = Object.getPrototypeOf(inst);
        let hasGetter = false;
        while (proto && proto !== Object.prototype) {
          const d = Object.getOwnPropertyDescriptor(proto, meta.propertyKey);
          if (d) {
            hasGetter = typeof d.get === 'function';
            break;
          }
          proto = Object.getPrototypeOf(proto);
        }
        if (!hasGetter) return;
        delete (inst as any)[meta.propertyKey];
      });
    }

    const stateAllList = findAllStateMetadata(target);
    if (stateAllList) {
      stateAllList.forEach(meta => {
        // getter로 읽으면 안 됨 — own이 남아있을 때 getter가 이주까지 해버려
        // setter 재대입과 합치면 DOM 동기화가 중복 실행됨. descriptor에서 raw를 꺼낸다.
        // own이 없으면(이미 정리됨) 스킵.
        const own = Object.getOwnPropertyDescriptor(inst, meta.propertyKey);
        if (own && 'value' in own) {
          const initUserData = own.value;
          delete (inst as any)[meta.propertyKey];
          (inst as any)[meta.propertyKey] = initUserData;
        }
      });
    }

    // @around 필드의 own property 정리 → setter 경유로 재대입 (초기값에 set() 적용).
    // attribute/query처럼 plain delete하면 초기값이 날아간다 — 반드시 살려서 setter로 넣는다.
    // getter로 읽으면 안 됨(before 변환값이 섞임) — descriptor에서 raw를 꺼낸다.
    // own이 없으면(이미 정리됨) 스킵 — 그래야 중복 변환이 안 생긴다.
    const aroundAllList = findAllAroundMetadata(target);
    if (aroundAllList) {
      aroundAllList.forEach(meta => {
        const own = Object.getOwnPropertyDescriptor(inst, meta.propertyKey);
        if (own && 'value' in own) {
          const initUserData = own.value;
          delete (inst as any)[meta.propertyKey];
          (inst as any)[meta.propertyKey] = initUserData;
        }
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
      const host: any = SwcUtils.findNearestSwcAncestorHost(node);
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
        const currentWin = SwcUtils.resolveWindow(this);
        const helpers = SwcUtils.getHelperSet(currentWin);
        const args = {...hostSet, ...helpers, ...extraArgs, $el: this, $root: this.getRootNode()};
        FunctionUtils.execute({script, context: this, args});
      } catch (e) {
        console.error(`[SWC] Failed to execute ${attrName}:`, e);
      }
    }
  };

  proto._invokeLifecycleMethod = function (methodName: string | symbol, hostSet?: HostSet, extraArgs: any[] = []) {
    ensureInit(this);
    if (typeof (this as any)[methodName] !== 'function') return;
    const useHostSet = hostSet ?? SwcUtils.getHelperAndHostSet(this);
    const app = useHostSet?.$appHost?.simpleApplication;

    // @hostSet/@helperHostSet/@helperSet/@swcAppRouter(parameter.ts)를 위한 값. lifecycle 메서드는
    // event/matched 개념이 없으므로 이것들만 채운다.
    const helperSetValue = SwcUtils.getHelperSet(win);
    const helperHostSetValue = {...helperSetValue, ...useHostSet, $this: this};
    const kindValues = {
      hostSet: useHostSet, helperHostSet: helperHostSetValue, helperSet: helperSetValue,
      swcAppRouter: useHostSet?.$appHost?.router,
      swcAppSimpleApplication: useHostSet?.$appHost?.simpleApplication,
      swcAppHost: useHostSet?.$appHost,
      ...buildDomStorageKindValues(this, win)
    };

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

      // @hostSet/@helperHostSet/@helperSet가 붙은 파라미터는 @Inject/situationType 기반
      // 해석보다 먼저 처리되고(firstCheckMaker), 그 외 파라미터는 기존처럼 @Inject/타입
      // 기반으로 정상 해석된다 — 같은 메서드에서 두 방식을 섞어 써도 된다.
      // swc 파라미터 데코레이터가 붙은 자리는 DI 로 넘기지 않는다. lifecycle 이 못 채우는 kind
      // (예: @fetchSettled — @fetch 가 나중에 채움)는 null. undefined 를 돌려주면
      // "처리 안 함"으로 보고 DI 가 파라미터 타입(Object 등)을 resolve 하려다 SimNoSuch 로 죽는다.
      const firstCheckMaker: FirstCheckMaker = ({target, targetKey}, token, idx) => {
        const saves = getParameterMetadata(target, targetKey!);
        const found = saves.find(s => s.index === idx);
        if (!found) return undefined;
        const value = (kindValues as any)[found.kind];
        // 키를 받는 kind(@querySelectorParam/@attributeParam/@local·session·cookieParam 등)는
        // buildSwcParameterArgs와 동일하게 value(key)로 해석한다 — 아니면 리졸버 함수 자체가 주입된다.
        return (found.key !== undefined && typeof value === 'function' ? value(found.key) : value) ?? null;
      };

      return app.simstanceManager.executeBindParameterSim(
        {
          target: this,
          targetKey: methodName,
          inputParameters: extraArgs,
          firstCheckMaker: [firstCheckMaker]
        },
        otherStorage
      );
    } else {
      // SimpleApplication(DI 컨테이너)이 없는 standalone 사용 시에도 @hostSet/@helperHostSet/
      // @helperSet만큼은 buildSwcParameterArgs로 주입해준다 — 해당 데코레이터가 하나도 없으면
      // extraArgs를 그대로 반환하므로(기존 동작 그대로) 하위호환 깨지지 않는다.
      const args = buildSwcParameterArgs(this, methodName, kindValues, extraArgs);
      return (this as any)[methodName](...args);
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
      const currentWin = SwcUtils.resolveWindow(this);
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
    const currentWin = SwcUtils.resolveWindow(this);
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

// 부모 클래스도 elementDefine 됐으면 proto.xxxCallback 은 부모의 swc 래퍼다 — 그걸 원래 함수로 부르면 라이프사이클이 두 번 돈다.
// 래퍼에 기억해 둔 사용자 원래 함수(없으면 undefined)를 쓴다.
const SWC_ORIGINAL_CALLBACK = Symbol.for('simple-web-component:original-callback');
const userCallback = (fn: any) => (typeof fn === 'function' && SWC_ORIGINAL_CALLBACK in fn ? fn[SWC_ORIGINAL_CALLBACK] : fn);

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

      // helperHostSet 은 인스턴스마다 다르다 — 클래스 단위 변수로 두면 다른 인스턴스의 connect 가 덮어써서
      // disconnect 때 엉뚱한 인스턴스가 정리된다. connect 시점 값을 인스턴스에 저장해 disconnect/adopt 에서 쓴다.
      const connectedHelperHostSet = (inst: any): HelperHostSet => inst.__swc_helperHostSet ?? SwcUtils.getHelperAndHostSet(inst);
      // ── cyclers: 데코레이터별 라이프사이클 위임 클래스 (elementDefine 시 1회 생성, 계속 재사용) ──
      const eventCycler = new EventListenerLifeCycler();
      const resizeCycler = new ResizeObserverLifeCycler();
      const intersectionCycler = new IntersectionObserverLifeCycler();
      const mutationCycler = new MutationObserverLifeCycler();
      const cyclers: ElementDefineLifeCycler[] = [
        eventCycler,
        new ChangedAttributeLifeCycler(),
        new EmitCustomEventLifeCycler(),
        resizeCycler,
        intersectionCycler,
        mutationCycler,
        new MessageSubscribeLifeCycler(),
        new RouteSubscribeLifeCycler(),
        new SetIntervalLifeCycler(),
        new SetTimeoutLifeCycler(),
        new RequestAnimationFrameLifeCycler(),
        new EventMediaLifeCycler(),
        new FetchLifeCycler(),
      ];

      // observedAttributes 기여 cycler (define-time, constructor 기반)
      const cyclerObservedAttributes = cyclers.flatMap(c => c.getObservedAttributeNames?.(constructor) ?? []);
      const mergedObservedAttributes = [...new Set([...(metadata.observedAttributes ?? []), ...originalStaticObservedAttributes, ...cyclerObservedAttributes, ...attributeApplyNames, ...hostAttributes, ...swcLifecycleAttributes, ...swcOnEvents])];

      // ── observer 빌드 (connect 1회당 상태 1개) ──
      // MutationObserver·ResizeObserver 는 인스턴스당 1개씩만 만들고 모든 데코레이터가 공유한다 (delegate 추적 포함).
      // 'self'(렌더 전): 자기 자신 대상 mutation/resize 만 붙여 첫 렌더부터 본다.
      // 'rest'(렌더 후): 나머지 전부를 같은 옵저버에 덧붙인다.
      // 시클러가 scope 별로 자기 메타만 담은 콜백을 주고, 메타는 자기 대상 레코드/엔트리만 받으므로 따로 나눌 필요가 없다.
      // IntersectionObserver 는 옵션 그룹별로 1개 ('rest' 전용).
      type IntersectionDelegate = { target: string; delegateRoot?: SwcRootType; observe: (el: Element) => void; unobserve: (el: Element) => void };
      interface ObserverState {
        observers: Array<MutationObserver | ResizeObserver | IntersectionObserver>;
        ro?: ResizeObserver;
        roCallbacks: Set<ResizeObserverSetEntry['callback']>;
        roObserved: WeakSet<Element>;
        resizeDelegates: Array<ResizeObserverSetEntry & { target: string }>;
        intersectionDelegates: IntersectionDelegate[];
        mo?: MutationObserver;
        moCallbacks: Set<MutationObserverSetEntry['callback']>;
        moTargets: Map<Element | ShadowRoot, MutationObserverInit>;
      }
      const newObserverState = (): ObserverState => ({
        observers: [], roCallbacks: new Set(), roObserved: new WeakSet(), resizeDelegates: [], intersectionDelegates: [],
        moCallbacks: new Set(), moTargets: new Map(),
      });

      // 같은 target 이 여러 소스에서 지정되면 MutationObserverInit 을 합집합(최대 감지범위)으로 병합한다.
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

      // delegate 셀렉터에 맞는 요소(자신 또는 하위)를 찾아 observe/unobserve — MutationObserver 콜백에서 동적 추적용
      const forDelegateMatches = (n: Node, selector: string, fn: (el: Element) => void) => {
        if (n.nodeType !== 1) return;
        const el = n as HTMLElement;
        const isThis = selector === '$this' || selector === '';
        if (isThis || el.matches?.(selector) || el.closest?.(selector)) fn(el);
        else el.querySelectorAll(selector).forEach(fn);
      };

      const buildObservers = async (helperHostSet: HelperHostSet, scope: ObserverScope, st: ObserverState, alive: () => boolean): Promise<void> => {
        const inst = helperHostSet.$this;
        // 'self' 는 순수 수집기(observer 시클러)만 돌린다 — 리스너·타이머 등 부작용 시클러는 'rest' 에서 한 번만.
        const activeCyclers = scope === 'self' ? [resizeCycler, mutationCycler] : cyclers;

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

        // 1. 시클러 onConnected → observer Set 수집 (여러 시클러가 반환한 Set 을 전부 누적)
        let resizeObserverSet: ResizeObserverSet = [];
        let mutationObserverSet: MutationObserverSet = [];
        let intersectionObserverSet: IntersectionObserverSet = [];
        for (const c of activeCyclers) {
          const result = (await c.onConnected?.(helperHostSet, resizeObserverSet, scope)) as OnConnectedResult | void;
          // await 사이에 떼어졌으면(새 연결이 차례를 가져갔으면) 여기서 멈춘다 — 옵저버를 만들면 아무도 disconnect 하지 않아 샌다.
          if (!alive()) return;
          if (!result) continue;
          if (result.resizeObserverSet?.length) resizeObserverSet = [...resizeObserverSet, ...result.resizeObserverSet];
          if (result.mutationObserverSet?.length) mutationObserverSet = [...mutationObserverSet, ...result.mutationObserverSet];
          if (result.intersectionObserverSet?.length) intersectionObserverSet = [...intersectionObserverSet, ...result.intersectionObserverSet];
        }

        // 2. ResizeObserver (1개). delegate 항목은 셀렉터 문자열이라 초기 observe 하지 않고 MutationObserver 로 동적 추적한다.
        const resizeObserve = (el: Element, opts?: ResizeObserverOptions) => {
          if (!st.ro || st.roObserved.has(el)) return;
          st.ro.observe(el, opts);
          st.roObserved.add(el);
        };
        const resizeUnobserve = (el: Element) => {
          if (!st.ro || !st.roObserved.has(el)) return;
          st.ro.unobserve(el);
          st.roObserved.delete(el);
        };
        const newResizeDelegates: ObserverState['resizeDelegates'] = [];
        if (resizeObserverSet.length) {
          if (!st.ro) {
            st.ro = new win.ResizeObserver((entries, obs) => { for (const cb of st.roCallbacks) cb(entries, obs); });
            st.observers.push(st.ro);
          }
          for (const e of resizeObserverSet) {
            st.roCallbacks.add(e.callback);
            if (e.delegate) {
              if (typeof e.target === 'string') newResizeDelegates.push(e as ResizeObserverSetEntry & { target: string });
              continue;
            }
            if (typeof e.target === 'string') {
              // 문자열(non-delegate)이면 root 에서 검색된 요소들을 observe 대상으로 추가한다.
              for (const r of resolveDelegateRoots(e.delegateRoot)) r.querySelectorAll(e.target).forEach(el => resizeObserve(el, e.options));
              continue;
            }
            st.ro.observe(e.target as Element, e.options);
            if (e.target instanceof Element) st.roObserved.add(e.target);
          }
          st.resizeDelegates.push(...newResizeDelegates);
        }

        // 3. IntersectionObserver: 옵션 그룹별로 1개. delegate 항목은 MutationObserver 로 동적 추적한다.
        const newIntersectionDelegates: IntersectionDelegate[] = [];
        for (const group of intersectionObserverSet) {
          const ioCallbacks = [...new Set(group.observeTargets.map(e => e.callback))];
          const io = new win.IntersectionObserver((entries, obs) => { for (const cb of ioCallbacks) cb(entries, obs); }, group.options);
          const ioObserved = new WeakSet<Element>();
          const observe = (el: Element) => { if (ioObserved.has(el)) return; io.observe(el); ioObserved.add(el); };
          const unobserve = (el: Element) => { if (!ioObserved.has(el)) return; io.unobserve(el); ioObserved.delete(el); };
          for (const e of group.observeTargets) {
            if (e.delegate) { newIntersectionDelegates.push({ target: e.target as string, delegateRoot: e.delegateRoot, observe, unobserve }); continue; }
            if (typeof e.target === 'string') {
              for (const r of resolveDelegateRoots(e.delegateRoot)) r.querySelectorAll(e.target).forEach(observe);
              continue;
            }
            observe(e.target as Element);
          }
          st.observers.push(io);
        }
        st.intersectionDelegates.push(...newIntersectionDelegates);

        // 4. MutationObserver (1개): mutation 콜백 + resize/intersection delegate 동적 추적을 함께 처리한다.
        if (mutationObserverSet.length || newResizeDelegates.length || newIntersectionDelegates.length) {
          if (!st.mo) {
            st.mo = new win.MutationObserver((mutations, obs) => {
              for (const mut of mutations) {
                for (const [nodes, on] of [[mut.addedNodes, true], [mut.removedNodes, false]] as const) {
                  for (const n of Array.from(nodes)) {
                    for (const d of st.resizeDelegates) forDelegateMatches(n, d.target, el => on ? resizeObserve(el, d.options) : resizeUnobserve(el));
                    for (const d of st.intersectionDelegates) forDelegateMatches(n, d.target, el => on ? d.observe(el) : d.unobserve(el));
                  }
                }
              }
              for (const cb of st.moCallbacks) cb(mutations, obs);
            });
            st.observers.push(st.mo);
          }
          const addObserveTarget = (target: Element | ShadowRoot, options: MutationObserverInit) => {
            st.moTargets.set(target, mergeMutationInit(st.moTargets.get(target), options));
          };
          for (const e of mutationObserverSet) {
            st.moCallbacks.add(e.callback);
            if (e.delegate) continue;
            const init = e.options ?? { childList: true };
            if (typeof e.target === 'string') {
              for (const r of resolveDelegateRoots(e.delegateRoot)) r.querySelectorAll(e.target).forEach(el => addObserveTarget(el, init));
              continue;
            }
            addObserveTarget(e.target, init);
          }
          for (const d of [...newResizeDelegates, ...newIntersectionDelegates]) {
            for (const r of resolveDelegateRoots(d.delegateRoot)) addObserveTarget(r, { childList: true, subtree: true });
          }
          // 같은 노드를 다시 observe 하면 옵션만 교체된다 (등록·전달 중복 없음) → 'self' 분과 합쳐진 옵션으로 갱신
          for (const [target, options] of st.moTargets) st.mo.observe(target, options);
        }

        inst.__swc_observers = st.observers;
      };

      const originalConnected = userCallback(proto.connectedCallback);
      proto.connectedCallback = async function () {
        ensureInit(this);
        // 재연결 시 누적 방지 — cycler 내부 리소스 초기화
        const helperHostSet = SwcUtils.getHelperAndHostSet(this as any);
        (this as any).__swc_helperHostSet = helperHostSet;
        const appHost = helperHostSet.$appHost;
        const useSsr = isSSR(this);
        // 연결 처리는 await 를 거친다. 그 사이 떨어지거나 다시 붙으면(disconnect / 새 connect 가 차례 번호를 올리면) 이 연결은 멈춘다 —
        // 안 그러면 떼어진 뒤에 리스너·타이머가 등록돼 새고, 다시 붙은 연결과 겹쳐 두 번씩 돈다.
        // (isConnected 는 보지 않는다 — 직접 호출이나 SSR 처럼 붙어 있지 않아도 라이프사이클은 돌아야 한다)
        const gen = ((this as any).__swc_connectGen = ((this as any).__swc_connectGen ?? 0) + 1);
        const alive = () => (this as any).__swc_connectGen === gen;
        const obsState = newObserverState();
        try {
          if (appHost && typeof (appHost as any)._connected === 'function') {
            await (appHost as any)._connected(this);
            if (!alive()) return;
          } else if (appHost && typeof (appHost as any)) {
            (appHost as any)._connected_safari_and_standby ??= [];
            (appHost as any)._connected_safari_and_standby.push(this);
          }

          const conf = getElementConfig(this);

          // before-connected 라이프사이클 메서드 (@onConnectedBefore)
          for (const m of findAllOnConnectedBeforeMetadata(this)) {
            await (this as any)._invokeLifecycleMethod(m.propertyKey, helperHostSet);
            if (!alive()) return;
          }
          (this as any)._executeSwcScript('swc-on-before-connected', helperHostSet);

          // ── 렌더 (@onConnected / @onConnectedBody*) — elementDefine 책임 ──
          const targetConnectedList = useSsr ? [] : findAllOnConnectedMetadata(constructor);
          const shadowMode = conf?.useShadow || targetConnectedList.find(it => it.options.useShadow)?.options.useShadow;
          if (shadowMode && !this.shadowRoot) {
            const mode = shadowMode === true ? 'open' : shadowMode;
            this.attachShadow({ mode: mode as ShadowRootMode });
          }

          // 자기 자신 대상 mutation/resize 는 렌더 전에 붙여 첫 렌더부터 본다 (shadow root 가 생긴 뒤라 $this 가 맞는 root 를 잡는다)
          await buildObservers(helperHostSet, 'self', obsState, alive);
          if (!alive()) return;

          const stateContext: any = { ...helperHostSet };
          findAllStateMetadata(this).forEach(it => {
            stateContext[it.name] = this[it.propertyKey];
          });

          const shadowChildren: Node[] = [];
          const lightChildren: Node[] = [];

          if (targetConnectedList.length > 0) {
            const toNodes = (value: any): Node[] => {
              if (!value) return [];
              if (typeof value === 'string') {
                const htmlTemplateElement = doc.createElement('template');
                htmlTemplateElement.innerHTML = value;
                return Array.from(htmlTemplateElement.content.childNodes);
              }
              if (Array.isArray(value)) return value;
              return [value];
            };
            // fallback: 비동기 렌더 대기 중에 먼저 보여준다. 결과는 모든 렌더 메서드가 끝난 뒤 한 번에 들어가므로
            // 그때 같이 걷어낸다 (메서드별로 걷으면 다음 메서드를 기다리는 동안 빈 화면이 된다).
            const shownFallbacks: Node[] = [];
            const removeFallbacks = () => shownFallbacks.splice(0).forEach(n => (n as ChildNode).remove());
            for (const meta of targetConnectedList) {
              const useShadowRoot = meta.options.useShadow || conf?.useShadow;
              if (meta.options.fallback) {
                const fb = typeof meta.options.fallback === 'function'
                  ? (meta.options.fallback as any)(helperHostSet)
                  : meta.options.fallback;
                const fallbackNodes = toNodes(fb);
                const parent = useShadowRoot ? this.shadowRoot : this;
                if (fallbackNodes.length && parent) {
                  try {
                    const processed = SwcUtils.projectProcessHtml(this._swcId, fallbackNodes, doc);
                    parent.append(...processed);
                    shownFallbacks.push(...processed);
                  } catch (e) {
                    console.error('[ElementDefine] fallback setting error:', e);
                  }
                }
              }
              let res = await (this as any)._invokeLifecycleMethod(meta.propertyKey, helperHostSet);
              if (!alive()) { removeFallbacks(); return; }
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
            removeFallbacks();
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

          // ── cycler 실행 (렌더 후): 나머지 시클러 onConnected → observer Set 수집 → 같은 옵저버에 덧붙임 ──
          await buildObservers(helperHostSet, 'rest', obsState, alive);
          if (!alive()) return;

          if (originalConnected) await originalConnected.apply(this);
          if (!alive()) return;

          // after-connected 라이프사이클 메서드 (@onConnectedAfter)
          for (const m of findAllOnConnectedAfterMetadata(this)) {
            await (this as any)._invokeLifecycleMethod(m.propertyKey, helperHostSet);
            if (!alive()) return;
          }
          (this as any)._executeSwcScript('swc-on-connected', helperHostSet);
          (this as any)._executeSwcScript('swc-on-after-connected', helperHostSet);
          (this as any).__swc_connected = true;
        } finally {
          // 멈춘 연결은 완료 훅을 부르지 않고, 앱 host 에는 중단만 알린다 (자식 연결 수만 맞추고 재생은 안 함)
          const aborted = !alive();
          if (!aborted) for (const m of findAllLifecycleMetadata(this, ON_CONNECTED_COMPLETED_METADATA_KEY)) await (this as any)._invokeLifecycleMethod(m.propertyKey, helperHostSet);
          if (appHost && typeof (appHost as any)._connectedDone === 'function') {
            await (appHost as any)._connectedDone(this, { aborted });
          }
        }
      };

      /////////////////////////////////////////////////
      // disconnectedCallback
      ////////////////////////////////////////////////
      const originalDisconnected = userCallback(proto.disconnectedCallback);
      proto.disconnectedCallback = function () {
        (this as any).__swc_connectGen = ((this as any).__swc_connectGen ?? 0) + 1; // 진행 중인 연결은 멈춘다
        // 떨어진 뒤라 DOM 으로는 $appHost 를 다시 못 찾는다 → connect 때 저장한 이 인스턴스의 값
        const helperHostSet = connectedHelperHostSet(this);
        const appHost = helperHostSet.$appHost;
        if (appHost && typeof (appHost as any)._disconnected === 'function') {
          (appHost as any)._disconnected(this);
        }

        (this as any)._executeSwcScript('swc-on-before-disconnected', helperHostSet);
        for (const m of findAllLifecycleMetadata(this, ON_BEFORE_DISCONNECTED_METADATA_KEY)) (this as any)._invokeLifecycleMethod(m.propertyKey, helperHostSet);
        for (const c of cyclers) c.onDisconnected?.(helperHostSet);

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

      const originalAdopted = userCallback(proto.adoptedCallback);
      proto.adoptedCallback = function () {
        const hostSet = SwcUtils.getHostSet(this as any);
        (this as any)._executeSwcScript('swc-on-before-adopted', hostSet);
        for (const m of findAllLifecycleMetadata(this, ON_BEFORE_ADOPTED_METADATA_KEY)) (this as any)._invokeLifecycleMethod(m.propertyKey, hostSet);
        for (const c of cyclers) c.onAdopted?.(connectedHelperHostSet(this));

        if (originalAdopted) originalAdopted.apply(this);

        for (const m of findAllLifecycleMetadata(this, ON_AFTER_ADOPTED_METADATA_KEY)) (this as any)._invokeLifecycleMethod(m.propertyKey, hostSet);
        (this as any)._executeSwcScript('swc-on-adopted', hostSet);
        (this as any)._executeSwcScript('swc-on-after-adopted', hostSet);
      };

      const originalAttributeChanged = userCallback(proto.attributeChangedCallback);
      proto.attributeChangedCallback = function (name: string, old: string | null, newVal: string | null) {
        if (originalAttributeChanged) originalAttributeChanged.apply(this, [name, old, newVal]);

        // attributeChangedCallback 은 connected 이전에도 호출될 수 있으므로
        // 클로저의 helperHostSet(null 가능) 대신 이 시점에 새로 계산한다.
        const helperAndHostSet = SwcUtils.getHelperAndHostSet(this as any);

        // Process expression directive before passing to handlers
        let processedVal: any = newVal;
        if (newVal !== null) {
          const ae = new ActionExpression(newVal);
          const expr = ae.getFirstExpression('callReturn');
          if (expr) {
            const win = SwcUtils.resolveWindow(this);
            const exprHelperAndHostSet = SwcUtils.getHelperAndHostSet(this as any);
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

      // 이 클래스를 다시 상속해 elementDefine 하면 자식이 이 래퍼 대신 원래 사용자 함수를 부르도록 기억해 둔다
      proto.connectedCallback[SWC_ORIGINAL_CALLBACK] = originalConnected;
      proto.disconnectedCallback[SWC_ORIGINAL_CALLBACK] = originalDisconnected;
      proto.adoptedCallback[SWC_ORIGINAL_CALLBACK] = originalAdopted;
      proto.attributeChangedCallback[SWC_ORIGINAL_CALLBACK] = originalAttributeChanged;

      ReflectUtils.defineMetadata(ELEMENT_CONFIG_KEY, metadata, constructor);
      const registry = metadata.customElementRegistry || (win as any)?.customElements;
      if (registry && !registry.get(metadata.name)) {
        registry.define(metadata.name, constructor as any, metadata.extends ? { extends: metadata.extends } : undefined);
      }
      return constructor;
    };
