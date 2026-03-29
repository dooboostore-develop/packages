import { ReflectUtils } from '@dooboostore/core/reflect/ReflectUtils';
import { ensureInit } from './elementDefine';
import { SwcUtils } from '../utils/Utils';

export const CLASS_LIST_METADATA_KEY = Symbol('simple-web-component:class-list');

export type ClassListAction = 'set' | 'update' | 'add' | 'remove' | 'toggle';

export interface ClassListMetadata {
  propertyKey: string | symbol;
  selector: string;
  action: ClassListAction;
}

function createClassListDecorator(action: ClassListAction) {
  return (selector: string): MethodDecorator => {
    return (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
      const constructor = target.constructor;
      let metaList = ReflectUtils.getOwnMetadata(CLASS_LIST_METADATA_KEY, constructor) as Map<string | symbol, ClassListMetadata>;
      if (!metaList) {
        metaList = new Map<string | symbol, ClassListMetadata>();
        ReflectUtils.defineMetadata(CLASS_LIST_METADATA_KEY, metaList, constructor);
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
              let classes = '';
              if (typeof res === 'object' && res !== null && !Array.isArray(res)) {
                classes = Object.entries(res)
                  .filter(([_, force]) => !!force)
                  .map(([cls]) => cls)
                  .join(' ');
              } else {
                classes = Array.isArray(res) ? res.join(' ') : String(res);
              }
              targetEl.className = classes;
            } else if (action === 'update') {
              if (typeof res === 'object' && res !== null && !Array.isArray(res)) {
                Object.entries(res).forEach(([cls, force]) => {
                  targetEl!.classList.toggle(cls, !!force);
                });
              } else if (res !== undefined && res !== null) {
                const classes = Array.isArray(res) ? res.map(String) : [String(res)];
                targetEl.classList.add(...classes);
              }
            } else if (action === 'add') {
              const classes = Array.isArray(res) ? res.map(String) : [String(res)];
              targetEl.classList.add(...classes);
            } else if (action === 'remove') {
              const classes = Array.isArray(res) ? res.map(String) : [String(res)];
              targetEl.classList.remove(...classes);
            } else if (action === 'toggle') {
              const classes = Array.isArray(res) ? res.map(String) : [String(res)];
              classes.forEach(c => targetEl!.classList.toggle(c));
            }
          }
        }
        return res;
      };
    };
  };
}

/**
 * @setClassList decorator to surgically replace all classes on a target element.
 * Returns: string | string[]
 */
export const setClassList = createClassListDecorator('set');

/**
 * @updateClassList decorator to surgically update specific classes.
 * Returns: Record<string, boolean> (toggle with force) | string | string[] (add)
 */
export const updateClassList = createClassListDecorator('update');

/**
 * @addClassList decorator to surgically add classes to a target element.
 * Returns: string | string[]
 */
export const addClassList = createClassListDecorator('add');

/**
 * @removeClassList decorator to surgically remove classes from a target element.
 * Returns: string | string[]
 */
export const removeClassList = createClassListDecorator('remove');

/**
 * @toggleClassList decorator to surgically toggle classes on a target element.
 * Returns: string | string[]
 */
export const toggleClassList = createClassListDecorator('toggle');

export const findAllClassListMetadata = (target: any): Map<string | symbol, ClassListMetadata> => {
  const result = new Map<string | symbol, ClassListMetadata>();
  const maps = ReflectUtils.findAllMetadata<Map<string | symbol, ClassListMetadata>>(CLASS_LIST_METADATA_KEY, target);
  maps.forEach(map => {
    if (map instanceof Map) {
      map.forEach((v, k) => result.set(k, v));
    }
  });
  return result;
};
