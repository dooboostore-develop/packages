# 📖 웹 프론트엔드 프레임워크 설계와 구현: SPA 개발을 위한 프론트엔드 아키텍처

## [서문: 왜 프론트엔드 프레임워크를 만드는가?](./01_introduction.md)

---

### [제1장: 프레임워크의 시작점 - SimpleBootFront와 옵션](./02_chapter1_simplebootfront_option.md)
- 1.1. SimpleBootFront의 역할과 초기화
- 1.2. SimFrontOption을 통한 설정 관리
- 1.3. 의존성 주입(DI) 컨테이너 연동

### [제2장: 컴포넌트 시스템 - UI 구성의 핵심](./03_chapter2_component_system.md)
- 2.1. `@Component` 데코레이터와 컴포넌트 정의
- 2.2. `dom-render`와의 통합
- 2.3. 컴포넌트 생명주기

### [제3장: 라우팅과 내비게이션 - SPA의 흐름 제어](./04_chapter3_routing_navigation.md)
- 3.1. `@Router`와 `@Route`를 활용한 라우팅

### [제4장: 동적 스크립트와 서비스 - 프레임워크 확장](./05_chapter4_dynamic_scripts_services.md)
- 4.1. `@Script` 데코레이터와 동적 스크립트
- 4.2. 내장 서비스 활용 (Cookie, Storage, MetaTag)
- 4.3. 커스텀 서비스 개발

### [제5장: 프레임워크의 기반 - Simple-Boot Core 연동](./06_chapter5_simpleboot_core_integration.md)
- 5.1. Simple-Boot Core의 DI, AOP, 예외 처리 활용
- 5.2. 프론트엔드 환경에 최적화된 통합

### [부록: 더 나아가기](./07_appendix.md)
- A. Simple-Boot-Front 아키텍처의 장단점
- B. 성능 최적화 및 확장 방안
- C. 프론트엔드 프레임워크 개발의 미래
