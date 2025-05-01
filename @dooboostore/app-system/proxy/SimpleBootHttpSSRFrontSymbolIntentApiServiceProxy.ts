import { ApiService } from '../fetch/ApiService';
import { makeIntentHeaderBySymbol } from '@dooboostore/simple-boot-http-server-ssr/codes/HttpHeaders';


export class SimpleBootHttpSSRFrontSymbolIntentApiServiceProxy {


  constructor(config: { apiService: ApiService, symbol: Symbol, host: string, config?: ApiService.ApiServiceConfig }) {

    // const simConfig = getSim(this);
    // 프록시 핸들러
    const handler: ProxyHandler<SimpleBootHttpSSRFrontSymbolIntentApiServiceProxy> = {
      get(target: SimpleBootHttpSSRFrontSymbolIntentApiServiceProxy, prop: string | symbol, receiver: any) {
        const value = target[prop as keyof SimpleBootHttpSSRFrontSymbolIntentApiServiceProxy];
        if (typeof value === 'function') {
          return function(...args: any[]) {
            // console.log(`메서드 ${String(prop)} 호출 감지`);
            const f = value as Function;
            if (f.length >= 2) {
              const p = (param: any) => config.apiService.postJson({
                target: new URL(`/${String(prop)}`, config.host),
                config: { config: config.config, fetch: { headers: makeIntentHeaderBySymbol(config.symbol), body: param ?? args[0] } }
              });
              args.push(p);
            }
            return f.apply(target, args);
          };
        }
        return value;
      }
    };
    // 프록시 반환
    return new Proxy(this, handler);
  }

}