import { ReflectUtils } from '@dooboostore/core/reflect/ReflectUtils';

export const SET_ATTRIBUTE_METADATA_KEY = Symbol('simple-web-component:set-attribute');

export function setAttribute(attributeName?: string): MethodDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    const constructor = target.constructor;
    let meta = ReflectUtils.getOwnMetadata(SET_ATTRIBUTE_METADATA_KEY, constructor) as Map<string, string | symbol>;
    if (!meta) {
      meta = new Map<string, string | symbol>();
      ReflectUtils.defineMetadata(SET_ATTRIBUTE_METADATA_KEY, meta, constructor);
    }
    meta.set(attributeName || String(propertyKey), propertyKey);
  };
}

export const getSetAttributeMetadata = (target: any): Map<string, string | symbol> | undefined => {
  const constructor = target instanceof Function ? target : target.constructor;
  return ReflectUtils.getMetadata(SET_ATTRIBUTE_METADATA_KEY, constructor);
};

export const findAllSetAttributeMetadata = (target: any): Map<string, string | symbol> => {
  const result = new Map<string, string | symbol>();
  const maps = ReflectUtils.findAllMetadata<any>(SET_ATTRIBUTE_METADATA_KEY, target);
  maps.forEach(map => {
    if (map instanceof Map) {
      map.forEach((v, k) => result.set(k, v));
    }
  });
  return result;
};
