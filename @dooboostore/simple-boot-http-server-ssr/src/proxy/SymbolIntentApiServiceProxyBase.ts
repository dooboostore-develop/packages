import {getSim, Sim} from '@dooboostore/simple-boot/decorators/SimDecorator';
import {makeIntentHeaderBySymbol} from '../codes/HttpHeaders';
import {ConvertUtils} from '@dooboostore/core/convert/ConvertUtils';
import {ApiService} from '@dooboostore/simple-boot/fetch/ApiService';
import {SymbolIntentApiServiceProxy} from './SymbolIntentApiServiceProxy';

export class SymbolIntentApiServiceProxyBase<T extends object = any> {
  // 생성자는 프록시될 대상 객체(target)와 의존성을 주입받습니다.
  constructor(
    apiService: ApiService,
  ) {
    // SymbolIntentApiServiceProxy의 static handler를 사용합니다.
    const handler = SymbolIntentApiServiceProxy.createHandler<T>(apiService);

    // 생성자에서 Proxy 객체를 반환합니다.
    // @ts-ignore
    return new Proxy(this, handler);
  }
}