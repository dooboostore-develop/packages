import { ConstructorType } from '@dooboostore/core/types';
import { SimConfig, SimMetadataKey } from '../decorators/SimDecorator';
import { Carrier, SimstanceManager } from './SimstanceManager';
import { ReflectUtils } from '../utils/reflect/ReflectUtils';

export class SimAtomic<T = object> {
  private value?: T | undefined;
  constructor(public type: ConstructorType<T> | Function, private simstanceManager: SimstanceManager, private config?: {optional?: boolean}) {
  }

  getConfig(): SimConfig | undefined;
  getConfig<C = any>(key: symbol): C | undefined;
  getConfig<C = any>(key: symbol = SimMetadataKey): C | undefined {
    return ReflectUtils.getMetadata(key, this.type);
  }

  getConfigs() {
    return ReflectUtils.getMetadatas(this.type);
  }

  getValue(config?: {newInstanceCarrier?: Carrier, refresh?: boolean}): T | undefined {
    if (config?.refresh) {
      this.value = undefined;
    }
    // console.log('------value?', this.type, this.simstanceManager.storage)
    // return this.simstanceManager.getOrNewSim({target:this.type, newInstanceCarrier: config?.newInstanceCarrier});
    if (!this.value) {
      this.value = this.simstanceManager.getOrNewSim({target: this.type, newInstanceCarrier: config?.newInstanceCarrier});
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
