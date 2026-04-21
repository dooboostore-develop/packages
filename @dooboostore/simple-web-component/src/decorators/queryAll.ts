import { ReflectUtils } from '@dooboostore/core';
import { getElementConfig, ensureInit } from './elementDefine';
import { SwcUtils } from '../utils/Utils';
import { SpecialSelector, SwcQueryOptions, HelperHostSet } from '../types';

export interface QueryAllMetadata {
  propertyKey: string | symbol;
  selector: string;
  options: SwcQueryOptions;
}

export const QUERY_ALL_METADATA_KEY = Symbol.for('simple-web-component:query-all');

export function queryAll(target: SpecialSelector): PropertyDecorator;
export function queryAll(selector: string, options?: SwcQueryOptions): PropertyDecorator;
/**
 * @queryAll decorator to inject a list of elements into a class property.
 */
export function queryAll(selectorOrTarget: string, options: any = {}): PropertyDecorator {
  return (targetObj: Object, propertyKey: string | symbol, descriptor?: never): void => {
    if (descriptor !== undefined) {
      throw new Error(`@queryAll decorator cannot be used on methods. (Method: ${String(propertyKey)})`);
    }

    const constructor = targetObj.constructor;
    let queries = ReflectUtils.getMetadata<QueryAllMetadata[]>(QUERY_ALL_METADATA_KEY, constructor);
    if (!queries) {
      queries = [];
      ReflectUtils.defineMetadata(QUERY_ALL_METADATA_KEY, queries, constructor);
    }
    queries.push({ propertyKey, selector: selectorOrTarget, options });

    Object.defineProperty(targetObj, propertyKey, {
      get(this: HTMLElement) {
        ensureInit(this);
        const selector = selectorOrTarget;

        const r = options.root || 'auto';
        const applyRoot = (t: any): any[] => {
          if (!t) return [];
          const items = Array.isArray(t) ? t : [t];
          const results: any[] = [];
          items.forEach(it => {
            if (!(it instanceof HTMLElement)) {
              results.push(it);
              return;
            }
            if (r === 'auto') results.push(it.shadowRoot || it);
            else {
              if (r === 'light' || r === 'all') results.push(it);
              if ((r === 'shadow' || r === 'all') && it.shadowRoot) results.push(it.shadowRoot);
            }
          });
          return results;
        };

        // --- Special Selectors: HostSet ---
        const hostSet = SwcUtils.getHostSet(this);
        if (selector === '$hosts') return applyRoot(hostSet.$hosts);
        if (selector === '$appHosts') return applyRoot(hostSet.$appHosts);
        if (selector === '$host') return applyRoot(hostSet.$host);
        if (selector === '$parentHost') return applyRoot(hostSet.$parentHost);
        if (selector === '$appHost') return applyRoot(hostSet.$appHost);
        if (selector === '$firstHost') return applyRoot(hostSet.$firstHost);
        if (selector === '$lastHost') return applyRoot(hostSet.$lastHost);
        if (selector === '$firstAppHost') return applyRoot(hostSet.$firstAppHost);
        if (selector === '$lastAppHost') return applyRoot(hostSet.$lastAppHost);

        // --- Special Selectors: Env ---
        const config = getElementConfig(this);
        const win = config?.window || window;
        if (selector === '$window') return [win];
        if (selector === '$document') return [win.document];
        if (selector === '$this') return applyRoot(this);

        // --- Standard Selectors ---
        if (r === 'shadow') return this.shadowRoot ? Array.from(this.shadowRoot.querySelectorAll(selector)) : [];
        if (r === 'light') return Array.from(this.querySelectorAll(selector));
        if (r === 'all') {
          const sNodes = this.shadowRoot ? Array.from(this.shadowRoot.querySelectorAll(selector)) : [];
          const lNodes = Array.from(this.querySelectorAll(selector));
          return [...sNodes, ...lNodes];
        }
        const root = this.shadowRoot || this;
        return Array.from(root.querySelectorAll(selector));
      },
      set(this: HTMLElement, nv: any) {
        ensureInit(this);
        if (nv === null || nv === undefined || (Array.isArray(nv) && nv.length === 0)) {
          const selector = selectorOrTarget;
          if (selector.startsWith('$') && selector !== '$this') return;

          const r = options.root || 'auto';
          let targets: (Element | Node)[] = [];
          if (r === 'shadow') targets = this.shadowRoot ? Array.from(this.shadowRoot.querySelectorAll(selector)) : [];
          else if (r === 'light') targets = Array.from(this.querySelectorAll(selector));
          else if (r === 'all') {
            const sNodes = this.shadowRoot ? Array.from(this.shadowRoot.querySelectorAll(selector)) : [];
            const lNodes = Array.from(this.querySelectorAll(selector));
            targets = [...sNodes, ...lNodes];
          } else {
            targets = Array.from((this.shadowRoot || this).querySelectorAll(selector));
          }
          targets.forEach(t => (t as Element).remove());
        }
      },
      enumerable: true,
      configurable: true
    });
  };
}

/**
 * @queryAllThis decorator - simplified version of @queryAll for $this selector
 */
export function queryAllThis(target: Object, propertyKey: string | symbol): void;
export function queryAllThis(): PropertyDecorator;
export function queryAllThis(options: SwcQueryOptions): PropertyDecorator;
export function queryAllThis(targetOrOptions?: any, propertyKey?: string | symbol): any {
  if (propertyKey !== undefined && (typeof propertyKey === 'string' || typeof propertyKey === 'symbol')) {
    return queryAll('$this', {})(targetOrOptions, propertyKey);
  }

  if (typeof targetOrOptions === 'object' && targetOrOptions !== null) {
    return queryAll('$this', targetOrOptions as SwcQueryOptions);
  } else {
    return queryAll('$this', {});
  }
}

/**
 * @allParentHost - Query all parent SWC components
 */
export function allParentHost(target: Object, propertyKey: string | symbol): void;
export function allParentHost(): PropertyDecorator;
export function allParentHost(options: SwcQueryOptions): PropertyDecorator;
export function allParentHost(targetOrOptions?: any, propertyKey?: string | symbol): any {
  if (propertyKey !== undefined && (typeof propertyKey === 'string' || typeof propertyKey === 'symbol')) {
    return queryAll('$host', {})(targetOrOptions, propertyKey);
  }
  if (typeof targetOrOptions === 'object' && targetOrOptions !== null) {
    return queryAll('$host', targetOrOptions as SwcQueryOptions);
  } else {
    return queryAll('$host', {});
  }
}

/**
 * @allAppHost - Query all $appHost (All <swc-app> instances)
 */
export function allAppHost(target: Object, propertyKey: string | symbol): void;
export function allAppHost(): PropertyDecorator;
export function allAppHost(options: SwcQueryOptions): PropertyDecorator;
export function allAppHost(targetOrOptions?: any, propertyKey?: string | symbol): any {
  if (propertyKey !== undefined && (typeof propertyKey === 'string' || typeof propertyKey === 'symbol')) {
    return queryAll('$appHost', {})(targetOrOptions, propertyKey);
  }
  if (typeof targetOrOptions === 'object' && targetOrOptions !== null) {
    return queryAll('$appHost', targetOrOptions as SwcQueryOptions);
  } else {
    return queryAll('$appHost', {});
  }
}

export const getQueryAllMetadata = (target: any): QueryAllMetadata[] | undefined => {
  const constructor = target instanceof Function ? target : target.constructor;
  return ReflectUtils.getMetadata(QUERY_ALL_METADATA_KEY, constructor);
};
