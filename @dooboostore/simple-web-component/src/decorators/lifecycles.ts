import { ReflectUtils } from '@dooboostore/core';
import { ON_ATTRIBUTE_CHANGED_METADATA_KEY } from './changedAttribute';
import { SET_ATTRIBUTE_METADATA_KEY } from './setAttribute';

export const ON_BEFORE_CONNECTED_METADATA_KEY = Symbol('simple-web-component:on-before-connected');
export const ON_AFTER_CONNECTED_METADATA_KEY = Symbol('simple-web-component:on-after-connected');
export const ON_BEFORE_DISCONNECTED_METADATA_KEY = Symbol('simple-web-component:on-before-disconnected');
export const ON_AFTER_DISCONNECTED_METADATA_KEY = Symbol('simple-web-component:on-after-disconnected');
export const ON_BEFORE_ADOPTED_METADATA_KEY = Symbol('simple-web-component:on-before-adopted');
export const ON_AFTER_ADOPTED_METADATA_KEY = Symbol('simple-web-component:on-after-adopted');
export const ON_ADD_EVENT_LISTENER_METADATA_KEY = Symbol('simple-web-component:on-add-event-listener');

export const ATTRIBUTE_CHANGED_WILDCARD = '*';

function createLifecycleDecorator(metadataKey: symbol): MethodDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    const constructor = target.constructor;
    let list = ReflectUtils.getOwnMetadata(metadataKey, constructor) as (string | symbol)[];
    if (!list) {
      list = [];
      ReflectUtils.defineMetadata(metadataKey, list, constructor);
    }
    list.push(propertyKey);
  };
}

export const onBeforeConnected = createLifecycleDecorator(ON_BEFORE_CONNECTED_METADATA_KEY);
export const onAfterConnected = createLifecycleDecorator(ON_AFTER_CONNECTED_METADATA_KEY);
export const onConnected = onAfterConnected;

export const onBeforeDisconnected = createLifecycleDecorator(ON_BEFORE_DISCONNECTED_METADATA_KEY);
export const onAfterDisconnected = createLifecycleDecorator(ON_AFTER_DISCONNECTED_METADATA_KEY);
export const onDisconnected = onAfterDisconnected;

export const onBeforeAdopted = createLifecycleDecorator(ON_BEFORE_ADOPTED_METADATA_KEY);
export const onAfterAdopted = createLifecycleDecorator(ON_AFTER_ADOPTED_METADATA_KEY);
export const onAdopted = onAfterAdopted;

export const onAddEventListener = createLifecycleDecorator(ON_ADD_EVENT_LISTENER_METADATA_KEY);

/**
 * 프로토타입 체인을 순회하며 모든 라이프사이클 메서드를 수집합니다.
 */
export const findAllLifecycleMetadata = <T = (string | symbol)[]>(target: any, metadataKey: symbol): T | undefined => {
  const results = ReflectUtils.findAllMetadataFlatten(metadataKey, target);
  return results.length > 0 ? (results as unknown as T) : undefined;
};
