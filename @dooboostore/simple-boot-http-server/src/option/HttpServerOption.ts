import { InitOptionType, SimOption } from '@dooboostore/simple-boot/SimOption';
import { ConstructorType } from '@dooboostore/core/types';
import { Server as HttpServer, ServerOptions  } from 'http';
import { Server as HttpsServer, ServerOptions as HttpsServerOption } from 'https';
import { Filter } from '../filters/Filter';
import { EndPoint } from '../endpoints/EndPoint';
import { RequestResponse } from '../models/RequestResponse';
import { SimpleBootHttpServer } from '../SimpleBootHttpServer';
import { TransactionManager } from '@dooboostore/core/transaction/TransactionManager';

export type Listen = { port?: number, hostname?: string, backlog?: number, listeningListener?: (server: SimpleBootHttpServer, httpServer: HttpServer | HttpsServer) => void };

export interface ListenData extends Listen {
  port: number;
  hostname: string;
}

export type SessionOption = {
  key: string;
  expiredTime: number;
  httpOnly?: boolean;
  secure?: boolean;
  maxAge?: number;
  sameSite?: boolean | 'lax' | 'strict' | 'none';
  domain?: string;
  path?: string;
  provider?: {
    uuids: () => Promise<string[]>;
    delete: (uuid: string) => Promise<void>;
    get: (uuid: string) => Promise<{ access: number; data?: any }>;
    set: (uuid: string, data: { access: number; data?: any }) => Promise<void>;
  };
};

export class HttpServerOption extends SimOption {
  public static readonly DEFAULT_PORT = 8081;
  public static readonly DEFAULT_HOSTNAME = '127.0.0.1';
  public serverOption?: ServerOptions | HttpsServerOption;
  public listen: ListenData;
  public filters?: (Filter | ConstructorType<Filter>)[];
  public fileUploadTempPath?: string;
  public requestEndPoints?: (EndPoint | ConstructorType<EndPoint>)[];
  public closeEndPoints?: (EndPoint | ConstructorType<EndPoint>)[];
  public errorEndPoints?: (EndPoint | ConstructorType<EndPoint>)[];
  public sessionOption: SessionOption;
  public globalAdvice?: any | ConstructorType<any>;
  public noSuchRouteEndPointMappingThrow?: (rr: RequestResponse) => any;
  public transactionManagerFactory?: () => TransactionManager;

  constructor(
    {
      serverOption,
      listen,
      filters,
      requestEndPoints,
      closeEndPoints,
      errorEndPoints,
      sessionOption,
      globalAdvice,
      fileUploadTempPath,
      noSuchRouteEndPointMappingThrow,
      transactionManagerFactory
    }: {
      serverOption?: ServerOptions | HttpsServerOption;
      listen?: Listen;
      filters?: (Filter | ConstructorType<Filter>)[];
      requestEndPoints?: (EndPoint | ConstructorType<EndPoint>)[];
      closeEndPoints?: (EndPoint | ConstructorType<EndPoint>)[];
      errorEndPoints?: (EndPoint | ConstructorType<EndPoint>)[];
      sessionOption?: {
        key?: string;
        expiredTime?: number;
        provider?: {
          uuids: () => Promise<string[]>;
          delete: (uuid: string) => Promise<void>;
          get: (uuid: string) => Promise<{ access: number; data?: any }>;
          set: (uuid: string, data: { access: number; data?: any }) => Promise<void>;
        };
      };
      globalAdvice?: any | ConstructorType<any>;
      fileUploadTempPath?: string;
      noSuchRouteEndPointMappingThrow?: (rr: RequestResponse) => any;
      transactionManagerFactory?: () => TransactionManager;
    } = {},
    initSimOption?: InitOptionType
  ) {
    super(initSimOption);
    this.serverOption = serverOption;
    this.listen = Object.assign(
      { port: HttpServerOption.DEFAULT_PORT, hostname: HttpServerOption.DEFAULT_HOSTNAME },
      listen
    );
    this.filters = filters;
    this.requestEndPoints = requestEndPoints;
    this.closeEndPoints = closeEndPoints;
    this.errorEndPoints = errorEndPoints;
    this.sessionOption = Object.assign(
      { key: 'SBSESSIONID', path: '/', httpOnly: true, expiredTime: 1000 * 60 * 30 },
      sessionOption
    );
    this.globalAdvice = globalAdvice;
    this.fileUploadTempPath = fileUploadTempPath;
    this.noSuchRouteEndPointMappingThrow = noSuchRouteEndPointMappingThrow;
    this.transactionManagerFactory = transactionManagerFactory;
  }

  get hostname() {
    return this.listen.hostname;
  }

  get port() {
    return this.listen.port;
  }

  get protocol() {
    return this.isSecure ? 'https' : 'http';
  }

  get address() {
    return `${this.protocol}://${this.hostname}:${this.port}`;
  }

  get isSecure() {
    return this.serverOption && 'key' in this.serverOption && 'cert' in this.serverOption;
  }
}
