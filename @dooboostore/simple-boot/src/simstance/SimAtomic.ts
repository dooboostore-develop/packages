import { ConstructorType } from '@dooboostore/core';
import { SimConfig, SimMetadataKey } from '../decorators/SimDecorator';
import { Carrier, SimstanceManager } from './SimstanceManager';
import { ReflectUtils } from '@dooboostore/core';

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
        this.value = this.simstanceManager.findFirstSim(this.type.targetKeyType)?.getValue();
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
