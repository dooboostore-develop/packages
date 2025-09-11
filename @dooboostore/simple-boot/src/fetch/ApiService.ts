import { Sim } from '../decorators/SimDecorator';
import { AfterProxyFetchParams, BeforeProxyFetchParams, FetcherRequest, FetchSet, HttpFetcherConfig, HttpFetcherTarget, HttpJsonFetcher, HttpJsonFetcherConfig, RequestInfo } from '@dooboostore/core/fetch';
import { Alert } from '../alert/Alert';
import { AlertService } from '../alert/AlertService';
import { SimstanceManager } from '../simstance/SimstanceManager';
import { isDefined } from '@dooboostore/core/types';
import { Subject } from '@dooboostore/core/message';

export namespace ApiServiceInterceptor {
  export const TOKEN = Symbol('ApiServiceInterceptor');
    export const resolveAll = (simstanceManager: SimstanceManager):ApiServiceInterceptor[] => {
      try {
        return (simstanceManager.findSims<ApiServiceInterceptor>(ApiServiceInterceptor.TOKEN) ?? []).map(it => it.getValue()).filter(isDefined);
      } catch (e) {
        return [];
      }
    };

  export type BeforeProxyExecuteParams = {
    target: HttpFetcherTarget;
    config?: HttpFetcherConfig<ApiService.ApiServiceConfig>;
  };
}
export interface ApiServiceInterceptor {
  afterProxyFetch?<T = RequestInfo | URL>(config: AfterProxyFetchParams<T>): Promise<Response>;
  beforeProxyFetch?<T = RequestInfo | URL>(config: BeforeProxyFetchParams<T>): Promise<BeforeProxyFetchParams<T>>;
  beforeProxyExecute?(config: ApiServiceInterceptor.BeforeProxyExecuteParams): Promise<ApiServiceInterceptor.BeforeProxyExecuteParams>;
}


export namespace ApiService {



  export type AlertConfig = {
    title?: string;
    alertProgress?: boolean;
    alertSuccessMsg?: boolean;
    alertErrorMsg?: boolean;
    // errorMsgConvert?: (e: unknown) => Promise<string>;
    enableErrorConsole?: boolean;
  };
  export type CallBackConfig = {
    callBackProgress?: (config: FetcherRequest<URL, any, HttpFetcherConfig<ApiServiceConfig>>, pipe: PIPE) => void;
    callBackSuccess?: (config: FetcherRequest<URL, any, HttpFetcherConfig<ApiServiceConfig>>, pipe: PIPE) => void;
    callBackError?: (
      config: FetcherRequest<URL, any, HttpFetcherConfig<ApiServiceConfig>>,
      pipe: PIPE,
      e?: any
    ) => void;
    callBackFinal?: (
      config: FetcherRequest<URL, any, HttpFetcherConfig<ApiServiceConfig>>,
      pipe: PIPE,
      e?: any
    ) => void;
  };

  export type ApiServiceConfig = CallBackConfig & AlertConfig;

  export type PIPE<T = any> = {
    progress?: Alert<T>;
    responseData?: any;
  };
  export type StoreDataError = {
    type: 'error';
    config: FetcherRequest<URL, any, HttpFetcherConfig<ApiServiceConfig>>;
    pipe: PIPE;
    e: any;
  };
  export type StoreDataSuccess = {
    type: 'success';
    config: FetcherRequest<URL, any, HttpFetcherConfig<ApiServiceConfig>>;
    pipe: PIPE;
  };
  export type StoreDataProgress = {
    type: 'progress';
    config: FetcherRequest<URL, any, HttpFetcherConfig<ApiServiceConfig>>;
    pipe: PIPE;
  };
  export type StoreDataAfterFetch = { type: 'afterFetchData'; response: Response };
  export type StoreDataBeforeFetch<T = RequestInfo | URL> = { type: 'beforeFetchData'; config: BeforeProxyFetchParams<T> };
  export type StoreDataFinal = {
    type: 'final';
    config: FetcherRequest<URL, any, HttpFetcherConfig<ApiServiceConfig>>;
    pipe: PIPE;
  };
  export type StoreBeforeFetch = { type: 'beforeFetch'; fetch: FetchSet };
  export type StoreAfterFetch = { type: 'afterFetch'; fetch: FetchSet, response: Response };
  export type StoreData =
    | StoreDataBeforeFetch
    | StoreDataAfterFetch
    | StoreDataProgress
    | StoreDataSuccess
    | StoreDataError
    | StoreDataFinal
    | StoreBeforeFetch
    | StoreAfterFetch

}

export const isStoreAfterFetch = (data: ApiService.StoreData): data is ApiService.StoreAfterFetch => {
  return data.type === 'afterFetch';
}
export const isStoreAfterFetchData = (data: ApiService.StoreData): data is ApiService.StoreAfterFetch => {
  return data.type === 'afterFetchData';
}
export const isStoreBeforeFetch = (data: ApiService.StoreData): data is ApiService.StoreBeforeFetch => {
  return data.type === 'beforeFetch';
}
export const isStoreBeforeFetchData = (data: ApiService.StoreData): data is ApiService.StoreBeforeFetch => {
  return data.type === 'beforeFetchData';
}
export const isStoreProgress = (data: ApiService.StoreData): data is ApiService.StoreDataProgress => {
  return data.type === 'progress';
}
export const isStoreSuccess = (data: ApiService.StoreData): data is ApiService.StoreDataSuccess => {
  return data.type === 'success';
}
export const isStoreError = (data: ApiService.StoreData): data is ApiService.StoreDataError => {
  return data.type === 'error';
}
export const isStoreFinal = (data: ApiService.StoreData): data is ApiService.StoreDataFinal => {
  return data.type === 'final';
}

@Sim
export class ApiService extends HttpJsonFetcher<ApiService.ApiServiceConfig, ApiService.PIPE> {
  private subject = new Subject<ApiService.StoreData>();
  private alertService?: AlertService<any>;
  constructor(private simstanceManager: SimstanceManager, alertService: AlertService<any>) {
    super();
    this.alertService = alertService;
    // console.log('%c ApiService constructor', 'color: #ff0000');
  }

  // @PostConstruct
  // postConstruct(alertService: AlertService<any>) {
  //   this.alertService = alertService;
  // }

  get observable() {
    return this.subject.asObservable();
  }

  protected createPipe<T = any>(
    config: FetcherRequest<URL, any, HttpFetcherConfig<ApiService.ApiServiceConfig>, T>
  ): ApiService.PIPE {
    return {};
  }

  async beforeProxyFetch<T = RequestInfo | URL>(config: BeforeProxyFetchParams<T>) {
  let interceptors = ApiServiceInterceptor.resolveAll(this.simstanceManager);
    for (const interceptor of interceptors) {
      if (interceptor.beforeProxyFetch) {
        config = await interceptor.beforeProxyFetch(config);
      }
    }
    // @ts-ignore
    this.subject.next({ type: 'beforeFetchData', config: config as BeforeProxyFetchParams});
    return config;
  }

  async afterProxyFetch<T = RequestInfo | URL>(config: AfterProxyFetchParams<T>) {
  // console.log('afterProxyFetch!!!!11', config);
  let interceptors = ApiServiceInterceptor.resolveAll(this.simstanceManager);
  let r = config.response;
  for (const interceptor of interceptors) {
    if (interceptor.afterProxyFetch) {
      r = await interceptor.afterProxyFetch(config);
    }
  }
  // console.log('afterProxyFetch!!!!22', r);
  this.subject.next({ type: 'afterFetchData', response: r });
  return r;
  }

  beforeFetch(fetch: FetchSet): void {
    this.subject.next({type: 'beforeFetch', fetch});
  }

  afterFetch(fetch: FetchSet, response: Response): void {
    this.subject.next({type: 'afterFetch', fetch, response});
  }

  protected before(
    config: FetcherRequest<URL, any, HttpFetcherConfig<ApiService.ApiServiceConfig>>,
    pipe: ApiService.PIPE
  ) {
    this.subject.next({type: 'progress', config, pipe});
    config.config?.config?.callBackProgress?.(config, pipe);
    if (config.config?.config?.alertProgress) {
      const alert = this.alertService?.progress({title: config.config.config.title});
      if (alert) {
        pipe.progress = alert;
        alert.active();
      }
    }
  }

  protected afterSuccess(
    config: FetcherRequest<URL, any, HttpFetcherConfig<ApiService.ApiServiceConfig>>,
    pipe: ApiService.PIPE
  ) {
    this.subject.next({type: 'success', config, pipe});
    config.config?.config?.callBackSuccess?.(config, pipe);
    if (config.config?.config?.alertSuccessMsg) {
      this.alertService?.success({ title: config.config.config.title })?.active();
    }
  }

  protected afterSuccessTransform<T>(
    config: FetcherRequest<URL, any, HttpFetcherConfig<ApiService.ApiServiceConfig>, T>,
    pipe: ApiService.PIPE
  ): void {
  }

  protected finally(
    config: FetcherRequest<URL, any, HttpFetcherConfig<ApiService.ApiServiceConfig>>,
    pipe: ApiService.PIPE
  ) {
    this.subject.next({type: 'final', config, pipe});
    config.config?.config?.callBackFinal?.(config, pipe);
    pipe.progress?.inActive();
  }

  protected error(
    config: FetcherRequest<URL, any, HttpFetcherConfig<ApiService.ApiServiceConfig>>,
    pipe: ApiService.PIPE,
    e?: any
  ) {
    console.log('error', e);
    this.subject.next({type: 'error', config, pipe, e});
    config.config?.config?.callBackError?.(config, pipe, e);
    if (config.config?.config?.alertErrorMsg) {
      this.alertService?.danger({
        title: `${config.config.config.title ? config.config.config.title : ''}${e.message ? `(${e.message})` : ''}`
      })
        ?.active();
    }
    if (config.config?.config?.enableErrorConsole) {
      console.error(`apiService Error ${config?.config?.config?.title}`, e);
    }
  }

  protected async execute(
    fetcherRequest: FetcherRequest<HttpFetcherTarget, any, HttpJsonFetcherConfig<ApiService.ApiServiceConfig, any>>
    // target: HttpFetcherTarget,
    // config?: HttpFetcherConfig<ApiService.ApiServiceConfig>
  ): Promise<any> {
    const target = fetcherRequest.target;
    const config = fetcherRequest.config;
    let r: ApiServiceInterceptor.BeforeProxyExecuteParams = {target, config};
    const interceptor = ApiServiceInterceptor.resolveAll(this.simstanceManager) ?? [];
    for (const apiServiceInterceptor of interceptor) {
      if (apiServiceInterceptor.beforeProxyExecute) {
        r = await apiServiceInterceptor.beforeProxyExecute?.(r);
      }
    }
    return super.execute(r);
  }
}