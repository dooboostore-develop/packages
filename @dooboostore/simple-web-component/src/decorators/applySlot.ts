import {OptionalType, ReflectUtils} from '@dooboostore/core';
import {ensureInit, getElementConfig} from './elementDefine';
import {SwcUtils} from "../utils/Utils";
import {NodeSlot} from "@dooboostore/core-web";
import {HelperHostSet} from "../types";
/*
<!-- beforebegin -->
<p> <-- it's me
  <!-- afterbegin -->
  foo
  <!-- beforeend -->
</p>
<!-- afterend -->
 */
export type ApplySlotPosition = 'prepend' | 'prependHtml' | 'prependText' | 'append' | 'appendHtml' | 'appendText' | 'replaceChildren' | 'replaceChildrenHtml' | 'replaceChildrenText' | 'clear';

export interface ApplySlotOptions {
  position: ApplySlotPosition;
  fallback?: (helper: HelperHostSet) => string | Node;
  /**
   * Custom key to extract value from return object.
   * If not provided, uses APPLY_SLOT_METADATA_KEY by default.
   * Useful when multiple @applySlot decorators are on the same method.
   */
  valueKey?: symbol | string;
}

export interface ApplySlotMetadata {
  propertyKey: string | symbol;
  targetId: string;
  // type: 'method' | 'property';
  options: ApplySlotOptions;
}

export const APPLY_SLOT_METADATA_KEY = Symbol.for('simple-web-component:apply-slot');

// const normalizeNodes = (res: any, doc: Document): Node[] => {
//   const items = Array.isArray(res) ? res : [res];
//   return items.map(it => {
//     if (it instanceof Node) return it;
//     return doc.createTextNode(it !== undefined && it !== null ? String(it) : '');
//   });
// };

// const applyToDom = (targetEl: any, res: any, pos: ApplyNodePosition, win: Window) => {
//     if (!targetEl) return;
//
//     const doc = win.document;
//
//     if (pos === 'innerHtml') {
//         targetEl.innerHTML = res !== undefined && res !== null ? String(res) : '';
//         return;
//     }
//
//     if (pos === 'innerText') {
//         if (targetEl.innerText !== undefined) {
//             targetEl.innerText = res !== undefined && res !== null ? String(res) : '';
//         }
//         return;
//     }
//
//     const isShadowRoot = targetEl instanceof win.ShadowRoot;
//     const nodes = normalizeNodes(res, doc);
//     if (pos === 'replace') {
//       if (!isShadowRoot) targetEl.replaceWith(...nodes);
//     } else if (pos === 'replaceChildren') {
//       targetEl.replaceChildren(...nodes);
//     } else {
//       if (pos === 'beforeEnd') targetEl.append(...nodes);
//       else if (pos === 'afterBegin') targetEl.prepend(...nodes);
//       else if (pos === 'beforeBegin' && !isShadowRoot) targetEl.before(...nodes);
//       else if (pos === 'afterEnd' && !isShadowRoot) targetEl.after(...nodes);
//     }
// };

const applyToDom = (swcId: string, id: string, pos: ApplySlotPosition, nodes: Node[]) => {
  const nodeSlot = new NodeSlot(this, swcId);
  if (pos === 'replaceChildrenText' || pos === 'replaceChildren' || pos === 'replaceChildrenHtml') {
    nodeSlot.replaceChildren(id, ...nodes);
  } else if (pos === 'appendHtml' || pos === 'append' || pos === 'appendText') {
    nodeSlot.append(id, ...nodes);
  } else if (pos === 'prependHtml' || pos === 'prepend' || pos === 'prependText') {
    nodeSlot.prepend(id, ...nodes);
  } else if (pos === 'clear') {
    nodeSlot.clear(id);
  }
}

/**
 * @applyNode decorator to surgically add/replace nodes to a target element.
 */
export function applySlot(targetId: string, opt: OptionalType<ApplySlotOptions, 'position'>): MethodDecorator {
  return (targetObj: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {


    const options: ApplySlotOptions = {position: 'replaceChildren', ...opt};


    const constructor = targetObj.constructor;
    let metaList = ReflectUtils.getOwnMetadata(APPLY_SLOT_METADATA_KEY, constructor) as ApplySlotMetadata[];
    if (!metaList) {
      metaList = []
      ReflectUtils.defineMetadata(APPLY_SLOT_METADATA_KEY, metaList, constructor);
    }
    metaList.push({propertyKey, targetId, options});


    const original = descriptor.value;
    descriptor.value = function (...args: any[]) {
      ensureInit(this);

      const conf = getElementConfig(this);
      const currentWin = conf.window;
      const swcId = this._swcId;
      const currentDoc = currentWin.document;
      const hostSet = SwcUtils.getHelperAndHostSet(currentWin, this);
      const pos = options.position;

      const resToNodes = (res: string | Node) => {
        const nodes: Node[] = [];

        if (typeof res === 'string' && (pos === 'replaceChildrenHtml' || pos === 'appendHtml' || pos === 'prependHtml')) {
          const t = currentWin.document.createElement('template');
          t.innerHTML = res;
          nodes.push(...Array.from(t.content.childNodes));
        } else if (typeof res === 'string' && (pos === 'replaceChildrenText' || pos === 'prependText' || pos === 'appendText')) {
          nodes.push(currentWin.document.createTextNode(res));
        } else if (typeof res === 'object') {
          nodes.push(res);
        }
        SwcUtils.projectProcessHtml(swcId, nodes, currentDoc);
        return nodes;
      }

      const fallbackNodes: Node[] = [];
      if (options.fallback) {
        const res: string | Node = options.fallback.call(this, hostSet);
        const nodes: Node[] = resToNodes(res);
        fallbackNodes.push(...nodes);
        applyToDom(swcId, targetId, options.position, nodes);
      }

      /**
       * Extract value for this decorator from method return value
       * 
       * If return value is an object with this decorator's key,
       * use that value. Otherwise use the entire return value.
       * 
       * Uses valueKey from options if provided, otherwise uses APPLY_SLOT_METADATA_KEY.
       */
      const extractValue = (v: any) => {
        const keyToUse = options.valueKey ?? APPLY_SLOT_METADATA_KEY;
        if (v && typeof v === 'object' && keyToUse in v) {
          return v[keyToUse];
        }
        return v;
      };

      let res = original.apply(this, args);
      if (res instanceof Promise) {
        return res.then(asyncRes => {
          const extracted = extractValue(asyncRes);
          const nodes = resToNodes(extracted)
          fallbackNodes.forEach((it: any) => it.remove());
          applyToDom(swcId, targetId, options.position, nodes);
        })
      } else {
        const extracted = extractValue(res);
        const nodes: Node[] = resToNodes(extracted);
        applyToDom(swcId, targetId, options.position, nodes);
      }
    };
  };
}

export function clearSlot(targetId: string): MethodDecorator {
  return applySlot(targetId, {position: 'clear'});
}

export function prependHtmlSlot(targetId: string): MethodDecorator {
  return applySlot(targetId, {position: 'prependHtml'});
}

export function prependSlot(targetId: string): MethodDecorator {
  return applySlot(targetId, {position: 'prepend'});
}

export function prependTextSlot(targetId: string): MethodDecorator {
  return applySlot(targetId, {position: 'prependText'});
}

export function appendHtmlSlot(targetId: string): MethodDecorator {
  return applySlot(targetId, {position: 'appendHtml'});
}

export function appendTextSlot(targetId: string): MethodDecorator {
  return applySlot(targetId, {position: 'appendText'});
}

export function appendSlot(targetId: string): MethodDecorator {
  return applySlot(targetId, {position: 'append'});
}

export function replaceChildrenHtmlSlot(targetId: string): MethodDecorator {
  return applySlot(targetId, {position: 'replaceChildrenHtml'});
}

export function replaceChildrenSlot(targetId: string): MethodDecorator {
  return applySlot(targetId, {position: 'replaceChildren'});
}

export function replaceChildrenTextSlot(targetId: string): MethodDecorator {
  return applySlot(targetId, {position: 'replaceChildrenText'});
}

// export const findAllApplySlotMetadata = (target: any): Map<string | symbol, ApplySlotMetadata> => {
export const findAllApplySlotMetadata = (target: any): ApplySlotMetadata[] => {
  const constructor = target instanceof Function ? target : target.constructor;
  return ReflectUtils.getMetadata(APPLY_SLOT_METADATA_KEY, constructor);
};