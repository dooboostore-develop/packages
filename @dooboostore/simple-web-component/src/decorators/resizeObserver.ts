import { ReflectUtils } from '@dooboostore/core';
import { SpecialSelector, SwcQueryOptions, SwcFnSelector, SwcSelector, HelperHostSet } from '../types';

// 공통 옵션 — root·delegate 없음
export interface ResizeObserverBaseOptions {
  box?: 'content-box' | 'border-box' | 'device-pixel-content-box';
  filter?: (matchedEls: HTMLElement[], meta: { currentThis: any, helper: HelperHostSet }) => boolean;
  removeObserver?: (target: Element, optionValue: ResizeObserverOptions) => void;
}

// 문자열 셀렉터 전용 — root·delegate 허용
export type ResizeObserverQueryOptions = ResizeObserverBaseOptions & SwcQueryOptions & { delegate?: boolean };
// 함수 셀렉터 전용 — root·delegate 금지
export type ResizeObserverNonQueryOptions = ResizeObserverBaseOptions;
// 내부 저장/해석용
export type ResizeObserverOptions = ResizeObserverQueryOptions;

// 셀렉터 종류에 따라 옵션 타입 분기
export type ResizeObserverOptionsOf<S extends SwcSelector> = S extends string ? ResizeObserverQueryOptions : ResizeObserverNonQueryOptions;

export interface ResizeObserverMetadata {
  propertyKey: string | symbol;
  selector: SwcSelector;
  options: ResizeObserverOptions;
}

export const RESIZE_OBSERVER_METADATA_KEY = Symbol.for('simple-web-component:resize-observer');

const applyResizeObserver = (selector: SwcSelector, options: ResizeObserverOptions, targetObj: Object, propertyKey: string | symbol): void => {
  const constructor = targetObj.constructor;
  let observers = ReflectUtils.getMetadata<ResizeObserverMetadata[]>(RESIZE_OBSERVER_METADATA_KEY, constructor);
  if (!observers) {
    observers = [];
    ReflectUtils.defineMetadata(RESIZE_OBSERVER_METADATA_KEY, observers, constructor);
  }
  observers.push({ propertyKey, selector, options });
};

const resolveResizeObserverArgs = (
  selectorOrOptions: SwcSelector | ResizeObserverOptions | undefined,
  maybeOptions: ResizeObserverOptions | undefined,
  extra: Partial<ResizeObserverOptions>
): { selector: SwcSelector; options: ResizeObserverOptions } => {
  if (typeof selectorOrOptions === 'string' || typeof selectorOrOptions === 'function') {
    return { selector: selectorOrOptions, options: { ...(maybeOptions ?? {}), ...extra } };
  }
  return { selector: '$this', options: { ...(selectorOrOptions ?? {}), ...extra } };
};

/**
 * bare(@decorator)와 factory(@decorator()/@decorator(...)) 호출을 모두 처리하는 공통 디스패처.
 * extra는 Light/Shadow/All/Delegate 변형이 강제로 덧씌우는 옵션(root, delegate 등)이다.
 */
const dispatchResizeObserver = (
  selectorOrOptionsOrTarget: SwcSelector | ResizeObserverOptions | Object | undefined,
  maybeOptionsOrPropertyKey: ResizeObserverOptions | string | symbol | undefined,
  descriptor: PropertyDescriptor | undefined,
  extra: Partial<ResizeObserverOptions>
): MethodDecorator | void => {
  if ((typeof maybeOptionsOrPropertyKey === 'string' || typeof maybeOptionsOrPropertyKey === 'symbol') && descriptor !== undefined) {
    // 옵션 없이: @decorator
    applyResizeObserver('$this', { ...extra }, selectorOrOptionsOrTarget as Object, maybeOptionsOrPropertyKey);
    return;
  }
  // 옵션과 함께: @decorator() / @decorator(selector, options) / @decorator(options)
  const { selector, options } = resolveResizeObserverArgs(
    selectorOrOptionsOrTarget as SwcSelector | ResizeObserverOptions | undefined,
    maybeOptionsOrPropertyKey as ResizeObserverOptions | undefined,
    extra
  );
  return (targetObj: Object, propertyKey: string | symbol) => {
    applyResizeObserver(selector, options, targetObj, propertyKey);
  };
};

export function resizeObserver(target: SpecialSelector, options?: ResizeObserverQueryOptions): MethodDecorator;
export function resizeObserver(selector: string, options?: ResizeObserverQueryOptions): MethodDecorator;
export function resizeObserver(selector: SwcFnSelector, options?: ResizeObserverNonQueryOptions): MethodDecorator;
export function resizeObserver(options?: ResizeObserverQueryOptions): MethodDecorator;
export function resizeObserver(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
/**
 * @resizeObserver decorator to observe element size changes.
 * 옵션 없이 `@resizeObserver` 그대로 붙여도 되고, `@resizeObserver(...)`처럼 셀렉터/옵션을 줄 수도 있다.
 */
export function resizeObserver(selectorOrOptionsOrTarget?: SwcSelector | ResizeObserverOptions | Object, maybeOptionsOrPropertyKey?: ResizeObserverOptions | string | symbol, descriptor?: PropertyDescriptor): MethodDecorator | void {
  return dispatchResizeObserver(selectorOrOptionsOrTarget, maybeOptionsOrPropertyKey, descriptor, {});
}

export function resizeObserverThis(options?: ResizeObserverQueryOptions): MethodDecorator;
export function resizeObserverThis(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function resizeObserverThis(optionsOrTarget?: ResizeObserverQueryOptions | Object, propertyKey?: string | symbol, descriptor?: PropertyDescriptor): MethodDecorator | void {
  return dispatchResizeObserver(optionsOrTarget, propertyKey, descriptor, {});
}

// ─── root별 delegate 헬퍼 (root 주입 → 문자열 셀렉터 전용) ───

export function resizeObserverDelegateLight(selector: string, options?: Omit<ResizeObserverQueryOptions, 'delegate'>): MethodDecorator;
export function resizeObserverDelegateLight(options?: Omit<ResizeObserverQueryOptions, 'delegate'>): MethodDecorator;
export function resizeObserverDelegateLight(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function resizeObserverDelegateLight(selectorOrOptionsOrTarget?: string | Omit<ResizeObserverQueryOptions, 'delegate'> | Object, maybeOptionsOrPropertyKey?: Omit<ResizeObserverQueryOptions, 'delegate'> | string | symbol, descriptor?: PropertyDescriptor): MethodDecorator | void {
  return dispatchResizeObserver(selectorOrOptionsOrTarget as any, maybeOptionsOrPropertyKey as any, descriptor, { root: 'light', delegate: true });
}

export function resizeObserverDelegateShadow(selector: string, options?: Omit<ResizeObserverQueryOptions, 'delegate'>): MethodDecorator;
export function resizeObserverDelegateShadow(options?: Omit<ResizeObserverQueryOptions, 'delegate'>): MethodDecorator;
export function resizeObserverDelegateShadow(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function resizeObserverDelegateShadow(selectorOrOptionsOrTarget?: string | Omit<ResizeObserverQueryOptions, 'delegate'> | Object, maybeOptionsOrPropertyKey?: Omit<ResizeObserverQueryOptions, 'delegate'> | string | symbol, descriptor?: PropertyDescriptor): MethodDecorator | void {
  return dispatchResizeObserver(selectorOrOptionsOrTarget as any, maybeOptionsOrPropertyKey as any, descriptor, { root: 'shadow', delegate: true });
}

export function resizeObserverDelegateAll(selector: string, options?: Omit<ResizeObserverQueryOptions, 'delegate'>): MethodDecorator;
export function resizeObserverDelegateAll(options?: Omit<ResizeObserverQueryOptions, 'delegate'>): MethodDecorator;
export function resizeObserverDelegateAll(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function resizeObserverDelegateAll(selectorOrOptionsOrTarget?: string | Omit<ResizeObserverQueryOptions, 'delegate'> | Object, maybeOptionsOrPropertyKey?: Omit<ResizeObserverQueryOptions, 'delegate'> | string | symbol, descriptor?: PropertyDescriptor): MethodDecorator | void {
  return dispatchResizeObserver(selectorOrOptionsOrTarget as any, maybeOptionsOrPropertyKey as any, descriptor, { root: 'all', delegate: true });
}

export function resizeObserverDelegate(selector: string, options?: Omit<ResizeObserverQueryOptions, 'delegate'>): MethodDecorator;
export function resizeObserverDelegate(options?: Omit<ResizeObserverQueryOptions, 'delegate'>): MethodDecorator;
export function resizeObserverDelegate(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function resizeObserverDelegate(selectorOrOptionsOrTarget?: string | Omit<ResizeObserverQueryOptions, 'delegate'> | Object, maybeOptionsOrPropertyKey?: Omit<ResizeObserverQueryOptions, 'delegate'> | string | symbol, descriptor?: PropertyDescriptor): MethodDecorator | void {
  return dispatchResizeObserver(selectorOrOptionsOrTarget as any, maybeOptionsOrPropertyKey as any, descriptor, { root: 'auto', delegate: true });
}

// ─── root별 일반 헬퍼 (delegate 없이, 셀렉터 생략 시 $this) ───

export function resizeObserverLight(selector: string, options?: ResizeObserverQueryOptions): MethodDecorator;
export function resizeObserverLight(options?: ResizeObserverQueryOptions): MethodDecorator;
export function resizeObserverLight(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function resizeObserverLight(selectorOrOptionsOrTarget?: string | ResizeObserverQueryOptions | Object, maybeOptionsOrPropertyKey?: ResizeObserverQueryOptions | string | symbol, descriptor?: PropertyDescriptor): MethodDecorator | void {
  return dispatchResizeObserver(selectorOrOptionsOrTarget as any, maybeOptionsOrPropertyKey as any, descriptor, { root: 'light' });
}

export function resizeObserverShadow(selector: string, options?: ResizeObserverQueryOptions): MethodDecorator;
export function resizeObserverShadow(options?: ResizeObserverQueryOptions): MethodDecorator;
export function resizeObserverShadow(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function resizeObserverShadow(selectorOrOptionsOrTarget?: string | ResizeObserverQueryOptions | Object, maybeOptionsOrPropertyKey?: ResizeObserverQueryOptions | string | symbol, descriptor?: PropertyDescriptor): MethodDecorator | void {
  return dispatchResizeObserver(selectorOrOptionsOrTarget as any, maybeOptionsOrPropertyKey as any, descriptor, { root: 'shadow' });
}

export function resizeObserverAll(selector: string, options?: ResizeObserverQueryOptions): MethodDecorator;
export function resizeObserverAll(options?: ResizeObserverQueryOptions): MethodDecorator;
export function resizeObserverAll(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function resizeObserverAll(selectorOrOptionsOrTarget?: string | ResizeObserverQueryOptions | Object, maybeOptionsOrPropertyKey?: ResizeObserverQueryOptions | string | symbol, descriptor?: PropertyDescriptor): MethodDecorator | void {
  return dispatchResizeObserver(selectorOrOptionsOrTarget as any, maybeOptionsOrPropertyKey as any, descriptor, { root: 'all' });
}

export function getResizeObserverMetadata(target: any): ResizeObserverMetadata[] | undefined {
  const constructor = target instanceof Function ? target : target.constructor;
  return ReflectUtils.getMetadata(RESIZE_OBSERVER_METADATA_KEY, constructor);
}

// ─────────────────────────────────────────────────────────────────────────────
// ResizeObserverLifeCycler
// observer 를 직접 생성하지 않고 OnConnectedResult 를 반환한다.
// elementDefine 이 수집된 ResizeObserverSet 으로 observer 를 생성하고,
// observe/unobserve 함수를 주입해 MutationObserver delegate 추적이 사용할 수 있게 한다.
// ─────────────────────────────────────────────────────────────────────────────
import { ElementDefineLifeCycler, OnConnectedResult, ResizeObserverSet, ResizeObserverSetEntry } from '../types';
import { SwcUtils } from '../utils/Utils';

export class ResizeObserverLifeCycler implements ElementDefineLifeCycler {
  private readonly removeObserverCallbacksMap = new WeakMap<Element, Array<{ fn: (target: Element, opts: unknown) => void; target: any; opts: unknown }>>();

  onConnected(helperHostSet: HelperHostSet): OnConnectedResult | void {
    const inst = helperHostSet.$this;
    const currentWin = helperHostSet.$w;

    const removeObserverCallbacks: Array<{ fn: (target: Element, opts: unknown) => void; target: any; opts: unknown }> = [];
    this.removeObserverCallbacksMap.set(inst, removeObserverCallbacks);

    const allMeta = getResizeObserverMetadata(inst) ?? [];
    if (allMeta.length === 0) return;

    const root: HTMLElement | ShadowRoot = inst.shadowRoot || inst;

    // removeObserver 콜백 수집
    for (const m of allMeta) {
      if (m.options.removeObserver) removeObserverCallbacks.push({ fn: m.options.removeObserver, target: root, opts: m.options });
    }

    // ── ResizeObserver 콜백 ──
    const callback: ResizeObserverSetEntry['callback'] = (entries, obs) => {
      for (const m of allMeta) {
        let matchedEls: HTMLElement[];
        if (m.options.delegate && typeof m.selector === 'string') {
          const isThis = m.selector === '$this' || m.selector === '';
          matchedEls = entries.map(e => e.target as HTMLElement).filter(el => {
            if (!el || el.nodeType !== 1) return false;
            if (isThis) return true;
            return el.matches?.(m.selector as string) || !!el.closest?.(m.selector as string);
          });
        } else {
          matchedEls = entries.map(e => e.target as HTMLElement).filter(t => t && t.nodeType === 1);
        }
        if (matchedEls.length === 0) continue;
        if (m.options.filter) {
          if (!m.options.filter(matchedEls, { currentThis: inst, helper: helperHostSet })) continue;
        }
        const hostSet = SwcUtils.getHostSet(inst);
        inst[m.propertyKey](matchedEls, entries, obs, { ...hostSet, $root: root });
      }
    };

    // ── observe 대상 목록 구성 ──
    // - non-delegate: 실제 요소를 초기 observe
    // - delegate: 동적 추적용 셀렉터 문자열로 선언 (elementDefine 의 MutationObserver 콜백이 observe/unobserve)
    // 모든 대상은 이 루트의 callback 을 공유한다.
    const resizeObserverSet: ResizeObserverSet = [];
    for (const m of allMeta) {
      if (m.options.delegate && typeof m.selector === 'string') {
        resizeObserverSet.push({ target: m.selector, delegate: true, delegateRoot: m.options.root, options: m.options.box ? { box: m.options.box } : undefined, callback });
        continue;
      }
      let targets: HTMLElement[] = [];

      if (typeof m.selector === 'function') {
        const res = (m.selector as any)(inst, helperHostSet);
        if (res instanceof currentWin.HTMLElement) targets = [res as HTMLElement];
        else if (res instanceof currentWin.NodeList) targets = Array.from(res as NodeList).filter((e: any) => e instanceof currentWin.HTMLElement) as HTMLElement[];
        else if (Array.isArray(res)) targets = res.filter((e: any) => e instanceof currentWin.HTMLElement) as HTMLElement[];
      } else if (typeof m.selector === 'string') {
        if (m.selector === '$this' || m.selector === '') {
          targets = [inst as HTMLElement];
        } else {
          const r: any = m.options.root || 'auto';
          const scopes: any[] = [];
          if (r === 'auto') scopes.push(inst.shadowRoot || inst);
          else if (r === 'light') scopes.push(inst);
          else if (r === 'shadow' && inst.shadowRoot) scopes.push(inst.shadowRoot);
          else if (r === 'all') { scopes.push(inst); if (inst.shadowRoot) scopes.push(inst.shadowRoot); }
          for (const s of scopes) {
            const found = s?.querySelectorAll?.(m.selector as string) as NodeListOf<HTMLElement> | undefined;
            if (found?.length) targets.push(...Array.from(found));
          }
        }
      }
      for (const el of targets) resizeObserverSet.push({ target: el, options: m.options.box ? { box: m.options.box } : undefined, callback });
    }

    return { resizeObserverSet };
  }

  onDisconnected(helperHostSet: HelperHostSet): void {
    const inst = helperHostSet.$this;
    for (const cb of this.removeObserverCallbacksMap.get(inst) ?? []) {
      try { cb.fn(cb.target, cb.opts); } catch (e) { console.error('[SWC] removeObserver error:', e); }
    }
    this.removeObserverCallbacksMap.delete(inst);
  }
}
