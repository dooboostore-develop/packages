import { sim } from '@dooboostore/simple-boot';
import { UserService } from '@swc-src/services/UserService';
import {RequestResponse, SymbolIntentApiServiceConfig} from "@dooboostore/simple-boot-http-server";
import User = UserService.User;

const users: User[] = [
  {seq: 1, name: 'test', email: 'test@test.net'},
  {seq: 2, name: 'test2', email: 'test2@test2.net'},
  {seq: 3, name: 'test3', email: 'test3@test3.net'},
  {seq: 4, name: 'test4', email: 'test4@test4.net'},
  {seq: 5, name: 'test5', email: 'test5@test5.net'},
  {seq: 6, name: 'test6', email: 'test6@test6.net'},
  {seq: 7, name: 'test7', email: 'test7@test7.net'},
  {seq: 8, name: 'test8', email: 'test8@test8.net'},
  {seq: 9, name: 'test9', email: 'test9@test9.net'},
  {seq: 10, name: 'test10', email: 'test10@test10.net'},
]

@sim(UserService.SYMBOL)
export class UserServiceBack implements UserService {
  sayHello(): string {
    console.log('TestServiceBack sayHello called');
    return 'back hello';
  }

  async getUsers(request: UserService.GetUsersRequest, data?: RequestResponse): Promise<UserService.GetUsersResponse> {
    console.log('TestServiceBack getUsers called with request:', request);
    const limit = request.limit;
    const nextCursor = request.nextCursor;
    const keyword = request.keyword;
    const startIndex = nextCursor ? parseInt(nextCursor) : 0;
    const endIndex = startIndex + limit;
    // if (keyword)
    // const result = users.filter(it => it.name.includes(keyword));
    const hasNext = endIndex < users.length;
    const nextCursorStr = hasNext ? (endIndex + '').toString() : undefined;
    const result = {
      datas: users.slice(startIndex, endIndex),
      nextCursor:nextCursorStr,
      hasNext: hasNext,
    };
    console.log('resultserve', result);
    return result
  }
}

console.log('user service index call');