import { ReflectUtils } from '@dooboostore/core';
import { ensureInit, getElementConfig } from './elementDefine';
import { HelperHostSet, SwcRootType } from '../types';
import { SwcUtils} from "../utils/Utils";
import {findAllStateMetadata} from "./state";
import {ElementApply} from "@dooboostore/core-web";
/*
<!-- beforebegin -->
<p> <-- it's me
  <!-- afterbegin -->
  foo
  <!-- beforeend -->
</p>
<!-- afterend -->
 */
export type ApplyNodePosition = 'beforeBegin' | 'afterBegin' | 'beforeEnd' | 'afterEnd' | 'replace' | 'replaceChildren' | 'innerHtml' | 'innerText' | 'remove';

export interface ApplyNodeOptions {
  position?: ApplyNodePosition;
  root?: SwcRootType;
  /**
   * Filter function to determine whether to perform DOM operation.
   * If it returns false, the operation is skipped.
   */
  filter?: (target: HTMLElement | ShadowRoot, newValue: any, meta: { currentThis: any, helper: HelperHostSet }) => boolean;
  /**
   * Optional loading content to display while an async method is executing.
   */
  loading?: (helper: HelperHostSet) => any;
}

export interface ApplyNodeMetadata {
  propertyKey: string | symbol;
  selector: string;
  options: ApplyNodeOptions;
}

export const APPLY_NODE_METADATA_KEY = Symbol.for('simple-web-component:apply-node');

const normalizeNodes = (res: any, doc: Document): Node[] => {
  const items = Array.isArray(res) ? res : [res];
  return items.map(it => {
    if (it instanceof Node) return it;
    return doc.createTextNode(it !== undefined && it !== null ? String(it) : '');
  });
};

const applyToDom = (currentThis: any, targetEl: HTMLElement, res: any, pos: ApplyNodePosition, win: Window, host?: any) => {
  if (!targetEl) return;

  // console.log('------------',currentThis.tagName, res)
  const doc = win.document;
  const hostSet = SwcUtils.getHelperAndHostSet(win, currentThis);
  const id = currentThis._swcId;
  // Allow processHtml to run here so all DOM insertions go through a single
  // processing point. processHtml may mutate Node[] in-place or return a
  // transformed string result for text processing.
  try {
    if (typeof res === 'string') {
      const processed = SwcUtils.projectProcessHtml(id, res as string, doc);
      if (processed !== undefined) res = processed;
    } else if (Array.isArray(res)) {
      SwcUtils.projectProcessHtml(id, res as Node[], doc);
    }
  } catch (e) {
    // swallow and proceed with original res
  }

  if (pos === 'innerHtml') {
    targetEl.innerHTML = res !== undefined && res !== null ? String(res) : '';
    return;
  }

  if (pos === 'innerText') {
    if (targetEl.innerText !== undefined) {
      targetEl.innerText = res !== undefined && res !== null ? String(res) : '';
    }
    return;
  }

  const stateContext: any = {...hostSet};
  findAllStateMetadata(currentThis).forEach(it => {
    stateContext[it.name] = currentThis[it.propertyKey]
  })
  new ElementApply(currentThis, {id: currentThis._swcId}).apply({target: 'noInitialized', context: stateContext, bind: currentThis});

  const isShadowRoot = targetEl instanceof win.ShadowRoot;
  const nodes = normalizeNodes(res, doc);
  if (pos === 'replace') {
    if (!isShadowRoot) targetEl.replaceWith(...nodes);
  } else if (pos === 'replaceChildren') {
    targetEl.replaceChildren(...nodes);
  } else {
    if (pos === 'beforeEnd') targetEl.append(...nodes);
    else if (pos === 'afterBegin') targetEl.prepend(...nodes);
    else if (pos === 'beforeBegin' && !isShadowRoot) targetEl.before(...nodes);
    else if (pos === 'afterEnd' && !isShadowRoot) targetEl.after(...nodes);
  }
};

/**
 * @applyNode decorator to surgically add/replace nodes to a target element.
 */
export function applyNode(selector: string, options: ApplyNodeOptions = {position: 'replaceChildren'}): MethodDecorator {
  return (targetObj: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const constructor = targetObj.constructor;
    let metaList = ReflectUtils.getOwnMetadata(APPLY_NODE_METADATA_KEY, constructor) as Map<string | symbol, ApplyNodeMetadata>;
    if (!metaList) {
      metaList = new Map<string | symbol, ApplyNodeMetadata>();
      ReflectUtils.defineMetadata(APPLY_NODE_METADATA_KEY, metaList, constructor);
    }
    metaList.set(propertyKey, {propertyKey, selector, options});

    const original = descriptor.value;
    descriptor.value = function (...args: any[]) {
      ensureInit(this);

      const conf = getElementConfig(this);
      const currentWin = (this as any)._resolveWindow?.(conf) || ((typeof window !== 'undefined' ? window : undefined) as Window);
      const currentDoc = currentWin.document;
      const hostSet = SwcUtils.getHelperAndHostSet(currentWin, this);

      const getTarget = () => {
        const r = options.root || 'auto';
        const applyRoot = (t: any) => {
          if (!t) return t;
          if (r === 'auto') return t.shadowRoot || t;
          if (r === 'shadow') return t.shadowRoot;
          if (r === 'light') return t;
          if (r === 'all') return t.shadowRoot || t;
          return t;
        };

        if (selector === '$this') return applyRoot(this);
        if (selector === '$host') return applyRoot(hostSet.$host);
        if (selector === '$parentHost') return applyRoot(hostSet.$parentHost);
        if (selector === '$appHost') return applyRoot(hostSet.$appHost);
        if (selector === '$firstHost') return applyRoot(hostSet.$firstHost);
        if (selector === '$lastHost') return applyRoot(hostSet.$lastHost);

        const targetRoot = applyRoot(this);
        return targetRoot ? targetRoot.querySelector(selector) : null;
      };

      const targetEl = getTarget();
      const res = original.apply(this, args);

      const runApply = (target: any, val: any) => {
        const pos = options.position || 'beforeEnd';
        // Delegate HTML/node processing to applyToDom which centralizes
        // processing. runApply should not call processHtml itself to avoid
        // duplicate processing.
        const processedVal = val;

        // 사용자가 filter를 명시하면 그 조건으로, 아니면 항상 적용
        if (!options.filter || options.filter(target, processedVal, {currentThis: this, helper: hostSet})) {
          applyToDom(this, target, processedVal, pos, currentWin);
        }
      };

      if (res instanceof Promise) {
        // 비동기일 때만 로딩 표시
        if (targetEl && options.loading) {
          const loadingRes = options.loading.call(this, hostSet);
          // applyToDom expects a Window as the 4th argument
          applyToDom(this, targetEl, loadingRes, options.position || 'beforeEnd', currentWin);
        }

        return res.then(finalRes => {
          if (finalRes !== undefined && targetEl) runApply(targetEl, finalRes);
          return finalRes;
        });
      } else {
        if (res !== undefined && targetEl) runApply(targetEl, res);
        return res;
      }
    };
  };
}

export const findAllApplyNodeMetadata = (target: any): Map<string | symbol, ApplyNodeMetadata> => {
  const result = new Map<string | symbol, ApplyNodeMetadata>();
  const maps = ReflectUtils.findAllMetadata<Map<string | symbol, ApplyNodeMetadata>>(APPLY_NODE_METADATA_KEY, target);
  maps.forEach(map => {
    if (map instanceof Map) {
      map.forEach((v, k) => result.set(k, v));
    }
  });
  return result;
};

export function applyNodeThis(options: ApplyNodeOptions): MethodDecorator;
export function applyNodeThis(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function applyNodeThis(targetOrOptions?: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor): any {
  const option: ApplyNodeOptions = {position: 'replaceChildren'};
  if (propertyKey !== undefined) return applyNode('$this', option)(targetOrOptions, propertyKey, descriptor);
  const opt = targetOrOptions || {};
  return applyNode('$this', {...option, ...opt});
}

export function applyNodeThisReplaceChildren(options: Omit<ApplyNodeOptions, 'position'>): MethodDecorator;
export function applyNodeThisReplaceChildren(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function applyNodeThisReplaceChildren(targetOrOptions?: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor): any {
  const option: ApplyNodeOptions = {position: 'replaceChildren'};
  if (propertyKey !== undefined) return applyNode('$this', option)(targetOrOptions, propertyKey, descriptor);
  const opt = targetOrOptions || {};
  return applyNode('$this', {...opt, ...option});
}

export function applyNodeThisReplaceChildrenLightDom(options: Omit<ApplyNodeOptions, 'position' | 'root'>): MethodDecorator;
export function applyNodeThisReplaceChildrenLightDom(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function applyNodeThisReplaceChildrenLightDom(targetOrOptions?: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor): any {
  const options: ApplyNodeOptions = {position: 'replaceChildren', root: 'light'};
  if (propertyKey !== undefined) return applyNode('$this', options)(targetOrOptions, propertyKey, descriptor);
  const opt = targetOrOptions || {};
  return applyNode('$this', {...opt, ...options});
}

export function applyNodeThisBeforeEnd(options: Omit<ApplyNodeOptions, 'position'>): MethodDecorator;
export function applyNodeThisBeforeEnd(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function applyNodeThisBeforeEnd(targetOrOptions?: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor): any {
  const options: ApplyNodeOptions = {position: 'beforeEnd'};
  if (propertyKey !== undefined) return applyNode('$this', options)(targetOrOptions, propertyKey, descriptor);
  const opt = targetOrOptions || {};
  return applyNode('$this', {...opt, ...options});
}

export function applyNodeThisBeforeEndLightDom(options: Omit<ApplyNodeOptions, 'position' | 'root'>): MethodDecorator;
export function applyNodeThisBeforeEndLightDom(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function applyNodeThisBeforeEndLightDom(targetOrOptions?: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor): any {
  const option: ApplyNodeOptions = {position: 'beforeEnd', root: 'light'}
  if (propertyKey !== undefined) return applyNode('$this', option)(targetOrOptions, propertyKey, descriptor);
  const opt = targetOrOptions || {};
  return applyNode('$this', {...opt, ...option});
}

export function applyNodeThisAfterBegin(options: Omit<ApplyNodeOptions, 'position'>): MethodDecorator;
export function applyNodeThisAfterBegin(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function applyNodeThisAfterBegin(targetOrOptions?: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor): any {
  const option: ApplyNodeOptions = {position: 'afterBegin'};
  if (propertyKey !== undefined) return applyNode('$this', option)(targetOrOptions, propertyKey, descriptor);
  const opt = targetOrOptions || {};
  return applyNode('$this', {...opt, ...option});
}

export function applyNodeThisAfterBeginLightDom(options: Omit<ApplyNodeOptions, 'position' | 'root'>): MethodDecorator;
export function applyNodeThisAfterBeginLightDom(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function applyNodeThisAfterBeginLightDom(targetOrOptions?: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor): any {
  const option: ApplyNodeOptions = {position: 'afterBegin', root: 'light'}
  if (propertyKey !== undefined) return applyNode('$this', option)(targetOrOptions, propertyKey, descriptor);
  const opt = targetOrOptions || {};
  return applyNode('$this', {...opt, ...option});
}

export function applyThisInnerHtmlNode(options: Omit<ApplyNodeOptions, 'position'>): MethodDecorator;
export function applyThisInnerHtmlNode(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function applyThisInnerHtmlNode(targetOrOptions?: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor): any {
  const option: ApplyNodeOptions = {position: 'innerHtml'}
  if (propertyKey !== undefined) return applyNode('$this', option)(targetOrOptions, propertyKey, descriptor);
  const opt = targetOrOptions || {};
  return applyNode('$this', {...opt, ...option});
}

export function applyThisInnerHtmlNodeLightDom(options: Omit<ApplyNodeOptions, 'position' | 'root'>): MethodDecorator;
export function applyThisInnerHtmlNodeLightDom(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function applyThisInnerHtmlNodeLightDom(targetOrOptions?: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor): any {
  const option: ApplyNodeOptions = {position: 'innerHtml', root: 'light'};
  if (propertyKey !== undefined) return applyNode('$this', option)(targetOrOptions, propertyKey, descriptor);
  const opt = targetOrOptions || {};
  return applyNode('$this', {...opt, ...option});
}

export function applyNodeReplaceChildren(selector: string, options: Omit<ApplyNodeOptions, 'position'> = {}): MethodDecorator {
  return applyNode(selector, {...options, position: 'replaceChildren'});
}

export function applyNodeInnerHtml(selector: string, options: Omit<ApplyNodeOptions, 'position'> = {}): MethodDecorator {
  return applyNode(selector, {...options, position: 'innerHtml'});
}

export function applyNodeInnerText(selector: string, options: Omit<ApplyNodeOptions, 'position'> = {}): MethodDecorator {
  return applyNode(selector, {...options, position: 'innerText'});
}
