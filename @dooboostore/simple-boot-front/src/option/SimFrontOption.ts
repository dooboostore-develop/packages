import { InitOptionType, SimOption } from '@dooboostore/simple-boot/SimOption';
import { ConstructorType } from '@dooboostore/core/types';

export enum UrlType {
  path = 'path',
  hash = 'hash'
}
export type SimFrontOptionConfig = {
  window: Window,
  selector?: string | HTMLElement,
  urlType?: UrlType
  using?: ConstructorType<any>[]
}

export class SimFrontOption extends SimOption {

  constructor(public config: SimFrontOptionConfig, initSimOption?: InitOptionType) {
    super(initSimOption);
  }

  get window() {
    return this.config.window;
  }

  get selector() {
    return this.config.selector ?? '#app'
  }

  get urlType() {
    return this.config.urlType ?? UrlType.path;
  }

  // setSelector(selector: string): SimFrontOption {
  //   this.selector = selector;
  //   return this;
  // }
  //
  // setUrlType(urlType: UrlType): SimFrontOption {
  //   this.urlType = urlType;
  //   return this;
  // }
  //
  // setRootRouter(rootRouter: ConstructorType<any>): SimFrontOption {
  //   this.rootRouter = rootRouter;
  //   return this;
  // }
}
