import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  TextDocumentSyncKind,
  CompletionItem,
  CompletionItemKind,
  Hover,
  MarkupContent,
  Diagnostic,
  TextDocumentPositionParams,
  Position,
  Range,
  MarkupKind,
  InsertTextFormat,
  InitializeResult,
  SemanticTokens,
  SemanticTokensParams,
  SemanticTokenTypes,
  SemanticTokensRequest
} from 'vscode-languageserver/node.js';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { scan, analyze, ScanResult } from './scanner.js';
import { DOM_EVENT_NAMES, HOST_HELPERS, BROWSER_GLOBALS, TYPE_MEMBERS, GENERIC_MEMBERS } from '../shared/swcSyntax.js';

const connection = createConnection(ProposedFeatures.all);
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

// semantic token type indexes (must match order of legend)
const TOKEN_TYPES = [
  SemanticTokenTypes.variable,   // 0: @var@ state/property refs
  SemanticTokenTypes.keyword,     // 1: {{ }}, {{= }}, {{@ }} markers
  SemanticTokenTypes.function,    // 2: swc-on-* event handlers
  SemanticTokenTypes.macro,       // 3: ea: markers (if client supports)
  SemanticTokenTypes.string,      // 4: anything else template-ish
];
const tokenTypeIndex = new Map<string, number>(TOKEN_TYPES.map((t, i) => [t, i]));

connection.onInitialize((): InitializeResult => {
  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Full,
      completionProvider: { resolveProvider: false, triggerCharacters: ['{', ':', '@', '-', '=', '$'] },
      hoverProvider: true,
      definitionProvider: true,
      semanticTokensProvider: {
        legend: { tokenTypes: TOKEN_TYPES, tokenModifiers: [] },
        full: true
      }
    }
  };
});



function fromVariableType(result: ScanResult, name: string): string | undefined {
  return result.members.find(m => m.name === name)?.type;
}

function dollarExecAt(text: string, offset: number): { name: string; start: number; end: number } | null {
  const re = /\$[A-Za-z_$][\w$]*/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (offset >= m.index && offset <= m.index + m[0].length) {
      return { name: m[0], start: m.index, end: m.index + m[0].length };
    }
  }
  return null;
}

function lineCol(text: string, offset: number): Position {
  let line = 0;
  let col = 0;
  for (let i = 0; i < offset && i < text.length; i++) {
    if (text[i] === '\n') { line++; col = 0; } else { col++; }
  }
  return { line, character: col };
}

function offsetOf(document: TextDocument, pos: Position): number {
  return document.offsetAt(pos);
}

function findMemberDeclaration(result: ScanResult, text: string, name: string): Range | null {
  const member = result.members.find(m => m.name === name);
  if (!member) return null;
  const lines = text.split('\n');

  // state/attribute: jump to the decorator literal (e.g. `@state('aa')`) on the line above the field
  if (member.decoratorName === 'state' || member.decoratorName === 'attribute') {
    const decLine = member.line - 1;
    if (decLine >= 0 && decLine < lines.length) {
      const idx = lines[decLine].indexOf(`'${name}'`);
      const idx2 = idx === -1 ? lines[decLine].indexOf(`"${name}"`) : idx;
      if (idx2 !== -1) {
        return Range.create(decLine, idx2, decLine, idx2 + name.length + 2);
      }
    }
    // fall through to the field line on failure
  }

  if (member.line < 0 || member.line >= lines.length) return null;
  const lineText = lines[member.line];
  const col = lineText.search(new RegExp(`\\b${name}\\b`));
  if (col === -1) return null;
  return Range.create(member.line, col, member.line, col + member.name.length);
}

async function validate(textDocument: TextDocument): Promise<void> {
  const text = textDocument.getText();
  const result = scan(text);
  const issues = analyze(result, text);
  const diagnostics: Diagnostic[] = issues.map(issue => ({
    severity: 1, // Error
    range: Range.create(issue.start, issue.end),
    message: issue.message,
    source: 'simple-web-component'
  }));
  connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

documents.onDidChangeContent(change => {
  validate(change.document);
});

connection.onCompletion((params: TextDocumentPositionParams): CompletionItem[] => {
  connection.console.log(`[onCompletion] called. uri=${params.textDocument.uri} pos=${params.position.line}:${params.position.character}`);

  const document = documents.get(params.textDocument.uri);
  if (!document) return [];

  const text = document.getText();
  const result = scan(text);
  const lineText = text.split('\n')[params.position.line] ?? '';
  const beforeCursor = lineText.slice(0, params.position.character);

  const items: CompletionItem[] = [];

  // After `swc-on-` → DOM event names
  const swcOnMatch = beforeCursor.match(/swc-on-([\w-]*)$/);
  if (swcOnMatch) {
    connection.console.log(`[onCompletion] branch=swc-on prefix="${swcOnMatch[1]}"`);
    const prefix = swcOnMatch[1];
    const events = [...DOM_EVENT_NAMES, 'connected', 'before-connected', 'after-connected',
      'before-disconnected', 'after-disconnected', 'before-adopted', 'after-adopted', 'attribute-changed', 'constructor'];
    for (const ev of events.filter(e => e.startsWith(prefix))) {
      items.push({
        label: `swc-on-${ev}`,
        kind: CompletionItemKind.Event,
        insertText: `swc-on-${ev}="\${1:this.handleEvent()}"`,
        insertTextFormat: InsertTextFormat.Snippet,
        documentation: `SWC 이벤트 핸들러: \`swc-on-${ev}\``
      });
    }
    return items;
  }

  // Inside expression `{{ ... }}`, `{{= ... }}`, `{{@ ... }}` → state vars + host helpers + globals
  if (beforeCursor.endsWith('{{') || beforeCursor.endsWith('{{=') || beforeCursor.endsWith('{{@') || beforeCursor.endsWith('{{ ')) {
    connection.console.log(`[onCompletion] branch=expression endsWith "{{...}"`);
    // state variables first (most common in templates)
    for (const m of result.members) {
      if (m.kind === 'state') {
        items.push({ label: m.name, kind: CompletionItemKind.Variable, detail: `state: @${m.name}@` });
      }
    }
    for (const h of HOST_HELPERS) {
      items.push({ label: h.name, kind: CompletionItemKind.Variable, detail: h.type, documentation: h.documentation });
    }
    for (const g of BROWSER_GLOBALS) {
      items.push({ label: g, kind: CompletionItemKind.Variable });
    }
    return items;
  }

  // `$` reserved helper/host variables
  const dollarMatch = beforeCursor.match(/\$([\w]*)$/);
  if (dollarMatch) {
    connection.console.log(`[onCompletion] branch=dollar prefix="${dollarMatch[1]}"`);
    const prefix = dollarMatch[1];
    for (const h of HOST_HELPERS) {
      if (h.name.startsWith("$" + prefix)) {
        items.push({ label: h.name, kind: CompletionItemKind.Variable, detail: h.type, documentation: h.documentation });
      }
    }
    return items;
  }

  // `@var@.` member access inside template → suggest members by state type
  const memberAccessMatch = beforeCursor.match(/@([\w$.-]+)@\.([\w]*)$/);
  if (memberAccessMatch) {
    connection.console.log(`[onCompletion] branch=memberAccess var="${memberAccessMatch[1]}" prefix="${memberAccessMatch[2]}"`);
    const varName = memberAccessMatch[1];
    const prefix = memberAccessMatch[2];
    // textEdit range covers everything from the typed prefix (after the dot) to the caret
    const replaceStart = params.position.character - prefix.length;
    const replaceRange = Range.create(params.position.line, replaceStart, params.position.line, params.position.character);
    const member = result.members.find(m => m.name === varName);
    const type = member?.type ?? fromVariableType(result, varName);
    const list = TYPE_MEMBERS[type ?? ''] ?? (type ? GENERIC_MEMBERS : []);
    for (const mm of list) {
      if (mm.label.startsWith(prefix)) {
        items.push({
          ...mm,
          kind: CompletionItemKind.Method,
          label: mm.label,
          filterText: mm.label,
          textEdit: { range: replaceRange, newText: mm.label },
          data: { member: varName }
        });
      }
    }
    connection.console.log(`[onCompletion] memberAccess resolved type="${type ?? '?'}" -> ${items.length} items:`);
    for (const it of items) connection.console.log(`[onCompletion]   item=${it.label}`);
    return items;
  }

  // `@var@` reference inside template → suggest state/attribute/property names
  const varMatch = beforeCursor.match(/@([\w]*)$/);
  if (varMatch) {
    connection.console.log(`[onCompletion] branch=var prefix="${varMatch[1]}"`);
    const prefix = varMatch[1];
    // Replace the whole typed fragment from the leading `@` (so `@`+`aa` → `@aa@`, not `@@aa@`)
    const replaceStart = params.position.character - varMatch[0].length;
    const replaceRange = Range.create(params.position.line, replaceStart, params.position.line, params.position.character);
    const seen = new Set<string>();
    const pushVar = (name: string, kind: CompletionItemKind, detail: string) => {
      if (seen.has(name)) return;
      seen.add(name);
      items.push({
        label: `@${name}@`, kind, detail,
        filterText: name,
        textEdit: { range: replaceRange, newText: `@${name}@` }
      });
    };
    // from @state / @attribute decorators
    for (const m of result.members) {
      if (m.kind === 'state' && m.name.startsWith(prefix)) pushVar(m.name, CompletionItemKind.Variable, `state: @${m.name}@`);
      if (m.kind === 'attribute' && m.name.startsWith(prefix)) pushVar(m.name, CompletionItemKind.Field, `attribute: @${m.name}@`);
    }
    // property/field members (no decorator) — via @name@ wrap
    for (const m of result.members) {
      if (m.kind === 'property' && m.name.startsWith(prefix)) pushVar(m.name, CompletionItemKind.Property, `property: @${m.name}@`);
    }
    // previously-seen `@var@` usages in this file
    for (const v of result.variables) {
      if (v.name.startsWith(prefix)) pushVar(v.name, CompletionItemKind.Variable, '사용된 템플릿 변수');
    }
    return items;
  }

  // `ea:` marker completion
  const eaMatch = beforeCursor.match(/ea:(\w*)$/);
  if (eaMatch) {
    items.push({
      label: 'ea:${id}:start:html', kind: CompletionItemKind.Snippet, insertTextFormat: InsertTextFormat.Snippet,
      insertText: 'ea:${1:id}:start:html', detail: 'EA html 블록 시작'
    }, {
      label: 'ea:${id}:end:html', kind: CompletionItemKind.Snippet, insertTextFormat: InsertTextFormat.Snippet,
      insertText: 'ea:${1:id}:end:html', detail: 'EA html 블록 끝'
    }, {
      label: 'ea:${id}:start:text', kind: CompletionItemKind.Snippet, insertTextFormat: InsertTextFormat.Snippet,
      insertText: 'ea:${1:id}:start:text', detail: 'EA text 블록 시작'
    }, {
      label: 'ea:${id}:end:text', kind: CompletionItemKind.Snippet, insertTextFormat: InsertTextFormat.Snippet,
      insertText: 'ea:${1:id}:end:text', detail: 'EA text 블록 끝'
    });
    return items;
  }

  // Snippet starters `{{` etc.
  if (beforeCursor.endsWith('{{') || lineText.trim() === '' || lineText.includes('{{')) {
    items.push(
      { label: '{{ expr }}', kind: CompletionItemKind.Snippet, insertTextFormat: InsertTextFormat.Snippet, insertText: '{{\$1}}', detail: 'replace 표현식' },
      { label: '{{= expr }}', kind: CompletionItemKind.Snippet, insertTextFormat: InsertTextFormat.Snippet, insertText: '{{=\$1}}', detail: 'callReturn 표현식 (결과 삽입)' },
      { label: '{{@ expr }}', kind: CompletionItemKind.Snippet, insertTextFormat: InsertTextFormat.Snippet, insertText: '{{@\$1}}', detail: 'call 표현식 (실행만)' }
    );
    return items;
  }

  connection.console.log(`[onCompletion] RETURN ${items.length} items`);
  return items;
});

connection.onHover((params: TextDocumentPositionParams): Hover | null => {
  const document = documents.get(params.textDocument.uri);
  if (!document) return null;
  const text = document.getText();
  const result = scan(text);
  const offset = offsetOf(document, params.position);

  const inExpr = result.expressions.find(e => offset >= e.start && offset <= e.end);
  if (inExpr) {
    const kindLabel = { replace: 'replace (`{{ }}`)', call: 'call (`{{@ }}`)', callReturn: 'callReturn (`{{= }}`)' }[inExpr.kind];
    const markdown: MarkupContent = {
      kind: MarkupKind.Markdown,
      value: `### SWC ${kindLabel}\n\n스크립트:\n\`\`\`ts\n${inExpr.script}\n\`\`\`\n\n- **replace**: 결과값으로 텍스트 치환\n- **call**: 함수 실행만\n- **callReturn**: 함수 반환값 삽입`
    };
    return { contents: markdown, range: Range.create(lineCol(text, inExpr.start), lineCol(text, inExpr.end)) };
  }

  // reserved `$` helper/host variables (e.g. $host, $appHost)
  const dollarExec = dollarExecAt(text, offset);
  if (dollarExec) {
    const h = HOST_HELPERS.find(x => x.name === dollarExec.name);
    const detail = h
      ? `${h.type} — ${h.documentation}\n\n예약 변수 (SWC 템플릿 표현식 전용)`
      : 'SWC 예약 변수';
    return {
      contents: { kind: MarkupKind.Markdown, value: `### \`${dollarExec.name}\`\n\n${detail}` },
      range: Range.create(lineCol(text, dollarExec.start), lineCol(text, dollarExec.end))
    };
  }

  const inVar = result.variables.find(v => offset >= v.start && offset <= v.end);
  if (inVar) {
    return {
      contents: { kind: MarkupKind.Markdown, value: `### SWC 템플릿 변수\n\n\`${inVar.raw}\` — \`@var@\` 래퍼로 감싸진 값을 참조합니다.` },
      range: Range.create(lineCol(text, inVar.start), lineCol(text, inVar.end))
    };
  }

  const inEa = result.eaMarkers.find(e => offset >= e.start && offset <= e.end);
  if (inEa) {
    return {
      contents: { kind: MarkupKind.Markdown, value: `### EA 마커\n\n\`${inEa.raw}\`\n\nid: \`${inEa.id}\`, type: \`${inEa.type}\`, ${inEa.name === 'start' ? '블록 시작' : '블록 끝'}` },
      range: Range.create(lineCol(text, inEa.start), lineCol(text, inEa.end))
    };
  }

  const inSwcOn = result.swcOnAttributes.find(a => offset >= a.start && offset <= a.end);
  if (inSwcOn) {
    return {
      contents: { kind: MarkupKind.Markdown, value: `### SWC 이벤트 핸들러\n\n\`swc-on-${inSwcOn.event}\`\n\n\`\`\`ts\n${inSwcOn.script}\n\`\`\`` },
      range: Range.create(lineCol(text, inSwcOn.start), lineCol(text, inSwcOn.end))
    };
  }

  return null;
});

connection.onDefinition((params): any => {
  const document = documents.get(params.textDocument.uri);
  if (!document) return null;
  const text = document.getText();
  const result = scan(text);
  const offset = offsetOf(document, params.position);

  const inVar = result.variables.find(v => offset >= v.start && offset <= v.end);
  if (inVar) {
    const decl = findMemberDeclaration(result, text, inVar.name);
    if (decl) {
      return { uri: params.textDocument.uri, range: decl };
    }
    return null;
  }
  return null;
});

connection.onRequest(SemanticTokensRequest.type, (params: SemanticTokensParams): SemanticTokens | null => {
  const document = documents.get(params.textDocument.uri);
  if (!document) return null;
  const text = document.getText();
  const result = scan(text);

  // collect (offset, len, tokenTypeIndex)
  const collected: Array<[number, number, number]> = [];
  let swcTokenCount = 0;

  // @var@ refs → variable
  for (const v of result.variables) {
    collected.push([v.start, v.raw.length, tokenTypeIndex.get('variable')!]);
  }
  // {{ }}, {{= }}, {{@ }} expression markers → keyword (both opening & closing braces)
  for (const e of result.expressions) {
    const open = e.raw.match(/^\{\{(@|=)?/)![0];
    collected.push([e.start, open.length, tokenTypeIndex.get('keyword')!]);
    if (e.raw.endsWith('}}')) {
      collected.push([e.end - 2, 2, tokenTypeIndex.get('keyword')!]);
    }
  }
  // swc-on-* handlers → function (highlight the attribute name)
  for (const a of result.swcOnAttributes) {
    const nameMatch = a.raw.match(/^swc-on-[\w-]+/);
    if (nameMatch) collected.push([a.start, nameMatch[0].length, tokenTypeIndex.get('function')!]);
  }
  // ea markers (comment or attribute form) → macro
  for (const m of result.eaMarkers) {
    collected.push([m.start, m.raw.length, tokenTypeIndex.get('macro')!]);
  }

  // sort by offset, then encode as LSP semantic token data (delta-encoded)
  collected.sort((a, b) => a[0] - b[0]);
  const encoded: number[] = [];
  let prevLine = 0;
  let prevChar = 0;
  for (const [offset, len, type] of collected) {
    const _pos = lineCol(text, offset);
    const deltaLine = _pos.line - prevLine;
    const deltaStartChar = _pos.line === prevLine ? _pos.character - prevChar : _pos.character;
    if (deltaLine < 0) continue; // safety
    encoded.push(deltaLine, deltaStartChar, len, type, 0);
    prevLine = _pos.line;
    prevChar = _pos.character;
  }
  const tokenData = { data: encoded };
  connection.console.log(`[semanticTokens] ${encoded.length / 5} tokens (swcTokens=${collected.length})`);
  return tokenData;
});

documents.listen(connection);
connection.listen();
