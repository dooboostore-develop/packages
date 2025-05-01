import { InitOptionType, SimOption } from '@dooboostore/simple-boot/SimOption';
import { ConstructorType } from '@dooboostore/core/types';
import { Server, ServerOptions } from 'http';
import { Filter } from '../filters/Filter';
import { EndPoint } from '../endpoints/EndPoint';
import { RequestResponse } from '../models/RequestResponse';
import { SimpleBootHttpServer } from '../SimpleBootHttpServer';
import { TransactionManager } from '@dooboostore/simple-boot/transaction/TransactionManager';

export type Listen = { port?: number, hostname?: string, backlog?: number, listeningListener?: (server: SimpleBootHttpServer, httpServer: Server) => void };

export interface ListenData extends Listen {
  port: number;
  hostname: string;
}

export class HttpServerOption extends SimOption {
  public static readonly DEFAULT_PORT = 8081;
  public static readonly DEFAULT_HOSTNAME = '127.0.0.1';
  public serverOption?: ServerOptions;
  public listen: ListenData;
  public filters?: (Filter | ConstructorType<Filter>)[];
  public requestEndPoints?: (EndPoint | ConstructorType<EndPoint>)[];
  public closeEndPoints?: (EndPoint | ConstructorType<EndPoint>)[];
  public errorEndPoints?: (EndPoint | ConstructorType<EndPoint>)[];
  public sessionOption: { key: string, expiredTime: number, provider?: { uuids: () => Promise<string[]>, delete: (uuid: string) => Promise<void>, get: (uuid: string) => Promise<{ access: number, data?: any }>, set: (uuid: string, data: { access: number, data?: any }) => Promise<void> } };
  public globalAdvice?: any | ConstructorType<any>;
  public noSuchRouteEndPointMappingThrow?: (rr: RequestResponse) => any;
  public transactionManagerFactory?: () => TransactionManager;

  constructor({serverOption, listen, filters, requestEndPoints, closeEndPoints, errorEndPoints, sessionOption, globalAdvice, noSuchRouteEndPointMappingThrow, transactionManagerFactory}: {
    serverOption?: ServerOptions,
    listen?: Listen,
    filters?: (Filter | ConstructorType<Filter>)[],
    requestEndPoints?: (EndPoint | ConstructorType<EndPoint>)[],
    closeEndPoints?: (EndPoint | ConstructorType<EndPoint>)[],
    errorEndPoints?: (EndPoint | ConstructorType<EndPoint>)[],
    sessionOption?: { key?: string, expiredTime?: number, provider?: { uuids: () => Promise<string[]>, delete: (uuid: string) => Promise<void>, get: (uuid: string) => Promise<{ access: number, data?: any }>, set: (uuid: string, data: { access: number, data?: any }) => Promise<void> } },
    globalAdvice?: any | ConstructorType<any>,
    noSuchRouteEndPointMappingThrow?: (rr: RequestResponse) => any,
    transactionManagerFactory?: () => TransactionManager
  } = {}, initSimOption?: InitOptionType) {
    super(initSimOption);
    this.serverOption = serverOption;
    this.listen = Object.assign({port: HttpServerOption.DEFAULT_PORT, hostname: HttpServerOption.DEFAULT_HOSTNAME}, listen);
    this.filters = filters;
    this.requestEndPoints = requestEndPoints;
    this.closeEndPoints = closeEndPoints;
    this.errorEndPoints = errorEndPoints;
    this.sessionOption = Object.assign({key: 'SBSESSIONID', expiredTime: 1000 * 60 * 30}, sessionOption);
    this.globalAdvice = globalAdvice;
    this.noSuchRouteEndPointMappingThrow = noSuchRouteEndPointMappingThrow;
    this.transactionManagerFactory = transactionManagerFactory;
  }
}
