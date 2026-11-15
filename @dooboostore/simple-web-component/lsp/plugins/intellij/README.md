# Simple Web Component — IntelliJ plugin

JetBrains plugin for [`swc-lsp`](../../README.md). It does not contain the server: it starts
`node_modules/@dooboostore/simple-web-component/lsp/out/server/server.js` from the opened project
(Node.js from **Settings → Node.js**, else `node` on `PATH`).

| File | Does |
|---|---|
| `SwcLsp.kt` | `LspIntegrationProvider` + descriptor: finds the server, starts it for `.ts/.js/.html` files |
| `SwcGotoDeclarationHandler.kt` | Cmd+Click inside template strings (injected HTML) — maps to the host `.ts` position and asks the server |
| `SwcParameterInfoHandler.kt` | Cmd+P inside template strings, the same way |
| `SwcAnnotator.kt` | SWC coloring — same rules as `../vscode/syntaxes/swc.injection.json` |

```sh
./gradlew buildPlugin   # build/distributions/simple-web-component-intellij-<version>.zip
./gradlew verifyPlugin  # JetBrains Plugin Verifier against the installed IDE
./gradlew runIde        # sandbox IDE with the plugin
```

Builds against `/Applications/IntelliJ IDEA.app` when present (else downloads 2026.3). JDK 21 toolchain.

Release: bump `version` in `build.gradle.kts` → `./gradlew buildPlugin` → upload the zip on
https://plugins.jetbrains.com (first time: **Upload plugin**; later: the plugin page → **Upload Update**).
