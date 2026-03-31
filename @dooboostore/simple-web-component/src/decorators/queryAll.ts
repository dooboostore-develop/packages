import { ReflectUtils } from '@dooboostore/core';
import { getElementConfig, ensureInit } from './elementDefine';
import { SwcUtils } from '../utils/Utils';
import { SpecialSelector, SwcQueryOptions } from '../types';

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
        if (selector === ':hosts') return applyRoot(hostSet.$hosts);
        if (selector === ':appHosts') return applyRoot(hostSet.$appHosts);

        // --- Special Selectors: Env ---
        const config = getElementConfig(this);
        const win = config?.window || window;
        if (selector === ':window') return [win];
        if (selector === ':document') return [win.document];
        if (selector === ':host') return applyRoot(this);

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
          if (selector.startsWith(':') && selector !== ':host') return;

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
 * @hostQueryAll decorator - simplified version of @queryAll for :host selector
 * Usage: @hostQueryAll()
 * Usage: @hostQueryAll({ root: 'shadow' })
 */
/**
 * @queryAllHost decorator - simplified version of @queryAll for :host selector
 * Usage: @queryAllHost items: HTMLElement[];
 * Usage: @queryAllHost() items: HTMLElement[];
 * Usage: @queryAllHost({ root: 'shadow' }) items: HTMLElement[];
 */
export function queryAllHost(target: Object, propertyKey: string | symbol): void;
export function queryAllHost(): PropertyDecorator;
export function queryAllHost(options: SwcQueryOptions): PropertyDecorator;
export function queryAllHost(targetOrOptions?: any, propertyKey?: string | symbol): any {
  // Direct decorator usage: @queryAllHost (no parentheses)
  if (propertyKey !== undefined && (typeof propertyKey === 'string' || typeof propertyKey === 'symbol')) {
    return queryAll(':host', {})(targetOrOptions, propertyKey);
  }

  // @queryAllHost() or @queryAllHost(options)
  if (typeof targetOrOptions === 'object' && targetOrOptions !== null) {
    return queryAll(':host', targetOrOptions as SwcQueryOptions);
  } else {
    return queryAll(':host', {});
  }
}

/**
 * @allHost - Alias for @queryAllHost decorator
 * Usage: @allHost items: HTMLElement[];
 * Usage: @allHost() items: HTMLElement[];
 * Usage: @allHost({ root: 'shadow' }) items: HTMLElement[];
 */
export const allHost = queryAllHost;
/**
 * @allParentHost - Query all :parentHost (All parent SWC components)
 * Usage: @allParentHost parents: HTMLElement[];
 * Usage: @allParentHost() parents: HTMLElement[];
 * Usage: @allParentHost({ root: 'shadow' }) parents: HTMLElement[];
 */
export function allParentHost(target: Object, propertyKey: string | symbol): void;
export function allParentHost(): PropertyDecorator;
export function allParentHost(options: SwcQueryOptions): PropertyDecorator;
export function allParentHost(targetOrOptions?: any, propertyKey?: string | symbol): any {
  if (propertyKey !== undefined && (typeof propertyKey === 'string' || typeof propertyKey === 'symbol')) {
    return queryAll(':parentHost', {})(targetOrOptions, propertyKey);
  }
  if (typeof targetOrOptions === 'object' && targetOrOptions !== null) {
    return queryAll(':parentHost', targetOrOptions as SwcQueryOptions);
  } else {
    return queryAll(':parentHost', {});
  }
}

/**
 * @allAppHost - Query all :appHost (All <swc-app> instances)
 * Usage: @allAppHost apps: SwcAppInterface[];
 * Usage: @allAppHost() apps: SwcAppInterface[];
 * Usage: @allAppHost({ root: 'shadow' }) apps: SwcAppInterface[];
 */
export function allAppHost(target: Object, propertyKey: string | symbol): void;
export function allAppHost(): PropertyDecorator;
export function allAppHost(options: SwcQueryOptions): PropertyDecorator;
export function allAppHost(targetOrOptions?: any, propertyKey?: string | symbol): any {
  if (propertyKey !== undefined && (typeof propertyKey === 'string' || typeof propertyKey === 'symbol')) {
    return queryAll(':appHost', {})(targetOrOptions, propertyKey);
  }
  if (typeof targetOrOptions === 'object' && targetOrOptions !== null) {
    return queryAll(':appHost', targetOrOptions as SwcQueryOptions);
  } else {
    return queryAll(':appHost', {});
  }
}

/**
 * @allFirstHost - Query all :firstHost (All first components in hierarchy)
 * Usage: @allFirstHost firsts: HTMLElement[];
 * Usage: @allFirstHost() firsts: HTMLElement[];
 * Usage: @allFirstHost({ root: 'shadow' }) firsts: HTMLElement[];
 */
export function allFirstHost(target: Object, propertyKey: string | symbol): void;
export function allFirstHost(): PropertyDecorator;
export function allFirstHost(options: SwcQueryOptions): PropertyDecorator;
export function allFirstHost(targetOrOptions?: any, propertyKey?: string | symbol): any {
  if (propertyKey !== undefined && (typeof propertyKey === 'string' || typeof propertyKey === 'symbol')) {
    return queryAll(':firstHost', {})(targetOrOptions, propertyKey);
  }
  if (typeof targetOrOptions === 'object' && targetOrOptions !== null) {
    return queryAll(':firstHost', targetOrOptions as SwcQueryOptions);
  } else {
    return queryAll(':firstHost', {});
  }
}

/**
 * @allLastHost - Query all :lastHost (All last components in hierarchy)
 * Usage: @allLastHost lasts: HTMLElement[];
 * Usage: @allLastHost() lasts: HTMLElement[];
 * Usage: @allLastHost({ root: 'shadow' }) lasts: HTMLElement[];
 */
export function allLastHost(target: Object, propertyKey: string | symbol): void;
export function allLastHost(): PropertyDecorator;
export function allLastHost(options: SwcQueryOptions): PropertyDecorator;
export function allLastHost(targetOrOptions?: any, propertyKey?: string | symbol): any {
  if (propertyKey !== undefined && (typeof propertyKey === 'string' || typeof propertyKey === 'symbol')) {
    return queryAll(':lastHost', {})(targetOrOptions, propertyKey);
  }
  if (typeof targetOrOptions === 'object' && targetOrOptions !== null) {
    return queryAll(':lastHost', targetOrOptions as SwcQueryOptions);
  } else {
    return queryAll(':lastHost', {});
  }
}

/**
 * @allFirstAppHost - Query all :firstAppHost (All first <swc-app> in hierarchy)
 * Usage: @allFirstAppHost apps: SwcAppInterface[];
 * Usage: @allFirstAppHost() apps: SwcAppInterface[];
 * Usage: @allFirstAppHost({ root: 'shadow' }) apps: SwcAppInterface[];
 */
export function allFirstAppHost(target: Object, propertyKey: string | symbol): void;
export function allFirstAppHost(): PropertyDecorator;
export function allFirstAppHost(options: SwcQueryOptions): PropertyDecorator;
export function allFirstAppHost(targetOrOptions?: any, propertyKey?: string | symbol): any {
  if (propertyKey !== undefined && (typeof propertyKey === 'string' || typeof propertyKey === 'symbol')) {
    return queryAll(':firstAppHost', {})(targetOrOptions, propertyKey);
  }
  if (typeof targetOrOptions === 'object' && targetOrOptions !== null) {
    return queryAll(':firstAppHost', targetOrOptions as SwcQueryOptions);
  } else {
    return queryAll(':firstAppHost', {});
  }
}

/**
 * @allLastAppHost - Query all :lastAppHost (All last <swc-app> in hierarchy)
 * Usage: @allLastAppHost apps: SwcAppInterface[];
 * Usage: @allLastAppHost() apps: SwcAppInterface[];
 * Usage: @allLastAppHost({ root: 'shadow' }) apps: SwcAppInterface[];
 */
export function allLastAppHost(target: Object, propertyKey: string | symbol): void;
export function allLastAppHost(): PropertyDecorator;
export function allLastAppHost(options: SwcQueryOptions): PropertyDecorator;
export function allLastAppHost(targetOrOptions?: any, propertyKey?: string | symbol): any {
  if (propertyKey !== undefined && (typeof propertyKey === 'string' || typeof propertyKey === 'symbol')) {
    return queryAll(':lastAppHost', {})(targetOrOptions, propertyKey);
  }
  if (typeof targetOrOptions === 'object' && targetOrOptions !== null) {
    return queryAll(':lastAppHost', targetOrOptions as SwcQueryOptions);
  } else {
    return queryAll(':lastAppHost', {});
  }
}


export const getQueryAllMetadata = (target: any): QueryAllMetadata[] | undefined => {
  const constructor = target instanceof Function ? target : target.constructor;
  return ReflectUtils.getMetadata(QUERY_ALL_METADATA_KEY, constructor);
};

