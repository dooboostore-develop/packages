import { ReflectUtils } from '@dooboostore/core';
import { ensureInit, getElementConfig } from './elementDefine';

export type AppendChildPosition = 'beforeBegin' | 'afterBegin' | 'beforeEnd' | 'afterEnd';

export interface AppendChildOptions {
  position?: AppendChildPosition;
}

export interface AppendChildMetadata {
  propertyKey: string | symbol;
  selector: string;
  options: AppendChildOptions;
}

export const APPEND_CHILD_METADATA_KEY = Symbol('simple-web-component:append-child');

const normalizeNodes = (res: any, doc: Document): Node[] => {
  const items = Array.isArray(res) ? res : [res];
  return items.map(it => {
    if (it instanceof Node) return it;
    return doc.createTextNode(it !== undefined && it !== null ? String(it) : '');
  });
};

/**
 * @appendChild decorator to surgically add nodes to a target element.
 * Usage: @appendChild('#list') addItem() { return '<li>New Item</li>'; }
 */
export function appendChild(selector: string, options: AppendChildOptions = { position: 'beforeEnd' }): MethodDecorator {
  return (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const constructor = target.constructor;
    let metaList = ReflectUtils.getOwnMetadata(APPEND_CHILD_METADATA_KEY, constructor) as Map<string | symbol, AppendChildMetadata>;
    if (!metaList) {
      metaList = new Map<string | symbol, AppendChildMetadata>();
      ReflectUtils.defineMetadata(APPEND_CHILD_METADATA_KEY, metaList, constructor);
    }
    metaList.set(propertyKey, { propertyKey, selector, options });

    const original = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      ensureInit(this);
      const res = await original.apply(this, args);
      if (res !== undefined) {
        const conf = getElementConfig(this);
        const currentWin = (this as any)._resolveWindow?.(conf) || ((typeof window !== 'undefined' ? window : undefined) as Window);
        const currentDoc = currentWin.document;

        let targetEl: HTMLElement | null = null;
        if (selector === ':host' || !selector) {
          targetEl = this as any;
        } else {
          targetEl = (this.shadowRoot || (this as any)).querySelector(selector);
        }

        if (targetEl) {
          const nodes = normalizeNodes(res, currentDoc);
          const pos = options.position || 'beforeEnd';

          if (typeof res === 'string') {
            targetEl.insertAdjacentText(pos as InsertPosition, res);
          } else if (Array.isArray(res) && res.every(n => typeof n === 'string')) {
            targetEl.insertAdjacentText(pos as InsertPosition, res.join(''));
          } else {
            if (pos === 'beforeEnd') targetEl.append(...nodes);
            else if (pos === 'afterBegin') targetEl.prepend(...nodes);
            else if (pos === 'beforeBegin') targetEl.before(...nodes);
            else if (pos === 'afterEnd') targetEl.after(...nodes);
          }
        }
      }
      return res;
    };
  };
}

export const findAllAppendChildMetadata = (target: any): Map<string | symbol, AppendChildMetadata> => {
  const result = new Map<string | symbol, AppendChildMetadata>();
  const maps = ReflectUtils.findAllMetadata<Map<string | symbol, AppendChildMetadata>>(APPEND_CHILD_METADATA_KEY, target);
  maps.forEach(map => {
    if (map instanceof Map) {
      map.forEach((v, k) => result.set(k, v));
    }
  });
  return result;
};
