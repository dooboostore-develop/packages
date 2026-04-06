import { sim } from '@dooboostore/simple-boot';
import { UserService } from '@swc-src/services/UserService';

@sim(UserService.SYMBOL)
export class UserServiceBack implements UserService {
  sayHello(): string {
    console.log('TestServiceBack sayHello called');
    return 'back hello';
  }
}

console.log('user service index call');