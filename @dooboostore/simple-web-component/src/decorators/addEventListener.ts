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
  // 리스너 제거(disconnected 또는 unmount) 시 호출되는 콜백. 첫 번째 인자는 바인딩된 타겟 element, 두 번째는 이 옵션이 속한 전체 옵션 객체(Base + SwcQuery + delegate).
  removeListener?: (target: Element, optionValue: AddEventListenerBaseOptions<TEvent> & SwcQueryOptions & { delegate?: boolean }) => void;
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
 * @addEventListener(type, options?) — 셀렉터 생략 시 $this(컴포넌트 자신)로 바인딩
 */
export function addEventListener<TEvent extends Event = Event>(type: string, options?: AddEventListenerBaseOptions<TEvent> & SwcQueryOptions & { delegate?: boolean }): MethodDecorator;
/**
 * @addEventListener decorator to bind events to elements.
 */
export function addEventListener<TEvent extends Event = Event>(selectorOrType: EventListenerSelector | string, typeOrOptions?: string | (AddEventListenerBaseOptions<TEvent> & SwcQueryOptions & { delegate?: boolean }), maybeOptions?: AddEventListenerBaseOptions<TEvent> & SwcQueryOptions & { delegate?: boolean }): MethodDecorator {
  return (targetObj: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    let selector: EventListenerSelector;
    let type: string;
    let opts: any = {};

    if (typeof typeOrOptions === 'string') {
      // (selector, type[, options]) form — 기존 호환
      selector = selectorOrType as EventListenerSelector;
      type = typeOrOptions;
      opts = maybeOptions ?? {};
    } else {
      // (type[, options]) form — selector 기본값 $this
      selector = '$this';
      type = selectorOrType as string;
      opts = typeOrOptions ?? {};
    }

    const constructor = targetObj.constructor;

    let listeners = ReflectUtils.getMetadata<AddEventListenerMetadata<TEvent>[]>(ADD_EVENT_LISTENER_METADATA_KEY, constructor);
    if (!listeners) {
      listeners = [];
      ReflectUtils.defineMetadata(ADD_EVENT_LISTENER_METADATA_KEY, listeners, constructor);
    }

    listeners.push({ propertyKey, selector, type, options: opts });
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

// ─── root별 일반 헬퍼 (delegate 없음) ───

export function addEventListenerLightDom<TEvent extends Event = Event>(selector: EventListenerSelector, type: string, options?: AddEventListenerBaseOptions<TEvent>): MethodDecorator {
  return addEventListener<TEvent>(selector, type, {...options??{}, root:'light'});
}

export function addEventListenerShadowDom<TEvent extends Event = Event>(selector: EventListenerSelector, type: string, options?: AddEventListenerBaseOptions<TEvent>): MethodDecorator {
  return addEventListener<TEvent>(selector, type, {...options??{}, root:'shadow'});
}

export function addEventListenerAllDom<TEvent extends Event = Event>(selector: EventListenerSelector, type: string, options?: AddEventListenerBaseOptions<TEvent>): MethodDecorator {
  return addEventListener<TEvent>(selector, type, {...options??{}, root:'all'});
}

/**
 * @addEventListenerThis decorator - simplified version of @addEventListener for $this selector
 */
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

// --- Aliases: event... ---
export const event = addEventListener;
export const eventDelegateLightDom = addEventListenerDelegateLightDom;
export const eventDelegateShadowDom = addEventListenerDelegateShadowDom;
export const eventDelegateAllDom = addEventListenerDelegateAllDom;
export const eventDelegate = addEventListenerDelegate;
export const eventLightDom = addEventListenerLightDom;
export const eventShadowDom = addEventListenerShadowDom;
export const eventAllDom = addEventListenerAllDom;
export const eventAppHost = addEventListenerAppHost;
export const eventWindow = addEventListenerWindow;
export const eventDocument = addEventListenerDocument;
export const eventThis = addEventListenerThis;

export const getAddEventListenerMetadata = (target: any): AddEventListenerMetadata<Event>[] | undefined => {
  const constructor = target instanceof Function ? target : target.constructor;
  return ReflectUtils.getMetadata(ADD_EVENT_LISTENER_METADATA_KEY, constructor);
};
