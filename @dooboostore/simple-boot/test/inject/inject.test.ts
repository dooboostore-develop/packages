import 'reflect-metadata';
import { describe, test } from 'node:test';
import assert from 'node:assert';
import { SimpleApplication } from '@dooboostore/simple-boot';
import { getSim, Inject, Sim } from '@dooboostore/simple-boot';

class TTTProxy implements ProxyHandler<any> {
  constructor(private name: string) {}
  get = (target, property) => {
    return target[property];
  };
}

@Sim({ scheme: 'TestTestClassScheme' })
class TestTestClass {}

@Sim
class TestProxy implements ProxyHandler<any> {
  constructor(private name: TestTestClass) {}
  get = (target, property) => {
    return target[property];
  };
}

@Sim({
  scheme: 'zzzzzz'
})
class Test {
  constructor() {}
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
  ) {}
}

describe('Inject Tests', () => {
  test('should create TestInject with factory injection', async () => {
    const simpleApplication = new SimpleApplication();
    simpleApplication.run();

    const testInject = simpleApplication.sim(TestInject);
    assert.ok(testInject, 'TestInject should be created');
    assert.ok(testInject.name > 0, 'name should be a random number');
  });

  test('should create Test instance', async () => {
    const simpleApplication = new SimpleApplication();
    simpleApplication.run();

    const test = simpleApplication.sim(Test);
    assert.ok(test, 'Test should be created');
  });

  test('should create TestTestClass with scheme', async () => {
    const simpleApplication = new SimpleApplication();
    simpleApplication.run();

    const testTestClass = simpleApplication.sim(TestTestClass);
    assert.ok(testTestClass, 'TestTestClass should be created');
  });

  test('should create TestProxy with TestTestClass dependency', async () => {
    const simpleApplication = new SimpleApplication();
    simpleApplication.run();

    const testProxy = simpleApplication.sim(TestProxy);
    assert.ok(testProxy, 'TestProxy should be created');
  });
});

// esbuild/Vite/tsx 는 design:paramtypes 를 안 만든다 — 그래도 @Inject 붙은 파라미터는 채워져야 한다
const NO_META_SYMBOL = Symbol.for('NoMetaService');
@Sim({ symbol: NO_META_SYMBOL })
class NoMetaService {
  hello() { return 'hi'; }
}
class NoMetaCaller {
  run(@Inject({ symbol: NO_META_SYMBOL }) s: NoMetaService) { return s?.hello(); }
}
Reflect.deleteMetadata('design:paramtypes', NoMetaCaller.prototype, 'run');

describe('Inject without emitDecoratorMetadata', () => {
  test('resolves @Inject(symbol) parameters', () => {
    const app = new SimpleApplication();
    app.run();
    const r = app.simstanceManager.executeBindParameterSim({ target: new NoMetaCaller(), targetKey: 'run' });
    assert.strictEqual(r, 'hi');
  });
});
