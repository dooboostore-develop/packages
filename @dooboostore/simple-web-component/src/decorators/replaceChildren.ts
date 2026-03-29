import { ReflectUtils } from '@dooboostore/core/reflect/ReflectUtils';
import { ensureInit, getElementConfig } from './elementDefine';

export const REPLACE_CHILDREN_METADATA_KEY = Symbol('simple-web-component:replace-children');

/**
 * @replaceChildren decorator to surgically replace children of a target element.
 * Usage: @replaceChildren('#container') renderPart() { return '<div>New Content</div>'; }
 */
export function replaceChildren(selector: string): MethodDecorator {
  return (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const constructor = target.constructor;
    let meta = ReflectUtils.getOwnMetadata(REPLACE_CHILDREN_METADATA_KEY, constructor) as Map<string | symbol, string>;
    if (!meta) {
      meta = new Map<string | symbol, string>();
      ReflectUtils.defineMetadata(REPLACE_CHILDREN_METADATA_KEY, meta, constructor);
    }
    meta.set(propertyKey, selector);

    const original = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      ensureInit(this);
      const res = await original.apply(this, args);
      if (res !== undefined) {
        const conf = getElementConfig(this);
        const currentWin = (this as any)._resolveWindow?.(conf) || ((typeof window !== 'undefined' ? window : undefined) as Window);
        const currentDoc = currentWin.document;

        let targetEl: Element | null = null;
        if (selector === ':host' || !selector) {
          targetEl = this as any;
        } else {
          targetEl = (this.shadowRoot || (this as any)).querySelector(selector);
        }

        if (targetEl) {
          if (typeof res === 'string') {
            targetEl.textContent = res;
          } else {
            const nodes: Node[] = Array.isArray(res) ? res.map(n => (typeof n === 'string' ? currentDoc.createTextNode(n) : n)) : [res as Node];
            (targetEl as any).replaceChildren(...nodes);
          }
        }
      }
      return res;
    };
  };
}

export const getReplaceChildrenMetadata = (target: any): Map<string | symbol, string> | undefined => {
  const constructor = target instanceof Function ? target : target.constructor;
  return ReflectUtils.getMetadata(REPLACE_CHILDREN_METADATA_KEY, constructor);
};

export const findAllReplaceChildrenMetadata = (target: any): Map<string | symbol, string> => {
  const result = new Map<string | symbol, string>();
  const maps = ReflectUtils.findAllMetadata<Map<string | symbol, string>>(REPLACE_CHILDREN_METADATA_KEY, target);
  maps.forEach(map => {
    if (map instanceof Map) {
      map.forEach((v, k) => result.set(k, v));
    }
  });
  return result;
};
