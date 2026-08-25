import {ReflectUtils} from '@dooboostore/core';
import {ensureInit} from './elementDefine';
import {SwcUtils} from '../utils/Utils';
import { SpecialSelector, SwcQueryOptions, SwcFnSelector, SwcSelector, HelperHostSet } from '../types';

export type StyleAction = 'set' | 'update' | 'remove';

// 공통 옵션 — root 없음
export interface StyleBaseOptions {
  filter?: (target: HTMLElement, value: any, meta: {currentThis: any, helper: HelperHostSet}) => boolean;
  valueKey?: symbol | string;
}

// 문자열 셀렉터 전용 — root 허용
export type StyleQueryOptions = StyleBaseOptions & SwcQueryOptions;
// 함수 셀렉터 전용 — root 금지
export type StyleNonQueryOptions = StyleBaseOptions;
// 내부 저장/해석용
export type StyleApplyOptions = StyleQueryOptions;

export type StyleFnSelector = SwcFnSelector;
export type StyleSelector = SwcSelector;

// 셀렉터 종류에 따라 옵션 타입 분기
export type StyleOptionsOf<S extends StyleSelector> = S extends string ? StyleQueryOptions : StyleNonQueryOptions;

export interface StyleApplyMetadata {
  propertyKey: string | symbol;
  selector: StyleSelector;
  action: StyleAction;
  options: StyleApplyOptions;
}

export const STYLE_METADATA_KEY = Symbol.for('simple-web-component:style');

/**
 * Resolve selector to string or elements
 * Handles function-based selectors and returns elements if applicable
 */
const resolveSelector = (selector: StyleSelector, inst: any, win: Window): string | HTMLElement[] => {
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
    if (result instanceof win.Node) {
      return [];
    }
    return result as string;
  }
  return selector as string;
};

/**
 * Get target elements from selector
 */
const getTargetElements = (selector: StyleSelector, inst: any, win: Window, root: string): HTMLElement[] => {
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

function createStyleDecorator(action: StyleAction) {
  return (selector: StyleSelector, options: StyleApplyOptions = {}): MethodDecorator => {
    return (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
      const constructor = target.constructor;
      let metaList = ReflectUtils.getOwnMetadata(STYLE_METADATA_KEY, constructor) as Map<string | symbol, StyleApplyMetadata>;
      if (!metaList) {
        metaList = new Map<string | symbol, StyleApplyMetadata>();
        ReflectUtils.defineMetadata(STYLE_METADATA_KEY, metaList, constructor);
      }
      metaList.set(propertyKey, { propertyKey, selector, action, options });

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
         * Uses valueKey from options if provided, otherwise uses STYLE_METADATA_KEY.
         */
        const extractValue = (v: any) => {
          const keyToUse = options.valueKey ?? STYLE_METADATA_KEY;
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
            const r = options.root || 'auto';
            const targetEls = getTargetElements(selector, this, win, r);

            targetEls.forEach(targetEl => {
              if (options.filter && !options.filter(targetEl, resolvedValue, {currentThis: this, helper: hostSet})) {
                return;
              }
              const resolvedRes = typeof resolvedValue === 'function' ? (resolvedValue as any)(targetEl, hostSet) : resolvedValue;

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

export function applyStyle(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor | void;
export function applyStyle(selector: string, action?: StyleAction, options?: StyleQueryOptions): MethodDecorator;
export function applyStyle(selector: StyleFnSelector, action?: StyleAction, options?: StyleNonQueryOptions): MethodDecorator;
export function applyStyle(selectorOrTarget?: any, actionOrPropertyKey?: any, optionsOrDescriptor?: any): any {
  // Bare decorator: @applyStyle
  if (optionsOrDescriptor !== undefined && typeof selectorOrTarget !== 'string' && typeof selectorOrTarget !== 'function' && (typeof actionOrPropertyKey === 'string' || typeof actionOrPropertyKey === 'symbol')) {
    return createStyleDecorator('update')('$this', {})(selectorOrTarget as Object, actionOrPropertyKey, optionsOrDescriptor as PropertyDescriptor);
  }
  // With selector
  if (typeof selectorOrTarget === 'string' || typeof selectorOrTarget === 'function') {
    const action = (typeof actionOrPropertyKey === 'string' ? actionOrPropertyKey : 'update') as StyleAction;
    const options = (typeof actionOrPropertyKey === 'object' ? actionOrPropertyKey : optionsOrDescriptor) as StyleApplyOptions | undefined;
    return createStyleDecorator(action)(selectorOrTarget, options);
  }
  // Without selector (defaults to $this)
  const action = (typeof selectorOrTarget === 'string' ? selectorOrTarget : 'update') as StyleAction;
  const options = (typeof selectorOrTarget === 'object' ? selectorOrTarget : actionOrPropertyKey) as StyleApplyOptions | undefined;
  return createStyleDecorator(action)('$this', options);
}

export function setStyle(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor | void;
export function setStyle(selector: string, options?: StyleQueryOptions): MethodDecorator;
export function setStyle(selector: StyleFnSelector, options?: StyleNonQueryOptions): MethodDecorator;
export function setStyle(selectorOrTarget?: any, optionsOrPropertyKey?: any, descriptor?: any): any {
  // Bare decorator: @setStyle
  if (descriptor !== undefined && (typeof optionsOrPropertyKey === 'string' || typeof optionsOrPropertyKey === 'symbol')) {
    return createStyleDecorator('set')('$this', {})(selectorOrTarget as Object, optionsOrPropertyKey, descriptor as PropertyDescriptor);
  }
  // With selector
  if (typeof selectorOrTarget === 'string' || typeof selectorOrTarget === 'function') {
    return createStyleDecorator('set')(selectorOrTarget, optionsOrPropertyKey as StyleApplyOptions);
  }
  // Without selector (defaults to $this)
  return createStyleDecorator('set')('$this', selectorOrTarget as StyleApplyOptions);
}

export function updateStyle(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor | void;
export function updateStyle(selector: string, options?: StyleQueryOptions): MethodDecorator;
export function updateStyle(selector: StyleFnSelector, options?: StyleNonQueryOptions): MethodDecorator;
export function updateStyle(selectorOrTarget?: any, optionsOrPropertyKey?: any, descriptor?: any): any {
  // Bare decorator: @updateStyle
  if (descriptor !== undefined && (typeof optionsOrPropertyKey === 'string' || typeof optionsOrPropertyKey === 'symbol')) {
    return createStyleDecorator('update')('$this', {})(selectorOrTarget as Object, optionsOrPropertyKey, descriptor as PropertyDescriptor);
  }
  // With selector
  if (typeof selectorOrTarget === 'string' || typeof selectorOrTarget === 'function') {
    return createStyleDecorator('update')(selectorOrTarget, optionsOrPropertyKey as StyleApplyOptions);
  }
  // Without selector (defaults to $this)
  return createStyleDecorator('update')('$this', selectorOrTarget as StyleApplyOptions);
}

export function removeStyle(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor | void;
export function removeStyle(selector: string, options?: StyleQueryOptions): MethodDecorator;
export function removeStyle(selector: StyleFnSelector, options?: StyleNonQueryOptions): MethodDecorator;
export function removeStyle(selectorOrTarget?: any, optionsOrPropertyKey?: any, descriptor?: any): any {
  // Bare decorator: @removeStyle
  if (descriptor !== undefined && (typeof optionsOrPropertyKey === 'string' || typeof optionsOrPropertyKey === 'symbol')) {
    return createStyleDecorator('remove')('$this', {})(selectorOrTarget as Object, optionsOrPropertyKey, descriptor as PropertyDescriptor);
  }
  // With selector
  if (typeof selectorOrTarget === 'string' || typeof selectorOrTarget === 'function') {
    return createStyleDecorator('remove')(selectorOrTarget, optionsOrPropertyKey as StyleApplyOptions);
  }
  // Without selector (defaults to $this)
  return createStyleDecorator('remove')('$this', selectorOrTarget as StyleApplyOptions);
}

// ─── Aliases ───
export const style = applyStyle;

// ─── 편의 헬퍼 (selector/root 생략) ───

export function styleThis(action?: StyleAction, options?: StyleQueryOptions): MethodDecorator {
  return applyStyle('$this', action, options);
}
export function styleAppHost(action?: StyleAction, options?: StyleQueryOptions): MethodDecorator {
  return applyStyle('$appHost', action, options);
}
export function styleLight(selector: string, action?: StyleAction, options?: Omit<StyleQueryOptions, 'root'>): MethodDecorator;
export function styleLight(selector: string, options?: Omit<StyleQueryOptions, 'root'>): MethodDecorator;
export function styleLight(selector: string, actionOrOptions?: StyleAction | Omit<StyleQueryOptions, 'root'>, options?: Omit<StyleQueryOptions, 'root'>): MethodDecorator {
  const action = (typeof actionOrOptions === 'string' ? actionOrOptions : undefined) as StyleAction | undefined;
  const opts = (typeof actionOrOptions === 'object' ? actionOrOptions : options) as Omit<StyleQueryOptions, 'root'> | undefined;
  return applyStyle(selector, action, {...opts ?? {}, root: 'light'});
}
export function styleShadow(selector: string, action?: StyleAction, options?: Omit<StyleQueryOptions, 'root'>): MethodDecorator;
export function styleShadow(selector: string, options?: Omit<StyleQueryOptions, 'root'>): MethodDecorator;
export function styleShadow(selector: string, actionOrOptions?: StyleAction | Omit<StyleQueryOptions, 'root'>, options?: Omit<StyleQueryOptions, 'root'>): MethodDecorator {
  const action = (typeof actionOrOptions === 'string' ? actionOrOptions : undefined) as StyleAction | undefined;
  const opts = (typeof actionOrOptions === 'object' ? actionOrOptions : options) as Omit<StyleQueryOptions, 'root'> | undefined;
  return applyStyle(selector, action, {...opts ?? {}, root: 'shadow'});
}
export function styleAll(selector: string, action?: StyleAction, options?: Omit<StyleQueryOptions, 'root'>): MethodDecorator;
export function styleAll(selector: string, options?: Omit<StyleQueryOptions, 'root'>): MethodDecorator;
export function styleAll(selector: string, actionOrOptions?: StyleAction | Omit<StyleQueryOptions, 'root'>, options?: Omit<StyleQueryOptions, 'root'>): MethodDecorator {
  const action = (typeof actionOrOptions === 'string' ? actionOrOptions : undefined) as StyleAction | undefined;
  const opts = (typeof actionOrOptions === 'object' ? actionOrOptions : options) as Omit<StyleQueryOptions, 'root'> | undefined;
  return applyStyle(selector, action, {...opts ?? {}, root: 'all'});
}

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
