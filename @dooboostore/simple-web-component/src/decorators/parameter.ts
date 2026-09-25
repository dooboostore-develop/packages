import { ReflectUtils } from '@dooboostore/core';

/**
 * @eventObject/@matchedElement/@hostSet/@helperHostSet/@helperSet/@routerEvent/@appMessage —
 * @addEventListener/lifecycle/subscribeSwcAppRouteChange/subscribeSwcAppMessage
 * 계열 핸들러의 파라미터를 순서 무관하게 선언할 수 있게 해주는 파라미터 데코레이터.
 * @dooboostore/simple-boot의 @Inject와 동일한 인덱스 기반 메타데이터 패턴을 따른다:
 * 데코레이터가 실행되는 순서가 아니라 실제 parameterIndex로 슬롯을 매칭하므로,
 * 사용자가 파라미터 선언 순서를 자유롭게 바꿔도 된다.
 */
export type SwcParamKind = 'event' | 'matched' | 'hostSet' | 'helperHostSet' | 'helperSet' | 'routerEvent' | 'appMessage';

const SWC_PARAMETER_METADATA_KEY = Symbol.for('simple-web-component:parameter');

type SaveParamConfig = { index: number; kind: SwcParamKind };

const registerParam = (kind: SwcParamKind, target: Object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
  if (!propertyKey) return;
  const constructor = target.constructor;
  const saves = (ReflectUtils.getOwnMetadata(SWC_PARAMETER_METADATA_KEY, constructor, propertyKey) ?? []) as SaveParamConfig[];
  saves.push({ index: parameterIndex, kind });
  ReflectUtils.defineMetadata(SWC_PARAMETER_METADATA_KEY, saves, constructor, propertyKey);
};

/** 이벤트 핸들러의 원본 Event 객체를 주입한다. */
export function eventObject(target: Object, propertyKey: string | symbol, parameterIndex: number): void {
  registerParam('event', target, propertyKey, parameterIndex);
}

/** delegate로 매칭된 실제 엘리먼트($matchedElement)를 주입한다. */
export function matchedElement(target: Object, propertyKey: string | symbol, parameterIndex: number): void {
  registerParam('matched', target, propertyKey, parameterIndex);
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
export function routerEvent(target: Object, propertyKey: string | symbol, parameterIndex: number): void {
  registerParam('routerEvent', target, propertyKey, parameterIndex);
}

/** @subscribeSwcAppMessage 핸들러의 SwcAppMessage 페이로드를 주입한다. */
export function appMessage(target: Object, propertyKey: string | symbol, parameterIndex: number): void {
  registerParam('appMessage', target, propertyKey, parameterIndex);
}

export const getParameterMetadata = (target: any, propertyKey: string | symbol): SaveParamConfig[] => {
  const constructor = target instanceof Function ? target : target.constructor;
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
  for (const s of saves) args[s.index] = kindValues[s.kind];
  return args;
};
