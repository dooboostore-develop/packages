import { ReflectUtils, HttpResponseError } from '@dooboostore/core';
import { SwcUtils } from '../utils/Utils';
import { getParameterMetadata } from './parameter';
import type { ElementDefineLifeCycler, HelperHostSet } from '../types';

export const FETCH_METADATA_KEY = Symbol.for('simple-web-component:fetch');

export type FetchUrlFactory = (
  currentThis: any,
  helper: HelperHostSet,
  parameter: any[]
) => RequestInfo | URL;

/**
 * 수동 fetch. 요청을 직접 만들고 보낸다 (서비스 호출, 직접 쓴 fetch 등). 리턴값이 fetch 결과가 된다.
 * - signal: 요소 disconnect / abortPrevious 때 abort 된다. 직접 쓰는 fetch/클라이언트에 넘기면 네트워크까지 끊긴다
 *   (안 넘겨도 abort 즉시 호출은 끝나고 결과는 버려진다)
 * - returnValue: after 모드에서 메서드 리턴값 (valueKey 가 있으면 추출한 값). before 모드에선 undefined
 */
export type FetchManualFn = (
  currentThis: any,
  helper: HelperHostSet,
  parameter: any[],
  signal: AbortSignal,
  returnValue?: any
) => any | Promise<any>;

/** filter 가 받는 것 */
export type FetchFilterContext = { self: any; helper: HelperHostSet; args: any[] };

/**
 * 모드(선언형/수동형, before/after)와 무관한 공통 옵션.
 * 결과 처리(then/catch/finally)는 @fetchPromise 로 받은 Promise 로 사용자가 직접 한다 — 그래서 훅이 없다.
 */
export type FetchType = {
  /**
   * 같은 메서드를 다시 부르면 진행 중인 이전 요청을 abort 한다 (검색 자동완성 등 마지막 요청만 살림).
   * 끊긴 이전 호출의 Promise 는 끝나지 않는다 (떨어진 DOM 에 그리지 않고 조용히 끝남).
   */
  abortPrevious?: boolean;
  /**
   * false 를 리턴하면 이번 호출을 통째로 건너뛴다 (요청도 메서드도 실행 안 함, undefined 리턴).
   * 요청이 메서드보다 먼저 나가므로 "보낼지 말지"는 여기서만 정할 수 있다. 메서드를 동기로 유지하려고 동기만 받는다.
   */
  filter?: (ctx: FetchFilterContext) => boolean;
};

/** before: 인자 기반 RequestInit 조립. 없으면 GET. */
export type RequestFactory = (
  currentThis: any,
  helper: HelperHostSet,
  parameter: any[]
) => RequestInit | undefined;

/** after: 인자 + 메서드 리턴값 기반 RequestInit 조립. 없으면 body 유무로 GET/POST. */
export type ReturnRequestFactory = (
  currentThis: any,
  helper: HelperHostSet,
  parameter: any[],
  returnValue: any
) => RequestInit | undefined;

export interface FetchMetadata {
  propertyKey: string | symbol;
  options: FetchOptions;
  /** 필드(declare)에 붙었으면 true — 프레임워크가 요청 함수를 만든다 */
  field?: boolean;
}

// 프레임워크가 만든 필드 요청 함수 표시 (덮어써졌는지 확인용)
const FETCH_FIELD_FN = Symbol.for('simple-web-component:fetch-field-fn');

/** 선언형: url/request/process 로 기술하면 프레임워크가 fetch 한다 */
export type FetchDeclarative<R> = {
  url: RequestInfo | URL | FetchUrlFactory;
  request?: R | string;
  /**
   * 'json': 객체 → JSON.stringify + Content-Type: application/json
   * 'form': 객체 → FormData (Content-Type은 브라우저가 boundary 붙이므로 건드리지 않음)
   * 'urlencoded': 객체 → URLSearchParams + Content-Type: application/x-www-form-urlencoded
   * 'text': String(value) + Content-Type: text/plain
   * 미지정: 그대로 통과 (가공 없음). 이미 BodyInit 인 값은 가공하지 않는다.
   */
  process?: 'json' | 'form' | 'urlencoded' | 'text';
  manual?: never;
};

/** 수동형: manual 이 요청을 전부 담당. url/request/process 는 쓰이지 않으므로 금지 */
export type FetchManual = {
  manual: FetchManualFn;
  url?: never;
  request?: never;
  process?: never;
};

export type FetchOptions =
  // before(기본): 요청을 시작하고 그 Promise 를 @fetchPromise 자리에 넣어 메서드를 바로 호출한다.
  // 메서드 반환값을 그대로 리턴 (동기 메서드는 동기 그대로). request 없으면 GET. valueKey 는 after 전용이라 금지.
  | (FetchType & { trigger?: 'before'; valueKey?: never } & (FetchDeclarative<RequestFactory> | FetchManual))
  // after: 메서드 실행 → 리턴값(valueKey 가 있으면 returnValue[valueKey])을 body(수동형이면 returnValue)로 → fetch. fetch 결과 리턴.
  // (valueKey 기본값 = FETCH_METADATA_KEY: Symbol 키 우선 조회, 없으면 통째 값)
  | (FetchType & { trigger: 'after'; valueKey?: string } & (FetchDeclarative<ReturnRequestFactory> | FetchManual))
  // after 축약: trigger 없이 valueKey 만 줘도 after
  | (FetchType & { trigger?: never; valueKey: string } & (FetchDeclarative<ReturnRequestFactory> | FetchManual));

// 인스턴스별 진행 중인 요청의 컨트롤러 (disconnect 시 FetchLifeCycler 가 전부 abort)
const getActiveControllers = (inst: any): Set<AbortController> => (inst.__swc_fetchControllers ??= new Set());
// abortPrevious: 메서드별 마지막 호출의 컨트롤러
const getLatestControllers = (inst: any): Map<string | symbol, AbortController> => (inst.__swc_fetchLatest ??= new Map());

const abortError = (message: string) => new DOMException(message, 'AbortError');

// 사용자가 request 로 준 signal 과 프레임워크 signal 을 합친다 (AbortSignal.any 미지원 브라우저 대비)
const combineSignals = (user: AbortSignal | null | undefined, own: AbortSignal): AbortSignal => {
  if (!user) return own;
  if (typeof (AbortSignal as any).any === 'function') return (AbortSignal as any).any([user, own]);
  const merged = new AbortController();
  for (const s of [user, own]) {
    if (s.aborted) {
      merged.abort(s.reason);
      break;
    }
    s.addEventListener('abort', () => merged.abort(s.reason), { once: true });
  }
  return merged.signal;
};

/**
 * @fetch 계열 데코레이터는 메서드와 필드 양쪽에 붙는다.
 * - 메서드: 트리거가 부르는 핸들러용. 요청 Promise 를 @fetchPromise 로 주입하고 메서드를 쌓는다 (기존 방식)
 * - 필드(declare): 직접 부르는 요청 함수용. `declare getPost: (id: number) => Promise<Post>` 의 몸통을 프레임워크가 만든다
 */
export type FetchDecorator = {
  /**
   * 필드: 선언 타입이 `(...args) => Promise<…>`(요청 함수) 또는 `Promise<…>`(값) 가 아니면 컴파일 에러.
   * 옵셔널(`declare me?: Promise<T>`)도 된다 — 값 필드를 `this.me = undefined` 로 비우려면 strict 에선 옵셔널로 선언한다.
   * (private / protected 필드는 TS 가 바깥 타입에서 못 봐서 검사 없이 통과 — 런타임 design:type 검사만 적용)
   */
  <T, K extends string | symbol>(target: T & (K extends keyof T ? { [P in K]?: ((...args: any[]) => Promise<any>) | Promise<any> } : unknown), propertyKey: K): void;
  /** 메서드: 트리거 핸들러 (요청 Promise 는 @fetchPromise 로) */
  (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): any;
};

// 건너뛰거나 끊긴 필드 호출이 돌려주는 Promise — 끝나지 않는다 (떨어진 DOM 에 그리지 않고 에러도 없음)
const never = () => new Promise<never>(() => {});

// 필드를 Promise 로 쓸 때 기억한 요청 — 엘리먼트 → (필드 이름 → Promise). 엘리먼트에 속성을 붙이지 않는다.
const valueCache = new WeakMap<object, Map<string | symbol, Promise<any>>>();
const cacheOf = (inst: object) => {
  let m = valueCache.get(inst);
  if (!m) valueCache.set(inst, (m = new Map()));
  return m;
};

function createFetch(optionsOrUrl: FetchOptions | string): FetchDecorator {
  const options: FetchOptions = typeof optionsOrUrl === 'string' ? { url: optionsOrUrl } : optionsOrUrl;
  return ((target: Object, propertyKey: string | symbol, descriptor?: PropertyDescriptor) => {
    const constructor = target.constructor;
    const isField = !descriptor;
    const list = (ReflectUtils.getOwnMetadata(FETCH_METADATA_KEY, constructor) as FetchMetadata[] | undefined) ?? [];
    list.push({ propertyKey, options, field: isField });
    ReflectUtils.defineMetadata(FETCH_METADATA_KEY, list, constructor);

    const extractBody = (v: any) => {
        const keyToUse = (options as { valueKey?: symbol | string }).valueKey ?? FETCH_METADATA_KEY;
      if (v && typeof v === 'object' && keyToUse in v) {
        return v[keyToUse];
      }
      return v;
    };

    const resolveUrl = (inst: any, helper: HelperHostSet, args: any[]): RequestInfo | URL => {
      const u = (options as FetchDeclarative<unknown>).url;
      return typeof u === 'function' ? (u as FetchUrlFactory)(inst, helper, args) : u;
    };

    // 이미 BodyInit 인 값은 process 로 가공하지 않고 그대로 보낸다 (Blob 을 JSON.stringify 하면 '{}' 가 됨)
    const isBodyInit = (v: any): boolean => {
      if (typeof v === 'string') return true;
      const is = (name: string) => typeof (globalThis as any)[name] === 'function' && v instanceof (globalThis as any)[name];
      return ArrayBuffer.isView(v) || v instanceof ArrayBuffer || is('Blob') || is('FormData') || is('URLSearchParams') || is('ReadableStream');
    };

    // 204/빈 body 는 undefined, JSON 계열(application/json, +json)은 파싱, 나머지는 text
    const readBody = async (res: Response): Promise<any> => {
      const text = await res.text();
      if (!text) return undefined;
      return (res.headers.get('Content-Type') ?? '').includes('json') ? JSON.parse(text) : text;
    };

    const bodyProcess = (options as FetchDeclarative<unknown>).process;
    const defaultFetching = async (helper: HelperHostSet | undefined, url: RequestInfo | URL, init?: RequestInit): Promise<any> => {
      const rawBody: any = init?.body;
      let body: BodyInit | undefined = rawBody;
      let contentType: string | undefined;
      if (rawBody !== undefined && rawBody !== null && !isBodyInit(rawBody)) {
        if (bodyProcess === 'json') {
          body = JSON.stringify(rawBody);
          contentType = 'application/json';
        } else if (bodyProcess === 'form') {
          const fd = new FormData();
          for (const [k, v] of Object.entries(rawBody)) {
            if (v !== undefined && v !== null) fd.append(k, v as any);
          }
          body = fd;
        } else if (bodyProcess === 'urlencoded') {
          body = new URLSearchParams(rawBody as Record<string, string>).toString();
          contentType = 'application/x-www-form-urlencoded';
        } else if (bodyProcess === 'text') {
          body = String(rawBody);
          contentType = 'text/plain';
        }
      }
      // Headers 인스턴스/배열/객체 모두 받는다 (객체 spread 는 Headers 인스턴스를 {} 로 날림). 사용자가 준 Content-Type 우선.
      const headers = new Headers(init?.headers);
      if (contentType && !headers.has('Content-Type')) headers.set('Content-Type', contentType);
      // 요소가 속한 window 의 fetch (SSR 이면 요청별 window). 없으면 globalThis.fetch
      const w = helper?.$w as any;
      const fetchFn: typeof globalThis.fetch = typeof w?.fetch === 'function' ? w.fetch.bind(w) : globalThis.fetch;
      const res: Response = await fetchFn(url, {
        ...init,
        method: init?.method ?? (body !== undefined ? 'POST' : 'GET'),
        headers,
        body
      });
      if (!res.ok) {
        // status/응답 body 를 코드에서 꺼낼 수 있게 core 의 HttpResponseError 로 던진다
        const error = new HttpResponseError(`fetch failed: ${res.status} ${String(url)}`);
        error.response = res;
        error.body = await readBody(res).catch(() => undefined);
        throw error;
      }
      return readBody(res);
    };

    const trigger = (options as { trigger?: string }).trigger;
    const isAfter = trigger === 'after' || (trigger !== 'before' && 'valueKey' in options);
    const manual = (options as FetchManual).manual;

    /**
     * 호출 한 번을 시작한다. 건너뛸 호출(떨어진 뒤 시작 / filter false)이면 null.
     * 프레임워크가 끊는 경우(disconnect / abortPrevious)는 에러가 아니라 "할 일 없음" — frameworkAborted() 로 구분한다.
     */
    const begin = (inst: any, args: any[]) => {
      let helper: HelperHostSet | undefined;
      try {
        helper = SwcUtils.getHelperAndHostSet(inst);
      } catch {
        helper = undefined;
      }
      // disconnect 된 뒤에 새로 시작하는 호출(예: 떠나기 직전 걸어둔 setTimeout)은 건너뛴다.
      // 한 번도 connect 안 된 요소는 해당 없음 (FetchLifeCycler 가 disconnect 때만 표시)
      if (inst?.__swc_fetchDetached && inst.isConnected === false) return null;
      if (options.filter && !options.filter({ self: inst, helper: helper!, args })) return null;

      const controller = new AbortController();
      const active = getActiveControllers(inst);
      active.add(controller);
      if (options.abortPrevious) {
        const latest = getLatestControllers(inst);
        latest.get(propertyKey)?.abort(abortError('superseded by a newer call'));
        latest.set(propertyKey, controller);
      }
      const frameworkAborted = () => controller.signal.aborted;
      const cleanup = () => {
        active.delete(controller);
        if (options.abortPrevious && getLatestControllers(inst).get(propertyKey) === controller) getLatestControllers(inst).delete(propertyKey);
      };

      // 사용자 manual 이 signal 을 무시해도 abort 즉시 끝나도록 abort 와 경쟁시킨다
      const aborted = new Promise<never>((_, reject) => {
        if (controller.signal.aborted) reject(controller.signal.reason);
        else controller.signal.addEventListener('abort', () => reject(controller.signal.reason), { once: true });
      });
      aborted.catch(() => {}); // race 에 안 쓰이고 끝나도 unhandled rejection 이 안 나게

      // 수동형이면 manual(…, signal, returnValue), 선언형이면 url/init 으로 기본 fetch
      const doFetch = (init?: RequestInit, returnValue?: any): Promise<any> => {
        const pending = Promise.resolve().then(() => manual
          ? manual(inst, helper!, args, controller.signal, returnValue)
          : defaultFetching(helper, resolveUrl(inst, helper!, args), { ...init, signal: combineSignals(init?.signal, controller.signal) }));
        pending.catch(() => {}); // abort 로 race 에서 진 뒤 늦게 reject 돼도 unhandled rejection 이 안 나게
        return Promise.race([pending, aborted]);
      };

      // before: request 조립(인자 기반) → fetch
      const fetchBefore = () => {
        const reqOpt = manual ? undefined : (options as FetchDeclarative<RequestFactory>).request;
        return Promise.resolve()
          .then(() => (typeof reqOpt === 'string' ? { method: reqOpt } : typeof reqOpt === 'function' ? reqOpt(inst, helper!, args) : undefined))
          .then(init => doFetch(init));
      };
      // after: returned(메서드 리턴 / 필드면 마지막 인자)에서 body 를 뽑아 request 와 합쳐 fetch
      const fetchAfter = async (returned: any) => {
        const body = extractBody(returned);
        if (manual) return doFetch(undefined, body);
        const reqOpt = (options as FetchDeclarative<ReturnRequestFactory>).request;
        const reqInit: RequestInit | undefined = typeof reqOpt === 'string'
          ? { method: reqOpt }
          : typeof reqOpt === 'function' ? await reqOpt(inst, helper!, args, returned) : undefined;
        return doFetch({ ...reqInit, body: reqInit?.body ?? body });
      };
      // 결과 Promise: 프레임워크가 끊으면 끝나지 않는다. 사용자가 안 받아도 unhandled rejection 이 안 나게
      const quiet = (run: Promise<any>): Promise<any> => {
        const promise = new Promise<any>((resolve, reject) => {
          run.then(v => { if (!frameworkAborted()) resolve(v); }, e => { if (!frameworkAborted()) reject(e); }).finally(cleanup);
        });
        promise.catch(() => {});
        return promise;
      };

      return { frameworkAborted, cleanup, fetchBefore, fetchAfter, quiet };
    };

    // ── 필드: declare 필드의 값을 프레임워크가 만든다 ──
    // 선언이 함수(`(…) => Promise<T>`)든 값(`Promise<T>`)든 데코레이터가 받는 건 (prototype, 이름) 뿐이고
    // 타입은 런타임에 없다(빌드 도구에 따라 design:type 도 없음). 그래서 필드 값은 "부를 수 있는 함수이면서 Promise" 하나로 만든다:
    //   - 부르면 (함수로 선언한 경우): 부를 때마다 새 요청. 인자 = url/request 재료, after(POST…)면 마지막 인자가 body
    //   - then/catch/finally/await (Promise 로 선언한 경우): 기억된 요청. 처음이면 요청, 성공하면 기억, 실패하면 잊어서 다음에 다시
    //   - 대입: undefined / null 이면 잊음, 다른 값/Promise 면 그걸 기억 (예: SSR 로 받은 값)
    // 사용자는 선언한 타입대로만 쓴다 (TS 가 Promise 로 선언한 필드의 호출을 막는다).
    if (isField) {
      // 타입 정보가 있는 빌드(emitDecoratorMetadata)면 함수/Promise 가 아닌 선언을 바로 알린다 (없으면 컴파일 검사만)
      const designType = ReflectUtils.getMetadata('design:type', target, propertyKey);
      if (designType !== undefined && designType !== Function && designType !== Promise && designType !== Object) {
        throw new Error(`[SWC] @fetch field "${String(propertyKey)}" must be a function returning a Promise (\`declare ${String(propertyKey)}: (…) => Promise<T>\`) or a Promise (\`declare ${String(propertyKey)}: Promise<T>\`), not ${designType?.name ?? String(designType)}.`);
      }
      // 같은 이름을 다른 데코레이터가 이미 차지했으면(접근자 등) 정의 시점에 바로 알린다
      if (Object.prototype.hasOwnProperty.call(target, propertyKey)) {
        throw new Error(`[SWC] "${String(propertyKey)}" is a @fetch field but something else already defines it. Put triggers/outputs on a method that calls this.${String(propertyKey)}().`);
      }

      // 기억된 요청 (Promise 로 쓸 때). body 는 request 팩토리로 (인자 없음 → args = [], returnValue = undefined)
      const remembered = (inst: any): Promise<any> => {
        const cache = cacheOf(inst);
        const hit = cache.get(propertyKey);
        if (hit) return hit;
        const call = begin(inst, []);
        if (!call) return never(); // 건너뛴 호출은 기억하지 않는다
        const promise = call.quiet(isAfter ? call.fetchAfter(undefined) : call.fetchBefore());
        cache.set(propertyKey, promise);
        promise.catch(() => { if (cache.get(propertyKey) === promise) cache.delete(propertyKey); });
        return promise;
      };

      // 인스턴스마다 필드 값(함수 겸 Promise) 하나 — 읽을 때마다 같은 값
      const values = new WeakMap<object, any>();
      const get = function (this: any) {
        const inst = this;
        let value = values.get(inst);
        if (value) return value;
        value = function (...args: any[]) {
          const call = begin(inst, args);
          if (!call) return never();
          return call.quiet(isAfter ? call.fetchAfter(args[args.length - 1]) : call.fetchBefore());
        };
        value.then = (ok?: any, fail?: any) => remembered(inst).then(ok, fail);
        value.catch = (fail?: any) => remembered(inst).catch(fail);
        value.finally = (done?: any) => remembered(inst).finally(done);
        // instanceof Promise 로 Promise 를 알아보는 코드(출력 데코레이터 등)도 Promise 로 보게 한다.
        // then/catch/finally 는 위에서 직접 달았으니 Promise.prototype 의 것(내부 슬롯 필요)은 쓰이지 않는다.
        Object.setPrototypeOf(value, Promise.prototype);
        values.set(inst, value);
        return value;
      };
      (get as any)[FETCH_FIELD_FN] = true;
      Object.defineProperty(target, propertyKey, {
        get,
        set(this: any, v: any) {
          const cache = cacheOf(this);
          if (v === undefined || v === null) cache.delete(propertyKey);
          else cache.set(propertyKey, Promise.resolve(v));
        },
        configurable: true,
      });
      return;
    }

    // ── 메서드: 트리거 핸들러용 ──
    const originalMethod = descriptor!.value;

    // after 모드는 fetch 결과를 리턴하므로 래퍼가 항상 Promise 를 돌려준다 — 동기 메서드면 선언과 어긋나니 알려준다
    let warnedSync = false;
    const isPromiseLike = (v: any) => v instanceof Promise || (v && typeof v.then === 'function');
    const guardSync = (raw: any) => {
      if (!warnedSync && originalMethod?.constructor?.name !== 'AsyncFunction' && !isPromiseLike(raw)) {
        warnedSync = true;
        console.warn(`[SWC] @fetch (after) on "${String(propertyKey)}" always returns a Promise: declare the method async (or with an explicit Promise return type) so the signature matches.`);
      }
    };

    // 호출 인자는 유지한 채, @fetchPromise 자리만 채운다
    const injectPromise = (inst: any, methodName: string | symbol, args: any[], promise: Promise<any>): any[] => {
      const saves = getParameterMetadata(inst, methodName);
      if (!saves.length) return args;
      const out = [...args];
      for (const s of saves) {
        if (s.kind === 'fetchPromise') out[s.index] = promise;
      }
      return out;
    };

    descriptor!.value = function (...args: any[]) {
      const inst = this as any;
      const call = begin(inst, args);
      if (!call) return undefined;

      if (!isAfter) {
        // before: 요청을 시작하고, 그 Promise 를 @fetchPromise 자리에 넣어 메서드를 바로 부른다. 메서드 반환값을 그대로 리턴.
        return originalMethod.apply(inst, injectPromise(inst, propertyKey, args, call.quiet(call.fetchBefore())));
      }

      // after: 메서드 실행 → 리턴값에서 body → fetch → fetch 결과 리턴
      return (async () => {
        try {
          const raw = originalMethod.apply(inst, args);
          guardSync(raw);
          return await call.fetchAfter(await raw);
        } catch (e) {
          if (call.frameworkAborted()) return undefined; // 끊긴 호출은 조용히
          throw e;
        } finally {
          call.cleanup();
        }
      })();
    };

    return descriptor;
  }) as FetchDecorator;
}

export function fetch(url: string): FetchDecorator;
export function fetch(options: FetchOptions): FetchDecorator;
export function fetch(optionsOrUrl: FetchOptions | string): FetchDecorator {
  return createFetch(optionsOrUrl);
}

// ─── Aliases ───

/** trigger/valueKey 조합 (before 에는 valueKey 금지) */
type FetchTriggerOptions =
  | { trigger?: 'before'; valueKey?: never }
  | { trigger: 'after'; valueKey?: string }
  | { trigger?: never; valueKey: string };

/** fetchManual 의 나머지 옵션 (공통 훅 + trigger/valueKey) */
export type FetchManualOptions = FetchType & FetchTriggerOptions;

/**
 * @fetchManual(fn, options?) = @fetch({ manual: fn, ...options })
 * 서비스 호출 등 요청을 직접 만들 때. 예: @fetchManual((self) => self.myService.getProfile({}))
 */
export function fetchManual(manual: FetchManualFn, options?: FetchManualOptions): FetchDecorator {
  return createFetch({ ...(options ?? {}), manual } as FetchOptions);
}

/** GET/DELETE(before 모드) 별칭의 옵션 — 메서드는 고정이라 request 는 팩토리만 (method 는 덮어씀) */
export type FetchBeforeMethodOptions = FetchType & Omit<FetchDeclarative<RequestFactory>, 'url' | 'request' | 'manual'> & { request?: RequestFactory };
/** POST/PUT/PATCH(after 모드) 별칭의 옵션 — 메서드 리턴값(또는 returnValue[valueKey])이 body */
export type FetchAfterMethodOptions = FetchType & Omit<FetchDeclarative<ReturnRequestFactory>, 'url' | 'request' | 'manual'> & { request?: ReturnRequestFactory; valueKey?: string };

type FetchUrl = RequestInfo | URL | FetchUrlFactory;

const beforeMethod = (method: string) => (url: FetchUrl, options?: FetchBeforeMethodOptions): FetchDecorator => {
  const { request, ...rest } = options ?? {};
  return createFetch({
    ...rest,
    url,
    trigger: 'before',
    request: (c, h, p) => ({ ...(request?.(c, h, p) ?? {}), method })
  } as FetchOptions);
};

const afterMethod = (method: string) => (url: FetchUrl, options?: FetchAfterMethodOptions): FetchDecorator => {
  const { request, ...rest } = options ?? {};
  return createFetch({
    ...rest,
    url,
    trigger: 'after',
    request: (c, h, p, returnValue) => ({ ...(request?.(c, h, p, returnValue) ?? {}), method })
  } as FetchOptions);
};

/** @fetchGet(url, options?) — before 모드 GET. 요청 Promise 는 @fetchPromise 로 */
export const fetchGet = beforeMethod('GET');
/** @fetchDelete(url, options?) — before 모드 DELETE (body 없음) */
export const fetchDelete = beforeMethod('DELETE');
/** @fetchPost(url, options?) — after 모드 POST. 메서드 리턴값이 body, fetch 결과를 리턴 */
export const fetchPost = afterMethod('POST');
/** @fetchPut(url, options?) — after 모드 PUT */
export const fetchPut = afterMethod('PUT');
/** @fetchPatch(url, options?) — after 모드 PATCH */
export const fetchPatch = afterMethod('PATCH');

/**
 * @fetchLatest(url | options) = @fetch({ ...options, abortPrevious: true })
 * 연달아 부르면 이전 요청을 끊고 마지막 것만 살린다 (검색 자동완성 등)
 */
export function fetchLatest(url: string): FetchDecorator;
export function fetchLatest(options: FetchOptions): FetchDecorator;
export function fetchLatest(optionsOrUrl: FetchOptions | string): FetchDecorator {
  const options: FetchOptions = typeof optionsOrUrl === 'string' ? { url: optionsOrUrl } : optionsOrUrl;
  return createFetch({ ...options, abortPrevious: true } as FetchOptions);
}

/** @fetchBefore(options) = @fetch({ ...options, trigger: 'before' }) */
export function fetchBefore(options: FetchType & (FetchDeclarative<RequestFactory> | FetchManual)): FetchDecorator {
  return createFetch({ ...options, trigger: 'before' } as FetchOptions);
}

/** @fetchAfter(options) = @fetch({ ...options, trigger: 'after' }) */
export function fetchAfter(options: FetchType & { valueKey?: string } & (FetchDeclarative<ReturnRequestFactory> | FetchManual)): FetchDecorator {
  return createFetch({ ...options, trigger: 'after' } as FetchOptions);
}

/** @fetch 가 붙은 메서드 목록 조회 */
export const getFetchMetadata = (target: any): FetchMetadata[] | undefined => {
  const constructor = typeof target === 'function' ? target : target.constructor;
  return ReflectUtils.findAllMetadata<any[]>(FETCH_METADATA_KEY, constructor).flat();
};

// 메타데이터 값 안 어딘가가 이 이름(propertyKey)을 가리키는지 (Map 키 / 배열 / { propertyKey })
const refersTo = (v: any, key: string | symbol): boolean => {
  if (v instanceof Map) return v.has(key) || [...v.values()].some(x => refersTo(x, key));
  if (Array.isArray(v)) return v.some(x => refersTo(x, key));
  return !!v && typeof v === 'object' && v.propertyKey === key;
};
const findDescriptor = (proto: any, key: string | symbol): PropertyDescriptor | undefined => {
  for (let p = proto; p && p !== Object.prototype; p = Object.getPrototypeOf(p)) {
    const d = Object.getOwnPropertyDescriptor(p, key);
    if (d) return d;
  }
  return undefined;
};
const fieldHint = (key: string | symbol) => `Put triggers/outputs on a method that calls this.${String(key)}().`;

/**
 * @elementDefine 이 클래스 정의 시점에 부른다 (멤버 데코레이터가 다 붙은 뒤라 붙인 순서와 무관).
 * 필드 @fetch 와 같은 이름에 다른 SWC 데코레이터가 붙었으면 에러 — 메서드 데코레이터는 TS 가 이미 막지만
 * JS / `as any` 로 우회한 경우, 필드용 데코레이터(@attribute, @query, @property …)까지 잡는다.
 */
export const assertFetchFields = (constructor: any): void => {
  const fields = (getFetchMetadata(constructor) ?? []).filter(m => m.field).map(m => m.propertyKey);
  for (const key of fields) {
    const d = findDescriptor(constructor.prototype, key);
    if (!d?.value?.[FETCH_FIELD_FN] && !(d?.get as any)?.[FETCH_FIELD_FN]) {
      throw new Error(`[SWC] "${String(key)}" is a @fetch field but another decorator replaced it. ${fieldHint(key)}`);
    }
    for (const mk of ReflectUtils.getMetadataKeys(constructor)) {
      if (mk === FETCH_METADATA_KEY || typeof mk === 'string') continue; // design:* 등 TS 메타데이터는 제외
      if (refersTo(ReflectUtils.getMetadata(mk, constructor), key)) {
        const name = typeof mk === 'symbol' ? mk.description?.replace('simple-web-component:', '@') : String(mk);
        throw new Error(`[SWC] "${String(key)}" is a @fetch field — it can't also have ${name}. ${fieldHint(key)}`);
      }
    }
  }
};

/**
 * disconnect 시 진행 중인 @fetch 요청을 전부 abort (메서드/after 는 실행되지 않고 조용히 끝난다).
 * 떨어진 동안 새로 시작하는 호출도 건너뛰도록 표시하고, 다시 connect 되면 표시를 지운다.
 */
export class FetchLifeCycler implements ElementDefineLifeCycler {
  onConnected(helperHostSet: HelperHostSet): void {
    const inst = helperHostSet.$this;
    inst.__swc_fetchDetached = false;
    // declare 를 빠뜨리면 인스턴스 필드(undefined)가 프로토타입의 요청 함수를 가린다
    for (const m of getFetchMetadata(inst) ?? []) {
      if (m.field && Object.prototype.hasOwnProperty.call(inst, m.propertyKey)) {
        throw new Error(`[SWC] @fetch field "${String(m.propertyKey)}" must be declared with \`declare\` (e.g. \`declare ${String(m.propertyKey)}: (…) => Promise<T>\`) — a plain field shadows the request function.`);
      }
    }
  }

  onDisconnected(helperHostSet: HelperHostSet): void {
    const inst = helperHostSet.$this;
    inst.__swc_fetchDetached = true;
    valueCache.delete(inst); // 끊긴 요청은 끝나지 않으니, 다시 붙은 뒤 읽으면 새로 요청하도록 기억을 지운다
    const active: Set<AbortController> | undefined = inst.__swc_fetchControllers;
    if (!active?.size) return;
    for (const c of active) c.abort(abortError('element disconnected'));
    active.clear();
  }
}
