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

export interface PropertyMetadata {
  propertyKey: string | symbol;
  selector: string;
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
 * Handles special selectors ($this, $host, etc.) and CSS selectors
 * Returns HTMLElement[] but can include Window and Document for property access
 */
export const resolvePropertyTargets = (inst: any, selector: string, options: PropertyOptions): any[] => {
  const conf = getElementConfig(inst);
  const currentWin = conf.window;
  const r = options.root || 'auto';
  const results: any[] = [];

  const applyRoot = (target: any) => {
    if (!target) return;
    if (r === 'auto') {
      results.push(target);
    } else {
      if (r === 'light' || r === 'all') results.push(target);
      if ((r === 'shadow' || r === 'all') && target.shadowRoot) results.push(target.shadowRoot);
    }
  };

  if (selector === '$this' || !selector) {
    applyRoot(inst);
  } else if (selector === '$window') {
    results.push(currentWin);
  } else if (selector === '$document') {
    results.push(currentWin.document);
  } else {
    const hostSet = SwcUtils.getHostSet(inst);
    if (selector === '$host') applyRoot(hostSet.$host);
    else if (selector === '$parentHost') applyRoot(hostSet.$parentHost);
    else if (selector === '$appHost') applyRoot(hostSet.$appHost as any);
    else if (selector === '$firstHost') applyRoot(hostSet.$firstHost);
    else if (selector === '$lastHost') applyRoot(hostSet.$lastHost);
    else if (selector === '$firstAppHost') applyRoot(hostSet.$firstAppHost as any);
    else if (selector === '$lastAppHost') applyRoot(hostSet.$lastAppHost as any);
    else if (selector === '$hosts') hostSet.$hosts.forEach(applyRoot);
    else if (selector === '$appHosts') hostSet.$appHosts.forEach(applyRoot);
    else {
      if (r === 'shadow') {
        const found = inst.shadowRoot?.querySelectorAll(selector);
        if (found) results.push(...found);
      } else if (r === 'light') {
        const found = inst.querySelectorAll(selector);
        if (found) results.push(...found);
      } else if (r === 'all') {
        const sMatch = inst.shadowRoot?.querySelectorAll(selector);
        const lMatch = inst.querySelectorAll(selector);
        if (sMatch) results.push(...sMatch);
        if (lMatch) results.push(...lMatch);
      } else {
        const found = (inst.shadowRoot || inst).querySelectorAll(selector);
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
 * - Return null/undefined to skip setting
 */
export function applyProperty(selector: string, targetPropertyKey: string | symbol, options?: PropertyOptions): MethodDecorator & PropertyDecorator;
export function applyProperty(selector: string, options?: PropertyOptions): MethodDecorator & PropertyDecorator;
export function applyProperty(selector: string, targetPropertyKeyOrOptions?: string | symbol | PropertyOptions, options?: PropertyOptions): MethodDecorator & PropertyDecorator {
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
      selector,
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
 * @property - Alias for @applyProperty
 */
export function property(selector: string, targetPropertyKey: string | symbol, options?: PropertyOptions): MethodDecorator & PropertyDecorator;
export function property(selector: string, options?: PropertyOptions): MethodDecorator & PropertyDecorator;
export function property(selector: string, targetPropertyKeyOrOptions?: string | symbol | PropertyOptions, options?: PropertyOptions): MethodDecorator & PropertyDecorator {
  return applyProperty(selector, targetPropertyKeyOrOptions as any, options);
}

/**
 * @propertyThis - Apply property on $this element
 * Can be used as: @propertyThis or @propertyThis('propertyName') or @propertyThis({ name: 'propertyName' })
 */
export function propertyThis(target: Object, propertyKey: string | symbol): void;
export function propertyThis(targetPropertyKey: string | symbol, options?: PropertyOptions): MethodDecorator & PropertyDecorator;
export function propertyThis(options?: PropertyOptions): MethodDecorator & PropertyDecorator;
export function propertyThis(targetOrOptions?: any, propertyKeyOrOptions?: any, descriptor?: PropertyDescriptor): any {
  // Direct decorator usage: @propertyThis
  if (typeof targetOrOptions === 'object' && targetOrOptions !== null && !Array.isArray(targetOrOptions) && 
      (typeof propertyKeyOrOptions === 'string' || typeof propertyKeyOrOptions === 'symbol')) {
    // Called as @propertyThis (target, propertyKey)
    return applyProperty('$this', undefined as any, {})(targetOrOptions, propertyKeyOrOptions, descriptor);
  }
  
  // Called with parameters
  if (typeof targetOrOptions === 'string' || typeof targetOrOptions === 'symbol') {
    // @propertyThis('propertyName', options?)
    return applyProperty('$this', targetOrOptions, propertyKeyOrOptions);
  } else if (targetOrOptions && typeof targetOrOptions === 'object') {
    // @propertyThis({ name: 'propertyName' })
    return applyProperty('$this', undefined as any, targetOrOptions);
  } else {
    // @propertyThis() or @propertyThis
    return applyProperty('$this', undefined as any, {});
  }
}

/**
 * @setProperty - Alias for @applyProperty (method-decorator semantics)
 */
export function setProperty(selector: string, targetPropertyKey: string | symbol, options?: PropertyOptions): MethodDecorator;
export function setProperty(selector: string, options?: PropertyOptions): MethodDecorator;
export function setProperty(selector: string, targetPropertyKeyOrOptions?: string | symbol | PropertyOptions, options?: PropertyOptions): MethodDecorator {
  return applyProperty(selector, targetPropertyKeyOrOptions as any, options) as MethodDecorator;
}

/**
 * @setPropertyThis - Set property on $this element
 * Can be used as: @setPropertyThis or @setPropertyThis('propertyName') or @setPropertyThis({ name: 'propertyName' })
 */
export function setPropertyThis(target: Object, propertyKey: string | symbol): void;
export function setPropertyThis(targetPropertyKey: string | symbol, options?: PropertyOptions): MethodDecorator;
export function setPropertyThis(options?: PropertyOptions): MethodDecorator;
export function setPropertyThis(targetOrOptions?: any, propertyKeyOrOptions?: any, descriptor?: PropertyDescriptor): any {
  // Direct decorator usage: @setPropertyThis
  if (typeof targetOrOptions === 'object' && targetOrOptions !== null && !Array.isArray(targetOrOptions) && 
      (typeof propertyKeyOrOptions === 'string' || typeof propertyKeyOrOptions === 'symbol')) {
    // Called as @setPropertyThis (target, propertyKey)
    return applyProperty('$this', undefined as any, {})(targetOrOptions, propertyKeyOrOptions, descriptor);
  }
  
  // Called with parameters
  if (typeof targetOrOptions === 'string' || typeof targetOrOptions === 'symbol') {
    // @setPropertyThis('propertyName', options?)
    return applyProperty('$this', targetOrOptions, propertyKeyOrOptions) as MethodDecorator;
  } else if (targetOrOptions && typeof targetOrOptions === 'object') {
    // @setPropertyThis({ name: 'propertyName' })
    return applyProperty('$this', undefined as any, targetOrOptions) as MethodDecorator;
  } else {
    // @setPropertyThis() or @setPropertyThis
    return applyProperty('$this', undefined as any, {}) as MethodDecorator;
  }
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
