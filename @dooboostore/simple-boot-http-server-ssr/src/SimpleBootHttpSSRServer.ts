import { SimpleBootHttpServer } from '@dooboostore/simple-boot-http-server/SimpleBootHttpServer';
import { HttpSSRServerOption } from './option/HttpSSRServerOption';
import { ConstructorType } from '@dooboostore/core';
import {SimConfig} from "@dooboostore/simple-boot/decorators/SimDecorator";

export class SimpleBootHttpSSRServer extends SimpleBootHttpServer {
  constructor(option?: HttpSSRServerOption) {
    super(option)
  }

  run(otherInstanceSim?: Map<ConstructorType<any> | Function | SimConfig | symbol, any>) {
    const oi = new Map<ConstructorType<any> | Function | SimConfig | symbol, any>();
    oi.set(SimpleBootHttpSSRServer, this);
    otherInstanceSim?.forEach((value, key) => oi.set(key, value));
    return super.run(oi);
  }

  // TODO: 나중에 뭐라도..
  stop(){

  }
}
