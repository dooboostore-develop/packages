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

export interface AttributeMetadata {
  propertyKey: string | symbol;
  selector: string;
  targetAttributeName: string;
  options: AttributeOptions;
  type: 'property' | 'method';
}

export const ATTRIBUTE_METADATA_KEY = Symbol.for('simple-web-component:attribute');

// ============================================
// Utilities
// ============================================

const convertValue = (val: string | null, type: any): any => {
  if (val === null || val === undefined) return val;
  if (type === Number) return Number(val);
  if (type === Boolean) return val === 'false' || val === '0' ? false : true;
  return val;
};

export {convertValue};

export const getAttributeValue = (inst: any, attrName: string, options?: AttributeOptions & { selector?: string }): any => {
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
 * Handles special selectors ($this, $host, etc.) and CSS selectors
 * Returns HTMLElement[] for attribute operations
 */
export const resolveAttributeTargets = (inst: any, selector: string, options: AttributeOptions): HTMLElement[] => {
  const conf = getElementConfig(inst);
  const currentWin = conf.window;
  const r = options.root || 'auto';
  const results: HTMLElement[] = [];

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
 * @applyAttribute decorator - set/get element attributes
 *
 * Usage:
 * - @applyAttribute('selector', 'attrName') - Set attribute with explicit name
 * - @applyAttribute('selector') - Use property name as attribute name
 * - @applyAttribute('selector', { name: 'attrName' }) - Set attribute via options
 * - Return null to remove attribute
 */
export function applyAttribute(selector: string, targetAttributeName: string, options?: AttributeOptions): MethodDecorator & PropertyDecorator;
export function applyAttribute(selector: string, options?: AttributeOptions): MethodDecorator & PropertyDecorator;
export function applyAttribute(selector: string, targetAttributeNameOrOptions?: string | AttributeOptions, options?: AttributeOptions): MethodDecorator & PropertyDecorator {
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
      selector,
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
 * @attribute - Alias for @applyAttribute
 */
export function attribute(selector: string, targetAttributeName: string, options?: AttributeOptions): MethodDecorator & PropertyDecorator;
export function attribute(selector: string, options?: AttributeOptions): MethodDecorator & PropertyDecorator;
export function attribute(selector: string, targetAttributeNameOrOptions?: string | AttributeOptions, options?: AttributeOptions): MethodDecorator & PropertyDecorator {
  return applyAttribute(selector, targetAttributeNameOrOptions as any, options);
}

/**
 * @attributeThis - Apply attribute on $this element
 * Can be used as: @attributeThis or @attributeThis('attrName') or @attributeThis({ name: 'attrName' })
 */
export function attributeThis(target: Object, propertyKey: string | symbol): void;
export function attributeThis(targetAttributeName: string, options?: AttributeOptions): MethodDecorator & PropertyDecorator;
export function attributeThis(options?: AttributeOptions): MethodDecorator & PropertyDecorator;
export function attributeThis(targetOrOptions?: any, propertyKeyOrOptions?: any, descriptor?: PropertyDescriptor): any {
  // Direct decorator usage: @attributeThis
  if (typeof targetOrOptions === 'object' && targetOrOptions !== null && !Array.isArray(targetOrOptions) &&
    typeof propertyKeyOrOptions === 'string' || typeof propertyKeyOrOptions === 'symbol') {
    // Called as @attributeThis (target, propertyKey)
    return applyAttribute('$this', undefined as any, {})(targetOrOptions, propertyKeyOrOptions, descriptor);
  }

  // Called with parameters
  if (typeof targetOrOptions === 'string') {
    // @attributeThis('attrName', options?)
    return applyAttribute('$this', targetOrOptions, propertyKeyOrOptions);
  } else if (targetOrOptions && typeof targetOrOptions === 'object') {
    // @attributeThis({ name: 'attrName' })
    return applyAttribute('$this', undefined as any, targetOrOptions);
  } else {
    // @attributeThis() or @attributeThis
    return applyAttribute('$this', undefined as any, {});
  }
}

/**
 * @setAttribute - Alias for @applyAttribute (method-decorator semantics)
 */
export function setAttribute(selector: string, targetAttributeName: string, options?: AttributeOptions): MethodDecorator;
export function setAttribute(selector: string, options?: AttributeOptions): MethodDecorator;
export function setAttribute(selector: string, targetAttributeNameOrOptions?: string | AttributeOptions, options?: AttributeOptions): MethodDecorator {
  return applyAttribute(selector, targetAttributeNameOrOptions as any, options) as MethodDecorator;
}

/**
 * @setAttributeThis - Set attribute on $this element
 * Can be used as: @setAttributeThis or @setAttributeThis('attrName') or @setAttributeThis({ name: 'attrName' })
 */
export function setAttributeThis(target: Object, propertyKey: string | symbol): void;
export function setAttributeThis(targetAttributeName: string, options?: AttributeOptions): MethodDecorator;
export function setAttributeThis(options?: AttributeOptions): MethodDecorator;
export function setAttributeThis(targetOrOptions?: any, propertyKeyOrOptions?: any, descriptor?: PropertyDescriptor): any {
  // Direct decorator usage: @setAttributeThis
  if (typeof targetOrOptions === 'object' && targetOrOptions !== null && !Array.isArray(targetOrOptions) &&
    (typeof propertyKeyOrOptions === 'string' || typeof propertyKeyOrOptions === 'symbol')) {
    // Called as @setAttributeThis (target, propertyKey)
    return applyAttribute('$this', undefined as any, {})(targetOrOptions, propertyKeyOrOptions, descriptor);
  }

  // Called with parameters
  if (typeof targetOrOptions === 'string') {
    // @setAttributeThis('attrName', options?)
    return applyAttribute('$this', targetOrOptions, propertyKeyOrOptions) as MethodDecorator;
  } else if (targetOrOptions && typeof targetOrOptions === 'object') {
    // @setAttributeThis({ name: 'attrName' })
    return applyAttribute('$this', undefined as any, targetOrOptions) as MethodDecorator;
  } else {
    // @setAttributeThis() or @setAttributeThis
    return applyAttribute('$this', undefined as any, {}) as MethodDecorator;
  }
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
