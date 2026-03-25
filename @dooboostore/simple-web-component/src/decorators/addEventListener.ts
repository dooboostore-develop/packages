import { ReflectUtils } from '@dooboostore/core/reflect/ReflectUtils';

export interface AddEventListenerOptions extends EventListenerOptions {
  root?: 'light' | 'shadow' | 'all' | 'auto';
  capture?: boolean;
  once?: boolean;
  passive?: boolean;
  stopPropagation?: boolean;
  stopImmediatePropagation?: boolean;
  preventDefault?: boolean;
  delegate?: boolean;
}

export interface AddEventListenerMetadata {
  selector: string;
  type: string;
  options: AddEventListenerOptions;
  propertyKey: string | symbol;
}

export const ADD_EVENT_LISTENER_METADATA_KEY = Symbol('simple-web-component:add-event-listener');

/**
 * @addEventListener decorator to bind events to elements.
 * Usage: @addEventListener('.btn', 'click') onClick() { ... }
 * Usage: @addEventListener('', 'scroll', { passive: true }) onScroll() { ... }
 */
export function addEventListener(selector: string, type: string, options: AddEventListenerOptions = {}): MethodDecorator {
  return (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const constructor = target.constructor;

    let listeners = ReflectUtils.getMetadata<AddEventListenerMetadata[]>(ADD_EVENT_LISTENER_METADATA_KEY, constructor);
    if (!listeners) {
      listeners = [];
      ReflectUtils.defineMetadata(ADD_EVENT_LISTENER_METADATA_KEY, listeners, constructor);
    }
    listeners.push({ selector, type, options, propertyKey });
  };
}

export const getAddEventListenerMetadata = (target: any): AddEventListenerMetadata[] | undefined => {
  const constructor = target instanceof Function ? target : target.constructor;
  return ReflectUtils.getMetadata(ADD_EVENT_LISTENER_METADATA_KEY, constructor);
};
