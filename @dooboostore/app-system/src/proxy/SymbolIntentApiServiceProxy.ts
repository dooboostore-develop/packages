import { ApiService } from '../fetch/ApiService';
import { getSim, Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { makeIntentHeaderBySymbol } from '@dooboostore/simple-boot-http-server-ssr/codes/HttpHeaders';
import { ConvertUtils } from '@dooboostore/core/convert/ConvertUtils';


export type Config<T = any> = {  multipartFormData?: boolean,  bypassTransform?: boolean; transformText?: boolean, headers?: HeadersInit, body?: T };

@Sim
export class SymbolIntentApiServiceProxy<T extends object> implements ProxyHandler<T> {


  constructor(private apiService: ApiService) {
  }

  get(target: T, prop: string | symbol, receiver: any): any {
    const simConfig = getSim(target)
    const apiService = this.apiService;
    const value = Reflect.get(target, prop, receiver);
    if (typeof value === 'function' && simConfig?.symbol) {
      return function (...args: any[]) {
        const f = value as Function;
        const p = (userConfig: Config) => {

          const headers = {...(userConfig?.headers ?? {}), ...makeIntentHeaderBySymbol(simConfig.symbol as Symbol)};
          if (userConfig?.multipartFormData) {
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
          } else {
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
          }

        };
        args.push(p);
        return Reflect.apply(f, target, args);
        // return f.apply(target, args);
      }
    }
    return Reflect.get(target, prop, receiver);
  }

  apply(target: T, thisArg: any, argArray: any[]): any {
    console.log('SymbolIntentApiServiceProxy apply')
    // @ts-ignore
    return Reflect.apply(target, thisArg, argArray);
  }




}