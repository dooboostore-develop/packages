import { ReflectUtils } from '@dooboostore/core/reflect/ReflectUtils';

export const ON_BEFORE_CONNECTED_METADATA_KEY = Symbol('simple-web-component:on-before-connected');
export const ON_AFTER_CONNECTED_METADATA_KEY = Symbol('simple-web-component:on-after-connected');
export const ON_BEFORE_DISCONNECTED_METADATA_KEY = Symbol('simple-web-component:on-before-disconnected');
export const ON_AFTER_DISCONNECTED_METADATA_KEY = Symbol('simple-web-component:on-after-disconnected');
export const ON_BEFORE_ADOPTED_METADATA_KEY = Symbol('simple-web-component:on-before-adopted');
export const ON_AFTER_ADOPTED_METADATA_KEY = Symbol('simple-web-component:on-after-adopted');
export const ON_ADD_EVENT_LISTENER_METADATA_KEY = Symbol('simple-web-component:on-add-event-listener');
export const ON_ATTRIBUTE_CHANGED_METADATA_KEY = Symbol('simple-web-component:on-attribute-changed');

export const ATTRIBUTE_CHANGED_WILDCARD = '*';

function createLifecycleDecorator(metadataKey: symbol): MethodDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    const constructor = target.constructor;
    let list = ReflectUtils.getMetadata<(string | symbol)[]>(metadataKey, constructor);
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

export function onAttributeChanged(attributeName: string | string[]): MethodDecorator;
export function onAttributeChanged(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function onAttributeChanged(arg1: string | string[] | Object, arg2?: string | symbol, arg3?: PropertyDescriptor): MethodDecorator | void {
  const decorator = (attributeName: string, target: Object, propertyKey: string | symbol) => {
    const constructor = target.constructor;
    let meta = ReflectUtils.getMetadata<Map<string, (string | symbol)[]>>(ON_ATTRIBUTE_CHANGED_METADATA_KEY, constructor);
    if (!meta) {
      meta = new Map<string, (string | symbol)[]>();
      ReflectUtils.defineMetadata(ON_ATTRIBUTE_CHANGED_METADATA_KEY, meta, constructor);
    }

    let methods = meta.get(attributeName);
    if (!methods) {
      methods = [];
      meta.set(attributeName, methods);
    }
    if (!methods.includes(propertyKey)) {
      methods.push(propertyKey);
    }
  };

  if (typeof arg1 === 'string') {
    return (target: Object, propertyKey: string | symbol) => {
      decorator(arg1, target, propertyKey);
    };
  } else if (Array.isArray(arg1)) {
    return (target: Object, propertyKey: string | symbol) => {
      arg1.forEach(name => decorator(name, target, propertyKey));
    };
  } else if (arg1 && arg2) {
    decorator(ATTRIBUTE_CHANGED_WILDCARD, arg1, arg2);
  }
}

export const getLifecycleMetadata = (target: any, metadataKey: symbol): any => {
  const constructor = target instanceof Function ? target : target.constructor;
  return ReflectUtils.getMetadata(metadataKey, constructor);
};
