# Chapter 6: Full Code and Final Assembly

So far, we have sequentially followed each step of the journey to create `ApiService`. Starting from basic structure design, through lifecycle hooks, flexible configuration objects, reactive state management, and extensibility via interceptors, the concepts covered in each chapter combine to complete a powerful `ApiService`.

In this final chapter, we will combine all the code written so far to examine the final version of `ApiService.ts` and summarize the overall picture with a simple example demonstrating its use.

## 6.1. Full `ApiService.ts` Code

Below is the complete source code for `ApiService.ts` that we have completed. Please observe how each part is organically combined and operates.

```typescript
import { PostConstruct, Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { AfterProxyFetchParams, BeforeProxyFetchParams, FetcherRequest, FetchSet, HttpFetcherConfig, HttpFetcherTarget, HttpJsonFetcher, RequestInfo } from '@dooboostore/core/fetch';
import { Alert } from '../alert/Alert';
import { config, pipe, Subject } from 'rxjs';
import { AlertService } from '../alert/AlertService';
import { SimstanceManager } from '@dooboostore/simple-boot/simstance/SimstanceManager';
import { isDefined } from '@dooboostore/core/types';

// --- Interceptor related namespace and interface ---
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

// --- ApiService related namespace and types ---
export namespace ApiService {
  export type AlertConfig = {
    title?: string;
    alertProgress?: boolean;
    alertSuccessMsg?: boolean;
    alertErrorMsg?: boolean;
    enableErrorConsole?: boolean;
  };
  export type CallBackConfig = {
    callBackProgress?: (config: FetcherRequest<URL, any, HttpFetcherConfig<ApiServiceConfig>>, pipe: PIPE) => void;
    callBackSuccess?: (config: FetcherRequest<URL, any, HttpFetcherConfig<ApiServiceConfig>>, pipe: PIPE) => void;
    callBackError?: (config: FetcherRequest<URL, any, HttpFetcherConfig<ApiServiceConfig>>, pipe: PIPE, e?: any) => void;
    callBackFinal?: (config: FetcherRequest<URL, any, HttpFetcherConfig<ApiServiceConfig>>, pipe: PIPE, e?: any) => void;
  };
  export type ApiServiceConfig = CallBackConfig & AlertConfig;
  export type PIPE<T = any> = {
    progress?: Alert<T>;
    responseData?: any;
  };
  // ... (StoreData types) ...
}

// --- ApiService class implementation ---
@Sim
export class ApiService extends HttpJsonFetcher<ApiService.ApiServiceConfig, ApiService.PIPE> {
  private subject = new Subject<ApiService.StoreData>();
  private alertService?: AlertService<any>;

  constructor(private simstanceManager: SimstanceManager, alertService: AlertService<any>) {
    super();
    this.alertService = alertService;
  }

  get observable() {
    return this.subject.asObservable();
  }

  protected createPipe<T = any>(config: FetcherRequest<URL, any, HttpFetcherConfig<ApiService.ApiServiceConfig>, T>): ApiService.PIPE {
    return {};
  }

  // --- Interceptor application logic ---
  async beforeProxyFetch<T = RequestInfo | URL>(config: BeforeProxyFetchParams<T>) {
    let interceptors = ApiServiceInterceptor.resolveAll(this.simstanceManager);
    for (const interceptor of interceptors) {
      if (interceptor.beforeProxyFetch) {
        config = await interceptor.beforeProxyFetch(config);
      }
    }
    this.subject.next({ type: 'beforeFetchData', config: config as BeforeProxyFetchParams});
    return config;
  }

  async afterProxyFetch<T = RequestInfo | URL>(config: AfterProxyFetchParams<T>) {
    let interceptors = ApiServiceInterceptor.resolveAll(this.simstanceManager);
    let r = config.response;
    for (const interceptor of interceptors) {
      if (interceptor.afterProxyFetch) {
        r = await interceptor.afterProxyFetch({ ...config, response: r });
      }
    }
    this.subject.next({ type: 'afterFetchData', response: r });
    return r;
  }

  protected async execute(target: HttpFetcherTarget, config?: HttpFetcherConfig<ApiService.ApiServiceConfig>): Promise<any> {
    let r: ApiServiceInterceptor.BeforeProxyExecuteParams = {target, config};
    const interceptors = ApiServiceInterceptor.resolveAll(this.simstanceManager);
    for (const apiServiceInterceptor of interceptors) {
      if (apiServiceInterceptor.beforeProxyExecute) {
        r = await apiServiceInterceptor.beforeProxyExecute?.(r);
      }
    }
    return super.execute(r.target, r.config);
  }

  // --- 생명주기 훅 구현 ---
  protected before(config: FetcherRequest<URL, any, HttpFetcherConfig<ApiService.ApiServiceConfig>>, pipe: ApiService.PIPE) {
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

  protected afterSuccess(config: FetcherRequest<URL, any, HttpFetcherConfig<ApiService.ApiServiceConfig>>, pipe: ApiService.PIPE) {
    this.subject.next({type: 'success', config, pipe});
    config.config?.config?.callBackSuccess?.(config, pipe);
    if (config.config?.config?.alertSuccessMsg) {
      this.alertService?.success({ title: config.config.config.title })?.active();
    }
  }

  protected error(config: FetcherRequest<URL, any, HttpFetcherConfig<ApiService.ApiServiceConfig>>, pipe: ApiService.PIPE, e?: any) {
    this.subject.next({type: 'error', config, pipe, e});
    config.config?.config?.callBackError?.(config, pipe, e);
    if (config.config?.config?.alertErrorMsg) {
      this.alertService?.danger({ title: `${config.config.config.title ?? ''}${e.message ? `(${e.message})` : ''}` })?.active();
    }
    if (config.config?.config?.enableErrorConsole) {
      console.error(`ApiService Error ${config?.config?.config?.title}`, e);
    }
  }

  protected finally(config: FetcherRequest<URL, any, HttpFetcherConfig<ApiService.ApiServiceConfig>>, pipe: ApiService.PIPE) {
    this.subject.next({type: 'final', config, pipe});
    config.config?.config?.callBackFinal?.(config, pipe);
    pipe.progress?.deActive();
  }
}
```

## 6.2. Usage Example: `PostService`

Here is a simple example of creating a `PostService` that fetches post data using `ApiService`.

```typescript
// post.service.ts
@Sim
export class PostService {
    private apiEndPoint = 'https://api.example.com/posts';

    constructor(private apiService: ApiService) {}

    // Retrieve all posts
    getPosts() {
        return this.apiService.get<Post[]>(this.apiEndPoint, {
            config: {
                title: 'Retrieve Post List',
                alertProgress: true,
                alertErrorMsg: true
            }
        });
    }

    // Retrieve a specific post
    getPost(id: number) {
        return this.apiService.get<Post>(`${this.apiEndPoint}/${id}`, {
            config: {
                title: `Retrieve Post #${id}`,
                alertErrorMsg: true
            }
        });
    }

    // Create a new post
    createPost(newPost: { title: string; body: string }) {
        return this.apiService.post<Post>(this.apiEndPoint, {
            body: newPost,
            config: {
                title: 'Create New Post',
                alertSuccessMsg: true,
                alertErrorMsg: true
            }
        });
    }
}
```
`PostService` uses `ApiService` via dependency injection. Each method calls `apiService`'s `get`, `post`, etc., and declaratively controls the behavior of each API request (e.g., displaying alerts) through the `config` object. Common logic such as adding `Authorization` headers is automatically handled by interceptors and therefore does not appear in the `PostService` code.

## 6.3. Concluding the Book

Through this book, we have overcome the limitations of the `fetch` API and designed and implemented an `ApiService` equipped with various features required in a real production environment.

Centralized API management, lifecycle hooks, flexible configuration, reactive state management, and extensibility through interceptors—all these elements combine to help developers focus more on business logic rather than server communication logic.

Based on the concepts and code discussed here, we hope you will create an even more powerful and advanced `ApiService` tailored to your projects.
