import { InitOptionType, SimOption } from '@dooboostore/simple-boot/SimOption';
import { ConstructorType } from '@dooboostore/core/types';

export enum UrlType {
  path = 'path',
  hash = 'hash'
}

export class SimFrontOption extends SimOption {
  selector: string = '#app';
  urlType: UrlType = UrlType.path;

  constructor(public window: Window, initSimOption?: InitOptionType) {
    super(initSimOption);
  }

  setSelector(selector: string): SimFrontOption {
    this.selector = selector;
    return this;
  }

  setUrlType(urlType: UrlType): SimFrontOption {
    this.urlType = urlType;
    return this;
  }

  setRootRouter(rootRouter: ConstructorType<any>): SimFrontOption {
    this.rootRouter = rootRouter;
    return this;
  }
}
