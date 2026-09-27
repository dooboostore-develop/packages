# 설계 의문 목록 (Design Questions)

지금 방식이 맞는지 확신이 없거나, 나중에 다시 판단해야 할 것들을 모아두는 곳.
결론이 나면 상태를 바꾸고 **결정** 칸에 이유를 남긴다.

상태: 🟡 열림 · 🔵 보류(지금 방식 유지, 나중에 재검토) · ✅ 결정됨

---

## 하이드레이션

### H-1. `@property` 하이드레이션에 `declare`가 꼭 필요한가 — 🔵 보류
- **현재**: `@property declare me: T;`로 선언해야 함.
- **이유**: `target: ESNext`라 `useDefineForClassFields`가 켜져 있음 → `me: T;`도 클래스 필드로 emit됨 → 업그레이드 때 생성자가 own property `me`를 `undefined`로 **정의**해서 하이드레이션 값을 덮어씀. `declare`는 emit 자체를 막는다.
- **대안**: 하이드레이션 값을 심볼 키(`el[Symbol.for('swc:hydration')]`)에 보관 → `ensureInit`(필드 초기화 이후, `@onInitialize` 이전)에서 필드로 옮겨 넣고 보관함 삭제.
  - 장점: `declare` 불필요, 초기값(`me = null`)을 기본값으로 쓸 수 있음, TS 설정(`useDefineForClassFields`)에 의존하지 않음.
  - 단점: 생성자 안에서는 아직 초기값(하이드레이션 전).
  - 참고: "심볼 보관 + getter 폴백"은 안 됨. `[[Define]]` 방식에선 클래스 필드가 만든 own 데이터 프로퍼티가 프로토타입 getter를 가려서 폴백이 실행될 기회가 없음.
- **결정**: 지금 방식 유지. 생성자에서 이미 하이드레이션 값이 들어 있다는 점이 오히려 장점일 수 있음. TS 설정이 바뀌면 조용히 깨질 수 있다는 점은 기억해둘 것.

### H-2. `data-hyd-*` attribute 폴백 — ✅ 결정됨 (제거)
- 노드가 교체되는 업그레이드(폴리필)를 걱정해 attribute로도 박으려던 것.
- **결정**: 제거. Chrome / Firefox / Safari(`@ungap/custom-elements` 폴리필) 모두 같은 노드를 업그레이드해서 own property가 유지되는 것 확인.

### H-3. 레거시 하이드레이션 경로의 XSS — 🟡 열림
- `simple-boot-front/src/SimpleBootFront.ts:490`: `script.innerHTML = \`window.__SIMPLE_BOOT_FRONT_DATA_HYDRATION__ = ${JSON.stringify(data)};\``
- `JSON.stringify`는 `<`를 이스케이프하지 않음 → 값에 `</script>`가 있으면 HTML 파서가 태그를 닫아 스크립트 탈출.
- 새 경로(`SSRSimpleWebComponentDomParserFilter`)는 `<` / U+2028 / U+2029 이스케이프로 막았음. 레거시도 같은 처리가 필요한지(아직 쓰는 경로인지) 판단 필요.

---

## 메시지 버스

### M-1. 타입 없이 구독할 때 재생(`behavior` / `replay`) 미지원 — 🔵 보류
- `observeMessage()` / `@subscribeSwcAppMessage`를 타입 없이 쓰면 live는 전부 받지만 재생은 안 됨(옵션이 조용히 무시됨).
- **이유**: 버퍼가 타입별(`Map<type, SwcAppMessage[]>`)이라 타입 간 발행 순서가 저장되지 않음. `type` 없이 발행된 메시지는 버퍼에 아예 안 들어감.
- **대안**: 타입과 무관한 전역 순서 버퍼 추가. 필요해지면 재검토.
- (선택지) 타입 없이 `subject`를 주면 경고 출력.

### M-2. `@subscribeSwcAppMessage`와 `observeMessage`의 호출 형태 차이 — 🟡 열림
- `observeMessage()`는 되는데 `@subscribeSwcAppMessage()`(빈 괄호)는 오버로드가 없어 TS 에러(런타임은 동작).
- `observeMessage({ type, subject })`는 되는데 데코레이터 옵션에는 `type`을 넣을 수 없음.
- 둘을 맞출지.

### M-3. 재생 메시지가 요청하지 않은 구독자에게도 전달됨 — 🟡 열림
- `_replayMessagesTo`가 재생할 때 `_invokeMessageSubscribers(instance, msg)`를 호출 → 그 인스턴스의 **모든** 구독 메서드 중 타입이 맞는 것 전부 실행.
- 한 컴포넌트에 `('auth', { subject: 'behavior' })`와 `('auth')`(live만), 타입 없는 구독이 같이 있으면 뒤의 둘도 재생 메시지를 받음.
- 같은 타입인데 `trigger`가 다른 구독이 둘이면, 첫 번째가 phase 불일치로 `return`해도 이미 `seen`에 들어가서 두 번째의 재생이 건너뛰어질 수 있음.

### M-4. 앱 호스트 자신은 `@publishSwcAppMessage`를 쓸 수 없음 — 🟡 열림
- `getAppHost(this)`가 자기 자신을 제외함 → 호스트(body)에서 쓰면 부모 호스트가 없어 메시지가 **에러 없이 버려짐**.
- 현재는 `this.publishMessage(...)` 직접 호출로 우회(`LabelcatchAppBody` 등).
- 대안: 부모가 없고 자기가 앱 호스트면 자기 버스에 발행하도록 `publishSwcAppMessage`에 폴백.

---

## 데코레이터 / 파라미터

### D-1. `buildSwcParameterArgs`가 all-or-nothing — 🟡 열림
- 파라미터 데코레이터를 하나라도 쓰면 positional 인자(legacyArgs)가 전부 버려지고, 데코레이터 없는 슬롯은 `undefined`.
- 옵저버(mutation / intersection / resize)는 matchedEls / records / observer에 해당하는 kind가 없음 → `@xxxBeforeReturn`을 쓰는 순간 그 데이터에 접근 불가. 지금은 before 리턴을 legacyArgs 끝에 append해서 완화.
- 대안: kind 없는 슬롯은 legacy 값 유지 + 옵저버용 kind(`@observerElements`, `@observerEntries`, `@observerInstance`) 추가.

### D-2. 데코레이터 스택 순서 규칙이 문서화돼 있지 않음 — 🟡 열림
- 출력 데코레이터들이 descriptor를 감싸는 순서가 결과에 영향을 줄 수 있는데 규칙이 명시돼 있지 않음.
- 어떤 데코레이터가 descriptor를 감싸는지(출력), 어떤 게 메타데이터만 남기는지(트리거), 위아래 순서가 결과를 바꾸는 경우가 있는지 정리 필요.

---

## SSR / 서버

### S-1. SSR 요청마다 새 window 생성 — 🔵 보류
- `DomParserInitializer`가 요청마다 가상 window를 새로 만들고 버림. 풀링·캐싱 없음.
- 고부하 시 비용. 필요해지면 풀링 또는 정적 구간 캐시 검토.

### S-2. `SSRSimpleWebComponentDomParserFilter`의 `let app` (strict 모드) — 🔵 보류
- `--strict`에서만 `TS2454: 'app' is used before being assigned`.
- 런타임 문제 없음(`undefined`면 `if (app)`을 안 탐). 패키지가 strict가 아니라 평소엔 안 보임.
- strict를 켤 때 `let app: SwcAppInterface | void = undefined;`.

### S-3. `IntentSchemeFilter`의 인자 규약 예외 — 🟡 열림
- 대부분 `intent.data = [body, rr]`(rr이 두 번째)인데, 본문도 쿼리도 없으면 `[rr]`(rr이 **첫 번째**).
- `me(data?: RequestResponse)`처럼 rr만 받는 메서드에 본문 `{}`을 실어 보내면 rr 자리에 본문이 들어가 동작하지 않음(curl로 `/me`에 `{}`를 보내면 빈 응답).
- 프론트 프록시는 본문 없이 보내서 지금은 문제가 없지만, 규약이 호출 형태에 따라 달라지는 게 맞는지.

### S-4. 호스트 탐색 무한루프 가드 — 🟡 열림
- `simple-web-component/src/utils/Utils.ts`의 호스트 탐색에 `guard > 50` 가드와 디버그 로그가 추가됨.
- 무한루프를 실제로 겪었다는 흔적. 가드는 증상을 막을 뿐이라 원인(어떤 구조에서 부모 탐색이 순환하는지)을 따로 확인할 필요.

---

## 기타

### E-1. 디버그 로그 — 🔵 보류 (개발 중)
- `LabelcatchAppBody`(생성자, `before---me`, `me callback!!`, `vvvvvvvvvVV????????`), `Utils.ts` 호스트 탐색 로그, `SwcAppMixin`의 라우터 이벤트 로그 등.
- 개발 중이라 유지. 배포 전 정리하거나 `core/logger` 레벨로 전환.

### E-2. `HomePage.testHyd` — 🔵 보류 (개발 중)
- 하이드레이션 테스트용 필드가 실제 페이지에 들어가 있음. 검증 끝나면 제거.

### E-3. `attribute()`/`property()` 오버로드 순서 — ✅ 해결
- bare 시그니처 `(target: Object, propertyKey)`가 맨 앞에 있어서 `@attribute('#u', 'pid')`(필드), `@property('#chart', 'data')`, `@property('#btn', 'disabled')`(메서드)가 TS1240/1241.
- bare 시그니처를 맨 뒤로 옮겨 해결. `set*` 제거와 함께 필드/메서드 공용 오버로드로 정리.
- 남은 한계: 함수 셀렉터가 `any`를 리턴하면(`(t: any) => t`) 여전히 bare로 잡힘. `Element` 등으로 타입을 주면 정상.

### E-4. 패키지 빌드 순서 — 🟡 열림
- 루트 `pnpm run build`에서 `simple-web-component-library` 선언 생성이 `@dooboostore/algorithm`을 못 찾고 실패(빌드 순서). 번들은 나와서 막히진 않음.

### E-5. `dooboostore.github.io/apps/center`가 제거된 API 사용 — 🟡 열림
- `RootRouter.ts` 등에서 `subscribeSwcAppRouteChangeWhileConnected`(21곳). 오래된 `dist/types` 덕에 타입체크만 통과 — 서브모듈을 올리면 깨짐. `subscribeSwcAppRouteChange`로 이름 변경 필요.

---

## README 전수 검토(2026-09-28)에서 나온 코드 의심 사항

README 는 코드에 맞춰 고쳤고, 아래는 **코드 쪽** 문제라 손대지 않은 것들.

### R-1. simple-web-component — 🟡 열림
- bare `@query` / `@queryAll`(인자 없이 필드)이 아무 것도 안 함 — 인자 없는 분기가 데코레이터를 만들어 리턴만 하고 적용하지 않음. 예전 `@attribute` 와 같은 패턴.
- `ATTRIBUTE_CHANGED_WILDCARD = '*'` export 만 되고 어디서도 검사 안 함.
- behavior replay(`_replayMessagesTo`)가 `subject` 없는 구독자까지 재생하고, 타입 기준으로만 중복 제거.

### R-2. swc examples / test — 🟡 열림
- `test/case/src` 가 export 안 되는 API 를 import (`onConnectedInnerHtml`, `setAttributeHost`, `updateAttribute`, `replaceChildrenNode` …) → 빌드 불가 추정. spa/ 는 컴포넌트에 `@Router`/`@Sim`.
- commerce `components/Header.ts`: `CartService`·`Subscription` 중복 import, `inject`/`Inject` 혼용 → 식별자 중복.
- commerce `HomePage.ts`, stock `MainPage.ts`: 패키지 대신 `"../../../../src"` 에서 import.
- commerce `pages/index.ts`: 도달 불가 `/detail/` 분기가 accommodation 태그를 렌더.
- accommodation 디버그 흔적: `@attribute('product-id22')`, `@query('$this') gg`, `@state('ww')`(금지 규칙), `wow() { alert(1) }`.
- `BeforeFilterReturnTestPage.ts` 헤더 주석이 `@eventBeforeReturn` 을 "이전 호출 리턴값"이라 설명 — 실제는 `before` 훅 리턴값.

### R-3. swc lsp / intellij — 🟡 열림
- `SwcHighlightingListener` 가 `lsp/out/server/highlight.js` 를 실행하는데 lsp/src 에 해당 소스 없음 → 동작 안 함.
- `gradle/wrapper/gradle-wrapper.jar` 없음 → `./gradlew` 실행 불가 추정. lsp 의 `.vscode/launch.json` 도 없음.

### R-4. core 계열 — 🟡 열림
- core: `AsyncSubject` 구현돼 있지만 export 안 됨. `src/open-api`, `ObjectPathParser` 도 미노출. `ScheduleBase` 의 `abstract name?/description?` 가 optional 인데 구현 강제.
- core-node `FileUtils.File`: 생성자가 `updateStats()` 를 await 안 함 → `size` 경쟁, 경로 없으면 unhandled rejection. `copy()` 가 자기 경로를 사본으로 바꿈. `'/'` split 이라 Windows 비호환. `existes` 오타 API.
- core-web `DocumentUtils.eventObservable(document, …)` 가 `document` 인자 무시하고 전역 `window` 에 바인딩.
- algorithm: 실패 `reason` 이 한글 문자열 리터럴(`'잔액부족'` 등) — 소비자가 한글로 비교해야 함. 타입명 `TendRange` 오타(`TrendRange`).

### R-5. dom-render / lib / swc-library — 🟡 열림
- create-dom-render `package.json` bin 이름이 `create-simple-boot*` → `npm init @dooboostore/dom-render` 가 bin 을 못 찾을 수 있음. 설명문도 "simple-boot or Sapper"/"Svelte".
- dom-render 템플릿에 `webpack.config.js` 없는데 스크립트는 `webpack serve`.
- dom-render 루트가 `query`/`event` 데코레이터 미export(`attribute` 는 export). `OnChildRawSetRendered` 인터페이스 미export.
- lib-node `RandomImage.say()` 디버그 잔재. lib-web `src/canvas/angle/index.ts` 가 로드 시 실행되는 데모.
- swc-library `BubbleChart` 축 포맷이 한글 단위(조/억/만)를 캔버스에 그림.

### R-6. simple-boot / front / http-server / ssr — 🟡 열림
- http-server manual 응답 리팩터(`res: 'manual'`) 진행 중 — `example/src/routers/ApiRouter.ts:144` 가 아직 `res: { manual: true }`. README 는 `res: 'manual'` 기준으로 맞춤(되돌리면 문서도 되돌려야 함).
- `SimFrontOptionConfig.using` / `SimOption.using` 저장만 되고 어디서도 안 읽음.
- webpack 설정 누락: front default-template, SSR default-template/example/test 가 존재하지 않는 `webpack.config.js` 참조.
- SSR 템플릿·example·test 의 `backend:inspect:run` 이 없는 `front:build` 호출(실제는 `frontend:build`).
- `@dooboostore/core/runs/Runnable`, `@dooboostore/core/logger/Logger` 딥 import — core exports map 에 없어 tsconfig paths 로만 동작.
- simple-boot example: 메뉴는 AOP 라는데 예제는 예외 처리. `console.log('11', require.resolve(...))` 디버그 잔재.
- front default-template: `hello.component.*` 와 `HelloComponent.*` 중복(같은 selector).
- http-server default-template `AppRouter` HTML 이 없는 `@PUT`/`@DELETE` 를 광고.
