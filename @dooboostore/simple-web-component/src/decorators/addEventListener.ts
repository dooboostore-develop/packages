import { ReflectUtils } from '@dooboostore/core/reflect/ReflectUtils';

export interface AddEventListenerOptions extends EventListenerOptions {
  query?: string;
  type: string;
  root?: 'light' | 'shadow' | 'all' | 'auto';
  capture?: boolean;
  once?: boolean;
  passive?: boolean;
  stopPropagation?: boolean;
  stopImmediatePropagation?: boolean;
  preventDefault?: boolean;
}

export interface AddEventListenerMetadata {
  options: AddEventListenerOptions;
  propertyKey: string | symbol;
}

export const ADD_EVENT_LISTENER_METADATA_KEY = Symbol('simple-web-component:add-event-listener');

export function addEventListener(type: string, query?: string): MethodDecorator;
export function addEventListener(options: AddEventListenerOptions): MethodDecorator;
export function addEventListener(arg1: string | AddEventListenerOptions, arg2?: string): MethodDecorator {
  return (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const constructor = target.constructor;
    const options: AddEventListenerOptions = typeof arg1 === 'string' ? { type: arg1, query: arg2 } : arg1;

    let listeners = ReflectUtils.getMetadata<AddEventListenerMetadata[]>(ADD_EVENT_LISTENER_METADATA_KEY, constructor);
    if (!listeners) {
      listeners = [];
      ReflectUtils.defineMetadata(ADD_EVENT_LISTENER_METADATA_KEY, listeners, constructor);
    }
    listeners.push({ options, propertyKey });
  };
}

export const getAddEventListenerMetadata = (target: any): AddEventListenerMetadata[] | undefined => {
  const constructor = target instanceof Function ? target : target.constructor;
  return ReflectUtils.getMetadata(ADD_EVENT_LISTENER_METADATA_KEY, constructor);
};
