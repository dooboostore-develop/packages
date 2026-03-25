import { ReflectUtils } from '@dooboostore/core/reflect/ReflectUtils';

export interface QueryAllOptions {
  root?: 'light' | 'shadow' | 'all' | 'auto';
}

export interface QueryAllMetadata {
  selector: string;
  options: QueryAllOptions;
  propertyKey: string | symbol;
}

export const QUERY_ALL_METADATA_KEY = Symbol('simple-web-component:query-all');

/**
 * @queryAll decorator to inject a list of elements into a class property.
 * Usage: @queryAll('.items') list!: NodeListOf<HTMLElement>;
 * Usage: @queryAll('li', { root: 'shadow' }) list!: HTMLElement[];
 */
export function queryAll(selector: string, options: QueryAllOptions = {}): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol, descriptor?: never): void => {
    if (descriptor !== undefined) {
      throw new Error(`@queryAll decorator cannot be used on methods. (Method: ${String(propertyKey)})`);
    }

    const constructor = target.constructor;
    let queries = ReflectUtils.getMetadata<QueryAllMetadata[]>(QUERY_ALL_METADATA_KEY, constructor);
    if (!queries) {
      queries = [];
      ReflectUtils.defineMetadata(QUERY_ALL_METADATA_KEY, queries, constructor);
    }
    queries.push({ selector, options, propertyKey });

    Object.defineProperty(target, propertyKey, {
      get(this: HTMLElement) {
        if (!selector || selector === ':host') return [this];
        const r = options.root || 'auto';

        if (r === 'shadow') {
          return this.shadowRoot ? this.shadowRoot.querySelectorAll(selector) : [];
        }
        if (r === 'light') {
          return this.querySelectorAll(selector);
        }
        if (r === 'all') {
          const sNodes = this.shadowRoot ? Array.from(this.shadowRoot.querySelectorAll(selector)) : [];
          const lNodes = Array.from(this.querySelectorAll(selector));
          return [...sNodes, ...lNodes];
        }
        // auto
        const root = this.shadowRoot || this;
        return root.querySelectorAll(selector);
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
