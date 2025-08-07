# 📖 Simple-Boot-HTTP-SSR: 서버사이드 렌더링 프레임워크 설계와 구현

## [서문: 왜 서버사이드 렌더링 프레임워크를 만드는가?](./01_introduction.md)

---

### [제1장: SSR의 기본 - SimpleBootHttpSSRServer와 JSDOM 통합](./02_chapter1_ssr_basics_jsdom.md)
- 1.1. SSR의 필요성과 SimpleBootHttpSSRServer의 역할
- 1.2. JSDOM을 활용한 서버 측 가상 DOM 환경 구축
- 1.3. SimpleBootFront 인스턴스 풀 관리

### [제2장: SSR 필터 - 요청 처리 파이프라인의 핵심](./03_chapter2_ssr_filter.md)
- 2.1. SSRFilter의 동작 원리
- 2.2. SSR 요청 처리 흐름
- 2.3. 데이터 하이드레이션(Data Hydration) 메커니즘

### [제3장: 데이터 하이드레이션 - SaveAroundAfter와 LoadAroundBefore](./04_chapter3_data_hydration.md)
- 3.1. 서버 측 데이터 저장 (`SaveAroundAfter`)
- 3.2. 클라이언트 측 데이터 로드 (`LoadAroundBefore`)
- 3.3. 데이터 직렬화 및 역직렬화

### [제4장: 클라이언트-서버 통신 - IntentSchemeFilter](./05_chapter4_client_server_communication.md)
- 4.1. Intent 기반 통신 프로토콜
- 4.2. IntentSchemeFilter의 역할과 구현
- 4.3. 클라이언트 측 Intent 발행과 서버 측 처리

### [제5장: 프레임워크의 기반 - Simple-Boot Core 및 Front 연동](./06_chapter5_simpleboot_integration.md)
- 5.1. Simple-Boot Core의 DI, AOP, 라우팅 활용
- 5.2. Simple-Boot-Front와의 통합 및 코드 공유
- 5.3. SSR 환경에 최적화된 통합

### [부록: 더 나아가기](./07_appendix.md)
- A. Simple-Boot-HTTP-SSR 아키텍처의 장단점
- B. 성능 최적화 및 확장 방안
- C. SSR 프레임워크 개발의 미래
