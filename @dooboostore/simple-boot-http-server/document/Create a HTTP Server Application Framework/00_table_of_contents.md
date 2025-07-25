# 📖 Simple-Boot-HTTP-Server: Node.js 웹 서버 프레임워크 설계와 구현

## [서문: 왜 Node.js 웹 서버 프레임워크를 만드는가?](./01_introduction.md)

---

### [제1장: 서버의 시작과 요청 처리 - SimpleBootHttpServer와 RequestResponse](./02_chapter1_server_start_request_response.md)
- 1.1. SimpleBootHttpServer의 역할과 초기화
- 1.2. RequestResponse 객체: HTTP 트랜잭션의 핵심
- 1.3. HTTP 요청/응답 흐름 제어

### [제2장: 선언적 라우팅 - URL과 메소드 매핑](./03_chapter2_declarative_routing.md)
- 2.1. `@Router`와 `@Route`를 활용한 라우팅
- 2.2. HTTP 메소드 데코레이터 (`@GET`, `@POST` 등)
- 2.3. 요청/응답 데이터 바인딩 (Body, Header, Query)

### [제3장: 요청/응답 가로채기 - 필터와 엔드포인트](./04_chapter3_filters_endpoints.md)
- 3.1. 필터(Filter) 시스템: 요청 처리 전후 로직
- 3.2. 엔드포인트(EndPoint): 요청 생명주기 훅
- 3.3. 전역 예외 처리와 Advice

### [제4장: 세션 관리와 파일 업로드](./05_chapter4_session_file_upload.md)
- 4.1. 세션 관리 시스템
- 4.2. 파일 업로드 처리

### [제5장: 프레임워크의 기반 - Simple-Boot Core 연동](./06_chapter5_simpleboot_core_integration.md)
- 5.1. Simple-Boot Core의 DI, AOP, 예외 처리 활용
- 5.2. 서버 환경에 최적화된 통합

### [부록: 더 나아가기](./07_appendix.md)
- A. Simple-Boot-HTTP-Server 아키텍처의 장단점
- B. 성능 최적화 및 확장 방안
- C. 웹 서버 프레임워크 개발의 미래
