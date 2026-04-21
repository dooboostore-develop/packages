import {ReflectUtils} from '@dooboostore/core';
import {SwcUtils} from '../utils/Utils';

export const PUBLISH_SWC_APP_MESSAGE_METADATA_KEY = Symbol.for('simple-web-component:publish-swc-app-message');

export interface PublishSwcAppMessageMetadata {
  propertyKey: string | symbol;
  messageType?: string;
}

export interface PublishSwcAppMessageOptions {
  messageType?: string;
  /**
   * Custom key to extract value from return object.
   * If not provided, uses PUBLISH_SWC_APP_MESSAGE_METADATA_KEY by default.
   * Useful when multiple @publishSwcAppMessage decorators are on the same method.
   * 
   * Example:
   * @publishSwcAppMessage('event1', { valueKey: 'detail1' })
   * @publishSwcAppMessage('event2', { valueKey: 'detail2' })
   * myMethod() {
   *   return {
   *     detail1: { type: 'event1', data: 'value1' },
   *     detail2: { type: 'event2', data: 'value2' }
   *   };
   * }
   */
  valueKey?: symbol | string;
}

function createPublishSwcAppMessage(messageType?: string, options?: PublishSwcAppMessageOptions): MethodDecorator {
  return (target: Object, propertyKey: string | symbol, descriptor?: PropertyDescriptor) => {
    const constructor = target.constructor;
    let list = ReflectUtils.getOwnMetadata(PUBLISH_SWC_APP_MESSAGE_METADATA_KEY, constructor) as PublishSwcAppMessageMetadata[];
    if (!list) {
      list = [];
      ReflectUtils.defineMetadata(PUBLISH_SWC_APP_MESSAGE_METADATA_KEY, list, constructor);
    }
    list.push({ propertyKey, messageType });
    
    if (!descriptor) {
      return descriptor;
    }

    // 메서드 래핑 - 원본 메서드의 반환값을 캡처하여 메시지 발행
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: any[]) {
      // 원본 메서드 실행
      const result = originalMethod.apply(this, args);

      /**
       * Extract value for this decorator from method return value
       * 
       * If return value is an object with this decorator's key,
       * use that value. Otherwise use the entire return value.
       * 
       * Uses valueKey from options if provided, otherwise uses PUBLISH_SWC_APP_MESSAGE_METADATA_KEY.
       */
      const extractValue = (v: any) => {
        const keyToUse = options?.valueKey ?? PUBLISH_SWC_APP_MESSAGE_METADATA_KEY;
        if (v && typeof v === 'object' && keyToUse in v) {
          return v[keyToUse];
        }
        return v;
      };

      const publishMessage = (data: any) => {
        // appHost 찾아서 메시지 발행
        const appHost = SwcUtils.getAppHost(this as HTMLElement);
        if (appHost) {
          appHost.publishMessage({
            publisher: this,
            data,
            type: messageType
          });
        }
      };
      
      // Promise 체크
      if (result instanceof Promise) {
        result.then((data) => {
          const extracted = extractValue(data);
          publishMessage(extracted);
        }).catch((err) => {
          console.warn('publishSwcAppMessage async error:', err);
        });
      } else {
        // 동기 호출 - 바로 메시지 발행
        const extracted = extractValue(result);
        publishMessage(extracted);
      }
      
      return result;
    };

    return descriptor;
  };
}

// 오버로드 시그니처 - 직접 사용 (괄호 없음)
export function publishSwcAppMessage(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor | void;
// 오버로드 시그니처 - 함수 호출 (괄호 있음)
export function publishSwcAppMessage(): MethodDecorator;
export function publishSwcAppMessage(messageType: string): MethodDecorator;
export function publishSwcAppMessage(messageType: string, options: PublishSwcAppMessageOptions): MethodDecorator;
export function publishSwcAppMessage(options: PublishSwcAppMessageOptions): MethodDecorator;

export function publishSwcAppMessage(targetOrMessageTypeOrOptions?: any, propertyKeyOrOptions?: string | symbol | PublishSwcAppMessageOptions, descriptor?: PropertyDescriptor): any {
  // 직접 데코레이터로 사용된 경우 (괄호 없음): @publishSwcAppMessage
  if (targetOrMessageTypeOrOptions && typeof targetOrMessageTypeOrOptions === 'object' && 
      propertyKeyOrOptions && (typeof propertyKeyOrOptions === 'string' || typeof propertyKeyOrOptions === 'symbol') &&
      descriptor) {
    const target = targetOrMessageTypeOrOptions;
    return createPublishSwcAppMessage()(target, propertyKeyOrOptions, descriptor);
  }

  // 함수로 호출된 경우 (괄호 있음): @publishSwcAppMessage() / @publishSwcAppMessage('messageType') / @publishSwcAppMessage({...})
  let messageType: string | undefined;
  let options: PublishSwcAppMessageOptions | undefined;

  if (typeof targetOrMessageTypeOrOptions === 'string') {
    // 메시지 타입 전달: @publishSwcAppMessage('messageType')
    messageType = targetOrMessageTypeOrOptions;
    if (typeof propertyKeyOrOptions === 'object' && propertyKeyOrOptions !== null) {
      options = propertyKeyOrOptions as PublishSwcAppMessageOptions;
    }
  } else if (typeof targetOrMessageTypeOrOptions === 'object' && targetOrMessageTypeOrOptions !== null) {
    // 옵션 객체 전달: @publishSwcAppMessage({...})
    options = targetOrMessageTypeOrOptions as PublishSwcAppMessageOptions;
    messageType = options.messageType;
  }

  return createPublishSwcAppMessage(messageType, options);
}

// --- Aliases: publish... ---
export const publishMessage = publishSwcAppMessage;

// Helper function to retrieve publish message metadata
export const getPublishSwcAppMessageMetadata = (target: any): PublishSwcAppMessageMetadata[] | undefined => {
  const constructor = target instanceof Function ? target : target.constructor;
  return ReflectUtils.getOwnMetadata(PUBLISH_SWC_APP_MESSAGE_METADATA_KEY, constructor);
};
