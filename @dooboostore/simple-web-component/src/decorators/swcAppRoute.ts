import { ReflectUtils } from '@dooboostore/core';
import type { RouteAction, Router, RouterMethodOptions } from '@dooboostore/core-web';
import { SwcUtils } from '../utils/Utils';
import type { HelperHostSet } from '../types';

export const SWC_APP_ROUTE_METADATA_KEY = Symbol.for('simple-web-component:swc-app-route');

export interface SwcAppRouteMetadata {
  propertyKey: string | symbol;
  options?: SwcAppRouteOptions;
}

/** router.go 의 이동 설정 (리턴값으로 직접 줄 때) */
export type SwcAppRouteGoConfig = { path: RouteAction; replace?: boolean; state?: RouterMethodOptions; scrollToTop?: boolean };

/**
 * type 'go' 일 때 메서드 리턴값 → 이동할 곳.
 * - string / RouteAction({ path, searchParams }) : router.go 로 이동
 * - SwcAppRouteGoConfig({ path, replace, state, scrollToTop }) : 그대로 router.go
 * - number : history 이동 (-1 = 뒤로)
 * - undefined / null / false : 이동하지 않음 (조건부 이동)
 */
export type SwcAppRouteGoValue = RouteAction | SwcAppRouteGoConfig | number | undefined | null | false;

/**
 * 어떤 Router 메서드로 이동할지. 기본 'go'.
 * - go: string / RouteAction / SwcAppRouteGoConfig / number (가드 적용)
 * - push / replace: RouteAction (가드 적용)
 * - pushDeleteSearchParam / replaceDeleteSearchParam / pushDeleteHashSearchParam / replaceDeleteHashSearchParam: string | string[]
 * - pushAddSearchParam / replaceAddSearchParam: [[key, value], ...]
 * - pushUpsertSearchParam / replaceUpsertSearchParam: { key: value | value[] }
 * query 만 바꾸는 메서드는 경로가 그대로라 beforeLeave 가드 대상이 아니다.
 * 어느 경우든 undefined / null / false 를 리턴하면 아무 것도 하지 않는다.
 */
export type SwcAppRouteType =
  | 'go' | 'push' | 'replace'
  | 'pushDeleteSearchParam' | 'pushDeleteHashSearchParam' | 'pushAddSearchParam' | 'pushUpsertSearchParam'
  | 'replaceDeleteSearchParam' | 'replaceDeleteHashSearchParam' | 'replaceAddSearchParam' | 'replaceUpsertSearchParam';

export interface SwcAppRouteOptions {
  /** Router 메서드. 기본 'go' */
  type?: SwcAppRouteType;
  /** 기본 replace (type 'go' 전용. 리턴값이 SwcAppRouteGoConfig 면 그쪽이 우선) */
  replace?: boolean;
  /** 기본 state (go 는 SwcAppRouteGoConfig 의 state, 나머지는 두 번째 인자) */
  state?: RouterMethodOptions;
  /** 기본 scrollToTop (type 'go' 전용. router.go 기본값 true) */
  scrollToTop?: boolean;
  /** false 를 리턴하면 이동하지 않는다. target = 이동을 하는 Router, value = valueKey 로 꺼낸 리턴값 */
  filter?: (target: Router, value: any, meta: { currentThis: any; helper: HelperHostSet }) => boolean;
  /**
   * Custom key to extract value from return object.
   * If not provided, uses SWC_APP_ROUTE_METADATA_KEY by default.
   * Useful when this decorator is stacked with others on the same method.
   *
   * Example:
   * @swcAppRoute({ valueKey: 'go' })
   * @publishSwcAppMessage('saved', { valueKey: 'saved' })
   * save() {
   *   return { go: '/done', saved: { id: 1 } };
   * }
   */
  valueKey?: symbol | string;
}

const isGoConfig = (v: any): v is SwcAppRouteGoConfig =>
  !!v && typeof v === 'object' && 'path' in v && ('replace' in v || 'state' in v || 'scrollToTop' in v || typeof v.path === 'object');

function createSwcAppRoute(options?: SwcAppRouteOptions): MethodDecorator {
  return (target: Object, propertyKey: string | symbol, descriptor?: PropertyDescriptor) => {
    const constructor = target.constructor;
    let list = ReflectUtils.getOwnMetadata(SWC_APP_ROUTE_METADATA_KEY, constructor) as SwcAppRouteMetadata[];
    if (!list) {
      list = [];
      ReflectUtils.defineMetadata(SWC_APP_ROUTE_METADATA_KEY, list, constructor);
    }
    list.push({ propertyKey, options });

    if (!descriptor) {
      return descriptor;
    }

    // 메서드 래핑 - 원본 메서드의 반환값으로 이동 (DI 로 router 를 받을 필요 없음: 요소가 속한 SwcApp 의 router 사용)
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: any[]) {
      const result = originalMethod.apply(this, args);

      /**
       * Extract value for this decorator from method return value
       *
       * If return value is an object with this decorator's key,
       * use that value. Otherwise use the entire return value.
       *
       * Uses valueKey from options if provided, otherwise uses SWC_APP_ROUTE_METADATA_KEY.
       */
      const extractValue = (v: any) => {
        const keyToUse = options?.valueKey ?? SWC_APP_ROUTE_METADATA_KEY;
        if (v && typeof v === 'object' && keyToUse in v) {
          return v[keyToUse];
        }
        return v;
      };

      const route = (value: any) => {
        if (value === undefined || value === null || value === false) return;
        const router = SwcUtils.getAppHost(this as HTMLElement)?.router;
        if (!router) {
          console.warn('swcAppRoute: no SwcApp router found for', this);
          return;
        }
        if (options?.filter) {
          const helper = SwcUtils.getHelperAndHostSet(this as HTMLElement);
          if (!options.filter(router, value, { currentThis: this, helper })) return;
        }
        const type = options?.type ?? 'go';
        if (type === 'go') {
          if (typeof value === 'number') return router.go(value);
          const defaults = { replace: options?.replace, state: options?.state, scrollToTop: options?.scrollToTop };
          return router.go(isGoConfig(value) ? { ...defaults, ...value } : { ...defaults, path: value as RouteAction });
        }
        const state = options?.state;
        // push/replace 는 경로가 바뀌므로 go 와 같이 beforeLeave 가드를 거친다 (가드 없으면 동기)
        if ((type === 'push' || type === 'replace') && router.hasLeaveGuards) {
          return router.canLeave(router.getRouteData({ pathOrUrl: router.toUrl(value) }), router.value).then(ok => {
            if (!ok) return;
            if (type === 'push') router.push(value as RouteAction, state);
            else router.replace(value as RouteAction, state);
          });
        }
        switch (type) {
          case 'push':
            return router.push(value as RouteAction, state);
          case 'replace':
            return router.replace(value as RouteAction, state);
          case 'pushDeleteSearchParam':
            return router.pushDeleteSearchParam(value as string | string[], state);
          case 'pushDeleteHashSearchParam':
            return router.pushDeleteHashSearchParam(value as string | string[], state);
          case 'pushAddSearchParam':
            return router.pushAddSearchParam(value as [[string, string]], state);
          case 'pushUpsertSearchParam':
            return router.pushUpsertSearchParam(value as Record<string, string | string[]>, state);
          case 'replaceDeleteSearchParam':
            return router.replaceDeleteSearchParam(value as string | string[], state);
          case 'replaceDeleteHashSearchParam':
            return router.replaceDeleteHashSearchParam(value as string | string[], state);
          case 'replaceAddSearchParam':
            return router.replaceAddSearchParam(value as [[string, string]], state);
          case 'replaceUpsertSearchParam':
            return router.replaceUpsertSearchParam(value as Record<string, string | string[]>, state);
        }
      };

      // Promise 체크
      if (result instanceof Promise) {
        result
          .then(data => route(extractValue(data)))
          .catch(err => {
            console.warn('swcAppRoute async error:', err);
          });
      } else {
        route(extractValue(result));
      }

      return result;
    };

    return descriptor;
  };
}

// 오버로드 시그니처 - 직접 사용 (괄호 없음)
export function swcAppRoute(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor | void;
// 오버로드 시그니처 - 함수 호출 (괄호 있음)
export function swcAppRoute(options: SwcAppRouteOptions): MethodDecorator;

export function swcAppRoute(targetOrOptions?: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor): any {
  // 직접 데코레이터로 사용된 경우 (괄호 없음): @swcAppRoute
  if (targetOrOptions && typeof targetOrOptions === 'object' && propertyKey && (typeof propertyKey === 'string' || typeof propertyKey === 'symbol') && descriptor) {
    return createSwcAppRoute()(targetOrOptions, propertyKey, descriptor);
  }
  // 함수로 호출된 경우 (인자 있음): @swcAppRoute({...})
  return createSwcAppRoute(targetOrOptions as SwcAppRouteOptions | undefined);
}

// --- Aliases ---

/** type 을 고정한 별칭. @swcAppRoutePush / @swcAppRoutePush({ state }) 둘 다. replace/scrollToTop 은 go 전용 */
type SwcAppRouteTypedOptions<T extends SwcAppRouteType> = T extends 'go'
  ? Omit<SwcAppRouteOptions, 'type'>
  : Omit<SwcAppRouteOptions, 'type' | 'replace' | 'scrollToTop'>;
type SwcAppRouteTypedDecorator<T extends SwcAppRouteType> = {
  (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor | void;
  (options: SwcAppRouteTypedOptions<T>): MethodDecorator; // 빈 괄호 금지 — 인자가 없으면 bare
};
const typedRoute = <T extends SwcAppRouteType>(type: T): SwcAppRouteTypedDecorator<T> =>
  ((targetOrOptions?: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor): any => {
    if (targetOrOptions && typeof targetOrOptions === 'object' && propertyKey && (typeof propertyKey === 'string' || typeof propertyKey === 'symbol') && descriptor) {
      return createSwcAppRoute({ type })(targetOrOptions, propertyKey, descriptor);
    }
    return createSwcAppRoute({ ...(targetOrOptions ?? {}), type });
  }) as SwcAppRouteTypedDecorator<T>;

/** 리턴: string / RouteAction / SwcAppRouteGoConfig / number → router.go */
export const swcAppRouteGo = typedRoute('go');
/** 리턴: RouteAction → router.push */
export const swcAppRoutePush = typedRoute('push');
/** 리턴: RouteAction → router.replace */
export const swcAppRouteReplace = typedRoute('replace');
/** 리턴: string | string[] → router.pushDeleteSearchParam */
export const swcAppRoutePushDeleteSearchParam = typedRoute('pushDeleteSearchParam');
/** 리턴: string | string[] → router.pushDeleteHashSearchParam */
export const swcAppRoutePushDeleteHashSearchParam = typedRoute('pushDeleteHashSearchParam');
/** 리턴: [[key, value], ...] → router.pushAddSearchParam */
export const swcAppRoutePushAddSearchParam = typedRoute('pushAddSearchParam');
/** 리턴: { key: value | value[] } → router.pushUpsertSearchParam */
export const swcAppRoutePushUpsertSearchParam = typedRoute('pushUpsertSearchParam');
/** 리턴: string | string[] → router.replaceDeleteSearchParam */
export const swcAppRouteReplaceDeleteSearchParam = typedRoute('replaceDeleteSearchParam');
/** 리턴: string | string[] → router.replaceDeleteHashSearchParam */
export const swcAppRouteReplaceDeleteHashSearchParam = typedRoute('replaceDeleteHashSearchParam');
/** 리턴: [[key, value], ...] → router.replaceAddSearchParam */
export const swcAppRouteReplaceAddSearchParam = typedRoute('replaceAddSearchParam');
/** 리턴: { key: value | value[] } → router.replaceUpsertSearchParam */
export const swcAppRouteReplaceUpsertSearchParam = typedRoute('replaceUpsertSearchParam');

// Helper function to retrieve route metadata
export const getSwcAppRouteMetadata = (target: any): SwcAppRouteMetadata[] | undefined => {
  const constructor = typeof target === 'function' ? target : target.constructor;
  return ReflectUtils.findAllMetadata<any[]>(SWC_APP_ROUTE_METADATA_KEY, constructor).flat();
};
