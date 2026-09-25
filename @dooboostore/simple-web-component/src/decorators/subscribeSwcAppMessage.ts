import { ReflectUtils } from '@dooboostore/core';
import { SwcAppMessage, SpecialSelector, SwcQueryOptions, HelperHostSet } from '../types';

export const SUBSCRIBE_SWC_APP_MESSAGE_METADATA_KEY = Symbol.for('simple-web-component:subscribe-swc-app-message');

export interface SwcAppMessageSubscriberMetadata {
  propertyKey: string | symbol;
  messageType?: string;
  filter?: (message: SwcAppMessage, currentThis: any) => boolean;
}

export interface SwcAppMessageOptions {
  filter?: (message: SwcAppMessage, currentThis: any) => boolean;
}

function createSubscribeSwcAppMessage(options?: SwcAppMessageOptions, messageType?: string): MethodDecorator {
  return (target: Object, propertyKey: string | symbol, descriptor?: PropertyDescriptor) => {
    const filter = options?.filter;

    const constructor = target.constructor;
    let list = ReflectUtils.getOwnMetadata(SUBSCRIBE_SWC_APP_MESSAGE_METADATA_KEY, constructor) as SwcAppMessageSubscriberMetadata[];
    if (!list) {
      list = [];
      ReflectUtils.defineMetadata(SUBSCRIBE_SWC_APP_MESSAGE_METADATA_KEY, list, constructor);
    }
    list.push({ propertyKey, messageType, filter });
    
    return descriptor;
  };
}

// 오버로드 시그니처 - 직접 사용 (괄호 없음)
export function subscribeSwcAppMessage(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor | void;
// 오버로드 시그니처 - 함수 호출 (괄호 있음) - 메시지 타입만
export function subscribeSwcAppMessage(messageType: string): MethodDecorator;
// 오버로드 시그니처 - 함수 호출 (괄호 있음) - 옵션만
export function subscribeSwcAppMessage(options: SwcAppMessageOptions): MethodDecorator;
// 오버로드 시그니처 - 함수 호출 (괄호 있음) - 메시지 타입 + 옵션
export function subscribeSwcAppMessage(messageType: string, options: SwcAppMessageOptions): MethodDecorator;

export function subscribeSwcAppMessage(targetOrMessageTypeOrOptions?: any, optionsOrPropertyKey?: any, descriptor?: PropertyDescriptor): any {
  // 직접 데코레이터로 사용된 경우 (괄호 없음): @subscribeSwcAppMessage
  if (targetOrMessageTypeOrOptions && typeof targetOrMessageTypeOrOptions === 'object' && 
      optionsOrPropertyKey && (typeof optionsOrPropertyKey === 'string' || typeof optionsOrPropertyKey === 'symbol') &&
      descriptor) {
    const target = targetOrMessageTypeOrOptions;
    const propertyKey = optionsOrPropertyKey;
    return createSubscribeSwcAppMessage({})(target, propertyKey, descriptor);
  }

  // 함수로 호출된 경우 (괄호 있음)
  let messageType: string | undefined;
  let options: SwcAppMessageOptions = {};

  if (typeof targetOrMessageTypeOrOptions === 'string') {
    // 메시지 타입 전달: @subscribeSwcAppMessage('messageType') 또는 @subscribeSwcAppMessage('messageType', options)
    messageType = targetOrMessageTypeOrOptions;
    if (optionsOrPropertyKey && typeof optionsOrPropertyKey === 'object') {
      options = optionsOrPropertyKey;
    }
  } else if (targetOrMessageTypeOrOptions && typeof targetOrMessageTypeOrOptions === 'object') {
    // 옵션만 전달: @subscribeSwcAppMessage({ filter: ... })
    options = targetOrMessageTypeOrOptions;
  }

  return createSubscribeSwcAppMessage(options, messageType);
}

export const receiveMessage = subscribeSwcAppMessage;
// Helper function to retrieve message subscribers metadata
export const getSubscribeSwcAppMessageMetadata = (target: any): SwcAppMessageSubscriberMetadata[] | undefined => {
  const constructor = target instanceof Function ? target : target.constructor;
  return ReflectUtils.getOwnMetadata(SUBSCRIBE_SWC_APP_MESSAGE_METADATA_KEY, constructor);
};

// ─────────────────────────────────────────────────────────────────────────────
// MessageSubscribeLifeCycler
// NOTE: 실제 구독 로직은 SwcAppMixin._connected 에서 처리된다.
// ─────────────────────────────────────────────────────────────────────────────
import { ElementDefineLifeCycler } from '../types';

export class MessageSubscribeLifeCycler implements ElementDefineLifeCycler {
  onConnected(_helperHostSet: HelperHostSet): void {
    // 실제 구독은 SwcAppMixin._connected 에서 처리
  }

  /** SwcAppMixin 이 구독 대상 메타를 꺼낼 때 사용 */
  getMetadata(helperHostSet: HelperHostSet): SwcAppMessageSubscriberMetadata[] | undefined {
    return getSubscribeSwcAppMessageMetadata(helperHostSet.$this);
  }
}
