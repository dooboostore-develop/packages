import { ReflectUtils } from '@dooboostore/core';
import { ensureInit } from './elementDefine';
import { SwcUtils } from '../utils/Utils';
import { SpecialSelector, SwcQueryOptions, HelperHostSet } from '../types';

export const CLASS_METADATA_KEY = Symbol.for('simple-web-component:class');

export type ClassAction = 'set' | 'update' | 'add' | 'remove' | 'toggle';

/**
 * Resolve selector to string or elements
 * Handles function-based selectors and returns elements if applicable
 */
const resolveSelector = (selector: ClassSelector, inst: any, win: Window): string | HTMLElement[] => {
  if (typeof selector === 'function') {
    const hostSet = SwcUtils.getHelperAndHostSet(win, inst);
    const result = selector(inst, hostSet);
    
    if (result instanceof win.Element) {
      return [result as HTMLElement];
    }
    if (result instanceof win.NodeList) {
      return Array.from(result) as HTMLElement[];
    }
    if (Array.isArray(result)) {
      return result as HTMLElement[];
    }
    if (result === null) {
      return [];
    }
    return result as string;
  }
  return selector as string;
};

/**
 * Get target elements from selector
 */
const getTargetElements = (selector: ClassSelector, inst: any, win: Window, root: string): HTMLElement[] => {
  const resolved = resolveSelector(selector, inst, win);
  
  if (Array.isArray(resolved)) {
    return resolved;
  }

  const stringSelector = resolved as string;
  const targetEls: HTMLElement[] = [];
  const host = inst as unknown as HTMLElement;
  const hostSet = SwcUtils.getHelperAndHostSet(win, inst);

  const applyRoot = (t: any) => {
    if (!t || !(t instanceof win.HTMLElement)) return;
    targetEls.push(t);
  };

  if (stringSelector === '$this' || !stringSelector) applyRoot(host);
  else if (stringSelector === '$host') applyRoot(hostSet.$host);
  else if (stringSelector === '$parentHost') applyRoot(hostSet.$parentHost);
  else if (stringSelector === '$appHost') applyRoot(hostSet.$appHost);
  else if (stringSelector === '$firstHost') applyRoot(hostSet.$firstHost);
  else if (stringSelector === '$lastHost') applyRoot(hostSet.$lastHost);
  else if (stringSelector === '$firstAppHost') applyRoot(hostSet.$firstAppHost);
  else if (stringSelector === '$lastAppHost') applyRoot(hostSet.$lastAppHost);
  else if (stringSelector === '$hosts') hostSet.$hosts.forEach(applyRoot);
  else if (stringSelector === '$appHosts') hostSet.$appHosts.forEach(applyRoot);
  else {
    const targetRoot = root === 'auto' ? (host.shadowRoot || host) : (root === 'shadow' ? host.shadowRoot : host);
    if (targetRoot) {
      const found = targetRoot.querySelectorAll(stringSelector);
      if (found) targetEls.push(...(Array.from(found) as HTMLElement[]));
    }
  }

  return targetEls;
};

export interface ClassApplyOptions extends SwcQueryOptions {
  filter?: (target: HTMLElement, value: any, meta: {currentThis: any, helper: HelperHostSet}) => boolean;
  /**
   * Custom key to extract value from return object.
   * If not provided, uses CLASS_METADATA_KEY by default.
   * Useful when multiple @applyClass decorators are on the same method.
   */
  valueKey?: symbol | string;
}

export type ClassSelector = string | ((currentThis: any, helper: HelperHostSet) => NodeList | Element | Element[] | null);

export interface ClassApplyMetadata {
  propertyKey: string | symbol;
  selector: ClassSelector;
  action: ClassAction;
  options: ClassApplyOptions;
}

function createClassDecorator(action: ClassAction) {
  return (selector: ClassSelector, classMapOrOptions?: string | { [className: string]: (el: HTMLElement, value: any, helper: HelperHostSet & { $this: any }) => boolean } | ClassApplyOptions, options: ClassApplyOptions = {}): MethodDecorator => {
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
            const targetEls = getTargetElements(selector, this, win, r);

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

export function applyClass(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor | void;
export function applyClass(selector: ClassSelector, action?: ClassAction, options?: ClassApplyOptions): MethodDecorator;
export function applyClass(selectorOrTarget?: any, actionOrPropertyKey?: any, optionsOrDescriptor?: any): any {
  // Bare decorator: @applyClass
  if (optionsOrDescriptor !== undefined && (typeof actionOrPropertyKey === 'string' || typeof actionOrPropertyKey === 'symbol')) {
    return createClassDecorator('update')('$this', {})(selectorOrTarget as Object, actionOrPropertyKey, optionsOrDescriptor as PropertyDescriptor);
  }
  // With selector
  if (typeof selectorOrTarget === 'string') {
    const action = (typeof actionOrPropertyKey === 'string' ? actionOrPropertyKey : 'update') as ClassAction;
    const options = (typeof actionOrPropertyKey === 'object' ? actionOrPropertyKey : optionsOrDescriptor) as ClassApplyOptions | undefined;
    return createClassDecorator(action)(selectorOrTarget, options);
  }
  // Without selector (defaults to $this)
  const action = (typeof selectorOrTarget === 'string' ? selectorOrTarget : 'update') as ClassAction;
  const options = (typeof selectorOrTarget === 'object' ? selectorOrTarget : actionOrPropertyKey) as ClassApplyOptions | undefined;
  return createClassDecorator(action)('$this', options);
}

export function setClass(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor | void;
export function setClass(selector: ClassSelector, classMapOrOptions?: string | { [className: string]: (el: HTMLElement, value: any, helper: HelperHostSet & { $this: any }) => boolean } | ClassApplyOptions, options?: ClassApplyOptions): MethodDecorator;
export function setClass(selectorOrTarget?: any, classMapOrOptionsOrPropertyKey?: any, optionsOrDescriptor?: any): any {
  // Bare decorator: @setClass
  if (optionsOrDescriptor !== undefined && (typeof classMapOrOptionsOrPropertyKey === 'string' || typeof classMapOrOptionsOrPropertyKey === 'symbol')) {
    return createClassDecorator('set')('$this', {})(selectorOrTarget as Object, classMapOrOptionsOrPropertyKey, optionsOrDescriptor as PropertyDescriptor);
  }
  // With selector
  if (typeof selectorOrTarget === 'string') {
    return createClassDecorator('set')(selectorOrTarget, classMapOrOptionsOrPropertyKey, optionsOrDescriptor as ClassApplyOptions);
  }
  // Without selector (defaults to $this)
  return createClassDecorator('set')('$this', selectorOrTarget as ClassApplyOptions);
}

export function updateClass(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor | void;
export function updateClass(selector: ClassSelector, classMapOrOptions?: string | { [className: string]: (el: HTMLElement, value: any, helper: HelperHostSet & { $this: any }) => boolean } | ClassApplyOptions, options?: ClassApplyOptions): MethodDecorator;
export function updateClass(selectorOrTarget?: any, classMapOrOptionsOrPropertyKey?: any, optionsOrDescriptor?: any): any {
  // Bare decorator: @updateClass
  if (optionsOrDescriptor !== undefined && (typeof classMapOrOptionsOrPropertyKey === 'string' || typeof classMapOrOptionsOrPropertyKey === 'symbol')) {
    return createClassDecorator('update')('$this', {})(selectorOrTarget as Object, classMapOrOptionsOrPropertyKey, optionsOrDescriptor as PropertyDescriptor);
  }
  // With selector
  if (typeof selectorOrTarget === 'string') {
    return createClassDecorator('update')(selectorOrTarget, classMapOrOptionsOrPropertyKey, optionsOrDescriptor as ClassApplyOptions);
  }
  // Without selector (defaults to $this)
  return createClassDecorator('update')('$this', selectorOrTarget as ClassApplyOptions);
}

export function addClass(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor | void;
export function addClass(selector: ClassSelector, classMapOrOptions?: string | { [className: string]: (el: HTMLElement, value: any, helper: HelperHostSet & { $this: any }) => boolean } | ClassApplyOptions, options?: ClassApplyOptions): MethodDecorator;
export function addClass(selectorOrTarget?: any, classMapOrOptionsOrPropertyKey?: any, optionsOrDescriptor?: any): any {
  // Bare decorator: @addClass
  if (optionsOrDescriptor !== undefined && (typeof classMapOrOptionsOrPropertyKey === 'string' || typeof classMapOrOptionsOrPropertyKey === 'symbol')) {
    return createClassDecorator('add')('$this', {})(selectorOrTarget as Object, classMapOrOptionsOrPropertyKey, optionsOrDescriptor as PropertyDescriptor);
  }
  // With selector
  if (typeof selectorOrTarget === 'string') {
    return createClassDecorator('add')(selectorOrTarget, classMapOrOptionsOrPropertyKey, optionsOrDescriptor as ClassApplyOptions);
  }
  // Without selector (defaults to $this)
  return createClassDecorator('add')('$this', selectorOrTarget as ClassApplyOptions);
}

export function removeClass(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor | void;
export function removeClass(selector: ClassSelector, classMapOrOptions?: string | { [className: string]: (el: HTMLElement, value: any, helper: HelperHostSet & { $this: any }) => boolean } | ClassApplyOptions, options?: ClassApplyOptions): MethodDecorator;
export function removeClass(selectorOrTarget?: any, classMapOrOptionsOrPropertyKey?: any, optionsOrDescriptor?: any): any {
  // Bare decorator: @removeClass
  if (optionsOrDescriptor !== undefined && (typeof classMapOrOptionsOrPropertyKey === 'string' || typeof classMapOrOptionsOrPropertyKey === 'symbol')) {
    return createClassDecorator('remove')('$this', {})(selectorOrTarget as Object, classMapOrOptionsOrPropertyKey, optionsOrDescriptor as PropertyDescriptor);
  }
  // With selector
  if (typeof selectorOrTarget === 'string') {
    return createClassDecorator('remove')(selectorOrTarget, classMapOrOptionsOrPropertyKey, optionsOrDescriptor as ClassApplyOptions);
  }
  // Without selector (defaults to $this)
  return createClassDecorator('remove')('$this', selectorOrTarget as ClassApplyOptions);
}

export function toggleClass(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor | void;
export function toggleClass(selector: ClassSelector, classMapOrOptions?: string | { [className: string]: (el: HTMLElement, value: any, helper: HelperHostSet & { $this: any }) => boolean } | ClassApplyOptions, options?: ClassApplyOptions): MethodDecorator;
export function toggleClass(selectorOrTarget?: any, classMapOrOptionsOrPropertyKey?: any, optionsOrDescriptor?: any): any {
  // Bare decorator: @toggleClass
  if (optionsOrDescriptor !== undefined && (typeof classMapOrOptionsOrPropertyKey === 'string' || typeof classMapOrOptionsOrPropertyKey === 'symbol')) {
    return createClassDecorator('toggle')('$this', {})(selectorOrTarget as Object, classMapOrOptionsOrPropertyKey, optionsOrDescriptor as PropertyDescriptor);
  }
  // With selector
  if (typeof selectorOrTarget === 'string') {
    return createClassDecorator('toggle')(selectorOrTarget, classMapOrOptionsOrPropertyKey, optionsOrDescriptor as ClassApplyOptions);
  }
  // Without selector (defaults to $this)
  return createClassDecorator('toggle')('$this', selectorOrTarget as ClassApplyOptions);
}

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
