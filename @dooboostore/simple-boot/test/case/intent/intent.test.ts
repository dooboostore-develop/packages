import { test, describe } from 'node:test';
import assert from 'node:assert';
import 'reflect-metadata';
import { SimpleApplication } from '@dooboostore/simple-boot/SimpleApplication';
import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { Inject } from '@dooboostore/simple-boot/decorators/inject/Inject';
import { Intent } from '@dooboostore/simple-boot/intent/Intent';
import { IntentSubscribe } from '@dooboostore/simple-boot/intent/IntentSubscribe';
import { PostConstruct } from '@dooboostore/simple-boot/decorators/SimDecorator';

const TestIntentServiceSymbol = Symbol.for('TestIntentService');
const DependencyServiceSymbol = Symbol.for('DependencyService');
const SubscribeServiceSymbol = Symbol.for('SubscribeService');
const PostConstructServiceSymbol = Symbol.for('PostConstructService');
const AugmentServiceSymbol = Symbol.for('AugmentService');

@Sim({ symbol: DependencyServiceSymbol })
class DependencyService {
  say() {
    return 'hello-dependency';
  }
}

@Sim({ symbol: AugmentServiceSymbol })
class AugmentService {
  public augmentedValue = '';

  public testMethod(
    @Inject({
      symbol: DependencyServiceSymbol,
      factory: caller => {
        // Test: caller.injectInstance should contain the DependencyService instance
        return caller.injectInstance.say() + '-augmented';
      }
    })
    data: string
  ) {
    this.augmentedValue = data;
  }
}

@Sim({ symbol: PostConstructServiceSymbol })
class PostConstructService {
  public postConstructCalled = false;
  public postConstructDependencyValue = '';
  public factoryInstanceAtPost: any = null;

  @PostConstruct
  public init(
    @Inject({ symbol: DependencyServiceSymbol }) dep: DependencyService,
    @Inject({
      factory: caller => {
        return { instance: caller.instance };
      }
    })
    factoryData: any
  ) {
    this.postConstructCalled = true;
    this.postConstructDependencyValue = dep.say();
    this.factoryInstanceAtPost = factoryData.instance;
  }
}

@Sim({ symbol: SubscribeServiceSymbol })
class SubscribeService implements IntentSubscribe {
  public subscribedData: any[] = [];
  intentSubscribe(...args: any[]): void {
    this.subscribedData = args;
  }
}

@Sim({ symbol: TestIntentServiceSymbol })
class TestIntentService {
  public called = false;
  public receivedData: any = null;
  public receivedDependency: any = null;
  public factoryInstance: any = null;

  // Intent 호출 대상 메서드
  public testMethod(
    data: any,
    @Inject({ symbol: DependencyServiceSymbol }) dep: DependencyService,
    @Inject({
      factory: caller => {
        return { instance: caller.instance, methodName: caller.methodName };
      }
    })
    factoryData: any
  ) {
    this.called = true;
    this.receivedData = data;
    this.receivedDependency = dep?.say();
    this.factoryInstance = factoryData?.instance;
    return 'method-result';
  }

  // 다중 파라미터 테스트용 메서드
  public multiParamMethod(param1: string, param2: number, @Inject({ symbol: DependencyServiceSymbol }) dep: DependencyService, param3: any) {
    return {
      param1,
      param2,
      depSay: dep.say(),
      param3
    };
  }

  // @Inject 없는 다중 파라미터 테스트용
  public noInjectMultiParam(param1: string, param2: number, param3: any) {
    return {
      param1,
      param2,
      param3
    };
  }
}

describe('IntentManager Unified (Array) Test', () => {
  test('Basic Intent Publishing with Single Parameter (wrapped in array)', async () => {
    const app = new SimpleApplication().run();
    const service = app.sim<TestIntentService>(TestIntentServiceSymbol)!;

    const intentData = { name: 'dooboo' };

    // Unified: data is treated as array of arguments
    const intent = new Intent('Symbol.for(TestIntentService)://testMethod', [intentData]);

    const result = await app.publishIntent(intent);

    assert.strictEqual(service.called, true, '메서드가 호출되어야 함');
    assert.deepStrictEqual(service.receivedData, intentData, 'Intent 데이터가 첫 번째 파라미터로 정확히 주입되어야 함');
    assert.strictEqual(service.receivedDependency, 'hello-dependency', 'DI를 통한 의존성 서비스 주입이 작동해야 함');

    assert.notStrictEqual(service.factoryInstance, undefined, 'Factory가 owner 인스턴스를 정상적으로 전달받아야 함');
    assert.deepStrictEqual(result, ['method-result']);
  });

  test('Single Data Object without array wrapping (auto-wrapped by manager)', async () => {
    const app = new SimpleApplication().run();
    const service = app.sim<TestIntentService>(TestIntentServiceSymbol)!;

    const singleData = { id: 1, content: 'hello' };
    const intent = new Intent('Symbol.for(TestIntentService)://testMethod', singleData);

    await app.publishIntent(intent);

    assert.strictEqual(service.called, true);
    assert.deepStrictEqual(service.receivedData, singleData, '배열이 아닌 데이터도 첫 번째 파라미터로 주입되어야 함');
  });

  test('Multiple Parameters Injection', async () => {
    const app = new SimpleApplication().run();

    const params = ['first', 100, undefined, { extra: 'data' }];
    const intent = new Intent('Symbol.for(TestIntentService)://multiParamMethod', params);

    const result = await app.publishIntent(intent);
    const data = result[0];

    assert.strictEqual(data.param1, 'first', '첫 번째 파라미터 주입 확인');
    assert.strictEqual(data.param2, 100, '두 번째 파라미터 주입 확인');
    assert.strictEqual(data.depSay, 'hello-dependency', '중간에 낀 @Inject 의존성 주입 확인');
    assert.deepStrictEqual(data.param3, { extra: 'data' }, '세 번째 파라미터 주입 확인');
  });

  test('IntentSubscribe Interface Implementation Test', async () => {
    const app = new SimpleApplication().run();
    const service = app.sim<SubscribeService>(SubscribeServiceSymbol)!;

    const testData = ['sub1', 'sub2'];
    // Symbol.for(SubscribeService):/// -> empty path after ///
    const intent = new Intent('Symbol.for(SubscribeService)://', testData);

    await app.publishIntent(intent);

    assert.deepStrictEqual(service.subscribedData, testData, 'intentSubscribe가 Intent 데이터 배열과 함께 호출되어야 함');
  });

  test('Multiple Parameters without @Inject', async () => {
    const app = new SimpleApplication().run();

    const params = ['val1', 2024, { key: 'value' }];
    const intent = new Intent('Symbol.for(TestIntentService)://noInjectMultiParam', params);

    const result = await app.publishIntent(intent);
    const data = result[0];

    assert.strictEqual(data.param1, 'val1', '첫 번째 파라미터 주입 확인');
    assert.strictEqual(data.param2, 2024, '두 번째 파라미터 주입 확인');
    assert.deepStrictEqual(data.param3, { key: 'value' }, '세 번째 파라미터 주입 확인');
  });

  test('PostConstruct Lifecycle and Parameter Injection Test', async () => {
    const app = new SimpleApplication().run();
    const service = app.sim<PostConstructService>(PostConstructServiceSymbol)!;

    assert.strictEqual(service.postConstructCalled, true, '@PostConstruct 메서드가 실행되어야 함');
    assert.strictEqual(service.postConstructDependencyValue, 'hello-dependency', '@PostConstruct 내부 의존성 주입 확인');

    // 이 부분이 핵심: @PostConstruct에서도 caller.instance가 자신을 가리켜야 함
    assert.notStrictEqual(service.factoryInstanceAtPost, undefined, '@PostConstruct의 Factory 호출 시 owner 인스턴스가 전달되어야 함');
    // 실제 객체는 프록시일 수 있으므로 존재 여부 위주로 체크하거나, 심층 비교
    assert.ok(service.factoryInstanceAtPost, '인스턴스가 존재해야 함');
  });

  test('Augmentation Test (injectInstance in caller)', async () => {
    const app = new SimpleApplication().run();
    const service = app.sim<AugmentService>(AugmentServiceSymbol)!;

    // Trigger injection via Intent
    await app.publishIntent('Symbol.for(AugmentService)://testMethod', []);

    assert.strictEqual(service.augmentedValue, 'hello-dependency-augmented', 'Factory should be able to access normal inject instance via caller.injectInstance');
  });

  test('PublishData Object Style Test (Symbol/Scheme/SymbolFor)', async () => {
    const app = new SimpleApplication().run();
    const service = app.sim<TestIntentService>(TestIntentServiceSymbol)!;

    const intentData = { type: 'object-style' };

    // 1. SymbolPublishType 테스트
    await app.publishIntent(
      {
        symbol: TestIntentServiceSymbol,
        path: 'testMethod'
      } as any,
      [intentData]
    );

    assert.strictEqual(service.called, true, 'SymbolPublishType으로 호출 성공해야 함');
    assert.deepStrictEqual(service.receivedData, intentData, '파라미터 주입 성공해야 함');

    // 2. SchemePublishType 테스트
    await app.publishIntent(
      {
        scheme: 'Symbol.for(TestIntentService)',
        path: 'testMethod'
      } as any,
      [{ name: 'scheme-test' }]
    );

    // 3. SymbolForPublishType 테스트 (Template Literal Type)
    const symbolForUri: `Symbol.for(${string}):/${string}` = `Symbol.for(TestIntentService):/testMethod`;
    const result = await app.publishIntent(symbolForUri, [{ name: 'symbol-for-test' }]);

    assert.ok(result.length > 0, 'SymbolForPublishType으로 호출 성공해야 함');
  });
});
