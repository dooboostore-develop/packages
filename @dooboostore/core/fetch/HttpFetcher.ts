import { Fetcher, FetcherRequest } from './Fetcher';
import { ConvertUtils } from '../convert/ConvertUtils';

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
  config: BeforeProxyFetchParams<T>;
  response: Response;
};

export abstract class HttpFetcher<
  CONFIG,
  RESPONSE = Response,
  PIPE extends { responseData?: RESPONSE | undefined } = any
> extends Fetcher<HttpFetcherTarget, RESPONSE, HttpFetcherConfig<CONFIG, RESPONSE>, PIPE> {
  get<T = RESPONSE>(
    config: FetcherRequest<HttpFetcherTarget, RESPONSE, HttpFetcherConfig<CONFIG, RESPONSE>, T>
  ): Promise<T> {
    config.config ??= {};
    config.config.fetch = config.config?.fetch ?? {};
    config.config.fetch.method = 'GET';
    return this.fetch(config);
  }

  post<T = RESPONSE>(
    config: FetcherRequest<HttpFetcherTarget, RESPONSE, HttpFetcherConfig<CONFIG, RESPONSE>, T>
  ): Promise<T> {
    config.config ??= {};
    config.config.fetch = config.config?.fetch ?? {};
    config.config.fetch.method = 'POST';
    return this.fetch(config);
  }

  patch<T = RESPONSE>(
    config: FetcherRequest<HttpFetcherTarget, RESPONSE, HttpFetcherConfig<CONFIG, RESPONSE>, T>
  ): Promise<T> {
    config.config ??= {};
    config.config.fetch = config.config?.fetch ?? {};
    config.config.fetch.method = 'PATCH';
    return this.fetch(config);
  }

  put<T = RESPONSE>(
    config: FetcherRequest<HttpFetcherTarget, RESPONSE, HttpFetcherConfig<CONFIG, RESPONSE>, T>
  ): Promise<T> {
    config.config ??= {};
    config.config.fetch = config.config?.fetch ?? {};
    config.config.fetch.method = 'PUT';
    return this.fetch(config);
  }

  head<T = RESPONSE>(
    config: FetcherRequest<HttpFetcherTarget, RESPONSE, HttpFetcherConfig<CONFIG, RESPONSE>, T>
  ): Promise<T> {
    config.config ??= {};
    config.config.fetch = config.config?.fetch ?? {};
    config.config.fetch.method = 'HEAD';
    return this.fetch(config);
  }

  delete<T = RESPONSE>(
    config: FetcherRequest<HttpFetcherTarget, RESPONSE, HttpFetcherConfig<CONFIG, RESPONSE>, T>
  ): Promise<T> {
    config.config ??= {};
    config.config.fetch = config.config?.fetch ?? {};
    config.config.fetch.method = 'DELETE';
    return this.fetch(config);
  }

  protected async beforeProxyFetch<T = RequestInfo | URL>(
    config: BeforeProxyFetchParams<T>
  ): Promise<BeforeProxyFetchParams<T>> {
    return config;
  }

  protected async afterProxyFetch<T = RequestInfo | URL>(config: AfterProxyFetchParams<T>): Promise<Response> {
    return config.response;
  }

  protected async execute(
    target: HttpFetcherTarget,
    config?: HttpFetcherConfig<CONFIG, RESPONSE>
  ): Promise<any | RESPONSE> {
    // target data setting
    if (!(target instanceof URL) && typeof target !== 'string') {
      // const url: URL |  string = target.url;
      // if (typeof target.url === 'string') {
      // }
      const searchParams = new URLSearchParams();
      // const url = typeof target.url === 'string' ? new URL(target.url) : target.url;
      if (typeof target.searchParams === 'string') {
        new URLSearchParams(target.searchParams).forEach((value, key) => {
          searchParams.append(key, value);
        });
      } else if (typeof target.searchParams === 'object') {
        const forTarget = target.searchParams instanceof URLSearchParams ? target.searchParams.entries() : (Array.isArray(target.searchParams) ? target.searchParams : Object.entries(target.searchParams));
        for (const [k, v] of Array.from(forTarget)) {
          if (Array.isArray(v)) {
            v.forEach(it => searchParams.append(k, it));
          } else {
            searchParams.append(k, v as any);
          }
        }
      }

      try {
        const url = typeof target.url === 'string' ? new URL(target.url) : target.url;
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
      ? await config?.beforeProxyFetch(config as any)
      : beforeProxyData.requestInfo;
    beforeData = config?.skipGlobalBeforeProxyFetch ? beforeProxyData : await this.beforeProxyFetch(beforeProxyData);
    target = beforeData.requestInfo as URL;
    if (beforeData.init) {
      config ??= {};
      config.fetch = beforeData.init;
    }

    let abortedTimeout: NodeJS.Timeout | undefined;
    if (config?.fetch && 'timeout' in config.fetch) {
      const abortController = new AbortController();
      abortedTimeout = setTimeout(() => {
        if (config.fetch?.signal) {
          const inputSignal = config.fetch.signal;
          const listener = () => {
            if (!abortController.signal.aborted) {
              abortController.abort();
            }
            inputSignal.removeEventListener('abort', listener);
          };
          inputSignal.addEventListener('abort', listener);
        }
        if (!abortController.signal.aborted) {
          abortController.abort();
        }
      }, config.fetch.timeout);
      config.fetch.signal = abortController.signal;
    }

    return fetch(target, config?.fetch)
      .then(async it => {
        // after proxy fetch
        const afterProxyData = { config: beforeData, response: it };
        it = config?.afterProxyFetch ? await config.afterProxyFetch(afterProxyData) : it;
        it = config?.skipGlobalAfterProxyFetch ? it : await this.afterProxyFetch(afterProxyData);
        config?.fetchResponseAfterCallBack?.(it, config);
        if (!config?.allowedResponseNotOk && !it.ok) {
          throw it;
        }
        const data = config?.hasResponseErrorChecker?.(it, config);
        if (data) {
          throw data;
        }
        return it;
      })
      .finally(() => {
        if (abortedTimeout) {
          clearTimeout(abortedTimeout);
        }
      });
  }
}
