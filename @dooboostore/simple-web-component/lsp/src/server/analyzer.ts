// SWC 템플릿 분석 — LSP 와 무관한 순수 함수 (위치는 전부 파일 offset). server.ts 가 LSP 로 옮긴다.
import * as ts from 'typescript';
import { CompletionItem, CompletionItemKind } from 'vscode-languageserver';
import { DOM_EVENT_NAMES } from '../../../src/config/config';

export type Span = { start: number; end: number };
export type Member = Span & { name: string; kind: 'state' | 'method' | 'field'; stateName?: string };
export type Component = Span & {
  uri: string;
  tag: string;
  className: string;
  bodyEnd: number; // 클래스 닫는 '}' 위치 — 타입 완성용 probe 메서드를 여기에 끼운다 (typeService.ts)
  builtIn: boolean; // customized built-in → <button is="tag"> 로 쓴다
  members: Member[];
  attributes: string[]; // $this 에 붙는 attribute 이름 (@attribute / @changedAttribute / observedAttributes)
  slotRefs: (Span & { id: string })[]; // @appendHtmlSlot('id') 같은 슬롯 데코레이터 인자
};
/** HTML 로 보이는 문자열/템플릿 리터럴 내용. holes = ${ ... } 구간 */
export type Template = Span & { holes: Span[]; owner?: Component };
export type FileInfo = { uri: string; text: string; components: Component[]; templates: Template[] };

const HTMLISH = /<[a-zA-Z!\/]/;
const SLOT_DEF = /<!--\[\[\s*([\s\S]*?)\s*\]\]-->/g;
const LIFECYCLE_ATTRS = ['constructor', 'connected', 'disconnected', 'before-connected', 'after-connected', 'before-disconnected', 'after-disconnected', 'before-adopted', 'after-adopted', 'attribute-changed'].map(n => `swc-on-${n}`);
// swc-on-* / {{= }} 스크립트 안에서 쓸 수 있는 변수 (elementDefine.ts _executeSwcScript / __swc_executeAttributeEvent)
const HELPER_VARS = ['$this', '$host', '$parentHost', '$hosts', '$firstHost', '$lastHost', '$appHost', '$appHosts', '$firstAppHost', '$lastAppHost', '$d', '$w', '$q', '$qa', '$qi', '$el', '$root'];
const EVENT_VARS = ['$event', '$data', '$detail'];

// ── 파싱 ──

const nameOf = (e: ts.Expression): string | undefined =>
  ts.isIdentifier(e) ? e.text : ts.isPropertyAccessExpression(e) ? e.name.text : ts.isCallExpression(e) ? nameOf(e.expression) : undefined;
const strArgs = (e: ts.Expression) => (ts.isCallExpression(e) ? e.arguments.map(a => (ts.isStringLiteralLike(a) ? a : undefined)) : []);
const decoratorsOf = (n: ts.Node) => ((ts.canHaveDecorators(n) && ts.getDecorators(n)) || []).map(d => d.expression);
const inner = (n: ts.Node, sf: ts.SourceFile): Span => ({ start: n.getStart(sf) + 1, end: n.end - 1 });

export function analyze(uri: string, text: string): FileInfo {
  // .html 은 파일 전체가 템플릿 (소속 컴포넌트 없음 → 태그/attribute/is=/$helper 만)
  if (/\.html?$/i.test(uri)) return { uri, text, components: [], templates: [{ start: 0, end: text.length, holes: [] }] };
  const sf = ts.createSourceFile(uri, text, ts.ScriptTarget.Latest, true);
  const info: FileInfo = { uri, text, components: [], templates: [] };
  const visit = (node: ts.Node, owner?: Component): void => {
    if (ts.isClassLike(node)) {
      owner = readComponent(uri, node, sf);
      if (owner) info.components.push(owner);
    } else if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      if (HTMLISH.test(node.text)) info.templates.push({ ...inner(node, sf), holes: [], owner });
    } else if (ts.isTemplateExpression(node)) {
      const parts = [node.head, ...node.templateSpans.map(s => s.literal)];
      if (parts.some(p => HTMLISH.test(p.text))) {
        const holes = node.templateSpans.map((s, i) => ({ start: parts[i].end - 2, end: s.literal.getStart(sf) + 1 }));
        info.templates.push({ ...inner(node, sf), holes, owner });
      }
    }
    ts.forEachChild(node, c => visit(c, owner));
  };
  visit(sf);
  return info;
}

/** 'tag' 또는 같은 파일 바깥 스코프의 `const tagName = 'tag'` (팩토리 패턴) */
function resolveString(e: ts.Expression | undefined): ts.StringLiteralLike | undefined {
  if (!e || ts.isStringLiteralLike(e)) return e;
  if (!ts.isIdentifier(e)) return;
  for (let n: ts.Node | undefined = e.parent; n; n = n.parent) {
    if (!ts.isBlock(n) && !ts.isSourceFile(n) && !ts.isModuleBlock(n)) continue;
    for (const st of n.statements) {
      if (!ts.isVariableStatement(st)) continue;
      for (const d of st.declarationList.declarations)
        if (ts.isIdentifier(d.name) && d.name.text === e.text && d.initializer && ts.isStringLiteralLike(d.initializer)) return d.initializer;
    }
  }
  return;
}

function readComponent(uri: string, node: ts.ClassLikeDeclaration, sf: ts.SourceFile): Component | undefined {
  const define = decoratorsOf(node).find(d => nameOf(d) === 'elementDefine');
  const tagLit = define && ts.isCallExpression(define) ? resolveString(define.arguments[0]) : undefined;
  if (!define || !tagLit) return;
  const options = ts.isCallExpression(define) ? define.arguments[1] : undefined;
  const option = (key: string) =>
    options && ts.isObjectLiteralExpression(options)
      ? options.properties.find((p): p is ts.PropertyAssignment => ts.isPropertyAssignment(p) && p.name.getText(sf) === key)?.initializer
      : undefined;
  const base = node.heritageClauses?.find(h => h.token === ts.SyntaxKind.ExtendsKeyword)?.types[0]?.expression;
  const baseName = base && nameOf(base);
  const observed = option('observedAttributes');
  const comp: Component = {
    ...inner(tagLit, sf),
    uri,
    tag: tagLit.text,
    className: node.name?.text ?? '(anonymous)',
    bodyEnd: node.end - 1,
    builtIn: !!option('extends') || (!!baseName && baseName !== 'HTMLElement' && /^HTML\w+Element$/.test(baseName)),
    members: [],
    attributes: observed && ts.isArrayLiteralExpression(observed) ? observed.elements.filter(ts.isStringLiteralLike).map(e => e.text) : [],
    slotRefs: [],
  };
  for (const m of node.members) {
    if (!m.name || !(ts.isIdentifier(m.name) || ts.isStringLiteralLike(m.name))) continue;
    const name = m.name.text;
    const member: Member = { name, kind: ts.isMethodDeclaration(m) ? 'method' : 'field', start: m.name.getStart(sf), end: m.name.end };
    for (const d of decoratorsOf(m)) {
      const dn = nameOf(d);
      const args = strArgs(d);
      if (dn === 'state') {
        member.kind = 'state';
        member.stateName = args[0]?.text ?? name;
      } else if (dn === 'attribute') {
        // bare = 멤버 이름, 문자열 1개 = attribute 이름, 문자열 2개 = (selector, 이름) 이라 $this 것이 아니다
        if (!ts.isCallExpression(d)) comp.attributes.push(name);
        else if (args[0] && !args[1]) comp.attributes.push(args[0].text);
      } else if (dn === 'changedAttribute' && args[0]) {
        comp.attributes.push(args[0].text);
      } else if (dn && /Slot$/.test(dn) && args[0]) {
        comp.slotRefs.push({ ...inner(args[0], sf), id: args[0].text });
      }
    }
    comp.members.push(member);
  }
  comp.attributes = [...new Set(comp.attributes)];
  return comp;
}

// ── 인덱스 ──

export class Index {
  readonly files = new Map<string, FileInfo>();
  set(uri: string, text: string) {
    this.files.set(uri, analyze(uri, text));
  }
  delete(uri: string) {
    this.files.delete(uri);
  }
  components() {
    return [...this.files.values()].flatMap(f => f.components);
  }
}

export function slotDefs(info: FileInfo, owner: Component): (Span & { id: string })[] {
  return info.templates
    .filter(t => t.owner === owner)
    .flatMap(t =>
      [...info.text.slice(t.start, t.end).matchAll(SLOT_DEF)].map(m => {
        const start = t.start + m.index! + m[0].indexOf(m[1], '<!--[['.length);
        return { id: m[1], start, end: start + m[1].length };
      })
    );
}

const within = (s: Span, offset: number) => offset >= s.start && offset <= s.end;

export function templateAt(info: FileInfo, offset: number) {
  // 바깥 템플릿의 ${} 안에 있는 중첩 템플릿은 hole 조건으로 걸러져 가장 안쪽 것이 잡힌다
  return info.templates.find(t => within(t, offset) && !t.holes.some(h => offset > h.start && offset < h.end));
}

// ── 커서 문맥 ──

export type Ctx =
  | { kind: 'tag'; prefix: string }
  | { kind: 'attr'; tag: string; prefix: string }
  | { kind: 'value'; tag: string; attr: string; prefix: string }
  | { kind: 'text'; prefix: string }; // 텍스트 또는 주석 (<!--[text @x@ ]-->)

/** 템플릿 시작부터 커서까지의 텍스트로 HTML 문맥을 판단한다 */
export function contextAt(src: string): Ctx {
  let i = 0;
  let inTag = false;
  let tag = '';
  let quote = '';
  let attr = '';
  let valueStart = 0;
  while (i < src.length) {
    if (!inTag) {
      if (src.startsWith('<!--', i)) {
        const end = src.indexOf('-->', i + 4);
        if (end < 0) return { kind: 'text', prefix: src };
        i = end + 3;
        continue;
      }
      const m = src[i] === '<' ? /^<\/?([a-zA-Z][\w-]*)?/.exec(src.slice(i)) : null;
      if (m && i + m[0].length === src.length) return { kind: 'tag', prefix: m[1] ?? '' };
      if (m?.[1]) {
        inTag = true;
        tag = m[1];
        i += m[0].length;
        continue;
      }
      i++;
      continue;
    }
    const c = src[i];
    if (quote) {
      if (c === quote) quote = '';
    } else if (c === '>') {
      inTag = false;
    } else if (c === '"' || c === "'") {
      quote = c;
      valueStart = i + 1;
      attr = /([^\s=]+)\s*=\s*$/.exec(src.slice(0, i))?.[1] ?? '';
    }
    i++;
  }
  if (!inTag) return { kind: 'text', prefix: src };
  if (quote) return { kind: 'value', tag, attr, prefix: src.slice(valueStart) };
  return { kind: 'attr', tag, prefix: /[^\s"'=<>\/]*$/.exec(src)![0] };
}

/** 템플릿 시작~offset 텍스트. ${} 구간은 문맥 판단을 흐리지 않게 '0' 으로 덮는다 */
function textBefore(info: FileInfo, t: Template, offset: number) {
  let s = info.text.slice(t.start, offset);
  for (const h of t.holes) {
    if (h.start >= offset) break;
    const a = h.start - t.start;
    const b = Math.min(h.end, offset) - t.start;
    s = s.slice(0, a) + '0'.repeat(b - a) + s.slice(b);
  }
  return s;
}

// ── 기능 ──

export type Completion = { span: Span; items: CompletionItem[] };

const tagItem = (c: Component): CompletionItem => ({ label: c.tag, kind: CompletionItemKind.Class, detail: c.className });
const attrItem = (label: string, detail: string): CompletionItem => ({ label, kind: CompletionItemKind.Property, detail });

function memberItems(owner: Component): CompletionItem[] {
  return owner.members.flatMap(m => {
    const items: CompletionItem[] = [];
    if (m.stateName) items.push({ label: m.stateName, kind: CompletionItemKind.Variable, detail: `@state ${owner.className}.${m.name}` });
    if (m.stateName !== m.name) items.push({ label: m.name, kind: m.kind === 'method' ? CompletionItemKind.Method : CompletionItemKind.Field, detail: `${owner.className}.${m.name}` });
    return items;
  });
}

export function complete(index: Index, uri: string, offset: number): Completion | undefined {
  const info = index.files.get(uri);
  if (!info) return;
  for (const c of info.components)
    for (const r of c.slotRefs)
      if (within(r, offset))
        return { span: r, items: [...new Set(slotDefs(info, c).map(s => s.id))].map(id => ({ label: id, kind: CompletionItemKind.Reference, detail: `slot in ${c.className}` })) };

  const t = templateAt(info, offset);
  if (!t) return;
  const ctx = contextAt(textBefore(info, t, offset));
  const back = (n: number): Span => ({ start: offset - n, end: offset });
  const comps = index.components();

  if (ctx.kind === 'tag') return { span: back(ctx.prefix.length), items: comps.filter(c => !c.builtIn).map(tagItem) };

  if (ctx.kind === 'attr') {
    const target = comps.find(c => c.tag === ctx.tag);
    const items = [
      ...(target?.attributes ?? []).map(a => attrItem(a, `${target!.className} attribute`)),
      attrItem('a::', 'attribute binding — a::name="@expr@"'),
      attrItem('p::', 'property binding — p::name="@expr@"'),
      ...DOM_EVENT_NAMES.map(e => attrItem(`e::${e}`, 'event binding — e::click="@method@()"')),
      // swc-on-<이벤트> 는 swc 요소가 아닌 자식에서 전역 위임으로 처리되고, swc 요소 자신에게는 라이프사이클 swc-on-* 가 붙는다
      ...(target ? LIFECYCLE_ATTRS : DOM_EVENT_NAMES.map(e => `swc-on-${e}`)).map(a => attrItem(a, 'swc script')),
    ];
    return { span: back(ctx.prefix.length), items };
  }

  const member = /(?:^|[^\w@$.])@([\w$]*)$/.exec(ctx.prefix);
  if (member && t.owner) return { span: back(member[1].length), items: memberItems(t.owner) };

  if (ctx.kind === 'value') {
    if (ctx.attr === 'is') return { span: back(ctx.prefix.length), items: comps.filter(c => c.builtIn).map(tagItem) };
    const helper = /(?:^|[^\w$.])(\$\w*)$/.exec(ctx.prefix);
    const script = ctx.attr.startsWith('swc-on-') || /\{\{=(?:(?!\}\})[\s\S])*$/.test(ctx.prefix);
    if (helper && script) {
      const vars = ctx.attr.startsWith('swc-on-') && !LIFECYCLE_ATTRS.includes(ctx.attr) ? [...EVENT_VARS, ...HELPER_VARS] : HELPER_VARS;
      return { span: back(helper[1].length), items: vars.map(v => ({ label: v, kind: CompletionItemKind.Variable, detail: 'swc helper' })) };
    }
  }
  return;
}

/**
 * `.` 뒤 멤버 완성이 필요한 스크립트 조각. 타입이 있어야 해서 typeService.ts 가 TS LanguageService 로 푼다.
 * - `@user.na`               → code 'user.na'        (state / 멤버 이름이 변수)
 * - swc-on-click="$w.loc"    → code '$w.loc'         (값 전체가 스크립트)
 * - title="{{= $host.na"     → code '$host.na'       ({{= 뒤)
 */
/** element: this 가 그 요소인 스크립트(swc-on-* / {{= }})면 그 요소의 태그 이름. @x@ 는 undefined (this = 컴포넌트) */
export type Script = { owner?: Component; code: string; element?: string };
export type Probe = Script & { ident: string };

/** offset 까지의 스크립트 조각 (@x@ / {{= }} / swc-on-* 값). 아니면 undefined */
export function scriptAt(index: Index, uri: string, offset: number): Script | undefined {
  const info = index.files.get(uri);
  const t = info && templateAt(info, offset);
  if (!info || !t) return;
  const ctx = contextAt(textBefore(info, t, offset));
  if (ctx.kind !== 'text' && ctx.kind !== 'value') return;
  const at = /(?:^|[^\w@$.])@([^@]*)$/.exec(ctx.prefix)?.[1];
  if (at !== undefined) return t.owner && { owner: t.owner, code: at };
  if (ctx.kind !== 'value') return;
  const open = /\{\{=((?:(?!\}\})[\s\S])*)$/.exec(ctx.prefix);
  const code = open ? open[1] : ctx.attr.startsWith('swc-on-') ? ctx.prefix : undefined;
  return code === undefined ? undefined : { owner: t.owner, code, element: ctx.tag };
}

/** 파일 안의 모든 스크립트 조각 (타입 검사용). start = 원본 offset, stmt = 문장(swc-on-*) / 식 */
export type ScriptRegion = { owner?: Component; code: string; start: number; stmt: boolean; element?: string };

export function scriptsIn(info: FileInfo): ScriptRegion[] {
  const out: ScriptRegion[] = [];
  for (const t of info.templates) {
    const text = info.text.slice(t.start, t.end);
    // ${} 가 섞인 조각은 실행 전 값을 몰라 검사하지 않는다. <style> 안의 @media 등은 @x@ 가 아니다
    const skip = [...t.holes.map(h => ({ start: h.start - t.start, end: h.end - t.start })), ...[...text.matchAll(/<style[\s\S]*?<\/style>/gi)].map(m => ({ start: m.index!, end: m.index! + m[0].length }))];
    const taken: Span[] = [];
    const tagBefore = (i: number) => /<([a-zA-Z][\w-]*)[^<]*$/.exec(text.slice(0, i))?.[1] ?? '';
    const add = (start: number, code: string, stmt: boolean, element?: string) => {
      const end = start + code.length;
      if (!code.trim() || [...skip, ...taken].some(s => start < s.end && end > s.start)) return;
      taken.push({ start, end });
      out.push({ owner: t.owner, code, start: t.start + start, stmt, element });
    };
    for (const m of text.matchAll(/\sswc-on-[\w-]+\s*=\s*(["'])/g)) {
      const start = m.index! + m[0].length;
      const end = text.indexOf(m[1], start);
      if (end > 0) add(start, text.slice(start, end), true, tagBefore(start));
    }
    for (const m of text.matchAll(/\{\{=([\s\S]*?)\}\}/g)) add(m.index! + 3, m[1], false, tagBefore(m.index!));
    if (t.owner) for (const m of text.matchAll(/(^|[^\w@$.])@([A-Za-z_$][^@\n]*?)@/g)) add(m.index! + m[1].length + 1, m[2], false);
  }
  return out;
}

/** `.` 뒤 멤버 완성 자리 */
export function probeAt(index: Index, uri: string, offset: number): Probe | undefined {
  const script = scriptAt(index, uri, offset);
  const ident = script && /\.([\w$]*)$/.exec(script.code)?.[1];
  return ident === undefined ? undefined : { ...script!, ident };
}

export type Hit =
  | { kind: 'tag'; span: Span; comp: Component }
  | { kind: 'member'; span: Span; member: Member; owner: Component }
  | { kind: 'slot'; span: Span; id: string; owner: Component; info: FileInfo };

export function symbolAt(index: Index, uri: string, offset: number): Hit | undefined {
  const info = index.files.get(uri);
  if (!info) return;
  for (const c of info.components) for (const r of c.slotRefs) if (within(r, offset)) return { kind: 'slot', span: r, id: r.id, owner: c, info };

  const t = templateAt(info, offset);
  if (!t) return;
  const text = info.text;
  let s = offset;
  let e = offset;
  while (s > t.start && /[\w$-]/.test(text[s - 1])) s--;
  while (e < t.end && /[\w$-]/.test(text[e])) e++;
  const word = text.slice(s, e);
  if (!word) return;
  if (text[s - 1] === '@' && t.owner) {
    const name = /^[\w$]*/.exec(word)![0];
    const member = t.owner.members.find(m => m.stateName === name || m.name === name);
    if (member) return { kind: 'member', span: { start: s, end: s + name.length }, member, owner: t.owner };
  }
  if (word.includes('-')) {
    const comp = index.components().find(c => c.tag === word);
    if (comp) return { kind: 'tag', span: { start: s, end: e }, comp };
  }
  return;
}

export type Target = Span & { uri: string };

export function definition(index: Index, uri: string, offset: number): Target | undefined {
  const hit = symbolAt(index, uri, offset);
  if (!hit) return;
  if (hit.kind === 'tag') return { uri: hit.comp.uri, start: hit.comp.start, end: hit.comp.end };
  if (hit.kind === 'member') return { uri: hit.owner.uri, start: hit.member.start, end: hit.member.end };
  const def = slotDefs(hit.info, hit.owner).find(d => d.id === hit.id);
  return def && { uri, start: def.start, end: def.end };
}

export function hover(index: Index, uri: string, offset: number): { span: Span; markdown: string } | undefined {
  const hit = symbolAt(index, uri, offset);
  if (!hit) return;
  if (hit.kind === 'tag') {
    const c = hit.comp;
    const attrs = c.attributes.length ? `\n\nattributes: ${c.attributes.map(a => `\`${a}\``).join(', ')}` : '';
    return { span: hit.span, markdown: `\`\`\`ts\n@elementDefine('${c.tag}')\nclass ${c.className}\n\`\`\`\n${c.uri.split('/').pop()}${attrs}` };
  }
  if (hit.kind === 'member') {
    const m = hit.member;
    const label = m.kind === 'state' ? `@state('${m.stateName}') ${m.name}` : m.kind === 'method' ? `${m.name}()` : m.name;
    return { span: hit.span, markdown: `\`\`\`ts\n(${m.kind}) ${hit.owner.className}.${label}\n\`\`\`` };
  }
  const found = slotDefs(hit.info, hit.owner).some(d => d.id === hit.id);
  return { span: hit.span, markdown: found ? `slot \`<!--[[ ${hit.id} ]]-->\`` : `slot \`${hit.id}\` — not found in ${hit.owner.className}'s templates` };
}

export type Problem = Span & { severity: 'error' | 'warning'; message: string };

/** sameScope: 두 파일이 같은 앱(패키지)인지 — 다른 예제 앱끼리 같은 태그를 쓰는 건 중복이 아니다 */
export function diagnostics(index: Index, uri: string, sameScope: (a: string, b: string) => boolean = () => true): Problem[] {
  const info = index.files.get(uri);
  if (!info) return [];
  const out: Problem[] = [];
  const all = index.components();
  for (const c of info.components) {
    const dups = all.filter(o => o !== c && o.tag === c.tag && sameScope(o.uri, c.uri));
    if (dups.length)
      out.push({ start: c.start, end: c.end, severity: 'warning', message: `<${c.tag}> is also defined by ${dups.map(d => `${d.className} (${d.uri.split('/').pop()})`).join(', ')} — customElements.define throws on a duplicate name` });

    // 슬롯·선택자·메시지는 동적으로 생길 수 있어 '없다' 경고는 하지 않는다
  }
  return out;
}
