// SWC language server — `node out/server/server.js --stdio` (IntelliJ) / ipc (VS Code client)
import { CancellationToken, createConnection, DiagnosticSeverity, FileChangeType, ProposedFeatures, TextDocuments, TextDocumentSyncKind } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { appendFileSync, existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { complete, definition, diagnostics, hover, Index, probeAt, scriptAt, scriptsIn, Span, symbolAt } from './analyzer';
import { TypeService } from './typeService';

const connection = createConnection(ProposedFeatures.all);
const documents = new TextDocuments(TextDocument);
const index = new Index();
const types = new TypeService(fileName => {
  const doc = documents.get(pathToFileURL(fileName).href);
  return doc && { text: doc.getText(), version: doc.version };
});
const SOURCE = /\.[cm]?[jt]sx?$/;
const SKIP_DIRS = new Set(['node_modules', 'dist', 'out', 'build', 'coverage']);
let roots: string[] = [];
let linkSupport = false;

// 닫힌 파일은 디스크 내용으로. 컴포넌트를 정의하지 않는 파일은 인덱스에 둘 필요가 없다 (열린 파일은 항상 분석)
const indexFromDisk = (file: string) => {
  const uri = pathToFileURL(file).href;
  try {
    const text = readFileSync(file, 'utf8');
    if (text.includes('elementDefine')) index.set(uri, text);
    else index.delete(uri);
  } catch {
    index.delete(uri);
  }
};

const walk = (dir: string, out: string[]) => {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    if (e.name.startsWith('.') || SKIP_DIRS.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (SOURCE.test(e.name) && !e.name.endsWith('.d.ts')) out.push(p);
  }
};

// 가장 가까운 package.json 디렉토리 = 앱 단위 (예제 앱끼리의 같은 태그는 중복이 아니다)
const pkgCache = new Map<string, string>();
const pkgRoot = (uri: string) => {
  const start = path.dirname(fileURLToPath(uri));
  let dir = pkgCache.get(start);
  if (dir) return dir;
  dir = start;
  while (!existsSync(path.join(dir, 'package.json')) && path.dirname(dir) !== dir) dir = path.dirname(dir);
  pkgCache.set(start, dir);
  return dir;
};

// SWC_LSP_LOG=/path/to/file — 클라이언트가 실제로 어떤 요청을 보내는지 확인용
const trace = (msg: string) => process.env.SWC_LSP_LOG && appendFileSync(process.env.SWC_LSP_LOG, `${new Date().toISOString()} ${msg}\n`);

// 정의 대상은 닫힌 파일·lib .d.ts 일 수 있다 → 인덱스, 없으면 디스크
// 한 틱 양보해서 뒤에 쌓인 $/cancelRequest 를 먼저 받는다 — 취소된 요청은 TS 분석 없이 버린다
const cancelled = async (token: CancellationToken) => {
  await new Promise(r => setImmediate(r));
  return token.isCancellationRequested;
};

const docOf = (uri: string) => {
  const open = documents.get(uri);
  if (open) return open;
  let text = index.files.get(uri)?.text;
  if (text === undefined) {
    try {
      text = readFileSync(fileURLToPath(uri), 'utf8');
    } catch {
      text = '';
    }
  }
  return TextDocument.create(uri, 'typescript', 0, text);
};
const rangeOf = (doc: TextDocument, s: Span) => ({ start: doc.positionAt(s.start), end: doc.positionAt(s.end) });

// 템플릿 속 스크립트 타입 에러 — TS 검사라 무거우니 입력이 멈춘 뒤(300ms) 그 문서만 다시 본다
const typeProblems = new Map<string, { start: number; end: number; message: string; error: boolean }[]>();
const typeTimers = new Map<string, ReturnType<typeof setTimeout>>();
const checkTypesLater = (doc: TextDocument) => {
  clearTimeout(typeTimers.get(doc.uri));
  typeTimers.set(
    doc.uri,
    setTimeout(() => {
      const current = documents.get(doc.uri);
      const info = index.files.get(doc.uri);
      if (!current || !info) return;
      try {
        typeProblems.set(doc.uri, types.diagnostics(fileURLToPath(doc.uri), current.getText(), scriptsIn(info)));
      } catch (e) {
        trace(`type diagnostics failed: ${e}`);
      }
      validate(current);
    }, 300)
  );
};

const validate = (doc: TextDocument) =>
  connection.sendDiagnostics({
    uri: doc.uri,
    diagnostics: [
      ...diagnostics(index, doc.uri, (a, b) => pkgRoot(a) === pkgRoot(b)).map(p => ({
        range: rangeOf(doc, p),
        severity: p.severity === 'error' ? DiagnosticSeverity.Error : DiagnosticSeverity.Warning,
        source: 'swc',
        message: p.message,
      })),
      ...(typeProblems.get(doc.uri) ?? []).map(p => ({
        range: rangeOf(doc, p),
        severity: p.error ? DiagnosticSeverity.Error : DiagnosticSeverity.Warning,
        source: 'swc',
        message: p.message,
      })),
    ],
  });
const validateAll = () => documents.all().forEach(validate);

connection.onInitialize(params => {
  linkSupport = !!params.capabilities.textDocument?.definition?.linkSupport;
  trace(`initialize client=${params.clientInfo?.name} definition=${JSON.stringify(params.capabilities.textDocument?.definition)} hover=${!!params.capabilities.textDocument?.hover}`);
  roots = (params.workspaceFolders?.map(f => f.uri) ?? (params.rootUri ? [params.rootUri] : [])).map(u => fileURLToPath(u));
  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      completionProvider: { triggerCharacters: ['<', '@', '$', ':', '-', '"', "'", ' '] },
      hoverProvider: true,
      definitionProvider: true,
      signatureHelpProvider: { triggerCharacters: ['(', ','] },
    },
  };
});

connection.onInitialized(() => {
  const files: string[] = [];
  roots.forEach(r => walk(r, files));
  files.forEach(f => {
    if (!documents.get(pathToFileURL(f).href)) indexFromDisk(f);
  });
  validateAll();
});

documents.onDidChangeContent(e => {
  index.set(e.document.uri, e.document.getText());
  validateAll();
  checkTypesLater(e.document);
});

documents.onDidClose(e => {
  indexFromDisk(fileURLToPath(e.document.uri));
  typeProblems.delete(e.document.uri);
  connection.sendDiagnostics({ uri: e.document.uri, diagnostics: [] });
  validateAll();
});

connection.onDidChangeWatchedFiles(({ changes }) => {
  for (const c of changes) {
    if (documents.get(c.uri)) continue;
    if (c.type === FileChangeType.Deleted) index.delete(c.uri);
    else indexFromDisk(fileURLToPath(c.uri));
  }
  validateAll();
});

connection.onCompletion(async ({ textDocument, position }, token) => {
  if (await cancelled(token)) return null;
  const doc = documents.get(textDocument.uri);
  if (!doc) return null;
  const offset = doc.offsetAt(position);
  // `.` 뒤는 타입이 필요하다 → TS LanguageService, 나머지는 구문 분석으로
  const probe = probeAt(index, doc.uri, offset);
  const res = probe
    ? { span: { start: offset - probe.ident.length, end: offset }, items: types.complete(fileURLToPath(doc.uri), doc.getText(), probe) }
    : complete(index, doc.uri, offset);
  trace(`completion ${textDocument.uri} ${position.line}:${position.character} → ${res?.items.length ?? 0}`);
  if (!res) return null;
  const range = rangeOf(doc, res.span);
  return res.items.map(item => ({ ...item, textEdit: { range, newText: item.label } }));
});

/** 커서가 스크립트(@x@ / {{= }} / swc-on-*) 속 식별자 위면 그 식별자 끝까지의 조각 — 타입으로 정의/hover 를 찾는다 */
const scriptOf = (doc: TextDocument, offset: number) => {
  const text = doc.getText();
  let s = offset;
  let e = offset;
  while (s > 0 && /[\w$]/.test(text[s - 1])) s--;
  while (e < text.length && /[\w$]/.test(text[e])) e++;
  if (s === e) return;
  const script = scriptAt(index, doc.uri, e);
  return script && /[\w$]$/.test(script.code) ? { script, span: { start: s, end: e } } : undefined;
};

connection.onHover(async ({ textDocument, position }, token) => {
  if (await cancelled(token)) return null;
  const doc = documents.get(textDocument.uri);
  if (!doc) return null;
  const offset = doc.offsetAt(position);
  let res = hover(index, doc.uri, offset);
  if (!res) {
    const at = scriptOf(doc, offset);
    const markdown = at && types.hover(fileURLToPath(doc.uri), doc.getText(), at.script);
    if (at && markdown) res = { span: at.span, markdown };
  }
  trace(`hover ${textDocument.uri} ${position.line}:${position.character} → ${res ? 'yes' : 'none'}`);
  return res ? { contents: { kind: 'markdown', value: res.markdown }, range: rangeOf(doc, res.span) } : null;
});

connection.onDefinition(async ({ textDocument, position }, token) => {
  if (await cancelled(token)) return null;
  const doc = documents.get(textDocument.uri);
  if (!doc) return null;
  const offset = doc.offsetAt(position);
  // origin = 클릭한 글자 범위, targets = 이동할 곳들
  let origin: Span | undefined;
  let targets: { uri: string; start: number; end: number }[] = [];
  const target = definition(index, doc.uri, offset);
  if (target) {
    origin = symbolAt(index, doc.uri, offset)?.span;
    targets = [target];
  } else {
    const at = scriptOf(doc, offset);
    origin = at?.span;
    targets = (at ? types.definition(fileURLToPath(doc.uri), doc.getText(), at.script) : []).map(d => ({ uri: pathToFileURL(d.fileName).href, start: d.start, end: d.end }));
  }
  trace(`definition ${textDocument.uri} ${position.line}:${position.character} → ${targets.map(t => `${t.uri}@${t.start}`).join(', ') || 'none'}`);
  if (!targets.length) return null;
  // 클라이언트가 LocationLink 를 받으면 그걸로 (클릭 범위까지 알려 준다)
  const located = targets.map(t => ({ uri: t.uri, range: rangeOf(docOf(t.uri), t) }));
  if (!linkSupport) return located;
  const originSelectionRange = origin && rangeOf(doc, origin);
  return located.map(l => ({ originSelectionRange, targetUri: l.uri, targetRange: l.range, targetSelectionRange: l.range }));
});

connection.onSignatureHelp(async ({ textDocument, position }, token) => {
  if (await cancelled(token)) return null;
  const doc = documents.get(textDocument.uri);
  const script = doc && scriptAt(index, doc.uri, doc.offsetAt(position));
  const help = script && types.signature(fileURLToPath(doc.uri), doc.getText(), script);
  trace(`signature ${textDocument.uri} ${position.line}:${position.character} → ${help ? help.signatures.length : 'none'}`);
  return help ?? null;
});

documents.listen(connection);
connection.listen();
