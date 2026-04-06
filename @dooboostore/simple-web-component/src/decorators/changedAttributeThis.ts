import { ReflectUtils } from '@dooboostore/core';

export const ON_ATTRIBUTE_CHANGED_METADATA_KEY = Symbol.for('simple-web-component:on-attribute-changed');

export interface ChangedAttributeThisOptions {
  type?: typeof Number | typeof Boolean | typeof String;
  while?: 'connected';
}

export interface ChangedAttributeThisMetadata {
  attributeName: string;
  propertyKey: string | symbol;
  options: ChangedAttributeThisOptions;
}

const convertValue = (val: any, type: any): any => {
  if (val === null || val === undefined) return val;
  if (type === Number) return Number(val);
  if (type === Boolean) return val === 'false' || val === '0' ? false : true;
  return val;
};

/**
 * @changedAttributeThis decorator - fires when any attribute on $this changes
 */
export function changedAttributeThis(attributeName?: string, options: ChangedAttributeThisOptions = {}): MethodDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    const constructor = target.constructor;
    let metaList = ReflectUtils.getOwnMetadata(ON_ATTRIBUTE_CHANGED_METADATA_KEY, constructor) as ChangedAttributeThisMetadata[];
    if (!metaList) {
      metaList = [];
      ReflectUtils.defineMetadata(ON_ATTRIBUTE_CHANGED_METADATA_KEY, metaList, constructor);
    }

    const name = attributeName || String(propertyKey);
    metaList.push({
      attributeName: name,
      propertyKey,
      options
    });
  };
}

export const getChangedAttributeMetadata = (target: any): ChangedAttributeThisMetadata[] | undefined => {
  const constructor = target instanceof Function ? target : target.constructor;
  return ReflectUtils.getMetadata(ON_ATTRIBUTE_CHANGED_METADATA_KEY, constructor);
};

export const findAllAttributeChangedMetadata = (target: any): Map<string, ChangedAttributeThisMetadata[]> => {
  const constructor = target instanceof Function ? target : target.constructor;
  const metaList = ReflectUtils.findAllMetadata<ChangedAttributeThisMetadata[]>(ON_ATTRIBUTE_CHANGED_METADATA_KEY, constructor) || [];

  const result = new Map<string, ChangedAttributeThisMetadata[]>();
  metaList.forEach(meta => {
    meta.forEach(item => {
      if (!result.has(item.attributeName)) {
        result.set(item.attributeName, []);
      }
      result.get(item.attributeName)!.push(item);
    });
  });
  return result;
};

export const convertAttributeValue = (val: any, type?: typeof Number | typeof Boolean | typeof String): any => {
  return convertValue(val, type);
};
