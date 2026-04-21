import { ReflectUtils } from '@dooboostore/core';
import { ensureInit, getElementConfig } from './elementDefine';
import {SpecialSelector, SwcQueryOptions, HelperHostSet, SwcRootType} from '../types';
import { SwcUtils} from "../utils/Utils";
import {findAllStateMetadata} from "./state";
import {ElementApply} from "@dooboostore/core-web";
/*
<!-- beforebegin -->
<p> <-- it's me
  <!-- afterbegin -->
  foo
  <!-- beforeend -->
</p>
<!-- afterend -->
 */
export type ApplyNodePosition = 'beforeBegin' | 'afterBegin' | 'beforeEnd' | 'afterEnd' | 'replace' | 'replaceChildren' | 'innerHtml' | 'innerText' | 'remove' | 'clearChildren';

export interface ApplyNodeOptions {
  position?: ApplyNodePosition;
  root?: SwcRootType;
  /**
   * Filter function to determine whether to perform DOM operation.
   * If it returns false, the operation is skipped.
   */
  filter?: (target: HTMLElement | ShadowRoot, newValue: any, meta: { currentThis: any, helper: HelperHostSet }) => boolean;
  /**
   * Optional loading content to display while an async method is executing.
   */
  fallback?: (helper: HelperHostSet) => any;
  /**
   * Custom key to extract value from return object.
   * If not provided, uses APPLY_NODE_METADATA_KEY by default.
   * Useful when multiple @applyNode decorators are on the same method.
   */
  valueKey?: symbol | string;
}

export interface ApplyNodeMetadata {
  propertyKey: string | symbol;
  selector: string;
  options: ApplyNodeOptions;
}

export const APPLY_NODE_METADATA_KEY = Symbol.for('simple-web-component:apply-node');

// const normalizeNodes = (res: any, doc: Document): Node[] => {
//   const items = Array.isArray(res) ? res : [res];
//   return items.map(it => {
//     if (it instanceof Node) return it;
//     return doc.createTextNode(it !== undefined && it !== null ? String(it) : '');
//   });
// };

const applyToDom = (currentThis: any, targetEl: HTMLElement, res: Node | string, pos: ApplyNodePosition, win: Window, host?: any) => {
  if (!targetEl) return;
  
  // Handle clearChildren - ignore return value and always clear
  if (pos === 'clearChildren') {
    targetEl.replaceChildren();
    return [];
  }
  
  const doc = win.document;
  const hostSet = SwcUtils.getHelperAndHostSet(win, currentThis);
  const id = currentThis._swcId;

  const nodes: Node[] = [];

  if (typeof res === 'string' && pos === 'innerHtml') {
    const t = win.document.createElement('template');
    t.innerHTML = res;
    nodes.push(...Array.from(t.content.childNodes));
  } else if (typeof res === 'string' && pos === 'innerText') {
    nodes.push(win.document.createTextNode(res));
  }

  SwcUtils.projectProcessHtml(id, nodes, doc);

  const isShadowRoot = targetEl instanceof win.ShadowRoot;
  // const nodes = normalizeNodes(res, doc);
  if (pos === 'replace') {
    if (!isShadowRoot) targetEl.replaceWith(...nodes);
  } else if (pos === 'innerHtml') {
    targetEl.replaceChildren(...nodes);
  } else if (pos === 'innerText') {
    targetEl.replaceChildren(...nodes);
  } else if (pos === 'replaceChildren') {
    targetEl.replaceChildren(...nodes);
  } else {
    if (pos === 'beforeEnd') {
      targetEl.append(...nodes)
    }
    else if (pos === 'afterBegin') targetEl.prepend(...nodes);
    else if (pos === 'beforeBegin' && !isShadowRoot) targetEl.before(...nodes);
    else if (pos === 'afterEnd' && !isShadowRoot) targetEl.after(...nodes);
  }

  const stateContext: any = {...hostSet};
  findAllStateMetadata(currentThis).forEach(it => {
    stateContext[it.name] = currentThis[it.propertyKey]
  })
  new ElementApply(targetEl, {id: id}).apply({target: 'noInitialized', context: stateContext, bind: currentThis});
  return nodes;
};

/**
 * @applyNode decorator to surgically add/replace nodes to a target element.
 */
export function applyNode(selector: string, options: ApplyNodeOptions = {position: 'replaceChildren'}): MethodDecorator {
  return (targetObj: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const constructor = targetObj.constructor;
    let metaList = ReflectUtils.getOwnMetadata(APPLY_NODE_METADATA_KEY, constructor) as Map<string | symbol, ApplyNodeMetadata>;
    if (!metaList) {
      metaList = new Map<string | symbol, ApplyNodeMetadata>();
      ReflectUtils.defineMetadata(APPLY_NODE_METADATA_KEY, metaList, constructor);
    }
    metaList.set(propertyKey, {propertyKey, selector, options});

    const original = descriptor.value;
    descriptor.value = function (...args: any[]) {
      ensureInit(this);

      const conf = getElementConfig(this);
      const currentWin = (this as any)._resolveWindow?.(conf) || ((typeof window !== 'undefined' ? window : undefined) as Window);
      const currentDoc = currentWin.document;
      const hostSet = SwcUtils.getHelperAndHostSet(currentWin, this);

      const getTarget = () => {
        const r = options.root || 'auto';
        const applyRoot = (t: any) => {
          if (!t) return t;
          if (r === 'auto') return t.shadowRoot || t;
          if (r === 'shadow') return t.shadowRoot;
          if (r === 'light') return t;
          if (r === 'all') return t.shadowRoot || t;
          return t;
        };

        if (selector === '$this') return applyRoot(this);
        if (selector === '$host') return applyRoot(hostSet.$host);
        if (selector === '$parentHost') return applyRoot(hostSet.$parentHost);
        if (selector === '$appHost') return applyRoot(hostSet.$appHost);
        if (selector === '$firstHost') return applyRoot(hostSet.$firstHost);
        if (selector === '$lastHost') return applyRoot(hostSet.$lastHost);

        const targetRoot = applyRoot(this);
        return targetRoot ? targetRoot.querySelector(selector) : null;
      };

      const targetEl = getTarget();
      const res = original.apply(this, args);

      /**
       * Extract value for this decorator from method return value
       * 
       * If return value is an object with this decorator's key,
       * use that value. Otherwise use the entire return value.
       * 
       * Uses valueKey from options if provided, otherwise uses APPLY_NODE_METADATA_KEY.
       */
      const extractValue = (v: any) => {
        const keyToUse = options.valueKey ?? APPLY_NODE_METADATA_KEY;
        if (v && typeof v === 'object' && keyToUse in v) {
          return v[keyToUse];
        }
        return v;
      };

      const runApply = (target: any, val: any) => {
        const pos = options.position || 'beforeEnd';
        // Delegate HTML/node processing to applyToDom which centralizes
        // processing. runApply should not call processHtml itself to avoid
        // duplicate processing.
        const processedVal = val;

        // 사용자가 filter를 명시하면 그 조건으로, 아니면 항상 적용
        if (!options.filter || options.filter(target, processedVal, {currentThis: this, helper: hostSet})) {
          applyToDom(this, target, processedVal, pos, currentWin);
        }
      };


        const fallbackNodes: Node[] = [];
      if (targetEl && options.fallback) {
        const loadingRes = options.fallback.call(this, hostSet);
        // applyToDom expects a Window as the 4th argument
        fallbackNodes.push(...applyToDom(this, targetEl, loadingRes, options.position || 'beforeEnd', currentWin));
      }

      if (res instanceof Promise) {
        return res.then(finalRes => {
          const extracted = extractValue(finalRes);
          fallbackNodes.forEach((it: any)=>it.remove());
          if (extracted !== undefined && targetEl) runApply(targetEl, extracted);
          return finalRes;
        });
      } else {
        const extracted = extractValue(res);
        if (extracted !== undefined && targetEl) runApply(targetEl, extracted);
        return res;
      }
    };
  };
}

export function applyNodeThis(options: ApplyNodeOptions): MethodDecorator;
export function applyNodeThis(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function applyNodeThis(targetOrOptions?: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor): any {
  const option: ApplyNodeOptions = {position: 'replaceChildren'};
  if (propertyKey !== undefined) return applyNode('$this', option)(targetOrOptions, propertyKey, descriptor);
  const opt = targetOrOptions || {};
  return applyNode('$this', {...option, ...opt});
}

export function replaceChildrenNodeThis(options: Omit<ApplyNodeOptions, 'position'>): MethodDecorator;
export function replaceChildrenNodeThis(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function replaceChildrenNodeThis(targetOrOptions?: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor): any {
  const option: ApplyNodeOptions = {position: 'replaceChildren'};
  if (propertyKey !== undefined) return applyNode('$this', option)(targetOrOptions, propertyKey, descriptor);
  const opt = targetOrOptions || {};
  return applyNode('$this', {...opt, ...option});
}

// Wrapper for clearChildren - always returns empty array regardless of method return value
export function clearChildrenNodeThis(options: Omit<ApplyNodeOptions, 'position'>): MethodDecorator;
export function clearChildrenNodeThis(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function clearChildrenNodeThis(targetOrOptions?: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor): any {
  const option: ApplyNodeOptions = {position: 'clearChildren'};
  if (propertyKey !== undefined) return applyNode('$this', option)(targetOrOptions, propertyKey, descriptor);
  const opt = targetOrOptions || {};
  return applyNode('$this', {...opt, ...option});
}

// Alias for clearChildrenNodeThis
export const clearNodeThis = clearChildrenNodeThis;



export function beforeEndNodeThis(options: Omit<ApplyNodeOptions, 'position'>): MethodDecorator;
export function beforeEndNodeThis(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function beforeEndNodeThis(targetOrOptions?: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor): any {
  const options: ApplyNodeOptions = {position: 'beforeEnd'};
  if (propertyKey !== undefined) return applyNode('$this', options)(targetOrOptions, propertyKey, descriptor);
  const opt = targetOrOptions || {};
  return applyNode('$this', {...opt, ...options});
}

// Alias for beforeEndNodeThis
export const appendNodeThis = beforeEndNodeThis;

export function beforeEndLightNodeThis(options: Omit<ApplyNodeOptions, 'position' | 'root'>): MethodDecorator;
export function beforeEndLightNodeThis(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function beforeEndLightNodeThis(targetOrOptions?: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor): any {
  const option: ApplyNodeOptions = {position: 'beforeEnd', root: 'light'}
  if (propertyKey !== undefined) return applyNode('$this', option)(targetOrOptions, propertyKey, descriptor);
  const opt = targetOrOptions || {};
  return applyNode('$this', {...opt, ...option});
}

// Alias for beforeEndLightNodeThis
export const appendLightNodeThis = beforeEndLightNodeThis;

export function beforeEndShadowNodeThis(options: Omit<ApplyNodeOptions, 'position' | 'root'>): MethodDecorator;
export function beforeEndShadowNodeThis(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function beforeEndShadowNodeThis(targetOrOptions?: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor): any {
  const option: ApplyNodeOptions = {position: 'beforeEnd', root: 'shadow'}
  if (propertyKey !== undefined) return applyNode('$this', option)(targetOrOptions, propertyKey, descriptor);
  const opt = targetOrOptions || {};
  return applyNode('$this', {...opt, ...option});
}

// Alias for beforeEndShadowNodeThis
export const appendShadowNodeThis = beforeEndShadowNodeThis;

export function afterBeginNodeThis(options: Omit<ApplyNodeOptions, 'position'>): MethodDecorator;
export function afterBeginNodeThis(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function afterBeginNodeThis(targetOrOptions?: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor): any {
  const option: ApplyNodeOptions = {position: 'afterBegin'};
  if (propertyKey !== undefined) return applyNode('$this', option)(targetOrOptions, propertyKey, descriptor);
  const opt = targetOrOptions || {};
  return applyNode('$this', {...opt, ...option});
}

// Alias for afterBeginNodeThis
export const prependNodeThis = afterBeginNodeThis;

export function afterBeginLightNodeThis(options: Omit<ApplyNodeOptions, 'position' | 'root'>): MethodDecorator;
export function afterBeginLightNodeThis(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function afterBeginLightNodeThis(targetOrOptions?: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor): any {
  const option: ApplyNodeOptions = {position: 'afterBegin', root: 'light'}
  if (propertyKey !== undefined) return applyNode('$this', option)(targetOrOptions, propertyKey, descriptor);
  const opt = targetOrOptions || {};
  return applyNode('$this', {...opt, ...option});
}

// Alias for afterBeginLightNodeThis
export const prependLightNodeThis = afterBeginLightNodeThis;

export function innerHtmlNodeThis(options: Omit<ApplyNodeOptions, 'position'>): MethodDecorator;
export function innerHtmlNodeThis(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function innerHtmlNodeThis(targetOrOptions?: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor): any {
  const option: ApplyNodeOptions = {position: 'innerHtml'}
  if (propertyKey !== undefined) return applyNode('$this', option)(targetOrOptions, propertyKey, descriptor);
  const opt = targetOrOptions || {};
  return applyNode('$this', {...opt, ...option});
}

// Alias for innerHtmlNodeThis
export const setHtmlNodeThis = innerHtmlNodeThis;

export function innerTextNodeThis(options: Omit<ApplyNodeOptions, 'position'>): MethodDecorator;
export function innerTextNodeThis(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function innerTextNodeThis(targetOrOptions?: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor): any {
  const option: ApplyNodeOptions = {position: 'innerText'}
  if (propertyKey !== undefined) return applyNode('$this', option)(targetOrOptions, propertyKey, descriptor);
  const opt = targetOrOptions || {};
  return applyNode('$this', {...opt, ...option});
}

// Alias for innerTextNodeThis
export const setTextNodeThis = innerTextNodeThis;

export function innerHtmlLightNodeThis(options: Omit<ApplyNodeOptions, 'position' | 'root'>): MethodDecorator;
export function innerHtmlLightNodeThis(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function innerHtmlLightNodeThis(targetOrOptions?: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor): any {
  const option: ApplyNodeOptions = {position: 'innerHtml', root: 'light'};
  if (propertyKey !== undefined) return applyNode('$this', option)(targetOrOptions, propertyKey, descriptor);
  const opt = targetOrOptions || {};
  return applyNode('$this', {...opt, ...option});
}

// Alias for innerHtmlLightNodeThis
export const setHtmlLightNodeThis = innerHtmlLightNodeThis;

export function replaceChildrenLightNodeThis(options: Omit<ApplyNodeOptions, 'position' | 'root'>): MethodDecorator;
export function replaceChildrenLightNodeThis(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function replaceChildrenLightNodeThis(targetOrOptions?: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor): any {
  const option: ApplyNodeOptions = {position: 'replaceChildren', root: 'light'};
  if (propertyKey !== undefined) return applyNode('$this', option)(targetOrOptions, propertyKey, descriptor);
  const opt = targetOrOptions || {};
  return applyNode('$this', {...opt, ...option});
}

// Wrapper for clearChildrenLightNodeThis - always returns empty array regardless of method return value
export function clearChildrenLightNodeThis(options: Omit<ApplyNodeOptions, 'position' | 'root'>): MethodDecorator;
export function clearChildrenLightNodeThis(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function clearChildrenLightNodeThis(targetOrOptions?: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor): any {
  const option: ApplyNodeOptions = {position: 'clearChildren', root: 'light'};
  if (propertyKey !== undefined) return applyNode('$this', option)(targetOrOptions, propertyKey, descriptor);
  const opt = targetOrOptions || {};
  return applyNode('$this', {...opt, ...option});
}

// Alias for clearChildrenLightNodeThis
export const clearLightNodeThis = clearChildrenLightNodeThis;

export function replaceChildrenNode(selector: string, options: Omit<ApplyNodeOptions, 'position'> = {}): MethodDecorator {
  return applyNode(selector, {...options, position: 'replaceChildren'});
}

// Wrapper for clearChildrenNode - always returns empty array regardless of method return value
export function clearChildrenNode(selector: string, options: Omit<ApplyNodeOptions, 'position'> = {}): MethodDecorator {
  return applyNode(selector, {...options, position: 'clearChildren'});
}

// Alias for clearChildrenNode
export const clearNode = clearChildrenNode;

export function innerHtmlNode(selector: string, options: Omit<ApplyNodeOptions, 'position'> = {}): MethodDecorator {
  return applyNode(selector, {...options, position: 'innerHtml'});
}

// Alias for innerHtmlNode
export const setHtmlNode = innerHtmlNode;

export function innerHtmlLightNode(selector: string, options: Omit<ApplyNodeOptions, 'position' | 'root'> = {}): MethodDecorator {
  return applyNode(selector, {...options, position: 'innerHtml', root: 'light'});
}

// Alias for innerHtmlLightNode
export const setHtmlLightNode = innerHtmlLightNode;

export function innerHtmlShadowNode(selector: string, options: Omit<ApplyNodeOptions, 'position' | 'root'> = {}): MethodDecorator {
  return applyNode(selector, {...options, position: 'innerHtml', root: 'shadow'});
}

// Alias for innerHtmlShadowNode
export const setHtmlShadowNode = innerHtmlShadowNode;

export function innerTextNode(selector: string, options: Omit<ApplyNodeOptions, 'position'> = {}): MethodDecorator {
  return applyNode(selector, {...options, position: 'innerText'});
}

// Alias for innerTextNode
export const setTextNode = innerTextNode;

export function innerTextLightNode(selector: string, options: Omit<ApplyNodeOptions, 'position' | 'root'> = {}): MethodDecorator {
  return applyNode(selector, {...options, position: 'innerText', root: 'light'});
}

export function innerTextShadowNode(selector: string, options: Omit<ApplyNodeOptions, 'position' | 'root'> = {}): MethodDecorator {
  return applyNode(selector, {...options, position: 'innerText', root: 'shadow'});
}



export const findAllApplyNodeMetadata = (target: any): Map<string | symbol, ApplyNodeMetadata> => {
  const result = new Map<string | symbol, ApplyNodeMetadata>();
  const maps = ReflectUtils.findAllMetadata<Map<string | symbol, ApplyNodeMetadata>>(APPLY_NODE_METADATA_KEY, target);
  maps.forEach(map => {
    if (map instanceof Map) {
      map.forEach((v, k) => result.set(k, v));
    }
  });
  return result;
};