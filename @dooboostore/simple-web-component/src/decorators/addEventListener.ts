import { ReflectUtils } from '@dooboostore/core';
import { SpecialSelector, SwcQueryOptions, HelperHostSet, SwcFnSelector, SwcSelector } from '../types';

export interface AddEventListenerBaseOptions<TEvent extends Event = Event, Return = any> extends EventListenerOptions {
  capture?: boolean;
  once?: boolean;
  passive?: boolean;
  stopPropagation?: boolean;
  stopImmediatePropagation?: boolean;
  preventDefault?: boolean;
  // removeOnDisconnected?: boolean;
  // delegate는 문자열 셀렉터 전용 → AddEventListenerQueryOptions에만 존재
  filter?: (target: TEvent | CustomEvent, meta:{currentThis: any, helper: HelperHostSet}) => boolean | Promise<boolean>;
  /**
   * filter 통과 후, 핸들러 호출 직전에 실행되는 훅. 이벤트/meta에 더해 핸들러에 넘어갈 args 배열을 받으며 await된다(비동기 가능).
   * 리턴값은 게이팅에 쓰이지 않는다(취소는 filter 담당).
   */
  before?: (target: TEvent | CustomEvent, meta:{currentThis: any, helper: HelperHostSet}, args: any[]) => any | Promise<any>;
  /**
   * 핸들러가 성공/실패해도 항상 실행되는 정리 훅. ctx로 핸들러 인자/결과/에러를 받는다. 에러는 삼키지 않고 전파.
   */
  finally?: (target: TEvent | CustomEvent, meta:{currentThis: any, helper: HelperHostSet}, ctx: { args: any[]; result?: Return; error?: any }) => any | Promise<any>;
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
export type AddEventListenerQueryOptions<TEvent extends Event = Event, Return = any> = AddEventListenerBaseOptions<TEvent, Return> & SwcQueryOptions & { delegate?: boolean | 'this' | 'mutation' };
// root·delegate 비허용 — 함수 셀렉터는 이미 요소를 직접 반환하므로 root·delegate가 무의미함
export type AddEventListenerNonQueryOptions<TEvent extends Event = Event> = AddEventListenerBaseOptions<TEvent>;

// 셀렉터 종류에 따라 옵션 타입을 분기
export type AddEventListenerOptionsOf<S extends EventListenerSelector, TEvent extends Event = Event> =
  S extends string ? AddEventListenerQueryOptions<TEvent> : AddEventListenerNonQueryOptions<TEvent>;

export function addEventListener<TEvent extends Event = Event>(target: SpecialSelector, type: string, options?: AddEventListenerQueryOptions<TEvent>): MethodDecorator;
export function addEventListener<TEvent extends Event = Event>(selector: string, type: string, options?: AddEventListenerQueryOptions<TEvent>): MethodDecorator;
export function addEventListener<TEvent extends Event = Event>(selector: string, type: string[], options?: AddEventListenerQueryOptions<TEvent>): MethodDecorator;
export function addEventListener<TEvent extends Event = Event>(selector: EventListenerFnSelector, type: string, options?: AddEventListenerNonQueryOptions<TEvent>): MethodDecorator;
/**
 * @addEventListener(type, options?) — 셀렉터 생략 시 $this(컴포넌트 자신)로 바인딩
 */
export function addEventListener<TEvent extends Event = Event>(type: string, options?: AddEventListenerQueryOptions<TEvent>): MethodDecorator;
export function addEventListener<TEvent extends Event = Event>(type: string[], options?: AddEventListenerQueryOptions<TEvent>): MethodDecorator;
/**
 * @addEventListener decorator to bind events to elements.
 */
export function addEventListener<TEvent extends Event = Event>(selectorOrType: EventListenerSelector | string | string[], typeOrOptions?: string | string[] | AddEventListenerQueryOptions<TEvent>, maybeOptions?: AddEventListenerQueryOptions<TEvent>): MethodDecorator {
  return (targetObj: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    let selector: EventListenerSelector;
    let types: string[];
    let opts: any = {};

    if (typeof typeOrOptions === 'string' || Array.isArray(typeOrOptions)) {
      // (selector, type|[types][, options]) form — 기존 호환
      selector = selectorOrType as EventListenerSelector;
      types = Array.isArray(typeOrOptions) ? typeOrOptions : [typeOrOptions];
      opts = maybeOptions ?? {};
    } else {
      // (type|[types][, options]) form — selector 기본값 $this
      selector = '$this';
      if (Array.isArray(selectorOrType)) types = selectorOrType;
      else types = [selectorOrType as string];
      opts = typeOrOptions ?? {};
    }

    const constructor = targetObj.constructor;

    let listeners = ReflectUtils.getMetadata<AddEventListenerMetadata<TEvent>[]>(ADD_EVENT_LISTENER_METADATA_KEY, constructor);
    if (!listeners) {
      listeners = [];
      ReflectUtils.defineMetadata(ADD_EVENT_LISTENER_METADATA_KEY, listeners, constructor);
    }

    for (const type of types) listeners.push({ propertyKey, selector, type, options: opts });
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

export function addEventListenerMutationLight<TEvent extends Event = Event>(selector: string, type: string, options?: Omit<AddEventListenerQueryOptions<TEvent>, 'delegate'>): MethodDecorator {
  return addEventListener<TEvent>(selector, type, {...options??{}, root:'light', delegate: 'mutation'});
}

export function addEventListenerMutationShadow<TEvent extends Event = Event>(selector: string, type: string, options?: Omit<AddEventListenerQueryOptions<TEvent>, 'delegate'>): MethodDecorator {
  return addEventListener<TEvent>(selector, type, {...options??{}, root:'shadow', delegate: 'mutation'});
}

export function addEventListenerMutationAll<TEvent extends Event = Event>(selector: string, type: string, options?: Omit<AddEventListenerQueryOptions<TEvent>, 'delegate'>): MethodDecorator {
  return addEventListener<TEvent>(selector, type, {...options??{}, root:'all', delegate: 'mutation'});
}

export function addEventListenerMutation<TEvent extends Event = Event>(selector: string, type: string, options?: Omit<AddEventListenerQueryOptions<TEvent>, 'delegate'>): MethodDecorator {
  return addEventListener<TEvent>(selector, type, {...options??{}, root:'auto', delegate: 'mutation'});
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
export const eventMutationLight = addEventListenerMutationLight;
export const eventMutationShadow = addEventListenerMutationShadow;
export const eventMutationAll = addEventListenerMutationAll;
export const eventMutation = addEventListenerMutation;
export const eventLight = addEventListenerLight;
export const eventShadow = addEventListenerShadow;
export const eventAll = addEventListenerAll;
export const eventAppHost = addEventListenerAppHost;
export const eventWindow = addEventListenerWindow;
export const eventDocument = addEventListenerDocument;
export const eventThis = addEventListenerThis;

// ─── 이벤트 타입별 별칭 (eventClick, eventClickDelegateLight, ...) ───
// 위 scope/delegate 축 별칭들을 특정 이벤트 타입에 고정해서 재바인딩한다.
// 실제 타입별 export 목록(944개, 아래)은 이 팩토리로 생성 스크립트를 돌려서 만들었다.
// selector가 필요 없는 변형(This/AppHost/Window/Document)은 options가 유일한 파라미터라
// 괄호 없이(@eventClickThis) 바로 데코레이터로 써도, 옵션과 함께(@eventClickThis({...})) 써도
// 동작하도록 이중 모드로 만든다. 두 번째 인자가 string|symbol이면 (target, propertyKey, descriptor)로
// 직접 호출된 것으로 판단한다 — @attribute의 bare/factory 판별과 같은 방식.
// 반환 타입 유니온에 MethodDecorator(함수 타입)가 섞여 있으면 TS가 "괄호 없이 쓸 때"의 데코레이터
// 반환 타입 검사에서 이를 허용된 반환 타입(void | PropertyDescriptor)에 대입 불가로 보고 에러를 낸다
// (실제 오버로드 함수 선언과 달리, 이렇게 값으로 만든 콜러블 타입은 인자 개수별로 다른 시그니처를
// 골라주는 오버로드 해석을 받지 못하기 때문). 그래서 반환 타입을 any로 느슨하게 둔다 — 실사용에서는
// 어차피 데코레이터가 어떻게 호출되든 결과를 그대로 리턴/전달하기만 하면 되므로 안전하다.
export type BareableMethodDecorator<TOptions> = (
  optionsOrTarget?: TOptions | Object,
  propertyKey?: string | symbol,
  descriptor?: PropertyDescriptor
) => any;

function makeBareableEventDecorator<TOptions>(bind: (options?: TOptions) => MethodDecorator): BareableMethodDecorator<TOptions> {
  return ((a?: any, b?: any, c?: PropertyDescriptor): any => {
    if (typeof b === 'string' || typeof b === 'symbol') {
      return bind()(a, b, c);
    }
    return bind(a);
  }) as BareableMethodDecorator<TOptions>;
}

export function makeTypedEventAliases<TEvent extends Event = Event>(type: string) {
  return {
    base: (selector: string, options?: AddEventListenerQueryOptions<TEvent>) => addEventListener<TEvent>(selector, type, options),
    delegateLight: (selector: string, options?: Omit<AddEventListenerQueryOptions<TEvent>, 'delegate'>) => addEventListenerDelegateLight<TEvent>(selector, type, options),
    delegateShadow: (selector: string, options?: Omit<AddEventListenerQueryOptions<TEvent>, 'delegate'>) => addEventListenerDelegateShadow<TEvent>(selector, type, options),
    delegateAll: (selector: string, options?: Omit<AddEventListenerQueryOptions<TEvent>, 'delegate'>) => addEventListenerDelegateAll<TEvent>(selector, type, options),
    delegate: (selector: string, options?: Omit<AddEventListenerQueryOptions<TEvent>, 'delegate'>) => addEventListenerDelegate<TEvent>(selector, type, options),
    mutationLight: (selector: string, options?: Omit<AddEventListenerQueryOptions<TEvent>, 'delegate'>) => addEventListenerMutationLight<TEvent>(selector, type, options),
    mutationShadow: (selector: string, options?: Omit<AddEventListenerQueryOptions<TEvent>, 'delegate'>) => addEventListenerMutationShadow<TEvent>(selector, type, options),
    mutationAll: (selector: string, options?: Omit<AddEventListenerQueryOptions<TEvent>, 'delegate'>) => addEventListenerMutationAll<TEvent>(selector, type, options),
    mutation: (selector: string, options?: Omit<AddEventListenerQueryOptions<TEvent>, 'delegate'>) => addEventListenerMutation<TEvent>(selector, type, options),
    light: (selector: string, options?: AddEventListenerQueryOptions<TEvent>) => addEventListenerLight<TEvent>(selector, type, options),
    shadow: (selector: string, options?: AddEventListenerQueryOptions<TEvent>) => addEventListenerShadow<TEvent>(selector, type, options),
    all: (selector: string, options?: AddEventListenerQueryOptions<TEvent>) => addEventListenerAll<TEvent>(selector, type, options),
    this: makeBareableEventDecorator<AddEventListenerQueryOptions<TEvent>>((options) => addEventListenerThis<TEvent>(type, options)),
    appHost: makeBareableEventDecorator<AddEventListenerQueryOptions<TEvent>>((options) => addEventListenerAppHost<TEvent>(type, options)),
    window: makeBareableEventDecorator<AddEventListenerQueryOptions<TEvent>>((options) => addEventListenerWindow<TEvent>(type, options)),
    document: makeBareableEventDecorator<AddEventListenerQueryOptions<TEvent>>((options) => addEventListenerDocument<TEvent>(type, options)),
  };
}

// ─── 이벤트 타입별 별칭 (eventClick, eventClickDelegateLight, eventInputThis, ...) ───
// 위 makeTypedEventAliases 팩토리를 자주 쓰는 DOM 이벤트 타입 각각에 대해 미리 바인딩해둔 것.
// 생성 스크립트로 만들어짐 — 새 타입을 추가하려면 같은 패턴(16개 export)을 추가하면 된다.
const clickAliases = makeTypedEventAliases<MouseEvent>('click');
export const eventClick = clickAliases.base;
export const eventClickDelegateLight = clickAliases.delegateLight;
export const eventClickDelegateShadow = clickAliases.delegateShadow;
export const eventClickDelegateAll = clickAliases.delegateAll;
export const eventClickDelegate = clickAliases.delegate;
export const eventClickMutationLight = clickAliases.mutationLight;
export const eventClickMutationShadow = clickAliases.mutationShadow;
export const eventClickMutationAll = clickAliases.mutationAll;
export const eventClickMutation = clickAliases.mutation;
export const eventClickLight = clickAliases.light;
export const eventClickShadow = clickAliases.shadow;
export const eventClickAll = clickAliases.all;
export const eventClickThis = clickAliases.this;
export const eventClickAppHost = clickAliases.appHost;
export const eventClickWindow = clickAliases.window;
export const eventClickDocument = clickAliases.document;
const dblclickAliases = makeTypedEventAliases<MouseEvent>('dblclick');
export const eventDblclick = dblclickAliases.base;
export const eventDblclickDelegateLight = dblclickAliases.delegateLight;
export const eventDblclickDelegateShadow = dblclickAliases.delegateShadow;
export const eventDblclickDelegateAll = dblclickAliases.delegateAll;
export const eventDblclickDelegate = dblclickAliases.delegate;
export const eventDblclickMutationLight = dblclickAliases.mutationLight;
export const eventDblclickMutationShadow = dblclickAliases.mutationShadow;
export const eventDblclickMutationAll = dblclickAliases.mutationAll;
export const eventDblclickMutation = dblclickAliases.mutation;
export const eventDblclickLight = dblclickAliases.light;
export const eventDblclickShadow = dblclickAliases.shadow;
export const eventDblclickAll = dblclickAliases.all;
export const eventDblclickThis = dblclickAliases.this;
export const eventDblclickAppHost = dblclickAliases.appHost;
export const eventDblclickWindow = dblclickAliases.window;
export const eventDblclickDocument = dblclickAliases.document;
const mousedownAliases = makeTypedEventAliases<MouseEvent>('mousedown');
export const eventMousedown = mousedownAliases.base;
export const eventMousedownDelegateLight = mousedownAliases.delegateLight;
export const eventMousedownDelegateShadow = mousedownAliases.delegateShadow;
export const eventMousedownDelegateAll = mousedownAliases.delegateAll;
export const eventMousedownDelegate = mousedownAliases.delegate;
export const eventMousedownMutationLight = mousedownAliases.mutationLight;
export const eventMousedownMutationShadow = mousedownAliases.mutationShadow;
export const eventMousedownMutationAll = mousedownAliases.mutationAll;
export const eventMousedownMutation = mousedownAliases.mutation;
export const eventMousedownLight = mousedownAliases.light;
export const eventMousedownShadow = mousedownAliases.shadow;
export const eventMousedownAll = mousedownAliases.all;
export const eventMousedownThis = mousedownAliases.this;
export const eventMousedownAppHost = mousedownAliases.appHost;
export const eventMousedownWindow = mousedownAliases.window;
export const eventMousedownDocument = mousedownAliases.document;
const mouseupAliases = makeTypedEventAliases<MouseEvent>('mouseup');
export const eventMouseup = mouseupAliases.base;
export const eventMouseupDelegateLight = mouseupAliases.delegateLight;
export const eventMouseupDelegateShadow = mouseupAliases.delegateShadow;
export const eventMouseupDelegateAll = mouseupAliases.delegateAll;
export const eventMouseupDelegate = mouseupAliases.delegate;
export const eventMouseupMutationLight = mouseupAliases.mutationLight;
export const eventMouseupMutationShadow = mouseupAliases.mutationShadow;
export const eventMouseupMutationAll = mouseupAliases.mutationAll;
export const eventMouseupMutation = mouseupAliases.mutation;
export const eventMouseupLight = mouseupAliases.light;
export const eventMouseupShadow = mouseupAliases.shadow;
export const eventMouseupAll = mouseupAliases.all;
export const eventMouseupThis = mouseupAliases.this;
export const eventMouseupAppHost = mouseupAliases.appHost;
export const eventMouseupWindow = mouseupAliases.window;
export const eventMouseupDocument = mouseupAliases.document;
const mousemoveAliases = makeTypedEventAliases<MouseEvent>('mousemove');
export const eventMousemove = mousemoveAliases.base;
export const eventMousemoveDelegateLight = mousemoveAliases.delegateLight;
export const eventMousemoveDelegateShadow = mousemoveAliases.delegateShadow;
export const eventMousemoveDelegateAll = mousemoveAliases.delegateAll;
export const eventMousemoveDelegate = mousemoveAliases.delegate;
export const eventMousemoveMutationLight = mousemoveAliases.mutationLight;
export const eventMousemoveMutationShadow = mousemoveAliases.mutationShadow;
export const eventMousemoveMutationAll = mousemoveAliases.mutationAll;
export const eventMousemoveMutation = mousemoveAliases.mutation;
export const eventMousemoveLight = mousemoveAliases.light;
export const eventMousemoveShadow = mousemoveAliases.shadow;
export const eventMousemoveAll = mousemoveAliases.all;
export const eventMousemoveThis = mousemoveAliases.this;
export const eventMousemoveAppHost = mousemoveAliases.appHost;
export const eventMousemoveWindow = mousemoveAliases.window;
export const eventMousemoveDocument = mousemoveAliases.document;
const mouseoverAliases = makeTypedEventAliases<MouseEvent>('mouseover');
export const eventMouseover = mouseoverAliases.base;
export const eventMouseoverDelegateLight = mouseoverAliases.delegateLight;
export const eventMouseoverDelegateShadow = mouseoverAliases.delegateShadow;
export const eventMouseoverDelegateAll = mouseoverAliases.delegateAll;
export const eventMouseoverDelegate = mouseoverAliases.delegate;
export const eventMouseoverMutationLight = mouseoverAliases.mutationLight;
export const eventMouseoverMutationShadow = mouseoverAliases.mutationShadow;
export const eventMouseoverMutationAll = mouseoverAliases.mutationAll;
export const eventMouseoverMutation = mouseoverAliases.mutation;
export const eventMouseoverLight = mouseoverAliases.light;
export const eventMouseoverShadow = mouseoverAliases.shadow;
export const eventMouseoverAll = mouseoverAliases.all;
export const eventMouseoverThis = mouseoverAliases.this;
export const eventMouseoverAppHost = mouseoverAliases.appHost;
export const eventMouseoverWindow = mouseoverAliases.window;
export const eventMouseoverDocument = mouseoverAliases.document;
const mouseoutAliases = makeTypedEventAliases<MouseEvent>('mouseout');
export const eventMouseout = mouseoutAliases.base;
export const eventMouseoutDelegateLight = mouseoutAliases.delegateLight;
export const eventMouseoutDelegateShadow = mouseoutAliases.delegateShadow;
export const eventMouseoutDelegateAll = mouseoutAliases.delegateAll;
export const eventMouseoutDelegate = mouseoutAliases.delegate;
export const eventMouseoutMutationLight = mouseoutAliases.mutationLight;
export const eventMouseoutMutationShadow = mouseoutAliases.mutationShadow;
export const eventMouseoutMutationAll = mouseoutAliases.mutationAll;
export const eventMouseoutMutation = mouseoutAliases.mutation;
export const eventMouseoutLight = mouseoutAliases.light;
export const eventMouseoutShadow = mouseoutAliases.shadow;
export const eventMouseoutAll = mouseoutAliases.all;
export const eventMouseoutThis = mouseoutAliases.this;
export const eventMouseoutAppHost = mouseoutAliases.appHost;
export const eventMouseoutWindow = mouseoutAliases.window;
export const eventMouseoutDocument = mouseoutAliases.document;
const mouseenterAliases = makeTypedEventAliases<MouseEvent>('mouseenter');
export const eventMouseenter = mouseenterAliases.base;
export const eventMouseenterDelegateLight = mouseenterAliases.delegateLight;
export const eventMouseenterDelegateShadow = mouseenterAliases.delegateShadow;
export const eventMouseenterDelegateAll = mouseenterAliases.delegateAll;
export const eventMouseenterDelegate = mouseenterAliases.delegate;
export const eventMouseenterMutationLight = mouseenterAliases.mutationLight;
export const eventMouseenterMutationShadow = mouseenterAliases.mutationShadow;
export const eventMouseenterMutationAll = mouseenterAliases.mutationAll;
export const eventMouseenterMutation = mouseenterAliases.mutation;
export const eventMouseenterLight = mouseenterAliases.light;
export const eventMouseenterShadow = mouseenterAliases.shadow;
export const eventMouseenterAll = mouseenterAliases.all;
export const eventMouseenterThis = mouseenterAliases.this;
export const eventMouseenterAppHost = mouseenterAliases.appHost;
export const eventMouseenterWindow = mouseenterAliases.window;
export const eventMouseenterDocument = mouseenterAliases.document;
const mouseleaveAliases = makeTypedEventAliases<MouseEvent>('mouseleave');
export const eventMouseleave = mouseleaveAliases.base;
export const eventMouseleaveDelegateLight = mouseleaveAliases.delegateLight;
export const eventMouseleaveDelegateShadow = mouseleaveAliases.delegateShadow;
export const eventMouseleaveDelegateAll = mouseleaveAliases.delegateAll;
export const eventMouseleaveDelegate = mouseleaveAliases.delegate;
export const eventMouseleaveMutationLight = mouseleaveAliases.mutationLight;
export const eventMouseleaveMutationShadow = mouseleaveAliases.mutationShadow;
export const eventMouseleaveMutationAll = mouseleaveAliases.mutationAll;
export const eventMouseleaveMutation = mouseleaveAliases.mutation;
export const eventMouseleaveLight = mouseleaveAliases.light;
export const eventMouseleaveShadow = mouseleaveAliases.shadow;
export const eventMouseleaveAll = mouseleaveAliases.all;
export const eventMouseleaveThis = mouseleaveAliases.this;
export const eventMouseleaveAppHost = mouseleaveAliases.appHost;
export const eventMouseleaveWindow = mouseleaveAliases.window;
export const eventMouseleaveDocument = mouseleaveAliases.document;
const contextmenuAliases = makeTypedEventAliases<MouseEvent>('contextmenu');
export const eventContextmenu = contextmenuAliases.base;
export const eventContextmenuDelegateLight = contextmenuAliases.delegateLight;
export const eventContextmenuDelegateShadow = contextmenuAliases.delegateShadow;
export const eventContextmenuDelegateAll = contextmenuAliases.delegateAll;
export const eventContextmenuDelegate = contextmenuAliases.delegate;
export const eventContextmenuMutationLight = contextmenuAliases.mutationLight;
export const eventContextmenuMutationShadow = contextmenuAliases.mutationShadow;
export const eventContextmenuMutationAll = contextmenuAliases.mutationAll;
export const eventContextmenuMutation = contextmenuAliases.mutation;
export const eventContextmenuLight = contextmenuAliases.light;
export const eventContextmenuShadow = contextmenuAliases.shadow;
export const eventContextmenuAll = contextmenuAliases.all;
export const eventContextmenuThis = contextmenuAliases.this;
export const eventContextmenuAppHost = contextmenuAliases.appHost;
export const eventContextmenuWindow = contextmenuAliases.window;
export const eventContextmenuDocument = contextmenuAliases.document;
const wheelAliases = makeTypedEventAliases<WheelEvent>('wheel');
export const eventWheel = wheelAliases.base;
export const eventWheelDelegateLight = wheelAliases.delegateLight;
export const eventWheelDelegateShadow = wheelAliases.delegateShadow;
export const eventWheelDelegateAll = wheelAliases.delegateAll;
export const eventWheelDelegate = wheelAliases.delegate;
export const eventWheelMutationLight = wheelAliases.mutationLight;
export const eventWheelMutationShadow = wheelAliases.mutationShadow;
export const eventWheelMutationAll = wheelAliases.mutationAll;
export const eventWheelMutation = wheelAliases.mutation;
export const eventWheelLight = wheelAliases.light;
export const eventWheelShadow = wheelAliases.shadow;
export const eventWheelAll = wheelAliases.all;
export const eventWheelThis = wheelAliases.this;
export const eventWheelAppHost = wheelAliases.appHost;
export const eventWheelWindow = wheelAliases.window;
export const eventWheelDocument = wheelAliases.document;
const keydownAliases = makeTypedEventAliases<KeyboardEvent>('keydown');
export const eventKeydown = keydownAliases.base;
export const eventKeydownDelegateLight = keydownAliases.delegateLight;
export const eventKeydownDelegateShadow = keydownAliases.delegateShadow;
export const eventKeydownDelegateAll = keydownAliases.delegateAll;
export const eventKeydownDelegate = keydownAliases.delegate;
export const eventKeydownMutationLight = keydownAliases.mutationLight;
export const eventKeydownMutationShadow = keydownAliases.mutationShadow;
export const eventKeydownMutationAll = keydownAliases.mutationAll;
export const eventKeydownMutation = keydownAliases.mutation;
export const eventKeydownLight = keydownAliases.light;
export const eventKeydownShadow = keydownAliases.shadow;
export const eventKeydownAll = keydownAliases.all;
export const eventKeydownThis = keydownAliases.this;
export const eventKeydownAppHost = keydownAliases.appHost;
export const eventKeydownWindow = keydownAliases.window;
export const eventKeydownDocument = keydownAliases.document;
const keyupAliases = makeTypedEventAliases<KeyboardEvent>('keyup');
export const eventKeyup = keyupAliases.base;
export const eventKeyupDelegateLight = keyupAliases.delegateLight;
export const eventKeyupDelegateShadow = keyupAliases.delegateShadow;
export const eventKeyupDelegateAll = keyupAliases.delegateAll;
export const eventKeyupDelegate = keyupAliases.delegate;
export const eventKeyupMutationLight = keyupAliases.mutationLight;
export const eventKeyupMutationShadow = keyupAliases.mutationShadow;
export const eventKeyupMutationAll = keyupAliases.mutationAll;
export const eventKeyupMutation = keyupAliases.mutation;
export const eventKeyupLight = keyupAliases.light;
export const eventKeyupShadow = keyupAliases.shadow;
export const eventKeyupAll = keyupAliases.all;
export const eventKeyupThis = keyupAliases.this;
export const eventKeyupAppHost = keyupAliases.appHost;
export const eventKeyupWindow = keyupAliases.window;
export const eventKeyupDocument = keyupAliases.document;
const keypressAliases = makeTypedEventAliases<KeyboardEvent>('keypress');
export const eventKeypress = keypressAliases.base;
export const eventKeypressDelegateLight = keypressAliases.delegateLight;
export const eventKeypressDelegateShadow = keypressAliases.delegateShadow;
export const eventKeypressDelegateAll = keypressAliases.delegateAll;
export const eventKeypressDelegate = keypressAliases.delegate;
export const eventKeypressMutationLight = keypressAliases.mutationLight;
export const eventKeypressMutationShadow = keypressAliases.mutationShadow;
export const eventKeypressMutationAll = keypressAliases.mutationAll;
export const eventKeypressMutation = keypressAliases.mutation;
export const eventKeypressLight = keypressAliases.light;
export const eventKeypressShadow = keypressAliases.shadow;
export const eventKeypressAll = keypressAliases.all;
export const eventKeypressThis = keypressAliases.this;
export const eventKeypressAppHost = keypressAliases.appHost;
export const eventKeypressWindow = keypressAliases.window;
export const eventKeypressDocument = keypressAliases.document;
const inputAliases = makeTypedEventAliases<InputEvent>('input');
export const eventInput = inputAliases.base;
export const eventInputDelegateLight = inputAliases.delegateLight;
export const eventInputDelegateShadow = inputAliases.delegateShadow;
export const eventInputDelegateAll = inputAliases.delegateAll;
export const eventInputDelegate = inputAliases.delegate;
export const eventInputMutationLight = inputAliases.mutationLight;
export const eventInputMutationShadow = inputAliases.mutationShadow;
export const eventInputMutationAll = inputAliases.mutationAll;
export const eventInputMutation = inputAliases.mutation;
export const eventInputLight = inputAliases.light;
export const eventInputShadow = inputAliases.shadow;
export const eventInputAll = inputAliases.all;
export const eventInputThis = inputAliases.this;
export const eventInputAppHost = inputAliases.appHost;
export const eventInputWindow = inputAliases.window;
export const eventInputDocument = inputAliases.document;
const changeAliases = makeTypedEventAliases<Event>('change');
export const eventChange = changeAliases.base;
export const eventChangeDelegateLight = changeAliases.delegateLight;
export const eventChangeDelegateShadow = changeAliases.delegateShadow;
export const eventChangeDelegateAll = changeAliases.delegateAll;
export const eventChangeDelegate = changeAliases.delegate;
export const eventChangeMutationLight = changeAliases.mutationLight;
export const eventChangeMutationShadow = changeAliases.mutationShadow;
export const eventChangeMutationAll = changeAliases.mutationAll;
export const eventChangeMutation = changeAliases.mutation;
export const eventChangeLight = changeAliases.light;
export const eventChangeShadow = changeAliases.shadow;
export const eventChangeAll = changeAliases.all;
export const eventChangeThis = changeAliases.this;
export const eventChangeAppHost = changeAliases.appHost;
export const eventChangeWindow = changeAliases.window;
export const eventChangeDocument = changeAliases.document;
const submitAliases = makeTypedEventAliases<SubmitEvent>('submit');
export const eventSubmit = submitAliases.base;
export const eventSubmitDelegateLight = submitAliases.delegateLight;
export const eventSubmitDelegateShadow = submitAliases.delegateShadow;
export const eventSubmitDelegateAll = submitAliases.delegateAll;
export const eventSubmitDelegate = submitAliases.delegate;
export const eventSubmitMutationLight = submitAliases.mutationLight;
export const eventSubmitMutationShadow = submitAliases.mutationShadow;
export const eventSubmitMutationAll = submitAliases.mutationAll;
export const eventSubmitMutation = submitAliases.mutation;
export const eventSubmitLight = submitAliases.light;
export const eventSubmitShadow = submitAliases.shadow;
export const eventSubmitAll = submitAliases.all;
export const eventSubmitThis = submitAliases.this;
export const eventSubmitAppHost = submitAliases.appHost;
export const eventSubmitWindow = submitAliases.window;
export const eventSubmitDocument = submitAliases.document;
const resetAliases = makeTypedEventAliases<Event>('reset');
export const eventReset = resetAliases.base;
export const eventResetDelegateLight = resetAliases.delegateLight;
export const eventResetDelegateShadow = resetAliases.delegateShadow;
export const eventResetDelegateAll = resetAliases.delegateAll;
export const eventResetDelegate = resetAliases.delegate;
export const eventResetMutationLight = resetAliases.mutationLight;
export const eventResetMutationShadow = resetAliases.mutationShadow;
export const eventResetMutationAll = resetAliases.mutationAll;
export const eventResetMutation = resetAliases.mutation;
export const eventResetLight = resetAliases.light;
export const eventResetShadow = resetAliases.shadow;
export const eventResetAll = resetAliases.all;
export const eventResetThis = resetAliases.this;
export const eventResetAppHost = resetAliases.appHost;
export const eventResetWindow = resetAliases.window;
export const eventResetDocument = resetAliases.document;
const invalidAliases = makeTypedEventAliases<Event>('invalid');
export const eventInvalid = invalidAliases.base;
export const eventInvalidDelegateLight = invalidAliases.delegateLight;
export const eventInvalidDelegateShadow = invalidAliases.delegateShadow;
export const eventInvalidDelegateAll = invalidAliases.delegateAll;
export const eventInvalidDelegate = invalidAliases.delegate;
export const eventInvalidMutationLight = invalidAliases.mutationLight;
export const eventInvalidMutationShadow = invalidAliases.mutationShadow;
export const eventInvalidMutationAll = invalidAliases.mutationAll;
export const eventInvalidMutation = invalidAliases.mutation;
export const eventInvalidLight = invalidAliases.light;
export const eventInvalidShadow = invalidAliases.shadow;
export const eventInvalidAll = invalidAliases.all;
export const eventInvalidThis = invalidAliases.this;
export const eventInvalidAppHost = invalidAliases.appHost;
export const eventInvalidWindow = invalidAliases.window;
export const eventInvalidDocument = invalidAliases.document;
const selectAliases = makeTypedEventAliases<Event>('select');
export const eventSelect = selectAliases.base;
export const eventSelectDelegateLight = selectAliases.delegateLight;
export const eventSelectDelegateShadow = selectAliases.delegateShadow;
export const eventSelectDelegateAll = selectAliases.delegateAll;
export const eventSelectDelegate = selectAliases.delegate;
export const eventSelectMutationLight = selectAliases.mutationLight;
export const eventSelectMutationShadow = selectAliases.mutationShadow;
export const eventSelectMutationAll = selectAliases.mutationAll;
export const eventSelectMutation = selectAliases.mutation;
export const eventSelectLight = selectAliases.light;
export const eventSelectShadow = selectAliases.shadow;
export const eventSelectAll = selectAliases.all;
export const eventSelectThis = selectAliases.this;
export const eventSelectAppHost = selectAliases.appHost;
export const eventSelectWindow = selectAliases.window;
export const eventSelectDocument = selectAliases.document;
const focusAliases = makeTypedEventAliases<FocusEvent>('focus');
export const eventFocus = focusAliases.base;
export const eventFocusDelegateLight = focusAliases.delegateLight;
export const eventFocusDelegateShadow = focusAliases.delegateShadow;
export const eventFocusDelegateAll = focusAliases.delegateAll;
export const eventFocusDelegate = focusAliases.delegate;
export const eventFocusMutationLight = focusAliases.mutationLight;
export const eventFocusMutationShadow = focusAliases.mutationShadow;
export const eventFocusMutationAll = focusAliases.mutationAll;
export const eventFocusMutation = focusAliases.mutation;
export const eventFocusLight = focusAliases.light;
export const eventFocusShadow = focusAliases.shadow;
export const eventFocusAll = focusAliases.all;
export const eventFocusThis = focusAliases.this;
export const eventFocusAppHost = focusAliases.appHost;
export const eventFocusWindow = focusAliases.window;
export const eventFocusDocument = focusAliases.document;
const blurAliases = makeTypedEventAliases<FocusEvent>('blur');
export const eventBlur = blurAliases.base;
export const eventBlurDelegateLight = blurAliases.delegateLight;
export const eventBlurDelegateShadow = blurAliases.delegateShadow;
export const eventBlurDelegateAll = blurAliases.delegateAll;
export const eventBlurDelegate = blurAliases.delegate;
export const eventBlurMutationLight = blurAliases.mutationLight;
export const eventBlurMutationShadow = blurAliases.mutationShadow;
export const eventBlurMutationAll = blurAliases.mutationAll;
export const eventBlurMutation = blurAliases.mutation;
export const eventBlurLight = blurAliases.light;
export const eventBlurShadow = blurAliases.shadow;
export const eventBlurAll = blurAliases.all;
export const eventBlurThis = blurAliases.this;
export const eventBlurAppHost = blurAliases.appHost;
export const eventBlurWindow = blurAliases.window;
export const eventBlurDocument = blurAliases.document;
const focusinAliases = makeTypedEventAliases<FocusEvent>('focusin');
export const eventFocusin = focusinAliases.base;
export const eventFocusinDelegateLight = focusinAliases.delegateLight;
export const eventFocusinDelegateShadow = focusinAliases.delegateShadow;
export const eventFocusinDelegateAll = focusinAliases.delegateAll;
export const eventFocusinDelegate = focusinAliases.delegate;
export const eventFocusinMutationLight = focusinAliases.mutationLight;
export const eventFocusinMutationShadow = focusinAliases.mutationShadow;
export const eventFocusinMutationAll = focusinAliases.mutationAll;
export const eventFocusinMutation = focusinAliases.mutation;
export const eventFocusinLight = focusinAliases.light;
export const eventFocusinShadow = focusinAliases.shadow;
export const eventFocusinAll = focusinAliases.all;
export const eventFocusinThis = focusinAliases.this;
export const eventFocusinAppHost = focusinAliases.appHost;
export const eventFocusinWindow = focusinAliases.window;
export const eventFocusinDocument = focusinAliases.document;
const focusoutAliases = makeTypedEventAliases<FocusEvent>('focusout');
export const eventFocusout = focusoutAliases.base;
export const eventFocusoutDelegateLight = focusoutAliases.delegateLight;
export const eventFocusoutDelegateShadow = focusoutAliases.delegateShadow;
export const eventFocusoutDelegateAll = focusoutAliases.delegateAll;
export const eventFocusoutDelegate = focusoutAliases.delegate;
export const eventFocusoutMutationLight = focusoutAliases.mutationLight;
export const eventFocusoutMutationShadow = focusoutAliases.mutationShadow;
export const eventFocusoutMutationAll = focusoutAliases.mutationAll;
export const eventFocusoutMutation = focusoutAliases.mutation;
export const eventFocusoutLight = focusoutAliases.light;
export const eventFocusoutShadow = focusoutAliases.shadow;
export const eventFocusoutAll = focusoutAliases.all;
export const eventFocusoutThis = focusoutAliases.this;
export const eventFocusoutAppHost = focusoutAliases.appHost;
export const eventFocusoutWindow = focusoutAliases.window;
export const eventFocusoutDocument = focusoutAliases.document;
const dragstartAliases = makeTypedEventAliases<DragEvent>('dragstart');
export const eventDragstart = dragstartAliases.base;
export const eventDragstartDelegateLight = dragstartAliases.delegateLight;
export const eventDragstartDelegateShadow = dragstartAliases.delegateShadow;
export const eventDragstartDelegateAll = dragstartAliases.delegateAll;
export const eventDragstartDelegate = dragstartAliases.delegate;
export const eventDragstartMutationLight = dragstartAliases.mutationLight;
export const eventDragstartMutationShadow = dragstartAliases.mutationShadow;
export const eventDragstartMutationAll = dragstartAliases.mutationAll;
export const eventDragstartMutation = dragstartAliases.mutation;
export const eventDragstartLight = dragstartAliases.light;
export const eventDragstartShadow = dragstartAliases.shadow;
export const eventDragstartAll = dragstartAliases.all;
export const eventDragstartThis = dragstartAliases.this;
export const eventDragstartAppHost = dragstartAliases.appHost;
export const eventDragstartWindow = dragstartAliases.window;
export const eventDragstartDocument = dragstartAliases.document;
const dragAliases = makeTypedEventAliases<DragEvent>('drag');
export const eventDrag = dragAliases.base;
export const eventDragDelegateLight = dragAliases.delegateLight;
export const eventDragDelegateShadow = dragAliases.delegateShadow;
export const eventDragDelegateAll = dragAliases.delegateAll;
export const eventDragDelegate = dragAliases.delegate;
export const eventDragMutationLight = dragAliases.mutationLight;
export const eventDragMutationShadow = dragAliases.mutationShadow;
export const eventDragMutationAll = dragAliases.mutationAll;
export const eventDragMutation = dragAliases.mutation;
export const eventDragLight = dragAliases.light;
export const eventDragShadow = dragAliases.shadow;
export const eventDragAll = dragAliases.all;
export const eventDragThis = dragAliases.this;
export const eventDragAppHost = dragAliases.appHost;
export const eventDragWindow = dragAliases.window;
export const eventDragDocument = dragAliases.document;
const dragendAliases = makeTypedEventAliases<DragEvent>('dragend');
export const eventDragend = dragendAliases.base;
export const eventDragendDelegateLight = dragendAliases.delegateLight;
export const eventDragendDelegateShadow = dragendAliases.delegateShadow;
export const eventDragendDelegateAll = dragendAliases.delegateAll;
export const eventDragendDelegate = dragendAliases.delegate;
export const eventDragendMutationLight = dragendAliases.mutationLight;
export const eventDragendMutationShadow = dragendAliases.mutationShadow;
export const eventDragendMutationAll = dragendAliases.mutationAll;
export const eventDragendMutation = dragendAliases.mutation;
export const eventDragendLight = dragendAliases.light;
export const eventDragendShadow = dragendAliases.shadow;
export const eventDragendAll = dragendAliases.all;
export const eventDragendThis = dragendAliases.this;
export const eventDragendAppHost = dragendAliases.appHost;
export const eventDragendWindow = dragendAliases.window;
export const eventDragendDocument = dragendAliases.document;
const dragenterAliases = makeTypedEventAliases<DragEvent>('dragenter');
export const eventDragenter = dragenterAliases.base;
export const eventDragenterDelegateLight = dragenterAliases.delegateLight;
export const eventDragenterDelegateShadow = dragenterAliases.delegateShadow;
export const eventDragenterDelegateAll = dragenterAliases.delegateAll;
export const eventDragenterDelegate = dragenterAliases.delegate;
export const eventDragenterMutationLight = dragenterAliases.mutationLight;
export const eventDragenterMutationShadow = dragenterAliases.mutationShadow;
export const eventDragenterMutationAll = dragenterAliases.mutationAll;
export const eventDragenterMutation = dragenterAliases.mutation;
export const eventDragenterLight = dragenterAliases.light;
export const eventDragenterShadow = dragenterAliases.shadow;
export const eventDragenterAll = dragenterAliases.all;
export const eventDragenterThis = dragenterAliases.this;
export const eventDragenterAppHost = dragenterAliases.appHost;
export const eventDragenterWindow = dragenterAliases.window;
export const eventDragenterDocument = dragenterAliases.document;
const dragleaveAliases = makeTypedEventAliases<DragEvent>('dragleave');
export const eventDragleave = dragleaveAliases.base;
export const eventDragleaveDelegateLight = dragleaveAliases.delegateLight;
export const eventDragleaveDelegateShadow = dragleaveAliases.delegateShadow;
export const eventDragleaveDelegateAll = dragleaveAliases.delegateAll;
export const eventDragleaveDelegate = dragleaveAliases.delegate;
export const eventDragleaveMutationLight = dragleaveAliases.mutationLight;
export const eventDragleaveMutationShadow = dragleaveAliases.mutationShadow;
export const eventDragleaveMutationAll = dragleaveAliases.mutationAll;
export const eventDragleaveMutation = dragleaveAliases.mutation;
export const eventDragleaveLight = dragleaveAliases.light;
export const eventDragleaveShadow = dragleaveAliases.shadow;
export const eventDragleaveAll = dragleaveAliases.all;
export const eventDragleaveThis = dragleaveAliases.this;
export const eventDragleaveAppHost = dragleaveAliases.appHost;
export const eventDragleaveWindow = dragleaveAliases.window;
export const eventDragleaveDocument = dragleaveAliases.document;
const dragoverAliases = makeTypedEventAliases<DragEvent>('dragover');
export const eventDragover = dragoverAliases.base;
export const eventDragoverDelegateLight = dragoverAliases.delegateLight;
export const eventDragoverDelegateShadow = dragoverAliases.delegateShadow;
export const eventDragoverDelegateAll = dragoverAliases.delegateAll;
export const eventDragoverDelegate = dragoverAliases.delegate;
export const eventDragoverMutationLight = dragoverAliases.mutationLight;
export const eventDragoverMutationShadow = dragoverAliases.mutationShadow;
export const eventDragoverMutationAll = dragoverAliases.mutationAll;
export const eventDragoverMutation = dragoverAliases.mutation;
export const eventDragoverLight = dragoverAliases.light;
export const eventDragoverShadow = dragoverAliases.shadow;
export const eventDragoverAll = dragoverAliases.all;
export const eventDragoverThis = dragoverAliases.this;
export const eventDragoverAppHost = dragoverAliases.appHost;
export const eventDragoverWindow = dragoverAliases.window;
export const eventDragoverDocument = dragoverAliases.document;
const dropAliases = makeTypedEventAliases<DragEvent>('drop');
export const eventDrop = dropAliases.base;
export const eventDropDelegateLight = dropAliases.delegateLight;
export const eventDropDelegateShadow = dropAliases.delegateShadow;
export const eventDropDelegateAll = dropAliases.delegateAll;
export const eventDropDelegate = dropAliases.delegate;
export const eventDropMutationLight = dropAliases.mutationLight;
export const eventDropMutationShadow = dropAliases.mutationShadow;
export const eventDropMutationAll = dropAliases.mutationAll;
export const eventDropMutation = dropAliases.mutation;
export const eventDropLight = dropAliases.light;
export const eventDropShadow = dropAliases.shadow;
export const eventDropAll = dropAliases.all;
export const eventDropThis = dropAliases.this;
export const eventDropAppHost = dropAliases.appHost;
export const eventDropWindow = dropAliases.window;
export const eventDropDocument = dropAliases.document;
const touchstartAliases = makeTypedEventAliases<TouchEvent>('touchstart');
export const eventTouchstart = touchstartAliases.base;
export const eventTouchstartDelegateLight = touchstartAliases.delegateLight;
export const eventTouchstartDelegateShadow = touchstartAliases.delegateShadow;
export const eventTouchstartDelegateAll = touchstartAliases.delegateAll;
export const eventTouchstartDelegate = touchstartAliases.delegate;
export const eventTouchstartMutationLight = touchstartAliases.mutationLight;
export const eventTouchstartMutationShadow = touchstartAliases.mutationShadow;
export const eventTouchstartMutationAll = touchstartAliases.mutationAll;
export const eventTouchstartMutation = touchstartAliases.mutation;
export const eventTouchstartLight = touchstartAliases.light;
export const eventTouchstartShadow = touchstartAliases.shadow;
export const eventTouchstartAll = touchstartAliases.all;
export const eventTouchstartThis = touchstartAliases.this;
export const eventTouchstartAppHost = touchstartAliases.appHost;
export const eventTouchstartWindow = touchstartAliases.window;
export const eventTouchstartDocument = touchstartAliases.document;
const touchmoveAliases = makeTypedEventAliases<TouchEvent>('touchmove');
export const eventTouchmove = touchmoveAliases.base;
export const eventTouchmoveDelegateLight = touchmoveAliases.delegateLight;
export const eventTouchmoveDelegateShadow = touchmoveAliases.delegateShadow;
export const eventTouchmoveDelegateAll = touchmoveAliases.delegateAll;
export const eventTouchmoveDelegate = touchmoveAliases.delegate;
export const eventTouchmoveMutationLight = touchmoveAliases.mutationLight;
export const eventTouchmoveMutationShadow = touchmoveAliases.mutationShadow;
export const eventTouchmoveMutationAll = touchmoveAliases.mutationAll;
export const eventTouchmoveMutation = touchmoveAliases.mutation;
export const eventTouchmoveLight = touchmoveAliases.light;
export const eventTouchmoveShadow = touchmoveAliases.shadow;
export const eventTouchmoveAll = touchmoveAliases.all;
export const eventTouchmoveThis = touchmoveAliases.this;
export const eventTouchmoveAppHost = touchmoveAliases.appHost;
export const eventTouchmoveWindow = touchmoveAliases.window;
export const eventTouchmoveDocument = touchmoveAliases.document;
const touchendAliases = makeTypedEventAliases<TouchEvent>('touchend');
export const eventTouchend = touchendAliases.base;
export const eventTouchendDelegateLight = touchendAliases.delegateLight;
export const eventTouchendDelegateShadow = touchendAliases.delegateShadow;
export const eventTouchendDelegateAll = touchendAliases.delegateAll;
export const eventTouchendDelegate = touchendAliases.delegate;
export const eventTouchendMutationLight = touchendAliases.mutationLight;
export const eventTouchendMutationShadow = touchendAliases.mutationShadow;
export const eventTouchendMutationAll = touchendAliases.mutationAll;
export const eventTouchendMutation = touchendAliases.mutation;
export const eventTouchendLight = touchendAliases.light;
export const eventTouchendShadow = touchendAliases.shadow;
export const eventTouchendAll = touchendAliases.all;
export const eventTouchendThis = touchendAliases.this;
export const eventTouchendAppHost = touchendAliases.appHost;
export const eventTouchendWindow = touchendAliases.window;
export const eventTouchendDocument = touchendAliases.document;
const touchcancelAliases = makeTypedEventAliases<TouchEvent>('touchcancel');
export const eventTouchcancel = touchcancelAliases.base;
export const eventTouchcancelDelegateLight = touchcancelAliases.delegateLight;
export const eventTouchcancelDelegateShadow = touchcancelAliases.delegateShadow;
export const eventTouchcancelDelegateAll = touchcancelAliases.delegateAll;
export const eventTouchcancelDelegate = touchcancelAliases.delegate;
export const eventTouchcancelMutationLight = touchcancelAliases.mutationLight;
export const eventTouchcancelMutationShadow = touchcancelAliases.mutationShadow;
export const eventTouchcancelMutationAll = touchcancelAliases.mutationAll;
export const eventTouchcancelMutation = touchcancelAliases.mutation;
export const eventTouchcancelLight = touchcancelAliases.light;
export const eventTouchcancelShadow = touchcancelAliases.shadow;
export const eventTouchcancelAll = touchcancelAliases.all;
export const eventTouchcancelThis = touchcancelAliases.this;
export const eventTouchcancelAppHost = touchcancelAliases.appHost;
export const eventTouchcancelWindow = touchcancelAliases.window;
export const eventTouchcancelDocument = touchcancelAliases.document;
const pointerdownAliases = makeTypedEventAliases<PointerEvent>('pointerdown');
export const eventPointerdown = pointerdownAliases.base;
export const eventPointerdownDelegateLight = pointerdownAliases.delegateLight;
export const eventPointerdownDelegateShadow = pointerdownAliases.delegateShadow;
export const eventPointerdownDelegateAll = pointerdownAliases.delegateAll;
export const eventPointerdownDelegate = pointerdownAliases.delegate;
export const eventPointerdownMutationLight = pointerdownAliases.mutationLight;
export const eventPointerdownMutationShadow = pointerdownAliases.mutationShadow;
export const eventPointerdownMutationAll = pointerdownAliases.mutationAll;
export const eventPointerdownMutation = pointerdownAliases.mutation;
export const eventPointerdownLight = pointerdownAliases.light;
export const eventPointerdownShadow = pointerdownAliases.shadow;
export const eventPointerdownAll = pointerdownAliases.all;
export const eventPointerdownThis = pointerdownAliases.this;
export const eventPointerdownAppHost = pointerdownAliases.appHost;
export const eventPointerdownWindow = pointerdownAliases.window;
export const eventPointerdownDocument = pointerdownAliases.document;
const pointerupAliases = makeTypedEventAliases<PointerEvent>('pointerup');
export const eventPointerup = pointerupAliases.base;
export const eventPointerupDelegateLight = pointerupAliases.delegateLight;
export const eventPointerupDelegateShadow = pointerupAliases.delegateShadow;
export const eventPointerupDelegateAll = pointerupAliases.delegateAll;
export const eventPointerupDelegate = pointerupAliases.delegate;
export const eventPointerupMutationLight = pointerupAliases.mutationLight;
export const eventPointerupMutationShadow = pointerupAliases.mutationShadow;
export const eventPointerupMutationAll = pointerupAliases.mutationAll;
export const eventPointerupMutation = pointerupAliases.mutation;
export const eventPointerupLight = pointerupAliases.light;
export const eventPointerupShadow = pointerupAliases.shadow;
export const eventPointerupAll = pointerupAliases.all;
export const eventPointerupThis = pointerupAliases.this;
export const eventPointerupAppHost = pointerupAliases.appHost;
export const eventPointerupWindow = pointerupAliases.window;
export const eventPointerupDocument = pointerupAliases.document;
const pointermoveAliases = makeTypedEventAliases<PointerEvent>('pointermove');
export const eventPointermove = pointermoveAliases.base;
export const eventPointermoveDelegateLight = pointermoveAliases.delegateLight;
export const eventPointermoveDelegateShadow = pointermoveAliases.delegateShadow;
export const eventPointermoveDelegateAll = pointermoveAliases.delegateAll;
export const eventPointermoveDelegate = pointermoveAliases.delegate;
export const eventPointermoveMutationLight = pointermoveAliases.mutationLight;
export const eventPointermoveMutationShadow = pointermoveAliases.mutationShadow;
export const eventPointermoveMutationAll = pointermoveAliases.mutationAll;
export const eventPointermoveMutation = pointermoveAliases.mutation;
export const eventPointermoveLight = pointermoveAliases.light;
export const eventPointermoveShadow = pointermoveAliases.shadow;
export const eventPointermoveAll = pointermoveAliases.all;
export const eventPointermoveThis = pointermoveAliases.this;
export const eventPointermoveAppHost = pointermoveAliases.appHost;
export const eventPointermoveWindow = pointermoveAliases.window;
export const eventPointermoveDocument = pointermoveAliases.document;
const pointeroverAliases = makeTypedEventAliases<PointerEvent>('pointerover');
export const eventPointerover = pointeroverAliases.base;
export const eventPointeroverDelegateLight = pointeroverAliases.delegateLight;
export const eventPointeroverDelegateShadow = pointeroverAliases.delegateShadow;
export const eventPointeroverDelegateAll = pointeroverAliases.delegateAll;
export const eventPointeroverDelegate = pointeroverAliases.delegate;
export const eventPointeroverMutationLight = pointeroverAliases.mutationLight;
export const eventPointeroverMutationShadow = pointeroverAliases.mutationShadow;
export const eventPointeroverMutationAll = pointeroverAliases.mutationAll;
export const eventPointeroverMutation = pointeroverAliases.mutation;
export const eventPointeroverLight = pointeroverAliases.light;
export const eventPointeroverShadow = pointeroverAliases.shadow;
export const eventPointeroverAll = pointeroverAliases.all;
export const eventPointeroverThis = pointeroverAliases.this;
export const eventPointeroverAppHost = pointeroverAliases.appHost;
export const eventPointeroverWindow = pointeroverAliases.window;
export const eventPointeroverDocument = pointeroverAliases.document;
const pointeroutAliases = makeTypedEventAliases<PointerEvent>('pointerout');
export const eventPointerout = pointeroutAliases.base;
export const eventPointeroutDelegateLight = pointeroutAliases.delegateLight;
export const eventPointeroutDelegateShadow = pointeroutAliases.delegateShadow;
export const eventPointeroutDelegateAll = pointeroutAliases.delegateAll;
export const eventPointeroutDelegate = pointeroutAliases.delegate;
export const eventPointeroutMutationLight = pointeroutAliases.mutationLight;
export const eventPointeroutMutationShadow = pointeroutAliases.mutationShadow;
export const eventPointeroutMutationAll = pointeroutAliases.mutationAll;
export const eventPointeroutMutation = pointeroutAliases.mutation;
export const eventPointeroutLight = pointeroutAliases.light;
export const eventPointeroutShadow = pointeroutAliases.shadow;
export const eventPointeroutAll = pointeroutAliases.all;
export const eventPointeroutThis = pointeroutAliases.this;
export const eventPointeroutAppHost = pointeroutAliases.appHost;
export const eventPointeroutWindow = pointeroutAliases.window;
export const eventPointeroutDocument = pointeroutAliases.document;
const pointerenterAliases = makeTypedEventAliases<PointerEvent>('pointerenter');
export const eventPointerenter = pointerenterAliases.base;
export const eventPointerenterDelegateLight = pointerenterAliases.delegateLight;
export const eventPointerenterDelegateShadow = pointerenterAliases.delegateShadow;
export const eventPointerenterDelegateAll = pointerenterAliases.delegateAll;
export const eventPointerenterDelegate = pointerenterAliases.delegate;
export const eventPointerenterMutationLight = pointerenterAliases.mutationLight;
export const eventPointerenterMutationShadow = pointerenterAliases.mutationShadow;
export const eventPointerenterMutationAll = pointerenterAliases.mutationAll;
export const eventPointerenterMutation = pointerenterAliases.mutation;
export const eventPointerenterLight = pointerenterAliases.light;
export const eventPointerenterShadow = pointerenterAliases.shadow;
export const eventPointerenterAll = pointerenterAliases.all;
export const eventPointerenterThis = pointerenterAliases.this;
export const eventPointerenterAppHost = pointerenterAliases.appHost;
export const eventPointerenterWindow = pointerenterAliases.window;
export const eventPointerenterDocument = pointerenterAliases.document;
const pointerleaveAliases = makeTypedEventAliases<PointerEvent>('pointerleave');
export const eventPointerleave = pointerleaveAliases.base;
export const eventPointerleaveDelegateLight = pointerleaveAliases.delegateLight;
export const eventPointerleaveDelegateShadow = pointerleaveAliases.delegateShadow;
export const eventPointerleaveDelegateAll = pointerleaveAliases.delegateAll;
export const eventPointerleaveDelegate = pointerleaveAliases.delegate;
export const eventPointerleaveMutationLight = pointerleaveAliases.mutationLight;
export const eventPointerleaveMutationShadow = pointerleaveAliases.mutationShadow;
export const eventPointerleaveMutationAll = pointerleaveAliases.mutationAll;
export const eventPointerleaveMutation = pointerleaveAliases.mutation;
export const eventPointerleaveLight = pointerleaveAliases.light;
export const eventPointerleaveShadow = pointerleaveAliases.shadow;
export const eventPointerleaveAll = pointerleaveAliases.all;
export const eventPointerleaveThis = pointerleaveAliases.this;
export const eventPointerleaveAppHost = pointerleaveAliases.appHost;
export const eventPointerleaveWindow = pointerleaveAliases.window;
export const eventPointerleaveDocument = pointerleaveAliases.document;
const pointercancelAliases = makeTypedEventAliases<PointerEvent>('pointercancel');
export const eventPointercancel = pointercancelAliases.base;
export const eventPointercancelDelegateLight = pointercancelAliases.delegateLight;
export const eventPointercancelDelegateShadow = pointercancelAliases.delegateShadow;
export const eventPointercancelDelegateAll = pointercancelAliases.delegateAll;
export const eventPointercancelDelegate = pointercancelAliases.delegate;
export const eventPointercancelMutationLight = pointercancelAliases.mutationLight;
export const eventPointercancelMutationShadow = pointercancelAliases.mutationShadow;
export const eventPointercancelMutationAll = pointercancelAliases.mutationAll;
export const eventPointercancelMutation = pointercancelAliases.mutation;
export const eventPointercancelLight = pointercancelAliases.light;
export const eventPointercancelShadow = pointercancelAliases.shadow;
export const eventPointercancelAll = pointercancelAliases.all;
export const eventPointercancelThis = pointercancelAliases.this;
export const eventPointercancelAppHost = pointercancelAliases.appHost;
export const eventPointercancelWindow = pointercancelAliases.window;
export const eventPointercancelDocument = pointercancelAliases.document;
const copyAliases = makeTypedEventAliases<ClipboardEvent>('copy');
export const eventCopy = copyAliases.base;
export const eventCopyDelegateLight = copyAliases.delegateLight;
export const eventCopyDelegateShadow = copyAliases.delegateShadow;
export const eventCopyDelegateAll = copyAliases.delegateAll;
export const eventCopyDelegate = copyAliases.delegate;
export const eventCopyMutationLight = copyAliases.mutationLight;
export const eventCopyMutationShadow = copyAliases.mutationShadow;
export const eventCopyMutationAll = copyAliases.mutationAll;
export const eventCopyMutation = copyAliases.mutation;
export const eventCopyLight = copyAliases.light;
export const eventCopyShadow = copyAliases.shadow;
export const eventCopyAll = copyAliases.all;
export const eventCopyThis = copyAliases.this;
export const eventCopyAppHost = copyAliases.appHost;
export const eventCopyWindow = copyAliases.window;
export const eventCopyDocument = copyAliases.document;
const cutAliases = makeTypedEventAliases<ClipboardEvent>('cut');
export const eventCut = cutAliases.base;
export const eventCutDelegateLight = cutAliases.delegateLight;
export const eventCutDelegateShadow = cutAliases.delegateShadow;
export const eventCutDelegateAll = cutAliases.delegateAll;
export const eventCutDelegate = cutAliases.delegate;
export const eventCutMutationLight = cutAliases.mutationLight;
export const eventCutMutationShadow = cutAliases.mutationShadow;
export const eventCutMutationAll = cutAliases.mutationAll;
export const eventCutMutation = cutAliases.mutation;
export const eventCutLight = cutAliases.light;
export const eventCutShadow = cutAliases.shadow;
export const eventCutAll = cutAliases.all;
export const eventCutThis = cutAliases.this;
export const eventCutAppHost = cutAliases.appHost;
export const eventCutWindow = cutAliases.window;
export const eventCutDocument = cutAliases.document;
const pasteAliases = makeTypedEventAliases<ClipboardEvent>('paste');
export const eventPaste = pasteAliases.base;
export const eventPasteDelegateLight = pasteAliases.delegateLight;
export const eventPasteDelegateShadow = pasteAliases.delegateShadow;
export const eventPasteDelegateAll = pasteAliases.delegateAll;
export const eventPasteDelegate = pasteAliases.delegate;
export const eventPasteMutationLight = pasteAliases.mutationLight;
export const eventPasteMutationShadow = pasteAliases.mutationShadow;
export const eventPasteMutationAll = pasteAliases.mutationAll;
export const eventPasteMutation = pasteAliases.mutation;
export const eventPasteLight = pasteAliases.light;
export const eventPasteShadow = pasteAliases.shadow;
export const eventPasteAll = pasteAliases.all;
export const eventPasteThis = pasteAliases.this;
export const eventPasteAppHost = pasteAliases.appHost;
export const eventPasteWindow = pasteAliases.window;
export const eventPasteDocument = pasteAliases.document;
const animationstartAliases = makeTypedEventAliases<AnimationEvent>('animationstart');
export const eventAnimationstart = animationstartAliases.base;
export const eventAnimationstartDelegateLight = animationstartAliases.delegateLight;
export const eventAnimationstartDelegateShadow = animationstartAliases.delegateShadow;
export const eventAnimationstartDelegateAll = animationstartAliases.delegateAll;
export const eventAnimationstartDelegate = animationstartAliases.delegate;
export const eventAnimationstartMutationLight = animationstartAliases.mutationLight;
export const eventAnimationstartMutationShadow = animationstartAliases.mutationShadow;
export const eventAnimationstartMutationAll = animationstartAliases.mutationAll;
export const eventAnimationstartMutation = animationstartAliases.mutation;
export const eventAnimationstartLight = animationstartAliases.light;
export const eventAnimationstartShadow = animationstartAliases.shadow;
export const eventAnimationstartAll = animationstartAliases.all;
export const eventAnimationstartThis = animationstartAliases.this;
export const eventAnimationstartAppHost = animationstartAliases.appHost;
export const eventAnimationstartWindow = animationstartAliases.window;
export const eventAnimationstartDocument = animationstartAliases.document;
const animationendAliases = makeTypedEventAliases<AnimationEvent>('animationend');
export const eventAnimationend = animationendAliases.base;
export const eventAnimationendDelegateLight = animationendAliases.delegateLight;
export const eventAnimationendDelegateShadow = animationendAliases.delegateShadow;
export const eventAnimationendDelegateAll = animationendAliases.delegateAll;
export const eventAnimationendDelegate = animationendAliases.delegate;
export const eventAnimationendMutationLight = animationendAliases.mutationLight;
export const eventAnimationendMutationShadow = animationendAliases.mutationShadow;
export const eventAnimationendMutationAll = animationendAliases.mutationAll;
export const eventAnimationendMutation = animationendAliases.mutation;
export const eventAnimationendLight = animationendAliases.light;
export const eventAnimationendShadow = animationendAliases.shadow;
export const eventAnimationendAll = animationendAliases.all;
export const eventAnimationendThis = animationendAliases.this;
export const eventAnimationendAppHost = animationendAliases.appHost;
export const eventAnimationendWindow = animationendAliases.window;
export const eventAnimationendDocument = animationendAliases.document;
const animationiterationAliases = makeTypedEventAliases<AnimationEvent>('animationiteration');
export const eventAnimationiteration = animationiterationAliases.base;
export const eventAnimationiterationDelegateLight = animationiterationAliases.delegateLight;
export const eventAnimationiterationDelegateShadow = animationiterationAliases.delegateShadow;
export const eventAnimationiterationDelegateAll = animationiterationAliases.delegateAll;
export const eventAnimationiterationDelegate = animationiterationAliases.delegate;
export const eventAnimationiterationMutationLight = animationiterationAliases.mutationLight;
export const eventAnimationiterationMutationShadow = animationiterationAliases.mutationShadow;
export const eventAnimationiterationMutationAll = animationiterationAliases.mutationAll;
export const eventAnimationiterationMutation = animationiterationAliases.mutation;
export const eventAnimationiterationLight = animationiterationAliases.light;
export const eventAnimationiterationShadow = animationiterationAliases.shadow;
export const eventAnimationiterationAll = animationiterationAliases.all;
export const eventAnimationiterationThis = animationiterationAliases.this;
export const eventAnimationiterationAppHost = animationiterationAliases.appHost;
export const eventAnimationiterationWindow = animationiterationAliases.window;
export const eventAnimationiterationDocument = animationiterationAliases.document;
const animationcancelAliases = makeTypedEventAliases<AnimationEvent>('animationcancel');
export const eventAnimationcancel = animationcancelAliases.base;
export const eventAnimationcancelDelegateLight = animationcancelAliases.delegateLight;
export const eventAnimationcancelDelegateShadow = animationcancelAliases.delegateShadow;
export const eventAnimationcancelDelegateAll = animationcancelAliases.delegateAll;
export const eventAnimationcancelDelegate = animationcancelAliases.delegate;
export const eventAnimationcancelMutationLight = animationcancelAliases.mutationLight;
export const eventAnimationcancelMutationShadow = animationcancelAliases.mutationShadow;
export const eventAnimationcancelMutationAll = animationcancelAliases.mutationAll;
export const eventAnimationcancelMutation = animationcancelAliases.mutation;
export const eventAnimationcancelLight = animationcancelAliases.light;
export const eventAnimationcancelShadow = animationcancelAliases.shadow;
export const eventAnimationcancelAll = animationcancelAliases.all;
export const eventAnimationcancelThis = animationcancelAliases.this;
export const eventAnimationcancelAppHost = animationcancelAliases.appHost;
export const eventAnimationcancelWindow = animationcancelAliases.window;
export const eventAnimationcancelDocument = animationcancelAliases.document;
const transitionstartAliases = makeTypedEventAliases<TransitionEvent>('transitionstart');
export const eventTransitionstart = transitionstartAliases.base;
export const eventTransitionstartDelegateLight = transitionstartAliases.delegateLight;
export const eventTransitionstartDelegateShadow = transitionstartAliases.delegateShadow;
export const eventTransitionstartDelegateAll = transitionstartAliases.delegateAll;
export const eventTransitionstartDelegate = transitionstartAliases.delegate;
export const eventTransitionstartMutationLight = transitionstartAliases.mutationLight;
export const eventTransitionstartMutationShadow = transitionstartAliases.mutationShadow;
export const eventTransitionstartMutationAll = transitionstartAliases.mutationAll;
export const eventTransitionstartMutation = transitionstartAliases.mutation;
export const eventTransitionstartLight = transitionstartAliases.light;
export const eventTransitionstartShadow = transitionstartAliases.shadow;
export const eventTransitionstartAll = transitionstartAliases.all;
export const eventTransitionstartThis = transitionstartAliases.this;
export const eventTransitionstartAppHost = transitionstartAliases.appHost;
export const eventTransitionstartWindow = transitionstartAliases.window;
export const eventTransitionstartDocument = transitionstartAliases.document;
const transitionendAliases = makeTypedEventAliases<TransitionEvent>('transitionend');
export const eventTransitionend = transitionendAliases.base;
export const eventTransitionendDelegateLight = transitionendAliases.delegateLight;
export const eventTransitionendDelegateShadow = transitionendAliases.delegateShadow;
export const eventTransitionendDelegateAll = transitionendAliases.delegateAll;
export const eventTransitionendDelegate = transitionendAliases.delegate;
export const eventTransitionendMutationLight = transitionendAliases.mutationLight;
export const eventTransitionendMutationShadow = transitionendAliases.mutationShadow;
export const eventTransitionendMutationAll = transitionendAliases.mutationAll;
export const eventTransitionendMutation = transitionendAliases.mutation;
export const eventTransitionendLight = transitionendAliases.light;
export const eventTransitionendShadow = transitionendAliases.shadow;
export const eventTransitionendAll = transitionendAliases.all;
export const eventTransitionendThis = transitionendAliases.this;
export const eventTransitionendAppHost = transitionendAliases.appHost;
export const eventTransitionendWindow = transitionendAliases.window;
export const eventTransitionendDocument = transitionendAliases.document;
const transitioncancelAliases = makeTypedEventAliases<TransitionEvent>('transitioncancel');
export const eventTransitioncancel = transitioncancelAliases.base;
export const eventTransitioncancelDelegateLight = transitioncancelAliases.delegateLight;
export const eventTransitioncancelDelegateShadow = transitioncancelAliases.delegateShadow;
export const eventTransitioncancelDelegateAll = transitioncancelAliases.delegateAll;
export const eventTransitioncancelDelegate = transitioncancelAliases.delegate;
export const eventTransitioncancelMutationLight = transitioncancelAliases.mutationLight;
export const eventTransitioncancelMutationShadow = transitioncancelAliases.mutationShadow;
export const eventTransitioncancelMutationAll = transitioncancelAliases.mutationAll;
export const eventTransitioncancelMutation = transitioncancelAliases.mutation;
export const eventTransitioncancelLight = transitioncancelAliases.light;
export const eventTransitioncancelShadow = transitioncancelAliases.shadow;
export const eventTransitioncancelAll = transitioncancelAliases.all;
export const eventTransitioncancelThis = transitioncancelAliases.this;
export const eventTransitioncancelAppHost = transitioncancelAliases.appHost;
export const eventTransitioncancelWindow = transitioncancelAliases.window;
export const eventTransitioncancelDocument = transitioncancelAliases.document;
const transitionrunAliases = makeTypedEventAliases<TransitionEvent>('transitionrun');
export const eventTransitionrun = transitionrunAliases.base;
export const eventTransitionrunDelegateLight = transitionrunAliases.delegateLight;
export const eventTransitionrunDelegateShadow = transitionrunAliases.delegateShadow;
export const eventTransitionrunDelegateAll = transitionrunAliases.delegateAll;
export const eventTransitionrunDelegate = transitionrunAliases.delegate;
export const eventTransitionrunMutationLight = transitionrunAliases.mutationLight;
export const eventTransitionrunMutationShadow = transitionrunAliases.mutationShadow;
export const eventTransitionrunMutationAll = transitionrunAliases.mutationAll;
export const eventTransitionrunMutation = transitionrunAliases.mutation;
export const eventTransitionrunLight = transitionrunAliases.light;
export const eventTransitionrunShadow = transitionrunAliases.shadow;
export const eventTransitionrunAll = transitionrunAliases.all;
export const eventTransitionrunThis = transitionrunAliases.this;
export const eventTransitionrunAppHost = transitionrunAliases.appHost;
export const eventTransitionrunWindow = transitionrunAliases.window;
export const eventTransitionrunDocument = transitionrunAliases.document;
const scrollAliases = makeTypedEventAliases<Event>('scroll');
export const eventScroll = scrollAliases.base;
export const eventScrollDelegateLight = scrollAliases.delegateLight;
export const eventScrollDelegateShadow = scrollAliases.delegateShadow;
export const eventScrollDelegateAll = scrollAliases.delegateAll;
export const eventScrollDelegate = scrollAliases.delegate;
export const eventScrollMutationLight = scrollAliases.mutationLight;
export const eventScrollMutationShadow = scrollAliases.mutationShadow;
export const eventScrollMutationAll = scrollAliases.mutationAll;
export const eventScrollMutation = scrollAliases.mutation;
export const eventScrollLight = scrollAliases.light;
export const eventScrollShadow = scrollAliases.shadow;
export const eventScrollAll = scrollAliases.all;
export const eventScrollThis = scrollAliases.this;
export const eventScrollAppHost = scrollAliases.appHost;
export const eventScrollWindow = scrollAliases.window;
export const eventScrollDocument = scrollAliases.document;
const resizeAliases = makeTypedEventAliases<UIEvent>('resize');
export const eventResize = resizeAliases.base;
export const eventResizeDelegateLight = resizeAliases.delegateLight;
export const eventResizeDelegateShadow = resizeAliases.delegateShadow;
export const eventResizeDelegateAll = resizeAliases.delegateAll;
export const eventResizeDelegate = resizeAliases.delegate;
export const eventResizeMutationLight = resizeAliases.mutationLight;
export const eventResizeMutationShadow = resizeAliases.mutationShadow;
export const eventResizeMutationAll = resizeAliases.mutationAll;
export const eventResizeMutation = resizeAliases.mutation;
export const eventResizeLight = resizeAliases.light;
export const eventResizeShadow = resizeAliases.shadow;
export const eventResizeAll = resizeAliases.all;
export const eventResizeThis = resizeAliases.this;
export const eventResizeAppHost = resizeAliases.appHost;
export const eventResizeWindow = resizeAliases.window;
export const eventResizeDocument = resizeAliases.document;
const loadAliases = makeTypedEventAliases<Event>('load');
export const eventLoad = loadAliases.base;
export const eventLoadDelegateLight = loadAliases.delegateLight;
export const eventLoadDelegateShadow = loadAliases.delegateShadow;
export const eventLoadDelegateAll = loadAliases.delegateAll;
export const eventLoadDelegate = loadAliases.delegate;
export const eventLoadMutationLight = loadAliases.mutationLight;
export const eventLoadMutationShadow = loadAliases.mutationShadow;
export const eventLoadMutationAll = loadAliases.mutationAll;
export const eventLoadMutation = loadAliases.mutation;
export const eventLoadLight = loadAliases.light;
export const eventLoadShadow = loadAliases.shadow;
export const eventLoadAll = loadAliases.all;
export const eventLoadThis = loadAliases.this;
export const eventLoadAppHost = loadAliases.appHost;
export const eventLoadWindow = loadAliases.window;
export const eventLoadDocument = loadAliases.document;
const errorAliases = makeTypedEventAliases<Event>('error');
export const eventError = errorAliases.base;
export const eventErrorDelegateLight = errorAliases.delegateLight;
export const eventErrorDelegateShadow = errorAliases.delegateShadow;
export const eventErrorDelegateAll = errorAliases.delegateAll;
export const eventErrorDelegate = errorAliases.delegate;
export const eventErrorMutationLight = errorAliases.mutationLight;
export const eventErrorMutationShadow = errorAliases.mutationShadow;
export const eventErrorMutationAll = errorAliases.mutationAll;
export const eventErrorMutation = errorAliases.mutation;
export const eventErrorLight = errorAliases.light;
export const eventErrorShadow = errorAliases.shadow;
export const eventErrorAll = errorAliases.all;
export const eventErrorThis = errorAliases.this;
export const eventErrorAppHost = errorAliases.appHost;
export const eventErrorWindow = errorAliases.window;
export const eventErrorDocument = errorAliases.document;
const toggleAliases = makeTypedEventAliases<Event>('toggle');
export const eventToggle = toggleAliases.base;
export const eventToggleDelegateLight = toggleAliases.delegateLight;
export const eventToggleDelegateShadow = toggleAliases.delegateShadow;
export const eventToggleDelegateAll = toggleAliases.delegateAll;
export const eventToggleDelegate = toggleAliases.delegate;
export const eventToggleMutationLight = toggleAliases.mutationLight;
export const eventToggleMutationShadow = toggleAliases.mutationShadow;
export const eventToggleMutationAll = toggleAliases.mutationAll;
export const eventToggleMutation = toggleAliases.mutation;
export const eventToggleLight = toggleAliases.light;
export const eventToggleShadow = toggleAliases.shadow;
export const eventToggleAll = toggleAliases.all;
export const eventToggleThis = toggleAliases.this;
export const eventToggleAppHost = toggleAliases.appHost;
export const eventToggleWindow = toggleAliases.window;
export const eventToggleDocument = toggleAliases.document;
export const getAddEventListenerMetadata = (target: any): AddEventListenerMetadata<Event>[] | undefined => {
  const constructor = target instanceof Function ? target : target.constructor;
  return ReflectUtils.getMetadata(ADD_EVENT_LISTENER_METADATA_KEY, constructor);
};

// ─────────────────────────────────────────────────────────────────────────────
// EventListenerLifeCycler
// ─────────────────────────────────────────────────────────────────────────────
import { ElementDefineLifeCycler, MutationObserverSetEntry, OnConnectedResult } from '../types';
import { Subject } from '@dooboostore/core';
import { debounceTime, distinctUntilChanged, throttleTime } from '@dooboostore/core/message/operators';
import { SwcUtils } from '../utils/Utils';
import { buildSwcParameterArgs } from './parameter';

export interface BoundListenerEntry {
  target: EventTarget;
  type: string;
  handler: EventListener;
  options: AddEventListenerOptions;
  onRemoves?: Array<{ fn: (target: EventTarget, optionValue: unknown) => void; opts: unknown }>;
  subscription?: { unsubscribe: () => void };
  meta?: AddEventListenerMetadata<Event>;
}

export class EventListenerLifeCycler implements ElementDefineLifeCycler {
  /** 인스턴스별 boundListeners 상태 (시클러는 elementDefine 시 1회 생성되어 공유되므로) */
  private readonly boundListenersMap = new WeakMap<Element, BoundListenerEntry[]>();
  /** 인스턴스별 delegate:'mutation' 바인딩 추적 WeakSet — MutationObserverLifeCycler 에서 참조 */
  private readonly eventBoundSetsMap = new WeakMap<Element, Map<AddEventListenerMetadata, WeakSet<Element>>>();

  // ── 외부(MutationObserverLifeCycler)에서 직접 사용하는 공개 헬퍼 ──

  /** 인스턴스별 boundListeners 를 반환한다 (없으면 생성). */
  getBoundListeners(inst: Element): BoundListenerEntry[] {
    let list = this.boundListenersMap.get(inst);
    if (!list) { list = []; this.boundListenersMap.set(inst, list); }
    return list;
  }

  /** 인스턴스별 eventBoundSets 를 반환한다 (없으면 생성). */
  getEventBoundSets(inst: Element): Map<AddEventListenerMetadata, WeakSet<Element>> {
    let map = this.eventBoundSetsMap.get(inst);
    if (!map) { map = new Map(); this.eventBoundSetsMap.set(inst, map); }
    return map;
  }

  /**
   * target 에 meta 이벤트를 직접 바인딩한다.
   * delegate:'mutation' 초기/동적 바인딩에서 호출된다.
   */
  bindDirect(helperHostSet: HelperHostSet, target: EventTarget, meta: AddEventListenerMetadata): void {
    const inst = helperHostSet.$this;
    const currentWin = helperHostSet.$w;
    const { type, options } = meta;
    const opts = { capture: options.capture, once: options.once, passive: options.passive };

    const handler = async (event: Event) => {
      const helper = (options.filter || options.before || options.finally) ? SwcUtils.getHelperAndHostSet(currentWin, target as HTMLElement) : undefined;
      if (options.filter) {
        if (!(await options.filter(event, { currentThis: inst, helper }))) return;
      }
      if (options.stopPropagation) event.stopPropagation();
      if (options.stopImmediatePropagation) event.stopImmediatePropagation();
      if (options.preventDefault) event.preventDefault();
      const currentHostSet = SwcUtils.getHostSet(inst);
      const legacyArgs = [event, { currentHostSet, $matchedElement: event.currentTarget }, { event, ...currentHostSet, $el: target, $root: target }];
      const currentHelperSet = SwcUtils.getHelperSet(currentWin);
      const currentHelperHostSet = { ...currentHelperSet, ...currentHostSet, $this: inst };
      const buildArgs = (beforeReturn: any) => buildSwcParameterArgs(inst, meta.propertyKey, {
        eventObject: event,
        matchedElement: event.currentTarget,
        hostSet: currentHostSet,
        helperHostSet: currentHelperHostSet,
        helperSet: currentHelperSet,
        eventBeforeReturn: beforeReturn
      }, legacyArgs);
      // before를 먼저 돌려 그 리턴값을 @eventBeforeReturn 으로 주입. before엔 (아직 자기 리턴 전이라
      // eventBeforeReturn=undefined인) args를 넘기고, 리턴을 받은 뒤 args를 다시 빌드해 핸들러에 넘긴다.
      let args = buildArgs(undefined);
      if (options.before) {
        const beforeReturn = await options.before(event, { currentThis: inst, helper }, args);
        args = buildArgs(beforeReturn);
      }
      let result: any, error: any;
      try {
        result = await inst[meta.propertyKey](...args);
      } catch (e) {
        error = e;
      } finally {
        if (options.finally) await options.finally(event, { currentThis: inst, helper }, { args, result, error });
      }
      if (error) throw error;
    };

    const eventSubject = new Subject<Event>();
    let eventStream: any = eventSubject;
    if (options.debounceTime && options.debounceTime > 0)
      eventStream = eventStream.pipe(debounceTime(options.debounceTime));
    if (options.throttleTime && options.throttleTime > 0)
      eventStream = eventStream.pipe(throttleTime(options.throttleTime));
    if (options.distinctUntilChanged !== undefined && options.distinctUntilChanged !== false) {
      eventStream = typeof options.distinctUntilChanged === 'function'
        ? eventStream.pipe(distinctUntilChanged(options.distinctUntilChanged))
        : eventStream.pipe(distinctUntilChanged());
    }

    const subscription = eventStream.subscribe({
      next: (e: Event) => handler(e).catch((err: any) => console.error('Event handler error:', err)),
      error: (err: any) => console.error('Event stream error:', err),
    });

    const wrappedHandler = (event: Event) => eventSubject.next(event);
    target.addEventListener(type, wrappedHandler, opts);

    const onRemoves: Array<{ fn: any; opts: any }> =
      options.removeListener ? [{ fn: options.removeListener, opts: options }] : [];
    this.getBoundListeners(inst).push({ target, type, handler: wrappedHandler, options: opts, subscription, onRemoves, meta });
  }

  /** target + meta 조합 리스너를 제거한다. MutationObserver 추적 요소 제거 시 호출. */
  unbindDirect(helperHostSet: HelperHostSet, target: EventTarget, meta: AddEventListenerMetadata): void {
    const inst = helperHostSet.$this;
    const list = this.getBoundListeners(inst);
    for (let i = list.length - 1; i >= 0; i--) {
      const l = list[i];
      if (l.target === target && l.type === meta.type && l.meta === meta) {
        try { l.target.removeEventListener(l.type, l.handler, l.options); l.subscription?.unsubscribe?.(); }
        catch (e) { console.error('[SWC] unbindDirect error:', e); }
        for (const r of l.onRemoves ?? []) {
          try { r.fn(l.target, r.opts); } catch (e) { console.error('[SWC] unbindDirect removeListener error:', e); }
        }
        list.splice(i, 1);
      }
    }
  }

  /**
   * 메타데이터 목록을 delegate / mutationDelegate / nonDelegate 로 분류한다.
   * MutationObserverLifeCycler 에서 mutationDelegate 목록을 꺼낼 때 사용한다.
   */
  classifyListeners(metaList: AddEventListenerMetadata[]): {
    delegateListeners: AddEventListenerMetadata[];
    mutationDelegateListeners: AddEventListenerMetadata[];
    nonDelegateListeners: AddEventListenerMetadata[];
  } {
    const isSpecial = (sel: any) =>
      ['$window', '$document', '$host', '$appHost', '$firstHost', '$lastHost',
       '$firstAppHost', '$lastAppHost', '$hosts', '$appHosts', '$this', ''].includes(sel);

    const delegateListeners: AddEventListenerMetadata[] = [];
    const mutationDelegateListeners: AddEventListenerMetadata[] = [];
    const nonDelegateListeners: AddEventListenerMetadata[] = [];

    for (const meta of metaList) {
      const isStr = typeof meta.selector === 'string';
      const mode = meta.options.delegate;
      if (mode && isStr && !isSpecial(meta.selector)) {
        mode === 'mutation' ? mutationDelegateListeners.push(meta) : delegateListeners.push(meta);
      } else {
        nonDelegateListeners.push(meta);
      }
    }
    return { delegateListeners, mutationDelegateListeners, nonDelegateListeners };
  }

  // ── ElementDefineLifeCycler 구현 ──

  onConnected(helperHostSet: HelperHostSet): OnConnectedResult | void {
    const inst = helperHostSet.$this;
    const currentWin = helperHostSet.$w;

    this.boundListenersMap.delete(inst);
    this.eventBoundSetsMap.delete(inst);

    const allMeta = getAddEventListenerMetadata(inst) ?? [];
    const { delegateListeners, nonDelegateListeners, mutationDelegateListeners } = this.classifyListeners(allMeta);

    // ── delegate 리스너: type+root 키로 그룹핑 → unified handler ──
    const groups = new Map<string, AddEventListenerMetadata[]>();
    for (const meta of delegateListeners) {
      const key = `${meta.type}:${meta.options.root || 'auto'}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(meta);
    }

    groups.forEach((metaList, key) => {
      const ci = key.indexOf(':');
      const type = key.slice(0, ci);
      const r = key.slice(ci + 1);
      const opts = { capture: metaList[0].options.capture, once: metaList[0].options.once, passive: metaList[0].options.passive };

      const roots: (HTMLElement | ShadowRoot)[] = [];
      if (r === 'auto') roots.push(inst.shadowRoot || inst);
      else if (r === 'light') roots.push(inst);
      else if (r === 'shadow' && inst.shadowRoot) roots.push(inst.shadowRoot);
      else if (r === 'all') { roots.push(inst); if (inst.shadowRoot) roots.push(inst.shadowRoot); }

      for (const br of roots) {
        const sorted = [...metaList].sort((a, b) => (b.options.stopPropagation ? 1 : 0) - (a.options.stopPropagation ? 1 : 0));
        const handler = async (event: Event) => {
          // shadow 경계를 넘는(composed) 이벤트는 네이티브 dispatch가 끝나면(= 아래 루프에서
          // 첫 await가 제어권을 넘기는 순간, 브라우저는 비동기 리스너를 기다리지 않고 dispatch를
          // 마저 진행/종료한다) event.target/closest()가 더 이상 신뢰할 수 없어진다. 그래서 같은
          // selector를 공유하는 핸들러가 여러 개일 때 두 번째 이후 핸들러는 매칭이 깨질 수 있다 —
          // await 전에 전부 동기적으로 먼저 매칭해둔다.
          const matches = sorted.map(m => ({ m, matchedEl: (event.target as HTMLElement)?.closest(m.selector as string) }));
          for (const { m, matchedEl } of matches) {
            if (matchedEl && (br as any).contains(matchedEl)) {
              const helper = (m.options.filter || m.options.before || m.options.finally) ? SwcUtils.getHelperAndHostSet(currentWin, matchedEl as HTMLElement) : undefined;
              if (m.options.filter) {
                if (!(await m.options.filter(event, { currentThis: inst, helper }))) continue;
              }
              if (m.options.stopPropagation) event.stopPropagation();
              if (m.options.stopImmediatePropagation) event.stopImmediatePropagation();
              if (m.options.preventDefault) event.preventDefault();
              const hs = SwcUtils.getHostSet(inst);
              const legacyArgs = [event, { ...hs, $matchedElement: matchedEl }, { event, ...hs, $el: matchedEl, $root: br }];
              const helperSetForMatch = SwcUtils.getHelperSet(currentWin);
              const helperHostSetForMatch = { ...helperSetForMatch, ...hs, $this: inst };
              const buildArgs = (beforeReturn: any) => buildSwcParameterArgs(inst, m.propertyKey, {
                eventObject: event,
                matchedElement: matchedEl,
                hostSet: hs,
                helperHostSet: helperHostSetForMatch,
                helperSet: helperSetForMatch,
                eventBeforeReturn: beforeReturn
              }, legacyArgs);
              // before를 먼저 돌려 그 리턴값을 @eventBeforeReturn 으로 주입.
              let args = buildArgs(undefined);
              if (m.options.before) {
                const beforeReturn = await m.options.before(event, { currentThis: inst, helper }, args);
                args = buildArgs(beforeReturn);
              }
              let result: any, error: any;
              try {
                result = await inst[m.propertyKey](...args);
              } catch (e) {
                error = e;
              } finally {
                if (m.options.finally) await m.options.finally(event, { currentThis: inst, helper }, { args, result, error });
              }
              if (error) throw error;
              if ((event as any).cancelBubble) break;
            }
          }
        };
        br.addEventListener(type, handler, opts);
        const onRemoves: Array<{ fn: any; opts: any }> = sorted.filter(m => m.options.removeListener).map(m => ({ fn: m.options.removeListener, opts: m.options }));
        this.getBoundListeners(inst).push({ target: br, type, handler, options: opts, onRemoves });
      }
    });

    // ── non-delegate 리스너: 대상 요소 직접 탐색 → bindDirect ──
    for (const meta of nonDelegateListeners) {
      const { selector, options } = meta;
      const r = options.root || 'auto';
      const bindTargets: EventTarget[] = [];

      let resolvedSel: string | null = null;
      if (typeof selector === 'function') {
        const result = selector(inst, helperHostSet);
        if (typeof result === 'string') resolvedSel = result;
        else if (result instanceof currentWin.Element) bindTargets.push(result as EventTarget);
        else if (result instanceof currentWin.NodeList) bindTargets.push(...(Array.from(result) as EventTarget[]));
        else if (Array.isArray(result)) bindTargets.push(...(result as EventTarget[]));
      } else {
        resolvedSel = selector;
      }

      const applyRoot = (t: any) => {
        if (!t) return;
        if (r === 'auto') bindTargets.push(t.shadowRoot || t);
        else { if (r === 'light' || r === 'all') bindTargets.push(t); if ((r === 'shadow' || r === 'all') && t.shadowRoot) bindTargets.push(t.shadowRoot); }
      };

      if (resolvedSel) {
        if (resolvedSel === '$window') bindTargets.push(currentWin);
        else if (resolvedSel === '$document') bindTargets.push(currentWin.document);
        else if (resolvedSel === '$host') applyRoot(helperHostSet.$host);
        else if (resolvedSel === '$parentHost') applyRoot(helperHostSet.$parentHost);
        else if (resolvedSel === '$appHost') applyRoot(helperHostSet.$appHost);
        else if (resolvedSel === '$firstHost') applyRoot(helperHostSet.$firstHost);
        else if (resolvedSel === '$lastHost') applyRoot(helperHostSet.$lastHost);
        else if (resolvedSel === '$firstAppHost') applyRoot(helperHostSet.$firstAppHost);
        else if (resolvedSel === '$lastAppHost') applyRoot(helperHostSet.$lastAppHost);
        else if (resolvedSel === '$hosts') helperHostSet.$hosts.forEach(applyRoot);
        else if (resolvedSel === '$appHosts') helperHostSet.$appHosts.forEach(applyRoot);
        else if (resolvedSel === '$this' || !resolvedSel) applyRoot(inst);
        else {
          const searchRoots: (HTMLElement | ShadowRoot)[] = [];
          if (r === 'auto') searchRoots.push(inst.shadowRoot || inst);
          else if (r === 'light') searchRoots.push(inst);
          else if (r === 'shadow' && inst.shadowRoot) searchRoots.push(inst.shadowRoot);
          else if (r === 'all') { searchRoots.push(inst); if (inst.shadowRoot) searchRoots.push(inst.shadowRoot); }
          for (const sr of searchRoots) sr.querySelectorAll(resolvedSel).forEach(el => bindTargets.push(el));
        }
      }

      for (const t of bindTargets) this.bindDirect(helperHostSet, t, meta);
    }

    // ── delegate:'mutation' 리스너: MutationObserver 로 추가/제거된 요소를 추적해 직접 바인딩/해제 ──
    // 이벤트 리스너의 책임이므로 EventListenerLifeCycler 가 직접 처리하고,
    // mutationObserverSet 을 반환해 elementDefine 이 하나의 MutationObserver 로 생성하게 한다.
    if (mutationDelegateListeners.length > 0) {
      const shadowEventDelegates = mutationDelegateListeners.filter(m => {
        const r = m.options.root || 'auto';
        return inst.shadowRoot && (r === 'shadow' || r === 'all' || r === 'auto');
      });
      const lightEventDelegates = mutationDelegateListeners.filter(m => {
        const r = m.options.root || 'auto';
        return r === 'light' || r === 'all' || (!inst.shadowRoot && r === 'auto');
      });

      const buildMutationEntry = (
        root: HTMLElement | ShadowRoot,
        eventDelegates: AddEventListenerMetadata[],
      ): MutationObserverSetEntry | null => {
        if (eventDelegates.length === 0) return null;
        const boundSets = this.getEventBoundSets(inst);

        const callback = (mutations: MutationRecord[], obs: MutationObserver) => {
          for (const m of eventDelegates) {
            let boundSet = boundSets.get(m);
            if (!boundSet) { boundSet = new WeakSet<Element>(); boundSets.set(m, boundSet); }

            const isThis = m.selector === '$this' || m.selector === '';
            const matchesSel = (n: any) => {
              if (!n || n.nodeType !== 1) return false;
              if (isThis) return true;
              return typeof m.selector === 'string' && (n as HTMLElement).matches?.(m.selector);
            };
            const bindEl   = (el: Element) => { if (!boundSet!.has(el)) { this.bindDirect(helperHostSet, el, m); boundSet!.add(el); } };
            const unbindEl = (el: Element) => { if (boundSet!.has(el))  { this.unbindDirect(helperHostSet, el, m); boundSet!.delete(el); } };

            for (const mut of mutations) {
              Array.from(mut.addedNodes   || []).forEach(n => { if (n.nodeType !== 1) return; if (matchesSel(n)) bindEl(n as Element); else if (!isThis && typeof m.selector === 'string') (n as Element).querySelectorAll?.(m.selector).forEach(bindEl); });
              Array.from(mut.removedNodes || []).forEach(n => { if (n.nodeType !== 1) return; const el = n as Element; if (matchesSel(el)) unbindEl(el); else if (!isThis && typeof m.selector === 'string') el.querySelectorAll?.(m.selector).forEach(unbindEl); });
            }
          }
        };

        // delegate:'mutation' 초기 바인딩 (connected 시 이미 존재하는 요소)
        for (const m of eventDelegates) {
          let boundSet = boundSets.get(m);
          if (!boundSet) { boundSet = new WeakSet<Element>(); boundSets.set(m, boundSet); }
          if (typeof m.selector !== 'string') continue;
          if (m.selector === '$this' || m.selector === '') {
            this.bindDirect(helperHostSet, root as EventTarget, m);
            boundSet.add(root as Element);
          } else {
            root.querySelectorAll(m.selector).forEach(el => {
              if (!boundSet!.has(el)) { this.bindDirect(helperHostSet, el, m); boundSet!.add(el); }
            });
          }
        }

        return { target: root, options: { childList: true, subtree: true }, callback };
      };

      const shadowEntry = inst.shadowRoot ? buildMutationEntry(inst.shadowRoot, shadowEventDelegates) : null;
      const lightEntry = buildMutationEntry(inst as any, lightEventDelegates);
      const mutationObserverSet: MutationObserverSetEntry[] = [shadowEntry, lightEntry].filter(Boolean) as MutationObserverSetEntry[];
      if (mutationObserverSet.length > 0) return { mutationObserverSet };
    }

    return undefined;
  }

  onDisconnected(helperHostSet: HelperHostSet): void {
    const inst = helperHostSet.$this;
    const list = this.boundListenersMap.get(inst) ?? [];
    for (const l of list) {
      try { l.target.removeEventListener(l.type, l.handler, l.options); l.subscription?.unsubscribe?.(); }
      catch (e) { console.error('[SWC] EventListenerLifeCycler cleanup error:', e); }
      for (const r of l.onRemoves ?? []) {
        try { r.fn(l.target, r.opts); } catch (e) { console.error('[SWC] removeListener error:', e); }
      }
    }
    this.boundListenersMap.delete(inst);
    this.eventBoundSetsMap.delete(inst);
  }
}
