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
  responseTransform?: 'text' | 'response' | ((response: Response) => Promise<RESPONSE>);
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
export type HttpJsonFetcherBodyAnyRequest<RESPONSE = any, CONFIG = any, T = RESPONSE> = FetcherRequest<
  HttpFetcherTarget,
  RESPONSE,
  HttpAnyBodyFetcherConfig<CONFIG, RESPONSE>,
  T
>;

export class HttpJsonFetcher<CONFIG, PIPE extends { responseData?: any }> extends HttpFetcher<CONFIG, any, PIPE> {
  // config.config/config.config.fetch를 직접 mutate하면(예전처럼) 같은 config 객체를 여러
  // postJson/patchJson/putJson 호출이 동시에 공유할 때 서로의 headers/body를 덮어쓰는 레이스가
  // 생긴다(HttpFetcher.get/post의 method 레이스랑 같은 문제). caller의 객체는 안 건드리고,
  // 얕은 복사본을 만들어서 새 config 객체를 리턴한다.
  private updateJsonFetchConfigAndData<RESPONSE, T = RESPONSE>(
    config: HttpJsonFetcherRequest<RESPONSE, CONFIG, T>
  ): HttpJsonFetcherRequest<RESPONSE, CONFIG, T> {
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/plain, */*'
    };
    const fetchInit: any = { ...config.config?.fetch };

    // 객체 스프레드({...x})는 Headers 인스턴스에서 아무것도 못 뽑아낸다(데이터가 내부 슬롯에 있어서
    // 열거 가능한 자기 프로퍼티가 아님) - Headers 인스턴스나 [string,string][] 튜플을 넘기면
    // 통째로 사라졌었다. Headers 생성자는 세 형태(plain object/Headers/tuple 배열) 다 받으므로
    // 그걸로 병합한다 - 사용자가 준 헤더가 JSON 기본값을 덮어쓰는 순서(defaults -> user)는 그대로 유지.
    const merged = new Headers(headers);
    if (fetchInit.headers) {
      new Headers(fetchInit.headers).forEach((value, key) => merged.set(key, value));
    }
    fetchInit.headers = merged;

    if (fetchInit.body && typeof fetchInit.body !== 'string') {
      fetchInit.body = JSON.stringify(fetchInit.body);
    }

    return { ...config, config: { ...config.config, fetch: fetchInit } };
  }

  get(config: HttpJsonFetcherRequest<any, CONFIG, Response> & { config: { responseTransform: 'response' } }): Promise<Response>;
  get(config: HttpJsonFetcherRequest<any, CONFIG, string> & { config: { responseTransform: 'text' } }): Promise<string>;
  get<RESPONSE, T = RESPONSE>(config: HttpJsonFetcherRequest<RESPONSE, CONFIG, T>): Promise<T>;
  get<RESPONSE, T = RESPONSE>(config: HttpJsonFetcherRequest<RESPONSE, CONFIG, T>): Promise<T> {
    return super.get(config);
  }

  delete(config: HttpJsonFetcherRequest<any, CONFIG, Response> & { config: { responseTransform: 'response' } }): Promise<Response>;
  delete(config: HttpJsonFetcherRequest<any, CONFIG, string> & { config: { responseTransform: 'text' } }): Promise<string>;
  delete<RESPONSE, T = RESPONSE>(config: HttpJsonFetcherRequest<RESPONSE, CONFIG, T>): Promise<T>;
  delete<RESPONSE, T = RESPONSE>(config: HttpJsonFetcherRequest<RESPONSE, CONFIG, T>): Promise<T> {
    return super.delete(config);
  }

  post(config: HttpJsonFetcherRequest<any, CONFIG, Response> & { config: { responseTransform: 'response' } }): Promise<Response>;
  post(config: HttpJsonFetcherRequest<any, CONFIG, string> & { config: { responseTransform: 'text' } }): Promise<string>;
  post<RESPONSE, T = RESPONSE>(config: HttpJsonFetcherRequest<RESPONSE, CONFIG, T>): Promise<T>;
  post<RESPONSE, T = RESPONSE>(config: HttpJsonFetcherRequest<RESPONSE, CONFIG, T>): Promise<T> {
    return super.post(config);
  }

  patch(config: HttpJsonFetcherRequest<any, CONFIG, Response> & { config: { responseTransform: 'response' } }): Promise<Response>;
  patch(config: HttpJsonFetcherRequest<any, CONFIG, string> & { config: { responseTransform: 'text' } }): Promise<string>;
  patch<RESPONSE, T = RESPONSE>(config: HttpJsonFetcherRequest<RESPONSE, CONFIG, T>): Promise<T>;
  patch<RESPONSE, T = RESPONSE>(config: HttpJsonFetcherRequest<RESPONSE, CONFIG, T>): Promise<T> {
    return super.patch(config);
  }

  put(config: HttpJsonFetcherRequest<any, CONFIG, Response> & { config: { responseTransform: 'response' } }): Promise<Response>;
  put(config: HttpJsonFetcherRequest<any, CONFIG, string> & { config: { responseTransform: 'text' } }): Promise<string>;
  put<RESPONSE, T = RESPONSE>(config: HttpJsonFetcherRequest<RESPONSE, CONFIG, T>): Promise<T>;
  put<RESPONSE, T = RESPONSE>(config: HttpJsonFetcherRequest<RESPONSE, CONFIG, T>): Promise<T> {
    return super.put(config);
  }

  head(config: HttpJsonFetcherRequest<any, CONFIG, Response> & { config: { responseTransform: 'response' } }): Promise<Response>;
  head(config: HttpJsonFetcherRequest<any, CONFIG, string> & { config: { responseTransform: 'text' } }): Promise<string>;
  head<RESPONSE, T = RESPONSE>(config: HttpJsonFetcherRequest<RESPONSE, CONFIG, T>): Promise<T>;
  head<RESPONSE, T = RESPONSE>(config: HttpJsonFetcherRequest<RESPONSE, CONFIG, T>): Promise<T> {
    return super.head(config);
  }

  postJson(config: HttpJsonFetcherBodyAnyRequest<any, CONFIG, Response> & { config: { responseTransform: 'response' } }): Promise<Response>;
  postJson(config: HttpJsonFetcherBodyAnyRequest<any, CONFIG, string> & { config: { responseTransform: 'text' } }): Promise<string>;
  postJson<RESPONSE, T = RESPONSE>(config: HttpJsonFetcherBodyAnyRequest<RESPONSE, CONFIG, T>): Promise<T>;
  postJson<RESPONSE, T = RESPONSE>(config: HttpJsonFetcherBodyAnyRequest<RESPONSE, CONFIG, T>): Promise<T> {
    return super.post(this.updateJsonFetchConfigAndData(config));
  }

  patchJson(config: HttpJsonFetcherBodyAnyRequest<any, CONFIG, Response> & { config: { responseTransform: 'response' } }): Promise<Response>;
  patchJson(config: HttpJsonFetcherBodyAnyRequest<any, CONFIG, string> & { config: { responseTransform: 'text' } }): Promise<string>;
  patchJson<RESPONSE, T = RESPONSE>(config: HttpJsonFetcherBodyAnyRequest<RESPONSE, CONFIG, T>): Promise<T>;
  patchJson<RESPONSE, T = RESPONSE>(config: HttpJsonFetcherBodyAnyRequest<RESPONSE, CONFIG, T>): Promise<T> {
    return super.patch(this.updateJsonFetchConfigAndData(config));
  }

  putJson(config: HttpJsonFetcherBodyAnyRequest<any, CONFIG, Response> & { config: { responseTransform: 'response' } }): Promise<Response>;
  putJson(config: HttpJsonFetcherBodyAnyRequest<any, CONFIG, string> & { config: { responseTransform: 'text' } }): Promise<string>;
  putJson<RESPONSE, T = RESPONSE>(config: HttpJsonFetcherBodyAnyRequest<RESPONSE, CONFIG, T>): Promise<T>;
  putJson<RESPONSE, T = RESPONSE>(config: HttpJsonFetcherBodyAnyRequest<RESPONSE, CONFIG, T>): Promise<T> {
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
      const config = fetcherRequest.config as any;
      const transform = config?.responseTransform ?? (config?.bypassTransform ? 'response' : (config?.transformText ? 'text' : undefined));

      if (transform === 'response') {
        return response;
      } else if (transform === 'text') {
        return response?.text();
      } else if (typeof transform === 'function') {
        return transform(response);
      } else {
        return response?.text().then(it => {
          if ((it ?? '').length > 0) {
            return JSON.parse(it);
          }
        })
      }
    });
  }
}
