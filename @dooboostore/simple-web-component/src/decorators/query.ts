import { ReflectUtils } from '@dooboostore/core/reflect/ReflectUtils';
import { getElementConfig } from './elementDefine';
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

    Object.defineProperty(targetObj, propertyKey, {
      get(this: HTMLElement) {
        const selector = selectorOrTarget;

        // --- Special Selectors: HostSet ---
        const hostSet = SwcUtils.getHostSet(this);
        if (selector === ':parentHost') return hostSet.$parentHost;
        if (selector === ':appHost') return hostSet.$appHost;
        if (selector === ':firstHost') return hostSet.$firstHost;
        if (selector === ':lastHost') return hostSet.$lastHost;
        if (selector === ':firstAppHost') return hostSet.$firstAppHost;
        if (selector === ':lastAppHost') return hostSet.$lastAppHost;

        // --- Special Selectors: Env ---
        const config = getElementConfig(this);
        const win = config?.window || window;
        if (selector === ':window') return win;
        if (selector === ':document') return win.document;
        if (selector === ':host') return this;

        // --- Standard Selectors ---
        const r = options.root || 'auto';
        if (r === 'shadow') return this.shadowRoot ? this.shadowRoot.querySelector(selector) : null;
        if (r === 'light') return this.querySelector(selector);
        if (r === 'all') return this.shadowRoot?.querySelector(selector) || this.querySelector(selector);
        return (this.shadowRoot || this).querySelector(selector);
      },
      set(this: HTMLElement, nv: any) {
        if (nv === null || nv === undefined) {
          const selector = selectorOrTarget;
          if (selector.startsWith(':') && selector !== ':host') return;

          const r = options.root || 'auto';
          let targetEl: Element | null = null;
          if (r === 'shadow') targetEl = this.shadowRoot ? this.shadowRoot.querySelector(selector) : null;
          else if (r === 'light') targetEl = this.querySelector(selector);
          else if (r === 'all') targetEl = this.shadowRoot?.querySelector(selector) || this.querySelector(selector);
          else targetEl = (this.shadowRoot || this).querySelector(selector);

          if (targetEl) targetEl.remove();
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
