import { ReflectUtils } from '@dooboostore/core/reflect/ReflectUtils';

export const REPLACE_CHILDREN_METADATA_KEY = Symbol('simple-web-component:replace-children');

/**
 * @replaceChildren decorator to surgically replace children of a target element.
 * Usage: @replaceChildren('#container') renderPart() { return '<div>New Content</div>'; }
 */
export function replaceChildren(selector: string): MethodDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    const constructor = target.constructor;
    let meta = ReflectUtils.getOwnMetadata(REPLACE_CHILDREN_METADATA_KEY, constructor) as Map<string | symbol, string>;
    if (!meta) {
      meta = new Map<string | symbol, string>();
      ReflectUtils.defineMetadata(REPLACE_CHILDREN_METADATA_KEY, meta, constructor);
    }
    meta.set(propertyKey, selector);
  };
}

export const getReplaceChildrenMetadata = (target: any): Map<string | symbol, string> | undefined => {
  const constructor = target instanceof Function ? target : target.constructor;
  return ReflectUtils.getMetadata(REPLACE_CHILDREN_METADATA_KEY, constructor);
};

export const findAllReplaceChildrenMetadata = (target: any): Map<string | symbol, string> => {
  const result = new Map<string | symbol, string>();
  const maps = ReflectUtils.findAllMetadata<Map<string | symbol, string>>(REPLACE_CHILDREN_METADATA_KEY, target);
  maps.forEach(map => {
    if (map instanceof Map) {
      map.forEach((v, k) => result.set(k, v));
    }
  });
  return result;
};
