import { ReflectUtils } from '@dooboostore/core';
import { SpecialSelector, SwcQueryOptions, HelperHostSet } from '../types';

export interface AddEventListenerBaseOptions<TEvent extends Event = Event> extends EventListenerOptions {
  capture?: boolean;
  once?: boolean;
  passive?: boolean;
  stopPropagation?: boolean;
  stopImmediatePropagation?: boolean;
  preventDefault?: boolean;
  // removeOnDisconnected?: boolean;
  delegate?: boolean;
  filter?: (target: Event | CustomEvent, meta:{currentThis: any, helper: HelperHostSet}) => boolean;
  // RxJS operator options
  debounceTime?: number;
  throttleTime?: number;
  distinctUntilChanged?: boolean | ((prev: TEvent, curr: TEvent) => boolean);
}

export type EventListenerSelector = string | ((currentThis: any, helper: HelperHostSet) => NodeList | Element | Element[] | null);

export interface AddEventListenerMetadata<TEvent extends Event = Event> {
  propertyKey: string | symbol;
  selector: EventListenerSelector;
  type: string;
  options: AddEventListenerBaseOptions<TEvent> & SwcQueryOptions & { delegate?: boolean };
}

export const ADD_EVENT_LISTENER_METADATA_KEY = Symbol.for('simple-web-component:add-event-listener');

export function addEventListener<TEvent extends Event = Event>(target: SpecialSelector, type: string, options?: AddEventListenerBaseOptions<TEvent>): MethodDecorator;
export function addEventListener<TEvent extends Event = Event>(selector: EventListenerSelector, type: string, options?: AddEventListenerBaseOptions<TEvent> & SwcQueryOptions & { delegate?: boolean }): MethodDecorator;
/**
 * @addEventListener decorator to bind events to elements.
 */
export function addEventListener<TEvent extends Event = Event>(selectorOrTarget: EventListenerSelector, type: string, options: any = {}): MethodDecorator {
  return (targetObj: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const constructor = targetObj.constructor;

    let listeners = ReflectUtils.getMetadata<AddEventListenerMetadata<TEvent>[]>(ADD_EVENT_LISTENER_METADATA_KEY, constructor);
    if (!listeners) {
      listeners = [];
      ReflectUtils.defineMetadata(ADD_EVENT_LISTENER_METADATA_KEY, listeners, constructor);
    }

    listeners.push({ propertyKey, selector: selectorOrTarget, type, options });
  };
}


export function addEventListenerDelegateLightDom<TEvent extends Event = Event>(selector: EventListenerSelector, type: string, options?: Omit<AddEventListenerBaseOptions<TEvent>, 'delegate'>): MethodDecorator {
  return addEventListener<TEvent>(selector, type, {...options??{}, root:'light', delegate: true});
}

export function addEventListenerDelegateShadowDom<TEvent extends Event = Event>(selector: EventListenerSelector, type: string, options?: Omit<AddEventListenerBaseOptions<TEvent>, 'delegate'>): MethodDecorator {
  return addEventListener<TEvent>(selector, type, {...options??{}, root:'shadow', delegate: true});
}
export function addEventListenerDelegateAllDom<TEvent extends Event = Event>(selector: EventListenerSelector, type: string, options?: Omit<AddEventListenerBaseOptions<TEvent>, 'delegate'>): MethodDecorator {
  return addEventListener<TEvent>(selector, type, {...options??{}, root:'all', delegate: true});
}
export function addEventListenerDelegate<TEvent extends Event = Event>(selector: EventListenerSelector, type: string, options?: Omit<AddEventListenerBaseOptions<TEvent>, 'delegate'>): MethodDecorator {
  return addEventListener<TEvent>(selector, type, {...options??{}, root:'auto', delegate: true});
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
export function addEventListenerThis<TEvent extends Event = Event>(type: string, options?: AddEventListenerBaseOptions<TEvent> & SwcQueryOptions): MethodDecorator {
  return addEventListener<TEvent>('$this', type, options);
}

/**
 * @addEventListenerAppHost decorator - simplified version of @addEventListener for $appHost selector
 */
export function addEventListenerAppHost<TEvent extends Event = Event>(type: string, options?: AddEventListenerBaseOptions<TEvent> & SwcQueryOptions): MethodDecorator {
  return addEventListener<TEvent>('$appHost', type, options);
}

export function addEventListenerWindow<TEvent extends Event = Event>(type: string, options?: AddEventListenerBaseOptions<TEvent> & SwcQueryOptions): MethodDecorator {
  return addEventListener<TEvent>('$window', type, options);
}
export function addEventListenerDocument<TEvent extends Event = Event>(type: string, options?: AddEventListenerBaseOptions<TEvent> & SwcQueryOptions): MethodDecorator {
  return addEventListener<TEvent>('$document', type, options);
}

export const getAddEventListenerMetadata = (target: any): AddEventListenerMetadata<Event>[] | undefined => {
  const constructor = target instanceof Function ? target : target.constructor;
  return ReflectUtils.getMetadata(ADD_EVENT_LISTENER_METADATA_KEY, constructor);
};
