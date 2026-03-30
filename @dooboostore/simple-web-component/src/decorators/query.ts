import { ReflectUtils } from '@dooboostore/core';
import { getElementConfig, ensureInit } from './elementDefine';
import { SwcUtils } from '../utils/Utils';
import { SpecialSelector, SwcQueryOptions } from '../types';

export type QueryOptions = { root?: 'light' | 'shadow' | 'all' | 'auto' };

export interface QueryMetadata {
  propertyKey: string | symbol;
  selector: string;
  options: SwcQueryOptions;
}

export const QUERY_METADATA_KEY = Symbol('simple-web-component:query');

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

export const getQueryMetadata = (target: any): QueryMetadata[] | undefined => {
  const constructor = target instanceof Function ? target : target.constructor;
  return ReflectUtils.getMetadata(QUERY_METADATA_KEY, constructor);
};
