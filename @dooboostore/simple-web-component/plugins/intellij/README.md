# SWC IntelliJ Plugin (Official LSP API)

An IntelliJ plugin that supports Simple Web Component template syntax (`{{...}}`, `@var@`, `swc-on-*`, `ea:`, reserved `$` variables)
inside TypeScript backtick template strings.

It uses the JetBrains **official LSP Client API** (`com.intellij.platform.lsp`) and reuses the existing
LSP server (`lsp/out/server/server.js`), so IntelliJ gets the same features as the VSCode extension
(completion, go-to-definition, semantic highlighting).

> The official LSP API is only available in commercial IDEs (IDEA Ultimate, WebStorm, ...).
> It does not work in the IntelliJ IDEA open-source build or Android Studio.

## Structure

```
plugins/intellij/
├── settings.gradle.kts          # Gradle + plugin repositories (rootProject: swc-intellij)
├── build.gradle.kts             # Plugin build targeting IntelliJ 2026.2 (sinceBuild 262)
├── gradle.properties            # Toolchain: IntelliJ's bundled JBR
├── gradlew, gradlew.bat         # Gradle wrapper scripts
└── src/main/
    ├── kotlin/io/dooboostore/swc/lsp/
    │   ├── SwcLspIntegrationProvider.kt   # EP implementation, starts the client when a .ts file opens
    │   ├── SwcLspClientDescriptor.kt      # Supported files (ts/mts/cts/tsx) + server.js command line
    │   ├── SwcCompletionCustomizer.kt     # Disables IDE-side prefix filtering; the server matches
    │   ├── SwcSemanticTokensCustomizer.kt # Maps server semantic tokens to text attributes
    │   ├── SwcHighlightingListener.kt     # Paints SWC markers over the template-string color
    │   └── SwcServerPath.kt               # Resolves the server output dir
    └── resources/META-INF/
        └── plugin.xml          # EP registration + com.intellij.modules.lsp / JavaScript dependencies
```

## Requirements

- JDK 25 — IntelliJ's bundled JBR is used as the toolchain (`org.gradle.java.installations.paths` in `gradle.properties`)
- `node` — server runtime (override with the `SWC_LSP_NODE` env var)
- A commercial IntelliJ-based IDE for `runIde`

## Build

```bash
./gradlew build
# Output: build/distributions/swc-intellij-0.0.1.zip
```

## Run (runIde)

`runIde` launches a sandbox IDE and injects `-Dswc.lsp.server=<absolute path>` pointing at
`../../lsp/out/server/server.js` (only if that file exists). Compile the LSP server first.

```bash
# 1) Build the LSP server
( cd ../../lsp && pnpm run build )

# 2) Launch the IDE
./gradlew runIde
```

Open a `.ts` file with SWC templates in the launched IDE: a "Simple Web Component" language-service
widget appears on the right of the status bar, and completion / semantic highlighting /
go-to-definition work inside backticks.

## Manual Install (optional)

```bash
./gradlew buildPlugin
# build/distributions/swc-intellij-0.0.1.zip
```
Install via `Preferences | Plugins | ⚙ | Install Plugin from Disk...`.
Without the `swc.lsp.server` system property, the plugin walks up from the working directory to the checkout
containing `lsp/src/server/server.ts` and uses its `lsp/out/server/server.js`.

## Logs

To see LSP traffic, add this to `Help | Diagnostic Tools | Debug Log Settings...`:

```
#com.intellij.platform.lsp
```

## References

- Official docs: https://plugins.jetbrains.com/docs/intellij/language-server-protocol.html
- The LSP API class rename (`LspServerSupportProvider` → `LspIntegrationProvider`) applies from 2026.1.4.
