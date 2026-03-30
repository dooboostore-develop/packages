import { ReflectUtils } from '@dooboostore/core/reflect/ReflectUtils';
import { ensureInit, getElementConfig } from './elementDefine';
import { SwcUtils } from '../utils/Utils';
import { SwcQueryOptions } from '../types';

export interface SetAttributeMetadata {
  propertyKey: string | symbol;
  selector: string;
  name: string;
  options: SwcQueryOptions;
}

export const SET_ATTRIBUTE_METADATA_KEY = Symbol('simple-web-component:set-attribute');

/**
 * @setAttribute decorator to surgically update an attribute of a target element.
 * Usage: @setAttribute(':host', 'count')
 * Usage: @setAttribute('#child', 'disabled')
 */
export function setAttribute(selector: string, name: string): MethodDecorator;
export function setAttribute(selector: string, name: string, options?: SwcQueryOptions): MethodDecorator;
export function setAttribute(selector: string, name: string, options: SwcQueryOptions = {}): MethodDecorator {
  return (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const constructor = target.constructor;
    let metaList = ReflectUtils.getOwnMetadata(SET_ATTRIBUTE_METADATA_KEY, constructor) as Map<string | symbol, SetAttributeMetadata>;
    if (!metaList) {
      metaList = new Map<string | symbol, SetAttributeMetadata>();
      ReflectUtils.defineMetadata(SET_ATTRIBUTE_METADATA_KEY, metaList, constructor);
    }
    metaList.set(propertyKey, { propertyKey, selector, name, options });

    const original = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      ensureInit(this);
      const res = await original.apply(this, args);
      if (res !== undefined) {
        const hostSet = SwcUtils.getHostSet(this as any);
        const conf = getElementConfig(this);
        const currentWin = (this as any)._resolveWindow?.(conf) || ((typeof window !== 'undefined' ? window : undefined) as Window);

        const targetEls: any[] = [];
        const r = options.root || 'auto';

        const applyRoot = (t: any) => {
          if (!t) return;
          if (r === 'auto') {
            targetEls.push((t as any).shadowRoot || t);
            return;
          }
          if (r === 'light' || r === 'all') targetEls.push(t);
          if ((r === 'shadow' || r === 'all') && (t as any).shadowRoot) targetEls.push((t as any).shadowRoot);
        };

        if (selector === ':window') targetEls.push(currentWin);
        else if (selector === ':document') targetEls.push(currentWin.document as any);
        else if (selector === ':parentHost') applyRoot(hostSet.$parentHost);
        else if (selector === ':appHost') applyRoot(hostSet.$appHost);
        else if (selector === ':firstHost') applyRoot(hostSet.$firstHost);
        else if (selector === ':lastHost') applyRoot(hostSet.$lastHost);
        else if (selector === ':firstAppHost') applyRoot(hostSet.$firstAppHost);
        else if (selector === ':lastAppHost') applyRoot(hostSet.$lastAppHost);
        else if (selector === ':hosts') hostSet.$hosts.forEach(applyRoot);
        else if (selector === ':appHosts') hostSet.$appHosts.forEach(applyRoot);
        else if (selector === ':host' || !selector) applyRoot(this);
        else {
          const roots: any[] = [];
          if (r === 'shadow') {
            if ((this as any).shadowRoot) roots.push((this as any).shadowRoot);
          } else if (r === 'light') {
            roots.push(this as any);
          } else if (r === 'all') {
            roots.push(this as any);
            if ((this as any).shadowRoot) roots.push((this as any).shadowRoot);
          } else {
            roots.push((this as any).shadowRoot || (this as any));
          }
          roots.forEach(root => targetEls.push(...root.querySelectorAll(selector)));
        }

        targetEls.forEach(targetEl => {
          if (!targetEl || typeof (targetEl as any).setAttribute !== 'function') return;
          if (res === null) (targetEl as any).removeAttribute(name);
          else (targetEl as any).setAttribute(name, String(res));
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
