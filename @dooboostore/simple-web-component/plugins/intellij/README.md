# SWC IntelliJ Plugin (Official LSP API)

Simple Web Component 템플릿 문법(`{{...}}`, `@bind@`, `swc-on:*`, `ea:`, 예약 `$`변수)을
TypeScript backtick template 문자열 안에서 지원하는 IntelliJ 플러그인입니다.

JetBrains **공식 LSP Client API**(`com.intellij.platform.lsp`)를 사용합니다.
기존에 작성한 LSP 서버(`lsp/out/server/server.js`)를 그대로 재사용하므로, VSCode 확장과 동일한
기능(자동완성, 정의 이동, semantic highlight)을 IntelliJ에서 얻습니다.

> 공식 LSP API는 상업용 IDE(IDEA Ultimate, WebStorm 등)에서만 사용 가능합니다.
> IntelliJ IDEA 오픈소스 빌드와 Android Studio에서는 동작하지 않습니다.

## 구조

```
plugins/intellij/
├── settings.gradle.kts          # Gradle + IntelliJ platform 저장소 설정
├── build.gradle.kts             # IntelliJ 2026.2 대상 플러그인 빌드
├── gradle.properties            # IDE: IntelliJ 내장 JBR 25 toolchain
├── gradle/wrapper/              # gradlew
└── src/main/
    ├── kotlin/io/dooboostore/swc/lsp/
    │   ├── SwcLspIntegrationProvider.kt  # EP 구현, 파일 열기 시 클라이언트 기동
    │   └── SwcLspClientDescriptor.kt     # 지원 파일 판단 + server.js 실행 명령
    └── resources/META-INF/
        └── plugin.xml          # EP 등록 및 com.intellij.modules.lsp 의존성
```

## 요구사항

- JDK 25 — IntelliJ 내장 JBR 25를 toolchain으로 자동 사용
- `node` — 실행 바이너리 (환경변수 `SWC_LSP_NODE`로 오버라이드 가능)
- 상업용 IntelliJ 기반 IDE로 `runIde` 실행

## 빌드

```bash
./gradlew build
# 결과: build/distributions/swc-intellij-0.0.1.zip
```

## 실행 (runIde)

`runIde` 태스크는 임시 IntelliJ 인스턴스로 IDE를 띄우고, `-Dswc.lsp.server=<절대 경로>`를
`../lsp/out/server/server.js`로 자동 주입합니다. LSP 서버를 먼저 컴파일하세요.

```bash
# 1) LSP 서버 빌드
( cd ../lsp && npm run build )

# 2) IDE 실행
./gradlew runIde
```

실행된 IDE에서 `.ts` 파일(예: `apps/center/src/pages/...`)을 열면 상태 표시줄 오른쪽에
"Simple Web Component" 언어 서비스 위젯이 나타나고, backtick 안에서 자동완성 / semantic
highlight / 정의 이동이 동작합니다.

## 수동 배치 (옵션)

```bash
./gradlew buildPlugin
# build/distributions/swc-intellij-0.0.1.zip
```
`Preferences | Plugins | ⚙ | Install Plugin from Disk...` 로 설치합니다.
`swc.lsp.server` 시스템 속성이 없으면 체크아웃 루트(`lsp/out/server/server.js`)를 자동 탐색합니다.

## 로그

LSP 통신 로그를 보려면 `Help | Diagnostic Tools | Debug Log Settings...`에 아래 추가:

```
#com.intellij.platform.lsp
```

## 참고

- 공식 문서: https://plugins.jetbrains.com/docs/intellij/language-server-protocol.html
- LSP API 클래스 리네임(`LspServerSupportProvider` → `LspIntegrationProvider`)은 2026.1.4부터 적용됩니다.