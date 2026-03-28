import { ReflectUtils } from '@dooboostore/core/reflect/ReflectUtils';

export type AppendChildPosition = 'beforeBegin' | 'afterBegin' | 'beforeEnd' | 'afterEnd';

export interface AppendChildOptions {
  position?: AppendChildPosition;
}

export interface AppendChildMetadata {
  propertyKey: string | symbol;
  selector: string;
  options: AppendChildOptions;
}

export const APPEND_CHILD_METADATA_KEY = Symbol('simple-web-component:append-child');

/**
 * @appendChild decorator to surgically add nodes to a target element.
 * Usage: @appendChild('#list') addItem() { return '<li>New Item</li>'; }
 */
export function appendChild(selector: string, options: AppendChildOptions = { position: 'beforeEnd' }): MethodDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    const constructor = target.constructor;
    let meta = ReflectUtils.getOwnMetadata(APPEND_CHILD_METADATA_KEY, constructor) as Map<string | symbol, AppendChildMetadata>;
    if (!meta) {
      meta = new Map<string | symbol, AppendChildMetadata>();
      ReflectUtils.defineMetadata(APPEND_CHILD_METADATA_KEY, meta, constructor);
    }
    meta.set(propertyKey, { propertyKey, selector, options });
  };
}

export const findAllAppendChildMetadata = (target: any): Map<string | symbol, AppendChildMetadata> => {
  const result = new Map<string | symbol, AppendChildMetadata>();
  const maps = ReflectUtils.findAllMetadata<Map<string | symbol, AppendChildMetadata>>(APPEND_CHILD_METADATA_KEY, target);
  maps.forEach(map => {
    if (map instanceof Map) {
      map.forEach((v, k) => result.set(k, v));
    }
  });
  return result;
};
