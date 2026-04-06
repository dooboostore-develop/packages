import {ReflectUtils} from '@dooboostore/core';

export const ON_ATTRIBUTE_CHANGED_METADATA_KEY = Symbol.for('simple-web-component:on-attribute-changed');

export interface ChangedAttributeHostOptions {
  type?: typeof Number | typeof Boolean | typeof String;
}

export interface ChangedAttributeHostMetadata {
  attributeName: string;
  propertyKey: string | symbol;
  options: ChangedAttributeHostOptions;
}

const convertValue = (val: any, type: any): any => {
  if (val === null || val === undefined) return val;
  if (type === Number) return Number(val);
  if (type === Boolean) return val === 'false' || val === '0' ? false : true;
  return val;
};

/**
 * @changedAttributeHost decorator - fires when any attribute on :host changes
 * Usage: @changedAttributeHost('data-product-id')
 *        @changedAttributeHost('count', { type: Number })
 */
export function changedAttributeHost(attributeName?: string, options: ChangedAttributeHostOptions = {}): MethodDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    const constructor = target.constructor;
    let metaList = ReflectUtils.getOwnMetadata(ON_ATTRIBUTE_CHANGED_METADATA_KEY, constructor) as ChangedAttributeHostMetadata[];
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

export const getChangedAttributeMetadata = (target: any): ChangedAttributeHostMetadata[] | undefined => {
  const constructor = target instanceof Function ? target : target.constructor;
  return ReflectUtils.getMetadata(ON_ATTRIBUTE_CHANGED_METADATA_KEY, constructor);
};

export const findAllAttributeChangedMetadata = (target: any): Map<string, ChangedAttributeHostMetadata[]> => {
  const constructor = target instanceof Function ? target : target.constructor;
  const metaList = ReflectUtils.findAllMetadata<ChangedAttributeHostMetadata[]>(ON_ATTRIBUTE_CHANGED_METADATA_KEY, constructor) || [];
  
  const result = new Map<string, ChangedAttributeHostMetadata[]>();
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
