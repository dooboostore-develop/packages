import 'reflect-metadata';
import { describe, test } from 'node:test';
import assert from 'node:assert';
import { Expression } from '@dooboostore/core';
import { Cache, DefaultCacheStorage } from '@dooboostore/simple-boot';
import { Sim } from '@dooboostore/simple-boot';
import { Storage } from '@dooboostore/core';
import { SimpleApplication } from '@dooboostore/simple-boot';
import { SimOption } from '@dooboostore/simple-boot';
import { ConstructorType } from '@dooboostore/core';
import { MemoryStorage } from '@dooboostore/core';
import { Promises } from '@dooboostore/core';
import { CacheManager } from '@dooboostore/simple-boot';
import { OnSimCreate } from '@dooboostore/simple-boot';

// @ts-ignore
@Sim
class MyStore implements Storage {
  [name: string]: any;

  readonly length: number;

  clear(): void {}

  getItem(key: string): string | null {
    return undefined;
  }

  key(index: number): string | null {
    return undefined;
  }

  removeItem(key: string): void {}

  setItem(key: string, value: string): void {}
}

class MyStoreA {}

// @ts-ignore
@Sim
class WOW implements OnSimCreate {
  constructor(private cacheManager: CacheManager) {}

  onSimCreate(): void {
    setInterval(() => {
      console.dir(this.cacheManager.getCacheSet(), { depth: 3 });
    }, 1000);
  }
}

describe('Cache Tests', () => {
  test('should create MyStore instance', async () => {
    const option = new SimOption();
    const simpleApplication = new SimpleApplication(option);
    simpleApplication.run();

    const myStore = simpleApplication.sim(MyStore) as MyStore;
    assert.ok(myStore, 'MyStore should be created');
  });

  test('should create WOW instance with CacheManager', async () => {
    const option = new SimOption();
    const simpleApplication = new SimpleApplication(option);
    simpleApplication.run();

    const wow = simpleApplication.sim(WOW) as WOW;
    assert.ok(wow, 'WOW should be created');
  });

  test('should initialize CacheManager', async () => {
    const option = new SimOption();
    const simpleApplication = new SimpleApplication(option);
    simpleApplication.run();

    const cacheManager = simpleApplication.sim(CacheManager) as CacheManager;
    assert.ok(cacheManager, 'CacheManager should be created');
  });
});
