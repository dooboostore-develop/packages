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

    // const propertyType = Reflect.getMetadata("design:type", targetObj, propertyKey);
    // console.log(`Property ${String(propertyKey)} type is:`, propertyType.name);
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
          if (r === 'all') return t.shadowRoot || t; // query only returns one, so shadow preferred
          return t;
        };

        // --- Special Selectors: HostSet ---
        const hostSet = SwcUtils.getHostSet(this);
        if (selector === ':parentHost') return applyRoot(hostSet.$parentHost);
        if (selector === ':appHost') return applyRoot(hostSet.$appHost);
        if (selector === ':firstHost') return applyRoot(hostSet.$firstHost);
        if (selector === ':lastHost') return applyRoot(hostSet.$lastHost);
        if (selector === ':firstAppHost') return applyRoot(hostSet.$firstAppHost);
        if (selector === ':lastAppHost') return applyRoot(hostSet.$lastAppHost);

        // --- Special Selectors: Env ---
        const config = getElementConfig(this);
        const win = config?.window || window;
        if (selector === ':window') return win;
        if (selector === ':document') return win.document;
        if (selector === ':host') return applyRoot(this);

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
          if (selector.startsWith(':') && selector !== ':host') return;

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
 * @queryHost decorator - simplified version of @query for :host selector
 * Usage: @queryHost testzzs: HTMLElement | undefined;
 * Usage: @queryHost() testzzs: HTMLElement | undefined;
 * Usage: @queryHost({ root: 'shadow' }) testzzs: HTMLElement | undefined;
 */
export function queryHost(target: Object, propertyKey: string | symbol): void;
export function queryHost(): PropertyDecorator;
export function queryHost(options: SwcQueryOptions): PropertyDecorator;
export function queryHost(targetOrOptions?: any, propertyKey?: string | symbol): any {
  // Direct decorator usage: @queryHost (no parentheses)
  if (propertyKey !== undefined && (typeof propertyKey === 'string' || typeof propertyKey === 'symbol')) {
    return query(':host', {})(targetOrOptions, propertyKey);
  }

  // @queryHost() or @queryHost(options)
  if (typeof targetOrOptions === 'object' && targetOrOptions !== null) {
    return query(':host', targetOrOptions as SwcQueryOptions);
  } else {
    return query(':host', {});
  }
}

/**
 * @host - Alias for @queryHost decorator
 * Usage: @host element: HTMLElement | undefined;
 * Usage: @host() element: HTMLElement | undefined;
 * Usage: @host({ root: 'shadow' }) element: HTMLElement | undefined;
 */
export const host = queryHost;

/**
 * @parentHost - Query :parentHost (Direct parent SWC component)
 * Usage: @parentHost parent: HTMLElement | undefined;
 * Usage: @parentHost() parent: HTMLElement | undefined;
 * Usage: @parentHost({ root: 'shadow' }) parent: HTMLElement | undefined;
 */
export function parentHost(target: Object, propertyKey: string | symbol): void;
export function parentHost(): PropertyDecorator;
export function parentHost(options: SwcQueryOptions): PropertyDecorator;
export function parentHost(targetOrOptions?: any, propertyKey?: string | symbol): any {
  if (propertyKey !== undefined && (typeof propertyKey === 'string' || typeof propertyKey === 'symbol')) {
    return query(':parentHost', {})(targetOrOptions, propertyKey);
  }
  if (typeof targetOrOptions === 'object' && targetOrOptions !== null) {
    return query(':parentHost', targetOrOptions as SwcQueryOptions);
  } else {
    return query(':parentHost', {});
  }
}

/**
 * @appHost - Query :appHost (Nearest <swc-app>)
 * Usage: @appHost app: SwcAppInterface | undefined;
 * Usage: @appHost() app: SwcAppInterface | undefined;
 * Usage: @appHost({ root: 'shadow' }) app: SwcAppInterface | undefined;
 */
export function appHost(target: Object, propertyKey: string | symbol): void;
export function appHost(): PropertyDecorator;
export function appHost(options: SwcQueryOptions): PropertyDecorator;
export function appHost(targetOrOptions?: any, propertyKey?: string | symbol): any {
  if (propertyKey !== undefined && (typeof propertyKey === 'string' || typeof propertyKey === 'symbol')) {
    return query(':appHost', {})(targetOrOptions, propertyKey);
  }
  if (typeof targetOrOptions === 'object' && targetOrOptions !== null) {
    return query(':appHost', targetOrOptions as SwcQueryOptions);
  } else {
    return query(':appHost', {});
  }
}

/**
 * @firstHost - Query :firstHost (First component in hierarchy)
 * Usage: @firstHost first: HTMLElement | undefined;
 * Usage: @firstHost() first: HTMLElement | undefined;
 * Usage: @firstHost({ root: 'shadow' }) first: HTMLElement | undefined;
 */
export function firstHost(target: Object, propertyKey: string | symbol): void;
export function firstHost(): PropertyDecorator;
export function firstHost(options: SwcQueryOptions): PropertyDecorator;
export function firstHost(targetOrOptions?: any, propertyKey?: string | symbol): any {
  if (propertyKey !== undefined && (typeof propertyKey === 'string' || typeof propertyKey === 'symbol')) {
    return query(':firstHost', {})(targetOrOptions, propertyKey);
  }
  if (typeof targetOrOptions === 'object' && targetOrOptions !== null) {
    return query(':firstHost', targetOrOptions as SwcQueryOptions);
  } else {
    return query(':firstHost', {});
  }
}

/**
 * @lastHost - Query :lastHost (Last component in hierarchy)
 * Usage: @lastHost last: HTMLElement | undefined;
 * Usage: @lastHost() last: HTMLElement | undefined;
 * Usage: @lastHost({ root: 'shadow' }) last: HTMLElement | undefined;
 */
export function lastHost(target: Object, propertyKey: string | symbol): void;
export function lastHost(): PropertyDecorator;
export function lastHost(options: SwcQueryOptions): PropertyDecorator;
export function lastHost(targetOrOptions?: any, propertyKey?: string | symbol): any {
  if (propertyKey !== undefined && (typeof propertyKey === 'string' || typeof propertyKey === 'symbol')) {
    return query(':lastHost', {})(targetOrOptions, propertyKey);
  }
  if (typeof targetOrOptions === 'object' && targetOrOptions !== null) {
    return query(':lastHost', targetOrOptions as SwcQueryOptions);
  } else {
    return query(':lastHost', {});
  }
}

/**
 * @firstAppHost - Query :firstAppHost (First <swc-app> in hierarchy)
 * Usage: @firstAppHost app: SwcAppInterface | undefined;
 * Usage: @firstAppHost() app: SwcAppInterface | undefined;
 * Usage: @firstAppHost({ root: 'shadow' }) app: SwcAppInterface | undefined;
 */
export function firstAppHost(target: Object, propertyKey: string | symbol): void;
export function firstAppHost(): PropertyDecorator;
export function firstAppHost(options: SwcQueryOptions): PropertyDecorator;
export function firstAppHost(targetOrOptions?: any, propertyKey?: string | symbol): any {
  if (propertyKey !== undefined && (typeof propertyKey === 'string' || typeof propertyKey === 'symbol')) {
    return query(':firstAppHost', {})(targetOrOptions, propertyKey);
  }
  if (typeof targetOrOptions === 'object' && targetOrOptions !== null) {
    return query(':firstAppHost', targetOrOptions as SwcQueryOptions);
  } else {
    return query(':firstAppHost', {});
  }
}

/**
 * @lastAppHost - Query :lastAppHost (Last <swc-app> in hierarchy)
 * Usage: @lastAppHost app: SwcAppInterface | undefined;
 * Usage: @lastAppHost() app: SwcAppInterface | undefined;
 * Usage: @lastAppHost({ root: 'shadow' }) app: SwcAppInterface | undefined;
 */
export function lastAppHost(target: Object, propertyKey: string | symbol): void;
export function lastAppHost(): PropertyDecorator;
export function lastAppHost(options: SwcQueryOptions): PropertyDecorator;
export function lastAppHost(targetOrOptions?: any, propertyKey?: string | symbol): any {
  if (propertyKey !== undefined && (typeof propertyKey === 'string' || typeof propertyKey === 'symbol')) {
    return query(':lastAppHost', {})(targetOrOptions, propertyKey);
  }
  if (typeof targetOrOptions === 'object' && targetOrOptions !== null) {
    return query(':lastAppHost', targetOrOptions as SwcQueryOptions);
  } else {
    return query(':lastAppHost', {});
  }
}

export const getQueryMetadata = (target: any): QueryMetadata[] | undefined => {
  const constructor = target instanceof Function ? target : target.constructor;
  return ReflectUtils.getMetadata(QUERY_METADATA_KEY, constructor);
};