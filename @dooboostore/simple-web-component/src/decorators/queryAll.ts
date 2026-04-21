import { ReflectUtils } from '@dooboostore/core';
import { getElementConfig, ensureInit } from './elementDefine';
import { SwcUtils } from '../utils/Utils';
import { SwcQueryOptions, HelperHostSet } from '../types';

export interface QueryAllOptions extends SwcQueryOptions {
  /**
   * Filter function to determine whether to include the element.
   * If it returns false, the element is skipped.
   */
  filter?: (target: HTMLElement, meta: { currentThis: any, helper: HelperHostSet }) => boolean;
}

export interface QueryAllMetadata {
  propertyKey: string | symbol;
  selector: string | ((currentThis: any, helper: HelperHostSet) => NodeList | Element | Element[] | null);
  options: QueryAllOptions;
}

export const QUERY_ALL_METADATA_KEY = Symbol.for('simple-web-component:query-all');

export function queryAll(target: Object, propertyKey: string | symbol, descriptor?: PropertyDescriptor): PropertyDescriptor | void;
export function queryAll(selector: string | ((currentThis: any, helper: HelperHostSet) => NodeList | Element | Element[] | null), options?: QueryAllOptions): PropertyDecorator;
export function queryAll(options?: QueryAllOptions): PropertyDecorator;
/**
 * @queryAll decorator to inject a list of elements into a class property.
 * 
 * Supports both string selectors and function-based selectors:
 * - String selector: @queryAll('.item')
 * - Function selector: @queryAll((currentThis, helper) => currentThis.shadowRoot?.querySelectorAll('.item'))
 * 
 * Supports filtering:
 * - @queryAll('.item', { filter: (target, meta) => target.hasAttribute('active') })
 */
export function queryAll(selectorOrTarget?: string | ((currentThis: any, helper: HelperHostSet) => NodeList | Element | Element[] | null) | Object, optionsOrPropertyKey?: QueryAllOptions | string | symbol, descriptor?: PropertyDescriptor): any {
  // Bare decorator: @queryAll
  if (descriptor !== undefined && (typeof optionsOrPropertyKey === 'string' || typeof optionsOrPropertyKey === 'symbol')) {
    throw new Error(`@queryAll decorator cannot be used on methods. (Method: ${String(optionsOrPropertyKey)})`);
  }
  // With selector
  if (typeof selectorOrTarget === 'string' || typeof selectorOrTarget === 'function') {
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
      queries.push({ propertyKey, selector: selectorOrTarget as any, options: optionsOrPropertyKey as QueryAllOptions || {} });

      Object.defineProperty(targetObj, propertyKey, {
        get(this: HTMLElement) {
          ensureInit(this);
          const config = getElementConfig(this);
          const win = config?.window || window;
          const hostSet = SwcUtils.getHelperAndHostSet(win, this);
          
          // Resolve selector - can be string or function
          let resolvedSelector: string;
          let resolvedElements: HTMLElement[] = [];
          
          if (typeof selectorOrTarget === 'function') {
            const result = (selectorOrTarget as any)(this, hostSet);
            // If function returns NodeList or Element[], convert to array
            if (result instanceof win.NodeList) {
              resolvedElements = Array.from(result).filter(el => el instanceof win.HTMLElement) as HTMLElement[];
            } else if (Array.isArray(result)) {
              resolvedElements = result.filter(el => el instanceof win.HTMLElement) as HTMLElement[];
            }
          } else {
            resolvedSelector = selectorOrTarget;

            const r = (optionsOrPropertyKey as QueryAllOptions)?.root || 'auto';
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
            if (resolvedSelector === '$hosts') resolvedElements = applyRoot(hostSet.$hosts).filter(el => el instanceof HTMLElement);
            else if (resolvedSelector === '$appHosts') resolvedElements = applyRoot(hostSet.$appHosts).filter(el => el instanceof HTMLElement);
            else if (resolvedSelector === '$host') resolvedElements = applyRoot(hostSet.$host).filter(el => el instanceof HTMLElement);
            else if (resolvedSelector === '$parentHost') resolvedElements = applyRoot(hostSet.$parentHost).filter(el => el instanceof HTMLElement);
            else if (resolvedSelector === '$appHost') resolvedElements = applyRoot(hostSet.$appHost).filter(el => el instanceof HTMLElement);
            else if (resolvedSelector === '$firstHost') resolvedElements = applyRoot(hostSet.$firstHost).filter(el => el instanceof HTMLElement);
            else if (resolvedSelector === '$lastHost') resolvedElements = applyRoot(hostSet.$lastHost).filter(el => el instanceof HTMLElement);
            else if (resolvedSelector === '$firstAppHost') resolvedElements = applyRoot(hostSet.$firstAppHost).filter(el => el instanceof HTMLElement);
            else if (resolvedSelector === '$lastAppHost') resolvedElements = applyRoot(hostSet.$lastAppHost).filter(el => el instanceof HTMLElement);
            // --- Special Selectors: Env ---
            else if (resolvedSelector === '$window') return [win];
            else if (resolvedSelector === '$document') return [win.document];
            else if (resolvedSelector === '$this') resolvedElements = applyRoot(this).filter(el => el instanceof HTMLElement);
            // --- Standard Selectors ---
            else {
              if (r === 'shadow') resolvedElements = this.shadowRoot ? (Array.from(this.shadowRoot.querySelectorAll(resolvedSelector)) as HTMLElement[]) : [];
              else if (r === 'light') resolvedElements = Array.from(this.querySelectorAll(resolvedSelector)) as HTMLElement[];
              else if (r === 'all') {
                const sNodes = this.shadowRoot ? (Array.from(this.shadowRoot.querySelectorAll(resolvedSelector)) as HTMLElement[]) : [];
                const lNodes = Array.from(this.querySelectorAll(resolvedSelector)) as HTMLElement[];
                resolvedElements = [...sNodes, ...lNodes];
              }
              else resolvedElements = (Array.from((this.shadowRoot || this).querySelectorAll(resolvedSelector)) as HTMLElement[]);
            }
          }

          // Apply filter if provided
          if ((optionsOrPropertyKey as QueryAllOptions)?.filter) {
            resolvedElements = resolvedElements.filter(el => {
              if (!(el instanceof win.HTMLElement)) return true;
              return (optionsOrPropertyKey as QueryAllOptions).filter!(el, { currentThis: this, helper: hostSet });
            });
          }

          return resolvedElements;
        },
        set(this: HTMLElement, nv: any) {
          ensureInit(this);
          if (nv === null || nv === undefined || (Array.isArray(nv) && nv.length === 0)) {
            const config = getElementConfig(this);
            const win = config?.window || window;
            const hostSet = SwcUtils.getHelperAndHostSet(win, this);
            
            // Resolve selector - can be string or function
            if (typeof selectorOrTarget === 'function') {
              // Get elements from function and remove them
              const result = (selectorOrTarget as any)(this, hostSet);
              if (result instanceof win.NodeList) {
                Array.from(result).forEach(el => {
                  if (el instanceof win.Element) (el as Element).remove();
                });
              } else if (Array.isArray(result)) {
                result.forEach(el => {
                  if (el instanceof win.Element) (el as Element).remove();
                });
              }
              return;
            }
            
            const resolvedSelector = selectorOrTarget;
            
            if (resolvedSelector.startsWith('$') && resolvedSelector !== '$this') return;

            const r = (optionsOrPropertyKey as SwcQueryOptions)?.root || 'auto';
            let targets: (Element | Node)[] = [];
            if (r === 'shadow') targets = this.shadowRoot ? Array.from(this.shadowRoot.querySelectorAll(resolvedSelector)) : [];
            else if (r === 'light') targets = Array.from(this.querySelectorAll(resolvedSelector));
            else if (r === 'all') {
              const sNodes = this.shadowRoot ? Array.from(this.shadowRoot.querySelectorAll(resolvedSelector)) : [];
              const lNodes = Array.from(this.querySelectorAll(resolvedSelector));
              targets = [...sNodes, ...lNodes];
            } else {
              targets = Array.from((this.shadowRoot || this).querySelectorAll(resolvedSelector));
            }
            targets.forEach(t => (t as Element).remove());
          }
        },
        enumerable: true,
        configurable: true
      });
    };
  }
  // Without selector (defaults to $this)
  return queryAll('$this', selectorOrTarget as SwcQueryOptions);
}

export const getQueryAllMetadata = (target: any): QueryAllMetadata[] | undefined => {
  const constructor = target instanceof Function ? target : target.constructor;
  return ReflectUtils.getMetadata(QUERY_ALL_METADATA_KEY, constructor);
};
