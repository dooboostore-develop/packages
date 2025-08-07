# 📖 SPA 프레임워크 설계와 구현: dom-render를 통한 여정

## [서문: 왜 우리는 또 다른 프레임워크를 만드는가?](./01_introduction.md)

---

### [제1장: 모든 것의 시작 - 반응성이란 무엇인가?](./02_chapter1.md)
- 1.1. 현대 프레임워크의 반응성 모델 비교
- 1.2. JavaScript `Proxy` 심층 탐구
- 1.3. 의존성 추적(Dependency Tracking)의 개념

### [제2장: 가장 단순한 템플릿 엔진 만들기](./03_chapter2.md)
- 2.1. 템플릿 파싱의 첫걸음
- 2.2. `RawSet`의 개념 설계
- 2.3. 1회성 렌더링 함수 구현

### [제3장: 반응성 주입 - `DomRenderProxy`의 탄생](./04_chapter3.md)
- 3.1. 1장과 2장의 결합
- 3.2. 재귀적 Proxy 적용
- 3.3. `DomRender.run`의 완성

### [제4장: 제어 흐름 구현 - 지시어(Directive) 시스템](./05_chapter4.md)
- 4.1. Operator(연산자) 패턴 설계
- 4.2. `dr-if` 구현하기
- 4.3. `dr-for-of` 구현하기

### [제5장: 생명과 영혼을 불어넣다 - 컴포넌트 시스템](./06_chapter5.md)
- 5.1. `DomRender.createComponent` 설계
- 5.2. 생명주기(Lifecycle) 훅 구현
- 5.3. 스코프 격리와 데이터 흐름
- 5.4. 격리된 스타일(Scoped Styles) 구현

### [제6장: 프레임워크 완성하기](./07_chapter6.md)
- 6.1. 라우터(`PathRouter`, `HashRouter`) 설계
- 6.2. 메신저(`Messenger`) 시스템
- 6.3. 최적화와 예외 처리
- 6.4. 빌드 및 배포

### [부록: 더 나아가기](./08_appendix.md)
- A. `dom-render` 아키텍처의 장단점
- B. 성능 개선을 위한 아이디어
- C. 프레임워크 개발자로서의 성장 로드맵