# `FetchSystem` 완전 정복: `ApiService` 설계부터 구현까지

## 목차

-   [**서문: 왜 새로운 FetchSystem이 필요한가?**](./01_introduction.md)
    -   `fetch` API의 한계
    -   `ApiService`의 설계 목표

-   [**제1장: 계층적 Fetcher 설계와 기본 구조**](./02_chapter1_basic_design.md)
    -   Fetcher 계층 구조의 설계 사상
    -   `Fetcher`: 추상 계층
    -   `HttpFetcher`: HTTP 프로토콜 계층
    -   `HttpJsonFetcher`: JSON 데이터 형식 계층
    -   `ApiService`: 비즈니스 로직 계층
    -   `ApiService` 기본 클래스 정의

-   [**제2장: 요청 생명주기(Lifecycle) 훅 구현**](./03_chapter2_request_lifecycle_hooks.md)
    -   생명주기 훅(Hook)이란?
    -   생명주기 훅 구현하기

-   [**제3장: 유연한 설정 객체와 콜백**](./04_chapter3_configuration_and_callbacks.md)
    -   `ApiServiceConfig` 설계
    -   `AlertService` 주입 및 활용
    -   생명주기 훅과 설정 객체 연동

-   [**제4장: RxJS를 이용한 반응형 상태 관리**](./05_chapter4_reactive_state_with_rxjs.md)
    -   반응형 프로그래밍과 RxJS
    -   상태 데이터 타입(`StoreData`) 정의
    -   `Subject`와 `Observable` 적용
    -   생명주기 훅에서 상태 발행하기

-   [**제5장: 인터셉터를 통한 확장성 확보**](./06_chapter5_extensibility_with_interceptors.md)
    -   `ApiServiceInterceptor` 인터페이스 설계
    -   인터셉터 등록 및 조회
    -   `ApiService`에 인터셉터 적용하기
    -   인터셉터 구현 및 사용 예시

-   [**제6장: 전체 코드 및 최종 조립**](./07_chapter6_putting_it_all_together.md)
    -   `ApiService.ts` 전체 코드
    -   사용 예시: `PostService`
    -   책을 마치며

-   [**부록: 더 나아가기**](./08_appendix.md)
    -   캐싱(Caching) 전략
    -   요청 취소(Request Cancellation)
    -   파일 업로드/다운로드
    -   고급 에러 핸들링