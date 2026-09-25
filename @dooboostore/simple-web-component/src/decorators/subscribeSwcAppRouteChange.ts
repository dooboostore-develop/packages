import {ReflectUtils} from '@dooboostore/core';
import {Router} from '@dooboostore/core-web';
import {HelperHostSet} from '../types';

export const SUBSCRIBE_SWC_APP_ROUTE_CHANGE_METADATA_KEY = Symbol.for('simple-web-component:subscribe-swc-app-route-change');

export type RoutePathType = string | string[] | ((currentThis: any) => string | string[]);

export interface SwcAppRouteChangeSubscriberMetadata {
  propertyKey: string | symbol;
  options?: SwcAppRouteChangeOptions;
}

export interface SwcAppRouteChangeOptions {
  path?: RoutePathType;
  filter?: (router: Router, meta: { currentThis: any; helper: HelperHostSet }) => boolean;
  order?: number;
  valueKey?: symbol | string;
}

function createSubscribeSwcAppRouteChange(options?: SwcAppRouteChangeOptions): MethodDecorator {
  return (target: Object, propertyKey: string | symbol, descriptor?: PropertyDescriptor) => {
    const pathPattern = options?.path;
    const filter = options?.filter;

    const constructor = target.constructor;
    let list = ReflectUtils.getOwnMetadata(SUBSCRIBE_SWC_APP_ROUTE_CHANGE_METADATA_KEY, constructor) as SwcAppRouteChangeSubscriberMetadata[];
    if (!list) {
      list = [];
      ReflectUtils.defineMetadata(SUBSCRIBE_SWC_APP_ROUTE_CHANGE_METADATA_KEY, list, constructor);
    }
    list.push({ propertyKey, options });

    return descriptor;
  };
}

// 오버로드 시그니처 - 직접 사용 (괄호 없음)
export function subscribeSwcAppRouteChange(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor | void;
// 오버로드 시그니처 - 함수 호출 (괄호 있음)
export function subscribeSwcAppRouteChange(): MethodDecorator;
export function subscribeSwcAppRouteChange(pathPattern: RoutePathType): MethodDecorator;
export function subscribeSwcAppRouteChange(pathPattern: RoutePathType, config: Omit<SwcAppRouteChangeOptions, 'path'>): MethodDecorator;
export function subscribeSwcAppRouteChange(options: SwcAppRouteChangeOptions): MethodDecorator;

// 실제 구현 (이중 모드)
export function subscribeSwcAppRouteChange(targetOrOptions?: any, propertyKeyOrConfig?: any, descriptor?: PropertyDescriptor): any {
  // 직접 데코레이터로 사용된 경우 (괄호 없음): @subscribeSwcAppRouteChange
  // propertyKey가 string | symbol이고 descriptor가 있으면 직접 사용
  if (propertyKeyOrConfig && (typeof propertyKeyOrConfig === 'string' || typeof propertyKeyOrConfig === 'symbol')) {
    return createSubscribeSwcAppRouteChange({})(targetOrOptions, propertyKeyOrConfig, descriptor);
  }

  // 함수로 호출된 경우 (괄호 있음): @subscribeSwcAppRouteChange() / @subscribeSwcAppRouteChange('/path')
  let options: SwcAppRouteChangeOptions = {};

  if (Array.isArray(targetOrOptions)) {
    // 배열: @subscribeSwcAppRouteChange(['/path1', '/path2'])
    // 또는: @subscribeSwcAppRouteChange(['/path1', '/path2'], { order: 1 })
    options.path = targetOrOptions;
    if (propertyKeyOrConfig && typeof propertyKeyOrConfig === 'object') {
      options = { ...options, ...propertyKeyOrConfig };
    }
  } else if (typeof targetOrOptions === 'string' || typeof targetOrOptions === 'function') {
    // 문자열 또는 함수: @subscribeSwcAppRouteChange('/path')
    // 또는: @subscribeSwcAppRouteChange('/path', { order: 1 })
    options.path = targetOrOptions;
    if (propertyKeyOrConfig && typeof propertyKeyOrConfig === 'object') {
      options = { ...options, ...propertyKeyOrConfig };
    }
  } else if (targetOrOptions && typeof targetOrOptions === 'object') {
    // 객체: @subscribeSwcAppRouteChange({ path: '/path', filter: ..., order: 1 })
    options = targetOrOptions;
  }

  return createSubscribeSwcAppRouteChange(options);
}
export const changedRoute = subscribeSwcAppRouteChange;

// Helper function to retrieve route change subscribers metadata
export const getSubscribeSwcAppRouteChangeMetadata = (target: any): SwcAppRouteChangeSubscriberMetadata[] => {
  const constructor = target instanceof Function ? target : target.constructor;
  const results = ReflectUtils.getOwnMetadata(SUBSCRIBE_SWC_APP_ROUTE_CHANGE_METADATA_KEY, constructor);
  if (!results) return [];
  
  // Sort by order (default 0 if not specified)
  return [...results].sort((a, b) => (a.options?.order ?? 0) - (b.options?.order ?? 0));
};

// ─────────────────────────────────────────────────────────────────────────────
// RouteSubscribeLifeCycler
// NOTE: 실제 구독 로직은 SwcAppMixin._connected 에서 처리된다.
//       이 cycler 는 메타데이터 접근 진입점 역할만 하며,
//       향후 SwcAppMixin 에서 로직을 분리할 때 이 클래스로 이전한다.
// ─────────────────────────────────────────────────────────────────────────────
import { ElementDefineLifeCycler } from '../types';

export class RouteSubscribeLifeCycler implements ElementDefineLifeCycler {
  onConnected(_helperHostSet: HelperHostSet): void {
    // 실제 구독은 SwcAppMixin._connected 에서 처리
  }

  /** SwcAppMixin 이 구독 대상 메타를 꺼낼 때 사용 */
  getMetadata(helperHostSet: HelperHostSet): SwcAppRouteChangeSubscriberMetadata[] {
    return getSubscribeSwcAppRouteChangeMetadata(helperHostSet.$this);
  }
}
