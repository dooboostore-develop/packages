import { ReflectUtils } from '@dooboostore/core';
import { SpecialSelector, SwcQueryOptions } from '../types';

export interface AddEventListenerBaseOptions extends EventListenerOptions {
  capture?: boolean;
  once?: boolean;
  passive?: boolean;
  stopPropagation?: boolean;
  stopImmediatePropagation?: boolean;
  preventDefault?: boolean;
  removeOnDisconnected?: boolean;
  delegate?: boolean;
}

export interface AddEventListenerMetadata {
  propertyKey: string | symbol;
  selector: string;
  type: string;
  options: AddEventListenerBaseOptions & SwcQueryOptions & { delegate?: boolean };
}

export const ADD_EVENT_LISTENER_METADATA_KEY = Symbol('simple-web-component:add-event-listener');

export function addEventListener(target: SpecialSelector, type: string, options?: AddEventListenerBaseOptions): MethodDecorator;
export function addEventListener(selector: string, type: string, options?: AddEventListenerBaseOptions & SwcQueryOptions & { delegate?: boolean }): MethodDecorator;
/**
 * @addEventListener decorator to bind events to elements.
 */
export function addEventListener(selectorOrTarget: string, type: string, options: any = {}): MethodDecorator {
  return (targetObj: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const constructor = targetObj.constructor;

    let listeners = ReflectUtils.getMetadata<AddEventListenerMetadata[]>(ADD_EVENT_LISTENER_METADATA_KEY, constructor);
    if (!listeners) {
      listeners = [];
      ReflectUtils.defineMetadata(ADD_EVENT_LISTENER_METADATA_KEY, listeners, constructor);
    }

    listeners.push({ propertyKey, selector: selectorOrTarget, type, options });
  };
}

export const getAddEventListenerMetadata = (target: any): AddEventListenerMetadata[] | undefined => {
  const constructor = target instanceof Function ? target : target.constructor;
  return ReflectUtils.getMetadata(ADD_EVENT_LISTENER_METADATA_KEY, constructor);
};
