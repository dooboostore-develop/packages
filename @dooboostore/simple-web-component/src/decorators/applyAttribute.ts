import { ReflectUtils } from '@dooboostore/core';
import { ensureInit } from './elementDefine';
import { SwcUtils } from '../utils/Utils';
import { SwcQueryOptions, HelperHostSet } from '../types';

export type AttributeAction = 'set' | 'update' | 'remove';

export interface AttributeApplyOptions extends SwcQueryOptions {
  name?: string;
  filter?: (target: HTMLElement, value: any, meta: {currentThis: any, helper: HelperHostSet}) => boolean;
}

export interface AttributeApplyMetadata {
  propertyKey: string | symbol;
  selector: string;
  action: AttributeAction;
  options: AttributeApplyOptions;
}

export const ATTRIBUTE_APPLY_METADATA_KEY = Symbol.for('simple-web-component:attribute-apply');

function createAttributeDecorator(action: AttributeAction) {
  return (selector: string, nameOrOptions?: string | AttributeApplyOptions, options: AttributeApplyOptions = {}): MethodDecorator => {
    return (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
      const constructor = target.constructor;
      let metaList = ReflectUtils.getOwnMetadata(ATTRIBUTE_APPLY_METADATA_KEY, constructor) as Map<string | symbol, AttributeApplyMetadata>;
      if (!metaList) {
        metaList = new Map<string | symbol, AttributeApplyMetadata>();
        ReflectUtils.defineMetadata(ATTRIBUTE_APPLY_METADATA_KEY, metaList, constructor);
      }

      let attributeName = typeof nameOrOptions === 'string' ? nameOrOptions : undefined;
      let finalOptions = options;
      
      if (typeof nameOrOptions === 'object' && nameOrOptions !== null) {
          finalOptions = nameOrOptions as AttributeApplyOptions;
      }

      metaList.set(propertyKey, { 
        propertyKey, 
        selector, 
        action, 
        options: { ...finalOptions, name: attributeName } 
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

            if (action === 'set' || action === 'update') {
              if (attributeName) {
                // Case: @setAttribute(selector, 'name')
                if (resolvedRes === null || resolvedRes === undefined || resolvedRes === false) {
                  targetEl.removeAttribute(attributeName);
                } else {
                  targetEl.setAttribute(attributeName, resolvedRes === true ? '' : String(resolvedRes));
                }
              } else if (typeof resolvedRes === 'object' && resolvedRes !== null && !Array.isArray(resolvedRes)) {
                // Case: @applyAttribute(selector) with Object return
                Object.entries(resolvedRes as any).forEach(([attr, val]) => {
                  const finalVal = typeof val === 'function' ? val(targetEl, hostSet) : val;
                  if (finalVal === null || finalVal === undefined || finalVal === false) {
                    targetEl.removeAttribute(attr);
                  } else {
                    targetEl.setAttribute(attr, finalVal === true ? '' : String(finalVal));
                  }
                });
              }
            } else if (action === 'remove') {
              if (attributeName) {
                targetEl.removeAttribute(attributeName);
              } else if (typeof resolvedRes === 'object' && resolvedRes !== null && !Array.isArray(resolvedRes)) {
                Object.entries(resolvedRes as any).forEach(([attr, val]) => {
                  const shouldRemove = typeof val === 'function' ? val(targetEl, hostSet) : !!val;
                  if (shouldRemove) targetEl.removeAttribute(attr);
                });
              } else {
                const attrs = Array.isArray(resolvedRes) ? resolvedRes : [resolvedRes];
                attrs.forEach(a => targetEl.removeAttribute(String(a)));
              }
            }
          });
        }
        return res;
      };
      return descriptor;
    };
  };
}

export function applyAttribute(selector: string, action: AttributeAction = 'update', options: AttributeApplyOptions = {}): MethodDecorator {
  return createAttributeDecorator(action)(selector, options);
}

export const setAttribute = (selector: string, nameOrOptions?: string | AttributeApplyOptions, options: AttributeApplyOptions = {}) => createAttributeDecorator('set')(selector, nameOrOptions, options);
export const updateAttribute = (selector: string, nameOrOptions?: string | AttributeApplyOptions, options: AttributeApplyOptions = {}) => createAttributeDecorator('update')(selector, nameOrOptions, options);
export const removeAttribute = (selector: string, nameOrOptions?: string | AttributeApplyOptions, options: AttributeApplyOptions = {}) => createAttributeDecorator('remove')(selector, nameOrOptions, options);

// Host versions
export function applyAttributeHost(action: AttributeAction = 'update', options: AttributeApplyOptions = {}): MethodDecorator {
  return createAttributeDecorator(action)(':host', options);
}
export const setAttributeHost = (nameOrOptions: string | AttributeApplyOptions, options: AttributeApplyOptions = {}) => createAttributeDecorator('set')(':host', nameOrOptions, options);
export const updateAttributeHost = (nameOrOptions: string | AttributeApplyOptions, options: AttributeApplyOptions = {}) => createAttributeDecorator('update')(':host', nameOrOptions, options);
export const removeAttributeHost = (nameOrOptions?: string | AttributeApplyOptions, options: AttributeApplyOptions = {}) => createAttributeDecorator('remove')(':host', nameOrOptions, options);

export const findAllAttributeApplyMetadata = (target: any): Map<string | symbol, AttributeApplyMetadata> => {
  const result = new Map<string | symbol, AttributeApplyMetadata>();
  const maps = ReflectUtils.findAllMetadata<Map<string | symbol, AttributeApplyMetadata>>(ATTRIBUTE_APPLY_METADATA_KEY, target);
  maps.forEach(map => {
    if (map instanceof Map) {
      map.forEach((v, k) => result.set(k, v));
    }
  });
  return result;
};
