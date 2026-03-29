import { ReflectUtils } from '@dooboostore/core/reflect/ReflectUtils';
import { ensureInit } from './elementDefine';
import { SwcUtils } from '../utils/Utils';

export type StyleAction = 'set' | 'update' | 'remove';

export interface StyleMetadata {
  propertyKey: string | symbol;
  selector: string;
  action: StyleAction;
}

export const STYLE_METADATA_KEY = Symbol('simple-web-component:style');

function createStyleDecorator(action: StyleAction) {
  return (selector: string): MethodDecorator => {
    return (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
      const constructor = target.constructor;
      let metaList = ReflectUtils.getOwnMetadata(STYLE_METADATA_KEY, constructor) as Map<string | symbol, StyleMetadata>;
      if (!metaList) {
        metaList = new Map<string | symbol, StyleMetadata>();
        ReflectUtils.defineMetadata(STYLE_METADATA_KEY, metaList, constructor);
      }
      metaList.set(propertyKey, { propertyKey, selector, action });

      const original = descriptor.value;
      descriptor.value = async function (...args: any[]) {
        ensureInit(this);
        const res = await original.apply(this, args);
        if (res !== undefined) {
          const hostSet = SwcUtils.getHostSet(this as any);
          let targetEl: HTMLElement | null = null;
          if (selector === ':host' || !selector) targetEl = this as any;
          else if (selector === ':parentHost') targetEl = hostSet.$parentHost;
          else if (selector === ':appHost') targetEl = hostSet.$appHost;
          else targetEl = (this.shadowRoot || (this as any)).querySelector(selector);

          if (targetEl) {
            if (action === 'set') {
              targetEl.style.cssText = '';
              if (typeof res === 'object' && res !== null) {
                Object.assign(targetEl.style, res);
              } else if (typeof res === 'string') {
                targetEl.style.cssText = res;
              }
            } else if (action === 'update') {
              if (typeof res === 'object' && res !== null) {
                Object.assign(targetEl.style, res);
              }
            } else if (action === 'remove') {
              const props = Array.isArray(res) ? res : [res];
              props.forEach(p => targetEl!.style.removeProperty(String(p)));
            }
          }
        }
        return res;
      };
    };
  };
}

/**
 * @setStyle decorator to surgically set styles on a target element (replaces all existing styles).
 * Usage: @setStyle('#box') getStyles() { return { color: 'red', display: 'block' }; }
 */
export const setStyle = createStyleDecorator('set');

/**
 * @updateStyle decorator to surgically update styles on a target element (merges with existing styles).
 * Usage: @updateStyle('#box') updateStyles() { return { color: 'blue' }; }
 */
export const updateStyle = createStyleDecorator('update');

/**
 * @removeStyle decorator to surgically remove styles from a target element.
 * Usage: @removeStyle('#box') clearStyles() { return ['color', 'display']; }
 */
export const removeStyle = createStyleDecorator('remove');

export const findAllStyleMetadata = (target: any): Map<string | symbol, StyleMetadata> => {
  const result = new Map<string | symbol, StyleMetadata>();
  const maps = ReflectUtils.findAllMetadata<Map<string | symbol, StyleMetadata>>(STYLE_METADATA_KEY, target);
  maps.forEach(map => {
    if (map instanceof Map) {
      map.forEach((v, k) => result.set(k, v));
    }
  });
  return result;
};
