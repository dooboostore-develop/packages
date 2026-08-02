import { Position } from 'vscode-languageserver';
import { DOM_EVENT_NAMES, EXPRESSION_STARTS, EXPRESSION_END, VAR_WRAP } from '../shared/swcSyntax.js';

export interface TemplateSpan {
  start: number;
  end: number;
}

export interface SwcExpression {
  kind: 'replace' | 'call' | 'callReturn';
  script: string;
  start: number;
  end: number;
  raw: string;
}

export interface SwcVariable {
  name: string;
  start: number;
  end: number;
  raw: string;
}

export interface SwcEaMarker {
  id: string;
  type: string;
  name: string;
  start: number;
  end: number;
  raw: string;
}

export interface SwcOnAttribute {
  event: string;
  script: string;
  start: number;
  end: number;
  raw: string;
}

export interface SwcMember {
  name: string;
  kind: 'state' | 'attribute' | 'property' | 'method';
  decoratorName?: string;
  type?: string;
  line: number;
}

export interface ScanResult {
  templateSpans: TemplateSpan[];
  expressions: SwcExpression[];
  variables: SwcVariable[];
  eaMarkers: SwcEaMarker[];
  swcOnAttributes: SwcOnAttribute[];
  members: SwcMember[];
}

/**
 * Identify backtick template literal ranges inside a TS source document.
 * Handles nested `${ ... }` interpolation and escaped backticks.
 */
export function findTemplateSpans(text: string): TemplateSpan[] {
  const spans: TemplateSpan[] = [];
  let i = 0;
  while (i < text.length) {
    const start = text.indexOf('`', i);
    if (start === -1) break;
    let depth = 0;
    let j = start + 1;
    while (j < text.length) {
      const ch = text[j];
      if (ch === '\\') { j += 2; continue; }
      if (ch === '`') {
        if (depth === 0) { spans.push({ start, end: j + 1 }); break; }
        depth--;
      } else if (ch === '$' && text[j + 1] === '{') {
        depth++;
        j += 2;
        continue;
      } else if (ch === '}' && depth > 0) {
        depth--;
      }
      j++;
    }
    if (j >= text.length) break;
    i = j + 1;
  }
  return spans;
}

function toLineCol(text: string, offset: number): Position {
  let line = 0;
  let col = 0;
  for (let i = 0; i < offset && i < text.length; i++) {
    if (text[i] === '\n') { line++; col = 0; } else { col++; }
  }
  return { line, character: col };
}

// Non-overlapping masked ranges (in absolute document offsets) that must be
// ignored by the SWC scanner: HTML comments, and `//`-style comments inside
// template bodies / TS code. `{{ }}` / `@var@` / `swc-on-*` are only real
// markers in live template text, never inside comments.
function commentRanges(text: string): Array<[number, number]> {
  const ranges: Array<[number, number]> = [];
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    if (c === '`') {
      // jump a template literal (its inner comments handled recursively via body scan)
      let j = i + 1;
      let depth = 0;
      while (j < text.length) {
        if (text[j] === '\\') { j += 2; continue; }
        if (text[j] === '`') { if (depth === 0) break; depth--; }
        else if (text[j] === '$' && text[j + 1] === '{') { depth++; j += 2; continue; }
        else if (text[j] === '}' && depth > 0) depth--;
        j++;
      }
      i = j;
      continue;
    }
    if (c === '/' && text[i + 1] === '/') {
      let j = text.indexOf('\n', i);
      if (j === -1) j = text.length;
      ranges.push([i, j]);
      i = j;
      continue;
    }
    if (c === '/' && text[i + 1] === '*') {
      const j = text.indexOf('*/', i + 2);
      if (j === -1) { ranges.push([i, text.length]); break; }
      ranges.push([i, j + 2]);
      i = j + 2;
      continue;
    }
    if (c === '<' && text[i + 1] === '!' && text[i + 2] === '-' && text[i + 3] === '-') {
      const j = text.indexOf('-->', i + 4);
      if (j === -1) { ranges.push([i, text.length]); break; }
      ranges.push([i, j + 3]);
      i = j + 3;
      continue;
    }
    i++;
  }
  return ranges.sort((a, b) => a[0] - b[0]);
}

// skip a `'...'` or `"..."` string starting at i; returns index after closing
// quote, or null if unterminated.
function skipQuoted(body: string, i: number, quote: string): number | null {
  let j = i + 1;
  while (j < body.length) {
    if (body[j] === '\\') { j += 2; continue; }
    if (body[j] === quote) return j + 1;
    j++;
  }
  return null;
}

// skip a nested backtick template starting at i (relative to body).
function skipTemplate(body: string, i: number): number | null {
  let j = i + 1;
  let d = 0;
  while (j < body.length) {
    if (body[j] === '\\') { j += 2; continue; }
    if (body[j] === '`') { if (d === 0) return j + 1; d--; }
    else if (body[j] === '$' && body[j + 1] === '{') { d++; j += 2; continue; }
    else if (body[j] === '}' && d > 0) d--;
    j++;
  }
  return null;
}

// Is `pos` inside any masked (comment) range?
function isMasked(pos: number, ranges: Array<[number, number]>): boolean {
  let lo = 0, hi = ranges.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const [s, e] = ranges[mid];
    if (pos < s) hi = mid - 1;
    else if (pos >= e) lo = mid + 1;
    else return true;
  }
  return false;
}

export function scan(text: string): ScanResult {
  const spans = findTemplateSpans(text);
  const masked = commentRanges(text);
  const expressions: SwcExpression[] = [];
  const variables: SwcVariable[] = [];
  const eaMarkers: SwcEaMarker[] = [];
  const swcOnAttributes: SwcOnAttribute[] = [];

  const maskedAt = (off: number) => isMasked(off, masked);

  for (const span of spans) {
    const body = text.slice(span.start, span.end);

    // `{{ ... }}`, `{{= ... }}`, `{{@ ... }}` (skip matches inside comments)
    const exprRegex = /\{\{(@|=)?\s*([\s\S]*?)\s*\}\}/g;
    let m: RegExpExecArray | null;
    while ((m = exprRegex.exec(body)) !== null) {
      const abs = span.start + m.index;
      if (maskedAt(abs)) continue;
      const kind = m[1] === '=' ? 'callReturn' : m[1] === '@' ? 'call' : 'replace';
      expressions.push({
        kind,
        script: m[2],
        raw: m[0],
        start: abs,
        end: span.start + m.index + m[0].length
      });
    }

    // `@var@` wraps (single-line identifiers only)
    const varRegex = new RegExp(`\\${VAR_WRAP.start}([\\w$.-]+)\\${VAR_WRAP.end}`, 'g');
    while ((m = varRegex.exec(body)) !== null) {
      const abs = span.start + m.index;
      if (maskedAt(abs)) continue;
      variables.push({
        name: m[1],
        raw: m[0],
        start: abs,
        end: span.start + m.index + m[0].length
      });
    }

    // `<!--[html ... ]-->` / `<!--[text ... ]-->` and `ea:...` comments
    const commentRegex = /<!--[\s\S]*?-->/g;
    while ((m = commentRegex.exec(body)) !== null) {
      const comment = m[0];
      const eaMatch = comment.match(/\bea:(\w+):(start|end):(html|text)/);
      if (eaMatch) {
        eaMarkers.push({
          id: eaMatch[1],
          type: eaMatch[3],
          name: eaMatch[2],
          raw: comment.trim(),
          start: span.start + m.index,
          end: span.start + m.index + comment.length
        });
      }
    }

    // `ea:id:attribute|event|property:name` in attribute position
    const eaAttrRegex = /\bea:(\w+):(attribute|event|property):([\w-]+)/g;
    while ((m = eaAttrRegex.exec(body)) !== null) {
      eaMarkers.push({
        id: m[1],
        type: m[2],
        name: m[3],
        raw: m[0],
        start: span.start + m.index,
        end: span.start + m.index + m[0].length
      });
    }

    // `swc-on-{event}="{script}"` attributes
    const swcOnRegex = /\bswc-on-([\w-]+)\s*=\s*"([\s\S]*?)"/g;
    while ((m = swcOnRegex.exec(body)) !== null) {
      const abs = span.start + m.index;
      if (maskedAt(abs)) continue;
      swcOnAttributes.push({
        event: m[1],
        script: m[2],
        raw: m[0],
        start: abs,
        end: span.start + m.index + m[0].length
      });
    }
  }

  return { templateSpans: spans, expressions, variables, eaMarkers, swcOnAttributes, members: extractMembers(text) };
}

/**
 * Extract component members from decorators and class fields.
 * - `@state('aa') private latestRound: number = 0;`  → member `aa` (kind state)
 * - `@attribute(...)` → member (kind attribute)
 * - `private foo: number = 0;`                       → member `foo` (kind property)
 * - `methodName(...) { }`                            → member (kind method)
 */
export function extractMembers(text: string): SwcMember[] {
  const members: SwcMember[] = [];
  const lines = text.split('\n');
  let lastDecorator: { name: string; arg?: string } | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // decorator line like @state('aa') or @attribute('x')
    const decMatch = line.match(/^\s*@(\w+)\(\s*['"]([^'"]+)['"]/);
    if (decMatch) {
      lastDecorator = { name: decMatch[1], arg: decMatch[2] };
      continue;
    }
    const bareDec = line.match(/^\s*@(\w+)\s*$/);
    if (bareDec) {
      lastDecorator = { name: bareDec[1] };
      continue;
    }

    // class field/property declaration: [modifier] name(: type) (= value);
    // type is optional (e.g. `private x;`); exclude braces/templates
    const fieldMatch = line.match(/^\s*(?:private|public|protected|static|readonly|\s)*\s*([A-Za-z_$][\w$]*)\s*(?::\s*([^=;{]*))?\s*[=;]?\s*(?:[^=;{}]*)\s*;?\s*$/);
    if (fieldMatch && !line.trim().startsWith('//') && !line.trim().endsWith('{')) {
      const name = fieldMatch[1];
      const type = fieldMatch[2]?.trim();
      if (lastDecorator && (lastDecorator.name === 'state' || lastDecorator.name === 'attribute')) {
        members.push({
          name: lastDecorator.arg ?? name,
          kind: lastDecorator.name === 'state' ? 'state' : 'attribute',
          decoratorName: lastDecorator.name,
          type,
          line: i
        });
      } else {
        members.push({ name, kind: 'property', line: i, type });
      }
      lastDecorator = null;
      continue;
    }

    // method declaration: name(...) { ... } (exclude control-flow keywords)
    const methodMatch = line.match(/^\s*(?:async\s+)?([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*[{\{]/);
    if (methodMatch && !line.trim().startsWith('//') && !/^(if|for|while|switch|catch|function)$/.test(methodMatch[1])) {
      members.push({ name: methodMatch[1], kind: 'method', line: i });
      lastDecorator = null;
      continue;
    }

    // reset decorator state if we hit a non-member line (e.g. method body, template)
    if (line.trim() !== '' && !line.trim().startsWith('@')) {
      lastDecorator = null;
    }
  }

  return members;
}

/**
 * Build diagnostics from a scan: unbalanced expressions, stray end markers,
 * unclosed `@var@`, unknown `swc-on-*` events.
 */
export function analyze(result: ScanResult, text: string) {
  const diagnostics: Array<{ message: string; start: Position; end: Position }> = [];

  const push = (offset: number, len: number, message: string) => {
    const start = toLineCol(text, offset);
    const end = toLineCol(text, offset + Math.max(len, 1));
    diagnostics.push({ message, start, end });
  };

  // balance `{{...}}` with a proper little state machine
  for (const span of result.templateSpans) {
    const body = text.slice(span.start, span.end);
    let i = 0;
    const stack: Array<{ kind: string; start: number }> = [];
    while (i < body.length) {
      // skip `${...}` JS interpolation entirely (strings/comments inside are JS, not SWC)
      if (body.startsWith('${', i)) {
        let d = 0;
        let j = i + 2;
        while (j < body.length) {
          if (body[j] === '\\') { j += 2; continue; }
          if (body[j] === '`') { const k = skipTemplate(body, j); j = k ?? j + 1; continue; }
          if (body[j] === "'" || body[j] === '"') { const k = skipQuoted(body, j, body[j]); j = k ?? j + 1; continue; }
          if (body.startsWith('${', j)) { d++; j += 2; continue; }
          if (body[j] === '}' && d === 0) { j++; break; }
          if (body[j] === '}' && d > 0) { d--; }
          j++;
        }
        i = j;
        continue;
      }
      // skip single/template strings in template text (e.g. attribute values)
      if (body[i] === "'" || body[i] === '"') {
        const k = skipQuoted(body, i, body[i]);
        if (k !== null) { i = k; continue; }
      }
      let matched: { kind: string; len: number } | null = null;
      for (const start of EXPRESSION_STARTS) {
        if (body.startsWith(start, i)) { matched = { kind: start, len: start.length }; break; }
      }
      if (matched) {
        stack.push({ kind: matched.kind, start: span.start + i });
        i += matched.len;
        continue;
      }
      if (body.startsWith(EXPRESSION_END, i)) {
        if (stack.length > 0) {
          stack.pop();
        } else {
          push(span.start + i, EXPRESSION_END.length, 'SWC: 닫는 마커 `}}`에 대응하는 `{{`이 없습니다.');
        }
        i += EXPRESSION_END.length;
        continue;
      }
      i++;
    }
    for (const unclosed of stack) {
      push(unclosed.start, 2, `SWC: \`${unclosed.kind}\` 표현식이 닫히지 않았습니다 (\`}}\` 누락).`);
    }
  }

  // unclosed `@var@`
  for (const v of result.variables) {
    if (v.raw.endsWith(VAR_WRAP.end) && v.name.includes(VAR_WRAP.end)) {
      push(v.start, v.raw.length, `SWC: \`@\` 변수 래퍼가 잘못되었습니다: \`${v.raw}\``);
    }
  }

  // ea start/end matching
  const starts = result.eaMarkers.filter(m => m.name === 'start');
  for (const s of starts) {
    const endMatch = result.eaMarkers.find(m => m.id === s.id && m.type === s.type && m.name === 'end');
    if (!endMatch) {
      push(s.start, s.raw.length, `SWC: \`ea:${s.id}:start:${s.type}\`에 대응하는 end 마커가 없습니다.`);
    }
  }

  // unknown swc-on event
  for (const attr of result.swcOnAttributes) {
    if (attr.event === 'connected' || attr.event.startsWith('before-') || attr.event.startsWith('after-')) continue;
    if (!DOM_EVENT_NAMES.includes(attr.event)) {
      push(attr.start, attr.raw.length, `SWC: 알 수 없는 이벤트 \`swc-on-${attr.event}\`입니다.`);
    }
  }

  return diagnostics;
}
