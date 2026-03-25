import { ReflectUtils } from '@dooboostore/core/reflect/ReflectUtils';

export const ON_ATTRIBUTE_CHANGED_METADATA_KEY = Symbol('simple-web-component:on-attribute-changed');

export function changedAttribute(attributeName?: string): MethodDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    const constructor = target.constructor;
    let meta = ReflectUtils.getOwnMetadata(ON_ATTRIBUTE_CHANGED_METADATA_KEY, constructor) as Map<string, (string | symbol)[]>;
    if (!meta) {
      meta = new Map<string, (string | symbol)[]>();
      ReflectUtils.defineMetadata(ON_ATTRIBUTE_CHANGED_METADATA_KEY, meta, constructor);
    }

    const name = attributeName || String(propertyKey);
    let methods = meta.get(name);
    if (!methods) {
      methods = [];
      meta.set(name, methods);
    }
    if (!methods.includes(propertyKey)) methods.push(propertyKey);
  };
}

export const getChangedAttributeMetadata = (target: any): Map<string, (string | symbol)[]> | undefined => {
  const constructor = target instanceof Function ? target : target.constructor;
  return ReflectUtils.getMetadata(ON_ATTRIBUTE_CHANGED_METADATA_KEY, constructor);
};

export const findAllAttributeChangedMetadata = (target: any): Map<string, (string | symbol)[]> => {
  return ReflectUtils.findAllMapMetadata<string, string | symbol>(ON_ATTRIBUTE_CHANGED_METADATA_KEY, target);
};
