import { ReflectUtils } from '@dooboostore/core';
import { SpecialSelector, SwcQueryOptions, HelperHostSet } from '../types';

export interface AddEventListenerBaseOptions extends EventListenerOptions {
  capture?: boolean;
  once?: boolean;
  passive?: boolean;
  stopPropagation?: boolean;
  stopImmediatePropagation?: boolean;
  preventDefault?: boolean;
  // removeOnDisconnected?: boolean;
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


export function addEventListenerDelegateLightDom(selector: string, type: string, options?: Omit<AddEventListenerBaseOptions, 'delegate'>): MethodDecorator {
  return addEventListener(selector, type, {...options??{}, root:'light', delegate: true});
}

export function addEventListenerDelegateShadowDom(selector: string, type: string, options?: Omit<AddEventListenerBaseOptions, 'delegate'>): MethodDecorator {
  return addEventListener(selector, type, {...options??{}, root:'shadow', delegate: true});
}
export function addEventListenerDelegateAllDom(selector: string, type: string, options?: Omit<AddEventListenerBaseOptions, 'delegate'>): MethodDecorator {
  return addEventListener(selector, type, {...options??{}, root:'all', delegate: true});
}
export function addEventListenerDelegate(selector: string, type: string, options?: Omit<AddEventListenerBaseOptions, 'delegate'>): MethodDecorator {
  return addEventListener(selector, type, {...options??{}, root:'auto', delegate: true});
}

/**
 * @addEventListenerThis decorator - simplified version of @addEventListener for $this selector
 */

// --- Aliases: event... ---
export const event = addEventListener;
export const eventDelegateLightDom = addEventListenerDelegateLightDom;
export const eventDelegateShadowDom = addEventListenerDelegateShadowDom;
export const eventDelegateAllDom = addEventListenerDelegateAllDom;
export const eventDelegate = addEventListenerDelegate;
export function addEventListenerThis(type: string, options?: AddEventListenerBaseOptions & SwcQueryOptions): MethodDecorator {
  return addEventListener('$this', type, options);
}

/**
 * @addEventListenerAppHost decorator - simplified version of @addEventListener for $appHost selector
 */
export function addEventListenerAppHost(type: string, options?: AddEventListenerBaseOptions & SwcQueryOptions): MethodDecorator {
  return addEventListener('$appHost', type, options);
}

export function addEventListenerWindow(type: string, options?: AddEventListenerBaseOptions & SwcQueryOptions): MethodDecorator {
  return addEventListener('$window', type, options);
}
export function addEventListenerDocument(type: string, options?: AddEventListenerBaseOptions & SwcQueryOptions): MethodDecorator {
  return addEventListener('$document', type, options);
}

export const getAddEventListenerMetadata = (target: any): AddEventListenerMetadata[] | undefined => {
  const constructor = target instanceof Function ? target : target.constructor;
  return ReflectUtils.getMetadata(ADD_EVENT_LISTENER_METADATA_KEY, constructor);
};
