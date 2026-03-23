import { ReflectUtils } from '@dooboostore/core/reflect/ReflectUtils';

export interface QueryOptions {
  selector?: string;
  root?: 'light' | 'shadow' | 'all' | 'auto';
}

export interface QueryMetadata {
  selector: string;
  options: QueryOptions;
  propertyKey: string | symbol;
  isMethod: boolean;
}

export const QUERY_METADATA_KEY = Symbol('simple-web-component:query');

export function query(selector: string): any;
export function query(options: QueryOptions): any;
export function query(target: Object, propertyKey: string | symbol): void;
export function query(arg1?: string | QueryOptions | Object, arg2?: string | symbol): any {
  const decorator = (selector: string, options: QueryOptions, target: Object, propertyKey: string | symbol, descriptor?: PropertyDescriptor) => {
    const isMethod = !!descriptor;
    const constructor = target.constructor;

    let queries = ReflectUtils.getMetadata<QueryMetadata[]>(QUERY_METADATA_KEY, constructor);
    if (!queries) {
      queries = [];
      ReflectUtils.defineMetadata(QUERY_METADATA_KEY, queries, constructor);
    }
    queries.push({ selector, options, propertyKey, isMethod });

    if (!isMethod) {
      Object.defineProperty(target, propertyKey, {
        get(this: HTMLElement) {
          if (!selector) return this;
          let searchRoot: Node = this;
          if (options.root === 'shadow') searchRoot = this.shadowRoot || this;
          else if (options.root === 'light') searchRoot = this;
          else searchRoot = this.shadowRoot || this; // Default: Auto (Shadow-First)

          return (searchRoot as HTMLElement).querySelector(selector);
        },
        enumerable: true,
        configurable: true
      });
    }
  };

  // Case: @query (parameterless decorator)
  if (arg1 && typeof arg2 === 'string') {
    return decorator('', {}, arg1 as Object, arg2 as string | symbol);
  }

  // Case: @query('selector') or @query({ selector: '...', ... })
  return (target: Object, propertyKey: string | symbol, descriptor?: PropertyDescriptor) => {
    let selector = '';
    let options: QueryOptions = {};

    if (typeof arg1 === 'string') {
      selector = arg1;
    } else if (typeof arg1 === 'object') {
      options = arg1 as QueryOptions;
      selector = options.selector || '';
    }

    decorator(selector, options, target, propertyKey, descriptor);
  };
}

export const getQueryMetadata = (target: any): QueryMetadata[] | undefined => {
  const constructor = target instanceof Function ? target : target.constructor;
  return ReflectUtils.getMetadata(QUERY_METADATA_KEY, constructor);
};
