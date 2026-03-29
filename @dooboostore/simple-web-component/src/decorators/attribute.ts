import { ReflectUtils } from '@dooboostore/core/reflect/ReflectUtils';
import { ensureInit, getElementConfig } from './elementDefine';
import { SwcUtils } from '../utils/Utils';
import { SpecialSelector, SwcQueryOptions } from '../types';

export interface AttributeOptions extends SwcQueryOptions {
  name?: string;
  connectedInitialize?: boolean;
  type?: typeof Number | typeof Boolean | typeof String;
}

export interface AttributeMetadata {
  propertyKey: string | symbol;
  selector: string;
  options: AttributeOptions;
  privateKey: symbol; // Added to bypass getter during initialization
}

export const ATTRIBUTE_METADATA_KEY = Symbol('simple-web-component:attribute');

/**
 * Helper to perform type conversion from string to target type
 */
const convertValue = (val: string | null, type: any): any => {
  if (val === null || val === undefined) return val;
  if (type === Number) return Number(val);
  if (type === Boolean) return val === 'false' || val === '0' ? false : true;
  return val;
};

/**
 * Helper to resolve target elements based on selector and root options
 */
export const resolveTargetEls = (inst: any, selector: string, options: AttributeOptions, currentWin: any): HTMLElement[] => {
  const r = options.root || 'auto';
  const results: HTMLElement[] = [];

  const applyRoot = (target: any) => {
    if (!target) return;
    if (r === 'auto') {
      // Attributes belong to the ELEMENT, not the ShadowRoot.
      // So for :host and direct attribute sync, we mostly want the element itself.
      results.push(target);
    } else {
      if (r === 'light' || r === 'all') results.push(target);
      if ((r === 'shadow' || r === 'all') && target.shadowRoot) results.push(target.shadowRoot);
    }
  };

  if (selector === ':host' || !selector) {
    applyRoot(inst);
  } else if (selector === ':window') {
    results.push(currentWin);
  } else if (selector === ':document') {
    results.push(currentWin.document);
  } else {
    const hostSet = SwcUtils.getHostSet(inst);
    if (selector === ':parentHost') applyRoot(hostSet.$parentHost);
    else if (selector === ':appHost') applyRoot(hostSet.$appHost as any);
    else if (selector === ':firstHost') applyRoot(hostSet.$firstHost);
    else if (selector === ':lastHost') applyRoot(hostSet.$lastHost);
    else if (selector === ':firstAppHost') applyRoot(hostSet.$firstAppHost as any);
    else if (selector === ':lastAppHost') applyRoot(hostSet.$lastAppHost as any);
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
 * @attribute decorator to sync a field value with an element's attribute.
 */
export function attribute(selector: string, options: AttributeOptions = {}): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    const constructor = target.constructor;
    const privateKey = Symbol(String(propertyKey));

    const designType = (Reflect as any).getMetadata('design:type', target, propertyKey);

    let metaList = ReflectUtils.getOwnMetadata(ATTRIBUTE_METADATA_KEY, constructor) as AttributeMetadata[];
    if (!metaList) {
      metaList = [];
      ReflectUtils.defineMetadata(ATTRIBUTE_METADATA_KEY, metaList, constructor);
    }
    metaList.push({ propertyKey, selector, options, privateKey });

    Object.defineProperty(target, propertyKey, {
      get(this: any) {
        const attrName = options.name || String(propertyKey);
        const conf = getElementConfig(this);
        const currentWin = this._resolveWindow?.(conf) || ((typeof window !== 'undefined' ? window : undefined) as any);
        const targetType = options.type || designType;

        console.log('type-->', propertyKey, targetType);
        // During early init phase, if syncing memory to DOM, return memory.
        if (this.__swc_syncing_init || (options.connectedInitialize && !this.__swc_connected)) {
          return convertValue(this[privateKey], targetType);
        }

        const targets = resolveTargetEls(this, selector, options, currentWin);
        const primaryTarget = targets[0];

        if (primaryTarget && typeof (primaryTarget as any).hasAttribute === 'function') {
          if ((primaryTarget as any).hasAttribute(attrName)) {
            const domVal = (primaryTarget as any).getAttribute(attrName);
            return convertValue(domVal, targetType);
          }
          return null;
        }

        return convertValue(this[privateKey], targetType);
      },
      set(this: any, nv: any) {
        const targetType = options.type || designType;
        // const convertedValue = convertValue(nv, targetType);
        // console.log('---set', propertyKey, targetType, nv, convertedValue);

        const attrName = options.name || String(propertyKey);
        const conf = getElementConfig(this);
        const currentWin = this._resolveWindow?.(conf) || ((typeof window !== 'undefined' ? window : undefined) as any);
        const targets = resolveTargetEls(this, selector, options, currentWin);
        targets.forEach(it => {
          console.log('----->', it)
          if (it && typeof (it as any).setAttribute === 'function') {
            if (nv === null) {
              (it as any).removeAttribute(attrName);
            } else {
              (it as any).setAttribute(attrName, String(nv));
            }
          } else {
            this[privateKey] = nv;
          }
        })
      },
      enumerable: true,
      configurable: true
    });
  };
}

export const findAllAttributeMetadata = (target: any): AttributeMetadata[] => {
  return ReflectUtils.findAllMetadata<AttributeMetadata[]>(ATTRIBUTE_METADATA_KEY, target).flat();
};
