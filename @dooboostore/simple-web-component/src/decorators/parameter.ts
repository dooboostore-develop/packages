import { ReflectUtils } from '@dooboostore/core';

/**
 * @eventObject/@matchedElement/@hostSet/@helperHostSet/@helperSet/@swcAppRouterEvent/@appMessage/@eventBeforeReturn —
 * @event/lifecycle/subscribeSwcAppRouteChange/subscribeSwcAppMessage
 * 계열 핸들러의 파라미터를 순서 무관하게 선언할 수 있게 해주는 파라미터 데코레이터.
 * @dooboostore/simple-boot의 @Inject와 동일한 인덱스 기반 메타데이터 패턴을 따른다:
 * 데코레이터가 실행되는 순서가 아니라 실제 parameterIndex로 슬롯을 매칭하므로,
 * 사용자가 파라미터 선언 순서를 자유롭게 바꿔도 된다.
 */
export type SwcParamKind = 'eventObject' | 'matchedElement' | 'hostSet' | 'helperHostSet' | 'helperSet' | 'swcAppRouterEvent' | 'appMessage' | 'eventBeforeReturn' | 'appMessageBeforeReturn' | 'routeChangeBeforeReturn' | 'eventMediaBeforeReturn' | 'mutationObserverBeforeReturn' | 'intersectionObserverBeforeReturn' | 'resizeObserverBeforeReturn' | 'changedAttributeBeforeReturn' | 'setTimeoutBeforeReturn' | 'setIntervalBeforeReturn' | 'fetchSettled'
  | SwcRouteParamKind;

/** 라우트 핸들러 전용 (subscribeSwcAppRouteChange 가 채움). kind 이름 = 데코레이터 이름 */
export type SwcRouteParamKind =
  | 'swcAppRouteQueryParam' | 'swcAppRouteFirstQueryParam' | 'swcAppRouteLastQueryParam' | 'swcAppRouteQueryParams'
  | 'swcAppRouteQueryParamObject' | 'swcAppRouteFirstQueryParamObject' | 'swcAppRouteLastQueryParamObject' | 'swcAppRouteQueryParamsObject'
  | 'swcAppRouteURLSearchParams'
  | 'swcAppRoutePathVariable' | 'swcAppRouteFirstPathVariable' | 'swcAppRouteLastPathVariable' | 'swcAppRoutePathVariables'
  | 'swcAppRoutePathVariableObject' | 'swcAppRouteFirstPathVariableObject' | 'swcAppRouteLastPathVariableObject' | 'swcAppRoutePathVariablesObject';

const SWC_PARAMETER_METADATA_KEY = Symbol.for('simple-web-component:parameter');

/** key: @swcAppRouteQueryParam('q') 처럼 키를 받는 파라미터 데코레이터의 키 */
type SaveParamConfig = { index: number; kind: SwcParamKind; key?: string };

const registerParam = (kind: SwcParamKind, target: Object, propertyKey: string | symbol | undefined, parameterIndex: number, key?: string) => {
  if (!propertyKey) return;
  const constructor = target.constructor;
  const saves = (ReflectUtils.getOwnMetadata(SWC_PARAMETER_METADATA_KEY, constructor, propertyKey) ?? []) as SaveParamConfig[];
  saves.push(key === undefined ? { index: parameterIndex, kind } : { index: parameterIndex, kind, key });
  ReflectUtils.defineMetadata(SWC_PARAMETER_METADATA_KEY, saves, constructor, propertyKey);
};

/** 이벤트 핸들러의 원본 Event 객체를 주입한다. */
export function eventObject(target: Object, propertyKey: string | symbol, parameterIndex: number): void {
  registerParam('eventObject', target, propertyKey, parameterIndex);
}

/** delegate로 매칭된 실제 엘리먼트($matchedElement)를 주입한다. */
export function matchedElement(target: Object, propertyKey: string | symbol, parameterIndex: number): void {
  registerParam('matchedElement', target, propertyKey, parameterIndex);
}

/** HostSet(호스트 트리 정보 — $host/$hosts/$firstHost/$appHost 등)을 주입한다. */
export function hostSet(target: Object, propertyKey: string | symbol, parameterIndex: number): void {
  registerParam('hostSet', target, propertyKey, parameterIndex);
}

/** HelperHostSet(HelperSet + HostSet + $this 전체 묶음)을 주입한다. */
export function helperHostSet(target: Object, propertyKey: string | symbol, parameterIndex: number): void {
  registerParam('helperHostSet', target, propertyKey, parameterIndex);
}

/** HelperSet($d/$w/$q/$qa/$qi 등 순수 DOM/window 헬퍼, 호스트 트리 정보 없음)을 주입한다. */
export function helperSet(target: Object, propertyKey: string | symbol, parameterIndex: number): void {
  registerParam('helperSet', target, propertyKey, parameterIndex);
}

/** @subscribeSwcAppRouteChange 핸들러의 라우트 변경 이벤트({...RouterEventType, pathData})를 주입한다. */
export function swcAppRouterEvent(target: Object, propertyKey: string | symbol, parameterIndex: number): void {
  registerParam('swcAppRouterEvent', target, propertyKey, parameterIndex);
}

/** @subscribeSwcAppMessage 핸들러의 SwcAppMessage 페이로드를 주입한다. */
export function appMessage(target: Object, propertyKey: string | symbol, parameterIndex: number): void {
  registerParam('appMessage', target, propertyKey, parameterIndex);
}

/**
 * @event 계열의 before 훅이 이번 호출에 리턴한 값을 주입한다.
 * (before에서 async로 준비한 데이터를 핸들러가 받는 용도. before 없으면 undefined)
 * 예: @eventClick({ before: () => loadUser() }) onClick(@eventBeforeReturn user) { ... }
 */
export function eventBeforeReturn(target: Object, propertyKey: string | symbol, parameterIndex: number): void {
  registerParam('eventBeforeReturn', target, propertyKey, parameterIndex);
}

/**
 * @subscribeSwcAppMessage 의 before 훅이 이번 호출에 리턴한 값을 주입한다.
 * (before에서 async로 준비한 데이터를 핸들러가 받는 용도. 없으면 undefined)
 * 예: onMsg(@appMessage m, @appMessageBeforeReturn prepared) { ... }
 */
export function appMessageBeforeReturn(target: Object, propertyKey: string | symbol, parameterIndex: number): void {
  registerParam('appMessageBeforeReturn', target, propertyKey, parameterIndex);
}

/**
 * @subscribeSwcAppRouteChange 의 before 훅이 이번 호출에 리턴한 값을 주입한다.
 * (before에서 async 가드/준비한 데이터를 핸들러가 받는 용도. 없으면 undefined)
 * 예: routeChanged(@swcAppRouterEvent e, @routeChangeBeforeReturn guard) { ... }
 */
export function routeChangeBeforeReturn(target: Object, propertyKey: string | symbol, parameterIndex: number): void {
  registerParam('routeChangeBeforeReturn', target, propertyKey, parameterIndex);
}

/**
 * @eventMedia 의 before 훅이 이번 호출에 리턴한 값을 주입한다. (before 없으면 undefined)
 * 예: @eventMediaChange('(max-width:600px)', { before: () => ... }) onMobile(@eventMediaBeforeReturn v) { ... }
 */
export function eventMediaBeforeReturn(target: Object, propertyKey: string | symbol, parameterIndex: number): void {
  registerParam('eventMediaBeforeReturn', target, propertyKey, parameterIndex);
}

/** @mutationObserver 의 before 훅이 이번 호출에 리턴한 값을 주입한다. (before 없으면 undefined) */
export function mutationObserverBeforeReturn(target: Object, propertyKey: string | symbol, parameterIndex: number): void {
  registerParam('mutationObserverBeforeReturn', target, propertyKey, parameterIndex);
}

/** @intersectionObserver 의 before 훅이 이번 호출에 리턴한 값을 주입한다. (before 없으면 undefined) */
export function intersectionObserverBeforeReturn(target: Object, propertyKey: string | symbol, parameterIndex: number): void {
  registerParam('intersectionObserverBeforeReturn', target, propertyKey, parameterIndex);
}

/** @resizeObserver 의 before 훅이 이번 호출에 리턴한 값을 주입한다. (before 없으면 undefined) */
export function resizeObserverBeforeReturn(target: Object, propertyKey: string | symbol, parameterIndex: number): void {
  registerParam('resizeObserverBeforeReturn', target, propertyKey, parameterIndex);
}

/** @changedAttribute 의 before 훅이 이번 호출에 리턴한 값을 주입한다. (before 없으면 undefined) */
export function changedAttributeBeforeReturn(target: Object, propertyKey: string | symbol, parameterIndex: number): void {
  registerParam('changedAttributeBeforeReturn', target, propertyKey, parameterIndex);
}

/** @setTimeout(type:'onConnected') 의 before 훅이 이번 호출에 리턴한 값을 주입한다. (before 없으면 undefined) */
export function setTimeoutBeforeReturn(target: Object, propertyKey: string | symbol, parameterIndex: number): void {
  registerParam('setTimeoutBeforeReturn', target, propertyKey, parameterIndex);
}

/** @setInterval(type:'onConnected') 의 before 훅이 이번 호출에 리턴한 값을 주입한다. (before 없으면 undefined) */
export function setIntervalBeforeReturn(target: Object, propertyKey: string | symbol, parameterIndex: number): void {
  registerParam('setIntervalBeforeReturn', target, propertyKey, parameterIndex);
}

/**
 * @fetch(trigger:'before') 의 fetch settled 결과(PromiseSettledResult)를 주입한다.
 * 예: save(@fetchSettled settled) { ... }
 */
export function fetchSettled(target: Object, propertyKey: string | symbol, parameterIndex: number): void {
  registerParam('fetchSettled', target, propertyKey, parameterIndex);
}

export const getParameterMetadata = (target: any, propertyKey: string | symbol): SaveParamConfig[] => {
  const constructor = typeof target === 'function' ? target : target.constructor;
  return ReflectUtils.getMetadata(SWC_PARAMETER_METADATA_KEY, constructor, propertyKey) ?? [];
};

/**
 * 위 파라미터 데코레이터 메타데이터가 하나라도 있으면 kind별 값을 index 순서에 맞게
 * 배열로 조립하고, 하나도 없으면 기존 위치 인자(legacyArgs)를 그대로 반환한다 — 완전 하위호환.
 */
export const buildSwcParameterArgs = (
  target: any,
  propertyKey: string | symbol,
  kindValues: Partial<Record<SwcParamKind, any>>,
  legacyArgs: any[]
): any[] => {
  const saves = getParameterMetadata(target, propertyKey);
  if (saves.length === 0) return legacyArgs;
  const maxIndex = Math.max(...saves.map(s => s.index));
  const args: any[] = new Array(maxIndex + 1);
  for (const s of saves) {
    const value = kindValues[s.kind];
    // 키를 받는 kind 는 kindValues 에 (key) => 값 resolver 가 들어 있다
    args[s.index] = s.key !== undefined && typeof value === 'function' ? value(s.key) : value;
  }
  return args;
};

// ─── 라우트 파라미터 (@subscribeSwcAppRouteChange 핸들러) ───
// 규칙: 접두어 없음 = First, First/Last = 같은 키가 여러 번일 때 첫/마지막 값, 복수형 = 모든 값 배열.

const keyedRouteParam = (kind: SwcRouteParamKind) => (key: string): ParameterDecorator =>
  (target, propertyKey, parameterIndex) => registerParam(kind, target, propertyKey, parameterIndex, key);
const routeParam = (kind: SwcRouteParamKind): ParameterDecorator =>
  (target, propertyKey, parameterIndex) => registerParam(kind, target, propertyKey, parameterIndex);

/** ?tag=a&tag=b → @swcAppRouteQueryParam('tag') = 'a' (없으면 null) */
export const swcAppRouteQueryParam = keyedRouteParam('swcAppRouteQueryParam');
/** = swcAppRouteQueryParam */
export const swcAppRouteFirstQueryParam = keyedRouteParam('swcAppRouteFirstQueryParam');
/** ?tag=a&tag=b → 'b' */
export const swcAppRouteLastQueryParam = keyedRouteParam('swcAppRouteLastQueryParam');
/** ?tag=a&tag=b → ['a', 'b'] */
export const swcAppRouteQueryParams = keyedRouteParam('swcAppRouteQueryParams');
/** ?tag=a&tag=b → { tag: 'a' } */
export const swcAppRouteQueryParamObject = routeParam('swcAppRouteQueryParamObject');
/** = swcAppRouteQueryParamObject */
export const swcAppRouteFirstQueryParamObject = routeParam('swcAppRouteFirstQueryParamObject');
/** ?tag=a&tag=b → { tag: 'b' } */
export const swcAppRouteLastQueryParamObject = routeParam('swcAppRouteLastQueryParamObject');
/** ?tag=a&tag=b → { tag: ['a', 'b'] } */
export const swcAppRouteQueryParamsObject = routeParam('swcAppRouteQueryParamsObject');
/** URLSearchParams 그대로 */
export const swcAppRouteURLSearchParams = routeParam('swcAppRouteURLSearchParams');

/** '/a/{id}/b/{id}' ← '/a/1/b/2' → @swcAppRoutePathVariable('id') = '1' */
export const swcAppRoutePathVariable = keyedRouteParam('swcAppRoutePathVariable');
/** = swcAppRoutePathVariable */
export const swcAppRouteFirstPathVariable = keyedRouteParam('swcAppRouteFirstPathVariable');
/** → '2' */
export const swcAppRouteLastPathVariable = keyedRouteParam('swcAppRouteLastPathVariable');
/** → ['1', '2'] */
export const swcAppRoutePathVariables = keyedRouteParam('swcAppRoutePathVariables');
/** → { id: '1' } */
export const swcAppRoutePathVariableObject = routeParam('swcAppRoutePathVariableObject');
/** = swcAppRoutePathVariableObject */
export const swcAppRouteFirstPathVariableObject = routeParam('swcAppRouteFirstPathVariableObject');
/** → { id: '2' } */
export const swcAppRouteLastPathVariableObject = routeParam('swcAppRouteLastPathVariableObject');
/** → { id: ['1', '2'] } */
export const swcAppRoutePathVariablesObject = routeParam('swcAppRoutePathVariablesObject');
