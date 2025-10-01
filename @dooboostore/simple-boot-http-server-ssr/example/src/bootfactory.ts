import { SimFrontOption, UrlType } from '@dooboostore/simple-boot-front/option/SimFrontOption';
import { SimpleBootHttpSSRFactory } from '@dooboostore/simple-boot-http-server-ssr/SimpleBootHttpSSRFactory';
import { ConstructorType, isDefined } from '@dooboostore/core/types';
import { SimpleBootFront } from '@dooboostore/simple-boot-front/SimpleBootFront';
import { IndexRouterComponent } from '@src/pages/index.router.component';
import { Observable, Subject, Subscription } from 'rxjs';
import { AlertService } from '@dooboostore/simple-boot/alert/AlertService';
import { ApiService } from '@dooboostore/simple-boot/fetch/ApiService';
export const MakeSimFrontOption = (window: any): SimFrontOption => {
  return new SimFrontOption({window, urlType:UrlType.path, using:[ApiService]}, {rootRouter: IndexRouterComponent});
}

class Factory extends SimpleBootHttpSSRFactory {
  async factory(simFrontOption: SimFrontOption, using: (ConstructorType<any> | Function)[], domExcludes: ConstructorType<any>[]) {
    // console.log('create simplefront--->', (simFrontOption.window as any).uuid, simFrontOption.window.location.href);
    // const simFrontOption = new SimFrontOption(window).setUrlType(UrlType.path);
    simFrontOption.using??=[];
    if (Array.isArray(simFrontOption.using)) {
      simFrontOption.using.push(...using);
    } else {
      simFrontOption.using = [simFrontOption.using, using].filter(isDefined);
    }

    const simpleBootFront = new SimpleBootFront(simFrontOption);
    // const simpleBootFront = new SimpleBootFront(TestRouterComponent, simFrontOption);
    // @ts-ignore
    simpleBootFront.domRendoerExcludeProxy.push(Subject, Observable, Subscription, AlertService, ApiService, ...domExcludes);
    return simpleBootFront;
  }
}

export default new Factory();
