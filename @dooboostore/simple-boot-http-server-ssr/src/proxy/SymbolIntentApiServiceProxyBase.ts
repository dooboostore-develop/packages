import { getSim, Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { makeIntentHeaderBySymbol } from '../codes/HttpHeaders';
import { ConvertUtils } from '@dooboostore/core/convert/ConvertUtils';
import { ApiService } from '@dooboostore/simple-boot/fetch/ApiService';


export type SymbolIntentApiServiceProxyBaseConfig<T = any> = { method?:'get' | 'post' | 'petch' | 'delete' | 'head', multipartFormData?: boolean,  bypassTransform?: boolean; transformText?: boolean, headers?: HeadersInit, body?: T };

export class SymbolIntentApiServiceProxyBase<T extends object = any> {
  // 생성자는 프록시될 대상 객체(target)와 의존성을 주입받습니다.
  constructor(
    apiService: ApiService,
  ) {
    // ProxyHandler 객체를 정의합니다.
    const handler: ProxyHandler<T> = {
      get(target: T, prop: string | symbol, receiver: any): any {
        const simConfig = getSim(target)
        const value = Reflect.get(target, prop, receiver);
        if (typeof value === 'function' && simConfig?.symbol) {
          return function (...args: any[]) {
            const f = value as Function;
            const p = (userConfig: SymbolIntentApiServiceProxyBaseConfig) => {
              const headers = {...(userConfig?.headers ?? {}), ...makeIntentHeaderBySymbol(simConfig.symbol as Symbol)};
              const method = userConfig?.method ?? 'post';
              if(method === 'post' && userConfig?.multipartFormData) {
                return apiService.post({
                  target: `/${String(prop)}`,
                  config: {
                    bypassTransform: userConfig?.bypassTransform,
                    transformText: userConfig?.transformText,
                    fetch: {
                      credentials: 'include',
                      headers: headers,
                      body: ConvertUtils.toFormData(userConfig?.body)
                    }
                  }
                });
              } else if (method === 'post') {
                return apiService.postJson({
                  target: `/${String(prop)}`,
                  config: {
                    bypassTransform: userConfig?.bypassTransform,
                    transformText: userConfig?.transformText,
                    fetch: {
                      credentials: 'include',
                      headers: headers,
                      body: userConfig?.body
                    }
                  }
                });
              }else if (method === 'petch') {
                return apiService.patchJson({
                  target: `/${String(prop)}`,
                  config: {
                    bypassTransform: userConfig?.bypassTransform,
                    transformText: userConfig?.transformText,
                    fetch: {
                      credentials: 'include',
                      headers: headers,
                      body: userConfig?.body
                    }
                  }
                });
              } else {
                return apiService[method]({
                  target: {url: `/${String(prop)}`, searchParams: userConfig?.body},
                  config: {
                    bypassTransform: userConfig?.bypassTransform,
                    transformText: userConfig?.transformText,
                    fetch: {
                      credentials: 'include',
                      headers: headers,
                    }
                  }
                });
              }
            };
            args.push(p);
            return Reflect.apply(f, target, args);
          }
        }
        return Reflect.get(target, prop, receiver);
      },

      apply(target: T, thisArg: any, argArray: any[]): any {
        console.log('SymbolIntentApiServiceProxyBase apply (from handler)');
        // @ts-ignore
        return Reflect.apply(target, thisArg, argArray);
      }
    };

    // 생성자에서 Proxy 객체를 반환합니다.

    // @ts-ignore
    return new Proxy(this, handler);
  }
}