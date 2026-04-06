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
    descriptor.value = function (...args: any[]) {
      ensureInit(this);
      const res = (original as any).apply(this, args);

      const handleResult = (resolvedValue: any) => {
        if (resolvedValue !== undefined) {
          const win = (this as any).ownerDocument?.defaultView || window;
          const host = this as unknown as HTMLElement;
          const hostSet = { ...SwcUtils.getHelperAndHostSet(win, host), $this: this };
          const r = finalOptions.root || 'auto';
          const targetEls: HTMLElement[] = [];

          const applyRoot = (t: any) => {
            if (!t || !(t instanceof win.HTMLElement)) return;
            targetEls.push(t);
          };

          if (selector === '$this' || !selector) applyRoot(host);
          else if (selector === '$host') applyRoot(hostSet.$host);
          else if (selector === '$parentHost') applyRoot(hostSet.$parentHost);
          else if (selector === '$appHost') applyRoot(hostSet.$appHost);
          else if (selector === '$firstHost') applyRoot(hostSet.$firstHost);
          else if (selector === '$lastHost') applyRoot(hostSet.$lastHost);
          else if (selector === '$firstAppHost') applyRoot(hostSet.$firstAppHost);
          else if (selector === '$lastAppHost') applyRoot(hostSet.$lastAppHost);
          else if (selector === '$hosts') hostSet.$hosts.forEach(applyRoot);
          else if (selector === '$appHosts') hostSet.$appHosts.forEach(applyRoot);
          else {
            const targetRoot = r === 'auto' ? (host.shadowRoot || host) : (r === 'shadow' ? host.shadowRoot : host);
            if (targetRoot) {
              const found = targetRoot.querySelectorAll(selector);
              if (found) targetEls.push(...(Array.from(found) as HTMLElement[]));
            }
          }

          targetEls.forEach(targetEl => {
            if (finalOptions.filter && !finalOptions.filter(targetEl, resolvedValue, {currentThis: this, helper: hostSet})) {
              return;
            }
            const resolvedRes = typeof resolvedValue === 'function' ? (resolvedValue as any)(targetEl, hostSet) : resolvedValue;

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
        return resolvedValue;
      };

      if (res instanceof Promise) {
        return res.then(handleResult);
      } else {
        return handleResult(res);
      }
    };
  };
};

export const setPropertyThis = (propertyNameOrOptions?: string | PropertySetOptions, options: PropertySetOptions = {}): MethodDecorator => {
  return setProperty('$this', propertyNameOrOptions, options);
};
