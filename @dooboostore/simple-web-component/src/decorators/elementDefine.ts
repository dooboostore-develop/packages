import { ReflectUtils } from '@dooboostore/core/reflect/ReflectUtils';
import { getInnerHtmlMetadataList } from './innerHtml';
import { getQueryMetadata } from './query';
import { getQueryAllMetadata } from './queryAll';
import { getAddEventListenerMetadata } from './addEventListener';
import { ON_BEFORE_CONNECTED_METADATA_KEY, ON_AFTER_CONNECTED_METADATA_KEY, ON_BEFORE_DISCONNECTED_METADATA_KEY, ON_AFTER_DISCONNECTED_METADATA_KEY, ON_BEFORE_ADOPTED_METADATA_KEY, ON_AFTER_ADOPTED_METADATA_KEY, ON_ADD_EVENT_LISTENER_METADATA_KEY, ATTRIBUTE_CHANGED_WILDCARD, findAllLifecycleMetadata } from './lifecycles';
import { getEmitCustomEventMetadataList } from './emitCustomEvent';
import { changedAttribute, findAllAttributeChangedMetadata } from './changedAttribute';
import { setAttribute, findAllSetAttributeMetadata } from './setAttribute';
import { SwcUtils } from '../utils/Utils';
import { HTML_TAG_ENTRIES, DOM_EVENT_NAMES } from '../config/config';
import { SituationType, SituationTypeContainer, SituationTypeContainers } from '@dooboostore/simple-boot/decorators/inject/Inject';
import { ConstructorType } from '@dooboostore/core/types';
import { InjectSituationType, HostSet, SwcAppInterface } from '../types';

// --- Core Interfaces & Types (Integrated) ---

export interface ElementConfig {
  name: string;
  extends?: string;
  observedAttributes?: string[];
  customElementRegistry?: CustomElementRegistry;
  window?: Window;
}

export const ELEMENT_CONFIG_KEY = Symbol('simple-web-component:element-config');

// --- Environment Initialization Helper ---

function buildEnv(configWindow?: Window) {
  const win: any = configWindow || (typeof window !== 'undefined' ? window : undefined);
  const doc: Document = win?.document;

  const builtInTagMap = new Map<any, string>();
  for (const [cls, tag] of HTML_TAG_ENTRIES) {
    if (win?.[cls]) builtInTagMap.set(win[cls], tag);
  }

  const domHelpers = {
    $d: doc,
    $w: win,
    $q: (sel: string, root?: Element | Document | ShadowRoot) => (root ?? doc).querySelector(sel),
    $qa: (sel: string, root?: Element | Document | ShadowRoot) => Array.from((root ?? doc).querySelectorAll(sel)),
    $qi: (id: string, root?: Document | ShadowRoot) => (root ?? doc).getElementById(id)
  } as const;

  return { win, doc, builtInTagMap, domHelpers };
}

const getHandlers = (inst: any) => {
  if (!inst.__swc_attributeEventHandlers) inst.__swc_attributeEventHandlers = new Map();
  return inst.__swc_attributeEventHandlers;
};

export const elementDefine =
  (inConfig: ElementConfig | string): ClassDecorator =>
  (constructor: any) => {
    const config: ElementConfig = typeof inConfig === 'string' ? { name: inConfig } : inConfig;
    const { win, doc, builtInTagMap: BUILT_IN_TAG_MAP, domHelpers: SWC_DOM_HELPERS } = buildEnv(config.window);
    config.window = win;
    const SWC_DOM_HELPER_KEYS = Object.keys(SWC_DOM_HELPERS) as (keyof typeof SWC_DOM_HELPERS)[];
    const SWC_DOM_HELPER_VALS = () => SWC_DOM_HELPER_KEYS.map(k => (SWC_DOM_HELPERS as any)[k]);

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

    const swcLifecycleAttributes = ['swc-on-constructor', 'swc-on-connected', 'swc-on-disconnected', 'swc-on-before-connected', 'swc-on-after-connected', 'swc-on-before-disconnected', 'swc-on-after-disconnected', 'swc-on-before-adopted', 'swc-on-after-adopted', 'swc-on-attribute-changed'];
    const swcOnEvents = DOM_EVENT_NAMES.map(e => `swc-on-${e}`);

    const mergedObservedAttributes = [...new Set([...(config.observedAttributes ?? []), ...attrChangeMap.keys(), ...setAttrMap.keys(), ...emitCustomEventList.map(it => it.options.attributeName!), ...swcLifecycleAttributes, ...swcOnEvents])];
    const innerHtmlList = getInnerHtmlMetadataList(constructor) || [];

    const NewClass = class extends (constructor as any) {
      private _swcId = Math.random().toString(36).substring(2, 11);
      private _emitHandlers = new Map<string, EventListener>();

      private _executeSwcScript(attrName: string, hostSet: HostSet, extraArgs: Record<string, any> = {}) {
        const script = this.getAttribute(attrName);
        if (script) {
          try {
            const args = { ...hostSet, ...SWC_DOM_HELPERS, ...extraArgs };
            const argNames = Object.keys(args);
            const argValues = Object.values(args);
            new Function(...argNames, script).apply(this, argValues);
          } catch (e) {
            console.error(`[SWC] Failed to execute ${attrName}:`, e);
          }
        }
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

        const handler = (event: any) => {
          const hostSet = SwcUtils.getHostSet(el);
          const argNames = Object.keys(hostSet);
          const argValues = Object.values(hostSet);
          new Function('event', '$data', ...argNames, ...SWC_DOM_HELPER_KEYS, script).call(el, event, (event as CustomEvent).detail, ...argValues, ...SWC_DOM_HELPER_VALS());
        };

        el.addEventListener(eventName, handler);
        handlers.set(attrName, handler);
      }

      constructor(...args: any[]) {
        super(...args);
        const hostSet = SwcUtils.getHostSet(this as any);
        this._executeSwcScript('swc-on-constructor', hostSet);

        if (innerHtmlList.some(it => it.options.useShadow === true) && !this.shadowRoot) {
          this.attachShadow({ mode: 'open' });
        }
      }

      static get observedAttributes() {
        return mergedObservedAttributes;
      }

      async connectedCallback() {
        const hostSet = SwcUtils.getHostSet(this as any);

        this._executeSwcScript('swc-on-before-connected', hostSet);
        const bMethods = findAllLifecycleMetadata(this, ON_BEFORE_CONNECTED_METADATA_KEY);
        if (bMethods) {
          for (const m of bMethods) await this._invokeLifecycleMethod(m, hostSet);
        }

        if (typeof (this as any).initCore === 'function') (this as any).initCore();

        if (innerHtmlList.length > 0) {
          let sContent = '',
            lContent = '';
          for (const meta of innerHtmlList) {
            const res = await (this as any)[meta.propertyKey]();
            if (res !== undefined) {
              if (meta.options.useShadow) sContent += res;
              else lContent += res;
            }
          }
          if (this.shadowRoot) this.shadowRoot.innerHTML = sContent;
          if (lContent) this.innerHTML = lContent;
        }

        // --- @addEventListener binding ---
        addEventListenerList.forEach(meta => {
          const { selector, type, options } = meta;
          const { root, capture, once, passive, stopPropagation, stopImmediatePropagation, preventDefault, delegate } = options;

          if (delegate && selector && selector !== ':host') {
            const bindRoots: (HTMLElement | ShadowRoot)[] = [];
            const r = root || 'auto';
            if (r === 'auto') {
              bindRoots.push(this.shadowRoot || (this as any));
            } else if (r === 'light') {
              bindRoots.push(this as any);
            } else if (r === 'shadow') {
              if (this.shadowRoot) bindRoots.push(this.shadowRoot as any);
            } else if (r === 'all') {
              bindRoots.push(this as any);
              if (this.shadowRoot) bindRoots.push(this.shadowRoot as any);
            }

            bindRoots.forEach(bindRoot => {
              const handler = (event: Event) => {
                const target = event.target as HTMLElement;
                const matchedEl = target.closest(selector);
                if (matchedEl && (bindRoot as any).contains(matchedEl)) {
                  if (stopPropagation) event.stopPropagation();
                  if (stopImmediatePropagation) event.stopImmediatePropagation();
                  if (preventDefault) event.preventDefault();

                  const hostSet = SwcUtils.getHostSet(this as any);
                  this._invokeLifecycleMethod(meta.propertyKey, hostSet, [event, hostSet, matchedEl]);
                }
              };
              bindRoot.addEventListener(type, handler, { capture, once, passive });
            });
          } else {
            const targetEls: (HTMLElement | Element | Document | ShadowRoot | Window)[] = [];
            if (!selector || selector === ':host') {
              targetEls.push(this as any);
            } else {
              const searchRoots: (HTMLElement | ShadowRoot)[] = [];
              const r = root || 'auto';
              if (r === 'auto') {
                searchRoots.push((this.shadowRoot || (this as any)) as any);
              } else if (r === 'light') {
                searchRoots.push(this as any);
              } else if (r === 'shadow') {
                if (this.shadowRoot) searchRoots.push(this.shadowRoot as any);
              } else if (r === 'all') {
                searchRoots.push(this as any);
                if (this.shadowRoot) searchRoots.push(this.shadowRoot as any);
              }

              searchRoots.forEach(sr => {
                const found = sr.querySelectorAll(selector);
                found.forEach(el => targetEls.push(el as any));
              });
            }

            targetEls.forEach(el => {
              const handler = (event: Event) => {
                if (stopPropagation) event.stopPropagation();
                if (stopImmediatePropagation) event.stopImmediatePropagation();
                if (preventDefault) event.preventDefault();

                const hostSet = SwcUtils.getHostSet(this as any);
                this._invokeLifecycleMethod(meta.propertyKey, hostSet, [event, hostSet]);
              };
              const opts = { capture, once, passive };
              el.addEventListener(type, handler, opts);
            });
          }
        });

        if (super.connectedCallback) await super.connectedCallback();
        const aMethods = findAllLifecycleMetadata(this, ON_AFTER_CONNECTED_METADATA_KEY);
        if (aMethods) {
          for (const m of aMethods) await this._invokeLifecycleMethod(m, hostSet);
        }

        this._executeSwcScript('swc-on-connected', hostSet);
        this._executeSwcScript('swc-on-after-connected', hostSet);
      }

      disconnectedCallback() {
        const hostSet = SwcUtils.getHostSet(this as any);
        this._executeSwcScript('swc-on-before-disconnected', hostSet);
        const bMethods = findAllLifecycleMetadata(this, ON_BEFORE_DISCONNECTED_METADATA_KEY);
        if (bMethods) bMethods.forEach(m => this._invokeLifecycleMethod(m, hostSet));

        if (super.disconnectedCallback) super.disconnectedCallback();

        const aMethods = findAllLifecycleMetadata(this, ON_AFTER_DISCONNECTED_METADATA_KEY);
        if (aMethods) aMethods.forEach(m => this._invokeLifecycleMethod(m, hostSet));
        this._executeSwcScript('swc-on-disconnected', hostSet);
        this._executeSwcScript('swc-on-after-disconnected', hostSet);
      }

      adoptedCallback() {
        const hostSet = SwcUtils.getHostSet(this as any);
        this._executeSwcScript('swc-on-before-adopted', hostSet);
        const bMethods = findAllLifecycleMetadata(this, ON_BEFORE_ADOPTED_METADATA_KEY);
        if (bMethods) bMethods.forEach(m => this._invokeLifecycleMethod(m, hostSet));

        if (super.adoptedCallback) super.adoptedCallback();

        const aMethods = findAllLifecycleMetadata(this, ON_AFTER_ADOPTED_METADATA_KEY);
        if (aMethods) aMethods.forEach(m => this._invokeLifecycleMethod(m, hostSet));
        this._executeSwcScript('swc-on-adopted', hostSet);
        this._executeSwcScript('swc-on-after-adopted', hostSet);
      }

      attributeChangedCallback(name: string, old: string | null, newVal: string | null) {
        if (super.attributeChangedCallback) super.attributeChangedCallback(name, old, newVal);

        if (name.startsWith('swc-on-') && !swcLifecycleAttributes.includes(name)) {
          if (newVal !== null) {
            const customEventMeta = emitCustomEventList.find(it => it.options.attributeName === name);
            const eventName = customEventMeta ? customEventMeta.options.type : name.substring(7);
            this._bindAttributeEvent(this as any, name, newVal, eventName);
          }
        }

        const mKeys = attrChangeMap.get(name);
        if (mKeys && Array.isArray(mKeys)) {
          const hSet = SwcUtils.getHostSet(this as any);
          mKeys.forEach(key => this._invokeLifecycleMethod(key, hSet, [newVal, old, name]));
        }
      }
    };

    // --- @setAttribute wrapping logic ---
    setAttrMap.forEach((methodName, attrName) => {
      const original = NewClass.prototype[methodName as any];
      if (typeof original === 'function') {
        NewClass.prototype[methodName as any] = function (...args: any[]) {
          const res = original.apply(this, args);
          if (res !== undefined) {
            if (res === null) this.removeAttribute(attrName);
            else this.setAttribute(attrName, String(res));
          }
          return res;
        };
      }
    });

    // --- @emitCustomEvent wrapping logic ---
    emitCustomEventList.forEach(meta => {
      const { propertyKey, options } = meta;
      const original = NewClass.prototype[propertyKey as any];
      if (typeof original === 'function') {
        NewClass.prototype[propertyKey as any] = function (...args: any[]) {
          const detail = original.apply(this, args);
          const event = new CustomEvent(options.type, {
            detail,
            bubbles: options.bubbles,
            composed: options.composed,
            cancelable: options.cancelable
          });
          this.dispatchEvent(event);
          return detail;
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
