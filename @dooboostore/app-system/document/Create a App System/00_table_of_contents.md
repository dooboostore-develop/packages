# 📖 Simple-Boot-App-System: 공통 애플리케이션 시스템 설계와 구현

## [서문: 왜 공통 애플리케이션 시스템을 만드는가?](./01_introduction.md)

---

### [제1장: 시스템의 기반 - ApiService와 HTTP 통신](./02_chapter1_apiservice_http.md)
- 1.1. ApiService의 계층적 구조
- 1.2. HTTP 요청/응답 처리
- 1.3. 인터셉터(Interceptor) 패턴

### [제2장: 사용자 피드백 - Alert 시스템](./03_chapter2_alert_system.md)
- 2.1. Alert 시스템의 역할과 구성
- 2.2. AlertFactory와 AlertService
- 2.3. 다양한 Alert 타입 구현

### [제3장: 재사용 가능한 UI 컴포넌트](./04_chapter3_reusable_ui_components.md)
- 3.1. 컴포넌트 설계 원칙
- 3.2. 내장 UI 컴포넌트 (Checkbox, Details, Input, Radio, Select)
- 3.3. Promise 기반 컴포넌트 (PromiseSwitch)

### [제4장: 상태 관리와 프록시 시스템](./05_chapter4_state_proxy_system.md)
- 4.1. 애플리케이션 상태 관리 (Store)
- 4.2. 프록시(Proxy)를 활용한 API 요청 가로채기

### [제5장: 프레임워크 연동과 확장성](./06_chapter5_framework_integration_extensibility.md)
- 5.1. Simple-Boot 생태계와의 연동
- 5.2. 시스템의 확장성 설계

### [부록: 더 나아가기](./07_appendix.md)
- A. Simple-Boot-App-System 아키텍처의 장단점
- B. 시스템의 발전 방향
