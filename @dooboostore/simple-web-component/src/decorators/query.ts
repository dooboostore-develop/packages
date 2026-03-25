import { ReflectUtils } from '@dooboostore/core/reflect/ReflectUtils';

export interface QueryOptions {
  root?: 'light' | 'shadow' | 'all' | 'auto';
}

export interface QueryMetadata {
  selector: string;
  options: QueryOptions;
  propertyKey: string | symbol;
}

export const QUERY_METADATA_KEY = Symbol('simple-web-component:query');

/**
 * @query decorator to inject a single element into a class property.
 * Usage: @query('.my-class') myEl!: HTMLElement;
 * Usage: @query('#my-id', { root: 'shadow' }) myEl!: HTMLElement;
 */
export function query(selector: string, options: QueryOptions = {}): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol, descriptor?: never): void => {
    if (descriptor !== undefined) {
      throw new Error(`@query decorator cannot be used on methods. (Method: ${String(propertyKey)})`);
    }

    const constructor = target.constructor;
    let queries = ReflectUtils.getMetadata<QueryMetadata[]>(QUERY_METADATA_KEY, constructor);
    if (!queries) {
      queries = [];
      ReflectUtils.defineMetadata(QUERY_METADATA_KEY, queries, constructor);
    }
    queries.push({ selector, options, propertyKey });

    Object.defineProperty(target, propertyKey, {
      get(this: HTMLElement) {
        if (!selector || selector === ':host') return this;
        const r = options.root || 'auto';

        if (r === 'shadow') {
          return this.shadowRoot ? this.shadowRoot.querySelector(selector) : null;
        }
        if (r === 'light') {
          return this.querySelector(selector);
        }
        if (r === 'all') {
          return this.shadowRoot?.querySelector(selector) || this.querySelector(selector);
        }
        // auto
        return (this.shadowRoot || this).querySelector(selector);
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
