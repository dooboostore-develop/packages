import { ReflectUtils } from '@dooboostore/core/reflect/ReflectUtils';
import { ensureInit, getElementConfig } from './elementDefine';
import { SwcUtils } from '../utils/Utils';

export interface SetAttributeMetadata {
  propertyKey: string | symbol;
  selector: string;
  name: string;
}

export const SET_ATTRIBUTE_METADATA_KEY = Symbol('simple-web-component:set-attribute');

/**
 * @setAttribute decorator to surgically update an attribute of a target element.
 * Usage: @setAttribute(':host', 'count')
 * Usage: @setAttribute('#child', 'disabled')
 */
export function setAttribute(selector: string, name: string): MethodDecorator {
  return (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const constructor = target.constructor;
    let metaList = ReflectUtils.getOwnMetadata(SET_ATTRIBUTE_METADATA_KEY, constructor) as Map<string | symbol, SetAttributeMetadata>;
    if (!metaList) {
      metaList = new Map<string | symbol, SetAttributeMetadata>();
      ReflectUtils.defineMetadata(SET_ATTRIBUTE_METADATA_KEY, metaList, constructor);
    }
    metaList.set(propertyKey, { propertyKey, selector, name });

    const original = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      ensureInit(this);
      const res = await original.apply(this, args);
      if (res !== undefined) {
        const hostSet = SwcUtils.getHostSet(this as any);
        const conf = getElementConfig(this);
        const currentWin = (this as any)._resolveWindow?.(conf) || ((typeof window !== 'undefined' ? window : undefined) as Window);

        let targetEls: HTMLElement[] = [];
        if (selector === ':host' || !selector) targetEls.push(this as any);
        else if (selector === ':window') targetEls.push(currentWin);
        else if (selector === ':document') targetEls.push(currentWin.document as any);
        else if (selector === ':parentHost') targetEls.push(hostSet.$parentHost);
        else if (selector === ':appHost') targetEls.push(hostSet.$appHost);
        else if (selector === ':firstHost') targetEls.push(hostSet.$firstHost);
        else if (selector === ':lastHost') targetEls.push(hostSet.$lastHost);
        else if (selector === ':firstAppHost') targetEls.push(hostSet.$firstAppHost);
        else if (selector === ':lastAppHost') targetEls.push(hostSet.$lastAppHost);
        else targetEls.push(... (this.shadowRoot? [this.shadowRoot] :(this as any)).querySelectorAll(selector));

        targetEls.forEach(targetEl => {
          if (res === null) targetEl.removeAttribute(name);
          else targetEl.setAttribute(name, String(res));
        })
      }
      return res;
    };
  };
}

export const getSetAttributeMetadata = (target: any): Map<string | symbol, SetAttributeMetadata> | undefined => {
  const constructor = target instanceof Function ? target : target.constructor;
  return ReflectUtils.getMetadata(SET_ATTRIBUTE_METADATA_KEY, constructor);
};

export const findAllSetAttributeMetadata = (target: any): Map<string | symbol, SetAttributeMetadata> => {
  const result = new Map<string | symbol, SetAttributeMetadata>();
  const maps = ReflectUtils.findAllMetadata<Map<string | symbol, SetAttributeMetadata>>(SET_ATTRIBUTE_METADATA_KEY, target);
  maps.forEach(map => {
    if (map instanceof Map) {
      map.forEach((v, k) => result.set(k, v));
    }
  });
  return result;
};
