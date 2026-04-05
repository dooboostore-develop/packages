import { ReflectUtils } from '@dooboostore/core';
import { SwcAppMessage } from '../types';
import { SwcUtils } from '../utils/Utils';

export const PUBLISH_SWC_APP_MESSAGE_METADATA_KEY = Symbol.for('simple-web-component:publish-swc-app-message');

export interface PublishSwcAppMessageMetadata {
  propertyKey: string | symbol;
  messageType?: string;
}

export interface PublishSwcAppMessageOptions {
  messageType?: string;
}

function createPublishSwcAppMessage(messageType?: string): MethodDecorator {
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
      
      // Promise 체크
      if (result instanceof Promise) {
        result.then((data) => {
          // appHost 찾아서 메시지 발행
          const appHost = SwcUtils.getAppHost(this as HTMLElement);
          if (appHost) {
            appHost.publishMessage({
              publisher: this,
              data,
              type: messageType
            });
          }
        }).catch((err) => {
          console.warn('publishSwcAppMessage async error:', err);
        });
      } else {
        // 동기 호출 - 바로 메시지 발행
        const appHost = SwcUtils.getAppHost(this as HTMLElement);
        if (appHost) {
          appHost.publishMessage({
            publisher: this,
            data: result,
            type: messageType
          });
        }
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

export function publishSwcAppMessage(targetOrMessageType?: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor): any {
  // 직접 데코레이터로 사용된 경우 (괄호 없음): @publishSwcAppMessage
  if (targetOrMessageType && typeof targetOrMessageType === 'object' && 
      propertyKey && (typeof propertyKey === 'string' || typeof propertyKey === 'symbol') &&
      descriptor) {
    const target = targetOrMessageType;
    return createPublishSwcAppMessage()(target, propertyKey, descriptor);
  }

  // 함수로 호출된 경우 (괄호 있음): @publishSwcAppMessage() / @publishSwcAppMessage('messageType')
  let messageType: string | undefined;

  if (typeof targetOrMessageType === 'string') {
    // 메시지 타입 전달: @publishSwcAppMessage('messageType')
    messageType = targetOrMessageType;
  }

  return createPublishSwcAppMessage(messageType);
}

// Helper function to retrieve publish message metadata
export const getPublishSwcAppMessageMetadata = (target: any): PublishSwcAppMessageMetadata[] | undefined => {
  const constructor = target instanceof Function ? target : target.constructor;
  return ReflectUtils.getOwnMetadata(PUBLISH_SWC_APP_MESSAGE_METADATA_KEY, constructor);
};
