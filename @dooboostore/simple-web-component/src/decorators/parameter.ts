import { ReflectUtils } from '@dooboostore/core';
import { SwcUtils } from '../utils/Utils';
import { QuerySelector, QueryOptions, QueryBaseOptions, resolveQueryElements, pickElements } from './query';
import { AttributeOptions, AttributeSelector, getAttributeValue } from './applyAttribute';
import { PersistOptions, persistRead, persistReadAsync } from './persistState';
import type { HelperHostSet } from '../types';

/**
 * @eventObject/@matchedElement/@hostSet/@helperHostSet/@helperSet/@swcAppRouterEvent/@appMessage/@eventBeforeReturn —
 * @event/lifecycle/subscribeSwcAppRouteChange/subscribeSwcAppMessage
 * 계열 핸들러의 파라미터를 순서 무관하게 선언할 수 있게 해주는 파라미터 데코레이터.
 * @dooboostore/simple-boot의 @Inject와 동일한 인덱스 기반 메타데이터 패턴을 따른다:
 * 데코레이터가 실행되는 순서가 아니라 실제 parameterIndex로 슬롯을 매칭하므로,
 * 사용자가 파라미터 선언 순서를 자유롭게 바꿔도 된다.
 */
export type SwcParamKind = 'eventObject' | 'matchedElement' | 'hostSet' | 'helperHostSet' | 'helperSet' | 'swcAppRouterEvent' | 'swcAppRouter' | 'swcAppSimpleApplication' | 'swcAppHost' | 'appMessage' | 'eventBeforeReturn' | 'appMessageBeforeReturn' | 'routeChangeBeforeReturn' | 'eventMediaBeforeReturn' | 'mutationObserverBeforeReturn' | 'intersectionObserverBeforeReturn' | 'resizeObserverBeforeReturn' | 'changedAttributeBeforeReturn' | 'setTimeoutBeforeReturn' | 'setIntervalBeforeReturn' | 'fetchSettled'
  | 'querySelectorParam' | 'querySelectorAllParam' | 'attributeParam' | 'localStorageParam' | 'sessionStorageParam' | 'cookieParam' | 'indexedDbParam' | 'fetchParam'
  | SwcRouteParamKind;

/** 라우트 핸들러 전용 (subscribeSwcAppRouteChange 가 채움). kind 이름 = 데코레이터 이름 */
export type SwcRouteParamKind =
  | 'swcAppRouteQueryParam' | 'swcAppRouteFirstQueryParam' | 'swcAppRouteLastQueryParam' | 'swcAppRouteQueryParams'
  | 'swcAppRouteQueryParamObject' | 'swcAppRouteFirstQueryParamObject' | 'swcAppRouteLastQueryParamObject' | 'swcAppRouteQueryParamsObject'
  | 'swcAppRouteURLSearchParams'
  | 'swcAppRoutePathVariable' | 'swcAppRouteFirstPathVariable' | 'swcAppRouteLastPathVariable' | 'swcAppRoutePathVariables'
  | 'swcAppRoutePathVariableObject' | 'swcAppRouteFirstPathVariableObject' | 'swcAppRouteLastPathVariableObject' | 'swcAppRoutePathVariablesObject';

const SWC_PARAMETER_METADATA_KEY = Symbol.for('simple-web-component:parameter');

/** key: @swcAppRouteQueryParam('q') 처럼 키를 받는 파라미터 데코레이터의 키 (querySelectorParam/attributeParam은 객체를 담는다) */
type SaveParamConfig = { index: number; kind: SwcParamKind; key?: any };

const registerParam = (kind: SwcParamKind, target: Object, propertyKey: string | symbol | undefined, parameterIndex: number, key?: any) => {
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

/**
 * Router 인스턴스($appHost.router)를 주입한다 — @Inject(DI) 없이도 router.go()/pathData 등에 바로 접근.
 * SwcApp 트리 밖(standalone, $appHost 없음)이면 undefined.
 */
export function swcAppRouter(target: Object, propertyKey: string | symbol, parameterIndex: number): void {
  registerParam('swcAppRouter', target, propertyKey, parameterIndex);
}

/**
 * SimpleApplication(DI 컨테이너) 인스턴스($appHost.simpleApplication)를 주입한다 —
 * simstanceManager 등 컨테이너 자체를 직접 다뤄야 할 때. 보통은 @inject로 충분하니 그거부터 고려할 것.
 * SwcApp 트리 밖이거나 DI 컨테이너 없이 쓰는 standalone이면 undefined.
 */
export function swcAppSimpleApplication(target: Object, propertyKey: string | symbol, parameterIndex: number): void {
  registerParam('swcAppSimpleApplication', target, propertyKey, parameterIndex);
}

/**
 * SwcApp 호스트 엘리먼트 자신($appHost)을 주입한다 — @hostSet으로도 hs.$appHost로 바로 꺼내지지만,
 * HostSet 전체 말고 호스트 하나만 필요할 때 짧게 쓰는 용도. SwcApp 트리 밖이면 undefined.
 */
export function swcAppHost(target: Object, propertyKey: string | symbol, parameterIndex: number): void {
  registerParam('swcAppHost', target, propertyKey, parameterIndex);
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

/**
 * 셀렉터로 찾은 DOM 요소 하나를 주입한다 — 필드용 @query 데코레이터(query.ts)와 같은 탐색 엔진 재사용.
 * options.root로 'light'/'shadow'/'auto'(기본)/'all' 탐색 범위를 그대로 지정할 수 있다(@query와 동일).
 * onConnectedAfter/addEventListener/setInterval 등 "자동 트리거" 메서드에서만 채워진다
 * (buildCommonKindValues를 거치는 호출부 한정 — 임의로 직접 호출하는 메서드에는 못 꽂는다).
 * URL의 query parameter와 헷갈리지 않도록 "query"가 아니라 "querySelector"로 이름 붙였다.
 * 예: onReady(@querySelectorParam('#name') input: HTMLInputElement) { ... }
 */
export function querySelectorParam(selector: QuerySelector, options?: QueryOptions): ParameterDecorator {
  return (target, propertyKey, parameterIndex) => registerParam('querySelectorParam', target, propertyKey, parameterIndex, { selector, options });
}

/** @querySelectorParam의 복수형 — 매칭된 모든 요소를 배열로 주입한다(= @queryAll, pick 고정 'all'). */
export function querySelectorAllParam(selector: QuerySelector, options?: Omit<QueryOptions, 'pick'>): ParameterDecorator {
  return (target, propertyKey, parameterIndex) => registerParam('querySelectorAllParam', target, propertyKey, parameterIndex, { selector, options });
}

// ─── root별 편의 alias — query.ts의 queryShadow/queryLight/queryAllRoots/queryAllShadow/queryAllLight/queryAllAll과 1:1 대응 ───

/** shadow DOM에서 요소 하나를 찾아 주입한다 (= @querySelectorParam(selector, {root:'shadow'})). */
export function querySelectorShadowParam(selector: QuerySelector, options?: QueryBaseOptions): ParameterDecorator {
  return querySelectorParam(selector, { ...(options ?? {}), root: 'shadow' });
}
/** light DOM에서 요소 하나를 찾아 주입한다. */
export function querySelectorLightParam(selector: QuerySelector, options?: QueryBaseOptions): ParameterDecorator {
  return querySelectorParam(selector, { ...(options ?? {}), root: 'light' });
}
/** shadow+light 모두에서 찾아 하나만 주입한다 (pick 기본 'first') — "All"은 탐색 범위가 전부라는 뜻. */
export function querySelectorAllRootsParam(selector: QuerySelector, options?: QueryBaseOptions): ParameterDecorator {
  return querySelectorParam(selector, { ...(options ?? {}), root: 'all' });
}
/** shadow DOM에서 매칭된 모든 요소를 배열로 주입한다. */
export function querySelectorAllShadowParam(selector: QuerySelector, options?: Omit<QueryBaseOptions, 'pick'>): ParameterDecorator {
  return querySelectorAllParam(selector, { ...(options ?? {}), root: 'shadow' });
}
/** light DOM에서 매칭된 모든 요소를 배열로 주입한다. */
export function querySelectorAllLightParam(selector: QuerySelector, options?: Omit<QueryBaseOptions, 'pick'>): ParameterDecorator {
  return querySelectorAllParam(selector, { ...(options ?? {}), root: 'light' });
}
/** shadow+light 모두에서 매칭된 모든 요소를 배열로 주입한다. */
export function querySelectorAllAllParam(selector: QuerySelector, options?: Omit<QueryBaseOptions, 'pick'>): ParameterDecorator {
  return querySelectorAllParam(selector, { ...(options ?? {}), root: 'all' });
}
// skipped: queryIn처럼 root+pick을 동적으로 조합하는 팩토리형 alias — 필요해지면 그때 추가.

/**
 * attribute 값을 주입한다 — 필드용 @attribute 데코레이터(applyAttribute.ts)와 같은 엔진 재사용.
 * - attributeParam('data-x', options?) — 이 엘리먼트 자신의 attribute.
 * - attributeParam(selector, 'data-x', options?) — selector(+options.root)로 찾은 다른 요소의 attribute.
 * 필드용 @attribute(selector?, attrName, options?)와 동일한 2-form 시그니처.
 */
export function attributeParam(attributeName: string, options?: AttributeOptions): ParameterDecorator;
export function attributeParam(selector: AttributeSelector, attributeName: string, options?: AttributeOptions): ParameterDecorator;
export function attributeParam(selectorOrName: AttributeSelector | string, attrNameOrOptions?: string | AttributeOptions, maybeOptions?: AttributeOptions): ParameterDecorator {
  const withSelector = typeof attrNameOrOptions === 'string';
  const attributeName = withSelector ? attrNameOrOptions as string : selectorOrName as string;
  const options = (withSelector ? maybeOptions : attrNameOrOptions as AttributeOptions | undefined) ?? {};
  const resolved: AttributeOptions & { selector?: AttributeSelector } = withSelector ? { ...options, selector: selectorOrName as AttributeSelector } : options;
  return (target, propertyKey, parameterIndex) => registerParam('attributeParam', target, propertyKey, parameterIndex, { attributeName, options: resolved });
}

const keyedStorageParam = (kind: SwcParamKind) => (key: string, options?: Omit<PersistOptions, 'storage'>): ParameterDecorator =>
  (target, propertyKey, parameterIndex) => registerParam(kind, target, propertyKey, parameterIndex, { key, options });

/** localStorage에 저장된 값을 주입한다 (persistState.ts의 persistRead 재사용). */
export const localStorageParam = keyedStorageParam('localStorageParam');
/** sessionStorage에 저장된 값을 주입한다. */
export const sessionStorageParam = keyedStorageParam('sessionStorageParam');
/** 쿠키에 저장된 값을 주입한다. */
export const cookieParam = keyedStorageParam('cookieParam');
/**
 * IndexedDB에 저장된 값을 주입한다 — 단, 비동기 백엔드라 (동기 호출 계약상) resolve된 값이 아니라
 * **Promise 자체**가 꽂힌다. 메서드 쪽에서 타입을 Promise로 받고 await 하면 된다.
 * 예: async onReady(@indexedDbParam('wow') wow: Promise<string>) { const v = await wow; ... }
 */
export const indexedDbParam = keyedStorageParam('indexedDbParam');

/** url/init 자리에 고정값 대신 (currentThis, helper) => ... 콜백을 줄 수 있다 — query.ts 함수 셀렉터·fetch.ts FetchUrlFactory와 동일한 패턴. */
export type FetchParamUrlFactory = (currentThis: any, helper: HelperHostSet) => RequestInfo | URL;
export type FetchParamInitFactory = (currentThis: any, helper: HelperHostSet) => RequestInit | undefined;

/**
 * 간단 버전 fetch — 네이티브 fetch(url, init) 그대로, 성공하면 Content-Type 보고 JSON/텍스트로 파싱한 뒤
 * **그 Promise를 주입**한다 (indexedDbParam과 동일한 계약 — 비동기라 resolve된 값이 아니라 Promise 자체).
 * abort/abortPrevious/before/after/finally 같은 건 없다 — 그런 게 필요하면 @fetch/@fetchManual + @fetchSettled를 쓴다
 * (disconnect 시 자동 abort까지 되는 더 안전한 버전). 이건 딱 "그냥 fetch 결과를 파라미터로 받고 싶다"는 경우용.
 *
 * url/init은 고정값뿐 아니라 (currentThis, helper) => ... 콜백도 받는다 — 인스턴스 필드를 참조해서
 * URL이나 body를 동적으로 만들어야 할 때 쓴다.
 * 예: async onReady(@fetchParam('/api/products/1') p: Promise<Product>) { const data = await p; }
 * 예: async onSave(@fetchParam(
 *       (self) => `/api/products/${self.productId}`,
 *       (self) => ({ method: 'POST', body: JSON.stringify({ qty: self.qty }) })
 *     ) p: Promise<any>) { const result = await p; }
 */
export function fetchParam(
  input: RequestInfo | URL | FetchParamUrlFactory,
  init?: RequestInit | FetchParamInitFactory
): ParameterDecorator {
  return (target, propertyKey, parameterIndex) => registerParam('fetchParam', target, propertyKey, parameterIndex, { input, init });
}

export const getParameterMetadata = (target: any, propertyKey: string | symbol): SaveParamConfig[] => {
  const constructor = typeof target === 'function' ? target : target.constructor;
  return ReflectUtils.getMetadata(SWC_PARAMETER_METADATA_KEY, constructor, propertyKey) ?? [];
};

/**
 * 위 파라미터 데코레이터 메타데이터가 하나라도 있으면 kind별 값을 index 순서에 맞게
 * 배열로 조립하고, 하나도 없으면 기존 위치 인자(legacyArgs)를 그대로 반환한다 — 완전 하위호환.
 * 데코레이터가 안 붙은 인덱스는 legacyArgs의 같은 자리 값으로 채운다 — 그래야
 * onId(nv, old, @querySelectorParam('#x') el) 처럼 기존 위치 인자와 섞어 써도 nv/old가 undefined로 날아가지 않는다.
 */
export const buildSwcParameterArgs = (
  target: any,
  propertyKey: string | symbol,
  kindValues: Partial<Record<SwcParamKind, any>>,
  legacyArgs: any[]
): any[] => {
  const saves = getParameterMetadata(target, propertyKey);
  if (saves.length === 0) return legacyArgs;
  const maxIndex = Math.max(Math.max(...saves.map(s => s.index)), legacyArgs.length - 1);
  const args: any[] = legacyArgs.slice(0, maxIndex + 1);
  for (const s of saves) {
    const value = kindValues[s.kind];
    // 키를 받는 kind 는 kindValues 에 (key) => 값 resolver 가 들어 있다
    args[s.index] = s.key !== undefined && typeof value === 'function' ? value(s.key) : value;
  }
  return args;
};

/** @fetchParam 전용 — 네이티브 fetch, 실패하면 상태코드를 담아 던지고, 성공하면 Content-Type 보고 json/text로 파싱. */
const simpleFetchJsonOrText = async (win: Window, input: RequestInfo | URL, init?: RequestInit): Promise<any> => {
  const fetchFn: typeof fetch = typeof (win as any)?.fetch === 'function' ? (win as any).fetch.bind(win) : fetch;
  const res = await fetchFn(input, init);
  if (!res.ok) throw new Error(`[SWC] @fetchParam failed: ${res.status} ${String(input)}`);
  const text = await res.text();
  if (!text) return undefined;
  return (res.headers.get('Content-Type') ?? '').includes('json') ? JSON.parse(text) : text;
};

/**
 * @querySelectorParam/@querySelectorAllParam/@attributeParam/@local·session·cookie·indexedDb·fetchParam 리졸버만 —
 * hostSet 3종과 분리해서, 이미 자기만의 hostSet/helperHostSet 계산 방식을 가진 호출부
 * (예: elementDefine._invokeLifecycleMethod)에서도 기존 계산은 그대로 둔 채 이 kind들만 얹을 수 있게 한다.
 * indexedDB/fetch는 비동기라 (동기 호출 계약상) resolve된 값이 아니라 Promise 자체를 반환한다 —
 * 둘 다 async 함수라 호출 즉시 Promise를 반환하므로 await 없이도 동기 리졸버 계약을 지킨다.
 */
export const buildDomStorageKindValues = (inst: any, win: Window): Partial<Record<SwcParamKind, any>> => ({
  querySelectorParam: (cfg: { selector: QuerySelector; options?: QueryOptions }) =>
    pickElements(resolveQueryElements(inst, cfg.selector, cfg.options ?? {}, win), cfg.options?.pick ?? 'first'),
  querySelectorAllParam: (cfg: { selector: QuerySelector; options?: Omit<QueryOptions, 'pick'> }) =>
    pickElements(resolveQueryElements(inst, cfg.selector, cfg.options ?? {}, win), 'all'),
  attributeParam: (cfg: { attributeName: string; options?: AttributeOptions & { selector?: AttributeSelector } }) =>
    getAttributeValue(inst, cfg.attributeName, cfg.options),
  localStorageParam: (cfg: { key: string; options?: Omit<PersistOptions, 'storage'> }) =>
    persistRead(inst, cfg.key, { ...(cfg.options as any), storage: 'local' }),
  sessionStorageParam: (cfg: { key: string; options?: Omit<PersistOptions, 'storage'> }) =>
    persistRead(inst, cfg.key, { ...(cfg.options as any), storage: 'session' }),
  cookieParam: (cfg: { key: string; options?: Omit<PersistOptions, 'storage'> }) =>
    persistRead(inst, cfg.key, { ...(cfg.options as any), storage: 'cookie' }),
  indexedDbParam: (cfg: { key: string; options?: Omit<PersistOptions, 'storage'> }): Promise<any> =>
    persistReadAsync(inst, cfg.key, { ...(cfg.options as any), storage: 'indexeddb' }),
  fetchParam: (cfg: { input: RequestInfo | URL | FetchParamUrlFactory; init?: RequestInit | FetchParamInitFactory }): Promise<any> => {
    const helper = SwcUtils.getHelperAndHostSet(inst, win);
    const resolvedInput = typeof cfg.input === 'function' ? (cfg.input as FetchParamUrlFactory)(inst, helper) : cfg.input;
    const resolvedInit = typeof cfg.init === 'function' ? (cfg.init as FetchParamInitFactory)(inst, helper) : cfg.init;
    return simpleFetchJsonOrText(win, resolvedInput, resolvedInit);
  },
});

/**
 * 트리거 데코레이터(onConnectedAfter/addEventListener/setInterval/setTimeout/옵저버 계열/...)가
 * 공통으로 필요로 하는 kindValues 베이스 — hostSet/helperSet/helperHostSet 3종 + buildDomStorageKindValues를
 * 한 번에 만든다. 각 호출부는 자기만의 kind(eventObject, setTimeoutBeforeReturn 등)만 추가로 섞어 쓰면 된다.
 */
export const buildCommonKindValues = (inst: any, win: Window): Partial<Record<SwcParamKind, any>> => {
  const hostSet = SwcUtils.getHostSet(inst);
  const helperSet = SwcUtils.getHelperSet(win);
  const helperHostSet = { ...helperSet, ...hostSet, $this: inst };
  return {
    hostSet, helperSet, helperHostSet,
    swcAppRouter: hostSet.$appHost?.router,
    swcAppSimpleApplication: hostSet.$appHost?.simpleApplication,
    swcAppHost: hostSet.$appHost,
    ...buildDomStorageKindValues(inst, win)
  };
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
