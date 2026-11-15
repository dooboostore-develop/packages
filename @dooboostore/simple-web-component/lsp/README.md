# SWC Language Server (`swc-lsp`)

Language server for [Simple Web Component](https://github.com/dooboostore-develop/packages/tree/main/%40dooboostore/simple-web-component) templates — the HTML you return from `@onConnectedBody*` / `@innerHtml` …, inside `.ts` / `.js` strings, and in `.html` files.

It runs next to your normal TypeScript support and only answers inside SWC templates.

---

## What you get

```ts
export default (w: Window) => {
  const tag = 'demo-click';

  @elementDefine(tag, { window: w })
  class DemoClick extends w.HTMLElement {
    @state('user') profile = { name: 'kim' };
    tt(a: string) { return a; }

    @onConnectedBodyShadow
    render() {
      return `
        <demo-clock></demo-clock>                       ← tag completion · hover · go to definition
        <!--[[ items ]]-->                              ← @appendHtmlSlot('items') completes / jumps here
        <span>@user.name@</span>                        ← @state / members: completion · hover · definition
        <button swc-on-click="$host.tt(4)">             ← $host = DemoClick: completion · definition · parameter hints
                                                          type error: 4 is not a string
        <input swc-on-input="this.value.trim()">        ← this = HTMLInputElement
        <a title="{{= $appHost.router }}">              ← $appHost / $w / $d / $q … typed from SWC
      `;
    }
  }
  return tag;
};
```

| Where | Feature |
|---|---|
| `<…` | tags from every `@elementDefine` in the workspace (literal or `const tag = '…'` factory pattern). Customized built-ins (`extends: 'button'`) complete in `is="…"` |
| inside a tag | that element's attributes (`@attribute`, `@changedAttribute`, `observedAttributes`), `a::` `p::` `e::<event>`, `swc-on-*` |
| `@x@` | `@state` names and members of the component |
| `swc-on-*="…"`, `{{= … }}` | `$host` `$appHost` `$w` `$d` `$q` `$qa` `$qi` `$el` … (`$event` `$data` `$detail` in event scripts) |
| after `.` | members by real type — `$host.` is the component itself, `$appHost.` is `SwcAppInterface`, `@user.` is the state's type |
| `@appendHtmlSlot('…')` … | slot ids from `<!--[[ id ]]-->` in the same component |
| hover · go to definition · parameter hints | tags → class, `@x@` / `$host.x` → member, slot → `<!--[[ id ]]-->`, calls in scripts |
| errors | type errors in `swc-on-*` / `{{= }}` / `@x@`, the same tag defined twice in one package |
| coloring | `@x@`, `a::` `e::` `p::`, `swc-on-*` (value as JS), `{{= }}`, `<!--[[ ]]-->`, `<!--[html/text ]-->` — VS Code extension only |

Nothing is reported as "missing" (slots, selectors, message names, routes) — those can be created at runtime.

Types come from your project: the server reads the nearest `tsconfig.json` (and the files it includes, so global `.d.ts` augmentations such as `interface Window { HTMLElement … }` apply).

---

## Install

It ships inside `@dooboostore/simple-web-component` — if your project uses SWC, you already have it:

```sh
npm i @dooboostore/simple-web-component   # provides the `swc-lsp` command
npx swc-lsp --stdio                       # what editors run
```

- Ships its own TypeScript 6 compiler API, so it works whatever `typescript` your project uses — 5, 6 or 7 (TypeScript 7 is written in Go and has no JavaScript API). It still reads your `tsconfig.json`.
- Node.js 18+.
- The server version always matches the library version in your project.
- Not part of your app bundle: the library build (`dist/`) does not contain it, and nothing imports it.

Server path inside your project (needed by some editors):

```
node_modules/@dooboostore/simple-web-component/lsp/bin/swc-lsp.js
```

---

## Editor setup

### IntelliJ IDEA / WebStorm

Install **Simple Web Component** from the [JetBrains Marketplace](https://plugins.jetbrains.com/search?search=Simple%20Web%20Component) — **Settings → Plugins → Marketplace**, search "Simple Web Component". Needs 2026.1+ with the LSP API (IntelliJ IDEA, WebStorm, …).

Open your project — the plugin starts the server inside `node_modules/@dooboostore/simple-web-component` with the Node.js from **Settings → Languages & Frameworks → Node.js** (or `node` on `PATH`). A `{}` widget in the status bar shows it running; restart it from there after updating `@dooboostore/simple-web-component`.

Besides what the IDE's LSP client does (completion, hover, errors), the plugin handles what that client skips inside template strings — IntelliJ treats them as *injected HTML*:

| Action | Key (macOS) |
|---|---|
| go to definition | Cmd+Click / `Cmd+B` |
| go back | `Cmd+[` |
| parameter info | `Cmd+P` |
| quick documentation (hover) | `F1` |

plus SWC syntax coloring. If you had added `swc` under **Settings → Languages & Frameworks → Language Servers** by hand, remove it — otherwise two servers answer.

### VS Code

VS Code has no "add a language server" setting — it needs an extension, which also adds the coloring.

1. Install **Simple Web Component** (`dooboostore.simple-web-component-lsp`) from the [Marketplace](https://marketplace.visualstudio.com/items?itemName=dooboostore.simple-web-component-lsp) — or search it in the Extensions panel, or `code --install-extension dooboostore.simple-web-component-lsp`.
2. Open your project. The extension uses the server inside `node_modules/@dooboostore/simple-web-component` (1.0.56+), so the language server always matches your library version. The first line of the **Simple Web Component** output channel shows which server it started.

The extension looks for the server in: the `swc.serverPath` setting → `node_modules` of the workspace folder and its parents → any nested `node_modules` (monorepos).

| Action | Key (macOS) |
|---|---|
| go to definition | `F12` / Cmd+Click |
| go back | `Ctrl+-` |
| parameter hints | `Cmd+Shift+Space` |
| show hover | `Cmd+K Cmd+I` |

All features work in VS Code.

### Neovim (0.11+)

```lua
vim.lsp.config('swc', {
  cmd = { 'npx', 'swc-lsp', '--stdio' },   -- runs the one in the project's node_modules
  filetypes = { 'typescript', 'javascript', 'html' },
  root_markers = { 'tsconfig.json', 'package.json', '.git' },
})
vim.lsp.enable('swc')
```

It runs alongside `ts_ls`.

### Other editors

Any LSP client works: command `npx swc-lsp --stdio` (from the project root), languages TypeScript / JavaScript / HTML. (Tested: VS Code, IntelliJ IDEA 2026.3.)

---

## Troubleshooting

| Symptom | Check |
|---|---|
| nothing happens | is the server running? (IntelliJ: `{}` widget · VS Code: Output → *Simple Web Component*) |
| `$host.` shows only HTMLElement members | the template must be returned from inside the `@elementDefine` class |
| first `.` completion is slow (~1s) | the project's types are loading; later requests take a few ms |
| want to see what the editor asks | set env `SWC_LSP_LOG=/tmp/swc-lsp.log` on the server — every request is appended there |

---

## Development

```sh
pnpm build        # out/server/server.js (+ the bundled TypeScript's lib.*.d.ts)
pnpm test         # analyzer + type tests
pnpm typecheck

pnpm package:vsix      # plugins/vscode/simple-web-component-lsp-<version>.vsix → VS Code Marketplace
pnpm package:intellij  # plugins/intellij/build/distributions/*.zip → JetBrains Marketplace
```

Neither plugin contains the server — both start the one in the project's `node_modules`, so it always matches the library version.

Run the VS Code extension from source: `code --extensionDevelopmentPath="$PWD/plugins/vscode" /path/to/project` (after `pnpm build` in both; **Developer: Reload Window** to pick up rebuilds). IntelliJ: `./gradlew runIde` in `plugins/intellij`.

- `src/server/analyzer.ts` — templates, components, cursor context (syntax only, no types)
- `src/server/typeService.ts` — TypeScript LanguageService over a virtual copy of the file with a probe method inserted into the component class, so `$host` is typed as `this`
- `src/server/server.ts` — LSP wiring
- `plugins/vscode` — VS Code client + coloring (`syntaxes/`)
- `plugins/intellij` — IntelliJ plugin: starts the server, go to definition / parameter info inside injected HTML, coloring

Released with `@dooboostore/simple-web-component` — its `build` builds `lsp/` too, and its `files` include `lsp/bin`, `lsp/out/server/server.js` and `lsp/package.json` (keeps `lsp/` CommonJS inside the ESM package).

## License

MIT
