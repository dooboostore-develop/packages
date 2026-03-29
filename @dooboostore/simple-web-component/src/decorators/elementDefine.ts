import { ReflectUtils } from '@dooboostore/core/reflect/ReflectUtils';
import { FunctionUtils } from '@dooboostore/core/function/FunctionUtils';
import { getOnConnectedInnerHtmlMetadata } from './onConnectedInnerHtml';
import { getAddEventListenerMetadata } from './addEventListener';
import { ON_BEFORE_CONNECTED_METADATA_KEY, ON_AFTER_CONNECTED_METADATA_KEY, ON_BEFORE_DISCONNECTED_METADATA_KEY, ON_AFTER_DISCONNECTED_METADATA_KEY, ON_BEFORE_ADOPTED_METADATA_KEY, ON_AFTER_ADOPTED_METADATA_KEY, findAllLifecycleMetadata } from './lifecycles';
import { getEmitCustomEventMetadataList } from './emitCustomEvent';
import { findAllAttributeChangedMetadata } from './changedAttribute';
import { findAllSetAttributeMetadata } from './setAttribute';
import { findAllReplaceChildrenMetadata } from './replaceChildren';
import { findAllAppendChildMetadata } from './appendChild';
import { findAllClassListMetadata } from './classList';
import { findAllStyleMetadata } from './style';
import { findAllAttributeMetadata } from './attribute';
import { SwcUtils } from '../utils/Utils';
import { HTML_TAG_ENTRIES, DOM_EVENT_NAMES } from '../config/config';
import { SituationTypeContainer, SituationTypeContainers } from '@dooboostore/simple-boot/decorators/inject/Inject';
import { InjectSituationType, HostSet } from '../types';

// --- Core Interfaces & Types ---

export const ELEMENT_CONFIG_KEY = Symbol('simple-web-component:element-config');

export interface ElementConfig {
  extends?: string;
  observedAttributes?: string[];
  customElementRegistry?: any;
  window?: Window;
}

export interface ElementMetadata extends Omit<ElementConfig, 'window'> {
  name: string;
  window: Window;
}

export const getElementConfig = (target: any): ElementMetadata | undefined => {
  const constructor = target instanceof Function ? target : target.constructor;
  return ReflectUtils.getMetadata(ELEMENT_CONFIG_KEY, constructor);
};

export const ensureInit = (inst: any) => {
  if (!inst.__swc_initialized) {
    inst._swcId = Math.random().toString(36).substring(2, 11);
    inst._emitHandlers = new Map();
    inst._boundListeners = [];
    inst.__swc_initialized = true;

    // Call constructor script if present
    const hostSet = SwcUtils.getHostSet(inst);
    inst._executeSwcScript?.('swc-on-constructor', hostSet);
  }
};

// --- Global Event Handling ---
const globalDelegatedRoots = new WeakSet<Node>();

const handleGlobalSwcEvent = async (event: Event) => {
  if ((event as any).__swc_handled) return;
  const path = event.composedPath();
  const type = event.type;
  const attrName = `swc-on-${type}`;

  for (const node of path) {
    if (!(node instanceof HTMLElement)) continue;
    const script = node.getAttribute?.(attrName);
    if (script && !getElementConfig(node)) {
      const host: any = SwcUtils.findNearestSwcHost(node);
      if (host && host.isConnected && typeof host.__swc_executeAttributeEvent === 'function') {
        await host.__swc_executeAttributeEvent(node, attrName, script, event);
        (event as any).__swc_handled = true;
        break;
      }
    }
  }
};

function buildEnv(configWindow?: Window) {
  const win: Window = configWindow || ((typeof window !== 'undefined' ? window : undefined) as any);
  const doc: Document = win?.document;
  const builtInTagMap = new Map<any, string>();
  for (const [cls, tag] of HTML_TAG_ENTRIES) {
    if (win?.[cls]) builtInTagMap.set(win[cls], tag);
  }
  const domHelpers = SwcUtils.getHelperSet(win);
  return { win, doc, builtInTagMap, domHelpers };
}

const getHandlers = (inst: any) => {
  if (!inst.__swc_attributeEventHandlers) inst.__swc_attributeEventHandlers = new Map();
  return inst.__swc_attributeEventHandlers;
};

const setupPrototype = (proto: any) => {
  if (proto.__swc_proto_setup) return;
  proto.__swc_proto_setup = true;

  proto._executeSwcScript = function (attrName: string, hostSet: HostSet, extraArgs: Record<string, any> = {}) {
    ensureInit(this);
    const script = this.getAttribute(attrName);
    if (script) {
      try {
        const conf = getElementConfig(this);
        const currentWin = (this as any)._resolveWindow(conf);
        const helpers = SwcUtils.getHelperSet(currentWin);
        const args = { ...hostSet, ...helpers, ...extraArgs, $el: this, $root: this.getRootNode() };
        FunctionUtils.execute({ script, context: this, args });
      } catch (e) {
        console.error(`[SWC] Failed to execute ${attrName}:`, e);
      }
    }
  };

  proto._resolveWindow = function (localConfig?: ElementConfig): Window {
    ensureInit(this);
    if (localConfig?.window) return localConfig.window;
    const ancestors = SwcUtils.findAllSwcHosts(this as any);
    for (let i = ancestors.length - 1; i >= 0; i--) {
      const aConf = getElementConfig(ancestors[i]);
      if (aConf?.window) return aConf.window;
    }
    return (typeof window !== 'undefined' ? window : undefined) as Window;
  };

  proto._invokeLifecycleMethod = function (methodName: string | symbol, hostSet: HostSet, extraArgs: any[] = []) {
    ensureInit(this);
    if (typeof (this as any)[methodName] !== 'function') return;
    const app = hostSet.$appHost?.simpleApplication;

    if (app) {
      const otherStorage = new Map<any, any>();
      const situations = new SituationTypeContainers([new SituationTypeContainer({ situationType: InjectSituationType.HOST_SET, data: hostSet }), new SituationTypeContainer({ situationType: InjectSituationType.APP_HOST, data: hostSet.$appHost }), new SituationTypeContainer({ situationType: InjectSituationType.APP_HOSTS, data: hostSet.$appHosts }), new SituationTypeContainer({ situationType: InjectSituationType.HOST, data: hostSet.$host }), new SituationTypeContainer({ situationType: InjectSituationType.HOSTS, data: hostSet.$hosts }), new SituationTypeContainer({ situationType: InjectSituationType.FIRST_HOST, data: hostSet.$firstHost }), new SituationTypeContainer({ situationType: InjectSituationType.LAST_HOST, data: hostSet.$lastHost }), new SituationTypeContainer({ situationType: InjectSituationType.FIRST_APP_HOST, data: hostSet.$firstAppHost }), new SituationTypeContainer({ situationType: InjectSituationType.LAST_APP_HOST, data: hostSet.$lastAppHost })]);
      otherStorage.set(SituationTypeContainers, situations);

      return app.simstanceManager.executeBindParameterSimPromise(
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
      await FunctionUtils.execute({ script, context: el, args });
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
    const args = {
      event,
      $data: (event as CustomEvent).detail,
      ...hostSet,
      ...currentHelpers,
      $el: el,
      $root: this.getRootNode()
    };
    await FunctionUtils.execute({ script, context: el, args });
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
    const addEventListenerList = getAddEventListenerMetadata(constructor) || [];
    const attrChangeMap = findAllAttributeChangedMetadata(constructor);
    const attributeList = findAllAttributeMetadata(constructor);

    const swcLifecycleAttributes = ['swc-on-constructor', 'swc-on-connected', 'swc-on-disconnected', 'swc-on-before-connected', 'swc-on-after-connected', 'swc-on-before-disconnected', 'swc-on-after-disconnected', 'swc-on-before-adopted', 'swc-on-after-adopted', 'swc-on-attribute-changed'];
    const swcOnEvents = DOM_EVENT_NAMES.map(e => `swc-on-${e}`);

    // Collect all observed attributes from all decorators
    const mergedObservedAttributes = [...new Set([...(metadata.observedAttributes ?? []), ...attrChangeMap.keys(), ...Array.from(findAllSetAttributeMetadata(constructor).values()).map(it => it.name), ...attributeList.map(it => it.options.name || String(it.propertyKey)), ...emitCustomEventList.map(it => it.options.attributeName!), ...swcLifecycleAttributes, ...swcOnEvents])];

    const connectedInnerHtmlList = getOnConnectedInnerHtmlMetadata(constructor) || [];

    const proto = constructor.prototype;
    setupPrototype(proto);

    const originalConnected = proto.connectedCallback;
    proto.connectedCallback = function () {
      ensureInit(this);

      if (connectedInnerHtmlList.some(it => it.options.useShadow === true) && !this.shadowRoot) {
        this.attachShadow({ mode: 'open' });
      }

      const conf = getElementConfig(this);
      const currentWin = (this as any)._resolveWindow(conf);
      const hostSet = SwcUtils.getHostSet(this as any);

      (this as any)._executeSwcScript('swc-on-before-connected', hostSet);
      const bMethods = findAllLifecycleMetadata(this, ON_BEFORE_CONNECTED_METADATA_KEY);
      if (bMethods) {
        for (const m of bMethods) (this as any)._invokeLifecycleMethod(m, hostSet);
      }

      // Initialize @attribute fields (DOM <-> JS Sync)
      attributeList.forEach(meta => {
        const attrName = meta.options.name || String(meta.propertyKey);
        if (meta.options.connectedInitialize) {
          // JS -> DOM (FORCE OVERWRITE)
          const memoryVal = (this as any)[meta.privateKey];
          if (memoryVal !== undefined) {
            (this as any).__swc_syncing_init = true;
            try {
              (this as any)[meta.propertyKey] = memoryVal; // Trigger setter to update DOM
            } finally {
              (this as any).__swc_syncing_init = false;
            }
          }
        } else if (meta.selector === ':host' || !meta.selector) {
          // DOM -> JS (Pull from HTML)
          const domVal = this.getAttribute(attrName);
          if (domVal !== null) {
            (this as any).__swc_syncing_init = true;
            try {
              (this as any)[meta.propertyKey] = domVal; // Update memory with DOM value
            } finally {
              (this as any).__swc_syncing_init = false;
            }
          }
        }
      });

      if (connectedInnerHtmlList.length > 0) {
        let sContent = '',
          lContent = '';
        for (const meta of connectedInnerHtmlList) {
          const res = (this as any)[meta.propertyKey]();
          if (res !== undefined) {
            if (meta.options.useShadow) sContent += res;
            else lContent += res;
          }
        }
        if (this.shadowRoot) this.shadowRoot.innerHTML = sContent;
        if (lContent) this.innerHTML = lContent;
      }

      const root = this.getRootNode();
      if (!globalDelegatedRoots.has(root)) {
        DOM_EVENT_NAMES.forEach(type => {
          root.addEventListener(type, handleGlobalSwcEvent);
        });
        globalDelegatedRoots.add(root);
      }

      addEventListenerList.forEach(meta => {
        const { selector, type, options } = meta;
        const opts = { capture: options.capture, once: options.once, passive: options.passive };
        const bindTargets: EventTarget[] = [];
        const r = options.root || 'auto';
        const applyRootOption = (target: any) => {
          if (!target) return;
          if (r === 'auto') {
            bindTargets.push(target.shadowRoot || target);
          } else {
            if (r === 'light' || r === 'all') bindTargets.push(target);
            if ((r === 'shadow' || r === 'all') && target.shadowRoot) bindTargets.push(target.shadowRoot);
          }
        };

        if (selector === ':window') bindTargets.push(currentWin);
        else if (selector === ':document') bindTargets.push(currentWin.document);
        else if (selector === ':parentHost') applyRootOption(hostSet.$parentHost);
        else if (selector === ':appHost') applyRootOption(hostSet.$appHost);
        else if (selector === ':firstHost') applyRootOption(hostSet.$firstHost);
        else if (selector === ':lastHost') applyRootOption(hostSet.$lastHost);
        else if (selector === ':firstAppHost') applyRootOption(hostSet.$firstAppHost);
        else if (selector === ':lastAppHost') applyRootOption(hostSet.$lastAppHost);
        else if (selector === ':hosts') hostSet.$hosts.forEach(applyRootOption);
        else if (selector === ':appHosts') hostSet.$appHosts.forEach(applyRootOption);
        else if (selector === ':host' || !selector) applyRootOption(this);
        else if (options.delegate) {
          const bindRoots: (HTMLElement | ShadowRoot)[] = [];
          if (r === 'auto') bindRoots.push(this.shadowRoot || (this as any));
          else if (r === 'light') bindRoots.push(this as any);
          else if (r === 'shadow' && this.shadowRoot) bindRoots.push(this.shadowRoot);
          else if (r === 'all') {
            bindRoots.push(this as any);
            if (this.shadowRoot) bindRoots.push(this.shadowRoot);
          }

          bindRoots.forEach(br => {
            const handler = async (event: Event) => {
              const matchedEl = (event.target as HTMLElement).closest(selector);
              if (matchedEl && (br as any).contains(matchedEl)) {
                if (options.stopPropagation) event.stopPropagation();
                if (options.stopImmediatePropagation) event.stopImmediatePropagation();
                if (options.preventDefault) event.preventDefault();
                const currentHostSet = SwcUtils.getHostSet(this as any);
                const args = { event, ...currentHostSet, $el: matchedEl, $root: br };
                await (this as any)._invokeLifecycleMethod(meta.propertyKey, currentHostSet, [event, currentHostSet, matchedEl, args]);
              }
            };
            br.addEventListener(type, handler, opts);
            if (options.removeOnDisconnected === true || (br !== this && br !== this.shadowRoot)) {
              (this as any)._boundListeners.push({ target: br, type, handler, options: opts });
            }
          });
        } else {
          const searchRoots: (HTMLElement | ShadowRoot)[] = [];
          if (r === 'auto') searchRoots.push(this.shadowRoot || (this as any));
          else if (r === 'light') searchRoots.push(this as any);
          else if (r === 'shadow' && this.shadowRoot) searchRoots.push(this.shadowRoot);
          else if (r === 'all') {
            searchRoots.push(this as any);
            if (this.shadowRoot) searchRoots.push(this.shadowRoot);
          }

          searchRoots.forEach(sr => {
            sr.querySelectorAll(selector).forEach(el => bindTargets.push(el));
          });
        }

        bindTargets.forEach(t => {
          const handler = async (event: Event) => {
            if (options.stopPropagation) event.stopPropagation();
            if (options.stopImmediatePropagation) event.stopImmediatePropagation();
            if (options.preventDefault) event.preventDefault();
            const currentHostSet = SwcUtils.getHostSet(this as any);
            const args = { event, ...currentHostSet, $el: t, $root: t };
            await (this as any)._invokeLifecycleMethod(meta.propertyKey, currentHostSet, [event, currentHostSet, args]);
          };
          t.addEventListener(type, handler, opts);
          if (options.removeOnDisconnected === true || t === currentWin || t === currentWin.document) {
            (this as any)._boundListeners.push({ target: t, type, handler, options: opts });
          }
        });
      });

      if (originalConnected) originalConnected.apply(this);

      const aMethods = findAllLifecycleMetadata(this, ON_AFTER_CONNECTED_METADATA_KEY);
      if (aMethods) {
        for (const m of aMethods) (this as any)._invokeLifecycleMethod(m, hostSet);
      }
      (this as any)._executeSwcScript('swc-on-connected', hostSet);
      (this as any)._executeSwcScript('swc-on-after-connected', hostSet);
      (this as any).__swc_connected = true;
    };

    const originalDisconnected = proto.disconnectedCallback;
    proto.disconnectedCallback = function () {
      const hostSet = SwcUtils.getHostSet(this as any);
      (this as any)._executeSwcScript('swc-on-before-disconnected', hostSet);
      const bMethods = findAllLifecycleMetadata(this, ON_BEFORE_DISCONNECTED_METADATA_KEY);
      if (bMethods) {
        for (const m of bMethods) (this as any)._invokeLifecycleMethod(m, hostSet);
      }

      if ((this as any)._boundListeners) {
        (this as any)._boundListeners.forEach((l: any) => l.target.removeEventListener(l.type, l.handler, l.options));
        (this as any)._boundListeners = [];
      }

      if (originalDisconnected) originalDisconnected.apply(this);

      const aMethods = findAllLifecycleMetadata(this, ON_AFTER_DISCONNECTED_METADATA_KEY);
      if (aMethods) {
        for (const m of aMethods) (this as any)._invokeLifecycleMethod(m, hostSet);
      }
      (this as any)._executeSwcScript('swc-on-disconnected', hostSet);
      (this as any)._executeSwcScript('swc-on-after-disconnected', hostSet);
      (this as any).__swc_connected = false;
    };

    const originalAdopted = proto.adoptedCallback;
    proto.adoptedCallback = function () {
      const hostSet = SwcUtils.getHostSet(this as any);
      (this as any)._executeSwcScript('swc-on-before-adopted', hostSet);
      const bMethods = findAllLifecycleMetadata(this, ON_BEFORE_ADOPTED_METADATA_KEY);
      if (bMethods) {
        for (const m of bMethods) (this as any)._invokeLifecycleMethod(m, hostSet);
      }

      if (originalAdopted) originalAdopted.apply(this);

      const aMethods = findAllLifecycleMetadata(this, ON_AFTER_ADOPTED_METADATA_KEY);
      if (aMethods) {
        for (const m of aMethods) (this as any)._invokeLifecycleMethod(m, hostSet);
      }
      (this as any)._executeSwcScript('swc-on-adopted', hostSet);
      (this as any)._executeSwcScript('swc-on-after-adopted', hostSet);
    };

    const originalAttributeChanged = proto.attributeChangedCallback;
    proto.attributeChangedCallback = function (name: string, old: string | null, newVal: string | null) {
      if (originalAttributeChanged) originalAttributeChanged.apply(this, [name, old, newVal]);

      // Handle swc-on-* events
      if (name.startsWith('swc-on-') && !swcLifecycleAttributes.includes(name)) {
        if (newVal !== null) {
          const customEventMeta = emitCustomEventList.find(it => it.options.attributeName === name);
          const eventName = customEventMeta ? customEventMeta.type : name.substring(7);
          (this as any)._bindAttributeEvent(this as any, name, newVal, eventName);
        }
      }

      // Handle @changedAttribute callbacks
      const mKeys = attrChangeMap.get(name);
      if (mKeys && Array.isArray(mKeys)) {
        const hSet = SwcUtils.getHostSet(this as any);
        for (const key of mKeys) (this as any)._invokeLifecycleMethod(key, hSet, [newVal, old, name]);
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
