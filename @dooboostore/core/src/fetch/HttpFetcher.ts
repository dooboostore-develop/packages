import { Fetcher, FetcherRequest } from './Fetcher';
import { ConvertUtils } from '../convert/ConvertUtils';

// timeout(라이브러리가 자동으로 abort)과 signal(사용자가 직접 abort)은 같이 쓸 수 있어야 한다 -
// 둘 중 먼저 오는 쪽이 이기면 됨. 상호배타로 막았다가(signal?:never) 되돌림: 네이티브
// AbortSignal.timeout()/AbortSignal.any()로 제대로 합치면 되는 문제였음(execute() 참고).
export type RequestInitType = RequestInit & { timeout?: number };
export type RequestInfo = {
  requestInfo: string | URL;
  init: RequestInitType;
};
export type HttpFetcherTarget =
  | URL
  | string
  | { url: URL | string; searchParams?: { [key: string]: any } | URLSearchParams | [string, unknown][] };
export type HttpFetcherConfig<CONFIG, RESPONSE = Response> = {
  fetch?: RequestInitType;
  fetcher?: typeof fetch;
  config?: CONFIG;
  allowedResponseNotOk?: boolean;
  beforeProxyFetch?: <T extends RequestInfo | URL>(
    config: BeforeProxyFetchParams<T>
  ) => Promise<BeforeProxyFetchParams<T>>;
  afterProxyFetch?: <T extends RequestInfo | URL>(config: AfterProxyFetchParams<T>) => Promise<Response>;
  skipGlobalBeforeProxyFetch?: boolean;
  skipGlobalAfterProxyFetch?: boolean;
  fetchResponseBeforeCallBack?: (config: HttpFetcherConfig<CONFIG, RESPONSE>) => void;
  fetchResponseAfterCallBack?: (data: Response, config: HttpFetcherConfig<CONFIG, RESPONSE>) => void;
  hasResponseErrorChecker?: (data: Response, config: HttpFetcherConfig<CONFIG, RESPONSE>) => any;
};
export type BeforeProxyFetchParams<T = RequestInfo | URL> = {
  requestInfo: T;
  init?: RequestInit;
};
export type AfterProxyFetchParams<T = RequestInfo | URL> = {
  fetch: {
    target: URL;
    requestInit: RequestInit;
  }
  config: BeforeProxyFetchParams<T>;
  response: Response;
};

export type FetchSet = { target: URL, requestInit?: RequestInit };

export class HttpResponseError<T = any> extends Error {
  public error?: any;
  public body?: T;
  public response?: Response;
}

export const isHttpResponseError = (data: any): data is HttpResponseError => {
  return data instanceof HttpResponseError;
}

export type HttpFetcherRequest<RESPONSE = Response, CONFIG = any, T = RESPONSE> = FetcherRequest<
  HttpFetcherTarget,
  RESPONSE,
  HttpFetcherConfig<CONFIG, RESPONSE>,
  T
>

export class HttpFetcher<
  CONFIG = any,
  RESPONSE = Response,
  PIPE extends { responseData?: RESPONSE | undefined } = any
> extends Fetcher<HttpFetcherTarget, RESPONSE, HttpFetcherConfig<CONFIG, RESPONSE>, PIPE> {
  // get/post/put/patch/head/delete가 전부 config.config.fetch.method를 세팅하려고 caller가
  // 넘긴 config(.fetch) 객체를 직접 mutate했다 - 같은 config 객체를 여러 호출이 공유하면
  // (예: Promise.all로 동시에 get/post) 서로의 method를 덮어쓰는 레이스가 생겼다. caller의
  // 객체는 절대 건드리지 않고, 얕은 복사본 위에 method만 얹어서 반환한다.
  private withMethod<T = RESPONSE>(
    config: HttpFetcherRequest<RESPONSE, CONFIG, T>,
    method: string
  ): HttpFetcherRequest<RESPONSE, CONFIG, T> {
    return { ...config, config: { ...config.config, fetch: { ...config.config?.fetch, method } } };
  }

  get<T = RESPONSE>(config: HttpFetcherRequest<RESPONSE, CONFIG, T>): Promise<T> {
    return this.fetch(this.withMethod(config, 'GET'));
  }

  post<T = RESPONSE>(
    config: HttpFetcherRequest<RESPONSE, CONFIG, T>
  ): Promise<T> {
    return this.fetch(this.withMethod(config, 'POST'));
  }

  patch<T = RESPONSE>(
    config: HttpFetcherRequest<RESPONSE, CONFIG, T>
  ): Promise<T> {
    return this.fetch(this.withMethod(config, 'PATCH'));
  }

  put<T = RESPONSE>(
    config: HttpFetcherRequest<RESPONSE, CONFIG, T>
  ): Promise<T> {
    return this.fetch(this.withMethod(config, 'PUT'));
  }

  head<T = RESPONSE>(
    config: HttpFetcherRequest<RESPONSE, CONFIG, T>
  ): Promise<T> {
    return this.fetch(this.withMethod(config, 'HEAD'));
  }

  delete<T = RESPONSE>(
    config: HttpFetcherRequest<RESPONSE, CONFIG, T>
  ): Promise<T> {
    return this.fetch(this.withMethod(config, 'DELETE'));
  }

  protected async beforeProxyFetch<T = RequestInfo | URL>(
    config: BeforeProxyFetchParams<T>
  ): Promise<BeforeProxyFetchParams<T>> {
    return config;
  }

  protected async afterProxyFetch<T = RequestInfo | URL>(config: AfterProxyFetchParams<T>): Promise<Response> {
    return config.response;
  }

  protected afterSuccess<T>(
    config: HttpFetcherRequest<RESPONSE, CONFIG, T>,
    pipe: PIPE
  ): void {}

  protected afterSuccessTransform<T>(
    config: HttpFetcherRequest<RESPONSE, CONFIG, T>,
    pipe: PIPE
  ): void {}

  protected before<T>(
    config: HttpFetcherRequest<RESPONSE, CONFIG, T>,
    pipe: PIPE
  ): void {}

  protected error<T>(
    config: HttpFetcherRequest<RESPONSE, CONFIG, T>,
    pipe: PIPE,
    e: any
  ): void {}

  protected finally<T>(
    config: HttpFetcherRequest<RESPONSE, CONFIG, T>,
    pipe: PIPE
  ): void {}

  protected beforeFetch(fetch: FetchSet): void {}

  protected afterFetch(fetch: FetchSet, response: Response): void {}

  // protected async errorTransform(e: any): Promise<HttpResponseError<any>> {
  protected async errorTransform(e: any): Promise<HttpResponseError> {
    const httpResponseError = new HttpResponseError<any>();
    httpResponseError.error = e;
    if (e instanceof Response) {
      httpResponseError.response = e;
      try {
        httpResponseError.body = await e.clone().text();
        httpResponseError.message = e.statusText;
      } catch (e: any) {
        httpResponseError.body = e;
        httpResponseError.message = e.message;
      }
    } else {
      httpResponseError.body = e;
      httpResponseError.message = e?.message;
    }
    return httpResponseError;
  }

  protected async execute<T = RESPONSE>(
    fetcherRequest: HttpFetcherRequest<RESPONSE, CONFIG, T>
  ): Promise<any | RESPONSE> {
    let target = fetcherRequest.target;
    let config = fetcherRequest.config;
    // target data setting
    if (!(target instanceof URL) && typeof target !== 'string') {
      // const url: URL |  string = target.url;
      // if (typeof target.url === 'string') {
      // }
      const searchParams = ConvertUtils.toURLSearchParams(target.searchParams ?? {});

      try {
        // target.url이 이미 URL 인스턴스여도 new URL()에 그대로 넘기면 항상 새 객체가 나온다
        // (문자열이든 URL이든 다 받음) - 그래서 삼항연산자로 분기할 필요가 없다. 이렇게 안 하고
        // 기존 인스턴스를 그대로 썼을 땐, 호출부가 재사용하는 URL 객체를 여기서 직접 mutate해버렸다.
        const url = new URL(target.url);
        searchParams.forEach((value, key) => {
          url.searchParams.append(key, value);
        });
        target = url;
      } catch (e) {
        if (typeof (target as any).url === 'string') {
          const searchParamString = searchParams.toString();
          target = (target as any).url + (searchParamString ? '?' + searchParamString : '');
        } else {
          target = '';
        }
      }
    }

    // before proxy fetch
    const beforeProxyData = { requestInfo: target, init: config?.fetch } as BeforeProxyFetchParams<URL>;
    let beforeData = config?.beforeProxyFetch
      ? await config?.beforeProxyFetch(beforeProxyData)
      : beforeProxyData;

    beforeData = config?.skipGlobalBeforeProxyFetch ? beforeData : await this.beforeProxyFetch(beforeData);
    target = beforeData.requestInfo;
    if (beforeData.init) {
      config ??= {};
      config.fetch = beforeData.init;
    }

    // timeout이 있으면 그 시간 뒤 자동으로 abort되는 signal을 만들고, 사용자가 signal도 같이
    // 줬으면 AbortSignal.any()로 둘을 합친다 - 둘 중 먼저 abort되는 쪽이 이긴다. 수동 setTimeout/
    // AbortController/리스너 관리가 전혀 필요 없다(네이티브가 다 해줌).
    let requestInit: RequestInit | undefined = config?.fetch;
    if (config?.fetch && 'timeout' in config.fetch) {
      const timeoutSignal = AbortSignal.timeout(config.fetch.timeout);
      const signal = config.fetch.signal ? AbortSignal.any([timeoutSignal, config.fetch.signal]) : timeoutSignal;
      requestInit = { ...config.fetch, signal };
    }

    this.beforeFetch({ target, requestInit });
    return (config.fetcher??fetch)(target, requestInit)
      .then(async it => {
        // console.log('httpFetch!!!', Array.from(it.headers))
        this.afterFetch({ target: target as URL, requestInit }, it);
        // after proxy fetch
        // @ts-ignore
        const afterProxyData: AfterProxyFetchParams<any> = {
          fetch: { target: target as URL, requestInit },
          config: beforeData,
          response: it
        };
        afterProxyData.response = config?.afterProxyFetch ? await config.afterProxyFetch(afterProxyData) : it;
        afterProxyData.response = config?.skipGlobalAfterProxyFetch ? afterProxyData.response : await this.afterProxyFetch(afterProxyData);
        it = afterProxyData.response;
        config?.fetchResponseAfterCallBack?.(it, config);
        if (!config?.allowedResponseNotOk && !it.ok) {
          throw it;
        }
        const data = config?.hasResponseErrorChecker?.(it, config);
        if (data) {
          throw data;
        }
        return it;
      });
  }
}
