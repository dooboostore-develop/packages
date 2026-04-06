import { ReflectUtils } from '@dooboostore/core';
import { ensureInit, getElementConfig } from './elementDefine';
import { HelperHostSet, SwcRootType } from '../types';
import { SwcUtils } from "../utils/Utils";
import {ElementApply, NodeSlot} from "@dooboostore/core-web";
import {findAllStateMetadata} from "./state";
/*
<!-- beforebegin -->
<p> <-- it's me
  <!-- afterbegin -->
  foo
  <!-- beforeend -->
</p>
<!-- afterend -->
 */
export type ApplySlotPosition = 'prependHtml' | 'prependText' | 'appendHtml' | 'appendText' | 'replaceChildrenHtml' | 'replaceChildrenText' | 'clear';

export interface ApplySlotOptions {
  position?: ApplySlotPosition;
  // root?: SwcRootType;
  /**
   * Filter function to determine whether to perform DOM operation.
   * If it returns false, the operation is skipped.
   */
  // filter?: (target: HTMLElement | ShadowRoot, newValue: any, meta:{currentThis: any,helper: HelperHostSet}) => boolean;
  /**
   * Optional loading content to display while an async method is executing.
   */
  // loading?: (helper: HelperHostSet) => any;
}

export interface ApplySlotMetadata {
  propertyKey: string | symbol;
  id: string;
  type: 'method' | 'property';
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

/**
 * @applyNode decorator to surgically add/replace nodes to a target element.
 */
export function applySlot(id: string, options: ApplySlotOptions = { position: 'replaceChildrenHtml' }): MethodDecorator & PropertyDecorator {
  return (targetObj: Object, propertyKey: string | symbol, descriptor?: PropertyDescriptor) => {
    const type = descriptor === undefined ? 'property' : 'method';

    if (type === 'property') {
            Object.defineProperty(targetObj, propertyKey, {
              get(this: any) {
                const nodeSlot = new NodeSlot(this, `${this._swcId}-${id}`);
                return nodeSlot;
              },
              set(this: any, nv: any) {
                if(nv) {
                  // 있을때 아무일도안함
                } else {
                  const nodeSlot = new NodeSlot(this, `${this._swcId}-${id}`);
                  nodeSlot.clear();
                }
              },
              configurable: true,
              enumerable: true,
            })
     // return nodeSlot;
     //  return;
    }

    const constructor = targetObj.constructor;
    let metaList = ReflectUtils.getOwnMetadata(APPLY_SLOT_METADATA_KEY, constructor) as ApplySlotMetadata[];
    if (!metaList) {
      metaList = []
      ReflectUtils.defineMetadata(APPLY_SLOT_METADATA_KEY, metaList, constructor);
    }
    metaList.push({ propertyKey, id, type, options });



    if (type === 'method') {
      const original = descriptor.value;
      descriptor.value = function (...args: any[]) {
        ensureInit(this);

        const conf = getElementConfig(this);
        const currentWin = (this as any)._resolveWindow?.(conf) || ((typeof window !== 'undefined' ? window : undefined) as Window);
        const currentDoc = currentWin.document;
        const hostSet = SwcUtils.getHelperAndHostSet(currentWin, this);
        let res = original.apply(this, args);
        if (res) {
          // res = SwcUtils.projectProcessHtml(this, res)
          const nodeSlot = new NodeSlot(this, this._swcId);
          const pos = options.position || 'replaceChildrenHtml';
          const doc = currentWin.document;
          if (pos === 'replaceChildrenHtml') {
            nodeSlot.replaceChildrenHtml(id, res);
          } else if (pos === 'replaceChildrenText') {
            nodeSlot.replaceChildrenText(id, res);
          } else if (pos === 'appendHtml') {
            nodeSlot.appendHtml(id, res);
          } else if (pos === 'appendText') {
            nodeSlot.appendText(id, res);
          } else if (pos === 'prependHtml') {
            nodeSlot.prependHtml(id, res);
          } else if (pos === 'prependText') {
            nodeSlot.prependText(id, res);
          } else if (pos === 'clear') {
            nodeSlot.clear(id);
          }

          // const stateContext: any = {...hostSet};
          // getStateMetadata(this).forEach(it => {
          //   stateContext[it.name] = this[it.propertyKey]
          // })
          // new ElementApply(this, {id: this._swcId}).apply({target:'noInitialized', context: stateContext, bind: this});
        }
        return res;
      };
    }
  };
}

// export const findAllApplySlotMetadata = (target: any): Map<string | symbol, ApplySlotMetadata> => {
export const findAllApplySlotMetadata = (target: any): ApplySlotMetadata[] => {
  const constructor = target instanceof Function ? target : target.constructor;
  return ReflectUtils.getMetadata(APPLY_SLOT_METADATA_KEY, constructor);
};

export function applySlotClear(id: string): MethodDecorator {
  return applySlot(id, { position: 'clear' });
}
export function applySlotPrependHtml(id: string): MethodDecorator {
  return applySlot(id, { position: 'prependHtml' });
}
export const applySlotPrepend = applySlotPrependHtml;
export function applySlotPrependText(id: string): MethodDecorator {
  return applySlot(id, { position: 'prependText' });
}
export function applySlotAppendHtml(id: string): MethodDecorator {
  return applySlot(id, { position: 'appendHtml' });
}
export function applySlotAppendText(id: string): MethodDecorator {
  return applySlot(id, { position: 'appendText' });
}
export const applySlotAppend = applySlotAppendHtml;
export function applySlotReplaceChildrenHtml(id: string): MethodDecorator {
  return applySlot(id, { position: 'replaceChildrenHtml' });
}
export const applySlotReplaceChildren = applySlotReplaceChildrenHtml;
export function applySlotReplaceChildrenText(id: string): MethodDecorator {
  return applySlot(id, { position: 'replaceChildrenText' });
}
