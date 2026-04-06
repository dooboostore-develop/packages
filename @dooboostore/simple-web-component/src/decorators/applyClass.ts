import { ReflectUtils } from '@dooboostore/core';
import { ensureInit } from './elementDefine';
import { SwcUtils } from '../utils/Utils';
import { SwcQueryOptions, HelperHostSet } from '../types';

export const CLASS_METADATA_KEY = Symbol.for('simple-web-component:class');

export type ClassAction = 'set' | 'update' | 'add' | 'remove' | 'toggle';

export interface ClassApplyOptions extends SwcQueryOptions {
  filter?: (target: HTMLElement, value: any, meta: {currentThis: any, helper: HelperHostSet}) => boolean;
}

export interface ClassApplyMetadata {
  propertyKey: string | symbol;
  selector: string;
  action: ClassAction;
  options: ClassApplyOptions;
}

function createClassDecorator(action: ClassAction) {
  return (selector: string, classMapOrOptions?: string | { [className: string]: (el: HTMLElement, value: any, helper: HelperHostSet & { $this: any }) => boolean } | ClassApplyOptions, options: ClassApplyOptions = {}): MethodDecorator => {
    return (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
      const constructor = target.constructor;
      let metaList = ReflectUtils.getOwnMetadata(CLASS_METADATA_KEY, constructor) as Map<string | symbol, ClassApplyMetadata>;
      if (!metaList) {
        metaList = new Map<string | symbol, ClassApplyMetadata>();
        ReflectUtils.defineMetadata(CLASS_METADATA_KEY, metaList, constructor);
      }

      let classMap: any = undefined;
      let finalOptions = options;

      if (typeof classMapOrOptions === 'string' || (typeof classMapOrOptions === 'object' && classMapOrOptions !== null && !('root' in classMapOrOptions))) {
          classMap = classMapOrOptions;
      } else if (typeof classMapOrOptions === 'object' && classMapOrOptions !== null && 'root' in classMapOrOptions) {
          finalOptions = classMapOrOptions as ClassApplyOptions;
      }

      metaList.set(propertyKey, { propertyKey, selector, action, options: finalOptions });

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

            if (action === 'set') {
              let classes = '';
              if (classMap && typeof classMap === 'string') {
                 classes = resolvedRes ? classMap : '';
              } else if (typeof resolvedRes === 'object' && resolvedRes !== null && !Array.isArray(resolvedRes)) {
                classes = Object.entries(resolvedRes as any)
                  .filter(([_, force]) => typeof force === 'function' ? force(targetEl, hostSet) : !!force)
                  .map(([cls]) => cls)
                  .join(' ');
              } else {
                classes = Array.isArray(resolvedRes) ? (resolvedRes as any[]).join(' ') : String(resolvedRes);
              }
              targetEl.className = classes;
            } else if (action === 'update' || action === 'toggle') {
              if (classMap && typeof classMap === 'string') {
                  targetEl.classList.toggle(classMap, !!resolvedRes);
              } else if (typeof resolvedRes === 'object' && resolvedRes !== null && !Array.isArray(resolvedRes)) {
                Object.entries(resolvedRes as any).forEach(([cls, force]) => {
                  const isActive = typeof force === 'function' ? force(targetEl, hostSet) : !!force;
                  targetEl.classList.toggle(cls, isActive);
                });
              } else {
                const classes = Array.isArray(resolvedRes) ? (resolvedRes as any[]).map(String) : [String(resolvedRes)];
                if (action === 'update') targetEl.classList.add(...classes);
                else classes.forEach(c => targetEl.classList.toggle(c));
              }
            } else if (action === 'add' || action === 'remove') {
              if (classMap && typeof classMap === 'string' && !!resolvedRes) {
                  if (action === 'add') targetEl.classList.add(classMap);
                  else targetEl.classList.remove(classMap);
              } else if (typeof resolvedRes === 'object' && resolvedRes !== null && !Array.isArray(resolvedRes)) {
                Object.entries(resolvedRes as any).forEach(([cls, force]) => {
                  const shouldExecute = typeof force === 'function' ? force(targetEl, hostSet) : !!force;
                  if (shouldExecute) {
                    if (action === 'add') targetEl.classList.add(cls);
                    else targetEl.classList.remove(cls);
                  }
                });
              } else {
                const classes = Array.isArray(resolvedRes) ? (resolvedRes as any[]).map(String) : [String(resolvedRes)];
                if (action === 'add') targetEl.classList.add(...classes);
                else targetEl.classList.remove(...classes);
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

export function applyClass(selector: string, action: ClassAction = 'update', options: ClassApplyOptions = {}): MethodDecorator {
  return createClassDecorator(action)(selector, options);
}

export const setClass = (selector: string, classMapOrOptions?: string | { [className: string]: (el: HTMLElement, value: any, helper: HelperHostSet & { $this: any }) => boolean } | ClassApplyOptions, options: ClassApplyOptions = {}) => createClassDecorator('set')(selector, classMapOrOptions, options);
export const updateClass = (selector: string, classMapOrOptions?: string | { [className: string]: (el: HTMLElement, value: any, helper: HelperHostSet & { $this: any }) => boolean } | ClassApplyOptions, options: ClassApplyOptions = {}) => createClassDecorator('update')(selector, classMapOrOptions, options);
export const addClass = (selector: string, classMapOrOptions?: string | { [className: string]: (el: HTMLElement, value: any, helper: HelperHostSet & { $this: any }) => boolean } | ClassApplyOptions, options: ClassApplyOptions = {}) => createClassDecorator('add')(selector, classMapOrOptions, options);
export const removeClass = (selector: string, classMapOrOptions?: string | { [className: string]: (el: HTMLElement, value: any, helper: HelperHostSet & { $this: any }) => boolean } | ClassApplyOptions, options: ClassApplyOptions = {}) => createClassDecorator('remove')(selector, classMapOrOptions, options);
export const toggleClass = (selector: string, classMapOrOptions?: string | { [className: string]: (el: HTMLElement, value: any, helper: HelperHostSet & { $this: any }) => boolean } | ClassApplyOptions, options: ClassApplyOptions = {}) => createClassDecorator('toggle')(selector, classMapOrOptions, options);

// Host versions
export function applyClassHost(action: ClassAction = 'update', options: ClassApplyOptions = {}): MethodDecorator {
  return createClassDecorator(action)(':host', options);
}
export const setClassHost = (classMapOrOptions?: string | { [className: string]: (el: HTMLElement, value: any, helper: HelperHostSet & { $this: any }) => boolean } | ClassApplyOptions, options: ClassApplyOptions = {}) => createClassDecorator('set')(':host', classMapOrOptions, options);
export const updateClassHost = (classMapOrOptions?: string | { [className: string]: (el: HTMLElement, value: any, helper: HelperHostSet & { $this: any }) => boolean } | ClassApplyOptions, options: ClassApplyOptions = {}) => createClassDecorator('update')(':host', classMapOrOptions, options);
export const addClassHost = (classMapOrOptions?: string | { [className: string]: (el: HTMLElement, value: any, helper: HelperHostSet & { $this: any }) => boolean } | ClassApplyOptions, options: ClassApplyOptions = {}) => createClassDecorator('add')(':host', classMapOrOptions, options);
export const removeClassHost = (classMapOrOptions?: string | { [className: string]: (el: HTMLElement, value: any, helper: HelperHostSet & { $this: any }) => boolean } | ClassApplyOptions, options: ClassApplyOptions = {}) => createClassDecorator('remove')(':host', classMapOrOptions, options);
export const toggleClassHost = (classMapOrOptions?: string | { [className: string]: (el: HTMLElement, value: any, helper: HelperHostSet & { $this: any }) => boolean } | ClassApplyOptions, options: ClassApplyOptions = {}) => createClassDecorator('toggle')(':host', classMapOrOptions, options);

export const findAllClassMetadata = (target: any): Map<string | symbol, ClassApplyMetadata> => {
  const result = new Map<string | symbol, ClassApplyMetadata>();
  const maps = ReflectUtils.findAllMetadata<Map<string | symbol, ClassApplyMetadata>>(CLASS_METADATA_KEY, target);
  maps.forEach(map => {
    if (map instanceof Map) {
      map.forEach((v, k) => result.set(k, v));
    }
  });
  return result;
};
