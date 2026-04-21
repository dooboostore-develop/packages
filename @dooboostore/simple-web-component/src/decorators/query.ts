import { ReflectUtils } from '@dooboostore/core';
import { getElementConfig, ensureInit } from './elementDefine';
import { SwcUtils } from '../utils/Utils';
import { SwcQueryOptions, HelperHostSet } from '../types';

export interface QueryOptions extends SwcQueryOptions {
  /**
   * Filter function to determine whether to include the element.
   * If it returns false, the element is skipped.
   */
  filter?: (target: HTMLElement, meta: { currentThis: any, helper: HelperHostSet }) => boolean;
}

export interface QueryMetadata {
  propertyKey: string | symbol;
  selector: string | ((currentThis: any, helper: HelperHostSet) => Node | NodeList | Element | Element[] | null);
  options: QueryOptions ;
}

export const QUERY_METADATA_KEY = Symbol.for('simple-web-component:query');

export function query(target: Object, propertyKey: string | symbol, descriptor?: PropertyDescriptor): PropertyDescriptor | void;
export function query(selector: string | ((currentThis: any, helper: HelperHostSet) => Node | NodeList | Element | Element[] | null), options?: QueryOptions): PropertyDecorator;
export function query(options?: QueryOptions): PropertyDecorator;
/**
 * @query decorator to inject a single element into a class property.
 * 
 * Supports both string selectors and function-based selectors:
 * - String selector: @query('#my-element')
 * - Function selector: @query((currentThis, helper) => currentThis.shadowRoot?.querySelector('.item'))
 * 
 * Supports filtering:
 * - @query('#my-element', { filter: (target, meta) => target.hasAttribute('active') })
 */
export function query(selectorOrTarget?: string | ((currentThis: any, helper: HelperHostSet) => Node | NodeList | Element | Element[] | null) | Object, optionsOrPropertyKey?: QueryOptions | string | symbol, descriptor?: PropertyDescriptor): any {
  // Bare decorator: @query
  if (descriptor !== undefined && (typeof optionsOrPropertyKey === 'string' || typeof optionsOrPropertyKey === 'symbol')) {
    throw new Error(`@query decorator cannot be used on methods. (Method: ${String(optionsOrPropertyKey)})`);
  }
  // With selector
  if (typeof selectorOrTarget === 'string' || typeof selectorOrTarget === 'function') {
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
      queries.push({ propertyKey, selector: selectorOrTarget as any, options: optionsOrPropertyKey as QueryOptions || {} });

      Object.defineProperty(targetObj, propertyKey, {
        get(this: HTMLElement) {
          ensureInit(this);
          const config = getElementConfig(this);
          const win = config?.window || window;
          const hostSet = SwcUtils.getHelperAndHostSet(win, this);
          
          // Resolve selector - can be string or function
          let resolvedSelector: string;
          let resolvedElement: HTMLElement | null = null;
          
          if (typeof selectorOrTarget === 'function') {
            const result = (selectorOrTarget as any)(this, hostSet);
            // If function returns a Node/Element, return it directly
            if (result instanceof win.Node || result instanceof win.Element) {
              resolvedElement = result instanceof win.HTMLElement ? (result as HTMLElement) : null;
            }
            // If function returns NodeList or Element[], return first element
            else if (result instanceof win.NodeList || Array.isArray(result)) {
              resolvedElement = result.length > 0 && result[0] instanceof win.HTMLElement ? (result[0] as HTMLElement) : null;
            }
          } else {
            resolvedSelector = selectorOrTarget;

            const r = (optionsOrPropertyKey as QueryOptions)?.root || 'auto';
            const applyRoot = (t: any) => {
              if (!t || !(t instanceof HTMLElement)) return t;
              if (r === 'auto') return t.shadowRoot || t;
              if (r === 'shadow') return t.shadowRoot;
              if (r === 'light') return t;
              if (r === 'all') return t.shadowRoot || t; 
              return t;
            };

            // --- Special Selectors: HostSet ---
            if (resolvedSelector === '$this') resolvedElement = applyRoot(this);
            else if (resolvedSelector === '$host') resolvedElement = applyRoot(hostSet.$host);
            else if (resolvedSelector === '$parentHost') resolvedElement = applyRoot(hostSet.$parentHost);
            else if (resolvedSelector === '$appHost') resolvedElement = applyRoot(hostSet.$appHost);
            else if (resolvedSelector === '$firstHost') resolvedElement = applyRoot(hostSet.$firstHost);
            else if (resolvedSelector === '$lastHost') resolvedElement = applyRoot(hostSet.$lastHost);
            else if (resolvedSelector === '$firstAppHost') resolvedElement = applyRoot(hostSet.$firstAppHost);
            else if (resolvedSelector === '$lastAppHost') resolvedElement = applyRoot(hostSet.$lastAppHost);
            // --- Special Selectors: Env ---
            else if (resolvedSelector === '$window') return win;
            else if (resolvedSelector === '$document') return win.document;
            // --- Standard Selectors ---
            else {
              if (r === 'shadow') resolvedElement = this.shadowRoot ? (this.shadowRoot.querySelector(resolvedSelector) as HTMLElement | null) : null;
              else if (r === 'light') resolvedElement = this.querySelector(resolvedSelector) as HTMLElement | null;
              else if (r === 'all') {
                const shadowMatch = this.shadowRoot ? (this.shadowRoot.querySelector(resolvedSelector) as HTMLElement | null) : null;
                resolvedElement = shadowMatch || (this.querySelector(resolvedSelector) as HTMLElement | null);
              }
              else resolvedElement = ((this.shadowRoot || this).querySelector(resolvedSelector) as HTMLElement | null);
            }
          }

          // Apply filter if provided
          if (resolvedElement instanceof win.HTMLElement && (optionsOrPropertyKey as QueryOptions)?.filter) {
            const shouldInclude = (optionsOrPropertyKey as QueryOptions).filter!(resolvedElement, { currentThis: this, helper: hostSet });
            if (!shouldInclude) {
              return null;
            }
          }

          return resolvedElement;
        },
        set(this: HTMLElement, nv: any) {
          ensureInit(this);
          if (nv === null || nv === undefined) {
            const config = getElementConfig(this);
            const win = config?.window || window;
            const hostSet = SwcUtils.getHelperAndHostSet(win, this);
            
            // Resolve selector - can be string or function
            if (typeof selectorOrTarget === 'function') {
              // Get the element from function and remove it
              const result = (selectorOrTarget as any)(this, hostSet);
              if (result instanceof win.Element) {
                (result as Element).remove();
              } else if (result instanceof win.NodeList || Array.isArray(result)) {
                const el = result.length > 0 ? result[0] : null;
                if (el instanceof win.Element) {
                  (el as Element).remove();
                }
              }
              return;
            }
            
            const resolvedSelector = selectorOrTarget;
            
            if (resolvedSelector.startsWith('$') && resolvedSelector !== '$this') return;

            const r = (optionsOrPropertyKey as QueryOptions)?.root || 'auto';
            const targets: Element[] = [];

            if (r === 'shadow') {
              if (this.shadowRoot?.querySelector(resolvedSelector)) targets.push(this.shadowRoot.querySelector(resolvedSelector)!);
            } else if (r === 'light') {
              if (this.querySelector(resolvedSelector)) targets.push(this.querySelector(resolvedSelector)!);
            } else if (r === 'all') {
              if (this.shadowRoot?.querySelector(resolvedSelector)) targets.push(this.shadowRoot.querySelector(resolvedSelector)!);
              if (this.querySelector(resolvedSelector)) targets.push(this.querySelector(resolvedSelector)!);
            } else {
              const el = (this.shadowRoot || this).querySelector(resolvedSelector);
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
  // Without selector (defaults to $this)
  return query('$this', selectorOrTarget as SwcQueryOptions);
}

export const getQueryMetadata = (target: any): QueryMetadata[]  => {
  const constructor = target instanceof Function ? target : target.constructor;
  return ReflectUtils.getMetadata(QUERY_METADATA_KEY, constructor) ?? [];
};
