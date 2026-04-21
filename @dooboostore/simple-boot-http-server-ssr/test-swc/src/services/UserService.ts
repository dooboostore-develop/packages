import {RequestResponse, SymbolIntentApiServiceConfig} from "@dooboostore/simple-boot-http-server";

export namespace UserService {
  export const SYMBOL = Symbol.for('UserService');
  export type GetUsersRequest = {
    keyword?: string,
    limit: number,
    nextCursor?: string,
  }
  export type User = {
    seq:number,
    name: string,
    email: string,
  }
  export type GetUsersResponse = {
    datas: User[],
    hasNext: boolean,
    nextCursor?: string,
  }
}
export interface UserService {
  sayHello(): string;
  getUsers(request: UserService.GetUsersRequest, data?: RequestResponse | ((config: SymbolIntentApiServiceConfig<UserService.GetUsersRequest>) => Promise<UserService.GetUsersResponse>)): Promise<UserService.GetUsersResponse>;
}