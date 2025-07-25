# `AlertSystem` 유연하고 확장 가능한 알림 시스템 구축하기

## 목차

-   [**서문: 왜 새로운 Alert System을 구축하는가?**](./01_introduction.md)
    -   `AlertSystem`의 핵심 특징

-   [**제1장: 핵심 추상화 - `Alert`, `AlertService`, `AlertFactory`**](./02_chapter1_core_abstractions.md)
    -   `Alert`: 모든 알림의 기반이 되는 추상 클래스
    -   `AlertService`: 알림을 요청하고 관리하는 중앙 서비스
    -   `AlertFactory`: 알림 생성을 위임하는 팩토리 인터페이스

-   [**제2장: 팩토리 패턴을 이용한 환경별 구현 분리**](./03_chapter2_factory_pattern.md)
    -   팩토리 패턴의 필요성: 프론트엔드 vs 백엔드
    -   `FrontAlertFactory`: UI를 가진 프론트엔드 팩토리 구현
    -   `BackAlertFactory`: 비-UI 알림 처리기
    -   의존성 주입을 통한 팩토리 선택

-   [**제3장: 구체적인 알림과 UI 컴포넌트 연동**](./04_chapter3_concrete_alerts_and_ui.md)
    -   `Alert` 클래스 상속과 `make()` 메소드 구현
    -   `DangerAlert` 예시
    -   `make()` 메소드와 UI 컴포넌트의 만남

-   [**제4장: RxJS를 이용한 반응형 알림 관리**](./05_chapter4_reactive_management.md)
    -   `AlertService`와 RxJS `ReplaySubject`
    -   `AlertAction`을 이용한 상태 전파
    -   알림 이벤트 구독 및 처리 (소비자 구현)
        -   프론트엔드 소비자: 동적 UI 렌더링
        -   백엔드 소비자: 외부 시스템 연동

-   [**제5장: 타입-세이프한 커스텀 알림 타입 추가**](./06_chapter5_extending_with_custom_types.md)
    -   왜 타입 확장이 필요한가?
    -   `FrontAlertFactory` 확장
    -   TypeScript 모듈 보강으로 타입 안정성 확보

-   [**제6장: 전체 시스템 조립 및 사용 예시**](./07_chapter6_putting_it_all_together.md)
    -   `ApiService`에서 `AlertService` 사용하기
    -   전체 동작 흐름 요약
    -   책을 마치며

-   [**부록: 더 나아가기**](./08_appendix.md)
    -   확인/취소 버튼이 있는 알림 만들기
    -   알림 큐(Queue) 관리
    -   애니메이션 연동
