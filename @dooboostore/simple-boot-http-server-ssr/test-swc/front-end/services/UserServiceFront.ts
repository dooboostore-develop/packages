import {sim} from '@dooboostore/simple-boot';
import {UserService} from '@swc-src/services/UserService';
import {RequestResponse, SymbolIntentApiServiceConfig} from "@dooboostore/simple-boot-http-server";
import factory from "@dooboostore/simple-boot-http-server/proxy/SymbolIntentApiServiceProxy";

export default (container: symbol) => {
  @sim({symbol: UserService.SYMBOL, container: container, proxy: factory({container: container})})
  class UserServiceFront implements UserService {
    sayHello(): string {
      console.log('TestServiceFront sayHello called');
      return 'front hello';
    }

    async getUsers(request: UserService.GetUsersRequest, data: ((config: SymbolIntentApiServiceConfig<UserService.GetUsersRequest>) => Promise<UserService.GetUsersResponse>)): Promise<UserService.GetUsersResponse> {
      return data!({ body: request });
    }
  }

  return UserServiceFront;
};
