# 📖 Simple-Boot 애플리케이션 프레임워크: 설계와 구현

## [서문: 왜 우리는 애플리케이션 프레임워크를 만드는가?](./01_introduction.md)

---

### [제1장: 핵심 관리 시스템 - DI와 생명주기](./02_chapter1_di_lifecycle.md)
- 1.1. 의존성 주입(Dependency Injection)의 필요성
- 1.2. `@Sim` 데코레이터와 SimstanceManager
- 1.3. 객체 생명주기 콜백

### [제2장: 횡단 관심사 처리 - AOP와 예외 처리](./03_chapter2_aop_exception.md)
- 2.1. 관점 지향 프로그래밍(AOP)의 이해
- 2.2. `@Before`, `@After`, `@Around` 데코레이터
- 2.3. 강력한 예외 처리 시스템

### [제3장: 애플리케이션 흐름 제어 - 라우팅과 Intent 시스템](./04_chapter3_routing_intent.md)
- 3.1. 유연한 라우터 시스템 설계
- 3.2. `@Router`와 `@Route` 데코레이터
- 3.3. Intent 기반 이벤트 시스템

### [제4장: 성능과 유효성 - 캐싱과 검증](./05_chapter4_cache_validation.md)
- 4.1. 메소드 레벨 캐싱 구현
- 4.2. `@Cache` 데코레이터
- 4.3. 데이터 유효성 검증 시스템
- 4.4. `@Validation` 데코레이터

### [제5장: 프레임워크의 기반 - 코어 아키텍처](./06_chapter5_core_architecture.md)
- 5.1. SimpleApplication의 역할
- 5.2. 메타데이터 관리와 Reflect API
- 5.3. 프록시(Proxy)를 활용한 동적 확장

### [부록: 더 나아가기](./07_appendix.md)
- A. Simple-Boot 아키텍처의 장단점
- B. 확장 및 기여 방안
- C. 프레임워크 개발자로서의 성장 로드맵
