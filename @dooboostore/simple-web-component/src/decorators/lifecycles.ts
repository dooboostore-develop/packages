import { ReflectUtils } from '@dooboostore/core';

export const ON_INITIALIZE_METADATA_KEY = Symbol.for('simple-web-component:on-constructor');
export const ON_BEFORE_CONNECTED_METADATA_KEY = Symbol.for('simple-web-component:on-before-connected');
export const ON_AFTER_CONNECTED_METADATA_KEY = Symbol.for('simple-web-component:on-after-connected');
export const ON_BEFORE_DISCONNECTED_METADATA_KEY = Symbol.for('simple-web-component:on-before-disconnected');
export const ON_AFTER_DISCONNECTED_METADATA_KEY = Symbol.for('simple-web-component:on-after-disconnected');
export const ON_BEFORE_ADOPTED_METADATA_KEY = Symbol.for('simple-web-component:on-before-adopted');
export const ON_AFTER_ADOPTED_METADATA_KEY = Symbol.for('simple-web-component:on-after-adopted');
export const ON_ADD_EVENT_LISTENER_METADATA_KEY = Symbol.for('simple-web-component:on-add-event-listener');
export const ON_CONNECTED_METADATA_KEY = Symbol.for('simple-web-component');
export const ON_CONNECTED_SWC_APP_METADATA_KEY = Symbol.for('simple-web-component:on-connected-swc-app');
export const ON_CONNECTED_COMPLETED_METADATA_KEY = Symbol.for('simple-web-component:on-completed');

export const ATTRIBUTE_CHANGED_WILDCARD = '*';

export interface InnerHtmlOptions {
  ssrFirst?: boolean;
  // replaceWrap?:{ start: string, end:string},
  useShadow?: boolean;
}
export interface InnerHtmlMetadata {
  propertyKey: string | symbol;
  options: InnerHtmlOptions;
}

export interface OnConnectedOptions {
  ssrFirst?: boolean;
}
export interface OnConnectedMetadata {
  propertyKey: string | symbol;
  options: OnConnectedOptions;
}


export function onConnectedBefore(options: OnConnectedOptions): MethodDecorator;
export function onConnectedBefore(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function onConnectedBefore(arg1?: OnConnectedOptions | Object, arg2?: string | symbol, arg3?: PropertyDescriptor): MethodDecorator | void {
  const decorator = (options: OnConnectedOptions, target: Object, propertyKey: string | symbol) => {
    const constructor = target.constructor;
    let list = ReflectUtils.getMetadata<OnConnectedMetadata[]>(ON_BEFORE_CONNECTED_METADATA_KEY, constructor);
    if (!list) {
      list = [];
      ReflectUtils.defineMetadata(ON_BEFORE_CONNECTED_METADATA_KEY, list, constructor);
    }
    list.push({ propertyKey, options });
  };

  if (arg2) {
    return decorator({}, arg1!, arg2);
  }

  return (target: Object, propertyKey: string | symbol) => {
    decorator((arg1 as OnConnectedOptions) || {}, target, propertyKey);
  };
}

export function onConnectedAfter(options: OnConnectedOptions): MethodDecorator;
export function onConnectedAfter(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function onConnectedAfter(arg1?: OnConnectedOptions | Object, arg2?: string | symbol, arg3?: PropertyDescriptor): MethodDecorator | void {
  const decorator = (options: OnConnectedOptions, target: Object, propertyKey: string | symbol) => {
    const constructor = target.constructor;
    let list = ReflectUtils.getMetadata<OnConnectedMetadata[]>(ON_AFTER_CONNECTED_METADATA_KEY, constructor);
    if (!list) {
      list = [];
      ReflectUtils.defineMetadata(ON_AFTER_CONNECTED_METADATA_KEY, list, constructor);
    }
    list.push({ propertyKey, options });
  };

  if (arg2) {
    return decorator({}, arg1!, arg2);
  }

  return (target: Object, propertyKey: string | symbol) => {
    decorator((arg1 as OnConnectedOptions) || {}, target, propertyKey);
  };
}


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

export const onInitialize = createLifecycleDecorator(ON_INITIALIZE_METADATA_KEY);
// export const onConnectedBefore = createLifecycleDecorator(ON_BEFORE_CONNECTED_METADATA_KEY);
// export const onConnectedAfter = createLifecycleDecorator(ON_AFTER_CONNECTED_METADATA_KEY);
// export const onConnected = onConnectedAfter;

export const onDisconnectedBefore = createLifecycleDecorator(ON_BEFORE_DISCONNECTED_METADATA_KEY);
export const onDisconnectedAfter = createLifecycleDecorator(ON_AFTER_DISCONNECTED_METADATA_KEY);
export const onDisconnected = onDisconnectedAfter;

export const onAdoptedBefore = createLifecycleDecorator(ON_BEFORE_ADOPTED_METADATA_KEY);
export const onAdoptedAfter = createLifecycleDecorator(ON_AFTER_ADOPTED_METADATA_KEY);
export const onAdopted = onAdoptedAfter;

export const onAddEventListener = createLifecycleDecorator(ON_ADD_EVENT_LISTENER_METADATA_KEY);

export const onConnectedSwcApp = createLifecycleDecorator(ON_CONNECTED_SWC_APP_METADATA_KEY);
export const onConnectedCompleted = createLifecycleDecorator(ON_CONNECTED_COMPLETED_METADATA_KEY);

/**
 * @onConnectedInnerHtml decorator to define the initial HTML content when connected.
 */
export function onConnected(options: InnerHtmlOptions): MethodDecorator;
export function onConnected(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function onConnected(arg1?: InnerHtmlOptions | Object, arg2?: string | symbol, arg3?: PropertyDescriptor): MethodDecorator | void {
  const decorator = (options: InnerHtmlOptions, target: Object, propertyKey: string | symbol) => {
    const constructor = target.constructor;
    let list = ReflectUtils.getMetadata<InnerHtmlMetadata[]>(ON_CONNECTED_METADATA_KEY, constructor);
    if (!list) {
      list = [];
      ReflectUtils.defineMetadata(ON_CONNECTED_METADATA_KEY, list, constructor);
    }
    list.push({ propertyKey, options });
  };

  if (arg2) {
    return decorator({}, arg1!, arg2);
  }

  return (target: Object, propertyKey: string | symbol) => {
    decorator((arg1 as InnerHtmlOptions) || {}, target, propertyKey);
  };
}

/**
 * 프로토타입 체인을 순회하며 모든 라이프사이클 메서드를 수집합니다.
 */
// export const findAllLifecycleMetadata = <T = (string | symbol)[]>(target: any, metadataKey: symbol): T | undefined => {
export const findAllLifecycleMetadata = (target: any, metadataKey: symbol): (string | symbol)[] => {
  const results = ReflectUtils.findAllMetadataFlatten(metadataKey, target)??[];
  return results;
};

export const findAllOnConnectedMetadata = (target: any): InnerHtmlMetadata[] => {
  const constructor = target instanceof Function ? target : target.constructor;
  return ReflectUtils.getMetadata(ON_CONNECTED_METADATA_KEY, constructor) ?? [];
};
export const findAllOnConnectedBeforeMetadata = (target: any): OnConnectedMetadata[] => {
  const constructor = target instanceof Function ? target : target.constructor;
  return ReflectUtils.getMetadata(ON_BEFORE_CONNECTED_METADATA_KEY, constructor) ?? [];
};
export const findAllOnConnectedAfterMetadata = (target: any): OnConnectedMetadata[] => {
  const constructor = target instanceof Function ? target : target.constructor;
  return ReflectUtils.getMetadata(ON_AFTER_CONNECTED_METADATA_KEY, constructor) ?? [];
};
