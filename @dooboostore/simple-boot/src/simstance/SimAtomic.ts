import { ConstructorType } from '@dooboostore/core/types';
import { SimConfig, SimMetadataKey } from '../decorators/SimDecorator';
import { Carrier, SimstanceManager } from './SimstanceManager';
import { ReflectUtils } from '../utils/reflect/ReflectUtils';

export class SimAtomic<T = object> {
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

  getValue(config?: {newInstanceCarrier?: Carrier}): T | undefined {
    // console.log('------value?', this.type, this.simstanceManager.storage)
    return this.simstanceManager.getOrNewSim({target:this.type, newInstanceCarrier: config?.newInstanceCarrier});
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
