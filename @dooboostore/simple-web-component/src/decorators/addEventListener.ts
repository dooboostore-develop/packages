import { ReflectUtils } from '@dooboostore/core';
import { SpecialSelector, SwcQueryOptions, HelperHostSet } from '../types';

export interface AddEventListenerBaseOptions extends EventListenerOptions {
  capture?: boolean;
  once?: boolean;
  passive?: boolean;
  stopPropagation?: boolean;
  stopImmediatePropagation?: boolean;
  preventDefault?: boolean;
  removeOnDisconnected?: boolean;
  delegate?: boolean;
  filter?: (target: Event | CustomEvent, meta:{currentThis: any, helper: HelperHostSet}) => boolean;
}

export interface AddEventListenerMetadata {
  propertyKey: string | symbol;
  selector: string;
  type: string;
  options: AddEventListenerBaseOptions & SwcQueryOptions & { delegate?: boolean };
}

export const ADD_EVENT_LISTENER_METADATA_KEY = Symbol.for('simple-web-component:add-event-listener');

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

/**
 * @addEventListenerHost decorator - simplified version of @addEventListener for :host selector
 * Usage: @addEventListenerHost('click')
 * Usage: @addEventListenerHost('click', { stopPropagation: true })
 */
export function addEventListenerHost(type: string, options?: AddEventListenerBaseOptions & SwcQueryOptions): MethodDecorator {
  return addEventListener(':host', type, options);
}

/**
 * @addEventListenerAppHost decorator - simplified version of @addEventListener for :appHost selector
 * Usage: @addEventListenerAppHost('click')
 * Usage: @addEventListenerAppHost('click', { stopPropagation: true })
 */
export function addEventListenerAppHost(type: string, options?: AddEventListenerBaseOptions & SwcQueryOptions): MethodDecorator {
  return addEventListener(':appHost', type, options);
}
