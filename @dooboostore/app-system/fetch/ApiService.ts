import { PostConstruct, Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { AfterProxyFetchParams, BeforeProxyFetchParams, FetcherRequest, HttpFetcherConfig, HttpFetcherTarget, HttpJsonFetcher } from '@dooboostore/core/fetch';
import { Alert } from '../alert/Alert';
import { Subject } from 'rxjs';
import { AlertService } from '../alert/AlertService';

export namespace ApiService {

  export type BeforeProxyExecuteParams = {
    target: HttpFetcherTarget;
    config?: HttpFetcherConfig<ApiService.ApiServiceConfig>;
  };

  // export interface ApiServiceInterceptor {
  //   afterProxyFetch?<T = RequestInfo | URL>(config: AfterProxyFetchParams<T>): Promise<Response>;
  //
  //   beforeProxyFetch?<T = RequestInfo | URL>(config: BeforeProxyFetchParams<T>): Promise<BeforeProxyFetchParams<T>>;
  //
  //   beforeProxyExecute?(config: BeforeProxyExecuteParams): Promise<BeforeProxyExecuteParams>;
  // }

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
  export type StoreDataAfterFetch = { type: 'afterFetch'; response: Response };
  export type StoreDataBeforeFetch<T = RequestInfo | URL> = { type: 'beforeFetch'; config: BeforeProxyFetchParams<T> };
  export type StoreDataFinal = {
    type: 'final';
    config: FetcherRequest<URL, any, HttpFetcherConfig<ApiServiceConfig>>;
    pipe: PIPE;
  };
  export type StoreData =
    | StoreDataBeforeFetch
    | StoreDataAfterFetch
    | StoreDataProgress
    | StoreDataSuccess
    | StoreDataError
    | StoreDataFinal;
}

@Sim
export class ApiService extends HttpJsonFetcher<ApiService.ApiServiceConfig, ApiService.PIPE> {
  private subject = new Subject<ApiService.StoreData>();
  private alertService?: AlertService<any>;
  constructor(alertService: AlertService<any>) {
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

  // async beforeProxyFetch<T = RequestInfo | URL>(config: BeforeProxyFetchParams<T>) {
  // let interceptors = ApiService.ApiServiceInterceptor.resolveAll();
  // for (const interceptor of interceptors) {
  //   if (interceptor.beforeProxyFetch) {
  //     config = await interceptor.beforeProxyFetch(config);
  //   }
  // }
  // @ts-ignore
  //   this.subject.next({ type: 'beforeFetch', config: config as BeforeProxyFetchParams });
  //   return config;
  // }

  // async afterProxyFetch<T = RequestInfo | URL>(config: { config: BeforeProxyFetchParams<T>; response: Response }) {
  // let interceptors = ApiService.ApiServiceInterceptor.resolveAll();
  // // console.log('afterProxyFetch------------>', interceptors);
  // let r = config.response;
  // for (const interceptor of interceptors) {
  //   if (interceptor.afterProxyFetch) {
  //     r = await interceptor.afterProxyFetch({ ...config, response: r });
  //   }
  // }
  // this.subject.next({ type: 'afterFetch', response: r });
  // return r;
  // }

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
    pipe.progress?.deActive();
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
    target: HttpFetcherTarget,
    config?: HttpFetcherConfig<ApiService.ApiServiceConfig>
  ): Promise<any> {
    let r: ApiService.BeforeProxyExecuteParams = {target, config};
    // const interceptor = ApiService.ApiServiceInterceptor.resolveAll() ?? [];
    // for (const apiServiceInterceptor of interceptor) {
    //   if (apiServiceInterceptor.beforeProxyExecute) {
    //     r = await apiServiceInterceptor.beforeProxyExecute?.(r);
    //   }
    // }
    return super.execute(r.target, r.config);
  }
}