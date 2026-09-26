import { ReflectUtils } from '@dooboostore/core';
import { SwcAppMessage, SpecialSelector, SwcQueryOptions, HelperHostSet } from '../types';

export const SUBSCRIBE_SWC_APP_MESSAGE_METADATA_KEY = Symbol.for('simple-web-component:subscribe-swc-app-message');

export interface SwcAppMessageOptions<Data = any, BeforeReturn = any, Result = any> {
  /** 메시지 수신 시 핸들러 실행 여부 게이트. Promise<boolean>도 되어 async 판정 가능. false면 스킵. */
  filter?: (message: SwcAppMessage<Data>, currentThis: any) => boolean | Promise<boolean>;
  /** filter 통과 후 핸들러 직전 훅. await되고, 리턴값은 @appMessageBeforeReturn 으로 핸들러에 주입된다. */
  before?: (message: SwcAppMessage<Data>, currentThis: any) => BeforeReturn | Promise<BeforeReturn>;
  /** 핸들러가 성공/실패해도 항상 실행되는 정리 훅. ctx로 핸들러 인자/결과/에러를 받는다. 에러는 삼키지 않고 전파. */
  finally?: (message: SwcAppMessage<Data>, currentThis: any, ctx: { args: any[]; result?: Result; error?: any }) => any | Promise<any>;
  /**
   * 늦게 연결된 경우 과거 메시지 재생 방식. 이미 연결된 구독자에게는 항상 live로 쏨.
   * - 미지정/'subject': live만. 지나간 건 못 받음 (기본값, 기존 동작)
   * - 'behavior': 마지막 1개 재생
   * - 'replay': 버퍼 전체 시간순 재생
   */
  subject?: 'subject' | 'behavior' | 'replay';
}

export interface SwcAppMessageSubscriberMetadata extends SwcAppMessageOptions {
  propertyKey: string | symbol;
  messageType?: string;
}

function createSubscribeSwcAppMessage(options?: SwcAppMessageOptions, messageType?: string): MethodDecorator {
  return (target: Object, propertyKey: string | symbol, descriptor?: PropertyDescriptor) => {
    const constructor = target.constructor;
    let list = ReflectUtils.getOwnMetadata(SUBSCRIBE_SWC_APP_MESSAGE_METADATA_KEY, constructor) as SwcAppMessageSubscriberMetadata[];
    if (!list) {
      list = [];
      ReflectUtils.defineMetadata(SUBSCRIBE_SWC_APP_MESSAGE_METADATA_KEY, list, constructor);
    }
    list.push({ propertyKey, messageType, filter: options?.filter, before: options?.before, finally: options?.finally, subject: options?.subject });
    
    return descriptor;
  };
}

// 오버로드 시그니처 - 직접 사용 (괄호 없음)
export function subscribeSwcAppMessage(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor | void;
// 오버로드 시그니처 - 함수 호출 (괄호 있음) - 메시지 타입만
export function subscribeSwcAppMessage(messageType: string): MethodDecorator;
// 오버로드 시그니처 - 함수 호출 (괄호 있음) - 옵션만
export function subscribeSwcAppMessage<Data = any, BeforeReturn = any, Result = any>(options: SwcAppMessageOptions<NoInfer<Data>, NoInfer<BeforeReturn>, NoInfer<Result>>): MethodDecorator;
// 오버로드 시그니처 - 함수 호출 (괄호 있음) - 메시지 타입 + 옵션
export function subscribeSwcAppMessage<Data = any, BeforeReturn = any, Result = any>(messageType: string, options: SwcAppMessageOptions<NoInfer<Data>, NoInfer<BeforeReturn>, NoInfer<Result>>): MethodDecorator;

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
