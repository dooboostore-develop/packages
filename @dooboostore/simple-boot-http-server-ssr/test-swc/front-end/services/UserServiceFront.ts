import { sim } from '@dooboostore/simple-boot';
import { UserService } from '@swc-src/services/UserService';

export default (container: symbol) => {
  @sim({ symbol: UserService.SYMBOL, container: container })
  class UserServiceFront implements UserService {
    sayHello(): string {
      console.log('TestServiceFront sayHello called');
      return 'front hello';
    }
  }
  return UserServiceFront;
};
