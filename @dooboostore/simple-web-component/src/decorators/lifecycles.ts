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
  order?: number;
}
export interface OnConnectedMetadata {
  propertyKey: string | symbol;
  options: OnConnectedOptions;
}

export interface LifecycleOptions {
  order?: number;
}
export interface LifecycleMetadata {
  propertyKey: string | symbol;
  order?: number;
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


function createLifecycleDecorator(metadataKey: symbol): ((options?: LifecycleOptions) => MethodDecorator) & MethodDecorator {
  const decorator = (options?: LifecycleOptions): MethodDecorator => {
    return (target: Object, propertyKey: string | symbol) => {
      const constructor = target.constructor;
      let list = ReflectUtils.getOwnMetadata(metadataKey, constructor) as LifecycleMetadata[];
      if (!list) {
        list = [];
        ReflectUtils.defineMetadata(metadataKey, list, constructor);
      }
      list.push({ propertyKey, order: options?.order ?? 0 });
    };
  };

  // Support both @decorator and @decorator() syntax
  return Object.assign(
    (target: Object, propertyKey: string | symbol) => {
      const constructor = target.constructor;
      let list = ReflectUtils.getOwnMetadata(metadataKey, constructor) as LifecycleMetadata[];
      if (!list) {
        list = [];
        ReflectUtils.defineMetadata(metadataKey, list, constructor);
      }
      list.push({ propertyKey, order: 0 });
    },
    { __isDecorator: true, __decorator: decorator }
  ) as any;
}

// Helper to handle both @decorator and @decorator() syntax
function createLifecycleDecoratorWithOptions(metadataKey: symbol) {
  return function(optionOrTarget?: LifecycleOptions | Object, propertyKey?: string | symbol): MethodDecorator | void {
    if (propertyKey) {
      // Direct decorator usage: @decorator
      const constructor = (optionOrTarget as Object).constructor;
      let list = ReflectUtils.getOwnMetadata(metadataKey, constructor) as LifecycleMetadata[];
      if (!list) {
        list = [];
        ReflectUtils.defineMetadata(metadataKey, list, constructor);
      }
      list.push({ propertyKey, order: 0 });
      return;
    }

    // Decorator with options: @decorator({ order: 1 })
    return (target: Object, propertyKey: string | symbol) => {
      const constructor = target.constructor;
      let list = ReflectUtils.getOwnMetadata(metadataKey, constructor) as LifecycleMetadata[];
      if (!list) {
        list = [];
        ReflectUtils.defineMetadata(metadataKey, list, constructor);
      }
      list.push({ propertyKey, order: (optionOrTarget as LifecycleOptions)?.order ?? 0 });
    };
  };
}

export function onInitialize(options?: LifecycleOptions): MethodDecorator;
export function onInitialize(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function onInitialize(optionOrTarget?: LifecycleOptions | Object, propertyKey?: string | symbol): MethodDecorator | void {
  return createLifecycleDecoratorWithOptions(ON_INITIALIZE_METADATA_KEY)(optionOrTarget, propertyKey);
}

export function onDisconnectedBefore(options?: LifecycleOptions): MethodDecorator;
export function onDisconnectedBefore(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function onDisconnectedBefore(optionOrTarget?: LifecycleOptions | Object, propertyKey?: string | symbol): MethodDecorator | void {
  return createLifecycleDecoratorWithOptions(ON_BEFORE_DISCONNECTED_METADATA_KEY)(optionOrTarget, propertyKey);
}

export function onDisconnectedAfter(options?: LifecycleOptions): MethodDecorator;
export function onDisconnectedAfter(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function onDisconnectedAfter(optionOrTarget?: LifecycleOptions | Object, propertyKey?: string | symbol): MethodDecorator | void {
  return createLifecycleDecoratorWithOptions(ON_AFTER_DISCONNECTED_METADATA_KEY)(optionOrTarget, propertyKey);
}

export const onDisconnected = onDisconnectedAfter;

export function onAdoptedBefore(options?: LifecycleOptions): MethodDecorator;
export function onAdoptedBefore(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function onAdoptedBefore(optionOrTarget?: LifecycleOptions | Object, propertyKey?: string | symbol): MethodDecorator | void {
  return createLifecycleDecoratorWithOptions(ON_BEFORE_ADOPTED_METADATA_KEY)(optionOrTarget, propertyKey);
}

export function onAdoptedAfter(options?: LifecycleOptions): MethodDecorator;
export function onAdoptedAfter(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function onAdoptedAfter(optionOrTarget?: LifecycleOptions | Object, propertyKey?: string | symbol): MethodDecorator | void {
  return createLifecycleDecoratorWithOptions(ON_AFTER_ADOPTED_METADATA_KEY)(optionOrTarget, propertyKey);
}

export const onAdopted = onAdoptedAfter;

export function onConnectedSwcApp(options?: LifecycleOptions): MethodDecorator;
export function onConnectedSwcApp(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function onConnectedSwcApp(optionOrTarget?: LifecycleOptions | Object, propertyKey?: string | symbol): MethodDecorator | void {
  return createLifecycleDecoratorWithOptions(ON_CONNECTED_SWC_APP_METADATA_KEY)(optionOrTarget, propertyKey);
}

export function onConnectedCompleted(options?: LifecycleOptions): MethodDecorator;
export function onConnectedCompleted(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function onConnectedCompleted(optionOrTarget?: LifecycleOptions | Object, propertyKey?: string | symbol): MethodDecorator | void {
  return createLifecycleDecoratorWithOptions(ON_CONNECTED_COMPLETED_METADATA_KEY)(optionOrTarget, propertyKey);
}





const decorator = (options: InnerHtmlOptions, target: Object, propertyKey: string | symbol) => {
  const constructor = target.constructor;
  let list = ReflectUtils.getMetadata<InnerHtmlMetadata[]>(ON_CONNECTED_METADATA_KEY, constructor);
  if (!list) {
    list = [];
    ReflectUtils.defineMetadata(ON_CONNECTED_METADATA_KEY, list, constructor);
  }
  list.push({ propertyKey, options });
};

export function onConnectedShadow(options: Omit<InnerHtmlOptions, 'useShadow'>): MethodDecorator; // 파라미터있음
export function onConnectedShadow(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void; // 파라미터없음
export function onConnectedShadow(optionOrTarget: Omit<InnerHtmlOptions, 'useShadow'> | Object, propertyKey?: string | symbol, arg3?: PropertyDescriptor): MethodDecorator | void {
  if (propertyKey) { // no parameter option  @decorator
    return decorator({useShadow: true}, optionOrTarget!, propertyKey);
  }
  // parameter option @decorator()
  return (target: Object, propertyKey: string | symbol) => {
    decorator({...optionOrTarget??{}, useShadow: true}, target, propertyKey);
  };
}

export function onConnectedLight(options: Omit<InnerHtmlOptions, 'useShadow'>): MethodDecorator; // 파라미터있음
export function onConnectedLight(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void; // 파라미터없음
export function onConnectedLight(optionOrTarget: Omit<InnerHtmlOptions, 'useShadow'> | Object, propertyKey?: string | symbol, arg3?: PropertyDescriptor): MethodDecorator | void {
  if (propertyKey) { // no parameter option  @decorator
    return decorator({useShadow: false}, optionOrTarget!, propertyKey);
  }
  // parameter option @decorator()
  return (target: Object, propertyKey: string | symbol) => {
    decorator({...optionOrTarget??{}, useShadow: false}, target, propertyKey);
  };
}
export function onConnected(options: InnerHtmlOptions): MethodDecorator;
export function onConnected(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function onConnected(optionOrTarget: InnerHtmlOptions | Object, propertyKey?: string | symbol, arg3?: PropertyDescriptor): MethodDecorator | void {
  if (propertyKey) { // no parameter option  @decorator
    return decorator({}, optionOrTarget!, propertyKey);
  }
  // parameter option @decorator()
  return (target: Object, propertyKey: string | symbol) => {
    decorator((optionOrTarget as InnerHtmlOptions) || {}, target, propertyKey);
  };
}

/**
 * 프로토타입 체인을 순회하며 모든 라이프사이클 메서드를 수집합니다.
 */
export const findAllLifecycleMetadata = (target: any, metadataKey: symbol): LifecycleMetadata[] => {
  const constructor = target instanceof Function ? target : target.constructor;
  const results = ReflectUtils.getOwnMetadata(metadataKey, constructor) as LifecycleMetadata[] ?? [];
  // Sort by order (default 0 if not specified)
  return [...results].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
};

export const findAllOnConnectedMetadata = (target: any): InnerHtmlMetadata[] => {
  const constructor = target instanceof Function ? target : target.constructor;
  const results = ReflectUtils.getMetadata(ON_CONNECTED_METADATA_KEY, constructor) ?? [];
  // Sort by order (default 0 if not specified)
  return [...results].sort((a, b) => {
    const orderA = (a.options as any)?.order ?? 0;
    const orderB = (b.options as any)?.order ?? 0;
    return orderA - orderB;
  });
};

export const findAllOnConnectedBeforeMetadata = (target: any): OnConnectedMetadata[] => {
  const constructor = target instanceof Function ? target : target.constructor;
  const results = ReflectUtils.getMetadata(ON_BEFORE_CONNECTED_METADATA_KEY, constructor) ?? [];
  // Sort by order
  return [...results].sort((a, b) => (a.options?.order ?? 0) - (b.options?.order ?? 0));
};

export const findAllOnConnectedAfterMetadata = (target: any): OnConnectedMetadata[] => {
  const constructor = target instanceof Function ? target : target.constructor;
  const results = ReflectUtils.getMetadata(ON_AFTER_CONNECTED_METADATA_KEY, constructor) ?? [];
  // Sort by order
  return [...results].sort((a, b) => (a.options?.order ?? 0) - (b.options?.order ?? 0));
};
