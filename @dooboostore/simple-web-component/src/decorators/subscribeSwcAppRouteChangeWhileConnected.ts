import { ReflectUtils } from '@dooboostore/core';
import { Router } from '@dooboostore/core-web';

export const SUBSCRIBE_SWC_APP_ROUTE_CHANGE_WHILE_CONNECTED_METADATA_KEY = Symbol.for('simple-web-component:subscribe-swc-app-route-change-while-connected');

export interface SwcAppRouteChangeSubscriberMetadata {
  propertyKey: string | symbol;
  pathPattern?: string | string[];
  filter?: (router: Router, currentThis: any) => boolean;
}

export interface SwcAppRouteChangeOptions {
  path?: string | string[];
  filter?: (router: Router, currentThis: any) => boolean;
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
    list.push({ propertyKey, pathPattern, filter });
    
    return descriptor;
  };
}

// 오버로드 시그니처 - 직접 사용 (괄호 없음)
export function subscribeSwcAppRouteChangeWhileConnected(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor | void;
// 오버로드 시그니처 - 함수 호출 (괄호 있음)
export function subscribeSwcAppRouteChangeWhileConnected(): MethodDecorator;
export function subscribeSwcAppRouteChangeWhileConnected(pathPattern: string): MethodDecorator;
export function subscribeSwcAppRouteChangeWhileConnected(pathPatterns: string[]): MethodDecorator;
export function subscribeSwcAppRouteChangeWhileConnected(options: SwcAppRouteChangeOptions): MethodDecorator;

// 실제 구현 (이중 모드)
export function subscribeSwcAppRouteChangeWhileConnected(targetOrOptions?: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor): any {
  // 직접 데코레이터로 사용된 경우 (괄호 없음): @subscribeSwcAppRouteChangeWhileConnected
  // propertyKey가 string | symbol이고 descriptor가 있으면 직접 사용
  if (propertyKey && (typeof propertyKey === 'string' || typeof propertyKey === 'symbol')) {
    return createSubscribeSwcAppRouteChangeWhileConnected({})(targetOrOptions, propertyKey, descriptor);
  }
  
  // 함수로 호출된 경우 (괄호 있음): @subscribeSwcAppRouteChangeWhileConnected() / @subscribeSwcAppRouteChangeWhileConnected('/path')
  let options: SwcAppRouteChangeOptions = {};

  if (Array.isArray(targetOrOptions)) {
    // 배열: @subscribeSwcAppRouteChangeWhileConnected(['/path1', '/path2'])
    options.path = targetOrOptions;
  } else if (typeof targetOrOptions === 'string') {
    // 문자열: @subscribeSwcAppRouteChangeWhileConnected('/path')
    options.path = targetOrOptions;
  } else if (targetOrOptions && typeof targetOrOptions === 'object') {
    // 객체: @subscribeSwcAppRouteChangeWhileConnected({ path: '/path', filter: ... })
    options = targetOrOptions;
  }

  return createSubscribeSwcAppRouteChangeWhileConnected(options);
}

// Helper function to retrieve route change subscribers metadata
export const getSubscribeSwcAppRouteChangeWhileConnectedMetadata = (target: any): SwcAppRouteChangeSubscriberMetadata[] | undefined => {
  const constructor = target instanceof Function ? target : target.constructor;
  return ReflectUtils.getOwnMetadata(SUBSCRIBE_SWC_APP_ROUTE_CHANGE_WHILE_CONNECTED_METADATA_KEY, constructor);
};
