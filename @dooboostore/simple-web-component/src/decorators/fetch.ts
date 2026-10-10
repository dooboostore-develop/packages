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

/** 모드(선언형/수동형, before/after)와 무관한 공통 옵션 */
export type FetchType = {
  /**
   * 같은 메서드를 다시 부르면 진행 중인 이전 요청을 abort 한다 (검색 자동완성 등 마지막 요청만 살림).
   * 끊긴 이전 호출은 조용히 undefined 로 끝난다.
   */
  abortPrevious?: boolean;
  /** false 를 리턴하면 이번 호출을 통째로 건너뛴다 (메서드도 fetch 도 실행 안 함, undefined 리턴). */
  filter?: (
    currentThis: any,
    helper: HelperHostSet,
    parameter: any[]
  ) => boolean | Promise<boolean>;
  /** filter 통과 후 가장 먼저 실행 (await). 리턴값은 무시. init 조립은 request 팩토리 담당. */
  before?: (
    currentThis: any,
    helper: HelperHostSet,
    parameter: any[]
  ) => void | Promise<void>;
  /**
   * fetch settled 후 호출 (fulfilled/rejected 모두). 호출만 하고 리턴값은 무시.
   * 변환·복구가 필요하면 manual 로 직접 구현할 것.
   */
  after?: (
    currentThis: any,
    helper: HelperHostSet,
    parameter: any[],
    settled: PromiseSettledResult<any>
  ) => void | Promise<void>;
  /**
   * 성공/실패 무관 항상 실행 (다른 데코레이터의 finally 와 같은 규칙). 에러는 삼키지 않고 전파.
   * args: 메서드에 넘긴 인자, result: 이번 호출의 리턴값(before 모드 = 메서드 리턴, after 모드 = fetch 결과)
   */
  finally?: (
    currentThis: any,
    helper: HelperHostSet,
    parameter: any[],
    ctx: { args: any[]; result?: any; error?: any }
  ) => any | Promise<any>;
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
}

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
  // before(기본): (선언형 fetch | manual) → settled를 @fetchSettled 자리에
  // 주입해 메서드 실행. 메서드 결과 리턴. request 없으면 GET. valueKey 는 after 전용이라 금지.
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

function createFetch(optionsOrUrl: FetchOptions | string): MethodDecorator {
  const options: FetchOptions = typeof optionsOrUrl === 'string' ? { url: optionsOrUrl } : optionsOrUrl;
  return (target: Object, propertyKey: string | symbol, descriptor?: PropertyDescriptor) => {
    const constructor = target.constructor;
    const list = (ReflectUtils.getOwnMetadata(FETCH_METADATA_KEY, constructor) as FetchMetadata[] | undefined) ?? [];
    list.push({ propertyKey, options });
    ReflectUtils.defineMetadata(FETCH_METADATA_KEY, list, constructor);

    if (!descriptor) return descriptor;
    const originalMethod = descriptor.value;

    // Runtime guard (TS cannot check this at declaration): the wrapper below is
    // always async, so a sync method's declared return type never matches the
    // actual Promise return. Async methods and explicit Promise returns are fine.
    let warnedSync = false;
    const isPromiseLike = (v: any) => v instanceof Promise || (v && typeof v.then === 'function');
    const guardSync = (raw: any) => {
      if (!warnedSync && originalMethod?.constructor?.name !== 'AsyncFunction' && !isPromiseLike(raw)) {
        warnedSync = true;
        console.warn(`[SWC] @fetch on "${String(propertyKey)}" always returns a Promise: declare the method async (or with an explicit Promise return type) so the signature matches.`);
      }
    };

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

    // 호출 인자는 유지한 채, @fetchSettled 자리만 채운다
    const injectSettled = (inst: any, methodName: string | symbol, args: any[], settled: PromiseSettledResult<any>): any[] => {
      const saves = getParameterMetadata(inst, methodName);
      if (!saves.length) return args;
      const out = [...args];
      for (const s of saves) {
        if (s.kind === 'fetchSettled') out[s.index] = settled;
      }
      return out;
    };

    descriptor.value = async function (...args: any[]) {
      const inst = this as any;
      let helper: HelperHostSet | undefined;
      try {
        helper = SwcUtils.getHelperAndHostSet(inst);
      } catch {
        helper = undefined;
      }

      // disconnect 된 뒤에 새로 시작하는 호출(예: 떠나기 직전 걸어둔 setTimeout)도 조용히 건너뛴다.
      // 한 번도 connect 안 된 요소는 해당 없음 (FetchLifeCycler 가 disconnect 때만 표시)
      if (inst?.__swc_fetchDetached && inst.isConnected === false) return undefined;

      // filter → before → (before 모드: fetch → 메서드 / after 모드: 메서드 → fetch) → finally
      if (options.filter && !(await options.filter(inst, helper!, args))) return undefined;
      if (options.before) await options.before(inst, helper!, args);

      const manual = (options as FetchManual).manual;

      // 프레임워크가 끊는 경우(disconnect / abortPrevious)는 에러가 아니라 "할 일 없음" → 조용히 undefined
      const controller = new AbortController();
      const active = getActiveControllers(inst);
      active.add(controller);
      if (options.abortPrevious) {
        const latest = getLatestControllers(inst);
        latest.get(propertyKey)?.abort(abortError('superseded by a newer call'));
        latest.set(propertyKey, controller);
      }
      const frameworkAborted = () => controller.signal.aborted;

      // 사용자 manual 이 signal 을 무시해도 abort 즉시 호출이 끝나도록 abort 와 경쟁시킨다
      const aborted = new Promise<never>((_, reject) => {
        if (controller.signal.aborted) reject(controller.signal.reason);
        else controller.signal.addEventListener('abort', () => reject(controller.signal.reason), { once: true });
      });
      aborted.catch(() => {}); // race 에 안 쓰이고 끝나도 unhandled rejection 이 안 나게

      // 수동형이면 manual(…, signal, returnValue), 선언형이면 url/init 으로 기본 fetch
      const runFetch = async (init?: RequestInit, returnValue?: any): Promise<PromiseSettledResult<any>> => {
        let settled: PromiseSettledResult<any>;
        try {
          const pending = Promise.resolve(manual
            ? manual(inst, helper!, args, controller.signal, returnValue)
            : defaultFetching(helper, resolveUrl(inst, helper!, args), { ...init, signal: combineSignals(init?.signal, controller.signal) }));
          pending.catch(() => {}); // abort 로 race 에서 진 뒤 늦게 reject 돼도 unhandled rejection 이 안 나게
          settled = { status: 'fulfilled', value: await Promise.race([pending, aborted]) };
        } catch (reason) {
          settled = { status: 'rejected', reason };
        }
        // 떨어진 요소의 DOM 을 건드리지 않게, 프레임워크 abort 면 after 훅은 건너뛴다
        if (options.after && !frameworkAborted()) await options.after(inst, helper!, args, settled);
        return settled;
      };

      let callArgs = args;
      let result: any;
      let error: any;
      try {
        const trigger = (options as { trigger?: string }).trigger;
        const isAfter = trigger === 'after' || (trigger !== 'before' && 'valueKey' in options);
        if (isAfter) {
          // after: 메서드 실행 → body 추출 → request 와 합쳐 fetch → fetch 결과 리턴.
          const rawReturned = originalMethod.apply(inst, callArgs);
          guardSync(rawReturned);
          const returned = await rawReturned;
          const body = extractBody(returned);
          let settled: PromiseSettledResult<any>;
          if (manual) {
            settled = await runFetch(undefined, body);
          } else {
            const reqOpt = (options as FetchDeclarative<ReturnRequestFactory>).request;
            const reqInit: RequestInit | undefined = typeof reqOpt === 'string'
              ? { method: reqOpt }
              : typeof reqOpt === 'function' ? await reqOpt(inst, helper!, args, returned) : undefined;
            settled = await runFetch({ ...reqInit, body: reqInit?.body ?? body });
          }
          if (frameworkAborted()) {
            error = controller.signal.reason;
            return undefined;
          }
          if (settled.status === 'rejected') throw settled.reason;
          result = settled.value;
        } else {
          // before: request 조립 → fetch → settled 를 주입해 메서드 실행. 메서드 결과 리턴.
          const reqOpt = manual ? undefined : (options as FetchDeclarative<RequestFactory>).request;
          const init: RequestInit | undefined = typeof reqOpt === 'string' ? { method: reqOpt } : typeof reqOpt === 'function' ? await reqOpt(inst, helper!, args) : undefined;
          const settled = await runFetch(init);
          if (frameworkAborted()) {
            // 떨어진 요소에 그리지 않게 메서드도 실행하지 않는다
            error = controller.signal.reason;
            return undefined;
          }
          callArgs = injectSettled(inst, propertyKey, args, settled);
          const rawResult = originalMethod.apply(inst, callArgs);
          guardSync(rawResult);
          result = await rawResult;
        }
        return result;
      } catch (e) {
        error = e;
        throw e;
      } finally {
        active.delete(controller);
        if (options.abortPrevious && getLatestControllers(inst).get(propertyKey) === controller) getLatestControllers(inst).delete(propertyKey);
        // finally 는 정리용이라 프레임워크 abort 여도 실행 (ctx.error 에 AbortError)
        if (options.finally) await options.finally(inst, helper!, args, { args: callArgs, result, error });
      }
    };

    return descriptor;
  };
}

export function fetch(url: string): MethodDecorator;
export function fetch(options: FetchOptions): MethodDecorator;
export function fetch(optionsOrUrl: FetchOptions | string): MethodDecorator {
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
export function fetchManual(manual: FetchManualFn, options?: FetchManualOptions): MethodDecorator {
  return createFetch({ ...(options ?? {}), manual } as FetchOptions);
}

/** GET/DELETE(before 모드) 별칭의 옵션 — 메서드는 고정이라 request 는 팩토리만 (method 는 덮어씀) */
export type FetchBeforeMethodOptions = FetchType & Omit<FetchDeclarative<RequestFactory>, 'url' | 'request' | 'manual'> & { request?: RequestFactory };
/** POST/PUT/PATCH(after 모드) 별칭의 옵션 — 메서드 리턴값(또는 returnValue[valueKey])이 body */
export type FetchAfterMethodOptions = FetchType & Omit<FetchDeclarative<ReturnRequestFactory>, 'url' | 'request' | 'manual'> & { request?: ReturnRequestFactory; valueKey?: string };

type FetchUrl = RequestInfo | URL | FetchUrlFactory;

const beforeMethod = (method: string) => (url: FetchUrl, options?: FetchBeforeMethodOptions): MethodDecorator => {
  const { request, ...rest } = options ?? {};
  return createFetch({
    ...rest,
    url,
    trigger: 'before',
    request: (c, h, p) => ({ ...(request?.(c, h, p) ?? {}), method })
  } as FetchOptions);
};

const afterMethod = (method: string) => (url: FetchUrl, options?: FetchAfterMethodOptions): MethodDecorator => {
  const { request, ...rest } = options ?? {};
  return createFetch({
    ...rest,
    url,
    trigger: 'after',
    request: (c, h, p, returnValue) => ({ ...(request?.(c, h, p, returnValue) ?? {}), method })
  } as FetchOptions);
};

/** @fetchGet(url, options?) — before 모드 GET. 결과는 @fetchSettled 으로 */
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
export function fetchLatest(url: string): MethodDecorator;
export function fetchLatest(options: FetchOptions): MethodDecorator;
export function fetchLatest(optionsOrUrl: FetchOptions | string): MethodDecorator {
  const options: FetchOptions = typeof optionsOrUrl === 'string' ? { url: optionsOrUrl } : optionsOrUrl;
  return createFetch({ ...options, abortPrevious: true } as FetchOptions);
}

/** @fetchBefore(options) = @fetch({ ...options, trigger: 'before' }) */
export function fetchBefore(options: FetchType & (FetchDeclarative<RequestFactory> | FetchManual)): MethodDecorator {
  return createFetch({ ...options, trigger: 'before' } as FetchOptions);
}

/** @fetchAfter(options) = @fetch({ ...options, trigger: 'after' }) */
export function fetchAfter(options: FetchType & { valueKey?: string } & (FetchDeclarative<ReturnRequestFactory> | FetchManual)): MethodDecorator {
  return createFetch({ ...options, trigger: 'after' } as FetchOptions);
}

/** @fetch 가 붙은 메서드 목록 조회 */
export const getFetchMetadata = (target: any): FetchMetadata[] | undefined => {
  const constructor = typeof target === 'function' ? target : target.constructor;
  return ReflectUtils.findAllMetadata<any[]>(FETCH_METADATA_KEY, constructor).flat();
};

/**
 * disconnect 시 진행 중인 @fetch 요청을 전부 abort (메서드/after 는 실행되지 않고 조용히 끝난다).
 * 떨어진 동안 새로 시작하는 호출도 건너뛰도록 표시하고, 다시 connect 되면 표시를 지운다.
 */
export class FetchLifeCycler implements ElementDefineLifeCycler {
  onConnected(helperHostSet: HelperHostSet): void {
    helperHostSet.$this.__swc_fetchDetached = false;
  }

  onDisconnected(helperHostSet: HelperHostSet): void {
    const inst = helperHostSet.$this;
    inst.__swc_fetchDetached = true;
    const active: Set<AbortController> | undefined = inst.__swc_fetchControllers;
    if (!active?.size) return;
    for (const c of active) c.abort(abortError('element disconnected'));
    active.clear();
  }
}
