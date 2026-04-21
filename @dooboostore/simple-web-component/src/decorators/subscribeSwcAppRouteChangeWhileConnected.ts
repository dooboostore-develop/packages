import {ReflectUtils} from '@dooboostore/core';
import {Router} from '@dooboostore/core-web';
import {HelperHostSet} from '../types';

export const SUBSCRIBE_SWC_APP_ROUTE_CHANGE_WHILE_CONNECTED_METADATA_KEY = Symbol.for('simple-web-component:subscribe-swc-app-route-change-while-connected');

export type RoutePathType = string | string[] | ((currentThis: any) => string | string[]);

export interface SwcAppRouteChangeSubscriberMetadata {
  propertyKey: string | symbol;
  options?: SwcAppRouteChangeOptions;
}

export interface SwcAppRouteChangeOptions {
  path?: RoutePathType;
  filter?: (router: Router, meta: {currentThis: any, helper: HelperHostSet}) => boolean;
  order?: number;
}

function createSubscribeSwcAppRouteChangeWhileConnected(options?: SwcAppRouteChangeOptions): MethodDecorator {
  return (target: Object, propertyKey: string | symbol, descriptor?: PropertyDescriptor) => {
    const pathPattern = options?.path;
    const filter = options?.filter;

    const constructor = target.constructor;
    let list = ReflectUtils.getOwnMetadata(SUBSCRIBE_SWC_APP_ROUTE_CHANGE_WHILE_CONNECTED_METADATA_KEY, constructor) as SwcAppRouteChangeSubscriberMetadata[];
    if (!list) {
      list = [];
      ReflectUtils.defineMetadata(SUBSCRIBE_SWC_APP_ROUTE_CHANGE_WHILE_CONNECTED_METADATA_KEY, list, constructor);
    }
    list.push({ propertyKey, options });

    return descriptor;
  };
}

// 오버로드 시그니처 - 직접 사용 (괄호 없음)
export function subscribeSwcAppRouteChangeWhileConnected(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor | void;
// 오버로드 시그니처 - 함수 호출 (괄호 있음)
export function subscribeSwcAppRouteChangeWhileConnected(): MethodDecorator;
export function subscribeSwcAppRouteChangeWhileConnected(pathPattern: RoutePathType): MethodDecorator;
export function subscribeSwcAppRouteChangeWhileConnected(pathPattern: RoutePathType, config: Omit<SwcAppRouteChangeOptions, 'path'>): MethodDecorator;
export function subscribeSwcAppRouteChangeWhileConnected(options: SwcAppRouteChangeOptions): MethodDecorator;

// 실제 구현 (이중 모드)
export function subscribeSwcAppRouteChangeWhileConnected(targetOrOptions?: any, propertyKeyOrConfig?: any, descriptor?: PropertyDescriptor): any {
  // 직접 데코레이터로 사용된 경우 (괄호 없음): @subscribeSwcAppRouteChangeWhileConnected
  // propertyKey가 string | symbol이고 descriptor가 있으면 직접 사용
  if (propertyKeyOrConfig && (typeof propertyKeyOrConfig === 'string' || typeof propertyKeyOrConfig === 'symbol')) {
    return createSubscribeSwcAppRouteChangeWhileConnected({})(targetOrOptions, propertyKeyOrConfig, descriptor);
  }

  // 함수로 호출된 경우 (괄호 있음): @subscribeSwcAppRouteChangeWhileConnected() / @subscribeSwcAppRouteChangeWhileConnected('/path')
  let options: SwcAppRouteChangeOptions = {};

  if (Array.isArray(targetOrOptions)) {
    // 배열: @subscribeSwcAppRouteChangeWhileConnected(['/path1', '/path2'])
    // 또는: @subscribeSwcAppRouteChangeWhileConnected(['/path1', '/path2'], { order: 1 })
    options.path = targetOrOptions;
    if (propertyKeyOrConfig && typeof propertyKeyOrConfig === 'object') {
      options = { ...options, ...propertyKeyOrConfig };
    }
  } else if (typeof targetOrOptions === 'string' || typeof targetOrOptions === 'function') {
    // 문자열 또는 함수: @subscribeSwcAppRouteChangeWhileConnected('/path')
    // 또는: @subscribeSwcAppRouteChangeWhileConnected('/path', { order: 1 })
    options.path = targetOrOptions;
    if (propertyKeyOrConfig && typeof propertyKeyOrConfig === 'object') {
      options = { ...options, ...propertyKeyOrConfig };
    }
  } else if (targetOrOptions && typeof targetOrOptions === 'object') {
    // 객체: @subscribeSwcAppRouteChangeWhileConnected({ path: '/path', filter: ..., order: 1 })
    options = targetOrOptions;
  }

  return createSubscribeSwcAppRouteChangeWhileConnected(options);
}
export const changedRoute = subscribeSwcAppRouteChangeWhileConnected;

// Helper function to retrieve route change subscribers metadata
export const getSubscribeSwcAppRouteChangeWhileConnectedMetadata = (target: any): SwcAppRouteChangeSubscriberMetadata[] => {
  const constructor = target instanceof Function ? target : target.constructor;
  const results = ReflectUtils.getOwnMetadata(SUBSCRIBE_SWC_APP_ROUTE_CHANGE_WHILE_CONNECTED_METADATA_KEY, constructor);
  if (!results) return [];
  
  // Sort by order (default 0 if not specified)
  return [...results].sort((a, b) => (a.options?.order ?? 0) - (b.options?.order ?? 0));
};
