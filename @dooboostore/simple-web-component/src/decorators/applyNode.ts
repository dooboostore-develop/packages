import { ReflectUtils } from '@dooboostore/core';
import { ensureInit, getElementConfig } from './elementDefine';
import { HelperHostSet, SwcRootType } from '../types';
import { SwcUtils } from "../utils/Utils";

export type ApplyNodePosition = 'beforeBegin' | 'afterBegin' | 'beforeEnd' | 'afterEnd' | 'replace' | 'replaceChildren' | 'innerHtml' | 'innerText' | 'remove';

export interface ApplyNodeOptions {
  position?: ApplyNodePosition;
  root?: SwcRootType;
  /**
   * Filter function to determine whether to perform DOM operation.
   * If it returns false, the operation is skipped.
   */
  filter?: (target: HTMLElement | ShadowRoot, newValue: any, helper: HelperHostSet) => boolean;
  /**
   * Optional loading content to display while an async method is executing.
   */
  loading?: (helper: HelperHostSet) => any;
}

export interface ApplyNodeMetadata {
  propertyKey: string | symbol;
  selector: string;
  options: ApplyNodeOptions;
}

export const APPLY_NODE_METADATA_KEY = Symbol.for('simple-web-component:apply-node');

const normalizeNodes = (res: any, doc: Document): Node[] => {
  const items = Array.isArray(res) ? res : [res];
  return items.map(it => {
    if (it instanceof Node) return it;
    return doc.createTextNode(it !== undefined && it !== null ? String(it) : '');
  });
};

const applyToDom = (targetEl: any, res: any, pos: ApplyNodePosition, doc: Document) => {
    if (!targetEl) return;
    
    if (pos === 'innerHtml') {
        targetEl.innerHTML = res !== undefined && res !== null ? String(res) : '';
        return;
    }
    
    if (pos === 'innerText') {
        if (targetEl.innerText !== undefined) {
            targetEl.innerText = res !== undefined && res !== null ? String(res) : '';
        }
        return;
    }

    const isShadowRoot = targetEl instanceof ShadowRoot;
    const nodes = normalizeNodes(res, doc);
    if (pos === 'replace') {
      if (!isShadowRoot) targetEl.replaceWith(...nodes);
    } else if (pos === 'replaceChildren') {
      targetEl.replaceChildren(...nodes);
    } else {
      if (pos === 'beforeEnd') targetEl.append(...nodes);
      else if (pos === 'afterBegin') targetEl.prepend(...nodes);
      else if (pos === 'beforeBegin' && !isShadowRoot) targetEl.before(...nodes);
      else if (pos === 'afterEnd' && !isShadowRoot) targetEl.after(...nodes);
    }
};

/**
 * @applyNode decorator to surgically add/replace nodes to a target element.
 */
export function applyNode(selector: string, options: ApplyNodeOptions = { position: 'beforeEnd' }): MethodDecorator {
  return (targetObj: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const constructor = targetObj.constructor;
    let metaList = ReflectUtils.getOwnMetadata(APPLY_NODE_METADATA_KEY, constructor) as Map<string | symbol, ApplyNodeMetadata>;
    if (!metaList) {
      metaList = new Map<string | symbol, ApplyNodeMetadata>();
      ReflectUtils.defineMetadata(APPLY_NODE_METADATA_KEY, metaList, constructor);
    }
    metaList.set(propertyKey, { propertyKey, selector, options });

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

        if (selector === ':host') return applyRoot(this);
        if (selector === ':parentHost') return applyRoot(hostSet.$parentHost);
        if (selector === ':appHost') return applyRoot(hostSet.$appHost);
        if (selector === ':firstHost') return applyRoot(hostSet.$firstHost);
        if (selector === ':lastHost') return applyRoot(hostSet.$lastHost);
        
        const targetRoot = applyRoot(this);
        return targetRoot ? targetRoot.querySelector(selector) : null;
      };

      const targetEl = getTarget();
      const res = original.apply(this, args);

      const runApply = (target: any, val: any) => {
        const pos = options.position || 'beforeEnd';
        
        // Intelligent Default Filter
        const defaultFilter = (t: any, v: any) => {
            if (v instanceof Node) return !t.contains(v);
            if (pos === 'innerHtml' && typeof v === 'string') return t.innerHTML !== v;
            if (pos === 'replaceChildren' && v instanceof Node) return !t.contains(v);
            return true;
        };
        
        const activeFilter = options.filter || defaultFilter;
        
        if (activeFilter(target, val, hostSet)) {
            applyToDom(target, val, pos, currentDoc);
        }
      };

      if (res instanceof Promise) {
          // 비동기일 때만 로딩 표시
          if (targetEl && options.loading) {
              const loadingRes = options.loading.call(this, hostSet);
              applyToDom(targetEl, loadingRes, options.position || 'beforeEnd', currentDoc);
          }

          return res.then(finalRes => {
              if (finalRes !== undefined && targetEl) runApply(targetEl, finalRes);
              return finalRes;
          });
      } else {
          if (res !== undefined && targetEl) runApply(targetEl, res);
          return res;
      }
    };
  };
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

export function applyNodeHost(options: ApplyNodeOptions): MethodDecorator;
export function applyNodeHost(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function applyNodeHost(targetOrOptions?: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor): any {
  if (propertyKey !== undefined) return applyNode(':host', { position: 'beforeEnd' })(targetOrOptions, propertyKey, descriptor);
  const opt = targetOrOptions || {};
  return applyNode(':host', { position: 'beforeEnd', ...opt });
}

export function applyReplaceChildrenNodeHost(options: ApplyNodeOptions): MethodDecorator;
export function applyReplaceChildrenNodeHost(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function applyReplaceChildrenNodeHost(targetOrOptions?: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor): any {
  if (propertyKey !== undefined) return applyNode(':host', { position: 'replaceChildren' })(targetOrOptions, propertyKey, descriptor);
  const opt = targetOrOptions || {};
  return applyNode(':host', { position: 'replaceChildren', ...opt });
}

export function applyInnerHtmlNodeHost(options: ApplyNodeOptions): MethodDecorator;
export function applyInnerHtmlNodeHost(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function applyInnerHtmlNodeHost(targetOrOptions?: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor): any {
  if (propertyKey !== undefined) return applyNode(':host', { position: 'innerHtml' })(targetOrOptions, propertyKey, descriptor);
  const opt = targetOrOptions || {};
  return applyNode(':host', { position: 'innerHtml', ...opt });
}

export function applyReplaceChildrenNode(selector: string, options: ApplyNodeOptions = {}): MethodDecorator {
    return applyNode(selector, { ...options, position: 'replaceChildren' });
}

export function applyInnerHtmlNode(selector: string, options: ApplyNodeOptions = {}): MethodDecorator {
    return applyNode(selector, { ...options, position: 'innerHtml' });
}
