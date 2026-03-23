import { ReflectUtils } from '@dooboostore/core/reflect/ReflectUtils';
import { getInnerHtmlMetadataList } from './innerHtml';
import { getQueryMetadata } from './query';
import { getQueryAllMetadata } from './queryAll';
import { getAddEventListenerMetadata } from './addEventListener';
import { getLifecycleMetadata, ON_BEFORE_CONNECTED_METADATA_KEY, ON_AFTER_CONNECTED_METADATA_KEY, ON_BEFORE_DISCONNECTED_METADATA_KEY, ON_AFTER_DISCONNECTED_METADATA_KEY, ON_BEFORE_ADOPTED_METADATA_KEY, ON_AFTER_ADOPTED_METADATA_KEY, ON_ADD_EVENT_LISTENER_METADATA_KEY, ON_ATTRIBUTE_CHANGED_METADATA_KEY, ATTRIBUTE_CHANGED_WILDCARD } from './lifecycles';
import { getAttributeMetadataList } from './attribute';
import { getStateMetadataList } from './state';
import { getEmitCustomEventMetadataList } from './emitCustomEvent';
import { SwcUtils } from '../utils/Utils';

export interface ElementConfig {
  name: string;
  extends?: string;
  observedAttributes?: string[];
  customElementRegistry?: CustomElementRegistry;
  autoRemoveEventListeners?: boolean;
}

export const ELEMENT_CONFIG_KEY = Symbol('simple-web-component:element-config');
export const STATE_CHANGE_EVENT = 'swc:state-change';

const BUILT_IN_TAG_MAP = new Map<any, string>();

const registerTag = (className: string, tagName: string) => {
  if (typeof globalThis !== 'undefined' && (globalThis as any)[className]) {
    BUILT_IN_TAG_MAP.set((globalThis as any)[className], tagName);
  }
};

[
  ['HTMLAnchorElement', 'a'],
  ['HTMLAreaElement', 'area'],
  ['HTMLAudioElement', 'audio'],
  ['HTMLBaseElement', 'base'],
  ['HTMLButtonElement', 'button'],
  ['HTMLCanvasElement', 'canvas'],
  ['HTMLDataElement', 'data'],
  ['HTMLDataListElement', 'datalist'],
  ['HTMLDetailsElement', 'details'],
  ['HTMLDialogElement', 'dialog'],
  ['HTMLDivElement', 'div'],
  ['HTMLDListElement', 'dl'],
  ['HTMLEmbedElement', 'embed'],
  ['HTMLFieldSetElement', 'fieldset'],
  ['HTMLFormElement', 'form'],
  ['HTMLHRElement', 'hr'],
  ['HTMLIFrameElement', 'iframe'],
  ['HTMLImageElement', 'img'],
  ['HTMLInputElement', 'input'],
  ['HTMLLabelElement', 'label'],
  ['HTMLLegendElement', 'legend'],
  ['HTMLLIElement', 'li'],
  ['HTMLLinkElement', 'link'],
  ['HTMLMapElement', 'map'],
  ['HTMLMetaElement', 'meta'],
  ['HTMLMeterElement', 'meter'],
  ['HTMLModElement', 'del'],
  ['HTMLObjectElement', 'object'],
  ['HTMLOListElement', 'ol'],
  ['HTMLOptGroupElement', 'optgroup'],
  ['HTMLOptionElement', 'option'],
  ['HTMLOutputElement', 'output'],
  ['HTMLParagraphElement', 'p'],
  ['HTMLParamElement', 'param'],
  ['HTMLPictureElement', 'picture'],
  ['HTMLPreElement', 'pre'],
  ['HTMLProgressElement', 'progress'],
  ['HTMLQuoteElement', 'blockquote'],
  ['HTMLScriptElement', 'script'],
  ['HTMLSelectElement', 'select'],
  ['HTMLSlotElement', 'slot'],
  ['HTMLSourceElement', 'source'],
  ['HTMLSpanElement', 'span'],
  ['HTMLStyleElement', 'style'],
  ['HTMLTableElement', 'table'],
  ['HTMLTableSectionElement', 'tbody'],
  ['HTMLTableCellElement', 'td'],
  ['HTMLTemplateElement', 'template'],
  ['HTMLTextAreaElement', 'textarea'],
  ['HTMLTimeElement', 'time'],
  ['HTMLTitleElement', 'title'],
  ['HTMLTableRowElement', 'tr'],
  ['HTMLTrackElement', 'track'],
  ['HTMLUListElement', 'ul'],
  ['HTMLVideoElement', 'video'],
  ['HTMLHeadingElement', 'h1']
].forEach(([cls, tag]) => registerTag(cls, tag));

export const elementDefine =
  (inConfig: ElementConfig | string): ClassDecorator =>
  (constructor: any) => {
    const config: ElementConfig = typeof inConfig === 'string' ? { name: inConfig } : inConfig;

    let extendsTagName = config.extends;
    if (!extendsTagName) {
      let proto = Object.getPrototypeOf(constructor);
      while (proto && proto !== HTMLElement && proto !== Function.prototype) {
        extendsTagName = BUILT_IN_TAG_MAP.get(proto);
        if (extendsTagName) break;
        proto = Object.getPrototypeOf(proto);
      }
    }

    const attributePropsList = getAttributeMetadataList(constructor);
    const emitCustomEventList = getEmitCustomEventMetadataList(constructor);
    const stateList = getStateMetadataList(constructor);
    const observedFromProps = attributePropsList ? attributePropsList.map(it => it.options.name!) : [];
    const observedFromEmits = emitCustomEventList ? emitCustomEventList.map(it => it.options.attributeName!) : [];
    const mergedObservedAttributes = [...new Set([...(config.observedAttributes ?? []), ...observedFromProps, ...observedFromEmits])];

    const NewClass = class extends (constructor as any) {
      private _swcId = Math.random().toString(36).substring(2, 11);
      private _observer: MutationObserver | null = null;
      private _boundElements = new WeakMap<Element, Set<string | symbol>>();
      private _activeListeners: Array<{ el: Element | HTMLElement; type: string; handler: EventListener; options?: any }> = [];
      private _emitHandlers = new Map<string, EventListener>();
      private _stateBindings = new Map<string, any[]>();
      private _internalStates = new Map<string | symbol, any>();
      private _externalSources = new Map<string, HTMLElement>();

      static get observedAttributes() {
        return mergedObservedAttributes;
      }

      constructor(...args: any[]) {
        super(...args);

        if (stateList) {
          stateList.forEach(meta => {
            const key = meta.propertyKey;
            const stateName = meta.options.name!;

            // 필드 초기화로 덮어씌워지기 전/후의 값을 확실히 낚아챔
            const initialVal = (this as any)[key];
            this._internalStates.set(
              key,
              SwcUtils.createReactiveProxy(initialVal, () => this._updateState(stateName))
            );

            Object.defineProperty(this, key, {
              get: () => this._internalStates.get(key),
              set: newVal => {
                if (this._internalStates.get(key) === newVal) return;
                this._internalStates.set(
                  key,
                  SwcUtils.createReactiveProxy(newVal, () => this._updateState(stateName))
                );
                this._updateState(stateName);
              },
              enumerable: true,
              configurable: true
            });
          });
        }

        const innerHtmlList = getInnerHtmlMetadataList(this);
        if (innerHtmlList?.some(it => it.options.useShadow === true) && !this.shadowRoot) {
          this.attachShadow({ mode: 'open' });
        }
      }

      private _syncDecorators() {
        this._buildStateMap();
        const getSearchRoots = (rootOption?: string): Node[] => {
          const roots: Node[] = [];
          if (rootOption === 'shadow') {
            if (this.shadowRoot) roots.push(this.shadowRoot);
          } else if (rootOption === 'light') {
            roots.push(this as any as Node);
          } else if (rootOption === 'all') {
            if (this.shadowRoot) roots.push(this.shadowRoot);
            roots.push(this as any as Node);
          } else {
            roots.push(this.shadowRoot || (this as any as Node));
          }
          return roots;
        };

        const queryMetadata = getQueryMetadata(this);
        if (queryMetadata) {
          queryMetadata
            .filter(it => it.isMethod)
            .forEach(it => {
              const searchRoots = getSearchRoots(it.options.root);
              let foundEl: Element | null = null;
              for (const root of searchRoots) {
                foundEl = it.selector ? (root as HTMLElement).querySelector(it.selector) : (this as any as Element);
                if (foundEl) break;
              }
              if (foundEl) {
                let bound = this._boundElements.get(foundEl);
                if (!bound) {
                  bound = new Set();
                  this._boundElements.set(foundEl, bound);
                }
                if (!bound.has(it.propertyKey)) {
                  (this as any)[it.propertyKey](foundEl);
                  bound.add(it.propertyKey);
                }
              }
            });
        }

        const queryAllMetadata = getQueryAllMetadata(this);
        if (queryAllMetadata) {
          queryAllMetadata
            .filter(it => it.isMethod)
            .forEach(it => {
              const searchRoots = getSearchRoots(it.options.root);
              const allElements: Element[] = [];
              searchRoots.forEach(root => {
                const found = it.selector ? (root as HTMLElement).querySelectorAll(it.selector) : [this as any as Element];
                allElements.push(...Array.from(found));
              });
              (this as any)[it.propertyKey](allElements);
            });
        }

        const eventListeners = getAddEventListenerMetadata(this);
        if (eventListeners) {
          eventListeners.forEach(it => {
            const { query, type, root: rootOption, ...options } = it.options;
            const searchRoots = getSearchRoots(rootOption);
            searchRoots.forEach(root => {
              const targetElements = query ? (root as HTMLElement).querySelectorAll(query) : [this as any as Element];
              targetElements.forEach(targetElement => {
                if (targetElement) {
                  let bound = this._boundElements.get(targetElement);
                  if (!bound) {
                    bound = new Set();
                    this._boundElements.set(targetElement, bound);
                  }
                  const eventKey = `event:${String(it.propertyKey)}:${type}`;
                  if (!bound.has(eventKey)) {
                    const handler = (event: any) => {
                      if (it.options.stopImmediatePropagation) event.stopImmediatePropagation();
                      if (it.options.stopPropagation) event.stopPropagation();
                      if (it.options.preventDefault) event.preventDefault();
                      (this as any)[it.propertyKey](event, targetElement);
                    };
                    targetElement.addEventListener(type, handler, options);
                    bound.add(eventKey);
                    if (config.autoRemoveEventListeners) this._activeListeners.push({ el: targetElement, type, handler, options });
                    const addEventMethods = getLifecycleMetadata(this, ON_ADD_EVENT_LISTENER_METADATA_KEY);
                    addEventMethods?.forEach(m => {
                      if (typeof (this as any)[m] === 'function') (this as any)[m](targetElement, type, handler);
                    });
                  }
                }
              });
            });
          });
        }
      }

      private _buildStateMap() {
        // 기존 바인딩 맵을 완전히 비우지 않고 유지하면서 새로운 노드만 추가함 (바인딩 소실 방지 핵심)
        const scan = (root: Node) => {
          const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
          let node: Node | null = null;
          while ((node = walker.nextNode())) {
            if (node.nodeType === Node.TEXT_NODE) this._parseAndBind(node, 'text');
            else if (node.nodeType === Node.ELEMENT_NODE) {
              const el = node as HTMLElement;
              const alias = el.getAttribute('as');
              if (alias && !this._externalSources.has(alias)) {
                this._externalSources.set(alias, el);
                el.addEventListener(STATE_CHANGE_EVENT, () => this._updateState(alias));
              }
              Array.from(el.attributes).forEach(attr => this._parseAndBind(attr, 'attribute', el));
            }
          }
        };
        if (this.shadowRoot) scan(this.shadowRoot);
        scan(this as any as Node);
      }

      private _parseAndBind(node: Node | Attr, type: 'text' | 'attribute', owner?: HTMLElement) {
        const tplKey = `__swc_original_${this._swcId}`;
        // 이미 이 인스턴스에 의해 바인딩된 노드라면 스킵 (중복 방지)
        const isAlreadyBound = (node as any).__swc_bound_ids?.has(this._swcId);

        // 텍스트는 원본 템플릿(tplKey)에서, 없으면 현재 내용에서 추출
        const content = (node as any)[tplKey] || node.textContent || '';
        const matches = Array.from(content.matchAll(/{{(.*?)}}/g));
        if (matches.length === 0) return;

        if (isAlreadyBound) return;

        matches.forEach(match => {
          const fullPath = match[1].trim();
          const rootName = fullPath.split('.')[0];

          const isState = stateList?.some(s => s.options.name === rootName);
          const isLogicKey = (this as any)._asKey === rootName || (this as any)._asIndexKey === rootName;
          const isExternal = this._externalSources.has(rootName);
          const isSelfAlias = this.getAttribute('as') === rootName;

          if (!isState && !isLogicKey && !isExternal && !isSelfAlias) return;

          if (!this._stateBindings.has(rootName)) this._stateBindings.set(rootName, []);

          if (!(node as any)[tplKey]) (node as any)[tplKey] = content;

          // 바인딩 ID 기록
          if (!(node as any).__swc_bound_ids) (node as any).__swc_bound_ids = new Set();
          (node as any).__swc_bound_ids.add(this._swcId);

          this._stateBindings.get(rootName)!.push({ node, type, owner, path: fullPath });
          this._updateState(rootName);
        });
      }

      private _updateState(stateName: string) {
        if (!this._stateBindings) return;
        this._executeBindingUpdate(stateName);
        const selfAlias = this.getAttribute('as');
        if (selfAlias && selfAlias !== stateName) this._executeBindingUpdate(selfAlias);
        this.dispatchEvent(new CustomEvent(STATE_CHANGE_EVENT, { bubbles: true, composed: true }));
      }

      private _executeBindingUpdate(stateName: string) {
        const bindings = this._stateBindings.get(stateName);
        if (!bindings) return;
        const tplKey = `__swc_original_${this._swcId}`;

        bindings.forEach(bin => {
          let text = (bin.node as any)[tplKey];
          if (!text) return;

          const matches = Array.from(text.matchAll(/{{(.*?)}}/g));
          let updatedText = text;

          for (const match of matches) {
            const path = match[1].trim();
            const root = path.split('.')[0];
            let val: any = undefined;
            let current: HTMLElement | null = this as any as HTMLElement;

            while (current) {
              const currentNewClass = current as any;
              if (current.getAttribute('as') === root) {
                val = SwcUtils.getValueByPath(current, path.split('.').slice(1).join('.') || 'value', 'value');
                if (val !== undefined) break;
              }
              const externalSource = currentNewClass._externalSources?.get(root);
              if (externalSource) {
                val = SwcUtils.getValueByPath(externalSource, path.split('.').slice(1).join('.') || 'value', 'value');
                if (val !== undefined) break;
              }
              const cStates = getStateMetadataList(current.constructor);
              const cAttrs = getAttributeMetadataList(current.constructor);
              const sMeta = cStates?.find(s => s.options.name === root);
              const aMeta = cAttrs?.find(a => a.options.name === root);
              if (sMeta || aMeta) {
                let aPath = path;
                if (sMeta && sMeta.options.name !== String(sMeta.propertyKey)) aPath = path.replace(sMeta.options.name!, String(sMeta.propertyKey));
                else if (aMeta && aMeta.options.name !== String(aMeta.propertyKey)) aPath = path.replace(aMeta.options.name!, String(aMeta.propertyKey));
                val = SwcUtils.getValueByPath(current, aPath, root);
                if (val !== undefined) break;
              }
              current = current.parentElement || (current.getRootNode() as any).host;
            }

            if (val !== undefined) {
              const strVal = val === null || val === undefined ? '' : typeof val === 'object' ? '[Object]' : String(val);
              updatedText = updatedText.replace(match[0], strVal);

              if (bin.type === 'attribute' && bin.owner) {
                const attrName = (bin.node as Attr).name;
                if (val === null || val === undefined) bin.owner.removeAttribute(attrName);
                else {
                  bin.owner.setAttribute(attrName, updatedText);
                  if ((attrName === 'value' || attrName === 'checked') && bin.owner.tagName.match(/INPUT|TEXTAREA|SELECT/)) {
                    (bin.owner as any)[attrName] = updatedText;
                  }
                }
              }
            }
          }
          if (bin.type === 'text') bin.node.textContent = updatedText;
        });
      }

      disconnectedCallback() {
        const bMethods = getLifecycleMetadata(this, ON_BEFORE_DISCONNECTED_METADATA_KEY);
        bMethods?.forEach(m => {
          if (typeof (this as any)[m] === 'function') (this as any)[m]();
        });
        if (this._observer) this._observer.disconnect();
        if (config.autoRemoveEventListeners) {
          this._activeListeners.forEach(({ el, type, handler, options }) => el.removeEventListener(type, handler, options));
          this._activeListeners = [];
        }
        if (super.disconnectedCallback) super.disconnectedCallback();
        const aMethods = getLifecycleMetadata(this, ON_AFTER_DISCONNECTED_METADATA_KEY);
        aMethods?.forEach(m => {
          if (typeof (this as any)[m] === 'function') (this as any)[m]();
        });
      }

      adoptedCallback() {
        const bMethods = getLifecycleMetadata(this, ON_BEFORE_ADOPTED_METADATA_KEY);
        bMethods?.forEach(m => {
          if (typeof (this as any)[m] === 'function') (this as any)[m]();
        });
        if (super.adoptedCallback) super.adoptedCallback();
        const aMethods = getLifecycleMetadata(this, ON_AFTER_ADOPTED_METADATA_KEY);
        aMethods?.forEach(m => {
          if (typeof (this as any)[m] === 'function') (this as any)[m]();
        });
      }

      async connectedCallback() {
        const bMethods = getLifecycleMetadata(this, ON_BEFORE_CONNECTED_METADATA_KEY);
        bMethods?.forEach(m => {
          if (typeof (this as any)[m] === 'function') (this as any)[m]();
        });
        if (typeof (this as any).initCore === 'function') (this as any).initCore();
        const iHtmlList = getInnerHtmlMetadataList(this);
        let sContent = '';
        let lContent = '';
        if (iHtmlList) {
          for (const meta of iHtmlList) {
            const result = await (this as any)[meta.propertyKey]();
            if (result !== undefined) {
              if (meta.options.useShadow === true) sContent += result;
              else lContent += result;
            }
          }
        }
        if (this.shadowRoot) this.shadowRoot.innerHTML = sContent;
        if (lContent) this.innerHTML = lContent;
        (this as any)._syncDecorators();
        this._observer = new MutationObserver(() => (this as any)._syncDecorators());
        this._observer.observe(this.shadowRoot || this, { childList: true, subtree: true });
        if (super.connectedCallback) await super.connectedCallback();
        const aMethods = getLifecycleMetadata(this, ON_AFTER_CONNECTED_METADATA_KEY);
        aMethods?.forEach(m => {
          if (typeof (this as any)[m] === 'function') (this as any)[m]();
        });
      }

      attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
        if (super.attributeChangedCallback) super.attributeChangedCallback(name, oldValue, newValue);
        if (attributePropsList) {
          attributePropsList.forEach(meta => {
            if (meta.options.name === name) {
              if (String((this as any)[meta.propertyKey]) !== String(newValue)) (this as any)[meta.propertyKey] = newValue;
            }
          });
        }
        if (typeof (this as any)._updateState === 'function') (this as any)._updateState(name);
        const aMethodsMap = getLifecycleMetadata(constructor, ON_ATTRIBUTE_CHANGED_METADATA_KEY) as Map<string, (string | symbol)[]>;
        const mKeys = aMethodsMap?.get(name);
        if (mKeys && Array.isArray(mKeys))
          mKeys.forEach(key => {
            if (typeof (this as any)[key] === 'function') (this as any)[key](newValue, oldValue, name);
          });
        if (emitCustomEventList) {
          const eMeta = emitCustomEventList.find(it => it.options.attributeName === name);
          if (eMeta) {
            const eType = eMeta.options.type;
            const oHandler = this._emitHandlers.get(eType);
            if (oHandler) this.removeEventListener(eType, oHandler);
            if (newValue) {
              const nHandler = (e: Event) => {
                new Function('event', '$data', newValue).call(this, e, (e as CustomEvent).detail);
              };
              this.addEventListener(eType, nHandler);
              this._emitHandlers.set(eType, nHandler);
            }
          }
        }
        const wMethodsKeys = aMethodsMap?.get(ATTRIBUTE_CHANGED_WILDCARD);
        if (wMethodsKeys && Array.isArray(wMethodsKeys))
          wMethodsKeys.forEach(key => {
            if (typeof (this as any)[key] === 'function') (this as any)[key](newValue, oldValue, name);
          });
      }
    };

    const registry = config.customElementRegistry || (typeof customElements !== 'undefined' ? customElements : undefined);
    if (registry && !registry.get(config.name)) {
      registry.define(config.name, NewClass as any, config.extends ? { extends: config.extends } : undefined);
    }
    ReflectUtils.defineMetadata(ELEMENT_CONFIG_KEY, config, NewClass);
    return NewClass as any;
  };

export const getElementConfig = (target: any): ElementConfig | undefined => {
  const constructor = target instanceof Function ? target : target.constructor;
  return ReflectUtils.getMetadata(ELEMENT_CONFIG_KEY, constructor);
};
