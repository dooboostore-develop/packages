# Simple Web Component LSP — VSCode 디버그 실행 방법

이 LSP는 VSCode + (선택) IntelliJ 모두를 지원하는 서버 1개 + 클라이언트 조합입니다.
아래는 **VSCode에서 F5 디버그로 확장을 로드**해 SWC 문법 자동완성·하이라이트·선언부 이동을 확인하는 방법입니다.

## 요구사항

- Node.js (패키지 레포 루트에서 `pnpm install` 완료된 상태)
- VSCode

## 순서

### 1. LSP 폴더를 워크스페이스로 연다
`launch.json`이 이 폴더 안(`.vscode/`)에 있으므로, **이 폴더를 워크스페이스로 열어야** F5가 동작합니다.

```
packages/@dooboostore/simple-web-component/lsp
```

예:
```sh
code packages/@dooboostore/simple-web-component/lsp
```

### 2. 빌드 (아직 안 했다면)
```sh
pnpm run build
```
`.vscode/launch.json`의 프로필이 `npm: compile`(tsc)을 preLaunchTask로 돌리므로,
**그대로 F5로 눌러 빌드+실행이 함께 진행됩니다.**

### 3. F5 디버그 실행
- 왼쪽 **Run and Debug**(`Ctrl+Shift+D`) 패널에서
- 드롭다운에서 **"Run SWC LSP Extension"** 프로필 선택
- **F5**

그러면 **Extension Development Host**라는 새 VSCode 창이 열립니다. 확장이 소그 창에 로드됩니다.

### 4. 대상 프로젝트를 소그 창에서 연다
- Extension Development Host 창에서
  ```
  File → Open Folder → …/dooboostore.github.io
  ```
- `apps/center/src/pages/lotto/LottoPage.ts`를 연다
- SWC 문법을 확인한다.

> 기본(처음 연) 창에는 확장이 로드되지 않습니다. **반드시 F5로 열린 소그 창**에서 확인하세요.

## 확인할 수 있는 것
| 기능 | 입력 예시 |
|------|-----------|
| 상태 변수 완성 | `{{ @a` → `@aa@` |
| 멤버 완성 | `{{ @aa@.` → `toString`, `toFixed` 등 |
| 예약 변수 완성 | `{{ $` → `$host`, `$appHost`, `$this` … |
| SWC 하이라이트 | `{{ }}`(keyword), `@aa@`(variable), `swc-on-*`(function) |
| 선언부 이동 | `@aa@`에서 Cmd+Click → `@state('aa')` |

## 디버깅 팁
- 확장 로드 로그: 소그 창 **Output** 탭 → 확장 필터에서 `Simple Web Component` 선택
- LSP 상세 추적:
  ```json
  "simpleWebComponentLsp.trace.server": "verbose"
  ```
  이 설정을 소그 창의 `settings.json`에 넣어 LSP 메시지를 출력합니다.

## IntelliJ 지원 (LSP4IJ)

VSCode용 확장과 **같은 LSP 서버**(`out/server/server.js`)를 IntelliJ에서도 씁니다.
LSP는 "서버 1개, 클라이언트 다수" 구조라 서버는 그대로 두고 IntelliJ 쪽 클라이언트만 등록하면 됩니다.

> ⚠️ **알려진 제한**: LSP4IJ는 `.`, `@`, `$` 자동완성 트리거를 서버에 **전달하지 않아** 완성은 동작하지 않습니다
> (진단·하이라이트·호버는 동작). 완성을 정식으로 쓰려면 IntelliJ 전용 플러그인(SDK)을 만드는 것을 권장합니다.

### 요구사항
- IntelliJ IDEA 2024.2 이상
- Node.js (LSP 서버 실행용)
- 서버 빌드 완료: `cd packages/@dooboostore/simple-web-component/lsp && pnpm install && pnpm build`

### 1. LSP4IJ 플러그인 설치
`Settings → Plugins → Marketplace`에서 **LSP4IJ** 검색 → Install → IDE 재시작
(Red Hat 제공, JetBrains 마켓플레이스 공개 플러그인)

### 2. 언어 서버 등록
`Settings → Languages & Frameworks → Language Servers`에서 `+` 클릭:

**Command**
```
node $PROJECT_DIR$/packages/@dooboostore/simple-web-component/lsp/out/server/server.js --stdio
```
- `$PROJECT_DIR$`는 매크로라서 프로젝트마다 자동 치환됩니다.
- **주의**: 우리 서버는 `--stdio` 인자가 있어야 동작합니다
  (생략하면 `Connection input stream is not set` 에러).

**Mappings 탭**

| 항목 | 값 |
|---|---|
| File type | TypeScript (`*.ts`) |
| Language ID | `typescript` |

**Workspace Folders 탭** (선택)
- `rootType: SOURCE_ROOTS` 또는 `markers: ["tsconfig.json"]` → 단일 저장소에 여러 SWC 프로젝트가 있을 때 서버가 스캔할 범위를 좁힐 수 있습니다.

### 3. 검증
- SWC 마커(`{{ }}`, `{{= }}`, `{{@ }}`, `@var@`, `ea:` 등)가 있는 `.ts` 파일을 엽니다.
- `View → Tool Windows → LSP Console`에서 서버 상태 확인.
- 동작 확인:
  - `swc-on-` 입력 → 이벤트 자동완성
  - `{{= ` 입력 → `$host`/`$appHost` 완성
  - `{{=` 미닫힘 → 에디터에 진단 표시

### 자주 발생하는 문제

| 증상 | 원인/해결 |
|---|---|
| 서버가 즉시 종료됨 | 커맨드에 `--stdio` 누락 |
| 완성/진단 안 뜸 | Mappings에 TypeScript 파일타입 누락 |
| Node 모듈 못 찾음 | `pnpm build` 전에 `pnpm install` 실행했는지 확인 |
| 명령이 실행 안 됨 | 커맨드 경로에 `$PROJECT_DIR$` 매크로 사용, 혹은 절대경로로 대체 |

### 서버 실행 파일 위치
```
lsp/out/server/server.js    ← VSCode 확장과 IntelliJ가 공유
```
빌드만 다시 하면(`pnpm build`) 두 편집기 모두 즉시 최신 서버를 씁니다.