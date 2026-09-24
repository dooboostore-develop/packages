import { ConstructorType } from '@dooboostore/core';
import { Lifecycle, SimConfig, SimMetadataKey } from '../decorators/SimDecorator';
import { Carrier, SimstanceManager } from './SimstanceManager';
import { ReflectUtils } from '@dooboostore/core';
import { ValidUtils } from '@dooboostore/core';

export class SimAtomic<T = object> {
  private value?: T | undefined;
  constructor(public type:{targetKeyType: ConstructorType<T> | Function | symbol, originalType: ConstructorType<T> | Function, value?: T}, private simstanceManager: SimstanceManager, private config?: {optional?: boolean}) {
    this.value = type.value;
  }

  getConfig(): SimConfig | undefined;
  getConfig<C = any>(key: symbol): C | undefined;
  getConfig<C = any>(key: symbol = SimMetadataKey): C | undefined {
    return ReflectUtils.getMetadata(key, this.type.originalType);
  }

  getConfigs() {
    return ReflectUtils.getMetadatas(this.type.originalType);
  }

  getValue(config?: {newInstanceCarrier?: Carrier, refresh?: boolean}): T | undefined {
    if (config?.refresh) {
      this.value = undefined;
    }
    // console.log('------value?', this.type, this.simstanceManager.storage)
    // return this.simstanceManager.getOrNewSim({target:this.type, newInstanceCarrier: config?.newInstanceCarrier});
    if (!this.value) {
      if (typeof this.type.targetKeyType === 'symbol') {
        // symbol 키로 직접 등록된(다른 targetKeyType으로는 안 갈리는) storage 항목을 바로 조회한다.
        // findFirstSim(symbol)로 다시 찾으면 이 atomic 자신과 같은 걸 또 찾아서 무한 재귀가 된다.
        const stored = this.simstanceManager.getStoreSet(this.type.targetKeyType as any);
        if (ValidUtils.isArrowFunction(stored?.instance)) {
          const fresh = (stored!.instance as Function)() as T;
          if (this.getConfig()?.scope === Lifecycle.Singleton) {
            // 싱글톤이면 결과값으로 storage를 덮어써서 다음 조회부턴 factory를 다시 안 부르고 캐시된 값을 쓴다.
            this.simstanceManager.setStoreSet(this.type.targetKeyType as any, fresh, stored!.type);
            this.value = fresh;
          }
          return fresh;
        }
        this.value = stored?.instance as T | undefined;
      } else {
        this.value = this.simstanceManager.getOrNewSim({target: this.type.targetKeyType as any, originTypeTarget: this.type.originalType, newInstanceCarrier: config?.newInstanceCarrier});
      }
      // const findFirstSim = this.simstanceManager.findFirstSim({type: this.type});
      // if (findFirstSim) {
      //   this.value = findFirstSim.getValue(config);
      // } else {
      //   this.value = this.simstanceManager.getOrNewSim({target: this.type, newInstanceCarrier: config?.newInstanceCarrier});
      // }
    }
    return this.value;
    // const types = ConvertUtils.flatArray(this.getConfig()?.type);
    // types.push(this.type);
    // for (const typeElement of types) {
    //   const instance = this.simstanceManager.getOrNewSim(typeElement, this.type);
    //   if (instance) {
    //     return instance;
    //   }
    // }
  }
}
