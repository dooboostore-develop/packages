import 'reflect-metadata';
import { describe, test } from 'node:test';
import assert from 'node:assert';
import { SimpleApplication } from '@dooboostore/simple-boot';
import { SimOption } from '@dooboostore/simple-boot';
import { Lifecycle, Sim, SimConfig } from '@dooboostore/simple-boot';
import { RandomUtils } from '@dooboostore/core';
import { ConstructorType } from '@dooboostore/core';
import { Inject } from '@dooboostore/simple-boot';

class WW {
  constructor(private s: string) {}
  say() {}
}

abstract class Profile {
  abstract say(): void;
}

// @ts-ignore
@Sim({ type: WW })
class ProfileA extends Profile {
  uuid = `ProfileA-${RandomUtils.uuid()}`;
  constructor() {
    super();
  }
  say() {}
}

// @ts-ignore
@Sim({ type: WW })
class ProfileB extends Profile {
  uuid = `ProfileB-${RandomUtils.uuid()}`;
  constructor() {
    super();
  }
  say() {}
}

// @ts-ignore
@Sim
class UserA {
  uuid = `UserA-${RandomUtils.uuid()}`;
  constructor(@Inject({ type: WW }) public pa: WW[]) {
    console.log('UserA Constructor'+pa)
  }
  say() {}
}

class UserNormalA {
  uuid = `UserNormalA-${RandomUtils.uuid()}`;
  say() {}
}

class UserNormalB {
  uuid = `UserNormalB-${RandomUtils.uuid()}`;
  say() {}
}

class UserNormalC {
  uuid = `UserNormalC-${RandomUtils.uuid()}`;
  say() {}
}

const TTSymbol = Symbol('TT');

describe('DI (Dependency Injection) Tests', () => {
  test('should inject multiple instances with different types', async () => {
    const option = new SimOption();
    const simpleApplication = new SimpleApplication(option);
    const other = new Map<ConstructorType<any> | Function | SimConfig, any>();

    other.set({ type: WW }, new UserNormalA());
    other.set({ type: WW }, new UserNormalB());
    other.set(WW, new UserNormalC());
    other.set({ symbol: TTSymbol, scope: Lifecycle.Transient }, () => {
      return { a: 'name' };
    });

    simpleApplication.run(other);
    const user = simpleApplication.sim(UserA) as UserA;

    assert.strictEqual(user.pa.length, 5, 'should have 5 injected instances');
  });

  test('should handle transient scope correctly', async () => {
    const option = new SimOption();
    const simpleApplication = new SimpleApplication(option);
    const other = new Map<ConstructorType<any> | Function | SimConfig, any>();

    other.set({ symbol: TTSymbol, scope: Lifecycle.Transient }, () => {
      return { a: 'name' };
    });

    simpleApplication.run(other);

    let tt = simpleApplication.sim(TTSymbol);
    let ttt = simpleApplication.sim(TTSymbol);
    let tttt = simpleApplication.sim(TTSymbol);

    assert.notStrictEqual(tt, ttt, 'transient instances should be different');
    assert.notStrictEqual(ttt, tttt, 'transient instances should be different');
  });

  test('should register ProfileA and ProfileB under WW type (not under their own class)', async () => {
    const option = new SimOption();
    const simpleApplication = new SimpleApplication(option);
    simpleApplication.run();

    // @Sim({type: WW})는 "나는 WW로 등록된다"는 선언이라, 자기 자신(ProfileA/ProfileB)으로는
    // 못 찾고 WW로 찾아야 한다 - sim(ProfileA)는 의도적으로 undefined가 맞다.
    assert.strictEqual(simpleApplication.sim(ProfileA), undefined, 'ProfileA is registered under WW, not under itself');
    assert.strictEqual(simpleApplication.sim(ProfileB), undefined, 'ProfileB is registered under WW, not under itself');

    const wwSims = simpleApplication.sims(WW) as unknown as (ProfileA | ProfileB)[];
    const profileA = wwSims.find(it => it.uuid.includes('ProfileA'));
    const profileB = wwSims.find(it => it.uuid.includes('ProfileB'));

    assert.ok(profileA, 'ProfileA should be created and found via WW');
    assert.ok(profileB, 'ProfileB should be created and found via WW');
  });
});
