import { sim } from '@dooboostore/simple-boot';

export namespace UserService {
  export const SYMBOL = Symbol.for('UserService');
}
export interface UserService {
  sayHello(): string;
}