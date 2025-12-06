import {getSim, Sim} from '@dooboostore/simple-boot/decorators/SimDecorator';
import {makeIntentHeaderBySymbolFor} from '../codes/HttpHeaders';
import {ConvertUtils} from '@dooboostore/core/convert/ConvertUtils';
import {ApiService} from '@dooboostore/simple-boot/fetch/ApiService';


export type Config<T = any> = {
  method?: 'get' | 'post' | 'petch' | 'delete' | 'head',
  multipartFormData?: boolean,
  bypassTransform?: boolean;
  transformText?: boolean,
  headers?: HeadersInit,
  body?: T,
  config?: ApiService.ApiServiceConfig
};
const _ = ApiService;

@Sim
export class SymbolIntentApiServiceProxy<T extends object> implements ProxyHandler<T> {

  constructor(private apiService: ApiService) {
    // console.log('-------apiService', apiService);
  }

  static createHandler<T extends object>(apiService: ApiService): ProxyHandler<T> {
    return {
      get(target: T, prop: string | symbol, receiver: any): any {
        const simConfig = getSim(target)
        const value = Reflect.get(target, prop, receiver);
        if (typeof value === 'function' && simConfig?.symbol) {
          return function (...args: any[]) {
            const f = value as Function;
            const p = (userConfig: Config) => {
              const headers = {...(userConfig?.headers ?? {}), ...makeIntentHeaderBySymbolFor(simConfig.symbol as Symbol)};
              const method = userConfig?.method ?? 'post';
              if (method === 'post' && userConfig?.multipartFormData) {
                return apiService.post({
                  target: `/${String(prop)}`,
                  config: {
                    bypassTransform: userConfig?.bypassTransform,
                    transformText: userConfig?.transformText,
                    config: userConfig?.config,
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
                    config: userConfig?.config,
                    fetch: {
                      credentials: 'include',
                      headers: headers,
                      body: userConfig?.body
                    }
                  }
                });
              } else if (method === 'petch') {
                return apiService.patchJson({
                  target: `/${String(prop)}`,
                  config: {
                    bypassTransform: userConfig?.bypassTransform,
                    transformText: userConfig?.transformText,
                    config: userConfig?.config,
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
                    config: userConfig?.config,
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
        console.log('SymbolIntentApiServiceProxy apply')
        // @ts-ignore
        return Reflect.apply(target, thisArg, argArray);
      }
    };
  }

  get(target: T, prop: string | symbol, receiver: any): any {
    return SymbolIntentApiServiceProxy.createHandler<T>(this.apiService).get!(target, prop, receiver);
  }

  apply(target: T, thisArg: any, argArray: any[]): any {
    return SymbolIntentApiServiceProxy.createHandler<T>(this.apiService).apply!(target, thisArg, argArray);
  }
}