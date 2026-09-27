# Simple Web Component LSP — Running in VSCode (Debug)

This LSP is one server plus clients: a VSCode extension client, and (optionally) IntelliJ via LSP4IJ.
Below is how to **load the extension in VSCode with F5** and check SWC template completion, highlighting and go-to-definition.

## Requirements

- Node.js (with `pnpm install` done at the repo root)
- VSCode

## Steps

### 1. Open the LSP folder as the workspace
F5 uses the workspace's `.vscode/launch.json`, so **open this folder as the workspace**:

```
packages/@dooboostore/simple-web-component/lsp
```

e.g.
```sh
code packages/@dooboostore/simple-web-component/lsp
```

> `.vscode/` is not committed. If it is missing, add an `extensionHost` launch config
> (e.g. name `"Run SWC LSP Extension"`, `args: ["--extensionDevelopmentPath=${workspaceFolder}"]`,
> `preLaunchTask: "npm: compile"`), or pick **"VS Code Extension Development"** when VSCode offers it.

### 2. Build
```sh
pnpm run build   # tsc -p . → out/
```
If the launch config runs `npm: compile` (tsc) as its `preLaunchTask`, **F5 builds and runs in one go**.

### 3. Start debugging (F5)
- Open **Run and Debug** (`Ctrl+Shift+D`)
- Select the launch profile
- Press **F5**

A new **Extension Development Host** VSCode window opens with the extension loaded.

### 4. Open a target project in that window
- In the Extension Development Host window: `File → Open Folder → <a project using SWC templates>`
- Open a `.ts`/`.js` file with SWC template markup and check the syntax features.

> The original window does not load the extension. **Always check in the window opened by F5.**

## What you can check
| Feature | Input example |
|------|-----------|
| State/attribute/property variable completion | `{{ @a` → `@aa@` |
| Member completion | `{{ @aa@.` → `toString`, `toFixed`, ... (by declared TS type) |
| Reserved variable completion | `{{ $` → `$host`, `$appHost`, `$this`, ... |
| Expression snippets | `{{`, `{{=`, `{{@` |
| `ea:` marker snippets | `ea:` → `ea:${id}:start:html`, ... |
| SWC highlighting | `{{ }}` (keyword), `@aa@` (variable), `swc-on-*` (function), `ea:` (macro) |
| Hover | expressions, `$` variables, `@var@`, `ea:` markers, `swc-on-*` |
| Diagnostics | e.g. an unclosed `{{=` |
| Go to definition | Cmd+Click on `@aa@` → `@state('aa')` / `@attribute('aa')` |

## Debugging tips
- Extension logs: in the dev host window, **Output** tab → select `Simple Web Component LSP` (trace goes to `SWC LSP Trace`)
- Verbose LSP trace — put this in the dev host window's `settings.json`:
  ```json
  "simpleWebComponentLsp.trace.server": "verbose"
  ```

## IntelliJ Support (LSP4IJ)

IntelliJ uses **the same LSP server** (`out/server/server.js`) as the VSCode extension.
LSP is "one server, many clients", so you only register a client on the IntelliJ side.

> ⚠️ **Known limitation**: LSP4IJ does **not forward** the `.`, `@`, `$` completion triggers to the server, so completion does not work
> (diagnostics, highlighting and hover do). For real completion, use the dedicated IntelliJ plugin (`../plugins/intellij`).

### Requirements
- IntelliJ IDEA 2024.2+
- Node.js (to run the LSP server)
- Built server: `cd packages/@dooboostore/simple-web-component/lsp && pnpm install && pnpm build`

### 1. Install the LSP4IJ plugin
`Settings → Plugins → Marketplace` → search **LSP4IJ** → Install → restart the IDE
(by Red Hat, public on the JetBrains Marketplace)

### 2. Register the language server
`Settings → Languages & Frameworks → Language Servers` → click `+`:

**Command**
```
node $PROJECT_DIR$/packages/@dooboostore/simple-web-component/lsp/out/server/server.js --stdio
```
- `$PROJECT_DIR$` is a macro, substituted per project.
- **Note**: the server requires the `--stdio` argument
  (without it you get `Connection input stream is not set`).

**Mappings tab**

| Field | Value |
|---|---|
| File type | TypeScript (`*.ts`) |
| Language ID | `typescript` |

**Workspace Folders tab** (optional)
- `rootType: SOURCE_ROOTS` or `markers: ["tsconfig.json"]` → narrows the scan scope when one repo has several SWC projects.

### 3. Verify
- Open a `.ts` file with SWC markers (`{{ }}`, `{{= }}`, `{{@ }}`, `@var@`, `ea:`, ...).
- Check the server state in `View → Tool Windows → LSP Console`.
- Check that highlighting, hover and diagnostics (e.g. an unclosed `{{=`) appear.

### Troubleshooting

| Symptom | Cause / Fix |
|---|---|
| Server exits immediately | `--stdio` missing from the command |
| No diagnostics/highlighting | TypeScript file type missing in Mappings |
| Node module not found | Run `pnpm install` before `pnpm build` |
| Command does not run | Use the `$PROJECT_DIR$` macro in the path, or an absolute path |

### Server executable
```
lsp/out/server/server.js    ← shared by the VSCode extension and IntelliJ
```
Rebuild (`pnpm build`) and both editors pick up the latest server.
