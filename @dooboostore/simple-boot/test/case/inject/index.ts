import { Runnable } from '@dooboostore/core/runs/Runnable';
import { SimpleApplication } from '../../../src/SimpleApplication';
import { getSim, Inject, Sim } from '../../../src/decorators';

class TTTProxy implements ProxyHandler<any> {
  constructor(private name: string) {
    console.log('TTTProxy', name);
  }
  get = (target, property) => {
    console.log('get', target, property);
    return target[property];
  };
}
@Sim({ scheme: 'TestTestClassScheme' })
class TestTestClass {}
@Sim
class TestProxy implements ProxyHandler<any> {
  constructor(private name: TestTestClass) {
    console.log('TestProxy', name);
  }
  get = (target, property) => {
    console.log('get', target, property);
    return target[property];
  };
}

@Sim({
  scheme: 'zzzzzz'
  // proxy: TestProxy
})
class Test {
  constructor() {
    console.log('tt');
  }
}

@Sim
class TestInject {
  name = Math.random();
  constructor(
    @Inject({
      type: Test,
      factory: caller => {
        return 'zzzzzzz';
      }
    })
    tt: TestTestClass
  ) {
    console.log('vvvvvvvvvvv', tt);
  }
  // constructor(@Inject({type: TestTestClass, proxy:TestProxy}) tt: TestTestClass) {
  //   const tc = getSim(tt)
  //   console.log('vvvvvvvvvvv', tt, tc);
  // }
}

export default () => {
  console.log('InjectTest');
  const simpleApplication = new SimpleApplication();
  simpleApplication.run();
  // const test = new Test();
  // const test = simpleApplication.sim(Test);
  //
  // const ttt = new Proxy(test, new TTTProxy('test'));
  //
  // const c = getSim(test);
  // const ctt = getSim(ttt);
  // console.log('cccc', c,ctt);

  const testInject = simpleApplication.sim(TestInject);
  console.log('testInject', testInject);
};
