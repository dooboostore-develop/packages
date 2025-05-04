import { HttpFetcher, HttpFetcherConfig, HttpFetcherTarget, RequestInitType } from './HttpFetcher';
import { FetcherRequest } from './Fetcher';
export type HttpJsonFetcherConfig<C, R> = HttpFetcherConfig<C> & {
  bypassTransform?: boolean;
  transformText?: boolean;
  // parsingExceptionDefault?: (e: any) => any;
  executeTransform?: (response: Response) => Promise<R>;
};
export type RequestJsonInit = Omit<RequestInitType, 'body'> & { body?: any | null };
// type RequestJsonInit = Omit<RequestInitType, 'body'>;
export type HttpAnyBodyFetcherConfig<C, R> = Omit<HttpJsonFetcherConfig<C, R>, 'fetch'> & { fetch?: RequestJsonInit };

export class HttpJsonResponseError<T = any> extends Error {
  public body?: T;
  public response?: Response;
}
export const isHttpJsonResponseError = (data: any): data is HttpJsonResponseError => {
  return data instanceof HttpJsonResponseError;
}

export abstract class HttpJsonFetcher<C, PIPE extends { responseData?: any }> extends HttpFetcher<C, any, PIPE> {
  private updateJsonFetchConfigAndData<R, T = R>(
    config: FetcherRequest<HttpFetcherTarget, R, HttpJsonFetcherConfig<C, R>, T>
  ) {
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/plain, */*'
    };
    config.config ??= {};
    config.config.fetch ??= {};
    config.config.fetch.headers ??= {};
    config.config!.fetch!.headers = { ...headers, ...config.config!.fetch?.headers };
    if (config.config?.fetch?.body && typeof config.config?.fetch?.body !== 'string') {
      config.config.fetch.body = JSON.stringify(config.config.fetch.body);
    }
    return config;
  }

  get<R, T = R>(config: FetcherRequest<HttpFetcherTarget, R, HttpJsonFetcherConfig<C, R>, T>): Promise<T> {
    this.errorTransform(config);
    return super.get(config);
  }

  delete<R, T = R>(config: FetcherRequest<HttpFetcherTarget, R, HttpJsonFetcherConfig<C, R>, T>): Promise<T> {
    this.errorTransform(config);
    return super.delete(config);
  }

  post<R, T = R>(config: FetcherRequest<HttpFetcherTarget, R, HttpJsonFetcherConfig<C, R>, T>): Promise<T> {
    this.errorTransform(config);
    return super.post(config);
  }

  patch<R, T = R>(config: FetcherRequest<HttpFetcherTarget, R, HttpJsonFetcherConfig<C, R>, T>): Promise<T> {
    this.errorTransform(config);
    return super.patch(config);
  }

  put<R, T = R>(config: FetcherRequest<HttpFetcherTarget, R, HttpJsonFetcherConfig<C, R>, T>): Promise<T> {
    this.errorTransform(config);
    return super.put(config);
  }

  head<R, T = R>(config: FetcherRequest<HttpFetcherTarget, R, HttpJsonFetcherConfig<C, R>, T>): Promise<T> {
    this.errorTransform(config);
    return super.head(config);
  }

  postJson<R, T = R>(config: FetcherRequest<HttpFetcherTarget, R, HttpAnyBodyFetcherConfig<C, R>, T>): Promise<T> {
    this.errorTransform(config);
    return super.post(this.updateJsonFetchConfigAndData(config));
  }

  patchJson<R, T = R>(config: FetcherRequest<HttpFetcherTarget, R, HttpAnyBodyFetcherConfig<C, R>, T>): Promise<T> {
    this.errorTransform(config);
    return super.patch(this.updateJsonFetchConfigAndData(config));
  }

  putJson<R, T = R>(config: FetcherRequest<HttpFetcherTarget, R, HttpAnyBodyFetcherConfig<C, R>, T>): Promise<T> {
    this.errorTransform(config);
    return super.put(this.updateJsonFetchConfigAndData(config));
  }

  errorTransform<R, T = R>(config: FetcherRequest<HttpFetcherTarget, R, HttpAnyBodyFetcherConfig<C, R>, T>) {
    const old = config.errorTransform;
    config.errorTransform = async e => {
      if (old) {
        return old(e);
      } else {
        const httpJsonResponseError = new HttpJsonResponseError();
        if (e instanceof Response) {
          httpJsonResponseError.response = e;
          try {
            httpJsonResponseError.body = await e.clone().json();
            httpJsonResponseError.message =
              httpJsonResponseError.body.message ?? httpJsonResponseError.body?.toString() ?? e.statusText;
          } catch (e) {}
        } else {
          httpJsonResponseError.body = e;
          httpJsonResponseError.message = e.message;
        }
        return httpJsonResponseError;
      }
    };
  }

  protected execute(target: HttpFetcherTarget, config?: HttpJsonFetcherConfig<C, any>): Promise<any> {
    return super.execute(target, config).then((response: Response) => {
      // fetch에 있는 content-length는 서버에서 보낸값이 0 이여도 자체적으로 따로 판단해서 0이상이 나오는경우가 있다. 그리고 서버에서주는 header값도 믿긴 어렵다.
      // const contentLength = response.headers.get('Content-Length');
      // const hasBody = contentLength && parseInt(contentLength, 10) > 0;
      // console.log('hgasbody', hasBody)
      if (config?.bypassTransform) {
        return response;
      }
      if (config?.executeTransform) {
        return config.executeTransform(response);
      } else {
        if (config?.transformText) {
          return response?.text();
        } else {
          return response?.text().then(it => {
            if ((it??'').length>0) {
              return JSON.parse(it);
            }
          })
          // return response?.json?.();
        }
      }
    });
    // .catch(e => {
    //   if (config?.parsingExceptionDefault) {
    //     return config.parsingExceptionDefault(e);
    //   } else {
    //     throw e;
    //   }
    // });
  }
}
