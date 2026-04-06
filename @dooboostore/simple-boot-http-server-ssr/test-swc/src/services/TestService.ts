import { sim } from '@dooboostore/simple-boot';

export namespace TestService {
  export const SYMBOL = Symbol.for('TestService');
}
export interface TestService {
  sayHello(): string;
}
export default (container: symbol) => {
  @sim({symbol: TestService.SYMBOL, container: container})
  class TestServiceImp implements TestService {
    sayHello(): string {
      return 'hello';
    }
  }

  return TestServiceImp;
}