# SWC Language Server (`swc-lsp`)

Language server for [Simple Web Component](../README.md) templates — the HTML you return from `@onConnectedBody*` / `@innerHtml` …, inside `.ts` / `.js` strings, and in `.html` files.

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

- Uses **your project's `typescript`** (optional peer dependency — install it if you write components in TypeScript, which you almost certainly do).
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

Versions that have **Settings → Languages & Frameworks → Language Servers** (tested on 2026.3).

**Settings → Languages & Frameworks → Language Servers → `+`**

| Field | Value |
|---|---|
| Name | `swc` |
| Communication channel | `stdio` |
| Executable path | absolute path to `node` (`which node`) — the IDE often does not see your shell `PATH` |
| Arguments | `<project>/node_modules/@dooboostore/simple-web-component/lsp/bin/swc-lsp.js --stdio` |
| File name patterns | `*.ts`, `*.html` (add `*.js` if you write components in JS) |

A `{}` widget appears in the status bar when the server is running; restart it from there after updating `@dooboostore/simple-web-component`.

**Known limits in IntelliJ:** IntelliJ treats HTML inside template strings as *injected HTML*, and its built-in LSP client does not navigate there:

| | IntelliJ |
|---|---|
| completion, hover (`F1` / `Ctrl+J`), errors | ✅ |
| Cmd+Click / go to definition inside templates | ❌ (the server answers; the IDE does not jump) |
| parameter hints (`Cmd+P`) inside templates | ❌ |
| coloring | ❌ |

Use VS Code for those, or wait for the IntelliJ plugin.

### VS Code

VS Code has no "add a language server" setting — it needs an extension, which also adds the coloring. Until the extension is published, run it from source:

```sh
git clone https://github.com/dooboostore-develop/packages.git
cd packages && pnpm install
cd @dooboostore/simple-web-component/lsp && pnpm build
code --extensionDevelopmentPath="$PWD" /path/to/your/project
```

After pulling changes: `pnpm build`, then **Developer: Reload Window** in that window.

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
pnpm build        # out/server/server.js, out/client/extension.js
pnpm test         # analyzer + type tests
pnpm typecheck
```

- `src/server/analyzer.ts` — templates, components, cursor context (syntax only, no types)
- `src/server/typeService.ts` — TypeScript LanguageService over a virtual copy of the file with a probe method inserted into the component class, so `$host` is typed as `this`
- `src/server/server.ts` — LSP wiring
- `src/client/extension.ts` + `syntaxes/` — VS Code client and coloring

Released with `@dooboostore/simple-web-component` — its `build` builds `lsp/` too, and its `files` include `lsp/bin`, `lsp/out/server/server.js` and `lsp/package.json` (keeps `lsp/` CommonJS inside the ESM package).

## License

MIT
