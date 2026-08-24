import {ActionExpression, FunctionUtils, ReflectUtils, Subject} from '@dooboostore/core';
import {debounceTime, distinctUntilChanged, throttleTime} from '@dooboostore/core/message/operators';
import {getAddEventListenerMetadata, type AddEventListenerMetadata} from './addEventListener';
import {getMutationObserverMetadata} from './mutationObserver';
import type {MutationObserverBaseOptions, MutationObserverMetadata} from './mutationObserver';
import {getResizeObserverMetadata} from './resizeObserver';
import type {ResizeObserverMetadata} from './resizeObserver';
import {findAllLifecycleMetadata, findAllOnConnectedAfterMetadata, findAllOnConnectedBeforeMetadata, findAllOnConnectedMetadata, ON_AFTER_ADOPTED_METADATA_KEY, ON_AFTER_DISCONNECTED_METADATA_KEY, ON_BEFORE_ADOPTED_METADATA_KEY, ON_BEFORE_DISCONNECTED_METADATA_KEY, ON_CONNECTED_COMPLETED_METADATA_KEY, ON_INITIALIZE_METADATA_KEY} from './lifecycles';
import {getEmitCustomEventMetadataList} from './emitCustomEvent';
import {convertAttributeValue, findAllAttributeChangedMetadata} from './changedAttribute';
import {findAllAttributeApplyMetadata, findAllAttributeMetadata, getAttributeValue} from './applyAttribute';
import {getQueryMetadata} from './query';
import {getQueryAllMetadata} from './queryAll';
import {SwcUtils} from '../utils/Utils';
import {DOM_EVENT_NAMES, HTML_TAG_ENTRIES} from '../config/config';
import {SituationTypeContainer, SituationTypeContainers} from '@dooboostore/simple-boot/decorators/inject/Inject';
import {HelperHostSet, HostSet, InjectSituationType} from '../types';
import {ConvertUtils, ElementApply} from '@dooboostore/core-web';
import {isSSR} from "../elements/SwcAppMixin";
import {findAllStateMetadata} from "./state";
import {findAllPropertyMetadata} from "./applyProperty";

// --- Core Interfaces & Types ---

export const ELEMENT_CONFIG_KEY = Symbol.for('simple-web-component:element-config');

/** 바인딩된 이벤트 리스너 한 건 */
export interface BoundListener {
  target: EventTarget;
  type: string;
  handler: EventListener;
  options: AddEventListenerOptions;
  onRemoves?: Array<{ fn: (target: EventTarget, optionValue: unknown) => void; opts: unknown }>;
  subscription?: { unsubscribe: () => void };
  meta?: AddEventListenerMetadata<Event>;
}

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

      const emitCustomEventList = getEmitCustomEventMetadataList(constructor) || [];
      const emitHostCustomEventList = emitCustomEventList.filter(meta => meta.selector === '$this' || meta.selector === '');
      const addEventListenerList = getAddEventListenerMetadata(constructor) || [];
      const mutationObserverList = getMutationObserverMetadata(constructor) || [];
      const resizeObserverList = getResizeObserverMetadata(constructor) || [];
      const attrChangeMap = findAllAttributeChangedMetadata(constructor);
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
      const mergedObservedAttributes = [...new Set([...(metadata.observedAttributes ?? []), ...originalStaticObservedAttributes, ...attrChangeMap.keys(), ...attributeApplyNames, ...hostAttributes, ...emitHostCustomEventList.map(it => (it.options as any).attributeName).filter(Boolean), ...swcLifecycleAttributes, ...swcOnEvents])];
      // const connectedInnerHtmlList = getOnConnectedInnerHtmlMetadata(constructor) || [];

      const proto = constructor.prototype;
      setupPrototype(proto, win);

      // 값을 기대하지않는다.
      let helperHostSet: HelperHostSet | null = null;
      // 이벤트 리스너 / MutationObserver / ResizeObserver 인스턴스 (클로저 변수 — connected/disconnected 공유)
      let boundListeners: BoundListener[] = [];
      let shadowMutationObserver: MutationObserver | null = null;
      let lightMutationObserver: MutationObserver | null = null;
      let resizeObserver: ResizeObserver | null = null;
      // 메타별 removeObserver 콜백 목록 (disconnected 시 호출)
      let removeObserverCallbacks: Array<{ fn: (target: Element, optionValue: unknown) => void; target: any; opts: unknown }> = [];
      const originalConnected = proto.connectedCallback;
      proto.connectedCallback = async function () {
        ensureInit(this);
        // 재연결 시 누적 방지 — 클로저 변수 리셋
        boundListeners = [];
        removeObserverCallbacks = [];
        // connected 됐을시 최신화
        helperHostSet = SwcUtils.getHelperAndHostSet(win, this as any);
        const appHost = helperHostSet.$appHost;
        const useSsr = isSSR(this);
        // console.log('isSsr', useSsr, this);
        // console.log('----helperHostSet--->', this, helperHostSet, useSsr)
        // let connectedApp: SwcAppInterface |undefined;
        try {
          if (appHost && typeof (appHost as any)._connected === 'function') {
            await (appHost as any)._connected(this);
          } else if (appHost && typeof (appHost as any)) {
            (appHost as any)._connected_safari_and_standby ??= [];
            (appHost as any)._connected_safari_and_standby.push(this);
          }

          // const hostSet = SwcUtils.getHostSet(this as any);
          const conf = getElementConfig(this);
          const currentWin = (this as any)._resolveWindow(conf);

          const bMethods = findAllOnConnectedBeforeMetadata(this); //.filter(it => useSsr ? !it.options.ssrFirst : true);
          // console.log('beforeConnected', bMethods)
          for (const m of bMethods) await (this as any)._invokeLifecycleMethod(m.propertyKey, helperHostSet);
          (this as any)._executeSwcScript('swc-on-before-connected', helperHostSet);

          // console.log('vvvvvvvvvvvvvvvu-seSsr-vvvvvvvvvv>', useSsr, this.tagName, this.getAttribute('seq'))
          //   // ssr 처리라서 이미 내려준거그대로 상요하면된다 따라서 호출안한다
          // const targetConnectedList = findAllOnConnectedMetadata(constructor).filter(it => useSsr ? !it.options.ssrFirst : true);
          const targetConnectedList = useSsr ? [] : findAllOnConnectedMetadata(constructor);
          const shadowMode = conf?.useShadow || targetConnectedList.find(it => it.options.useShadow)?.options.useShadow;
          // console.log('--------->', this.tagName, shadowMode && !this.shadowRoot)
          if (shadowMode && !this.shadowRoot) {
            const mode = shadowMode === true ? 'open' : shadowMode;
            console.log('tagName=', this.tagName, 'mode', mode, this.shadowRoot);
            // if (this.tagName!=='INDEX-ROUTER') {
            this.attachShadow({ mode: mode as ShadowRootMode });
            // }
          }

          const stateContext: any = { ...helperHostSet };
          findAllStateMetadata(this).forEach(it => {
            stateContext[it.name] = this[it.propertyKey];
          });

          const shadowChildren: Node[] = [];
          const lightChildren: Node[] = [];

          console.log('targetConnectList', this.tagName, targetConnectedList.length);
          if (targetConnectedList.length > 0) {
            // let sContent = '',
            //   lContent = '';
            for (const meta of targetConnectedList) {
              // const res = (this as any)[meta.propertyKey]();
              let res = await (this as any)._invokeLifecycleMethod(meta.propertyKey, helperHostSet);
              // res = SwcUtils.projectProcessHtml(this, res);
              if (typeof res === 'string') {
                const htmlTemplateElement = doc.createElement('template');
                htmlTemplateElement.innerHTML = res; //SwcUtils.projectProcessHtml(this._swcId, res, doc);
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

          // Separate delegate and non-delegate listeners
          const delegateListeners: typeof addEventListenerList = [];
          const mutationDelegateListeners: typeof addEventListenerList = [];
          const nonDelegateListeners: typeof addEventListenerList = [];

          const isSpecialSelector = (sel: any) => sel === '$window' || sel === '$document' || sel === '$host' || sel === '$appHost' || sel === '$firstHost' || sel === '$lastHost' || sel === '$firstAppHost' || sel === '$lastAppHost' || sel === '$hosts' || sel === '$appHosts' || sel === '$this' || sel === '';

          addEventListenerList.forEach(meta => {
            // Function-based selectors cannot be used with delegate listeners
            const isStringSelector = typeof meta.selector === 'string';
            const delegateMode = meta.options.delegate;
            if (delegateMode && isStringSelector && !isSpecialSelector(meta.selector)) {
              if (delegateMode === 'mutation') {
                mutationDelegateListeners.push(meta);
              } else {
                delegateListeners.push(meta);
              }
            } else {
              nonDelegateListeners.push(meta);
            }
          });

          const delegatesByTypeAndRoot = new Map<string, any[]>();
          delegateListeners.forEach(meta => {
            const r = meta.options.root || 'auto';
            const rootKey = `${meta.type}:${r}`;
            if (!delegatesByTypeAndRoot.has(rootKey)) {
              delegatesByTypeAndRoot.set(rootKey, []);
            }
            delegatesByTypeAndRoot.get(rootKey)!.push(meta);
          });

          delegatesByTypeAndRoot.forEach((metaList, typeRootKey) => {
            const [type, rStr] = typeRootKey.split(':');
            const r = rStr === 'auto' ? 'auto' : rStr;
            const opts = { capture: metaList[0].options.capture, once: metaList[0].options.once, passive: metaList[0].options.passive };

            const bindRoots: (HTMLElement | ShadowRoot)[] = [];
            if (r === 'auto') bindRoots.push(this.shadowRoot || (this as any));
            else if (r === 'light') bindRoots.push(this as any);
            else if (r === 'shadow' && this.shadowRoot) bindRoots.push(this.shadowRoot);
            else if (r === 'all') {
              bindRoots.push(this as any);
              if (this.shadowRoot) bindRoots.push(this.shadowRoot);
            }

            bindRoots.forEach(br => {
              const sortedMetaList = [...metaList].sort((a, b) => {
                const aStop = a.options.stopPropagation ? 1 : 0;
                const bStop = b.options.stopPropagation ? 1 : 0;
                return bStop - aStop;
              });

              const unifiedHandler = async (event: Event) => {
                for (const meta of sortedMetaList) {
                  const { selector, options } = meta;
                  const matchedEl = (event.target as HTMLElement)?.closest(selector);
                  if (matchedEl && (br as any).contains(matchedEl)) {
                    // Apply filter if specified
                    if (options.filter) {
                      const helper = SwcUtils.getHelperAndHostSet(currentWin, matchedEl);
                      if (!options.filter(event, helper)) {
                        continue; // Skip this listener if filter returns false
                      }
                    }
                    if (options.stopPropagation) event.stopPropagation();
                    if (options.stopImmediatePropagation) event.stopImmediatePropagation();
                    if (options.preventDefault) event.preventDefault();
                    const currentHostSet = SwcUtils.getHostSet(this as any);
                    const args = { event, ...currentHostSet, $el: matchedEl, $root: br };
                    await (this as any)[meta.propertyKey](event, { ...currentHostSet, $matchedElement: matchedEl }, args);
                    if ((event as any).cancelBubble) break;
                  }
                }
              };
              br.addEventListener(type, unifiedHandler, opts);
              // 각 메타의 removeListener를 메타 옵션과 함께 보관 (delegate 그룹은 여러 메타 가능)
              const onRemoves: Array<{ fn: (target: Element, optionValue: any) => void; opts: any }> = [];
              for (const m of sortedMetaList) {
                if (m.options.removeListener) {
                  onRemoves.push({ fn: m.options.removeListener, opts: m.options });
                }
              }
              boundListeners.push({ target: br, type, handler: unifiedHandler, options: opts, onRemoves });
            });
          });

          // ─── 직접 바인딩 헬퍼 (non-delegate + delegate:'mutation' 공용) ───
          const bindDirect = (target: EventTarget, meta: AddEventListenerMetadata) => {
            const { type, options } = meta;
            const opts = { capture: options.capture, once: options.once, passive: options.passive };

            const handler = async (event: Event) => {
              // Apply filter if specified
              if (options.filter) {
                const helper = SwcUtils.getHelperAndHostSet(currentWin, target as HTMLElement);
                if (!options.filter(event, { currentThis: this, helper })) {
                  return; // Skip if filter returns false
                }
              }
              if (options.stopPropagation) event.stopPropagation();
              if (options.stopImmediatePropagation) event.stopImmediatePropagation();
              if (options.preventDefault) event.preventDefault();
              const currentHostSet = SwcUtils.getHostSet(this as any);
              const args = { event, ...currentHostSet, $el: target, $root: target };
              await (this as any)[meta.propertyKey](event, { currentHostSet, $matchedElement: event.currentTarget }, args);
            };

            // Create event stream with Observable-based operators
            const eventSubject = new Subject<Event>();
            let eventStream = eventSubject as any;

            if (options.debounceTime !== undefined && options.debounceTime > 0) {
              eventStream = eventStream.pipe(debounceTime(options.debounceTime));
            }
            if (options.throttleTime !== undefined && options.throttleTime > 0) {
              eventStream = eventStream.pipe(throttleTime(options.throttleTime));
            }
            if (options.distinctUntilChanged !== undefined && options.distinctUntilChanged !== false) {
              if (typeof options.distinctUntilChanged === 'function') {
                eventStream = eventStream.pipe(distinctUntilChanged(options.distinctUntilChanged));
              } else {
                eventStream = eventStream.pipe(distinctUntilChanged());
              }
            }

            const subscription = eventStream.subscribe({
              next: (event: Event) => {
                handler(event).catch((err: any) => console.error('Event handler error:', err));
              },
              error: (err: any) => console.error('Event stream error:', err)
            });

            // Create wrapper handler that emits to the subject
            const wrappedHandler = (event: Event) => {
              eventSubject.next(event);
            };

            target.addEventListener(type, wrappedHandler, opts);
            const onRemoves: Array<{ fn: (target: Element, optionValue: any) => void; opts: any }> = options.removeListener ? [{ fn: options.removeListener, opts: options }] : [];
            boundListeners.push({ target, type, handler: wrappedHandler, options: opts, subscription, onRemoves, meta });
          };

          const unbindDirect = (target: EventTarget, meta: AddEventListenerMetadata) => {
            for (let i = boundListeners.length - 1; i >= 0; i--) {
              const l = boundListeners[i];
              if (l.target === target && l.type === meta.type && l.meta === meta) {
                try {
                  l.target.removeEventListener(l.type, l.handler, l.options);
                  l.subscription?.unsubscribe?.();
                } catch (e) {
                  console.error('[SWC] unbindDirect error:', e);
                }
                // 사용자 정의 정리 콜백 (removeListener) — 요소 unmount 시에도 호출
                if (Array.isArray(l.onRemoves)) {
                  for (const r of l.onRemoves) {
                    try {
                      r.fn(l.target, r.opts);
                    } catch (e) {
                      console.error('[SWC] unbindDirect removeListener error:', e);
                    }
                  }
                }
                boundListeners.splice(i, 1);
              }
            }
          };

          // delegate:'mutation' 이 바인딩한 요소 추적 (중복 바인딩 방지)
          const eventBoundSets = new Map<AddEventListenerMetadata, WeakSet<Element>>();

          nonDelegateListeners.forEach(meta => {
            const { selector, options } = meta;
            const bindTargets: EventTarget[] = [];
            const r = options.root || 'auto';

            // Resolve selector if it's a function
            let resolvedSelector: string | null = null;
            if (typeof selector === 'function') {
              const hostSet = SwcUtils.getHelperAndHostSet(currentWin, this);
              const result = selector(this, hostSet);
              if (typeof result === 'string') {
                resolvedSelector = result;
              } else if (result instanceof currentWin.Element) {
                bindTargets.push(result as EventTarget);
              } else if (result instanceof currentWin.NodeList) {
                bindTargets.push(...Array.from(result as EventTarget[]));
              } else if (Array.isArray(result)) {
                bindTargets.push(...(result as EventTarget[]));
              }
            } else {
              resolvedSelector = selector;
            }

            const applyRootOption = (target: any) => {
              if (!target) return;
              if (r === 'auto') {
                bindTargets.push(target.shadowRoot || target);
              } else {
                if (r === 'light' || r === 'all') bindTargets.push(target);
                if ((r === 'shadow' || r === 'all') && target.shadowRoot) bindTargets.push(target.shadowRoot);
              }
            };

            if (resolvedSelector) {
              if (resolvedSelector === '$window') bindTargets.push(currentWin);
              else if (resolvedSelector === '$document') bindTargets.push(currentWin.document);
              else if (resolvedSelector === '$host') applyRootOption(helperHostSet.$host);
              else if (resolvedSelector === '$parentHost') applyRootOption(helperHostSet.$parentHost);
              else if (resolvedSelector === '$appHost') applyRootOption(helperHostSet.$appHost);
              else if (resolvedSelector === '$firstHost') applyRootOption(helperHostSet.$firstHost);
              else if (resolvedSelector === '$lastHost') applyRootOption(helperHostSet.$lastHost);
              else if (resolvedSelector === '$firstAppHost') applyRootOption(helperHostSet.$firstAppHost);
              else if (resolvedSelector === '$lastAppHost') applyRootOption(helperHostSet.$lastAppHost);
              else if (resolvedSelector === '$hosts') helperHostSet.$hosts.forEach(applyRootOption);
              else if (resolvedSelector === '$appHosts') helperHostSet.$appHosts.forEach(applyRootOption);
              else if (resolvedSelector === '$this' || !resolvedSelector) applyRootOption(this);
              else {
                const searchRoots: (HTMLElement | ShadowRoot)[] = [];
                if (r === 'auto') searchRoots.push(this.shadowRoot || (this as any));
                else if (r === 'light') searchRoots.push(this as any);
                else if (r === 'shadow' && this.shadowRoot) searchRoots.push(this.shadowRoot);
                else if (r === 'all') {
                  searchRoots.push(this as any);
                  if (this.shadowRoot) searchRoots.push(this.shadowRoot);
                }

                searchRoots.forEach(sr => {
                  sr.querySelectorAll(resolvedSelector).forEach(el => bindTargets.push(el));
                });
              }
            }

            bindTargets.forEach(t => bindDirect(t, meta));
          });

          // ─── MutationObserver / ResizeObserver 처리 ───
          // shadow/light 루트별로 각각 observer를 두고, 해당 루트에 데코레이터 메타가 있으면 observer를 생성한다.
          // 두 루트 모두 있으면 observer 2개, 한쪽만 있으면 1개, 없으면 0개.
          shadowMutationObserver = null;
          lightMutationObserver = null;
          resizeObserver = null;

          // ResizeObserver: @resizeObserver 데코레이터가 하나라도 있으면 observer 하나 생성 (shadow 있으면 shadow 루트, 없으면 light)
          if (resizeObserverList.length > 0) {
            const root: HTMLElement | ShadowRoot = this.shadowRoot || (this as any);
            resizeObserver = new ResizeObserver((entries: ResizeObserverEntry[], obs: ResizeObserver) => {
              for (const m of resizeObserverList) {
                let matchedEls: HTMLElement[] = [];
                if (m.options.delegate && typeof m.selector === 'string') {
                  const isThis = m.selector === '$this' || m.selector === '';
                  const matchesSel = (node: any): boolean => {
                    if (!node || node.nodeType !== 1) return false;
                    if (isThis) return true;
                    const el = node as HTMLElement;
                    return el.matches?.(m.selector as string) || !!el.closest?.(m.selector as string);
                  };
                  matchedEls = entries.map(e => e.target as HTMLElement).filter(matchesSel);
                } else {
                  matchedEls = entries.map(e => e.target as HTMLElement).filter(t => t && t.nodeType === 1);
                }
                if (matchedEls.length === 0) continue;
                if (m.options.filter) {
                  const helper = SwcUtils.getHelperAndHostSet(currentWin, this);
                  if (!m.options.filter(matchedEls, { currentThis: this, helper })) continue;
                }
                const hostSet = SwcUtils.getHostSet(this as any);
                (this as any)[m.propertyKey](matchedEls, entries, obs, { ...hostSet, $root: root });
              }
            });
            // resizeObserver 메타별 removeObserver 수집
            for (const m of resizeObserverList) {
              if (m.options.removeObserver) {
                removeObserverCallbacks.push({ fn: m.options.removeObserver, target: root, opts: m.options });
              }
            }
          }
          // MutationObserver: shadow/light 루트별 그룹핑
          const shadowMetas = mutationObserverList.filter(m => {
            const r = m.options.root || 'auto';
            return this.shadowRoot && (r === 'shadow' || r === 'all' || r === 'auto');
          });
          const lightMetas = mutationObserverList.filter(m => {
            const r = m.options.root || 'auto';
            return r === 'light' || r === 'all' || (!this.shadowRoot && r === 'auto');
          });

          const setupMutationObserver = (root: HTMLElement | ShadowRoot, metas: MutationObserverMetadata[], resizeDelegates: ResizeObserverMetadata[] = [], eventDelegates: AddEventListenerMetadata[] = []): MutationObserver | null => {
            // 처리할 메타가 하나도 없으면 observer 생성 안 함 (루트당 1개로 공유)
            if (metas.length === 0 && resizeDelegates.length === 0 && eventDelegates.length === 0) return null;

            // 사용자가 입력한 옵션 그대로 (아무것도 안 주면 childList 기본)
            const initFrom = (o: MutationObserverBaseOptions): MutationObserverInit => {
              const init: MutationObserverInit = {
                childList: o.childList,
                attributes: o.attributes,
                characterData: o.characterData,
                subtree: o.subtree,
                attributeFilter: o.attributeFilter,
                attributeOldValue: o.attributeOldValue,
                characterDataOldValue: o.characterDataOldValue
              };
              // MutationObserver는 최소 1개는 true여야 함
              if (!init.childList && !init.attributes && !init.characterData) init.childList = true;
              return init;
            };

            const observer = new MutationObserver((mutations: MutationRecord[], obs: MutationObserver) => {
              for (const meta of metas) {
                const { selector, options } = meta;
                let matchedEls: HTMLElement[] = [];

                if (options.delegate && typeof selector === 'string') {
                  const isThis = selector === '$this' || selector === '';
                  const matchesSel = (node: any): boolean => {
                    if (!node || node.nodeType !== 1) return false;
                    if (isThis) return true;
                    const el = node as HTMLElement;
                    return el.matches?.(selector as string) || !!el.closest?.(selector as string);
                  };
                  matchedEls = mutations.flatMap(m => {
                    const els: HTMLElement[] = [];
                    if (matchesSel(m.target)) els.push(m.target as HTMLElement);
                    Array.from(m.addedNodes || [])
                      .filter(matchesSel)
                      .forEach(n => els.push(n as HTMLElement));
                    Array.from(m.removedNodes || [])
                      .filter(matchesSel)
                      .forEach(n => els.push(n as HTMLElement));
                    return els;
                  });
                } else if (typeof selector === 'string') {
                  // non-delegate: observe 대상이 매칭 요소들이므로 그들의 mutation 대상 + 추가/제거 노드
                  const isThis = selector === '$this' || selector === '';
                  const matchesSel = (node: any): boolean => {
                    if (!node || node.nodeType !== 1) return false;
                    if (isThis) return true;
                    return (node as HTMLElement).matches?.(selector as string);
                  };
                  matchedEls = mutations.flatMap(m => {
                    const els: HTMLElement[] = [];
                    if (matchesSel(m.target)) els.push(m.target as HTMLElement);
                    Array.from(m.addedNodes || [])
                      .filter(matchesSel)
                      .forEach(n => els.push(n as HTMLElement));
                    Array.from(m.removedNodes || [])
                      .filter(matchesSel)
                      .forEach(n => els.push(n as HTMLElement));
                    return els;
                  });
                } else {
                  matchedEls = mutations.map(m => m.target as HTMLElement).filter(t => t && t.nodeType === 1);
                }

                if (matchedEls.length === 0) continue;
                if (options.filter) {
                  const helper = SwcUtils.getHelperAndHostSet(currentWin, this);
                  if (!options.filter(matchedEls, { currentThis: this, helper })) continue;
                }
                const hostSet = SwcUtils.getHostSet(this as any);
                // 1번째: 매치된 element 배열, 2번째: 원본 mutations, 3번째: observer
                (this as any)[meta.propertyKey](matchedEls, mutations, obs, { ...hostSet, $root: root });
              }

              // ─── resizeObserver delegate 동적 추적 ───
              // 추가/삭제된 요소가 delegate 셀렉터와 매칭되면 resizeObserver에 observe/unobserve
              if (resizeDelegates.length > 0 && resizeObserver) {
                const handle = (n: Node, observe: boolean) => {
                  if (n.nodeType !== 1) return;
                  const el = n as HTMLElement;
                  for (const m of resizeDelegates) {
                    if (typeof m.selector !== 'string') continue;
                    const isThis = m.selector === '$this' || m.selector === '';
                    const matchesSel = (node: any): boolean => {
                      if (!node || node.nodeType !== 1) return false;
                      if (isThis) return true;
                      const e = node as HTMLElement;
                      return e.matches?.(m.selector as string) || !!e.closest?.(m.selector as string);
                    };
                    if (matchesSel(el)) {
                      if (observe) resizeObserver.observe(el, m.options.box ? { box: m.options.box } : undefined);
                      else resizeObserver.unobserve(el);
                    } else if (!isThis) {
                      el.querySelectorAll(m.selector).forEach(sub => {
                        if (observe) resizeObserver.observe(sub as HTMLElement, m.options.box ? { box: m.options.box } : undefined);
                        else resizeObserver.unobserve(sub as HTMLElement);
                      });
                    }
                  }
                };
                for (const m of mutations) {
                  Array.from(m.addedNodes || []).forEach(n => handle(n, true));
                  Array.from(m.removedNodes || []).forEach(n => handle(n, false));
                }
              }

              // ─── addEventListener(delegate:'mutation') 동적 바인딩/해제 ───
              // 비버블링 이벤트(focus/blur/... 등)는 closest 델리게이션으로 안 잡히므로,
              // 매칭 요소에 직접 리스너를 바인딩하고 추가/제거를 MutationObserver로 추적한다.
              if (eventDelegates.length > 0) {
                for (const m of eventDelegates) {
                  let boundSet = eventBoundSets.get(m);
                  if (!boundSet) {
                    boundSet = new WeakSet<Element>();
                    eventBoundSets.set(m, boundSet);
                  }
                  const isThis = m.selector === '$this' || m.selector === '';
                  const matchesSel = (node: any): boolean => {
                    if (!node || node.nodeType !== 1) return false;
                    if (isThis) return true;
                    return typeof m.selector === 'string' && (node as HTMLElement).matches?.(m.selector as string);
                  };

                  const bindEl = (el: Element) => {
                    if (!boundSet!.has(el)) {
                      bindDirect(el, m);
                      boundSet!.add(el);
                    }
                  };
                  const unbindEl = (el: Element) => {
                    if (boundSet!.has(el)) {
                      unbindDirect(el, m);
                      boundSet!.delete(el);
                    }
                  };

                  for (const mut of mutations) {
                    Array.from(mut.addedNodes || []).forEach(n => {
                      if (n.nodeType !== 1) return;
                      if (matchesSel(n)) {
                        bindEl(n as Element);
                      } else if (!isThis && typeof m.selector === 'string') {
                        (n as Element).querySelectorAll?.(m.selector as string).forEach(bindEl);
                      }
                    });
                    Array.from(mut.removedNodes || []).forEach(n => {
                      if (n.nodeType !== 1) return;
                      const el = n as Element;
                      if (matchesSel(el)) {
                        unbindEl(el);
                      } else if (!isThis && typeof m.selector === 'string') {
                        el.querySelectorAll?.(m.selector as string).forEach(unbindEl);
                      }
                    });
                  }
                }
              }
            });

            // delegate 메타(mutation, resize, addEventListener:'mutation')가 하나라도 있으면 → 루트에 subtree observe 1개로 전부 감지 (콜백에서 메타별 매칭 처리)
            const hasDelegate = metas.some(m => m.options.delegate) || resizeDelegates.some(m => m.options.delegate) || eventDelegates.length > 0;
            if (hasDelegate) {
              observer.observe(root, { childList: true, subtree: true });
            }

            // non-delegate 메타: 셀렉터 매칭 요소들을 사용자 옵션 그대로 observe
            const nonDelegateMetas = metas.filter(m => !m.options.delegate);
            for (const m of nonDelegateMetas) {
              const { selector, options } = m;
              const mInit = initFrom(options);
              if (typeof selector === 'string') {
                if (selector === '$this' || selector === '') {
                  observer.observe(root, mInit);
                } else {
                  root.querySelectorAll(selector).forEach(el => observer.observe(el as HTMLElement, mInit));
                }
              } else if (typeof selector === 'function') {
                // 함수 셀렉터는 루트 관찰로 대체 (매칭 평가 불가)
                observer.observe(root, mInit);
              }
            }

            // ─── addEventListener(delegate:'mutation') 초기 바인딩 (connect 시점에 이미 존재하는 요소) ───
            for (const m of eventDelegates) {
              let boundSet = eventBoundSets.get(m);
              if (!boundSet) {
                boundSet = new WeakSet<Element>();
                eventBoundSets.set(m, boundSet);
              }
              if (typeof m.selector !== 'string') continue;
              if (m.selector === '$this' || m.selector === '') {
                bindDirect(root as EventTarget, m);
                boundSet.add(root as Element);
              } else {
                root.querySelectorAll(m.selector).forEach(el => {
                  if (!boundSet.has(el)) {
                    bindDirect(el, m);
                    boundSet.add(el);
                  }
                });
              }
            }

            return observer;
          };

          // resizeObserver delegate 메타도 루트별로 필터해서 넘김
          const shadowResizeDelegateMetas = resizeObserverList.filter(m => {
            if (!m.options.delegate) return false;
            const r = m.options.root || 'auto';
            return this.shadowRoot && (r === 'shadow' || r === 'all' || r === 'auto');
          });
          const lightResizeDelegateMetas = resizeObserverList.filter(m => {
            if (!m.options.delegate) return false;
            const r = m.options.root || 'auto';
            return r === 'light' || r === 'all' || (!this.shadowRoot && r === 'auto');
          });

          // addEventListener(delegate:'mutation') 메타도 루트별로 필터해서 같은 observer에 넘김
          const shadowEventDelegateMetas = mutationDelegateListeners.filter(m => {
            const r = m.options.root || 'auto';
            return this.shadowRoot && (r === 'shadow' || r === 'all' || r === 'auto');
          });
          const lightEventDelegateMetas = mutationDelegateListeners.filter(m => {
            const r = m.options.root || 'auto';
            return r === 'light' || r === 'all' || (!this.shadowRoot && r === 'auto');
          });

          if (this.shadowRoot) shadowMutationObserver = setupMutationObserver(this.shadowRoot, shadowMetas, shadowResizeDelegateMetas, shadowEventDelegateMetas);
          lightMutationObserver = setupMutationObserver(this as any, lightMetas, lightResizeDelegateMetas, lightEventDelegateMetas);

          // mutationObserver 메타별 removeObserver 수집
          for (const m of mutationObserverList) {
            if (m.options.removeObserver) {
              const rootForM = this.shadowRoot && (m.options.root === 'shadow' || m.options.root === 'all' || (m.options.root === 'auto' && this.shadowRoot)) ? this.shadowRoot : (this as any);
              removeObserverCallbacks.push({ fn: m.options.removeObserver, target: rootForM, opts: m.options });
            }
          }

          if (originalConnected) await originalConnected.apply(this);

          const aMethods = findAllOnConnectedAfterMetadata(this); //.filter(it => { return useSsr ? !it.options.ssrFirst : true; });
          // console.log('afterConnected', this.tagName, aMethods,  getOnConnectedAfterMetadata(this))
          for (const m of aMethods) await (this as any)._invokeLifecycleMethod(m.propertyKey, helperHostSet);
          (this as any)._executeSwcScript('swc-on-connected', helperHostSet);
          (this as any)._executeSwcScript('swc-on-after-connected', helperHostSet);
          (this as any).__swc_connected = true;

          // Trigger @changedAttributeThis with while: 'connected'
          for (let [name, metaList] of Array.from(attrChangeMap)) {
            for (const meta of metaList) {
              if (meta.options.while === 'connected') {
                const val = getAttributeValue(this, name, { type: meta.options.type });
                if (val !== null) {
                  await (this as any)[meta.propertyKey](val, null, name, helperHostSet);
                }
              }
            }
          }
        } finally {
          for (let m of findAllLifecycleMetadata(this, ON_CONNECTED_COMPLETED_METADATA_KEY)) {
            await (this as any)._invokeLifecycleMethod(m.propertyKey, helperHostSet);
          }
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
        // const helperHostSet = SwcUtils.getHelperAndHostSet(win, this as any);
        // Remove from appHost LAST when disconnected
        // console.log('disconnnnnnnnnnnnnnnnnnn', helperHostSet, this)
        const appHost = helperHostSet.$appHost;
        if (appHost && typeof (appHost as any)._disconnected === 'function') {
          (appHost as any)._disconnected(this);
        }

        (this as any)._executeSwcScript('swc-on-before-disconnected', helperHostSet);
        const bMethods = findAllLifecycleMetadata(this, ON_BEFORE_DISCONNECTED_METADATA_KEY);
        for (const m of bMethods) (this as any)._invokeLifecycleMethod(m.propertyKey, helperHostSet);
        // event listener 정리
        if (boundListeners.length > 0) {
          boundListeners.forEach((l: BoundListener) => {
            l.target.removeEventListener(l.type, l.handler, l.options);
            // Cleanup Observable subscription if present
            if (l.subscription && typeof l.subscription.unsubscribe === 'function') {
              l.subscription.unsubscribe();
            }
            // 사용자 정의 정리 콜백 호출
            if (Array.isArray(l.onRemoves)) {
              for (const r of l.onRemoves) {
                try {
                  r.fn(l.target, r.opts);
                } catch (e) {
                  console.error('[SWC] removeListener error:', e);
                }
              }
            }
          });
          boundListeners = [];
        }

        // MutationObserver / ResizeObserver 정리
        const _obs: Array<MutationObserver | ResizeObserver | null> = [shadowMutationObserver, lightMutationObserver, resizeObserver];
        for (const o of _obs) {
          try {
            (o as any)?.disconnect?.();
          } catch (e) {
            console.error('[SWC] observer disconnect error:', e);
          }
        }
        shadowMutationObserver = null;
        lightMutationObserver = null;
        resizeObserver = null;

        // 메타별 removeObserver 콜백 호출
        for (const cb of removeObserverCallbacks) {
          try {
            cb.fn(cb.target, cb.opts);
          } catch (e) {
            console.error('[SWC] removeObserver error:', e);
          }
        }
        removeObserverCallbacks = [];

        // elementApply event listener 정리
        new ElementApply(this, { id: this._swcId }).removeAllEventListener();

        // globalDelegatedRoots remove
        // const roots = [this, this.getRootNode()];
        // if (this.shadowRoot) {
        //   roots.push(this.shadowRoot);
        // }
        // roots.forEach(root => {
        //     DOM_EVENT_NAMES.forEach(type => {
        //       root.removeEventListener(type, handleGlobalSwcEvent);
        //     });
        //   }
        // )

        if (originalDisconnected) originalDisconnected.apply(this);

        const aMethods = findAllLifecycleMetadata(this, ON_AFTER_DISCONNECTED_METADATA_KEY);
        for (const m of aMethods) (this as any)._invokeLifecycleMethod(m.propertyKey, helperHostSet);
        (this as any)._executeSwcScript('swc-on-disconnected', helperHostSet);
        (this as any)._executeSwcScript('swc-on-after-disconnected', helperHostSet);
        (this as any).__swc_connected = false;
      };

      const originalAdopted = proto.adoptedCallback;
      proto.adoptedCallback = function () {
        const hostSet = SwcUtils.getHostSet(this as any);
        (this as any)._executeSwcScript('swc-on-before-adopted', hostSet);
        const bMethods = findAllLifecycleMetadata(this, ON_BEFORE_ADOPTED_METADATA_KEY);
        for (const m of bMethods) (this as any)._invokeLifecycleMethod(m.propertyKey, hostSet);

        if (originalAdopted) originalAdopted.apply(this);

        const aMethods = findAllLifecycleMetadata(this, ON_AFTER_ADOPTED_METADATA_KEY);
        for (const m of aMethods) (this as any)._invokeLifecycleMethod(m.propertyKey, hostSet);
        (this as any)._executeSwcScript('swc-on-adopted', hostSet);
        (this as any)._executeSwcScript('swc-on-after-adopted', hostSet);
      };

      const originalAttributeChanged = proto.attributeChangedCallback;
      proto.attributeChangedCallback = function (name: string, old: string | null, newVal: string | null) {
        if (originalAttributeChanged) originalAttributeChanged.apply(this, [name, old, newVal]);

        const hSet = SwcUtils.getHostSet(this as any);

        // Process expression directive before passing to handlers
        let processedVal: any = newVal;
        if (newVal !== null) {
          const ae = new ActionExpression(newVal);
          const expr = ae.getFirstExpression('callReturn');
          if (expr) {
            const win = (this as any)._resolveWindow?.() || ((typeof window !== 'undefined' ? window : undefined) as any);
            const helperAndHostSet = SwcUtils.getHelperAndHostSet(win, this as any);
            const script = ConvertUtils.decodeHtmlEntity(expr.script, win.document);
            try {
              const result = FunctionUtils.executeReturn({
                script: script,
                context: this,
                args: helperAndHostSet
              });
              // Pass the result object directly without serialization
              processedVal = result;
            } catch (e) {
              console.error(`[SWC] Failed to execute directive {{= ${expr.script} }} on attribute ${name}: ${helperAndHostSet}`, e);
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

        const hostCustomEventMeta = emitHostCustomEventList.find(it => (it.options as any).attributeName === name);
        if (hostCustomEventMeta && newVal !== null) {
          (this as any)._bindAttributeEvent(this as any, name, newVal, hostCustomEventMeta.type);
        }

        const metaList = attrChangeMap.get(name);
        if (metaList && Array.isArray(metaList)) {
          for (const meta of metaList) {
            if (meta.options.while === 'connected' && !(this as any).__swc_connected) {
              continue;
            }
            const convertedVal = convertAttributeValue(processedVal, meta.options.type);
            (this as any)[meta.propertyKey](convertedVal, old, name, hSet);
          }
        }
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
