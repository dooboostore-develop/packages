import {ReflectUtils, FunctionUtils, ActionExpression} from '@dooboostore/core';
import {ensureInit, getElementConfig} from './elementDefine';
import {SwcUtils} from '../utils/Utils';
import {SwcQueryOptions, HelperHostSet} from '../types';
import {ConvertUtils} from '@dooboostore/core-web';

// ============================================
// Types & Interfaces
// ============================================

export interface AttributeOptions extends SwcQueryOptions {
  name?: string;
  type?: typeof Number | typeof Boolean | typeof String;
  filter?: (target: HTMLElement, value: any, meta: { currentThis: any, helper: HelperHostSet }) => boolean;
  /**
   * Custom key to extract value from return object.
   * If not provided, uses ATTRIBUTE_METADATA_KEY by default.
   * Useful when multiple @setAttribute decorators are on the same method.
   * 
   * Example:
   * @setAttribute('selector1', { valueKey: 'attr1' })
   * @setAttribute('selector2', { valueKey: 'attr2' })
   * myMethod() {
   *   return {
   *     attr1: 'value1',
   *     attr2: 'value2'
   *   };
   * }
   * 
   * Or with symbols:
   * @setAttribute('selector1', { valueKey: Symbol.for('attr1') })
   * @setAttribute('selector2', { valueKey: Symbol.for('attr2') })
   * myMethod() {
   *   return {
   *     [Symbol.for('attr1')]: 'value1',
   *     [Symbol.for('attr2')]: 'value2'
   *   };
   * }
   */
  valueKey?: symbol | string;
}

export type AttributeSelector = string | ((currentThis: any, helper: HelperHostSet) => NodeList | Element | Element[] | null);

export interface AttributeMetadata {
  propertyKey: string | symbol;
  selector: AttributeSelector;
  targetAttributeName: string;
  options: AttributeOptions;
  type: 'property' | 'method';
}

export const ATTRIBUTE_METADATA_KEY = Symbol.for('simple-web-component:attribute');

// ============================================
// Utilities
// ============================================

/**
 * Determine if a string is a CSS selector or an attribute name
 * 
 * CSS selectors typically:
 * - Start with: #, ., [, :, >, +, ~
 * - Contain special chars: >, +, ~, :, [, ]
 * - Are special keywords: $this, $host, $parentHost, etc.
 * 
 * Attribute names are typically:
 * - kebab-case (lowercase with hyphens)
 * - No special selector syntax
 * 
 * @param str - String to check
 * @returns true if it's a CSS selector, false if it's an attribute name
 */
const isCssSelector = (str: string): boolean => {
  if (!str) return false;
  
  // Special keywords
  if (str.startsWith('$')) return true;
  
  // CSS selector syntax
  if (/^[#.\[\:>+~]/.test(str)) return true;
  
  // Contains CSS combinator or pseudo-selector syntax
  if (/[>+~:\[\]]/.test(str)) return true;
  
  return false;
};

const convertValue = (val: string | null, type: any): any => {
  if (val === null || val === undefined) return val;
  if (type === Number) return Number(val);
  if (type === Boolean) return val === 'false' || val === '0' ? false : true;
  return val;
};

export {convertValue};

export const getAttributeValue = (inst: any, attrName: string, options?: AttributeOptions & { selector?: AttributeSelector }): any => {
  const conf = getElementConfig(inst);
  const currentWin = inst._resolveWindow?.(conf) || ((typeof window !== 'undefined' ? window : undefined) as any);

  // If selector is not provided, use inst itself
  const targets = options?.selector ? resolveAttributeTargets(inst, options.selector, options) : [inst];

  const primaryTarget = targets[0];

  if (primaryTarget && typeof (primaryTarget as any).hasAttribute === 'function' && (primaryTarget as any).hasAttribute(attrName)) {
    let domVal = (primaryTarget as any).getAttribute(attrName);

    // 표현식 체크
    const ae = new ActionExpression(domVal);
    const expr = ae.getFirstExpression('callReturn');
    if (expr) {
      try {
        const result = FunctionUtils.executeReturn({
          script: ConvertUtils.decodeHtmlEntity(expr.script, currentWin.document),
          context: inst,
          args: SwcUtils.getHelperAndHostSet(currentWin, inst)
        });
        return convertValue(result, options?.type);
      } catch (err) {
        console.error(`[SWC] Failed to execute directive {{= ${expr.script} }}:`, err);
        return convertValue(domVal, options?.type);
      }
    }

    return convertValue(domVal, options?.type);
  }

  // If no target found, return null
  return null;
};

/**
 * Resolve target elements based on selector and options
 * Handles special selectors ($this, $host, etc.), CSS selectors, and function-based selectors
 * Returns HTMLElement[] for attribute operations
 */
export const resolveAttributeTargets = (inst: any, selector: AttributeSelector, options: AttributeOptions): HTMLElement[] => {
  const conf = getElementConfig(inst);
  const currentWin = conf.window;
  const r = options.root || 'auto';
  const results: HTMLElement[] = [];

  // Resolve selector if it's a function
  let resolvedSelector: string | Element | NodeList | Element[] | null = selector as any;
  if (typeof selector === 'function') {
    const hostSet = SwcUtils.getHelperAndHostSet(currentWin, inst);
    resolvedSelector = selector(inst, hostSet);
  }

  // If selector function returned elements directly, use them
  if (resolvedSelector instanceof currentWin.Element) {
    results.push(resolvedSelector as HTMLElement);
    return results;
  }
  if (resolvedSelector instanceof currentWin.NodeList) {
    results.push(...(Array.from(resolvedSelector) as HTMLElement[]));
    return results;
  }
  if (Array.isArray(resolvedSelector)) {
    results.push(...(resolvedSelector as HTMLElement[]));
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
 * @applyAttribute decorator - set/get element attributes
 *
 * Usage:
 * - @applyAttribute('selector', 'attrName') - Set attribute with explicit name
 * - @applyAttribute('selector') - Use property name as attribute name
 * - @applyAttribute('selector', { name: 'attrName' }) - Set attribute via options
 * - @applyAttribute((this, helper) => 'selector', 'attrName') - Function-based selector
 * - Return null to remove attribute
 */
export function applyAttribute(selector: AttributeSelector, targetAttributeName: string, options?: AttributeOptions): MethodDecorator & PropertyDecorator;
export function applyAttribute(selector: AttributeSelector, options?: AttributeOptions): MethodDecorator & PropertyDecorator;
export function applyAttribute(selector: AttributeSelector, targetAttributeNameOrOptions?: string | AttributeOptions, options?: AttributeOptions): MethodDecorator & PropertyDecorator {
  return (target: Object, propertyKey: string | symbol, descriptor?: PropertyDescriptor) => {
    // ensureInit(target as any);

    const constructor = target.constructor;
    const designType = (Reflect as any).getMetadata('design:type', target, propertyKey);
    const metaType: 'property' | 'method' = descriptor && typeof descriptor.value === 'function' ? 'method' : 'property';

    // Parse arguments
    let finalOptions: AttributeOptions = {};
    let targetAttributeName: string;

    if (typeof targetAttributeNameOrOptions === 'string') {
      // applyAttribute('selector', 'attrName', options?)
      targetAttributeName = targetAttributeNameOrOptions;
      finalOptions = options || {};
    } else if (targetAttributeNameOrOptions) {
      // applyAttribute('selector', options)
      finalOptions = targetAttributeNameOrOptions;
      targetAttributeName = finalOptions.name || String(propertyKey);
    } else {
      // applyAttribute('selector')
      targetAttributeName = String(propertyKey);
    }

    // Store metadata
    let metaList = ReflectUtils.getOwnMetadata(ATTRIBUTE_METADATA_KEY, constructor) as AttributeMetadata[];
    if (!metaList) {
      metaList = [];
      ReflectUtils.defineMetadata(ATTRIBUTE_METADATA_KEY, metaList, constructor);
    }
    metaList.push({
      propertyKey,
      selector: selector as AttributeSelector,
      targetAttributeName,
      options: finalOptions,
      type: metaType
    });

    // Helper: Apply resolved value to targets
    const applyValueToTargets = (inst: any, resolvedValue: any) => {
      const conf = getElementConfig(inst);
      const currentWin = conf.window;
      const targetEls = resolveAttributeTargets(inst, selector, finalOptions);
      const hostSet = SwcUtils.getHelperAndHostSet(currentWin, inst);

      targetEls.forEach(targetEl => {
        // Apply filter if provided
        if (finalOptions.filter && !finalOptions.filter(targetEl, resolvedValue, {currentThis: inst, helper: hostSet})) {
          return;
        }

        if (resolvedValue === null) {
          // Remove attribute if value is null
          targetEl.removeAttribute(targetAttributeName);
        } else if (resolvedValue !== undefined) {
          // Set attribute
          targetEl.setAttribute(targetAttributeName, resolvedValue === true ? '' : String(resolvedValue));
        }
      });

      return resolvedValue;
    };

    // Method decorator: wrap method to apply its return value to attributes
    if (descriptor && typeof descriptor.value === 'function') {
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
         * Uses valueKey from options if provided, otherwise uses ATTRIBUTE_METADATA_KEY.
         * 
         * Example:
         * @setAttribute('selector1', { valueKey: 'attr1' })
         * @setAttribute('selector2', { valueKey: 'attr2' })
         * myMethod() {
         *   return {
         *     attr1: 'attribute-value1',
         *     attr2: 'attribute-value2'
         *   };
         * }
         * 
         * First decorator will use 'attribute-value1', second will use 'attribute-value2'
         */
        const extractValue = (v: any) => {
          const keyToUse = finalOptions.valueKey ?? ATTRIBUTE_METADATA_KEY;
          if (v && typeof v === 'object' && keyToUse in v) {
            return v[keyToUse];
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

    // Property decorator: define getter/setter to proxy to element attributes
    Object.defineProperty(target, propertyKey, {
      configurable: true,
      enumerable: true,
      get(this: any) {
        ensureInit(this);
        const mergedOptions = {...finalOptions, selector, type: finalOptions.type || designType};
        return getAttributeValue(this, targetAttributeName, mergedOptions);
      },
      set(this: any, value: any) {
        ensureInit(this);

        if (value instanceof Promise) {
          value.then((v: any) => applyValueToTargets(this, v)).catch(() => { /* swallow */
          });
        } else {
          applyValueToTargets(this, value);
        }
      }
    });
  };
}

// ============================================
// Convenience Aliases
// ============================================

/**
 * @attribute - Field decorator for binding element attributes (read/write)
 * 
 * Intelligently distinguishes between attribute names and CSS selectors:
 * 
 * Usage patterns:
 * - @attribute('product-id') - Attribute name on $this (auto-detected)
 * - @attribute('#user', 'product-id') - Attribute name on selector
 * - @attribute('product-id', options) - Attribute name on $this with options
 * - @attribute('#user', 'product-id', options) - Attribute name on selector with options
 * - @attribute((this, helper) => 'selector', 'product-id') - Function-based selector
 * - @attribute - Bare decorator (uses property name as attribute on $this)
 * 
 * Note: This decorator is for FIELDS ONLY. For methods, use @setAttribute.
 */
export function attribute(target: Object, propertyKey: string | symbol):  void;
export function attribute(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor | void;
export function attribute(attributeName: string, options?: AttributeOptions): PropertyDecorator;
export function attribute(selector: AttributeSelector, attributeName: string, options?: AttributeOptions): PropertyDecorator;
export function attribute(selectorOrAttributeOrTarget?: AttributeSelector | Object, attributeNameOrOptions?: any, optionsOrDescriptor?: any): any {
  // Bare decorator: @attribute
  if (optionsOrDescriptor !== undefined && (typeof attributeNameOrOptions === 'string' || typeof attributeNameOrOptions === 'symbol')) {
    return applyAttribute('$this', undefined as any, {})(selectorOrAttributeOrTarget as Object, attributeNameOrOptions, optionsOrDescriptor as PropertyDescriptor);
  }
  
  // With string as first parameter
  if (typeof selectorOrAttributeOrTarget === 'string') {
    // Check if first parameter is a CSS selector or attribute name
    const isSelector = isCssSelector(selectorOrAttributeOrTarget);
    
    if (isSelector) {
      // First param is a selector: @attribute('#user', 'product-id', options?)
      return applyAttribute(selectorOrAttributeOrTarget, attributeNameOrOptions as any, optionsOrDescriptor as AttributeOptions);
    } else {
      // First param is an attribute name: @attribute('product-id', options?)
      // Treat as attribute name on $this
      const options = (typeof attributeNameOrOptions === 'object' && attributeNameOrOptions !== null) 
        ? attributeNameOrOptions 
        : {};
      return applyAttribute('$this', selectorOrAttributeOrTarget, options);
    }
  }
  
  // Without selector (defaults to $this with options)
  return applyAttribute('$this', undefined as any, selectorOrAttributeOrTarget as AttributeOptions);
}

/**
 * @setAttribute - Method decorator for setting element attributes from method return value
 * 
 * Intelligently distinguishes between attribute names and CSS selectors:
 * 
 * Usage patterns:
 * - @setAttribute('data-id') - Attribute name on $this (auto-detected)
 * - @setAttribute('#user', 'data-id') - Attribute name on selector
 * - @setAttribute('data-id', options) - Attribute name on $this with options
 * - @setAttribute('#user', 'data-id', options) - Attribute name on selector with options
 * - @setAttribute((this, helper) => 'selector', 'data-id') - Function-based selector
 * - @setAttribute - Bare decorator (uses method name as attribute on $this)
 * 
 * Note: This decorator is for METHODS ONLY. For fields, use @attribute.
 * 
 * Example:
 * @setAttribute('data-status')
 * updateStatus() {
 *   return 'active';
 * }
 */
export function setAttribute(selector: AttributeSelector, attributeName: string, options?: AttributeOptions): MethodDecorator;
export function setAttribute(attributeName: string, options?: AttributeOptions): MethodDecorator;
export function setAttribute(selectorOrAttributeOrOptions?: AttributeSelector | AttributeOptions, attributeNameOrOptions?: any, optionsOrUndefined?: AttributeOptions): MethodDecorator {
  // With string as first parameter
  if (typeof selectorOrAttributeOrOptions === 'string') {
    // Check if first parameter is a CSS selector or attribute name
    const isSelector = isCssSelector(selectorOrAttributeOrOptions);
    
    if (isSelector) {
      // First param is a selector: @setAttribute('#user', 'data-id', options?)
      return applyAttribute(selectorOrAttributeOrOptions, attributeNameOrOptions as any, optionsOrUndefined as AttributeOptions) as MethodDecorator;
    } else {
      // First param is an attribute name: @setAttribute('data-id', options?)
      // Treat as attribute name on $this
      const options = (typeof attributeNameOrOptions === 'object' && attributeNameOrOptions !== null) 
        ? attributeNameOrOptions 
        : {};
      return applyAttribute('$this', selectorOrAttributeOrOptions, options) as MethodDecorator;
    }
  }
  
  // Without selector (defaults to $this with options)
  return applyAttribute('$this', undefined as any, selectorOrAttributeOrOptions as AttributeOptions) as MethodDecorator;
}

// ============================================
// Metadata Helpers
// ============================================

export const findAllAttributeMetadata = (target: any): AttributeMetadata[] => {
  const actualTarget = target instanceof Function ? target : target.constructor;
  return ReflectUtils.findAllMetadata<AttributeMetadata[]>(ATTRIBUTE_METADATA_KEY, actualTarget).flat();
};

// Backward compatibility alias
export const findAllAttributeApplyMetadata = (target: any): Map<string | symbol, AttributeMetadata> => {
  const result = new Map<string | symbol, AttributeMetadata>();
  findAllAttributeMetadata(target).forEach(meta => {
    result.set(meta.propertyKey, meta);
  });
  return result;
};


export default applyAttribute;
