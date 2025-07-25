# 제6장: 전체 코드 및 최종 조립

지금까지 우리는 `ApiService`를 만들기 위한 여정의 각 단계를 차례대로 밟아왔습니다. 기본 구조 설계부터 시작하여 생명주기 훅, 유연한 설정 객체, 반응형 상태 관리, 그리고 인터셉터를 통한 확장성까지, 각 장에서 다룬 개념들이 모여 하나의 강력한 `ApiService`를 완성합니다.

이번 마지막 장에서는 지금까지 작성한 모든 코드를 하나로 합쳐 `ApiService.ts`의 최종 버전을 살펴보고, 이를 활용하는 간단한 예시를 통해 전체적인 그림을 정리하겠습니다.

## 6.1. `ApiService.ts` 전체 코드

다음은 우리가 완성한 `ApiService.ts`의 전체 소스 코드입니다. 각 부분들이 어떻게 유기적으로 결합되어 동작하는지 확인해 보시기 바랍니다.

```typescript
import { PostConstruct, Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { AfterProxyFetchParams, BeforeProxyFetchParams, FetcherRequest, FetchSet, HttpFetcherConfig, HttpFetcherTarget, HttpJsonFetcher, RequestInfo } from '@dooboostore/core/fetch';
import { Alert } from '../alert/Alert';
import { config, pipe, Subject } from 'rxjs';
import { AlertService } from '../alert/AlertService';
import { SimstanceManager } from '@dooboostore/simple-boot/simstance/SimstanceManager';
import { isDefined } from '@dooboostore/core/types';

// --- 인터셉터 관련 네임스페이스 및 인터페이스 ---
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

// --- ApiService 관련 네임스페이스 및 타입 ---
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
  // ... (StoreData 타입들) ...
}

// --- ApiService 클래스 구현 ---
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

  // --- 인터셉터 적용 로직 ---
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

## 6.2. 사용 예시: `PostService`

`ApiService`를 활용하여 게시글 데이터를 가져오는 `PostService`를 만드는 간단한 예시입니다.

```typescript
// post.service.ts
@Sim
export class PostService {
    private apiEndPoint = 'https://api.example.com/posts';

    constructor(private apiService: ApiService) {}

    // 모든 게시글 조회
    getPosts() {
        return this.apiService.get<Post[]>(this.apiEndPoint, {
            config: {
                title: '게시글 목록 조회',
                alertProgress: true,
                alertErrorMsg: true
            }
        });
    }

    // 특정 게시글 조회
    getPost(id: number) {
        return this.apiService.get<Post>(`${this.apiEndPoint}/${id}`, {
            config: {
                title: `게시글 #${id} 조회`,
                alertErrorMsg: true
            }
        });
    }

    // 새 게시글 생성
    createPost(newPost: { title: string; body: string }) {
        return this.apiService.post<Post>(this.apiEndPoint, {
            body: newPost,
            config: {
                title: '새 게시글 생성',
                alertSuccessMsg: true,
                alertErrorMsg: true
            }
        });
    }
}
```
`PostService`는 `ApiService`를 주입받아 사용합니다. 각 메소드는 `apiService`의 `get`, `post` 등을 호출하며, `config` 객체를 통해 각 API 요청의 동작(알림 표시 등)을 선언적으로 제어합니다. `Authorization` 헤더 추가와 같은 공통 로직은 인터셉터가 자동으로 처리하므로 `PostService`의 코드에는 나타나지 않습니다.

## 6.3. 책을 마치며

이 책을 통해 우리는 `fetch` API의 한계를 극복하고, 실제 프로덕션 환경에서 요구되는 다양한 기능들을 갖춘 `ApiService`를 직접 설계하고 구현해 보았습니다.

중앙화된 API 관리, 생명주기 훅, 유연한 설정, 반응형 상태 관리, 그리고 인터셉터를 통한 확장성까지, 이 모든 요소들이 결합되어 개발자가 서버 통신 로직이 아닌 비즈니스 로직에 더 집중할 수 있도록 돕습니다.

여기서 다룬 개념과 코드들을 기반으로 여러분의 프로젝트에 맞는 더욱 강력하고 발전된 `ApiService`를 만들어 나가시길 바랍니다.