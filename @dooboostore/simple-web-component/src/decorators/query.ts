import { ReflectUtils } from '@dooboostore/core';
import { getElementConfig, ensureInit } from './elementDefine';
import { SwcUtils } from '../utils/Utils';
import { SwcQueryOptions, SwcRootType, SwcFnSelector, SwcSelector, HelperHostSet } from '../types';

export type QueryPick = 'first' | 'last' | 'all' | 'even' | 'odd' | number;

export interface QueryBaseOptions {
  // 어떤 요소를 고를지 — 기본 'first'(단일). 'all'/'even'/'odd'는 배열, number는 인덱스(단일)
  pick?: QueryPick;
  filter?: (target: HTMLElement, meta: { currentThis: any, helper: HelperHostSet }) => boolean;
}
// 문자열 셀렉터 전용 — root 허용
export type QueryOptions = QueryBaseOptions & SwcQueryOptions;
// 함수 셀렉터 전용 — root 금지
export type QueryNonQueryOptions = QueryBaseOptions;

export type QueryFnSelector = SwcFnSelector;
export type QuerySelector = SwcSelector;

// 셀렉터 종류에 따라 옵션 타입 분기
export type QueryOptionsOf<S extends QuerySelector> = S extends string ? QueryOptions : QueryNonQueryOptions;

export interface QueryMetadata {
  propertyKey: string | symbol;
  selector: QuerySelector;
  options: QueryOptions;
}

export const QUERY_METADATA_KEY = Symbol.for('simple-web-component:query');

/**
 * 셀렉터를 해석해 매칭된 모든 요소를 배열로 반환한다 (query/queryAll 공용).
 * $window/$document는 요소가 아니므로 여기서 처리하지 않는다.
 */
export const resolveQueryElements = (
  inst: any,
  selector: QuerySelector,
  options: QueryOptions,
  win: Window
): HTMLElement[] => {
  const hostSet = SwcUtils.getHelperAndHostSet(win, inst);
  let all: HTMLElement[] = [];

  if (typeof selector === 'function') {
    const result = (selector as any)(inst, hostSet);
    if (result instanceof win.NodeList) all = Array.from(result as NodeList).filter(e => e instanceof win.HTMLElement) as HTMLElement[];
    else if (Array.isArray(result)) all = (result as any[]).filter(e => e instanceof win.HTMLElement) as HTMLElement[];
    else if (result instanceof win.HTMLElement) all = [result as HTMLElement];
  } else if (typeof selector === 'string') {
    const r = (options as any)?.root || 'auto';
    if (selector === '$this') all = [inst as HTMLElement];
    else if (selector === '$host') all = hostSet.$host ? [hostSet.$host] : [];
    else if (selector === '$parentHost') all = hostSet.$parentHost ? [hostSet.$parentHost] : [];
    else if (selector === '$appHost') all = hostSet.$appHost ? [hostSet.$appHost as any] : [];
    else if (selector === '$firstHost') all = hostSet.$firstHost ? [hostSet.$firstHost] : [];
    else if (selector === '$lastHost') all = hostSet.$lastHost ? [hostSet.$lastHost] : [];
    else if (selector === '$firstAppHost') all = hostSet.$firstAppHost ? [hostSet.$firstAppHost as any] : [];
    else if (selector === '$lastAppHost') all = hostSet.$lastAppHost ? [hostSet.$lastAppHost as any] : [];
    else if (selector === '$hosts') all = hostSet.$hosts.filter(Boolean);
    else if (selector === '$appHosts') all = hostSet.$appHosts.filter(Boolean) as any[];
    else {
      const scopes: any[] = [];
      if (r === 'auto') scopes.push(inst.shadowRoot || inst);
      else if (r === 'light') scopes.push(inst);
      else if (r === 'shadow' && inst.shadowRoot) scopes.push(inst.shadowRoot);
      else if (r === 'all') { scopes.push(inst); if (inst.shadowRoot) scopes.push(inst.shadowRoot); }
      for (const scope of scopes) {
        const found = scope?.querySelectorAll?.(selector) as NodeListOf<HTMLElement> | undefined;
        if (found?.length) all.push(...Array.from(found).filter(e => e instanceof win.HTMLElement));
      }
    }
  }

  if ((options as any)?.filter) {
    all = all.filter(el => (options as any).filter(el, { currentThis: inst, helper: hostSet }));
  }
  return all;
};

/**
 * 매칭된 요소 배열에서 pick 옵션에 따라 요소를 고른다.
 * - 'first'(기본) / 'last' / number(인덱스) → 단일 요소
 * - 'all' / 'even'(0,2,4...) / 'odd'(1,3,5...) → 배열
 */
export const pickElements = (
  all: HTMLElement[],
  pick: QueryPick
): HTMLElement | HTMLElement[] | null => {
  if (pick === 'all') return all;
  if (pick === 'even') return all.filter((_, i) => i % 2 === 0);
  if (pick === 'odd') return all.filter((_, i) => i % 2 === 1);
  if (typeof pick === 'number') return all[pick] ?? null;
  if (pick === 'last') return all.length ? all[all.length - 1] : null;
  return all.length ? all[0] : null;
};

export function query(target: Object, propertyKey: string | symbol, descriptor?: PropertyDescriptor): PropertyDescriptor | void;
export function query(selector: string, options?: QueryOptions): PropertyDecorator;
export function query(selector: QueryFnSelector, options?: QueryNonQueryOptions): PropertyDecorator;
export function query(options?: QueryOptions): PropertyDecorator;
/**
 * @query decorator — 클래스 필드에 요소를 주입한다.
 *
 * - 문자열 셀렉터: CSS / 특수 셀렉터($this,$host,$window,...), root 옵션으로 탐색 영역 지정
 * - 함수 셀렉터: (currentThis, helper) => Node | NodeList | Element | Element[] | null (root 금지)
 * - options.pick: 'first'(기본) | 'last' | 'all' | 'even' | 'odd' | number
 */
export function query(selectorOrTarget?: string | ((currentThis: any, helper: HelperHostSet) => Node | NodeList | Element | Element[] | null) | Object, optionsOrPropertyKey?: QueryOptions | string | symbol, descriptor?: PropertyDescriptor): any {
  // Bare decorator: @query
  if (descriptor !== undefined && (typeof optionsOrPropertyKey === 'string' || typeof optionsOrPropertyKey === 'symbol')) {
    throw new Error(`@query decorator cannot be used on methods. (Method: ${String(optionsOrPropertyKey)})`);
  }
  // With selector
  if (typeof selectorOrTarget === 'string' || typeof selectorOrTarget === 'function') {
    return (targetObj: Object, propertyKey: string | symbol, descriptor?: never): void => {
      if (descriptor !== undefined) {
        throw new Error(`@query decorator cannot be used on methods. (Method: ${String(propertyKey)})`);
      }

      const constructor = targetObj.constructor;
      let queries = ReflectUtils.getMetadata<QueryMetadata[]>(QUERY_METADATA_KEY, constructor);
      if (!queries) {
        queries = [];
        ReflectUtils.defineMetadata(QUERY_METADATA_KEY, queries, constructor);
      }
      queries.push({ propertyKey, selector: selectorOrTarget as any, options: (optionsOrPropertyKey as QueryOptions) || {} });

      Object.defineProperty(targetObj, propertyKey, {
        get(this: HTMLElement) {
          ensureInit(this);
          const config = getElementConfig(this);
          const win = config?.window || window;
          const options = (optionsOrPropertyKey as QueryOptions) || {};

          // $window/$document는 요소가 아니므로 항상 단일 반환
          if (typeof selectorOrTarget === 'string' && selectorOrTarget === '$window') return win;
          if (typeof selectorOrTarget === 'string' && selectorOrTarget === '$document') return win.document;

          const all = resolveQueryElements(this, selectorOrTarget as QuerySelector, options, win);
          return pickElements(all, options.pick ?? 'first');
        },
        set(this: HTMLElement, nv: any) {
          ensureInit(this);
          if (nv === null || nv === undefined || (Array.isArray(nv) && nv.length === 0)) {
            const config = getElementConfig(this);
            const win = config?.window || window;
            const options = (optionsOrPropertyKey as QueryOptions) || {};
            const all = resolveQueryElements(this, selectorOrTarget as QuerySelector, options, win);
            const picked = pickElements(all, options.pick ?? 'first');
            if (Array.isArray(picked)) picked.forEach(t => t.remove());
            else if (picked) picked.remove();
          }
        },
        enumerable: true,
        configurable: true
      });
    };
  }
  // Without selector (defaults to $this)
  return query('$this', selectorOrTarget as QueryOptions);
}

export const getQueryMetadata = (target: any): QueryMetadata[]  => {
  const constructor = target instanceof Function ? target : target.constructor;
  return ReflectUtils.getMetadata(QUERY_METADATA_KEY, constructor) ?? [];
};

// ─── queryAll (query의 pick:'all' 편의 래퍼 — 호환용) ───
export const QUERY_ALL_METADATA_KEY = QUERY_METADATA_KEY;

export function queryAll(target: Object, propertyKey: string | symbol, descriptor?: PropertyDescriptor): PropertyDescriptor | void;
export function queryAll(selector: string, options?: Omit<QueryOptions, 'pick'>): PropertyDecorator;
export function queryAll(selector: QueryFnSelector, options?: Omit<QueryNonQueryOptions, 'pick'>): PropertyDecorator;
export function queryAll(options?: Omit<QueryOptions, 'pick'>): PropertyDecorator;
export function queryAll(selectorOrTarget?: any, optionsOrPropertyKey?: any, descriptor?: PropertyDescriptor): any {
  // bare(필드 직접 적용)는 query로 위임
  if (descriptor !== undefined && (typeof optionsOrPropertyKey === 'string' || typeof optionsOrPropertyKey === 'symbol')) {
    return query(selectorOrTarget, optionsOrPropertyKey, descriptor);
  }
  if (typeof selectorOrTarget === 'string' || typeof selectorOrTarget === 'function') {
    return query(selectorOrTarget, {...(optionsOrPropertyKey ?? {}), pick: 'all'});
  }
  return query({...(selectorOrTarget ?? {}), pick: 'all'});
}

export const getQueryAllMetadata = getQueryMetadata;

// ─── root별 편의 데코레이터 ───

/**
 * @queryShadow(selector, options?) — shadow DOM에서 요소를 쿼리
 */
export function queryShadow(selector: string | QueryFnSelector, options?: QueryBaseOptions): PropertyDecorator {
  return query(selector as any, {...options ?? {}, root: 'shadow'});
}

/**
 * @queryLight(selector, options?) — light DOM에서 요소를 쿼리
 */
export function queryLight(selector: string | QueryFnSelector, options?: QueryBaseOptions): PropertyDecorator {
  return query(selector as any, {...options ?? {}, root: 'light'});
}

/**
 * @queryAllRoots(selector, options?) — shadow+light 모두에서 요소를 쿼리 (pick 기본 first)
 */
export function queryAllRoots(selector: string | QueryFnSelector, options?: QueryBaseOptions): PropertyDecorator {
  return query(selector as any, {...options ?? {}, root: 'all'});
}

/**
 * @queryAllShadow(selector, options?) — shadow DOM에서 모든 매칭 요소를 배열로 쿼리
 */
export function queryAllShadow(selector: string | QueryFnSelector, options?: QueryBaseOptions): PropertyDecorator {
  return query(selector as any, {...options ?? {}, root: 'shadow', pick: 'all'});
}

/**
 * @queryAllLight(selector, options?) — light DOM에서 모든 매칭 요소를 배열로 쿼리
 */
export function queryAllLight(selector: string | QueryFnSelector, options?: QueryBaseOptions): PropertyDecorator {
  return query(selector as any, {...options ?? {}, root: 'light', pick: 'all'});
}

/**
 * @queryAllAll(selector, options?) — shadow+light 모두에서 모든 매칭 요소를 배열로 쿼리
 */
export function queryAllAll(selector: string | QueryFnSelector, options?: QueryBaseOptions): PropertyDecorator {
  return query(selector as any, {...options ?? {}, root: 'all', pick: 'all'});
}

/**
 * @queryIn(root, pick?) — root + pick 조합 팩토리.
 * first/last/even/odd/all/number를 모두 지원하는 데코레이터를 생성한다.
 *
 * @example
 * @queryIn('shadow', 'even')('.item')   // shadow DOM 짝수 인덱스들
 * @queryIn('light', 2)('.item')         // light DOM 3번째 요소
 * @queryIn('all')('.item')              // root all, pick 기본 first
 */
export const queryIn = (root: SwcRootType, pick?: QueryPick) =>
  (selector: string | QueryFnSelector, options?: QueryBaseOptions): PropertyDecorator =>
    query(selector as any, {...options ?? {}, root, ...(pick !== undefined ? {pick} : {})});