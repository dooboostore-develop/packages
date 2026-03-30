import { Sim, getSim } from '@dooboostore/simple-boot';
import { SimpleBootFront } from '@dooboostore/simple-boot-front';
import { ValidUtils } from '@dooboostore/core-web';
import { Inject } from '@dooboostore/simple-boot';

@Sim
export class SSRDomParserFilterDataHydrationProxy implements ProxyHandler<any> {
  constructor(@Inject({ type: SimpleBootFront }) private simpleBootFront: SimpleBootFront) {}

  get(target: any, prop: string | symbol, receiver: any): any {
    const value = Reflect.get(target, prop, receiver);
    let current: any = target;
    let simConfig = getSim(current);
    // console.log('SSRDomParserFilterDataHydrationProxy*****', simConfig);
    // while (!simConfig && current && typeof current === 'object') {
    //   const origin = current._SimpleBoot_origin ?? current._domRender_origin ?? current._DomRender_origin ?? current.__target__;
    //   if (origin && origin !== current) {
    //     current = origin;
    //     simConfig = getSim(current);
    //   } else {
    //     break;
    //   }
    // }

    if (typeof value === 'function' && simConfig?.symbol) {
      const methodName = String(prop);
      const symbolStr = simConfig.symbol.toString();

      return (...args: any[]) => {
        const pureArgs = args.filter(it => typeof it !== 'function');
        const key = `${symbolStr}.${methodName}(${JSON.stringify(pureArgs)})`;

        if (ValidUtils.isBrowser()) {
          const hydratedData = this.simpleBootFront.cutDataHydration(key);
          if (hydratedData !== undefined) {
            return Promise.resolve(hydratedData);
          }
        }

        const result = Reflect.apply(value, target, args);

        if (!ValidUtils.isBrowser()) {
          const saveData = (data: any) => {
            this.simpleBootFront.saveDataHydration(key, data);
          };

          if (result instanceof Promise) {
            return result.then(data => {
              saveData(data);
              return data;
            });
          } else {
            saveData(result);
            return result;
          }
        }

        return result;
      };
    }
    return value;
  }
}
