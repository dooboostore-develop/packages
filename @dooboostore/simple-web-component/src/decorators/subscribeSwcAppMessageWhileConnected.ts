import { ReflectUtils } from '@dooboostore/core';
import { SwcAppMessage, SpecialSelector, SwcQueryOptions, HelperHostSet } from '../types';

export const SUBSCRIBE_SWC_APP_MESSAGE_WHILE_CONNECTED_METADATA_KEY = Symbol.for('simple-web-component:subscribe-swc-app-message-while-connected');

export interface SwcAppMessageSubscriberMetadata {
  propertyKey: string | symbol;
  messageType?: string;
  filter?: (message: SwcAppMessage, currentThis: any) => boolean;
}

export interface SwcAppMessageOptions {
  filter?: (message: SwcAppMessage, currentThis: any) => boolean;
}

function createSubscribeSwcAppMessageWhileConnected(options?: SwcAppMessageOptions, messageType?: string): MethodDecorator {
  return (target: Object, propertyKey: string | symbol, descriptor?: PropertyDescriptor) => {
    const filter = options?.filter;

    const constructor = target.constructor;
    let list = ReflectUtils.getOwnMetadata(SUBSCRIBE_SWC_APP_MESSAGE_WHILE_CONNECTED_METADATA_KEY, constructor) as SwcAppMessageSubscriberMetadata[];
    if (!list) {
      list = [];
      ReflectUtils.defineMetadata(SUBSCRIBE_SWC_APP_MESSAGE_WHILE_CONNECTED_METADATA_KEY, list, constructor);
    }
    list.push({ propertyKey, messageType, filter });
    
    return descriptor;
  };
}

// 오버로드 시그니처 - 직접 사용 (괄호 없음)
export function subscribeSwcAppMessageWhileConnected(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor | void;
// 오버로드 시그니처 - 함수 호출 (괄호 있음) - 메시지 타입만
export function subscribeSwcAppMessageWhileConnected(messageType: string): MethodDecorator;
// 오버로드 시그니처 - 함수 호출 (괄호 있음) - 옵션만
export function subscribeSwcAppMessageWhileConnected(options: SwcAppMessageOptions): MethodDecorator;
// 오버로드 시그니처 - 함수 호출 (괄호 있음) - 메시지 타입 + 옵션
export function subscribeSwcAppMessageWhileConnected(messageType: string, options: SwcAppMessageOptions): MethodDecorator;

export function subscribeSwcAppMessageWhileConnected(targetOrMessageTypeOrOptions?: any, optionsOrPropertyKey?: any, descriptor?: PropertyDescriptor): any {
  // 직접 데코레이터로 사용된 경우 (괄호 없음): @subscribeSwcAppMessageWhileConnected
  if (targetOrMessageTypeOrOptions && typeof targetOrMessageTypeOrOptions === 'object' && 
      optionsOrPropertyKey && (typeof optionsOrPropertyKey === 'string' || typeof optionsOrPropertyKey === 'symbol') &&
      descriptor) {
    const target = targetOrMessageTypeOrOptions;
    const propertyKey = optionsOrPropertyKey;
    return createSubscribeSwcAppMessageWhileConnected({})(target, propertyKey, descriptor);
  }

  // 함수로 호출된 경우 (괄호 있음)
  let messageType: string | undefined;
  let options: SwcAppMessageOptions = {};

  if (typeof targetOrMessageTypeOrOptions === 'string') {
    // 메시지 타입 전달: @subscribeSwcAppMessageWhileConnected('messageType') 또는 @subscribeSwcAppMessageWhileConnected('messageType', options)
    messageType = targetOrMessageTypeOrOptions;
    if (optionsOrPropertyKey && typeof optionsOrPropertyKey === 'object') {
      options = optionsOrPropertyKey;
    }
  } else if (targetOrMessageTypeOrOptions && typeof targetOrMessageTypeOrOptions === 'object') {
    // 옵션만 전달: @subscribeSwcAppMessageWhileConnected({ filter: ... })
    options = targetOrMessageTypeOrOptions;
  }

  return createSubscribeSwcAppMessageWhileConnected(options, messageType);
}

export const receiveMessage = subscribeSwcAppMessageWhileConnected;
// Helper function to retrieve message subscribers metadata
export const getSubscribeSwcAppMessageWhileConnectedMetadata = (target: any): SwcAppMessageSubscriberMetadata[] | undefined => {
  const constructor = target instanceof Function ? target : target.constructor;
  return ReflectUtils.getOwnMetadata(SUBSCRIBE_SWC_APP_MESSAGE_WHILE_CONNECTED_METADATA_KEY, constructor);
};
