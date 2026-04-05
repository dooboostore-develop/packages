import { ReflectUtils } from '@dooboostore/core';
import { ensureInit } from './elementDefine';
import { SwcUtils } from '../utils/Utils';
import { SwcQueryOptions, HelperHostSet } from '../types';

export type StyleAction = 'set' | 'update' | 'remove';

export interface StyleApplyOptions extends SwcQueryOptions {}

export interface StyleApplyMetadata {
  propertyKey: string | symbol;
  selector: string;
  action: StyleAction;
  options: StyleApplyOptions;
}

export const STYLE_METADATA_KEY = Symbol.for('simple-web-component:style');

function createStyleDecorator(action: StyleAction) {
  return (selector: string, options: StyleApplyOptions = {}): MethodDecorator => {
    return (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
      const constructor = target.constructor;
      let metaList = ReflectUtils.getOwnMetadata(STYLE_METADATA_KEY, constructor) as Map<string | symbol, StyleApplyMetadata>;
      if (!metaList) {
        metaList = new Map<string | symbol, StyleApplyMetadata>();
        ReflectUtils.defineMetadata(STYLE_METADATA_KEY, metaList, constructor);
      }
      metaList.set(propertyKey, { propertyKey, selector, action, options });

      const original = descriptor.value;
      descriptor.value = async function (...args: any[]) {
        ensureInit(this);
        const res = await (original as any).apply(this, args);
        if (res !== undefined) {
          const win = (this as any).ownerDocument?.defaultView || window;
          const host = this as unknown as HTMLElement;
          const hostSet = SwcUtils.getHelperAndHostSet(win, host);
          const r = options.root || 'auto';
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
            const resolvedRes = typeof res === 'function' ? (res as any)(targetEl, hostSet) : res;

            if (action === 'set' || action === 'update') {
              if (action === 'set') targetEl.style.cssText = '';
              
              if (typeof resolvedRes === 'object' && resolvedRes !== null && !Array.isArray(resolvedRes)) {
                Object.entries(resolvedRes as any).forEach(([prop, val]) => {
                  const finalVal = typeof val === 'function' ? val(targetEl, hostSet) : val;
                  if (finalVal === null || finalVal === undefined) {
                    targetEl.style.removeProperty(prop);
                  } else {
                    targetEl.style[prop as any] = String(finalVal);
                  }
                });
              } else if (typeof resolvedRes === 'string') {
                targetEl.style.cssText = resolvedRes;
              }
            } else if (action === 'remove') {
              if (typeof resolvedRes === 'object' && resolvedRes !== null && !Array.isArray(resolvedRes)) {
                Object.entries(resolvedRes as any).forEach(([prop, val]) => {
                  const shouldRemove = typeof val === 'function' ? val(targetEl, hostSet) : !!val;
                  if (shouldRemove) {
                    targetEl.style.removeProperty(prop);
                  }
                });
              } else {
                const props = Array.isArray(resolvedRes) ? resolvedRes : [resolvedRes];
                props.forEach(p => targetEl.style.removeProperty(String(p)));
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

export function applyStyle(selector: string, action: StyleAction = 'update', options: StyleApplyOptions = {}): MethodDecorator {
  return createStyleDecorator(action)(selector, options);
}

export const setStyle = (selector: string, options: StyleApplyOptions = {}) => createStyleDecorator('set')(selector, options);
export const updateStyle = (selector: string, options: StyleApplyOptions = {}) => createStyleDecorator('update')(selector, options);
export const removeStyle = (selector: string, options: StyleApplyOptions = {}) => createStyleDecorator('remove')(selector, options);

// Host versions
export function applyStyleHost(action: StyleAction = 'update', options: StyleApplyOptions = {}): MethodDecorator {
  return createStyleDecorator(action)(':host', options);
}
export const setStyleHost = (options: StyleApplyOptions = {}) => createStyleDecorator('set')(':host', options);
export const updateStyleHost = (options: StyleApplyOptions = {}) => createStyleDecorator('update')(':host', options);
export const removeStyleHost = (options: StyleApplyOptions = {}) => createStyleDecorator('remove')(':host', options);

export const findAllStyleMetadata = (target: any): Map<string | symbol, StyleApplyMetadata> => {
  const result = new Map<string | symbol, StyleApplyMetadata>();
  const maps = ReflectUtils.findAllMetadata<Map<string | symbol, StyleApplyMetadata>>(STYLE_METADATA_KEY, target);
  maps.forEach(map => {
    if (map instanceof Map) {
      map.forEach((v, k) => result.set(k, v));
    }
  });
  return result;
};
