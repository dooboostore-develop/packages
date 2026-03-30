import { ReflectUtils } from '@dooboostore/core';
import { getElementConfig, ensureInit } from './elementDefine';
import { SwcUtils } from '../utils/Utils';
import { SpecialSelector, SwcQueryOptions } from '../types';

export interface QueryAllMetadata {
  propertyKey: string | symbol;
  selector: string;
  options: SwcQueryOptions;
}

export const QUERY_ALL_METADATA_KEY = Symbol('simple-web-component:query-all');

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

export const getQueryAllMetadata = (target: any): QueryAllMetadata[] | undefined => {
  const constructor = target instanceof Function ? target : target.constructor;
  return ReflectUtils.getMetadata(QUERY_ALL_METADATA_KEY, constructor);
};
