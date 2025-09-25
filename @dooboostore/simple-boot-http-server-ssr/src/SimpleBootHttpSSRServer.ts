import { SimpleBootHttpServer } from '@dooboostore/simple-boot-http-server/SimpleBootHttpServer';
// import { SimstanceManager } from '@dooboostore/simple-boot/simstance/SimstanceManager';
import { HttpSSRServerOption } from './option/HttpSSRServerOption';
import { ConstructorType } from '@dooboostore/core/types';

export class SimpleBootHttpSSRServer extends SimpleBootHttpServer {
  constructor(option?: HttpSSRServerOption) {
    super(option)
  }

  run(otherInstanceSim?: Map<ConstructorType<any>, any>) {
    const oi = new Map<ConstructorType<any>, any>()
    otherInstanceSim?.forEach((value, key) => oi.set(key, value));
    return super.run(oi);
  }

  // TODO: 나중에 뭐라도..
  stop(){

  }
}
