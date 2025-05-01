import { getSim, Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';

@Sim
export class IntentSchemeServerProxy implements ProxyHandler<any> {
  public get(target: any, prop: string): any {
    const t = target[prop];
    if (typeof t === 'function') {
      return (...args: any[]) => {

        const simstanceManager = target._SimpleBoot_simstanceManager;
        const simOption = target._SimpleBoot_simOption;
        const config = getSim(target);
        const data = t.apply(target, args);
        if (simstanceManager && simOption && config?.scheme && simOption.window) {
          if (!simOption.window.server_side_data) {
            simOption.window.server_side_data = {};
          }
          const key = config.scheme + '_' + prop;
          if (data instanceof Promise) {
            data.then((it) => {
              simOption.window.server_side_data[key] = JSON.stringify(it);
              return it;
            });
          } else {
            simOption.window.server_side_data[key] = JSON.stringify(data);
          }
        }
        return data;
      }
    } else {
      return t;
    }
  }

}
