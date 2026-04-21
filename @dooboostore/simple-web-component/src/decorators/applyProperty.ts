import { ReflectUtils } from '@dooboostore/core';
import { ensureInit, getElementConfig } from './elementDefine';
import { SwcUtils } from '../utils/Utils';
import { SwcQueryOptions, HelperHostSet } from '../types';

export interface PropertyOptions extends SwcQueryOptions {
  name?: string | symbol;
  filter?: (target: HTMLElement, value: any, meta: {currentThis: any, helper: HelperHostSet}) => boolean;
  /**
   * Custom key to extract value from return object.
   * If not provided, uses PROPERTY_METADATA_KEY by default.
   * Useful when multiple @setProperty decorators are on the same method.
   * 
   * Example:
   * @setProperty('selector1', { valueKey: 'prop1' })
   * @setProperty('selector2', { valueKey: 'prop2' })
   * myMethod() {
   *   return {
   *     prop1: 'value1',
   *     prop2: 'value2'
   *   };
   * }
   * 
   * Or with symbols:
   * @setProperty('selector1', { valueKey: Symbol.for('prop1') })
   * @setProperty('selector2', { valueKey: Symbol.for('prop2') })
   * myMethod() {
   *   return {
   *     [Symbol.for('prop1')]: 'value1',
   *     [Symbol.for('prop2')]: 'value2'
   *   };
   * }
   */
  valueKey?: symbol | string;
}

export type PropertySelector = string | ((currentThis: any, helper: HelperHostSet) => NodeList | Element | Element[] | null);

export interface PropertyMetadata {
  propertyKey: string | symbol;
  selector: PropertySelector;
  targetPropertyKey: string | symbol;
  options: PropertyOptions;
  type: 'property' | 'method';
}

export const PROPERTY_METADATA_KEY = Symbol.for('simple-web-component:property');

// ============================================
// Utilities
// ============================================

/**
 * Resolve target elements based on selector and options
 * Handles special selectors ($this, $host, etc.), CSS selectors, and function-based selectors
 * Returns HTMLElement[] but can include Window and Document for property access
 */
export const resolvePropertyTargets = (inst: any, selector: PropertySelector, options: PropertyOptions): any[] => {
  const conf = getElementConfig(inst);
  const currentWin = conf.window;
  const r = options.root || 'auto';
  const results: any[] = [];

  // Resolve selector if it's a function
  let resolvedSelector: string | Element | NodeList | Element[] | null = selector as any;
  if (typeof selector === 'function') {
    const hostSet = SwcUtils.getHelperAndHostSet(currentWin, inst);
    resolvedSelector = selector(inst, hostSet);
  }

  // If selector function returned elements directly, use them
  if (resolvedSelector instanceof currentWin.Element) {
    results.push(resolvedSelector);
    return results;
  }
  if (resolvedSelector instanceof currentWin.NodeList) {
    results.push(...Array.from(resolvedSelector));
    return results;
  }
  if (Array.isArray(resolvedSelector)) {
    results.push(...resolvedSelector);
    return results;
  }
  if (resolvedSelector === null) {
    return results;
  }

  // Handle string selector
  const stringSelector = resolvedSelector as string;

  const applyRoot = (target: any) => {
    if (!target) return;
    if (r === 'auto') {
      results.push(target);
    } else {
      if (r === 'light' || r === 'all') results.push(target);
      if ((r === 'shadow' || r === 'all') && target.shadowRoot) results.push(target.shadowRoot);
    }
  };

  if (stringSelector === '$this' || !stringSelector) {
    applyRoot(inst);
  } else if (stringSelector === '$window') {
    results.push(currentWin);
  } else if (stringSelector === '$document') {
    results.push(currentWin.document);
  } else {
    const hostSet = SwcUtils.getHostSet(inst);
    if (stringSelector === '$host') applyRoot(hostSet.$host);
    else if (stringSelector === '$parentHost') applyRoot(hostSet.$parentHost);
    else if (stringSelector === '$appHost') applyRoot(hostSet.$appHost as any);
    else if (stringSelector === '$firstHost') applyRoot(hostSet.$firstHost);
    else if (stringSelector === '$lastHost') applyRoot(hostSet.$lastHost);
    else if (stringSelector === '$firstAppHost') applyRoot(hostSet.$firstAppHost as any);
    else if (stringSelector === '$lastAppHost') applyRoot(hostSet.$lastAppHost as any);
    else if (stringSelector === '$hosts') hostSet.$hosts.forEach(applyRoot);
    else if (stringSelector === '$appHosts') hostSet.$appHosts.forEach(applyRoot);
    else {
      if (r === 'shadow') {
        const found = inst.shadowRoot?.querySelectorAll(stringSelector);
        if (found) results.push(...found);
      } else if (r === 'light') {
        const found = inst.querySelectorAll(stringSelector);
        if (found) results.push(...found);
      } else if (r === 'all') {
        const sMatch = inst.shadowRoot?.querySelectorAll(stringSelector);
        const lMatch = inst.querySelectorAll(stringSelector);
        if (sMatch) results.push(...sMatch);
        if (lMatch) results.push(...lMatch);
      } else {
        const found = (inst.shadowRoot || inst).querySelectorAll(stringSelector);
        if (found) results.push(...found);
      }
    }
  }
  return results;
};

/**
 * @applyProperty decorator - set/get element properties
 * 
 * Usage:
 * - @applyProperty('selector', 'propertyName') - Set property with explicit name
 * - @applyProperty('selector') - Use property name as target property name
 * - @applyProperty('selector', { name: 'propertyName' }) - Set property via options
 * - @applyProperty((this, helper) => 'selector', 'propertyName') - Function-based selector
 * - Return null/undefined to skip setting
 */
export function applyProperty(selector: PropertySelector, targetPropertyKey: string | symbol, options?: PropertyOptions): MethodDecorator & PropertyDecorator;
export function applyProperty(selector: PropertySelector, options?: PropertyOptions): MethodDecorator & PropertyDecorator;
export function applyProperty(selector: PropertySelector, targetPropertyKeyOrOptions?: string | symbol | PropertyOptions, options?: PropertyOptions): MethodDecorator & PropertyDecorator {
  return (target: Object, propertyKey: string | symbol, descriptor?: PropertyDescriptor) => {
    // ensureInit(target as any);
    
    const constructor = target.constructor;
    const metaType: 'property' | 'method' = descriptor && typeof descriptor.value === 'function' ? 'method' : 'property';
    
    // Parse arguments
    let finalOptions: PropertyOptions = {};
    let targetPropertyKey: string | symbol;
    
    if (typeof targetPropertyKeyOrOptions === 'string' || typeof targetPropertyKeyOrOptions === 'symbol') {
      // applyProperty('selector', 'propertyName', options?)
      targetPropertyKey = targetPropertyKeyOrOptions;
      finalOptions = options || {};
    } else if (targetPropertyKeyOrOptions) {
      // applyProperty('selector', options)
      finalOptions = targetPropertyKeyOrOptions;
      targetPropertyKey = finalOptions.name || propertyKey;
    } else {
      // applyProperty('selector')
      targetPropertyKey = propertyKey;
    }

    // Store metadata
    let metaList = ReflectUtils.getOwnMetadata(PROPERTY_METADATA_KEY, constructor) as PropertyMetadata[];
    if (!metaList) {
      metaList = [];
      ReflectUtils.defineMetadata(PROPERTY_METADATA_KEY, metaList, constructor);
    }
    metaList.push({
      propertyKey,
      selector: selector as PropertySelector,
      targetPropertyKey,
      options: finalOptions,
      type: metaType
    });

    // Helper: apply resolved value to targets
    const applyValueToTargets = (inst: any, resolvedValue: any) => {
      if (resolvedValue === undefined) return resolvedValue;

      const targetEls = resolvePropertyTargets(inst, selector, finalOptions);
      const conf = getElementConfig(inst);
      const currentWin = conf.window;
      const hostSet = SwcUtils.getHelperAndHostSet(currentWin, inst);

      targetEls.forEach(targetEl => {
        // Apply filter if provided
        if (finalOptions.filter && !finalOptions.filter(targetEl, resolvedValue, { currentThis: inst, helper: hostSet })) {
          return;
        }

        const resolvedRes = typeof resolvedValue === 'function' ? (resolvedValue as any)(targetEl, hostSet) : resolvedValue;
        (targetEl as any)[targetPropertyKey] = resolvedRes;
      });

      return resolvedValue;
    };

    // Method decorator: wrap method to apply its return value to properties
    if (descriptor && typeof descriptor.value === 'function') {
      const original = descriptor.value;
      descriptor.value = function (...args: any[]) {
        ensureInit(this);
        const res = (original as any).apply(this, args);

        /**
         * Extract value for this decorator from method return value
         * 
         * If return value is an object with this decorator's symbol key,
         * use that value. Otherwise use the entire return value.
         * 
         * Example:
         * @setProperty('selector')
         * myMethod() {
         *   return {
         *     [PROPERTY_METADATA_KEY]: 'property-value',
         *     [OTHER_DECORATOR_KEY]: 'other-value'
         *   };
         * }
         * 
         * This decorator will use 'property-value'
         */
        const extractValue = (v: any) => {
          if (v && typeof v === 'object' && PROPERTY_METADATA_KEY in v) {
            return v[PROPERTY_METADATA_KEY];
          }
          return v;
        };

        if (res instanceof Promise) {
          return res.then((v: any) => { 
            const extracted = extractValue(v);
            applyValueToTargets(this, extracted); 
            return v; 
          });
        } else {
          const extracted = extractValue(res);
          applyValueToTargets(this, extracted);
          return res;
        }
      };
      return;
    }

    // Property decorator: define getter/setter to proxy to element properties
    Object.defineProperty(target, propertyKey, {
      configurable: true,
      enumerable: true,
      get(this: any) {
        ensureInit(this);
        // Read from matched elements
        const targetEls = resolvePropertyTargets(this, selector, finalOptions);
        const conf = getElementConfig(this);
        const currentWin = conf.window;
        const hostSet = SwcUtils.getHelperAndHostSet(currentWin, this);

        // Apply filter
        const filtered = targetEls.filter(el => {
          if (finalOptions.filter && !finalOptions.filter(el, (el as any)[targetPropertyKey], { currentThis: this, helper: hostSet })) {
            return false;
          }
          return true;
        });

        const values = filtered.map(el => (el as any)[targetPropertyKey]);
        return values.length === 1 ? values[0] : values;
      },
      set(this: any, value: any) {
        ensureInit(this);
        applyValueToTargets(this, value);
      }
    });
  };
}

// ============================================
// Convenience Aliases
// ============================================

/**
 * @property - Field decorator for binding element properties (read/write)
 * 
 * Usage:
 * - @property('selector', 'propertyName') - Bind to specific property
 * - @property('selector') - Use field name as property name
 * - @property('selector', options) - Bind with options
 * - @property((this, helper) => 'selector', 'propertyName') - Function-based selector
 * - @property - Bare decorator (binds to $this with field name)
 * 
 * Note: This decorator is for FIELDS ONLY. For methods, use @setProperty.
 */
export function property(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor | void;
export function property(selector: PropertySelector, targetPropertyKey: string | symbol, options?: PropertyOptions): PropertyDecorator;
export function property(selector: PropertySelector, options?: PropertyOptions): PropertyDecorator;
export function property(selectorOrTarget?: PropertySelector | Object, targetPropertyKeyOrOptions?: any, optionsOrDescriptor?: any): any {
  // Bare decorator: @property
  if (optionsOrDescriptor !== undefined && (typeof targetPropertyKeyOrOptions === 'string' || typeof targetPropertyKeyOrOptions === 'symbol')) {
    return applyProperty('$this', undefined as any, {})(selectorOrTarget as Object, targetPropertyKeyOrOptions, optionsOrDescriptor as PropertyDescriptor);
  }
  // With selector
  if (typeof selectorOrTarget === 'string') {
    return applyProperty(selectorOrTarget, targetPropertyKeyOrOptions as any, optionsOrDescriptor as PropertyOptions);
  }
  // Without selector (defaults to $this)
  return applyProperty('$this', undefined as any, selectorOrTarget as PropertyOptions);
}

/**
 * @setProperty - Method decorator for setting element properties from method return value
 * 
 * Usage:
 * - @setProperty('selector', 'propertyName') - Set specific property
 * - @setProperty('selector') - Use method name as property name
 * - @setProperty('selector', options) - Set with options
 * - @setProperty((this, helper) => 'selector', 'propertyName') - Function-based selector
 * - @setProperty - Bare decorator (sets on $this with method name)
 * 
 * Note: This decorator is for METHODS ONLY. For fields, use @property.
 * 
 * Example:
 * @setProperty('selector', 'disabled')
 * disableElement() {
 *   return true;
 * }
 */
export function setProperty(selector: PropertySelector, targetPropertyKey: string | symbol, options?: PropertyOptions): MethodDecorator;
export function setProperty(selector: PropertySelector, options?: PropertyOptions): MethodDecorator;
export function setProperty(selectorOrOptions?: PropertySelector | PropertyOptions, targetPropertyKeyOrOptions?: any, optionsOrUndefined?: PropertyOptions): MethodDecorator {
  // With selector
  if (typeof selectorOrOptions === 'string') {
    return applyProperty(selectorOrOptions, targetPropertyKeyOrOptions as any, optionsOrUndefined as PropertyOptions) as MethodDecorator;
  }
  // Without selector (defaults to $this)
  return applyProperty('$this', undefined as any, selectorOrOptions as PropertyOptions) as MethodDecorator;
}

// ============================================
// Metadata Helpers
// ============================================

export const findAllPropertyMetadata = (target: any): PropertyMetadata[] => {
  const actualTarget = target instanceof Function ? target : target.constructor;
  return ReflectUtils.findAllMetadata<PropertyMetadata[]>(PROPERTY_METADATA_KEY, actualTarget).flat();
};

// Backward compatibility alias
export const findAllPropertyApplyMetadata = (target: any): Map<string | symbol, PropertyMetadata> => {
  const result = new Map<string | symbol, PropertyMetadata>();
  findAllPropertyMetadata(target).forEach(meta => {
    result.set(meta.propertyKey, meta);
  });
  return result;
};


export default applyProperty;
