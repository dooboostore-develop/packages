// `.` 뒤 멤버 완성 — TS LanguageService 로 실제 타입을 본다.
// 템플릿 소유 클래스가 있으면 그 클래스 안에 probe 메서드를 끼운 가상 파일을 만든다:
//   $host 는 "자기를 감싼 가장 가까운 SWC 컴포넌트" = 템플릿을 반환한 그 클래스 → 파라미터 타입을 `this` 로 두면 정확하다
//   (팩토리 함수 안의 클래스라 이름으로는 못 가리키지만 `this` 는 된다)
import * as ts from 'typescript';
import path from 'node:path';
import { statSync } from 'node:fs';
import { CompletionItem, CompletionItemKind, SignatureHelp } from 'vscode-languageserver';
import type { Component, Probe, Script, ScriptRegion } from './analyzer';

const SWC_MODULE = '@dooboostore/simple-web-component';
const PROBE = '__swc_probe__';
// swc-on-* / {{= }} 스크립트의 this 는 그 요소다 (FunctionUtils.execute context: el) — 컴포넌트가 아니다
// this 타입은 태그로: <input> → HTMLInputElement, 모르는 태그(SWC 컴포넌트 등) → HTMLElement
const elementOpen = (tag: string) => `(function (this: HTMLElementTagNameMap extends { ${JSON.stringify(tag.toLowerCase())}: infer E } ? E : HTMLElement) {\n`;
const ELEMENT_CLOSE = '\n});';

/** swc-on-* / {{= }} 에서 쓸 수 있는 변수 (elementDefine.ts _executeSwcScript / __swc_executeAttributeEvent) */
function params(host: string, swc: boolean) {
  // 패키지를 찾을 수 있으면 실제 HelperHostSet 타입, 아니면(예: 패키지 밖 .html) DOM 타입
  const t = (key: string, fallback: string) => (swc ? `import('${SWC_MODULE}').HelperHostSet['${key}']` : fallback);
  return [
    `$w: ${t('$w', 'Window')}`,
    `$d: ${t('$d', 'Document')}`,
    `$q: ${t('$q', '(selector: string) => HTMLElement')}`,
    `$qa: ${t('$qa', '(selector: string) => HTMLElement[]')}`,
    `$qi: ${t('$qi', '(id: string) => HTMLElement')}`,
    `$host: ${host}`,
    `$lastHost: ${host}`,
    `$parentHost: HTMLElement`,
    `$firstHost: HTMLElement`,
    `$hosts: HTMLElement[]`,
    `$appHost: ${t('$appHost', 'HTMLElement')}`,
    `$firstAppHost: ${t('$firstAppHost', 'HTMLElement')}`,
    `$lastAppHost: ${t('$lastAppHost', 'HTMLElement')}`,
    `$appHosts: ${t('$appHosts', 'HTMLElement[]')}`,
    '$this: HTMLElement',
    '$el: HTMLElement',
    '$root: Document | ShadowRoot',
    '$event: Event',
    'event: Event',
    '$data: any',
    '$detail: any',
  ].join(', ');
}

/** @x@ 에서 쓰는 이름: 멤버 이름 + @state 이름(→ 해당 필드) */
function locals(owner: Component) {
  const map = new Map<string, string>();
  for (const m of owner.members) map.set(m.name, m.name);
  for (const m of owner.members) if (m.stateName) map.set(m.stateName, m.name);
  const decl = [...map].filter(([n]) => /^[A-Za-z_$][\w$]*$/.test(n)).map(([n, p]) => `${n} = this[${JSON.stringify(p)}]`);
  return decl.length ? `const ${decl.join(', ')};` : '';
}

const KIND: Record<string, CompletionItemKind> = {
  [ts.ScriptElementKind.memberFunctionElement]: CompletionItemKind.Method,
  [ts.ScriptElementKind.functionElement]: CompletionItemKind.Function,
  [ts.ScriptElementKind.memberVariableElement]: CompletionItemKind.Field,
  [ts.ScriptElementKind.memberGetAccessorElement]: CompletionItemKind.Property,
  [ts.ScriptElementKind.memberSetAccessorElement]: CompletionItemKind.Property,
};

// files: tsconfig 의 파일들 — 전역 보강(.d.ts 의 declare global 등)이 들어오게 tsserver 처럼 전부 root 로 둔다
type Project = { ls: ts.LanguageService; options: ts.CompilerOptions; files: string[]; virtual: Map<string, string>; replaced?: string; version: number };

export class TypeService {
  private projects = new Map<string, Project>();

  /** open: 에디터에 열린 문서 (없으면 디스크를 읽는다) */
  constructor(private open: (fileName: string) => { text: string; version: number } | undefined) {}

  complete(fileName: string, text: string, probe: Probe): CompletionItem[] {
    const v = this.prepare(fileName, text, probe);
    const res = v.p.ls.getCompletionsAtPosition(v.name, v.pos, {});
    if (!res?.isMemberCompletion) return [];
    return res.entries
      .filter(e => !e.name.startsWith(PROBE))
      .map(e => ({ label: e.name, kind: KIND[e.kind] ?? CompletionItemKind.Property, sortText: e.sortText, detail: e.kind }));
  }

  /** script.code 의 마지막 식별자의 정의 위치 (원본 파일 기준으로 되돌려서) */
  definition(fileName: string, text: string, script: Script): { fileName: string; start: number; end: number }[] {
    const v = this.prepare(fileName, text, script);
    return (v.p.ls.getDefinitionAtPosition(v.name, v.pos - 1) ?? []).flatMap(d => {
      const start = v.back(d.fileName, d.textSpan.start);
      return start ? [{ fileName: start.fileName, start: start.offset, end: start.offset + d.textSpan.length }] : [];
    });
  }

  /** script.code 의 마지막 식별자의 타입 정보 */
  hover(fileName: string, text: string, script: Script): string | undefined {
    const v = this.prepare(fileName, text, script);
    const info = v.p.ls.getQuickInfoAtPosition(v.name, v.pos - 1);
    if (!info) return;
    const doc = ts.displayPartsToString(info.documentation);
    return '```ts\n' + ts.displayPartsToString(info.displayParts) + '\n```' + (doc ? `\n\n${doc}` : '');
  }

  /** `$host.tt(` 처럼 호출 괄호 안이면 시그니처 (Cmd+P) */
  signature(fileName: string, text: string, script: Script): SignatureHelp | undefined {
    const v = this.prepare(fileName, text, script);
    const help = v.p.ls.getSignatureHelpItems(v.name, v.pos, {});
    if (!help) return;
    const str = ts.displayPartsToString;
    return {
      activeSignature: help.selectedItemIndex,
      activeParameter: help.argumentIndex,
      signatures: help.items.map(item => ({
        label: str(item.prefixDisplayParts) + item.parameters.map(p => str(p.displayParts)).join(str(item.separatorDisplayParts)) + str(item.suffixDisplayParts),
        documentation: str(item.documentation) || undefined,
        parameters: item.parameters.map(p => ({ label: str(p.displayParts), documentation: str(p.documentation) || undefined })),
      })),
    };
  }

  /**
   * 템플릿 속 스크립트들의 타입 에러 (`$host.tt(4)` 에 string 이 와야 하는 등).
   * 소유 클래스마다 probe 메서드 하나에 조각들을 블록/식으로 나열하고, 조각 안에 난 에러만 원본 위치로 되돌린다.
   */
  diagnostics(fileName: string, text: string, regions: ScriptRegion[]): { start: number; end: number; message: string; error: boolean }[] {
    if (!regions.length) return [];
    const p = this.project(fileName);
    const swc = !!ts.resolveModuleName(SWC_MODULE, fileName, p.options, ts.sys).resolvedModule;
    const html = /\.html?$/i.test(fileName);
    const base = html ? 'export {};\n' : text;
    const groups = new Map<Component | undefined, ScriptRegion[]>();
    for (const r of regions) groups.set(r.owner, [...(groups.get(r.owner) ?? []), r]);
    const inserts = [...groups]
      .map(([owner, rs]) => {
        let body = `\nasync ${owner ? '' : 'function '}${PROBE}(${params(owner ? 'this' : 'HTMLElement', swc)}) { ${owner ? locals(owner) : ''}\n`;
        const segs: { at: number; orig: number; len: number }[] = [];
        for (const r of rs) {
          // swc-on-* 은 문장, {{= }} 는 식 — 둘 다 this = 그 요소. @x@ 는 this = 컴포넌트
          body += r.element === undefined ? ';(\n' : elementOpen(r.element) + (r.stmt ? '' : 'return (\n');
          segs.push({ at: body.length, orig: r.start, len: r.code.length });
          body += r.code + (r.element === undefined ? '\n);' : (r.stmt ? '' : '\n);') + ELEMENT_CLOSE) + '\n';
        }
        return { at: owner ? owner.bodyEnd : base.length, body: body + '}\n', segs };
      })
      .sort((a, b) => a.at - b.at);
    let vText = '';
    let last = 0;
    const map: { v: number; orig: number; len: number }[] = [];
    for (const ins of inserts) {
      vText += base.slice(last, ins.at);
      const off = vText.length;
      vText += ins.body;
      last = ins.at;
      for (const s of ins.segs) map.push({ v: off + s.at, orig: s.orig, len: s.len });
    }
    vText += base.slice(last);
    const name = html ? path.join(path.dirname(fileName), `${PROBE}.ts`) : fileName.replace(/\.[^./\\]+$/, '') + `.${PROBE}.ts`;
    this.use(p, name, vText, html ? undefined : path.resolve(fileName));
    return [...p.ls.getSyntacticDiagnostics(name), ...p.ls.getSemanticDiagnostics(name)].flatMap(d => {
      const seg = d.start === undefined ? undefined : map.find(s => d.start! >= s.v && d.start! <= s.v + s.len);
      if (!seg) return [];
      const start = seg.orig + (d.start! - seg.v);
      return [{ start, end: Math.min(start + (d.length ?? 0), seg.orig + seg.len), message: ts.flattenDiagnosticMessageText(d.messageText, '\n'), error: d.category === ts.DiagnosticCategory.Error }];
    });
  }

  /** 같은 가상 파일이면 버전을 올리지 않는다 → TS 가 프로그램·타입 검사를 재사용 (IntelliJ 는 Cmd 누른 동안 같은 요청을 연달아 보낸다) */
  private use(p: Project, name: string, vText: string, replaced: string | undefined) {
    if (p.virtual.get(name) === vText) return;
    p.virtual.clear();
    p.replaced = replaced; // 원본은 빼고 가상 사본만
    p.virtual.set(name, vText);
    p.version++;
  }

  /**
   * 가상 파일을 만든다. 소유 클래스가 있으면 원본 사본의 클래스 끝에 probe 메서드를 끼운다.
   * back(): 가상 파일 위치 → 원본 위치 (probe 메서드 안이면 undefined)
   */
  private prepare(fileName: string, text: string, script: Script) {
    const p = this.project(fileName);
    const swc = !!ts.resolveModuleName(SWC_MODULE, fileName, p.options, ts.sys).resolvedModule;
    let name: string;
    let vText: string;
    let pos: number;
    let back: (f: string, offset: number) => { fileName: string; offset: number } | undefined;
    if (script.owner) {
      const at = script.owner.bodyEnd;
      name = fileName.replace(/\.[^./\\]+$/, '') + `.${PROBE}.ts`;
      const head = `\n${PROBE}(${params('this', swc)}) { ${locals(script.owner)}\n${script.element !== undefined ? elementOpen(script.element) : ''}${script.code}`;
      const tail = (script.element !== undefined ? ELEMENT_CLOSE : '') + '\n}';
      const inserted = head.length + tail.length;
      vText = text.slice(0, at) + head + tail + text.slice(at);
      pos = at + head.length;
      back = (f, o) => (f !== name ? { fileName: f, offset: o } : o < at ? { fileName, offset: o } : o >= at + inserted ? { fileName, offset: o - inserted } : undefined);
    } else {
      name = path.join(path.dirname(fileName), `${PROBE}.ts`);
      const head = `export {};\nfunction ${PROBE}(${params('HTMLElement', swc)}) {\n${script.element !== undefined ? elementOpen(script.element) : ''}${script.code}`;
      vText = head + (script.element !== undefined ? ELEMENT_CLOSE : '') + '\n}';
      pos = head.length;
      back = (f, o) => (f !== name ? { fileName: f, offset: o } : undefined);
    }
    this.use(p, name, vText, script.owner ? path.resolve(fileName) : undefined);
    return { p, name, pos, back };
  }

  /** tsconfig 하나당 LanguageService 하나 (없으면 기본 옵션) */
  private project(fileName: string): Project {
    const config = ts.findConfigFile(path.dirname(fileName), ts.sys.fileExists) ?? '';
    const cached = this.projects.get(config);
    if (cached) return cached;
    const parsed = config ? ts.getParsedCommandLineOfConfigFile(config, {}, { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => {} }) : undefined;
    // 완성만 쓰므로 null 검사는 끈다 — `$q('x').` 처럼 nullable 에서도 멤버가 그냥 나오게
    const options: ts.CompilerOptions = { target: ts.ScriptTarget.ES2022, experimentalDecorators: true, ...parsed?.options, strict: false, strictNullChecks: false, noEmit: true };
    const p: Project = { options, files: (parsed?.fileNames ?? []).map(f => path.resolve(f)), virtual: new Map(), version: 0 } as Project;
    const read = (f: string) => p.virtual.get(f) ?? this.open(f)?.text ?? ts.sys.readFile(f);
    const host: ts.LanguageServiceHost = {
      getScriptFileNames: () => [...p.files.filter(f => f !== p.replaced), ...p.virtual.keys()],
      getScriptVersion: f => {
        if (p.virtual.has(f)) return String(p.version);
        const doc = this.open(f);
        if (doc) return `open:${doc.version}`;
        try {
          return String(statSync(f).mtimeMs);
        } catch {
          return '0';
        }
      },
      getScriptSnapshot: f => {
        const t = read(f);
        return t === undefined ? undefined : ts.ScriptSnapshot.fromString(t);
      },
      getCurrentDirectory: () => (config ? path.dirname(config) : path.dirname(fileName)),
      getCompilationSettings: () => options,
      getDefaultLibFileName: o => ts.getDefaultLibFilePath(o),
      fileExists: f => p.virtual.has(f) || ts.sys.fileExists(f),
      readFile: read,
      readDirectory: ts.sys.readDirectory,
      directoryExists: ts.sys.directoryExists,
      getDirectories: ts.sys.getDirectories,
    };
    p.ls = ts.createLanguageService(host, ts.createDocumentRegistry());
    this.projects.set(config, p);
    return p;
  }
}
