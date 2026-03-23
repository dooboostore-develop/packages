import { ReflectUtils } from '@dooboostore/core/reflect/ReflectUtils';

export interface QueryAllOptions {
  selector?: string;
  root?: 'light' | 'shadow' | 'all' | 'auto';
}

export interface QueryAllMetadata {
  selector: string;
  options: QueryAllOptions;
  propertyKey: string | symbol;
  isMethod: boolean;
}

export const QUERY_ALL_METADATA_KEY = Symbol('simple-web-component:query-all');

export function queryAll(selector: string): any;
export function queryAll(options: QueryAllOptions): any;
export function queryAll(target: Object, propertyKey: string | symbol): void;
export function queryAll(arg1?: string | QueryAllOptions | Object, arg2?: string | symbol): any {
  const decorator = (selector: string, options: QueryAllOptions, target: Object, propertyKey: string | symbol, descriptor?: PropertyDescriptor) => {
    const isMethod = !!descriptor;
    const constructor = target.constructor;

    let queries = ReflectUtils.getMetadata<QueryAllMetadata[]>(QUERY_ALL_METADATA_KEY, constructor);
    if (!queries) {
      queries = [];
      ReflectUtils.defineMetadata(QUERY_ALL_METADATA_KEY, queries, constructor);
    }
    queries.push({ selector, options, propertyKey, isMethod });

    if (!isMethod) {
      Object.defineProperty(target, propertyKey, {
        get(this: HTMLElement) {
          if (!selector) return [this];
          let searchRoot: Node = this;
          if (options.root === 'shadow') searchRoot = this.shadowRoot || this;
          else if (options.root === 'light') searchRoot = this;
          else searchRoot = this.shadowRoot || this; // Default: Auto (Shadow-First)

          return (searchRoot as HTMLElement).querySelectorAll(selector);
        },
        enumerable: true,
        configurable: true
      });
    }
  };

  // Case: @queryAll (parameterless decorator)
  if (arg1 && typeof arg2 === 'string') {
    return decorator('', {}, arg1 as Object, arg2 as string | symbol);
  }

  // Case: @queryAll('selector') or @queryAll({ selector: '...', ... })
  return (target: Object, propertyKey: string | symbol, descriptor?: PropertyDescriptor) => {
    let selector = '';
    let options: QueryAllOptions = {};

    if (typeof arg1 === 'string') {
      selector = arg1;
    } else if (typeof arg1 === 'object') {
      options = arg1 as QueryAllOptions;
      selector = options.selector || '';
    }

    decorator(selector, options, target, propertyKey, descriptor);
  };
}

export const getQueryAllMetadata = (target: any): QueryAllMetadata[] | undefined => {
  const constructor = target instanceof Function ? target : target.constructor;
  return ReflectUtils.getMetadata(QUERY_ALL_METADATA_KEY, constructor);
};
