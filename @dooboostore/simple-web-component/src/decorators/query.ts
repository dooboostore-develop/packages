import { ReflectUtils } from '@dooboostore/core';
import { getElementConfig, ensureInit } from './elementDefine';
import { SwcUtils } from '../utils/Utils';
import { SpecialSelector, SwcQueryOptions } from '../types';

export interface QueryMetadata {
  propertyKey: string | symbol;
  selector: string;
  options: SwcQueryOptions;
}

export const QUERY_METADATA_KEY = Symbol.for('simple-web-component:query');

export function query(target: SpecialSelector): PropertyDecorator;
export function query(selector: string, options?: SwcQueryOptions): PropertyDecorator;
/**
 * @query decorator to inject a single element into a class property.
 */
export function query(selectorOrTarget: string, options: any = {}): PropertyDecorator {
  return (targetObj: Object, propertyKey: string | symbol, descriptor?: never): void => {
    if (descriptor !== undefined) {
      throw new Error(`@query decorator cannot be used on methods. (Method: ${String(propertyKey)})`);
    }

    const constructor = targetObj.constructor;
    let queries = ReflectUtils.getMetadata<QueryMetadata[]>(QUERY_METADATA_KEY, constructor);
    if (!queries) {
      queries = [];
      ReflectUtils.defineMetadata(QUERY_METADATA_KEY, queries, constructor);
    }
    queries.push({ propertyKey, selector: selectorOrTarget, options });

    Object.defineProperty(targetObj, propertyKey, {
      get(this: HTMLElement) {
        ensureInit(this);
        const selector = selectorOrTarget;

        const r = options.root || 'auto';
        const applyRoot = (t: any) => {
          if (!t || !(t instanceof HTMLElement)) return t;
          if (r === 'auto') return t.shadowRoot || t;
          if (r === 'shadow') return t.shadowRoot;
          if (r === 'light') return t;
          if (r === 'all') return t.shadowRoot || t; 
          return t;
        };

        // --- Special Selectors: HostSet ---
        const hostSet = SwcUtils.getHostSet(this);
        if (selector === '$this') return applyRoot(this);
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
        if (selector === '$window') return win;
        if (selector === '$document') return win.document;

        // --- Standard Selectors ---
        if (r === 'shadow') return this.shadowRoot ? this.shadowRoot.querySelector(selector) : null;
        if (r === 'light') return this.querySelector(selector);
        if (r === 'all') {
          const shadowMatch = this.shadowRoot ? this.shadowRoot.querySelector(selector) : null;
          return shadowMatch || this.querySelector(selector);
        }
        return (this.shadowRoot || this).querySelector(selector);
      },
      set(this: HTMLElement, nv: any) {
        ensureInit(this);
        if (nv === null || nv === undefined) {
          const selector = selectorOrTarget;
          if (selector.startsWith('$') && selector !== '$this') return;

          const r = options.root || 'auto';
          const targets: Element[] = [];

          if (r === 'shadow') {
            if (this.shadowRoot?.querySelector(selector)) targets.push(this.shadowRoot.querySelector(selector)!);
          } else if (r === 'light') {
            if (this.querySelector(selector)) targets.push(this.querySelector(selector)!);
          } else if (r === 'all') {
            if (this.shadowRoot?.querySelector(selector)) targets.push(this.shadowRoot.querySelector(selector)!);
            if (this.querySelector(selector)) targets.push(this.querySelector(selector)!);
          } else {
            const el = (this.shadowRoot || this).querySelector(selector);
            if (el) targets.push(el);
          }

          targets.forEach(t => t.remove());
        }
      },
      enumerable: true,
      configurable: true
    });
  };
}

/**
 * @queryThis decorator - simplified version of @query for $this selector
 */
export function queryThis(target: Object, propertyKey: string | symbol): void;
export function queryThis(): PropertyDecorator;
export function queryThis(options: SwcQueryOptions): PropertyDecorator;
export function queryThis(targetOrOptions?: any, propertyKey?: string | symbol): any {
  if (propertyKey !== undefined && (typeof propertyKey === 'string' || typeof propertyKey === 'symbol')) {
    return query('$this', {})(targetOrOptions, propertyKey);
  }
  if (typeof targetOrOptions === 'object' && targetOrOptions !== null) {
    return query('$this', targetOrOptions as SwcQueryOptions);
  } else {
    return query('$this', {});
  }
}


export function queryWindow(target: Object, propertyKey: string | symbol): void;
export function queryWindow(): PropertyDecorator;
export function queryWindow(options: SwcQueryOptions): PropertyDecorator;
export function queryWindow(targetOrOptions?: any, propertyKey?: string | symbol): any {
  if (propertyKey !== undefined && (typeof propertyKey === 'string' || typeof propertyKey === 'symbol')) {
    return query('$window', {})(targetOrOptions, propertyKey);
  }
  if (typeof targetOrOptions === 'object' && targetOrOptions !== null) {
    return query('$window', targetOrOptions as SwcQueryOptions);
  } else {
    return query('$window', {});
  }
}

export function queryDocument(target: Object, propertyKey: string | symbol): void;
export function queryDocument(): PropertyDecorator;
export function queryDocument(options: SwcQueryOptions): PropertyDecorator;
export function queryDocument(targetOrOptions?: any, propertyKey?: string | symbol): any {
  if (propertyKey !== undefined && (typeof propertyKey === 'string' || typeof propertyKey === 'symbol')) {
    return query('$document', {})(targetOrOptions, propertyKey);
  }
  if (typeof targetOrOptions === 'object' && targetOrOptions !== null) {
    return query('$document', targetOrOptions as SwcQueryOptions);
  } else {
    return query('$document', {});
  }
}
/**
 * @host - Query $host (Direct parent SWC component)
 */
export function queryHost(target: Object, propertyKey: string | symbol): void;
export function queryHost(): PropertyDecorator;
export function queryHost(options: SwcQueryOptions): PropertyDecorator;
export function queryHost(targetOrOptions?: any, propertyKey?: string | symbol): any {
  if (propertyKey !== undefined && (typeof propertyKey === 'string' || typeof propertyKey === 'symbol')) {
    return query('$host', {})(targetOrOptions, propertyKey);
  }
  if (typeof targetOrOptions === 'object' && targetOrOptions !== null) {
    return query('$host', targetOrOptions as SwcQueryOptions);
  } else {
    return query('$host', {});
  }
}

/**
 * @appHost - Query $appHost (Nearest <swc-app>)
 */
export function queryAppHost(target: Object, propertyKey: string | symbol): void;
export function queryAppHost(): PropertyDecorator;
export function queryAppHost(options: SwcQueryOptions): PropertyDecorator;
export function queryAppHost(targetOrOptions?: any, propertyKey?: string | symbol): any {
  if (propertyKey !== undefined && (typeof propertyKey === 'string' || typeof propertyKey === 'symbol')) {
    return query('$appHost', {})(targetOrOptions, propertyKey);
  }
  if (typeof targetOrOptions === 'object' && targetOrOptions !== null) {
    return query('$appHost', targetOrOptions as SwcQueryOptions);
  } else {
    return query('$appHost', {});
  }
}

export const getQueryMetadata = (target: any): QueryMetadata[]  => {
  const constructor = target instanceof Function ? target : target.constructor;
  return ReflectUtils.getMetadata(QUERY_METADATA_KEY, constructor) ?? [];
};
