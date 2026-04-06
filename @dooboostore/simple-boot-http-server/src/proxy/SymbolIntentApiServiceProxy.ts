import {getSim, sim, Sim, SimConfig} from '@dooboostore/simple-boot';
import { makeIntentHeaderBySymbolFor } from '../codes/HttpHeaders';
import {ConstructorType, ConvertUtils} from '@dooboostore/core';
import { ApiService } from '@dooboostore/simple-boot';

export type SymbolIntentApiServiceConfig<T = any> = {
  method?: 'get' | 'post' | 'petch' | 'delete' | 'head';
  multipartFormData?: boolean;
  bypassTransform?: boolean;
  transformText?: boolean;
  headers?: HeadersInit;
  body?: T;
  config?: ApiService.ApiServiceConfig;
};
const _ = ApiService;


export  const  createHandler = <T extends object>(apiService: ApiService): ProxyHandler<T> => {
  return {
    get(target: T, prop: string | symbol, receiver: any): any {
      if (prop === '_SimpleBoot_origin') {
        return target;
      }
      const simConfig = getSim(target);
      const value = Reflect.get(target, prop, receiver);
      if (typeof value === 'function' && simConfig?.symbol) {
        return function (...args: any[]) {
          const f = value as Function;
          const p = (userConfig: SymbolIntentApiServiceConfig) => {
            const headers = {...(userConfig?.headers ?? {}), ...makeIntentHeaderBySymbolFor(simConfig.symbol as Symbol)};
            const method = userConfig?.method ?? 'post';
            if (method === 'post' && userConfig?.multipartFormData) {
              //@ts-ignore
              return apiService.post({
                target: `/${String(prop)}`,
                config: {
                  responseTransform: userConfig?.bypassTransform ? 'response' : undefined,
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
              //@ts-ignore
              return apiService.postJson({
                target: `/${String(prop)}`,
                config: {
                  responseTransform: userConfig?.bypassTransform ? 'response' : undefined,
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
              //@ts-ignore
              return apiService.patchJson({
                target: `/${String(prop)}`,
                config: {
                  responseTransform: userConfig?.bypassTransform ? 'response' : undefined,
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
              //@ts-ignore
              return apiService[method]({
                target: {url: `/${String(prop)}`, searchParams: userConfig?.body},
                config: {
                  responseTransform: userConfig?.bypassTransform ? 'response' : undefined,
                  transformText: userConfig?.transformText,
                  config: userConfig?.config,
                  fetch: {
                    credentials: 'include',
                    headers: headers
                  }
                }
              });
            }
          };
          args.push(p);
          return Reflect.apply(f, target, args);
        };
      }
      return Reflect.get(target, prop, receiver);
    },

    apply(target: T, thisArg: any, argArray: any[]): any {
      console.log('SymbolIntentApiServiceProxy apply');
      // @ts-ignore
      return Reflect.apply(target, thisArg, argArray);
    }
  };
}

export default (config?: SimConfig): ConstructorType<any> => {

  @sim(config)
  class SymbolIntentApiServiceProxy<T extends object> implements ProxyHandler<T> {
    constructor(private apiService: ApiService) {
      // console.log('-------apiService', apiService);
    }


    get(target: T, prop: string | symbol, receiver: any): any {
      return createHandler<T>(this.apiService).get!(target, prop, receiver);
    }

    apply(target: T, thisArg: any, argArray: any[]): any {
      return createHandler<T>(this.apiService).apply!(target, thisArg, argArray);
    }
  }
  return SymbolIntentApiServiceProxy;
}