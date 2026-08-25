import { ReflectUtils } from '@dooboostore/core';
import { SpecialSelector, SwcQueryOptions, HelperHostSet, SwcFnSelector, SwcSelector } from '../types';

export interface AddEventListenerBaseOptions<TEvent extends Event = Event> extends EventListenerOptions {
  capture?: boolean;
  once?: boolean;
  passive?: boolean;
  stopPropagation?: boolean;
  stopImmediatePropagation?: boolean;
  preventDefault?: boolean;
  // removeOnDisconnected?: boolean;
  // delegate는 문자열 셀렉터 전용 → AddEventListenerQueryOptions에만 존재
  filter?: (target: Event | CustomEvent, meta:{currentThis: any, helper: HelperHostSet}) => boolean;
  // 리스너 제거(disconnected 또는 unmount) 시 호출되는 콜백. 첫 번째 인자는 바인딩된 타겟 element, 두 번째는 이 옵션이 속한 전체 옵션 객체(Base + SwcQuery + delegate).
  removeListener?: (target: Element, optionValue: AddEventListenerQueryOptions<TEvent>) => void;
  // RxJS operator options
  debounceTime?: number;
  throttleTime?: number;
  distinctUntilChanged?: boolean | ((prev: TEvent, curr: TEvent) => boolean);
}

export type EventListenerFnSelector = SwcFnSelector;
export type EventListenerSelector = SwcSelector;

export interface AddEventListenerMetadata<TEvent extends Event = Event> {
  propertyKey: string | symbol;
  selector: EventListenerSelector;
  type: string;
  options: AddEventListenerQueryOptions<TEvent>;
}

export const ADD_EVENT_LISTENER_METADATA_KEY = Symbol.for('simple-web-component:add-event-listener');

// root + delegate 허용 — 문자열 셀렉터는 컴포넌트 DOM 트리 안에서 탐색/델리게이션하므로 의미 있음
export type AddEventListenerQueryOptions<TEvent extends Event = Event> = AddEventListenerBaseOptions<TEvent> & SwcQueryOptions & { delegate?: boolean | 'this' | 'mutation' };
// root·delegate 비허용 — 함수 셀렉터는 이미 요소를 직접 반환하므로 root·delegate가 무의미함
export type AddEventListenerNonQueryOptions<TEvent extends Event = Event> = AddEventListenerBaseOptions<TEvent>;

// 셀렉터 종류에 따라 옵션 타입을 분기
export type AddEventListenerOptionsOf<S extends EventListenerSelector, TEvent extends Event = Event> =
  S extends string ? AddEventListenerQueryOptions<TEvent> : AddEventListenerNonQueryOptions<TEvent>;

export function addEventListener<TEvent extends Event = Event>(target: SpecialSelector, type: string, options?: AddEventListenerQueryOptions<TEvent>): MethodDecorator;
export function addEventListener<TEvent extends Event = Event>(selector: string, type: string, options?: AddEventListenerQueryOptions<TEvent>): MethodDecorator;
export function addEventListener<TEvent extends Event = Event>(selector: EventListenerFnSelector, type: string, options?: AddEventListenerNonQueryOptions<TEvent>): MethodDecorator;
/**
 * @addEventListener(type, options?) — 셀렉터 생략 시 $this(컴포넌트 자신)로 바인딩
 */
export function addEventListener<TEvent extends Event = Event>(type: string, options?: AddEventListenerQueryOptions<TEvent>): MethodDecorator;
/**
 * @addEventListener decorator to bind events to elements.
 */
export function addEventListener<TEvent extends Event = Event>(selectorOrType: EventListenerSelector | string, typeOrOptions?: string | AddEventListenerQueryOptions<TEvent>, maybeOptions?: AddEventListenerQueryOptions<TEvent>): MethodDecorator {
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


export function addEventListenerDelegateLight<TEvent extends Event = Event>(selector: string, type: string, options?: Omit<AddEventListenerQueryOptions<TEvent>, 'delegate'>): MethodDecorator {
  return addEventListener<TEvent>(selector, type, {...options??{}, root:'light', delegate: true});
}

export function addEventListenerDelegateShadow<TEvent extends Event = Event>(selector: string, type: string, options?: Omit<AddEventListenerQueryOptions<TEvent>, 'delegate'>): MethodDecorator {
  return addEventListener<TEvent>(selector, type, {...options??{}, root:'shadow', delegate: true});
}
export function addEventListenerDelegateAll<TEvent extends Event = Event>(selector: string, type: string, options?: Omit<AddEventListenerQueryOptions<TEvent>, 'delegate'>): MethodDecorator {
  return addEventListener<TEvent>(selector, type, {...options??{}, root:'all', delegate: true});
}
export function addEventListenerDelegate<TEvent extends Event = Event>(selector: string, type: string, options?: Omit<AddEventListenerQueryOptions<TEvent>, 'delegate'>): MethodDecorator {
  return addEventListener<TEvent>(selector, type, {...options??{}, root:'auto', delegate: true});
}

// ─── root별 일반 헬퍼 (delegate 없음, 문자열 셀렉터 전용) ───

export function addEventListenerLight<TEvent extends Event = Event>(selector: string, type: string, options?: AddEventListenerQueryOptions<TEvent>): MethodDecorator {
  return addEventListener<TEvent>(selector, type, {...options??{}, root:'light'});
}

export function addEventListenerShadow<TEvent extends Event = Event>(selector: string, type: string, options?: AddEventListenerQueryOptions<TEvent>): MethodDecorator {
  return addEventListener<TEvent>(selector, type, {...options??{}, root:'shadow'});
}

export function addEventListenerAll<TEvent extends Event = Event>(selector: string, type: string, options?: AddEventListenerQueryOptions<TEvent>): MethodDecorator {
  return addEventListener<TEvent>(selector, type, {...options??{}, root:'all'});
}

/**
 * @addEventListenerThis decorator - simplified version of @addEventListener for $this selector
 */
export function addEventListenerThis<TEvent extends Event = Event>(type: string, options?: AddEventListenerQueryOptions<TEvent>): MethodDecorator {
  return addEventListener<TEvent>('$this', type, options);
}

/**
 * @addEventListenerAppHost decorator - simplified version of @addEventListener for $appHost selector
 */
export function addEventListenerAppHost<TEvent extends Event = Event>(type: string, options?: AddEventListenerQueryOptions<TEvent>): MethodDecorator {
  return addEventListener<TEvent>('$appHost', type, options);
}

export function addEventListenerWindow<TEvent extends Event = Event>(type: string, options?: AddEventListenerQueryOptions<TEvent>): MethodDecorator {
  return addEventListener<TEvent>('$window', type, options);
}
export function addEventListenerDocument<TEvent extends Event = Event>(type: string, options?: AddEventListenerQueryOptions<TEvent>): MethodDecorator {
  return addEventListener<TEvent>('$document', type, options);
}

// --- Aliases: event... ---
export const event = addEventListener;
export const eventDelegateLight = addEventListenerDelegateLight;
export const eventDelegateShadow = addEventListenerDelegateShadow;
export const eventDelegateAll = addEventListenerDelegateAll;
export const eventDelegate = addEventListenerDelegate;
export const eventLight = addEventListenerLight;
export const eventShadow = addEventListenerShadow;
export const eventAll = addEventListenerAll;
export const eventAppHost = addEventListenerAppHost;
export const eventWindow = addEventListenerWindow;
export const eventDocument = addEventListenerDocument;
export const eventThis = addEventListenerThis;

export const getAddEventListenerMetadata = (target: any): AddEventListenerMetadata<Event>[] | undefined => {
  const constructor = target instanceof Function ? target : target.constructor;
  return ReflectUtils.getMetadata(ADD_EVENT_LISTENER_METADATA_KEY, constructor);
};
