import { ReflectUtils } from '@dooboostore/core/reflect/ReflectUtils';
import { FunctionUtils } from '@dooboostore/core/function/FunctionUtils';
import { getOnConnectedInnerHtmlMetadata } from './onConnectedInnerHtml';
import { getQueryMetadata } from './query';
import { getQueryAllMetadata } from './queryAll';
import { getAddEventListenerMetadata } from './addEventListener';
import { ON_BEFORE_CONNECTED_METADATA_KEY, ON_AFTER_CONNECTED_METADATA_KEY, ON_BEFORE_DISCONNECTED_METADATA_KEY, ON_AFTER_DISCONNECTED_METADATA_KEY, ON_BEFORE_ADOPTED_METADATA_KEY, ON_AFTER_ADOPTED_METADATA_KEY, ON_ADD_EVENT_LISTENER_METADATA_KEY, ATTRIBUTE_CHANGED_WILDCARD, findAllLifecycleMetadata } from './lifecycles';
import { getEmitCustomEventMetadataList } from './emitCustomEvent';
import { changedAttribute, findAllAttributeChangedMetadata } from './changedAttribute';
import { setAttribute, findAllSetAttributeMetadata } from './setAttribute';
import { findAllReplaceChildrenMetadata } from './replaceChildren';
import { findAllAppendChildMetadata } from './appendChild';
import { SwcUtils } from '../utils/Utils';
import { HTML_TAG_ENTRIES, DOM_EVENT_NAMES } from '../config/config';
import { SituationType, SituationTypeContainer, SituationTypeContainers } from '@dooboostore/simple-boot/decorators/inject/Inject';
import { ConstructorType } from '@dooboostore/core/types';
import { SimpleApplication } from '@dooboostore/simple-boot/SimpleApplication';
import { Router } from '@dooboostore/core-web/routers/Router';
import { InjectSituationType, HostSet, SwcAppInterface } from '../types';

// --- Core Interfaces & Types ---

export interface ElementConfig {
  name: string;
  extends?: string;
  observedAttributes?: string[];
  customElementRegistry?: CustomElementRegistry;
  window?: Window;
}

export const ELEMENT_CONFIG_KEY = Symbol('simple-web-component:element-config');

const globalDelegatedRoots = new WeakSet<Node>();
let globalDefaultWindow: Window = (typeof window !== 'undefined' ? window : undefined) as any;

export const setDefaultWindow = (win: Window) => {
  globalDefaultWindow = win;
};

// --- Helpers ---

function buildEnv(configWindow?: Window) {
  const win: any = configWindow || globalDefaultWindow;
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

const normalizeNodes = (res: any, doc: Document): Node[] => {
  const items = Array.isArray(res) ? res : [res];
  return items.map(it => {
    if (it instanceof Node) return it;
    return doc.createTextNode(it !== undefined && it !== null ? String(it) : '');
  });
};

// --- Main Decorator ---

export const elementDefine =
  (inConfig: ElementConfig | string): ClassDecorator =>
  (constructor: any) => {
    const config: ElementConfig = typeof inConfig === 'string' ? { name: inConfig } : inConfig;
    const { win, doc, builtInTagMap: BUILT_IN_TAG_MAP, domHelpers: SWC_DOM_HELPERS } = buildEnv(config.window);
    config.window = win;

    let extendsTagName = config.extends;
    if (!extendsTagName) {
      let proto = constructor;
      while (proto && proto !== HTMLElement && proto !== Function.prototype) {
        extendsTagName = BUILT_IN_TAG_MAP.get(proto);
        if (extendsTagName) break;
        proto = Object.getPrototypeOf(proto);
      }
      config.extends = extendsTagName;
    }

    const emitCustomEventList = getEmitCustomEventMetadataList(constructor) || [];
    const addEventListenerList = getAddEventListenerMetadata(constructor) || [];
    const attrChangeMap = findAllAttributeChangedMetadata(constructor);
    const setAttrMap = findAllSetAttributeMetadata(constructor);
    const replaceChildrenMap = findAllReplaceChildrenMetadata(constructor);
    const appendChildMap = findAllAppendChildMetadata(constructor);

    const swcLifecycleAttributes = ['swc-on-constructor', 'swc-on-connected', 'swc-on-disconnected', 'swc-on-before-connected', 'swc-on-after-connected', 'swc-on-before-disconnected', 'swc-on-after-disconnected', 'swc-on-before-adopted', 'swc-on-after-adopted', 'swc-on-attribute-changed'];
    const swcOnEvents = DOM_EVENT_NAMES.map(e => `swc-on-${e}`);

    const mergedObservedAttributes = [...new Set([...(config.observedAttributes ?? []), ...attrChangeMap.keys(), ...setAttrMap.keys(), ...emitCustomEventList.map(it => it.options.attributeName!), ...swcLifecycleAttributes, ...swcOnEvents])];
    const connectedInnerHtmlList = getOnConnectedInnerHtmlMetadata(constructor) || [];

    const NewClass = class extends (constructor as any) {
      private _swcId = Math.random().toString(36).substring(2, 11);
      private _emitHandlers = new Map<string, EventListener>();
      private _boundListeners: Array<{ target: EventTarget; type: string; handler: EventListener; options?: any }> = [];

      private async _executeSwcScript(attrName: string, hostSet: HostSet, extraArgs: Record<string, any> = {}) {
        const script = this.getAttribute(attrName);
        if (script) {
          try {
            const conf = getElementConfig(this);
            const currentWin = this._resolveWindow(conf);
            const helpers = SwcUtils.getHelperSet(currentWin);
            const args = { ...hostSet, ...helpers, ...extraArgs, $el: this, $root: this.getRootNode() };
            await FunctionUtils.execute({ script, context: this, args });
          } catch (e) {
            console.error(`[SWC] Failed to execute ${attrName}:`, e);
          }
        }
      }

      private _resolveWindow(localConfig?: ElementConfig): Window {
        if (localConfig?.window) return localConfig.window;
        const ancestors = SwcUtils.findAllSwcHosts(this as any);
        for (let i = ancestors.length - 1; i >= 0; i--) {
          const aConf = getElementConfig(ancestors[i]);
          if (aConf?.window) return aConf.window;
        }
        return globalDefaultWindow || ((typeof window !== 'undefined' ? window : undefined) as Window);
      }

      private async _invokeLifecycleMethod(methodName: string | symbol, hostSet: HostSet, extraArgs: any[] = []) {
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
      }

      private _bindAttributeEvent(el: HTMLElement, attrName: string, script: string, eventName?: string) {
        if (!eventName) {
          if (!attrName.startsWith('swc-on-')) return;
          eventName = attrName.substring(7);
        }
        if (swcLifecycleAttributes.includes(attrName)) return;

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
          const currentWin = this._resolveWindow(conf);
          const helpers = SwcUtils.getHelperSet(currentWin);
          const args = {
            event,
            $data: (event as CustomEvent).detail,
            ...hostSet,
            ...helpers,
            $el: el,
            $root: this.getRootNode()
          };
          await FunctionUtils.execute({ script, context: this, args });
        };

        el.addEventListener(eventName, handler);
        handlers.set(attrName, handler);
      }

      constructor(...args: any[]) {
        super(...args);
        const hostSet = SwcUtils.getHostSet(this as any);
        this._executeSwcScript('swc-on-constructor', hostSet);

        if (connectedInnerHtmlList.some(it => it.options.useShadow === true) && !this.shadowRoot) {
          this.attachShadow({ mode: 'open' });
        }
      }

      static get observedAttributes() {
        return mergedObservedAttributes;
      }

      async connectedCallback() {
        const conf = getElementConfig(this);
        const currentWin = this._resolveWindow(conf);
        const currentHelpers = SwcUtils.getHelperSet(currentWin);
        const hostSet = SwcUtils.getHostSet(this as any);

        await this._executeSwcScript('swc-on-before-connected', hostSet);
        const bMethods = findAllLifecycleMetadata(this, ON_BEFORE_CONNECTED_METADATA_KEY);
        if (bMethods) {
          for (const m of bMethods) await this._invokeLifecycleMethod(m, hostSet);
        }

        if (typeof (this as any).initCore === 'function') (this as any).initCore();

        if (connectedInnerHtmlList.length > 0) {
          let sContent = '',
            lContent = '';
          for (const meta of connectedInnerHtmlList) {
            const res = await (this as any)[meta.propertyKey]();
            if (res !== undefined) {
              if (meta.options.useShadow) sContent += res;
              else lContent += res;
            }
          }
          if (this.shadowRoot) this.shadowRoot.innerHTML = sContent;
          if (lContent) this.innerHTML = lContent;
        }

        // --- Delegation Handler ---
        const createDelegationHandler = (delegateHost: any) => async (event: Event) => {
          if ((event as any).__swc_handled) return;

          const path = event.composedPath();
          const type = event.type;
          const attrName = `swc-on-${type}`;

          for (const node of path) {
            if (node === delegateHost) break;
            if (!(node instanceof HTMLElement)) continue;

            const script = node.getAttribute?.(attrName);
            if (script && !getElementConfig(node)) {
              const host = SwcUtils.findNearestSwcHost(node);
              const self: any = this;
              if (host === self) {
                const childHostSet = SwcUtils.getHostSet(node);
                const args = {
                  event,
                  $data: (event as CustomEvent).detail,
                  ...childHostSet,
                  ...currentHelpers,
                  $el: node,
                  $root: delegateHost
                };
                await FunctionUtils.execute({ script, context: host, args });
                (event as any).__swc_handled = true;
                break;
              }
            }
          }
        };

        // 1. Local Delegation
        DOM_EVENT_NAMES.forEach(type => {
          const handler = createDelegationHandler(this);
          this.addEventListener(type, handler);
          this._boundListeners.push({ target: this as any, type, handler });
        });

        // 2. Global Delegation
        const hasParentHost = SwcUtils.findAllSwcHosts(this as any).length > 0;
        if (!hasParentHost) {
          const root = this.getRootNode();
          if (!globalDelegatedRoots.has(root)) {
            DOM_EVENT_NAMES.forEach(type => {
              const handler = createDelegationHandler(root);
              root.addEventListener(type, handler);
            });
            globalDelegatedRoots.add(root);
          }
        }

        // --- @addEventListener binding ---
        addEventListenerList.forEach(meta => {
          const { selector, type, options } = meta;
          const opts = { capture: options.capture, once: options.once, passive: options.passive };
          const bindTargets: EventTarget[] = [];

          if (selector === ':window') bindTargets.push(currentWin);
          else if (selector === ':document') bindTargets.push(currentWin.document);
          else if (selector === ':parentHost') {
            if (hostSet.$parentHost) bindTargets.push(hostSet.$parentHost);
          } else if (selector === ':appHost') {
            if (hostSet.$appHost) bindTargets.push(hostSet.$appHost);
          } else if (selector === ':firstHost') {
            if (hostSet.$firstHost) bindTargets.push(hostSet.$firstHost);
          } else if (selector === ':lastHost') {
            if (hostSet.$lastHost) bindTargets.push(hostSet.$lastHost);
          } else if (selector === ':firstAppHost') {
            if (hostSet.$firstAppHost) bindTargets.push(hostSet.$firstAppHost);
          } else if (selector === ':lastAppHost') {
            if (hostSet.$lastAppHost) bindTargets.push(hostSet.$lastAppHost);
          } else if (selector === ':hosts') {
            hostSet.$hosts.forEach(h => bindTargets.push(h));
          } else if (selector === ':appHosts') {
            hostSet.$appHosts.forEach(h => bindTargets.push(h));
          } else if (selector === ':host' || !selector) bindTargets.push(this as any);
          else if (options.delegate) {
            const bindRoots: (HTMLElement | ShadowRoot)[] = [];
            const r = options.root || 'auto';
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
                  await this._invokeLifecycleMethod(meta.propertyKey, currentHostSet, [event, currentHostSet, matchedEl, args]);
                }
              };
              br.addEventListener(type, handler, opts);
              const self: any = this;
              if (options.removeOnDisconnected === true || (br !== self && br !== self.shadowRoot)) {
                this._boundListeners.push({ target: br, type, handler, options: opts });
              }
            });
          } else {
            const r = options.root || 'auto';
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
              await this._invokeLifecycleMethod(meta.propertyKey, currentHostSet, [event, currentHostSet, args]);
            };
            t.addEventListener(type, handler, opts);
            if (options.removeOnDisconnected === true || t === currentWin || t === currentWin.document) {
              this._boundListeners.push({ target: t, type, handler, options: opts });
            }
          });
        });

        if (super.connectedCallback) await super.connectedCallback();
        const aMethods = findAllLifecycleMetadata(this, ON_AFTER_CONNECTED_METADATA_KEY);
        if (aMethods) {
          for (const m of aMethods) await this._invokeLifecycleMethod(m, hostSet);
        }
        await this._executeSwcScript('swc-on-connected', hostSet);
        await this._executeSwcScript('swc-on-after-connected', hostSet);
      }

      async disconnectedCallback() {
        const hostSet = SwcUtils.getHostSet(this as any);
        await this._executeSwcScript('swc-on-before-disconnected', hostSet);
        const bMethods = findAllLifecycleMetadata(this, ON_BEFORE_DISCONNECTED_METADATA_KEY);
        if (bMethods) {
          for (const m of bMethods) await this._invokeLifecycleMethod(m, hostSet);
        }

        this._boundListeners.forEach(l => l.target.removeEventListener(l.type, l.handler, l.options));
        this._boundListeners = [];

        if (super.disconnectedCallback) super.disconnectedCallback();

        const aMethods = findAllLifecycleMetadata(this, ON_AFTER_DISCONNECTED_METADATA_KEY);
        if (aMethods) {
          for (const m of aMethods) await this._invokeLifecycleMethod(m, hostSet);
        }
        await this._executeSwcScript('swc-on-disconnected', hostSet);
        await this._executeSwcScript('swc-on-after-disconnected', hostSet);
      }

      async adoptedCallback() {
        const hostSet = SwcUtils.getHostSet(this as any);
        await this._executeSwcScript('swc-on-before-adopted', hostSet);
        const bMethods = findAllLifecycleMetadata(this, ON_BEFORE_ADOPTED_METADATA_KEY);
        if (bMethods) {
          for (const m of bMethods) await this._invokeLifecycleMethod(m, hostSet);
        }

        if (super.adoptedCallback) super.adoptedCallback();

        const aMethods = findAllLifecycleMetadata(this, ON_AFTER_ADOPTED_METADATA_KEY);
        if (aMethods) {
          for (const m of aMethods) await this._invokeLifecycleMethod(m, hostSet);
        }
        await this._executeSwcScript('swc-on-adopted', hostSet);
        await this._executeSwcScript('swc-on-after-adopted', hostSet);
      }

      async attributeChangedCallback(name: string, old: string | null, newVal: string | null) {
        if (super.attributeChangedCallback) super.attributeChangedCallback(name, old, newVal);

        if (name.startsWith('swc-on-') && !swcLifecycleAttributes.includes(name)) {
          if (newVal !== null) {
            const customEventMeta = emitCustomEventList.find(it => it.options.attributeName === name);
            const eventName = customEventMeta ? customEventMeta.type : name.substring(7);
            this._bindAttributeEvent(this as any, name, newVal, eventName);
          }
        }

        const mKeys = attrChangeMap.get(name);
        if (mKeys && Array.isArray(mKeys)) {
          const hSet = SwcUtils.getHostSet(this as any);
          for (const key of mKeys) await this._invokeLifecycleMethod(key, hSet, [newVal, old, name]);
        }
      }
    };

    // --- Method Wrapping Logic ---

    setAttrMap.forEach((methodName, attrName) => {
      const original = NewClass.prototype[methodName as any];
      if (typeof original === 'function') {
        NewClass.prototype[methodName as any] = async function (...args: any[]) {
          const res = await original.apply(this, args);
          if (res !== undefined) {
            if (res === null) this.removeAttribute(attrName);
            else this.setAttribute(attrName, String(res));
          }
          return res;
        };
      }
    });

    emitCustomEventList.forEach(meta => {
      const { propertyKey, selector, type, options } = meta;
      const original = NewClass.prototype[propertyKey as any];
      if (typeof original === 'function') {
        NewClass.prototype[propertyKey as any] = async function (...args: any[]) {
          const detail = await original.apply(this, args);
          const event = new CustomEvent(type, {
            detail,
            bubbles: options.bubbles,
            composed: options.composed,
            cancelable: options.cancelable
          });

          const hostSet = SwcUtils.getHostSet(this);
          const conf = getElementConfig(this);
          const currentWin = (this as any)._resolveWindow(conf);

          const eventTargets: EventTarget[] = [];
          if (selector === ':window') eventTargets.push(currentWin);
          else if (selector === ':document') eventTargets.push(currentWin.document);
          else if (selector === ':parentHost') {
            if (hostSet.$parentHost) eventTargets.push(hostSet.$parentHost);
          } else if (selector === ':appHost') {
            if (hostSet.$appHost) eventTargets.push(hostSet.$appHost);
          } else if (selector === ':firstHost') {
            if (hostSet.$firstHost) eventTargets.push(hostSet.$firstHost);
          } else if (selector === ':lastHost') {
            if (hostSet.$lastHost) eventTargets.push(hostSet.$lastHost);
          } else if (selector === ':firstAppHost') {
            if (hostSet.$firstAppHost) eventTargets.push(hostSet.$firstAppHost);
          } else if (selector === ':lastAppHost') {
            if (hostSet.$lastAppHost) eventTargets.push(hostSet.$lastAppHost);
          } else if (selector === ':hosts') {
            hostSet.$hosts.forEach(h => eventTargets.push(h));
          } else if (selector === ':appHosts') {
            hostSet.$appHosts.forEach(h => eventTargets.push(h));
          } else if (selector === ':host' || !selector) eventTargets.push(this);
          else {
            const r = options.root || 'auto';
            const searchRoots: (HTMLElement | ShadowRoot)[] = [];
            if (r === 'auto') searchRoots.push(this.shadowRoot || (this as any));
            else if (r === 'light') searchRoots.push(this as any);
            else if (r === 'shadow' && this.shadowRoot) searchRoots.push(this.shadowRoot);
            else if (r === 'all') {
              searchRoots.push(this as any);
              if (this.shadowRoot) searchRoots.push(this.shadowRoot);
            }

            searchRoots.forEach(sr => {
              sr.querySelectorAll(selector).forEach(el => eventTargets.push(el));
            });
          }

          eventTargets.forEach(t => t.dispatchEvent(event));
          return detail;
        };
      }
    });

    replaceChildrenMap.forEach((selector, methodName) => {
      const original = NewClass.prototype[methodName as any];
      if (typeof original === 'function') {
        NewClass.prototype[methodName as any] = async function (...args: any[]) {
          const res = await original.apply(this, args);
          if (res !== undefined) {
            const conf = getElementConfig(this);
            const currentWin = (this as any)._resolveWindow(conf);
            const currentDoc = currentWin.document;

            let targetEl: Element | null = null;
            if (selector === ':host' || !selector) {
              targetEl = this;
            } else {
              targetEl = (this.shadowRoot || this).querySelector(selector);
            }

            if (targetEl) {
              if (typeof res === 'string') {
                targetEl.textContent = res;
              } else {
                const nodes = normalizeNodes(res, currentDoc);
                (targetEl as any).replaceChildren(...nodes);
              }
            }
          }
          return res;
        };
      }
    });

    appendChildMap.forEach((meta, methodName) => {
      const { selector, options } = meta;
      const original = NewClass.prototype[methodName as any];
      if (typeof original === 'function') {
        NewClass.prototype[methodName as any] = async function (...args: any[]) {
          const res = await original.apply(this, args);
          if (res !== undefined) {
            const conf = getElementConfig(this);
            const currentWin = (this as any)._resolveWindow(conf);
            const currentDoc = currentWin.document;

            let targetEl: HTMLElement | null = null;
            if (selector === ':host' || !selector) {
              targetEl = this;
            } else {
              targetEl = (this.shadowRoot || this).querySelector(selector);
            }

            if (targetEl) {
              const nodes = normalizeNodes(res, currentDoc);
              const pos = options.position || 'beforeEnd';

              if (typeof res === 'string') {
                targetEl.insertAdjacentText(pos as InsertPosition, res);
              } else if (Array.isArray(res) && res.every(n => typeof n === 'string')) {
                targetEl.insertAdjacentText(pos as InsertPosition, res.join(''));
              } else {
                if (pos === 'beforeEnd') targetEl.append(...nodes);
                else if (pos === 'afterBegin') targetEl.prepend(...nodes);
                else if (pos === 'beforeBegin') targetEl.before(...nodes);
                else if (pos === 'afterEnd') targetEl.after(...nodes);
              }
            }
          }
          return res;
        };
      }
    });

    const originalProto = constructor.prototype;
    const newProto = NewClass.prototype;
    Object.getOwnPropertyNames(originalProto).forEach(name => {
      if (name === 'constructor') return;
      const keys = Reflect.getMetadataKeys(originalProto, name);
      keys.forEach(key => Reflect.defineMetadata(key, Reflect.getMetadata(key, originalProto, name), newProto, name));
    });

    ReflectUtils.defineMetadata(ELEMENT_CONFIG_KEY, config, NewClass);
    ReflectUtils.defineMetadata(ELEMENT_CONFIG_KEY, config, constructor);
    const registry = config.customElementRegistry || (win as any)?.customElements;
    if (registry && !registry.get(config.name)) {
      registry.define(config.name, NewClass as any, config.extends ? { extends: config.extends } : undefined);
    }
    return NewClass as any;
  };

export const getElementConfig = (target: any): ElementConfig | undefined => {
  const constructor = target instanceof Function ? target : target.constructor;
  return ReflectUtils.getMetadata(ELEMENT_CONFIG_KEY, constructor);
};
