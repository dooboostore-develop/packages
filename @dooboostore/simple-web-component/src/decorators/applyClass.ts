import { ReflectUtils } from '@dooboostore/core';
import { ensureInit } from './elementDefine';
import { SwcUtils } from '../utils/Utils';
import { SpecialSelector, SwcQueryOptions, HelperHostSet } from '../types';

export const CLASS_METADATA_KEY = Symbol.for('simple-web-component:class');

export type ClassAction = 'set' | 'update' | 'add' | 'remove' | 'toggle';

export interface ClassApplyOptions extends SwcQueryOptions {
  filter?: (target: HTMLElement, value: any, meta: {currentThis: any, helper: HelperHostSet}) => boolean;
  /**
   * Custom key to extract value from return object.
   * If not provided, uses CLASS_METADATA_KEY by default.
   * Useful when multiple @applyClass decorators are on the same method.
   */
  valueKey?: symbol | string;
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
      descriptor.value = function (...args: any[]) {
        ensureInit(this);
        const res = (original as any).apply(this, args);

        /**
         * Extract value for this decorator from method return value
         * 
         * If return value is an object with this decorator's key,
         * use that value. Otherwise use the entire return value.
         * 
         * Uses valueKey from options if provided, otherwise uses CLASS_METADATA_KEY.
         */
        const extractValue = (v: any) => {
          const keyToUse = finalOptions.valueKey ?? CLASS_METADATA_KEY;
          if (v && typeof v === 'object' && keyToUse in v) {
            return v[keyToUse];
          }
          return v;
        };

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
          return resolvedValue;
        };

        if (res instanceof Promise) {
          return res.then((v: any) => handleResult(extractValue(v)));
        } else {
          return handleResult(extractValue(res));
        }
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

// This versions
export function applyClassThis(action: ClassAction = 'update', options: ClassApplyOptions = {}): MethodDecorator {
  return createClassDecorator(action)('$this', options);
}
export const setClassThis = (classMapOrOptions?: string | { [className: string]: (el: HTMLElement, value: any, helper: HelperHostSet & { $this: any }) => boolean } | ClassApplyOptions, options: ClassApplyOptions = {}) => createClassDecorator('set')('$this', classMapOrOptions, options);
export const updateClassThis = (classMapOrOptions?: string | { [className: string]: (el: HTMLElement, value: any, helper: HelperHostSet & { $this: any }) => boolean } | ClassApplyOptions, options: ClassApplyOptions = {}) => createClassDecorator('update')('$this', classMapOrOptions, options);
export const addClassThis = (classMapOrOptions?: string | { [className: string]: (el: HTMLElement, value: any, helper: HelperHostSet & { $this: any }) => boolean } | ClassApplyOptions, options: ClassApplyOptions = {}) => createClassDecorator('add')('$this', classMapOrOptions, options);
export const removeClassThis = (classMapOrOptions?: string | { [className: string]: (el: HTMLElement, value: any, helper: HelperHostSet & { $this: any }) => boolean } | ClassApplyOptions, options: ClassApplyOptions = {}) => createClassDecorator('remove')('$this', classMapOrOptions, options);
export const toggleClassThis = (classMapOrOptions?: string | { [className: string]: (el: HTMLElement, value: any, helper: HelperHostSet & { $this: any }) => boolean } | ClassApplyOptions, options: ClassApplyOptions = {}) => createClassDecorator('toggle')('$this', classMapOrOptions, options);

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
