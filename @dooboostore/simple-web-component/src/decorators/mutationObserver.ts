import { ReflectUtils } from '@dooboostore/core';
import { SpecialSelector, SwcQueryOptions, SwcSelector, SwcFnSelector, HelperHostSet } from '../types';

// 공통 옵션 — root·delegate 없음 (MutationObserverInit + filter/removeObserver)
export interface MutationObserverBaseOptions extends MutationObserverInit {
  filter?: (matchedEls: HTMLElement[], meta: { currentThis: any, helper: HelperHostSet }) => boolean;
  // observer 해제(disconnected) 시 호출되는 콜백. 첫 번째 인자는 observe된 target element, 두 번째는 사용자 옵션 객체.
  removeObserver?: (target: Element, optionValue: MutationObserverQueryOptions) => void;
}

// 문자열 셀렉터 전용 — root·delegate 허용 (셀렉터로 탐색/델리게이션)
export type MutationObserverQueryOptions = MutationObserverBaseOptions & SwcQueryOptions & { delegate?: boolean };
// 함수 셀렉터 전용 — root·delegate 금지 (이미 요소를 직접 반환)
export type MutationObserverNonQueryOptions = MutationObserverBaseOptions;

// 셀렉터 종류에 따라 옵션 타입 분기
export type MutationObserverOptionsOf<S extends SwcSelector> = S extends string ? MutationObserverQueryOptions : MutationObserverNonQueryOptions;

export interface MutationObserverMetadata {
  propertyKey: string | symbol;
  selector: SwcSelector;
  options: MutationObserverQueryOptions;
}

export const MUTATION_OBSERVER_METADATA_KEY = Symbol.for('simple-web-component:mutation-observer');

export function mutationObserver(target: SpecialSelector, options?: MutationObserverQueryOptions): MethodDecorator;
export function mutationObserver(selector: string, options?: MutationObserverQueryOptions): MethodDecorator;
export function mutationObserver(selector: SwcFnSelector, options?: MutationObserverNonQueryOptions): MethodDecorator;
export function mutationObserver(options?: MutationObserverQueryOptions): MethodDecorator;
/**
 * @mutationObserver decorator to observe DOM mutations.
 */
export function mutationObserver(selectorOrOptions?: SwcSelector | MutationObserverQueryOptions, maybeOptions?: MutationObserverQueryOptions): MethodDecorator {
  return (targetObj: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    let selector: SwcSelector = '$this';
    let options: MutationObserverQueryOptions = {};

    if (typeof selectorOrOptions === 'string' || typeof selectorOrOptions === 'function') {
      selector = selectorOrOptions;
      options = maybeOptions ?? {};
    } else {
      selector = '$this';
      options = selectorOrOptions ?? {};
    }

    const constructor = targetObj.constructor;

    let observers = ReflectUtils.getMetadata<MutationObserverMetadata[]>(MUTATION_OBSERVER_METADATA_KEY, constructor);
    if (!observers) {
      observers = [];
      ReflectUtils.defineMetadata(MUTATION_OBSERVER_METADATA_KEY, observers, constructor);
    }

    observers.push({ propertyKey, selector, options });
  };
}

export function mutationObserverThis<TEvent extends Event = Event>(options?: MutationObserverQueryOptions): MethodDecorator {
  return mutationObserver('$this', options);
}

// ─── root별 delegate 헬퍼 (addEventListener와 동일 패턴) ───

export function mutationObserverDelegateLight(selector: string, options?: MutationObserverBaseOptions): MethodDecorator;
export function mutationObserverDelegateLight(options?: MutationObserverBaseOptions): MethodDecorator;
export function mutationObserverDelegateLight(selectorOrOptions?: string | Omit<MutationObserverQueryOptions, 'root'>, maybeOptions?: Omit<MutationObserverQueryOptions, 'root'>): MethodDecorator {
  if (typeof selectorOrOptions === 'string' || typeof selectorOrOptions === 'function') {
    return mutationObserver(selectorOrOptions, {...maybeOptions ?? {}, root: 'light', delegate: true});
  }
  return mutationObserver({...selectorOrOptions ?? {}, root: 'light', delegate: true});
}

export function mutationObserverDelegateShadow(selector: string, options?: MutationObserverBaseOptions): MethodDecorator;
export function mutationObserverDelegateShadow(options?: MutationObserverBaseOptions): MethodDecorator;
export function mutationObserverDelegateShadow(selectorOrOptions?: string | Omit<MutationObserverQueryOptions, 'root'>, maybeOptions?: Omit<MutationObserverQueryOptions, 'root'>): MethodDecorator {
  if (typeof selectorOrOptions === 'string' || typeof selectorOrOptions === 'function') {
    return mutationObserver(selectorOrOptions, {...maybeOptions ?? {}, root: 'shadow', delegate: true});
  }
  return mutationObserver({...selectorOrOptions ?? {}, root: 'shadow', delegate: true});
}

export function mutationObserverDelegateAll(selector: string, options?: MutationObserverBaseOptions): MethodDecorator;
export function mutationObserverDelegateAll(options?: MutationObserverBaseOptions): MethodDecorator;
export function mutationObserverDelegateAll(selectorOrOptions?: string | Omit<MutationObserverQueryOptions, 'root'>, maybeOptions?: Omit<MutationObserverQueryOptions, 'root'>): MethodDecorator {
  if (typeof selectorOrOptions === 'string' || typeof selectorOrOptions === 'function') {
    return mutationObserver(selectorOrOptions, {...maybeOptions ?? {}, root: 'all', delegate: true});
  }
  return mutationObserver({...selectorOrOptions ?? {}, root: 'all', delegate: true});
}

export function mutationObserverDelegate(selector: string, options?: MutationObserverBaseOptions): MethodDecorator;
export function mutationObserverDelegate(options?: MutationObserverBaseOptions): MethodDecorator;
export function mutationObserverDelegate(selectorOrOptions?: string | Omit<MutationObserverQueryOptions, 'root'>, maybeOptions?: Omit<MutationObserverQueryOptions, 'root'>): MethodDecorator {
  if (typeof selectorOrOptions === 'string' || typeof selectorOrOptions === 'function') {
    return mutationObserver(selectorOrOptions, {...maybeOptions ?? {}, root: 'auto', delegate: true});
  }
  return mutationObserver({...selectorOrOptions ?? {}, root: 'auto', delegate: true});
}

// ─── root별 일반 헬퍼 (delegate 없이, 셀렉터 생략 시 $this) ───

export function mutationObserverLight(selector: string, options?: Omit<MutationObserverQueryOptions, 'root'>): MethodDecorator;
export function mutationObserverLight(options?: Omit<MutationObserverQueryOptions, 'root'>): MethodDecorator;
export function mutationObserverLight(selectorOrOptions?: string | Omit<MutationObserverQueryOptions, 'root'>, maybeOptions?: Omit<MutationObserverQueryOptions, 'root'>): MethodDecorator {
  if (typeof selectorOrOptions === 'string' || typeof selectorOrOptions === 'function') {
    return mutationObserver(selectorOrOptions, {...maybeOptions ?? {}, root: 'light'});
  }
  return mutationObserver({...selectorOrOptions ?? {}, root: 'light'});
}

export function mutationObserverShadow(selector: string, options?: Omit<MutationObserverQueryOptions, 'root'>): MethodDecorator;
export function mutationObserverShadow(options?: Omit<MutationObserverQueryOptions, 'root'>): MethodDecorator;
export function mutationObserverShadow(selectorOrOptions?: string | Omit<MutationObserverQueryOptions, 'root'>, maybeOptions?: Omit<MutationObserverQueryOptions, 'root'>): MethodDecorator {
  if (typeof selectorOrOptions === 'string' || typeof selectorOrOptions === 'function') {
    return mutationObserver(selectorOrOptions, {...maybeOptions ?? {}, root: 'shadow'});
  }
  return mutationObserver({...selectorOrOptions ?? {}, root: 'shadow'});
}

export function mutationObserverAll(selector: string, options?: Omit<MutationObserverQueryOptions, 'root'>): MethodDecorator;
export function mutationObserverAll(options?: Omit<MutationObserverQueryOptions, 'root'>): MethodDecorator;
export function mutationObserverAll(selectorOrOptions?: string | Omit<MutationObserverQueryOptions, 'root'>, maybeOptions?: Omit<MutationObserverQueryOptions, 'root'>): MethodDecorator {
  if (typeof selectorOrOptions === 'string' || typeof selectorOrOptions === 'function') {
    return mutationObserver(selectorOrOptions, {...maybeOptions ?? {}, root: 'all'});
  }
  return mutationObserver({...selectorOrOptions ?? {}, root: 'all'});
}

export function getMutationObserverMetadata(target: any): MutationObserverMetadata[] | undefined {
  const constructor = target instanceof Function ? target : target.constructor;
  return ReflectUtils.getMetadata(MUTATION_OBSERVER_METADATA_KEY, constructor);
}

// ─────────────────────────────────────────────────────────────────────────────
// MutationObserverLifeCycler
// observer 를 직접 생성하지 않고 OnConnectedResult 를 반환한다.
// elementDefine 이 수집된 MutationObserverSet 으로 observer 를 생성한다.
// ─────────────────────────────────────────────────────────────────────────────
import { ElementDefineLifeCycler, MutationObserverSet, MutationObserverSetEntry, ObserverObserveTarget, OnConnectedResult } from '../types';
import { SwcUtils } from '../utils/Utils';

export class MutationObserverLifeCycler implements ElementDefineLifeCycler {
  private readonly removeObserverCallbacksMap = new WeakMap<Element, Array<{ fn: (target: Element, opts: unknown) => void; target: any; opts: unknown }>>();

  onConnected(helperHostSet: HelperHostSet): OnConnectedResult | void {
    const inst = helperHostSet.$this;
    const currentWin = helperHostSet.$w;

    const removeObserverCallbacks: Array<{ fn: (target: Element, opts: unknown) => void; target: any; opts: unknown }> = [];
    this.removeObserverCallbacksMap.set(inst, removeObserverCallbacks);

    const allMeta = getMutationObserverMetadata(inst) ?? [];
    // 처리할 메타가 없으면 observer 불필요
    if (allMeta.length === 0) return;

    // ── shadow / light 루트별 분류 ──
    const shadowMetas = allMeta.filter(m => {
      const r = m.options.root || 'auto';
      return inst.shadowRoot && (r === 'shadow' || r === 'all' || r === 'auto');
    });
    const lightMetas = allMeta.filter(m => {
      const r = m.options.root || 'auto';
      return r === 'light' || r === 'all' || (!inst.shadowRoot && r === 'auto');
    });
    // ── MutationObserverSet 생성 헬퍼 (루트별) ──
    const buildSet = (
      root: HTMLElement | ShadowRoot,
      metas: MutationObserverMetadata[],
    ): { callback: MutationObserverSetEntry['callback']; observeTargets: ObserverObserveTarget<MutationObserverInit>[] } | null => {
      if (metas.length === 0) return null;

      const initFrom = (o: MutationObserverBaseOptions): MutationObserverInit => {
        const init: MutationObserverInit = {
          childList: o.childList, attributes: o.attributes, characterData: o.characterData,
          subtree: o.subtree, attributeFilter: o.attributeFilter,
          attributeOldValue: o.attributeOldValue, characterDataOldValue: o.characterDataOldValue,
        };
        if (!init.childList && !init.attributes && !init.characterData) init.childList = true;
        return init;
      };

      const fnObservedSets = new Map<MutationObserverMetadata, WeakSet<Element>>();

      const callback = (mutations: MutationRecord[], obs: MutationObserver) => {
        // ── MutationObserver 메타 콜백 ──
        for (const meta of metas) {
          const { selector, options } = meta;
          let matchedEls: HTMLElement[] = [];

          const typeMatches = (m: MutationRecord): boolean => {
            const has = !!(options.childList || options.attributes || options.characterData);
            if (m.type === 'childList')     return has ? !!options.childList : true;
            if (m.type === 'attributes')    return !!options.attributes;
            if (m.type === 'characterData') return !!options.characterData;
            return true;
          };

          const collect = (matchesSel: (n: any) => boolean) =>
            mutations.flatMap(m => {
              if (!typeMatches(m)) return [];
              const els: HTMLElement[] = [];
              if (matchesSel(m.target)) els.push(m.target as HTMLElement);
              Array.from(m.addedNodes   || []).filter(matchesSel).forEach(n => els.push(n as HTMLElement));
              Array.from(m.removedNodes || []).filter(matchesSel).forEach(n => els.push(n as HTMLElement));
              return els;
            });

          if (options.delegate && typeof selector === 'string') {
            const isThis = selector === '$this' || selector === '';
            matchedEls = collect(n => {
              if (!n || n.nodeType !== 1) return false;
              if (isThis) return true;
              const el = n as HTMLElement;
              return el.matches?.(selector) || !!el.closest?.(selector);
            });
          } else if (typeof selector === 'string') {
            const isThis = selector === '$this' || selector === '';
            matchedEls = collect(n => {
              if (!n || n.nodeType !== 1) return false;
              if (isThis) return true;
              return (n as HTMLElement).matches?.(selector);
            });
          } else if (typeof selector === 'function') {
            const set = fnObservedSets.get(meta);
            matchedEls = mutations.filter(m => typeMatches(m))
              .map(m => m.target as HTMLElement)
              .filter(t => t && t.nodeType === 1 && (set ? set.has(t) : false));
          } else {
            matchedEls = mutations.filter(m => typeMatches(m))
              .map(m => m.target as HTMLElement)
              .filter(t => t && t.nodeType === 1);
          }

          if (matchedEls.length === 0) continue;
          if (options.filter) {
            if (!options.filter(matchedEls, { currentThis: inst, helper: helperHostSet })) continue;
          }
          const hostSet = SwcUtils.getHostSet(inst);
          inst[meta.propertyKey](matchedEls, mutations, obs, { ...hostSet, $root: root });
        }

      };

      // ── observe 대상 목록 구성 ──
      const observeTargets: ObserverObserveTarget<MutationObserverInit>[] = [];

      // delegate 있으면 루트 전체 subtree observe
      if (metas.some(m => m.options.delegate)) {
        observeTargets.push({ target: root, options: { childList: true, subtree: true } });
      }

      // non-delegate: 셀렉터 매칭 요소 직접 observe
      for (const m of metas.filter(m => !m.options.delegate)) {
        const { selector, options } = m;
        const mInit = initFrom(options);
        if (typeof selector === 'string') {
          if (selector === '$this' || selector === '') {
            observeTargets.push({ target: root, options: mInit });
          } else {
            root.querySelectorAll(selector).forEach(el => observeTargets.push({ target: el as Element, options: mInit }));
          }
        } else if (typeof selector === 'function') {
          const res = (selector as any)(inst, helperHostSet);
          let targets: HTMLElement[] = [];
          if (res instanceof currentWin.HTMLElement) targets = [res as HTMLElement];
          else if (res instanceof currentWin.NodeList) targets = Array.from(res as NodeList).filter((e: any) => e instanceof currentWin.HTMLElement) as HTMLElement[];
          else if (Array.isArray(res)) targets = res.filter((e: any) => e instanceof currentWin.HTMLElement) as HTMLElement[];
          const set = new WeakSet<Element>();
          for (const el of targets) { set.add(el); observeTargets.push({ target: el, options: mInit }); }
          fnObservedSets.set(m, set);
        }
      }

      // removeObserver 콜백 수집
      for (const m of metas) {
        if (m.options.removeObserver) removeObserverCallbacks.push({ fn: m.options.removeObserver, target: root, opts: m.options });
      }

      return { callback, observeTargets };
    };

    const shadowSet = inst.shadowRoot ? buildSet(inst.shadowRoot, shadowMetas) : null;
    const lightSet  = buildSet(inst as any, lightMetas);

    // 두 루트의 observe 대상 + 콜백을 엔트리 배열(MutationObserverSet)로 병합
    // 같은 루트의 여러 대상은 같은 callback 을 공유한다.
    const mutationObserverSet: MutationObserverSet = [
      ...(shadowSet?.observeTargets ?? []).map(t => ({ ...t, callback: shadowSet!.callback })),
      ...(lightSet?.observeTargets  ?? []).map(t => ({ ...t, callback: lightSet!.callback })),
    ];
    if (mutationObserverSet.length === 0) return;

    return { mutationObserverSet };
  }

  onDisconnected(helperHostSet: HelperHostSet): void {
    const inst = helperHostSet.$this;
    for (const cb of this.removeObserverCallbacksMap.get(inst) ?? []) {
      try { cb.fn(cb.target, cb.opts); } catch (e) { console.error('[SWC] removeObserver error:', e); }
    }
    this.removeObserverCallbacksMap.delete(inst);
  }
}