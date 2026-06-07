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

export type ApplyNodeSelector = string | ((currentThis: any, helper: HelperHostSet) => NodeList | Element | Element[] | null);

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
  selector: ApplyNodeSelector;
  options: ApplyNodeOptions;
}

export const APPLY_NODE_METADATA_KEY = Symbol.for('simple-web-component:apply-node');

/**
 * Resolve selector to string or elements
 * Handles function-based selectors and returns elements if applicable
 */
const resolveSelector = (selector: ApplyNodeSelector, inst: any, win: Window): string | HTMLElement | null => {
  if (typeof selector === 'function') {
    const hostSet = SwcUtils.getHelperAndHostSet(win, inst);
    const result = selector(inst, hostSet);
    
    if (result instanceof win.Element) {
      return result as HTMLElement;
    }
    if (result instanceof win.NodeList) {
      return result.length > 0 ? (result[0] as HTMLElement) : null;
    }
    if (Array.isArray(result)) {
      return result.length > 0 ? (result[0] as HTMLElement) : null;
    }
    if (result === null) {
      return null;
    }
    // result must be a string at this point
    return result as unknown as string;
  }
  return selector as string;
};

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

  if (res instanceof win.Node) {
    nodes.push(res);
  } else if (typeof res === 'string' && pos === 'innerHtml') {
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
 * 
 * Overloads:
 * - applyNode(selector, options) - Apply to specific selector
 * - applyNode(options) - Apply to $this (current element)
 */
export function applyNode(selector: ApplyNodeSelector, options?: ApplyNodeOptions): MethodDecorator;
export function applyNode(options: ApplyNodeOptions): MethodDecorator;
export function applyNode(selectorOrOptions: ApplyNodeSelector | ApplyNodeOptions, maybeOptions?: ApplyNodeOptions): MethodDecorator {
  // Determine selector and options based on overload
  let selector: ApplyNodeSelector;
  let options: ApplyNodeOptions;

  if (typeof selectorOrOptions === 'string' || typeof selectorOrOptions === 'function') {
    // First overload: applyNode(selector, options)
    selector = selectorOrOptions;
    options = maybeOptions || {position: 'replaceChildren'};
  } else {
    // Second overload: applyNode(options) - default to $this
    selector = '$this';
    options = selectorOrOptions || {position: 'replaceChildren'};
  }

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

        // Resolve selector if it's a function
        const resolved = resolveSelector(selector, this, currentWin);
        
        // If selector function returned an element directly, use it
        if (resolved instanceof currentWin.Element) {
          return applyRoot(resolved);
        }
        if (resolved === null) {
          return null;
        }

        // Handle string selector
        const stringSelector = resolved as string;

        if (stringSelector === '$this') return applyRoot(this);
        if (stringSelector === '$host') return applyRoot(hostSet.$host);
        if (stringSelector === '$parentHost') return applyRoot(hostSet.$parentHost);
        if (stringSelector === '$appHost') return applyRoot(hostSet.$appHost);
        if (stringSelector === '$firstHost') return applyRoot(hostSet.$firstHost);
        if (stringSelector === '$lastHost') return applyRoot(hostSet.$lastHost);

        const targetRoot = applyRoot(this);
        return targetRoot ? targetRoot.querySelector(stringSelector) : null;
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

// --- Overloaded convenience functions for common patterns ---

/**
 * @replaceChildrenNode decorator - replaces children of target element
 * 
 * Overloads:
 * - replaceChildrenNode(selector, options) - Replace children of specific selector
 * - replaceChildrenNode(options) - Replace children of $this (current element)
 * - @replaceChildrenNode - Bare decorator, replaces children of $this
 */
export function replaceChildren(selector: ApplyNodeSelector, options?: Omit<ApplyNodeOptions, 'position'>): MethodDecorator;
export function replaceChildren(options: Omit<ApplyNodeOptions, 'position'>): MethodDecorator;
export function replaceChildren(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor | void;
export function replaceChildren(selectorOrOptions?: ApplyNodeSelector | Omit<ApplyNodeOptions, 'position'> | Object, maybeOptions?: Omit<ApplyNodeOptions, 'position'> | string | symbol, descriptor?: PropertyDescriptor): MethodDecorator | PropertyDescriptor | void {
  // Bare decorator usage: @replaceChildrenNode
  if (descriptor !== undefined && (typeof maybeOptions === 'symbol' || typeof maybeOptions === 'string')) {
    return applyNode({position: 'replaceChildren'})(selectorOrOptions, maybeOptions, descriptor);
  }
  
  if (typeof selectorOrOptions === 'string' || typeof selectorOrOptions === 'function') {
    return applyNode(selectorOrOptions as ApplyNodeSelector, {...maybeOptions as Omit<ApplyNodeOptions, 'position'>, position: 'replaceChildren'});
  }
  return applyNode({...selectorOrOptions as Omit<ApplyNodeOptions, 'position'>, position: 'replaceChildren'});
}

/**
 * @clearChildrenNode decorator - clears all children of target element
 * 
 * Overloads:
 * - clearChildrenNode(selector, options) - Clear children of specific selector
 * - clearChildrenNode(options) - Clear children of $this (current element)
 * - @clearChildrenNode - Bare decorator, clears children of $this
 */
export function clearChildrenNode(selector: ApplyNodeSelector, options?: Omit<ApplyNodeOptions, 'position'>): MethodDecorator;
export function clearChildrenNode(options?: Omit<ApplyNodeOptions, 'position'>): MethodDecorator;
export function clearChildrenNode(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor | void;
export function clearChildrenNode(selectorOrOptions?: ApplyNodeSelector | Omit<ApplyNodeOptions, 'position'> | Object, maybeOptions?: Omit<ApplyNodeOptions, 'position'> | string | symbol, descriptor?: PropertyDescriptor): MethodDecorator | PropertyDescriptor | void {
  // Bare decorator usage: @clearChildrenNode
  if (descriptor !== undefined && (typeof maybeOptions === 'symbol' || typeof maybeOptions === 'string')) {
    return applyNode({position: 'clearChildren'})(selectorOrOptions, maybeOptions, descriptor);
  }
  
  if (typeof selectorOrOptions === 'string' || typeof selectorOrOptions === 'function') {
    return applyNode(selectorOrOptions as ApplyNodeSelector, {...maybeOptions as Omit<ApplyNodeOptions, 'position'>, position: 'clearChildren'});
  }
  return applyNode({...selectorOrOptions as Omit<ApplyNodeOptions, 'position'>, position: 'clearChildren'});
}

// Alias for clearChildrenNode
export const clearNode = clearChildrenNode;

/**
 * @innerHtmlNode decorator - sets innerHTML of target element
 * 
 * Overloads:
 * - innerHtmlNode(selector, options) - Set innerHTML of specific selector
 * - innerHtmlNode(options) - Set innerHTML of $this (current element)
 * - @innerHtmlNode - Bare decorator, sets innerHTML of $this
 */
export function innerHtml(selector: ApplyNodeSelector, options?: Omit<ApplyNodeOptions, 'position'>): MethodDecorator;
export function innerHtml(options?: Omit<ApplyNodeOptions, 'position'>): MethodDecorator;
export function innerHtml(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor | void;
export function innerHtml(selectorOrOptions?: ApplyNodeSelector | Omit<ApplyNodeOptions, 'position'> | Object, maybeOptions?: Omit<ApplyNodeOptions, 'position'> | string | symbol, descriptor?: PropertyDescriptor): MethodDecorator | PropertyDescriptor | void {
  // Bare decorator usage: @innerHtmlNode
  if (descriptor !== undefined && (typeof maybeOptions === 'symbol' || typeof maybeOptions === 'string')) {
    return applyNode({position: 'innerHtml'})(selectorOrOptions, maybeOptions, descriptor);
  }
  
  if (typeof selectorOrOptions === 'string' || typeof selectorOrOptions === 'function') {
    return applyNode(selectorOrOptions as ApplyNodeSelector, {...maybeOptions as Omit<ApplyNodeOptions, 'position'>, position: 'innerHtml'});
  }
  return applyNode({...selectorOrOptions as Omit<ApplyNodeOptions, 'position'>, position: 'innerHtml'});
}

// Alias for innerHtmlNode
// export const setHtmlNode = innerHtml;

/**
 * @innerHtmlLightNode decorator - sets innerHTML of light DOM element
 * 
 * Overloads:
 * - innerHtmlLightNode(selector, options) - Set innerHTML of specific selector in light DOM
 * - innerHtmlLightNode(options) - Set innerHTML of $this in light DOM
 * - @innerHtmlLightNode - Bare decorator, sets innerHTML of $this in light DOM
 */
export function innerHtmlLight(selector: ApplyNodeSelector, options?: Omit<ApplyNodeOptions, 'position' | 'root'>): MethodDecorator;
export function innerHtmlLight(options?: Omit<ApplyNodeOptions, 'position' | 'root'>): MethodDecorator;
export function innerHtmlLight(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor | void;
export function innerHtmlLight(selectorOrOptions?: ApplyNodeSelector | Omit<ApplyNodeOptions, 'position' | 'root'> | Object, maybeOptions?: Omit<ApplyNodeOptions, 'position' | 'root'> | string | symbol, descriptor?: PropertyDescriptor): MethodDecorator | PropertyDescriptor | void {
  // Bare decorator usage: @innerHtmlLightNode
  if (descriptor !== undefined && (typeof maybeOptions === 'symbol' || typeof maybeOptions === 'string')) {
    return applyNode({position: 'innerHtml', root: 'light'})(selectorOrOptions, maybeOptions, descriptor);
  }
  
  if (typeof selectorOrOptions === 'string' || typeof selectorOrOptions === 'function') {
    return applyNode(selectorOrOptions as ApplyNodeSelector, {...maybeOptions as Omit<ApplyNodeOptions, 'position' | 'root'>, position: 'innerHtml', root: 'light'});
  }
  return applyNode({...selectorOrOptions as Omit<ApplyNodeOptions, 'position' | 'root'>, position: 'innerHtml', root: 'light'});
}


/**
 * @innerHtmlShadowNode decorator - sets innerHTML of shadow DOM element
 * 
 * Overloads:
 * - innerHtmlShadowNode(selector, options) - Set innerHTML of specific selector in shadow DOM
 * - innerHtmlShadowNode(options) - Set innerHTML of $this in shadow DOM
 * - @innerHtmlShadowNode - Bare decorator, sets innerHTML of $this in shadow DOM
 */
export function innerHtmlShadow(selector: ApplyNodeSelector, options?: Omit<ApplyNodeOptions, 'position' | 'root'>): MethodDecorator;
export function innerHtmlShadow(options?: Omit<ApplyNodeOptions, 'position' | 'root'>): MethodDecorator;
export function innerHtmlShadow(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor | void;
export function innerHtmlShadow(selectorOrOptions?: ApplyNodeSelector | Omit<ApplyNodeOptions, 'position' | 'root'> | Object, maybeOptions?: Omit<ApplyNodeOptions, 'position' | 'root'> | string | symbol, descriptor?: PropertyDescriptor): MethodDecorator | PropertyDescriptor | void {
  // Bare decorator usage: @innerHtmlShadowNode
  if (descriptor !== undefined && (typeof maybeOptions === 'symbol' || typeof maybeOptions === 'string')) {
    return applyNode({position: 'innerHtml', root: 'shadow'})(selectorOrOptions, maybeOptions, descriptor);
  }
  
  if (typeof selectorOrOptions === 'string' || typeof selectorOrOptions === 'function') {
    return applyNode(selectorOrOptions as ApplyNodeSelector, {...maybeOptions as Omit<ApplyNodeOptions, 'position' | 'root'>, position: 'innerHtml', root: 'shadow'});
  }
  return applyNode({...selectorOrOptions as Omit<ApplyNodeOptions, 'position' | 'root'>, position: 'innerHtml', root: 'shadow'});
}


/**
 * @innerTextNode decorator - sets innerText of target element
 * 
 * Overloads:
 * - innerTextNode(selector, options) - Set innerText of specific selector
 * - innerTextNode(options) - Set innerText of $this (current element)
 * - @innerTextNode - Bare decorator, sets innerText of $this
 */
export function innerText(selector: ApplyNodeSelector, options?: Omit<ApplyNodeOptions, 'position'>): MethodDecorator;
export function innerText(options?: Omit<ApplyNodeOptions, 'position'>): MethodDecorator;
export function innerText(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor | void;
export function innerText(selectorOrOptions?: ApplyNodeSelector | Omit<ApplyNodeOptions, 'position'> | Object, maybeOptions?: Omit<ApplyNodeOptions, 'position'> | string | symbol, descriptor?: PropertyDescriptor): MethodDecorator | PropertyDescriptor | void {
  // Bare decorator usage: @innerTextNode
  if (descriptor !== undefined && (typeof maybeOptions === 'symbol' || typeof maybeOptions === 'string')) {
    return applyNode({position: 'innerText'})(selectorOrOptions, maybeOptions, descriptor);
  }
  
  if (typeof selectorOrOptions === 'string' || typeof selectorOrOptions === 'function') {
    return applyNode(selectorOrOptions as ApplyNodeSelector, {...maybeOptions as Omit<ApplyNodeOptions, 'position'>, position: 'innerText'});
  }
  return applyNode({...selectorOrOptions as Omit<ApplyNodeOptions, 'position'>, position: 'innerText'});
}


/**
 * @innerTextLightNode decorator - sets innerText of light DOM element
 * 
 * Overloads:
 * - innerTextLightNode(selector, options) - Set innerText of specific selector in light DOM
 * - innerTextLightNode(options) - Set innerText of $this in light DOM
 * - @innerTextLightNode - Bare decorator, sets innerText of $this in light DOM
 */
export function innerTextLight(selector: ApplyNodeSelector, options?: Omit<ApplyNodeOptions, 'position' | 'root'>): MethodDecorator;
export function innerTextLight(options?: Omit<ApplyNodeOptions, 'position' | 'root'>): MethodDecorator;
export function innerTextLight(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor | void;
export function innerTextLight(selectorOrOptions?: ApplyNodeSelector | Omit<ApplyNodeOptions, 'position' | 'root'> | Object, maybeOptions?: Omit<ApplyNodeOptions, 'position' | 'root'> | string | symbol, descriptor?: PropertyDescriptor): MethodDecorator | PropertyDescriptor | void {
  // Bare decorator usage: @innerTextLightNode
  if (descriptor !== undefined && (typeof maybeOptions === 'symbol' || typeof maybeOptions === 'string')) {
    return applyNode({position: 'innerText', root: 'light'})(selectorOrOptions, maybeOptions, descriptor);
  }
  
  if (typeof selectorOrOptions === 'string' || typeof selectorOrOptions === 'function') {
    return applyNode(selectorOrOptions as ApplyNodeSelector, {...maybeOptions as Omit<ApplyNodeOptions, 'position' | 'root'>, position: 'innerText', root: 'light'});
  }
  return applyNode({...selectorOrOptions as Omit<ApplyNodeOptions, 'position' | 'root'>, position: 'innerText', root: 'light'});
}

/**
 * @innerTextShadowNode decorator - sets innerText of shadow DOM element
 * 
 * Overloads:
 * - innerTextShadowNode(selector, options) - Set innerText of specific selector in shadow DOM
 * - innerTextShadowNode(options) - Set innerText of $this in shadow DOM
 * - @innerTextShadowNode - Bare decorator, sets innerText of $this in shadow DOM
 */
export function innerTextShadow(selector: ApplyNodeSelector, options?: Omit<ApplyNodeOptions, 'position' | 'root'>): MethodDecorator;
export function innerTextShadow(options?: Omit<ApplyNodeOptions, 'position' | 'root'>): MethodDecorator;
export function innerTextShadow(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor | void;
export function innerTextShadow(selectorOrOptions?: ApplyNodeSelector | Omit<ApplyNodeOptions, 'position' | 'root'> | Object, maybeOptions?: Omit<ApplyNodeOptions, 'position' | 'root'> | string | symbol, descriptor?: PropertyDescriptor): MethodDecorator | PropertyDescriptor | void {
  // Bare decorator usage: @innerTextShadowNode
  if (descriptor !== undefined && (typeof maybeOptions === 'symbol' || typeof maybeOptions === 'string')) {
    return applyNode({position: 'innerText', root: 'shadow'})(selectorOrOptions, maybeOptions, descriptor);
  }
  
  if (typeof selectorOrOptions === 'string' || typeof selectorOrOptions === 'function') {
    return applyNode(selectorOrOptions as ApplyNodeSelector, {...maybeOptions as Omit<ApplyNodeOptions, 'position' | 'root'>, position: 'innerText', root: 'shadow'});
  }
  return applyNode({...selectorOrOptions as Omit<ApplyNodeOptions, 'position' | 'root'>, position: 'innerText', root: 'shadow'});
}

/**
 * @beforeEndNode decorator - appends nodes to target element
 * 
 * Overloads:
 * - beforeEndNode(selector, options) - Append to specific selector
 * - beforeEndNode(options) - Append to $this (current element)
 * - @beforeEndNode - Bare decorator, appends to $this
 */
export function insertBeforeEnd(selector: ApplyNodeSelector, options?: Omit<ApplyNodeOptions, 'position'>): MethodDecorator;
export function insertBeforeEnd(options?: Omit<ApplyNodeOptions, 'position'>): MethodDecorator;
export function insertBeforeEnd(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor | void;
export function insertBeforeEnd(selectorOrOptions?: ApplyNodeSelector | Omit<ApplyNodeOptions, 'position'> | Object, maybeOptions?: Omit<ApplyNodeOptions, 'position'> | string | symbol, descriptor?: PropertyDescriptor): MethodDecorator | PropertyDescriptor | void {
  // Bare decorator usage: @beforeEndNode
  if (descriptor !== undefined && (typeof maybeOptions === 'symbol' || typeof maybeOptions === 'string')) {
    return applyNode({position: 'beforeEnd'})(selectorOrOptions, maybeOptions, descriptor);
  }
  
  if (typeof selectorOrOptions === 'string' || typeof selectorOrOptions === 'function') {
    return applyNode(selectorOrOptions as ApplyNodeSelector, {...maybeOptions as Omit<ApplyNodeOptions, 'position'>, position: 'beforeEnd'});
  }
  return applyNode({...selectorOrOptions as Omit<ApplyNodeOptions, 'position'>, position: 'beforeEnd'});
}


/**
 * @beforeEndLightNode decorator - appends nodes to light DOM element
 * 
 * Overloads:
 * - beforeEndLightNode(selector, options) - Append to specific selector in light DOM
 * - beforeEndLightNode(options) - Append to $this in light DOM
 * - @beforeEndLightNode - Bare decorator, appends to $this in light DOM
 */
export function insertBeforeEndLight(selector: ApplyNodeSelector, options?: Omit<ApplyNodeOptions, 'position' | 'root'>): MethodDecorator;
export function insertBeforeEndLight(options?: Omit<ApplyNodeOptions, 'position' | 'root'>): MethodDecorator;
export function insertBeforeEndLight(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor | void;
export function insertBeforeEndLight(selectorOrOptions?: ApplyNodeSelector | Omit<ApplyNodeOptions, 'position' | 'root'> | Object, maybeOptions?: Omit<ApplyNodeOptions, 'position' | 'root'> | string | symbol, descriptor?: PropertyDescriptor): MethodDecorator | PropertyDescriptor | void {
  // Bare decorator usage: @beforeEndLightNode
  if (descriptor !== undefined && (typeof maybeOptions === 'symbol' || typeof maybeOptions === 'string')) {
    return applyNode({position: 'beforeEnd', root: 'light'})(selectorOrOptions, maybeOptions, descriptor);
  }
  
  if (typeof selectorOrOptions === 'string' || typeof selectorOrOptions === 'function') {
    return applyNode(selectorOrOptions as ApplyNodeSelector, {...maybeOptions as Omit<ApplyNodeOptions, 'position' | 'root'>, position: 'beforeEnd', root: 'light'});
  }
  return applyNode({...selectorOrOptions as Omit<ApplyNodeOptions, 'position' | 'root'>, position: 'beforeEnd', root: 'light'});
}


/**
 * @beforeEndShadowNode decorator - appends nodes to shadow DOM element
 * 
 * Overloads:
 * - beforeEndShadowNode(selector, options) - Append to specific selector in shadow DOM
 * - beforeEndShadowNode(options) - Append to $this in shadow DOM
 * - @beforeEndShadowNode - Bare decorator, appends to $this in shadow DOM
 */
export function insertBeforeEndShadow(selector: ApplyNodeSelector, options?: Omit<ApplyNodeOptions, 'position' | 'root'>): MethodDecorator;
export function insertBeforeEndShadow(options?: Omit<ApplyNodeOptions, 'position' | 'root'>): MethodDecorator;
export function insertBeforeEndShadow(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor | void;
export function insertBeforeEndShadow(selectorOrOptions?: ApplyNodeSelector | Omit<ApplyNodeOptions, 'position' | 'root'> | Object, maybeOptions?: Omit<ApplyNodeOptions, 'position' | 'root'> | string | symbol, descriptor?: PropertyDescriptor): MethodDecorator | PropertyDescriptor | void {
  // Bare decorator usage: @beforeEndShadowNode
  if (descriptor !== undefined && (typeof maybeOptions === 'symbol' || typeof maybeOptions === 'string')) {
    return applyNode({position: 'beforeEnd', root: 'shadow'})(selectorOrOptions, maybeOptions, descriptor);
  }
  
  if (typeof selectorOrOptions === 'string' || typeof selectorOrOptions === 'function') {
    return applyNode(selectorOrOptions as ApplyNodeSelector, {...maybeOptions as Omit<ApplyNodeOptions, 'position' | 'root'>, position: 'beforeEnd', root: 'shadow'});
  }
  return applyNode({...selectorOrOptions as Omit<ApplyNodeOptions, 'position' | 'root'>, position: 'beforeEnd', root: 'shadow'});
}


/**
 * @afterBeginNode decorator - prepends nodes to target element
 * 
 * Overloads:
 * - afterBeginNode(selector, options) - Prepend to specific selector
 * - afterBeginNode(options) - Prepend to $this (current element)
 * - @afterBeginNode - Bare decorator, prepends to $this
 */
export function insertAfterBegin(selector: ApplyNodeSelector, options?: Omit<ApplyNodeOptions, 'position'>): MethodDecorator;
export function insertAfterBegin(options?: Omit<ApplyNodeOptions, 'position'>): MethodDecorator;
export function insertAfterBegin(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor | void;
export function insertAfterBegin(selectorOrOptions?: ApplyNodeSelector | Omit<ApplyNodeOptions, 'position'> | Object, maybeOptions?: Omit<ApplyNodeOptions, 'position'> | string | symbol, descriptor?: PropertyDescriptor): MethodDecorator | PropertyDescriptor | void {
  // Bare decorator usage: @afterBeginNode
  if (descriptor !== undefined && (typeof maybeOptions === 'symbol' || typeof maybeOptions === 'string')) {
    return applyNode({position: 'afterBegin'})(selectorOrOptions, maybeOptions, descriptor);
  }
  
  if (typeof selectorOrOptions === 'string' || typeof selectorOrOptions === 'function') {
    return applyNode(selectorOrOptions as ApplyNodeSelector, {...maybeOptions as Omit<ApplyNodeOptions, 'position'>, position: 'afterBegin'});
  }
  return applyNode({...selectorOrOptions as Omit<ApplyNodeOptions, 'position'>, position: 'afterBegin'});
}


/**
 * @afterBeginLightNode decorator - prepends nodes to light DOM element
 * 
 * Overloads:
 * - afterBeginLightNode(selector, options) - Prepend to specific selector in light DOM
 * - afterBeginLightNode(options) - Prepend to $this in light DOM
 * - @afterBeginLightNode - Bare decorator, prepends to $this in light DOM
 */
export function insertAfterBeginLight(selector: ApplyNodeSelector, options?: Omit<ApplyNodeOptions, 'position' | 'root'>): MethodDecorator;
export function insertAfterBeginLight(options?: Omit<ApplyNodeOptions, 'position' | 'root'>): MethodDecorator;
export function insertAfterBeginLight(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor | void;
export function insertAfterBeginLight(selectorOrOptions?: ApplyNodeSelector | Omit<ApplyNodeOptions, 'position' | 'root'> | Object, maybeOptions?: Omit<ApplyNodeOptions, 'position' | 'root'> | string | symbol, descriptor?: PropertyDescriptor): MethodDecorator | PropertyDescriptor | void {
  // Bare decorator usage: @afterBeginLightNode
  if (descriptor !== undefined && (typeof maybeOptions === 'symbol' || typeof maybeOptions === 'string')) {
    return applyNode({position: 'afterBegin', root: 'light'})(selectorOrOptions, maybeOptions, descriptor);
  }
  
  if (typeof selectorOrOptions === 'string' || typeof selectorOrOptions === 'function') {
    return applyNode(selectorOrOptions as ApplyNodeSelector, {...maybeOptions as Omit<ApplyNodeOptions, 'position' | 'root'>, position: 'afterBegin', root: 'light'});
  }
  return applyNode({...selectorOrOptions as Omit<ApplyNodeOptions, 'position' | 'root'>, position: 'afterBegin', root: 'light'});
}


/**
 * @replaceChildrenLightNode decorator - replaces children of light DOM element
 * 
 * Overloads:
 * - replaceChildrenLightNode(selector, options) - Replace children of specific selector in light DOM
 * - replaceChildrenLightNode(options) - Replace children of $this in light DOM
 * - @replaceChildrenLightNode - Bare decorator, replaces children of $this in light DOM
 */
export function replaceChildrenLight(selector: ApplyNodeSelector, options?: Omit<ApplyNodeOptions, 'position' | 'root'>): MethodDecorator;
export function replaceChildrenLight(options?: Omit<ApplyNodeOptions, 'position' | 'root'>): MethodDecorator;
export function replaceChildrenLight(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor | void;
export function replaceChildrenLight(selectorOrOptions?: ApplyNodeSelector | Omit<ApplyNodeOptions, 'position' | 'root'> | Object, maybeOptions?: Omit<ApplyNodeOptions, 'position' | 'root'> | string | symbol, descriptor?: PropertyDescriptor): MethodDecorator | PropertyDescriptor | void {
  // Bare decorator usage: @replaceChildrenLightNode
  if (descriptor !== undefined && (typeof maybeOptions === 'symbol' || typeof maybeOptions === 'string')) {
    return applyNode({position: 'replaceChildren', root: 'light'})(selectorOrOptions, maybeOptions, descriptor);
  }
  
  if (typeof selectorOrOptions === 'string' || typeof selectorOrOptions === 'function') {
    return applyNode(selectorOrOptions as ApplyNodeSelector, {...maybeOptions as Omit<ApplyNodeOptions, 'position' | 'root'>, position: 'replaceChildren', root: 'light'});
  }
  return applyNode({...selectorOrOptions as Omit<ApplyNodeOptions, 'position' | 'root'>, position: 'replaceChildren', root: 'light'});
}

/**
 * @clearChildrenLightNode decorator - clears children of light DOM element
 * 
 * Overloads:
 * - clearChildrenLightNode(selector, options) - Clear children of specific selector in light DOM
 * - clearChildrenLightNode(options) - Clear children of $this in light DOM
 * - @clearChildrenLightNode - Bare decorator, clears children of $this in light DOM
 */
export function clearChildrenLight(selector: ApplyNodeSelector, options?: Omit<ApplyNodeOptions, 'position' | 'root'>): MethodDecorator;
export function clearChildrenLight(options?: Omit<ApplyNodeOptions, 'position' | 'root'>): MethodDecorator;
export function clearChildrenLight(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor | void;
export function clearChildrenLight(selectorOrOptions?: ApplyNodeSelector | Omit<ApplyNodeOptions, 'position' | 'root'> | Object, maybeOptions?: Omit<ApplyNodeOptions, 'position' | 'root'> | string | symbol, descriptor?: PropertyDescriptor): MethodDecorator | PropertyDescriptor | void {
  // Bare decorator usage: @clearChildrenLightNode
  if (descriptor !== undefined && (typeof maybeOptions === 'symbol' || typeof maybeOptions === 'string')) {
    return applyNode({position: 'clearChildren', root: 'light'})(selectorOrOptions, maybeOptions, descriptor);
  }
  
  if (typeof selectorOrOptions === 'string' || typeof selectorOrOptions === 'function') {
    return applyNode(selectorOrOptions as ApplyNodeSelector, {...maybeOptions as Omit<ApplyNodeOptions, 'position' | 'root'>, position: 'clearChildren', root: 'light'});
  }
  return applyNode({...selectorOrOptions as Omit<ApplyNodeOptions, 'position' | 'root'>, position: 'clearChildren', root: 'light'});
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