import { ReflectUtils } from '@dooboostore/core';
import { SpecialSelector, SwcQueryOptions, SwcFnSelector, SwcSelector, HelperHostSet } from '../types';

// 공통 옵션 — IntersectionObserverInit + filter/removeObserver. root·delegate 제외.
// 주의: 데코레이터의 root(light/shadow/all/auto) 는 셀렉터 스코프 선택용이다.
// IntersectionObserver 의 스크롤 컨테이너 root 는 intersectionRoot 로 지정한다.
export interface IntersectionObserverBaseOptions extends Omit<IntersectionObserverInit, 'root'> {
  /** IntersectionObserver 의 스크롤 컨테이너 (viewport 대신). 데코레이터 root 와 혼동 주의. */
  intersectionRoot?: Element | Document;
  filter?: (matchedEls: HTMLElement[], meta: { currentThis: any, helper: HelperHostSet }) => boolean;
  removeObserver?: (target: Element, optionValue: IntersectionObserverQueryOptions) => void;
}

// 문자열 셀렉터 전용 — root·delegate 허용
export type IntersectionObserverQueryOptions = IntersectionObserverBaseOptions & SwcQueryOptions & { delegate?: boolean };
// 함수 셀렉터 전용 — root·delegate 금지
export type IntersectionObserverNonQueryOptions = IntersectionObserverBaseOptions;
// 내부 저장/해석용
export type IntersectionObserverOptions = IntersectionObserverQueryOptions;

// 셀렉터 종류에 따라 옵션 타입 분기
export type IntersectionObserverOptionsOf<S extends SwcSelector> = S extends string ? IntersectionObserverQueryOptions : IntersectionObserverNonQueryOptions;

export interface IntersectionObserverMetadata {
  propertyKey: string | symbol;
  selector: SwcSelector;
  options: IntersectionObserverOptions;
}

export const INTERSECTION_OBSERVER_METADATA_KEY = Symbol.for('simple-web-component:intersection-observer');

const applyIntersectionObserver = (selector: SwcSelector, options: IntersectionObserverOptions, targetObj: Object, propertyKey: string | symbol): void => {
  const constructor = targetObj.constructor;
  let observers = ReflectUtils.getMetadata<IntersectionObserverMetadata[]>(INTERSECTION_OBSERVER_METADATA_KEY, constructor);
  if (!observers) {
    observers = [];
    ReflectUtils.defineMetadata(INTERSECTION_OBSERVER_METADATA_KEY, observers, constructor);
  }
  observers.push({ propertyKey, selector, options });
};

const resolveIntersectionObserverArgs = (
  selectorOrOptions: SwcSelector | IntersectionObserverOptions | undefined,
  maybeOptions: IntersectionObserverOptions | undefined,
  extra: Partial<IntersectionObserverOptions>
): { selector: SwcSelector; options: IntersectionObserverOptions } => {
  if (typeof selectorOrOptions === 'string' || typeof selectorOrOptions === 'function') {
    return { selector: selectorOrOptions, options: { ...(maybeOptions ?? {}), ...extra } };
  }
  return { selector: '$this', options: { ...(selectorOrOptions ?? {}), ...extra } };
};

/**
 * bare(@decorator)와 factory(@decorator()/@decorator(...)) 호출을 모두 처리하는 공통 디스패처.
 * extra는 Light/Shadow/All/Delegate 변형이 강제로 덧씌우는 옵션(root, delegate 등)이다.
 */
const dispatchIntersectionObserver = (
  selectorOrOptionsOrTarget: SwcSelector | IntersectionObserverOptions | Object | undefined,
  maybeOptionsOrPropertyKey: IntersectionObserverOptions | string | symbol | undefined,
  descriptor: PropertyDescriptor | undefined,
  extra: Partial<IntersectionObserverOptions>
): MethodDecorator | void => {
  if ((typeof maybeOptionsOrPropertyKey === 'string' || typeof maybeOptionsOrPropertyKey === 'symbol') && descriptor !== undefined) {
    // 옵션 없이: @decorator
    applyIntersectionObserver('$this', { ...extra }, selectorOrOptionsOrTarget as Object, maybeOptionsOrPropertyKey);
    return;
  }
  // 옵션과 함께: @decorator() / @decorator(selector, options) / @decorator(options)
  const { selector, options } = resolveIntersectionObserverArgs(
    selectorOrOptionsOrTarget as SwcSelector | IntersectionObserverOptions | undefined,
    maybeOptionsOrPropertyKey as IntersectionObserverOptions | undefined,
    extra
  );
  return (targetObj: Object, propertyKey: string | symbol) => {
    applyIntersectionObserver(selector, options, targetObj, propertyKey);
  };
};

export function intersectionObserver(target: SpecialSelector, options?: IntersectionObserverQueryOptions): MethodDecorator;
export function intersectionObserver(selector: string, options?: IntersectionObserverQueryOptions): MethodDecorator;
export function intersectionObserver(selector: SwcFnSelector, options?: IntersectionObserverNonQueryOptions): MethodDecorator;
export function intersectionObserver(options?: IntersectionObserverQueryOptions): MethodDecorator;
export function intersectionObserver(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
/**
 * @intersectionObserver decorator to observe element intersection changes.
 *
 * IntersectionObserver 는 생성 시점에 옵션(threshold/rootMargin/root)이 고정되므로,
 * 옵션별로 그룹을 만들어 observer 를 생성한다. 같은 옵션 그룹 안에서 delegate 동적 추적이 가능하다.
 * 옵션 없이 `@intersectionObserver` 그대로 붙여도 되고, `@intersectionObserver(...)`처럼 셀렉터/옵션을 줄 수도 있다.
 */
export function intersectionObserver(selectorOrOptionsOrTarget?: SwcSelector | IntersectionObserverOptions | Object, maybeOptionsOrPropertyKey?: IntersectionObserverOptions | string | symbol, descriptor?: PropertyDescriptor): MethodDecorator | void {
  return dispatchIntersectionObserver(selectorOrOptionsOrTarget, maybeOptionsOrPropertyKey, descriptor, {});
}

export function intersectionObserverThis(options?: IntersectionObserverQueryOptions): MethodDecorator;
export function intersectionObserverThis(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function intersectionObserverThis(optionsOrTarget?: IntersectionObserverQueryOptions | Object, propertyKey?: string | symbol, descriptor?: PropertyDescriptor): MethodDecorator | void {
  return dispatchIntersectionObserver(optionsOrTarget, propertyKey, descriptor, {});
}

// ─── root별 delegate 헬퍼 (root 주입 → 문자열 셀렉터 전용) ───

export function intersectionObserverDelegateLight(selector: string, options?: Omit<IntersectionObserverQueryOptions, 'delegate'>): MethodDecorator;
export function intersectionObserverDelegateLight(options?: Omit<IntersectionObserverQueryOptions, 'delegate'>): MethodDecorator;
export function intersectionObserverDelegateLight(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function intersectionObserverDelegateLight(selectorOrOptionsOrTarget?: string | Omit<IntersectionObserverQueryOptions, 'delegate'> | Object, maybeOptionsOrPropertyKey?: Omit<IntersectionObserverQueryOptions, 'delegate'> | string | symbol, descriptor?: PropertyDescriptor): MethodDecorator | void {
  return dispatchIntersectionObserver(selectorOrOptionsOrTarget as any, maybeOptionsOrPropertyKey as any, descriptor, { root: 'light', delegate: true });
}

export function intersectionObserverDelegateShadow(selector: string, options?: Omit<IntersectionObserverQueryOptions, 'delegate'>): MethodDecorator;
export function intersectionObserverDelegateShadow(options?: Omit<IntersectionObserverQueryOptions, 'delegate'>): MethodDecorator;
export function intersectionObserverDelegateShadow(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function intersectionObserverDelegateShadow(selectorOrOptionsOrTarget?: string | Omit<IntersectionObserverQueryOptions, 'delegate'> | Object, maybeOptionsOrPropertyKey?: Omit<IntersectionObserverQueryOptions, 'delegate'> | string | symbol, descriptor?: PropertyDescriptor): MethodDecorator | void {
  return dispatchIntersectionObserver(selectorOrOptionsOrTarget as any, maybeOptionsOrPropertyKey as any, descriptor, { root: 'shadow', delegate: true });
}

export function intersectionObserverDelegateAll(selector: string, options?: Omit<IntersectionObserverQueryOptions, 'delegate'>): MethodDecorator;
export function intersectionObserverDelegateAll(options?: Omit<IntersectionObserverQueryOptions, 'delegate'>): MethodDecorator;
export function intersectionObserverDelegateAll(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function intersectionObserverDelegateAll(selectorOrOptionsOrTarget?: string | Omit<IntersectionObserverQueryOptions, 'delegate'> | Object, maybeOptionsOrPropertyKey?: Omit<IntersectionObserverQueryOptions, 'delegate'> | string | symbol, descriptor?: PropertyDescriptor): MethodDecorator | void {
  return dispatchIntersectionObserver(selectorOrOptionsOrTarget as any, maybeOptionsOrPropertyKey as any, descriptor, { root: 'all', delegate: true });
}

export function intersectionObserverDelegate(selector: string, options?: Omit<IntersectionObserverQueryOptions, 'delegate'>): MethodDecorator;
export function intersectionObserverDelegate(options?: Omit<IntersectionObserverQueryOptions, 'delegate'>): MethodDecorator;
export function intersectionObserverDelegate(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function intersectionObserverDelegate(selectorOrOptionsOrTarget?: string | Omit<IntersectionObserverQueryOptions, 'delegate'> | Object, maybeOptionsOrPropertyKey?: Omit<IntersectionObserverQueryOptions, 'delegate'> | string | symbol, descriptor?: PropertyDescriptor): MethodDecorator | void {
  return dispatchIntersectionObserver(selectorOrOptionsOrTarget as any, maybeOptionsOrPropertyKey as any, descriptor, { root: 'auto', delegate: true });
}

// ─── root별 일반 헬퍼 (delegate 없이, 셀렉터 생략 시 $this) ───

export function intersectionObserverLight(selector: string, options?: IntersectionObserverQueryOptions): MethodDecorator;
export function intersectionObserverLight(options?: IntersectionObserverQueryOptions): MethodDecorator;
export function intersectionObserverLight(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function intersectionObserverLight(selectorOrOptionsOrTarget?: string | IntersectionObserverQueryOptions | Object, maybeOptionsOrPropertyKey?: IntersectionObserverQueryOptions | string | symbol, descriptor?: PropertyDescriptor): MethodDecorator | void {
  return dispatchIntersectionObserver(selectorOrOptionsOrTarget as any, maybeOptionsOrPropertyKey as any, descriptor, { root: 'light' });
}

export function intersectionObserverShadow(selector: string, options?: IntersectionObserverQueryOptions): MethodDecorator;
export function intersectionObserverShadow(options?: IntersectionObserverQueryOptions): MethodDecorator;
export function intersectionObserverShadow(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function intersectionObserverShadow(selectorOrOptionsOrTarget?: string | IntersectionObserverQueryOptions | Object, maybeOptionsOrPropertyKey?: IntersectionObserverQueryOptions | string | symbol, descriptor?: PropertyDescriptor): MethodDecorator | void {
  return dispatchIntersectionObserver(selectorOrOptionsOrTarget as any, maybeOptionsOrPropertyKey as any, descriptor, { root: 'shadow' });
}

export function intersectionObserverAll(selector: string, options?: IntersectionObserverQueryOptions): MethodDecorator;
export function intersectionObserverAll(options?: IntersectionObserverQueryOptions): MethodDecorator;
export function intersectionObserverAll(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function intersectionObserverAll(selectorOrOptionsOrTarget?: string | IntersectionObserverQueryOptions | Object, maybeOptionsOrPropertyKey?: IntersectionObserverQueryOptions | string | symbol, descriptor?: PropertyDescriptor): MethodDecorator | void {
  return dispatchIntersectionObserver(selectorOrOptionsOrTarget as any, maybeOptionsOrPropertyKey as any, descriptor, { root: 'all' });
}

export function getIntersectionObserverMetadata(target: any): IntersectionObserverMetadata[] | undefined {
  const constructor = target instanceof Function ? target : target.constructor;
  return ReflectUtils.getMetadata(INTERSECTION_OBSERVER_METADATA_KEY, constructor);
}

// ─────────────────────────────────────────────────────────────────────────────
// IntersectionObserverLifeCycler
// observer 를 직접 생성하지 않고 옵션 그룹 배열(IntersectionObserverSet)을 반환한다.
// elementDefine 이 그룹별로 observer 를 생성한다.
// ─────────────────────────────────────────────────────────────────────────────
import { ElementDefineLifeCycler, OnConnectedResult, IntersectionObserverSet, IntersectionObserverGroup, IntersectionObserverSetEntry } from '../types';
import { SwcUtils } from '../utils/Utils';

export class IntersectionObserverLifeCycler implements ElementDefineLifeCycler {
  private readonly removeObserverCallbacksMap = new WeakMap<Element, Array<{ fn: (target: Element, opts: unknown) => void; target: any; opts: unknown }>>();

  onConnected(helperHostSet: HelperHostSet): OnConnectedResult | void {
    const inst = helperHostSet.$this;
    const currentWin = helperHostSet.$w;

    const removeObserverCallbacks: Array<{ fn: (target: Element, opts: unknown) => void; target: any; opts: unknown }> = [];
    this.removeObserverCallbacksMap.set(inst, removeObserverCallbacks);

    const allMeta = getIntersectionObserverMetadata(inst) ?? [];
    if (allMeta.length === 0) return;

    const root: HTMLElement | ShadowRoot = inst.shadowRoot || inst;

    // removeObserver 콜백 수집
    for (const m of allMeta) {
      if (m.options.removeObserver) removeObserverCallbacks.push({ fn: m.options.removeObserver, target: root, opts: m.options });
    }

    // ── IntersectionObserver 콜백 ──
    const buildCallback = (metas: IntersectionObserverMetadata[]): IntersectionObserverSetEntry['callback'] => {
      return (entries, obs) => {
        for (const m of metas) {
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
    };

    // ── 옵션별 그룹핑: 같은 observer 옵션(threshold/rootMargin/intersectionRoot)끼리 묶는다 ──
    // delegate:true 항목은 동적 추적용 셀렉터 문자열로 선언된다.
    const groups = new Map<string, { options: IntersectionObserverInit; metas: IntersectionObserverMetadata[] }>();
    for (const m of allMeta) {
      const obsOptions: IntersectionObserverInit = {
        root: m.options.intersectionRoot ?? null,
        rootMargin: m.options.rootMargin,
        threshold: m.options.threshold,
      };
      const key = JSON.stringify([obsOptions.root, obsOptions.rootMargin, obsOptions.threshold]);
      if (!groups.has(key)) groups.set(key, { options: obsOptions, metas: [] });
      groups.get(key)!.metas.push(m);
    }

    const intersectionObserverSet: IntersectionObserverSet = [];
    for (const [, group] of groups) {
      const callback = buildCallback(group.metas);
      const observeTargets: IntersectionObserverGroup['observeTargets'] = [];

      for (const m of group.metas) {
        if (m.options.delegate && typeof m.selector === 'string') {
          observeTargets.push({ target: m.selector, delegate: true, delegateRoot: m.options.root, callback });
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
        for (const el of targets) observeTargets.push({ target: el, callback });
      }

      intersectionObserverSet.push({ options: group.options, observeTargets });
    }

    return { intersectionObserverSet };
  }

  onDisconnected(helperHostSet: HelperHostSet): void {
    const inst = helperHostSet.$this;
    for (const cb of this.removeObserverCallbacksMap.get(inst) ?? []) {
      try { cb.fn(cb.target, cb.opts); } catch (e) { console.error('[SWC] removeObserver error:', e); }
    }
    this.removeObserverCallbacksMap.delete(inst);
  }
}
