import {
  HttpFetcher,
  HttpFetcherConfig,
  HttpFetcherRequest,
  HttpFetcherTarget,
  HttpResponseError,
  RequestInitType
} from './HttpFetcher';
import { FetcherRequest } from './Fetcher';

export type HttpJsonFetcherConfig<CONFIG, RESPONSE> = HttpFetcherConfig<CONFIG> & {
  bypassTransform?: boolean;
  transformText?: boolean;
  // parsingExceptionDefault?: (e: any) => any;
  executeTransform?: (response: Response) => Promise<RESPONSE>;
};
export type RequestJsonInit = Omit<RequestInitType, 'body'> & { body?: any | null };
// type RequestJsonInit = Omit<RequestInitType, 'body'>;
export type HttpAnyBodyFetcherConfig<C, R> = Omit<HttpJsonFetcherConfig<C, R>, 'fetch'> & { fetch?: RequestJsonInit };

// export class HttpJsonResponseError<T = any> extends HttpResponseError {
// }
//
// export const isHttpJsonResponseError = (data: any): data is HttpJsonResponseError => {
//   return data instanceof HttpJsonResponseError;
// }
// export type HttpJsonFetcherRequest<RESPONSE = Response, CONFIG = any, T = RESPONSE> = HttpFetcherRequest<HttpFetcherTarget, RESPONSE, HttpJsonFetcherConfig<CONFIG, RESPONSE>>;
export type HttpJsonFetcherRequest<RESPONSE = any, CONFIG = any, T = RESPONSE> = FetcherRequest<
  HttpFetcherTarget,
  RESPONSE,
  HttpJsonFetcherConfig<CONFIG, RESPONSE>,
  T
>;

export class HttpJsonFetcher<CONFIG, PIPE extends { responseData?: any }> extends HttpFetcher<CONFIG, any, PIPE> {
  private updateJsonFetchConfigAndData<RESPONSE, T = RESPONSE>(
    config: HttpJsonFetcherRequest<RESPONSE, CONFIG, T>
  ) {
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/plain, */*'
    };
    config.config ??= {};
    config.config.fetch ??= {};
    config.config.fetch.headers ??= {};
    config.config!.fetch!.headers = {...headers, ...config.config!.fetch?.headers};
    if (config.config?.fetch?.body && typeof config.config?.fetch?.body !== 'string') {
      config.config.fetch.body = JSON.stringify(config.config.fetch.body);
    }
    return config;
  }

  get<RESPONSE, T = RESPONSE>(config: HttpJsonFetcherRequest<RESPONSE, CONFIG, T>): Promise<T> {
    return super.get(config);
  }

  delete<RESPONSE, T = RESPONSE>(config: HttpJsonFetcherRequest<RESPONSE, CONFIG, T>): Promise<T> {
    return super.delete(config);
  }

  post<RESPONSE, T = RESPONSE>(config: HttpJsonFetcherRequest<RESPONSE, CONFIG, T>): Promise<T> {
    return super.post(config);
  }

  patch<RESPONSE, T = RESPONSE>(config: HttpJsonFetcherRequest<RESPONSE, CONFIG, T>): Promise<T> {
    return super.patch(config);
  }

  put<RESPONSE, T = RESPONSE>(config: HttpJsonFetcherRequest<RESPONSE, CONFIG, T>): Promise<T> {
    return super.put(config);
  }

  head<RESPONSE, T = RESPONSE>(config: HttpJsonFetcherRequest<RESPONSE, CONFIG, T>): Promise<T> {
    return super.head(config);
  }

  postJson<RESPONSE, T = RESPONSE>(config: HttpJsonFetcherRequest<RESPONSE, CONFIG, T>): Promise<T> {
    return super.post(this.updateJsonFetchConfigAndData(config));
  }

  patchJson<RESPONSE, T = RESPONSE>(config: HttpJsonFetcherRequest<RESPONSE, CONFIG, T>): Promise<T> {
    return super.patch(this.updateJsonFetchConfigAndData(config));
  }

  putJson<RESPONSE, T = RESPONSE>(config: HttpJsonFetcherRequest<RESPONSE, CONFIG, T>): Promise<T> {
    return super.put(this.updateJsonFetchConfigAndData(config));
  }

  protected async errorTransform(e: any): Promise<HttpResponseError> {
    const httpResponseError = new HttpResponseError();
    httpResponseError.error = e;
    if (e instanceof Response) {
      httpResponseError.response = e;
      try {
        httpResponseError.body = await e.clone().json();
        httpResponseError.message = e.statusText;
      } catch (parseError: any) {
        httpResponseError.body = parseError; // Store the parsing error
        httpResponseError.message = parseError.message; // Use parsing error message
      }
    } else {
      httpResponseError.body = e;
      httpResponseError.message = e.message;
    }
    return httpResponseError;
  }

  // protected execute(target: HttpFetcherTarget, config?: HttpJsonFetcherConfig<C, any>): Promise<any> {
  protected execute(fetcherRequest: FetcherRequest<HttpFetcherTarget, any, HttpJsonFetcherConfig<CONFIG, any>>): Promise<any> {

    return super.execute(fetcherRequest).then((response: Response) => {
      // fetch에 있는 content-length는 서버에서 보낸값이 0 이여도 자체적으로 따로 판단해서 0이상이 나오는경우가 있다. 그리고 서버에서주는 header값도 믿긴 어렵다.
      // const contentLength = response.headers.get('Content-Length');
      // const hasBody = contentLength && parseInt(contentLength, 10) > 0;
      // console.log('hgasbody', hasBody)
      const config = fetcherRequest.config;
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
            if ((it ?? '').length > 0) {
              return JSON.parse(it);
            }
          })
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
