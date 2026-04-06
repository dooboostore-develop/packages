import { ReflectUtils } from '@dooboostore/core';
import { ensureInit } from './elementDefine';
import { SwcUtils } from '../utils/Utils';
import { HelperHostSet, SwcQueryOptions } from '../types';

export interface PropertySetOptions extends SwcQueryOptions {
  name?: string;
  filter?: (target: HTMLElement, value: any, meta: {currentThis: any, helper: HelperHostSet}) => boolean;
}

export interface PropertySetMetadata {
  propertyKey: string | symbol;
  selector: string;
  options: PropertySetOptions;
}

export const PROPERTY_SET_METADATA_KEY = Symbol.for('simple-web-component:property-set');

export const setProperty = (selector: string, propertyNameOrOptions?: string | PropertySetOptions, options: PropertySetOptions = {}): MethodDecorator => {
  return (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const constructor = target.constructor;
    let metaList = ReflectUtils.getOwnMetadata(PROPERTY_SET_METADATA_KEY, constructor) as Map<string | symbol, PropertySetMetadata>;
    if (!metaList) {
      metaList = new Map<string | symbol, PropertySetMetadata>();
      ReflectUtils.defineMetadata(PROPERTY_SET_METADATA_KEY, metaList, constructor);
    }

    let propertyName = typeof propertyNameOrOptions === 'string' ? propertyNameOrOptions : undefined;
    let finalOptions = options;
    
    if (typeof propertyNameOrOptions === 'object' && propertyNameOrOptions !== null) {
      finalOptions = propertyNameOrOptions as PropertySetOptions;
    }

    metaList.set(propertyKey, { 
      propertyKey, 
      selector, 
      options: { ...finalOptions, name: propertyName } 
    });

    const original = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      ensureInit(this);
      const res = await (original as any).apply(this, args);
      if (res !== undefined) {
        const win = (this as any).ownerDocument?.defaultView || window;
        const host = this as unknown as HTMLElement;
        const hostSet = { ...SwcUtils.getHelperAndHostSet(win, host), $this: this };
        const r = finalOptions.root || 'auto';
        const targetEls: HTMLElement[] = [];

        const applyRoot = (t: any) => {
          if (!t || !(t instanceof win.HTMLElement)) return;
          targetEls.push(t);
        };

        if (selector === ':parentHost') applyRoot(hostSet.$parentHost);
        else if (selector === ':appHost') applyRoot(hostSet.$appHost);
        else if (selector === ':firstHost') applyRoot(hostSet.$firstHost);
        else if (selector === ':lastHost') applyRoot(hostSet.$lastHost);
        else if (selector === ':firstAppHost') applyRoot(hostSet.$firstAppHost);
        else if (selector === ':lastAppHost') applyRoot(hostSet.$lastAppHost);
        else if (selector === ':hosts') hostSet.$hosts.forEach(applyRoot);
        else if (selector === ':appHosts') hostSet.$appHosts.forEach(applyRoot);
        else if (selector === ':host' || !selector) applyRoot(host);
        else {
          const targetRoot = r === 'auto' ? (host.shadowRoot || host) : (r === 'shadow' ? host.shadowRoot : host);
          if (targetRoot) {
            const found = targetRoot.querySelectorAll(selector);
            if (found) targetEls.push(...(Array.from(found) as HTMLElement[]));
          }
        }

        targetEls.forEach(targetEl => {
          if (finalOptions.filter && !finalOptions.filter(targetEl, res, {currentThis: this, helper: hostSet})) {
            return;
          }
          const resolvedRes = typeof res === 'function' ? (res as any)(targetEl, hostSet) : res;

          if (propertyName) {
            // Case: @setProperty(selector, 'propertyName')
            (targetEl as any)[propertyName] = resolvedRes;
          } else if (typeof resolvedRes === 'object' && resolvedRes !== null && !Array.isArray(resolvedRes)) {
            // Case: @setProperty(selector) with Object return - assign multiple properties
            Object.entries(resolvedRes as any).forEach(([prop, val]) => {
              const finalVal = typeof val === 'function' ? val(targetEl, hostSet) : val;
              (targetEl as any)[prop] = finalVal;
            });
          } else {
            // Simple value - assign to 'value' property by default
            (targetEl as any).value = resolvedRes;
          }
        });
      }
    };
  };
};

export const setPropertyHost = (propertyNameOrOptions?: string | PropertySetOptions, options: PropertySetOptions = {}): MethodDecorator => {
  return setProperty(':host', propertyNameOrOptions, options);
};
