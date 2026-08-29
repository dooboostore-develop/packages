import { SimpleApplication } from '@dooboostore/simple-boot';
import { Router } from '@dooboostore/core-web';
import {SwcAttributeConfigType, SwcConfigType} from "../SwcAppEngine";

export enum InjectSituationType {
  HOST_SET = 'SIMPLE_WEB_COMPONENT://HOSTSET',
  APP_HOST = 'SIMPLE_WEB_COMPONENT://APPHOST',
  APP_HOSTS = 'SIMPLE_WEB_COMPONENT://APPHOSTS',
  HOST = 'SIMPLE_WEB_COMPONENT://HOST',
  PARENT_HOST = 'SIMPLE_WEB_COMPONENT://PARENTHOST',
  HOSTS = 'SIMPLE_WEB_COMPONENT://HOSTS',
  FIRST_HOST = 'SIMPLE_WEB_COMPONENT://FIRSTHOST',
  LAST_HOST = 'SIMPLE_WEB_COMPONENT://LASTHOST',
  FIRST_APP_HOST = 'SIMPLE_WEB_COMPONENT://FIRSTAPPHOST',
  LAST_APP_HOST = 'SIMPLE_WEB_COMPONENT://LASTAPPHOST'
}

export type SwcRootType = 'light' | 'shadow' | 'all' | 'auto';

export type SpecialSelector = '$this' | '$window' | '$document' | '$host' | '$appHost' | '$firstHost' | '$lastHost' | '$firstAppHost' | '$lastAppHost' | '$hosts' | '$appHosts';

export type SwcQueryOptions = { root?: SwcRootType };

export type HelperSet = {
  $d: Document;
  $w: Window;
  $q: (selector: string, root?: Element | Document | ShadowRoot) => HTMLElement | null;
  $qa: (selector: string, root?: Element | Document | ShadowRoot) => HTMLElement[];
  $qi: (id: string, root?: Document | ShadowRoot) => HTMLElement | null;
};

export type HostSet = {
  $host: HTMLElement | null; // Nearest parent SWC component
  $parentHost: HTMLElement | null; // Grandparent SWC ancestor
  $hosts: HTMLElement[]; // All SWC ancestors [root, ..., parent]
  $firstHost: HTMLElement | null; // Top-most SWC ancestor
  $lastHost: HTMLElement | null; // Same as $host
  // $templateHost: HTMLTemplateElement | null | undefined;
  $appHost: SwcAppInterface | null;
  $appHosts: SwcAppInterface[];
  $firstAppHost: SwcAppInterface | null;
  $lastAppHost: SwcAppInterface | null;
};

export type HelperHostSet = HelperSet & HostSet & {$this: any};

// 공통 셀렉터 함수 — 요소/노드를 직접 반환하는 함수 셀렉터 (query는 Node까지 반환 가능)
export type SwcFnSelector = (currentThis: any, helper: HelperHostSet) => Node | NodeList | Element | Element[] | null;
// 공통 셀렉터 — 문자열(CSS/특수) 또는 함수
export type SwcSelector = string | SwcFnSelector;

export type SwcAppMessage<T = any> = {
  publisher?: any;
  data?: T;
  type?: string;
};


export interface SwcAppInterface extends HTMLElement {
  simpleApplication?: SimpleApplication;
  config?:  SwcConfigType;
  router?: Router;
  connect(config?: SwcAttributeConfigType): Promise<void>;
  routing(path: string): Promise<void>;
  reload(): void;
  back(): void;
  forward(): void;
  publishMessage(message: SwcAppMessage): void;
}

export interface SwcElement {
  _swcId: string;
  // createSlotString(id: string): string
  // createEaHtml(id: string, script: string): string
  // createEaText(id: string, script: string): string
  // createEaAttribute(id: string, attributeName: string): string
  // createEaEvent(id: string, eventName: string): string
  // createEaProperty(id: string, propertyName: string): string
}

// ─────────────────────────────────────────────────────────────────────────────
// ElementDefineLifeCycler
//
// 각 데코레이터 파일(addEventListener, mutationObserver, …)이 이 interface를
// 구현해 export 하고, elementDefine.ts는 cyclers 배열로 관리하며 위임만 한다.
//
// 시클러는 생성자에서 아무 인자도 받지 않는다. 상태는 인스턴스별로 관리해야 하므로,
// 각 라이프사이클 훅(onConnected 등)의 첫 번째 인자로 HelperHostSet 을 받아
// 그 안의 $this(현재 엘리먼트 인스턴스) / $w(window) 로 처리한다.
// elementDefine 은 elementDefine 시점에 시클러를 1회 생성하고 계속 재사용한다.
// 모든 메서드는 optional — 관심 있는 훅만 구현하면 된다.
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// onConnected 반환 타입
//
// 각 cycler 가 "필요한 observer 정보"를 선언하면,
// elementDefine 이 수집해서 필요한 경우에만 observer 인스턴스를 생성한다.
// ─────────────────────────────────────────────────────────────────────────────

/** observer observe 대상 엔트리. delegate:true 이면 target 은 셀렉터 문자열이며, 실제 요소는 동적 추적으로 observe/unobserve 된다. */
export interface ObserverObserveTarget<TOptions> {
  target: Element | ShadowRoot | string;
  options?: TOptions;
  delegate?: boolean;
  /** delegate 동적 추적 시 observe/unobserve 를 실행할 루트(스코프). delegate:true 일 때만 의미 있다. */
  delegateRoot?: SwcRootType;
}

/** MutationObserver observe 대상 하나. 동일 루트의 여러 대상은 같은 callback 을 공유한다. */
export interface MutationObserverSetEntry {
  target: Element | ShadowRoot | string;
  options?: MutationObserverInit;
  delegate?: boolean;
  delegateRoot?: SwcRootType;
  callback: (mutations: MutationRecord[], observer: MutationObserver) => void;
}

/** observe 할 대상 목록 (엔트리별 콜백 포함). elementDefine 이 하나의 MutationObserver 로 모두 observe 한다. */
export type MutationObserverSet = MutationObserverSetEntry[];

/** ResizeObserver observe 대상 하나. 동일 셀렉터의 여러 대상은 같은 callback 을 공유한다. */
export interface ResizeObserverSetEntry {
  target: Element | ShadowRoot | string;
  options?: ResizeObserverOptions;
  delegate?: boolean;
  delegateRoot?: SwcRootType;
  callback: (entries: ResizeObserverEntry[], observer: ResizeObserver) => void;
}

/** observe 할 대상 목록 (엔트리별 콜백 포함). elementDefine 이 하나의 ResizeObserver 로 모두 observe 한다. */
export type ResizeObserverSet = ResizeObserverSetEntry[];

/** IntersectionObserver observe 대상 하나. 같은 옵션 그룹의 여러 대상은 같은 callback 을 공유한다. */
export interface IntersectionObserverSetEntry {
  target: Element | ShadowRoot | string;
  delegate?: boolean;
  delegateRoot?: SwcRootType;
  callback: (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => void;
}

/** IntersectionObserver 그룹. observer 는 생성 시점에 옵션이 고정되므로 옵션별로 1개씩 생성된다. */
export interface IntersectionObserverGroup {
  /** observer 생성 옵션 (threshold/rootMargin/root). 이 값이 같으면 같은 observer 를 공유한다. */
  options: IntersectionObserverInit;
  observeTargets: IntersectionObserverSetEntry[];
}

/** observe 할 옵션 그룹 목록. elementDefine 이 그룹마다 IntersectionObserver 를 생성한다. */
export type IntersectionObserverSet = IntersectionObserverGroup[];

/**
 * onConnected 의 반환 타입.
 * observer 가 필요 없는 cycler 는 undefined 를 반환해도 된다.
 */
export interface OnConnectedResult {
  mutationObserverSet?: MutationObserverSet;
  resizeObserverSet?: ResizeObserverSet;
  intersectionObserverSet?: IntersectionObserverSet;
}

/**
 * 각 데코레이터 파일이 구현하는 라이프사이클 위임 interface.
 *
 * 구현체는 상태를 갖지 않고, 각 훅의 첫 번째 인자로 HelperHostSet 을 받는다.
 * 관심 있는 훅만 구현하면 된다 (전부 optional).
 *
 * ```ts
 * const eventCycler = new EventListenerLifeCycler();
 * const cyclers: ElementDefineLifeCycler[] = [eventCycler, ...];   // elementDefine 시 1회 생성
 *
 * proto.connectedCallback = async function () {
 *   const helperHostSet = SwcUtils.getHelperAndHostSet(win, this);
 *   const results = await Promise.all(cyclers.map(c => c.onConnected?.(helperHostSet)));
 *   // results 에서 mutationObserverSet / resizeObserverSet 수집
 *   // → 필요한 경우에만 MutationObserver / ResizeObserver 생성
 * };
 * proto.disconnectedCallback = function () {
 *   for (const c of cyclers) c.onDisconnected?.(helperHostSet);
 * };
 * ```
 */
export interface ElementDefineLifeCycler {
  /**
   * connectedCallback 시 호출.
   * observer 가 필요하면 OnConnectedResult 를 반환하고,
   * 필요 없으면 void / undefined 를 반환한다.
   * @param helperHostSet 현재 엘리먼트 인스턴스($this)를 포함한 컨텍스트
   * @param resizeObserverSet 이전 시클러가 반환한 resize observer set (mutation 시클러가 주입받아 사용)
   */
  onConnected?(helperHostSet: HelperHostSet, resizeObserverSet?: ResizeObserverSet): OnConnectedResult | void | Promise<OnConnectedResult | void>;

  /** disconnectedCallback 시 호출. 등록한 리소스를 해제한다. */
  onDisconnected?(helperHostSet: HelperHostSet): void;

  /** adoptedCallback 시 호출 (선택적). */
  onAdopted?(helperHostSet: HelperHostSet): void;

  /**
   * attributeChangedCallback 시 호출 (선택적).
   * @param helperHostSet 현재 엘리먼트 인스턴스($this)를 포함한 컨텍스트
   * @param name    변경된 attribute 이름
   * @param oldVal  이전 값
   * @param newVal  새 값 (ActionExpression 처리 후)
   */
  onAttributeChanged?(helperHostSet: HelperHostSet, name: string, oldVal: string | null, newVal: any): void;

  /**
   * observedAttributes 에 포함해야 하는 attribute 이름 목록을 반환한다.
   * elementDefine 이 define-time(constructor)에 호출해 수집한다.
   * 관심 없으면 구현하지 않거나 빈 배열을 반환한다.
   * @param target constructor 또는 element 인스턴스 (메타데이터 조회용)
   */
  getObservedAttributeNames?(target: any): string[];
}