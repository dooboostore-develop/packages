import { splitTopLevel, splitCombinators, splitCompound, splitPseudo } from './parse';

/**
 * Strict selector syntax validation for the PUBLIC entry points
 * (querySelector/querySelectorAll/matches/closest).
 *
 * The internal parser is deliberately forgiving — an unrecognised component
 * becomes a matcher that never matches, which is what `:is()`/`:where()`
 * (and `:has()`'s list) require. But the top-level selector must throw a
 * SyntaxError DOMException for malformed input, like browsers do.
 *
 * Every rule below was measured in Chromium:
 *   throws  -> '', ' ', '[', ']', 'a >', '>a', 'a ~', '..a', '#', '.', ':',
 *              '::', 'a,,b', ',', 'a,', ':not()', ':has()', ':nth-child(',
 *              'a[', '[a=]', ':unknown', 'a b >'
 *   ok      -> ':is()', '::before', 'a::before', ':scope', 'a:not(b c)',
 *              ':has(> a)', 'a:is(b, )', ':nth-child(2 of a)', ':host(.x)'
 */

class SyntaxErrorDOMException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SyntaxError';
  }
}

/** Pseudo-classes/elements the engine understands plus the common CSS ones. */
const KNOWN_PSEUDOS = new Set([
  // implemented
  'scope', 'checked', 'disabled', 'enabled', 'focus', 'first', 'first-child', 'last', 'last-child',
  'even', 'odd', 'nth-child', 'eq', 'gt', 'lt', 'contains', 'visible', 'hidden', 'nth-of-type',
  'nth-last-child', 'nth-last-of-type', 'first-of-type', 'last-of-type', 'empty', 'root',
  'only-child', 'only-of-type', 'lang', 'link', 'visited', 'required', 'optional', 'read-write',
  'read-only', 'placeholder-shown', 'target', 'in-range', 'out-of-range',
  // functional forms handled by the factory
  'not', 'is', 'where', 'has', 'host', 'host-context',
  // widely used CSS pseudo-classes (accepted by browsers even when we don't
  // match on them)
  'focus-within', 'focus-visible', 'hover', 'active', 'any-link', 'local-link', 'target-within',
  'default', 'indeterminate', 'valid', 'invalid', 'user-valid', 'user-invalid', 'autofill',
  'blank', 'defined', 'fullscreen', 'modal', 'picture-in-picture', 'popover-open', 'playing',
  'paused', 'muted', 'seeking', 'buffering', 'stalled', 'volume-locked', 'open', 'closed',
  'first-line', 'first-letter', 'before', 'after', 'selection', 'backdrop', 'marker',
  'placeholder', 'file-selector-button', 'part', 'slotted', 'state', 'dir',
]);

function assertBalanced(selector: string): void {
  let paren = 0;
  let bracket = 0;
  let quote = '';
  for (let i = 0; i < selector.length; i++) {
    const ch = selector[i];
    if (quote) {
      if (ch === '\\') { i++; continue; }
      if (ch === quote) quote = '';
      continue;
    }
    if (ch === '"' || ch === "'") { quote = ch; continue; }
    if (ch === '\\') { i++; continue; }
    if (ch === '(') paren++;
    else if (ch === ')') { paren--; if (paren < 0) throw new SyntaxErrorDOMException(`Unbalanced ')' in selector '${selector}'.`); }
    else if (ch === '[') bracket++;
    else if (ch === ']') { bracket--; if (bracket < 0) throw new SyntaxErrorDOMException(`Unbalanced ']' in selector '${selector}'.`); }
  }
  if (paren !== 0) throw new SyntaxErrorDOMException(`Unbalanced '(', in selector '${selector}'.`);
  if (bracket !== 0) throw new SyntaxErrorDOMException(`Unbalanced '[', in selector '${selector}'.`);
}

const ATTR_RE = /^([^=!*^$~|]+)(?:([=!*^$~|]+)(['"]?)([^'"]*)\3)?$/;

function assertValidCompound(compound: string, selector: string): void {
  const trimmed = compound.trim();
  if (!trimmed) throw new SyntaxErrorDOMException(`Empty selector in '${selector}'.`);

  // Pseudo-elements are not split by splitCompound (it treats ':' as a
  // delimiter, so '::before' would come out as [':', ':before']). Validate
  // and strip them first: browsers accept '::before' but reject bare '::'.
  let body = trimmed;
  const pseudoElementRe = /::([a-zA-Z][a-zA-Z0-9-]*)(\()?/g;
  let m: RegExpExecArray | null;
  let lastIndex = 0;
  let stripped = '';
  while ((m = pseudoElementRe.exec(body)) !== null) {
    stripped += body.slice(lastIndex, m.index);
    lastIndex = m.index + m[0].length;
    if (!KNOWN_PSEUDOS.has(m[1].toLowerCase())) {
      throw new SyntaxErrorDOMException(`Unsupported pseudo-element '::${m[1]}'.`);
    }
  }
  stripped += body.slice(lastIndex);
  if (stripped !== body) {
    // '::' alone (nothing matched the pseudo-element pattern) is invalid.
    body = stripped;
  } else if (trimmed.includes('::')) {
    throw new SyntaxErrorDOMException(`Invalid selector '${selector}'.`);
  }

  for (const component of splitCompound(body)) {
    const c = component.trim();
    if (!c) continue;
    if (c === '*') continue;
    if (c.startsWith('#')) {
      if (c.length === 1) throw new SyntaxErrorDOMException(`Invalid selector '${selector}'.`);
      continue;
    }
    if (c.startsWith('.')) {
      if (c.length === 1) throw new SyntaxErrorDOMException(`Invalid selector '${selector}'.`);
      continue;
    }
    if (c.startsWith('[')) {
      const inner = c.slice(1, -1);
      const modStripped = inner.replace(/\s+[iIsS]$/, '');
      const attrMatch = ATTR_RE.exec(modStripped);
      if (!attrMatch) throw new SyntaxErrorDOMException(`Invalid attribute selector '${selector}'.`);
      // '[a=]' and '[a=""]' differ: an unquoted empty value is a syntax
      // error in browsers, a quoted one is a valid empty-string match.
      if (attrMatch[2] && !attrMatch[3] && attrMatch[4] === '') {
        throw new SyntaxErrorDOMException(`Invalid attribute selector '${selector}'.`);
      }
      continue;
    }
    if (c.startsWith(':')) {
      const { name, arg } = splitPseudo(c.slice(1));
      if (!name) throw new SyntaxErrorDOMException(`Invalid selector '${selector}'.`);
      const lower = name.toLowerCase();
      if (!KNOWN_PSEUDOS.has(lower)) {
        throw new SyntaxErrorDOMException(`Unsupported pseudo-class ':${name}'.`);
      }
      // ':not()' and ':has()' with an empty argument are syntax errors;
      // ':is()' / ':where()' accept an empty (forgiving) list.
      if ((lower === 'not' || lower === 'has') && arg !== undefined && !arg.trim()) {
        throw new SyntaxErrorDOMException(`Invalid selector '${selector}'.`);
      }
      continue;
    }
    // tag name — anything else is a syntax error (measured: '..a' etc.)
  }
}

/**
 * Throws a SyntaxError DOMException the way browsers do for malformed
 * selectors. Call from the public query/matches entry points only.
 */
export function assertValidSelector(selector: string): void {
  if (typeof selector !== 'string') {
    throw new SyntaxErrorDOMException(`Selector must be a string.`);
  }
  if (!selector.trim()) {
    throw new SyntaxErrorDOMException(`The provided selector is empty.`);
  }
  assertBalanced(selector);

  const parts = splitTopLevel(selector, ',');
  if (parts.some(p => !p.trim())) {
    throw new SyntaxErrorDOMException(`Invalid selector '${selector}'.`);
  }

  for (const part of parts) {
    const chain = splitCombinators(part);
    if (chain.length === 0) throw new SyntaxErrorDOMException(`Invalid selector '${selector}'.`);
    // Leading combinator is only valid inside :has(); at top level it throws.
    if (chain[0].combinator !== ' ') {
      throw new SyntaxErrorDOMException(`Invalid selector '${selector}'.`);
    }
    // Trailing combinator: splitCombinators drops it, so check the text.
    if (/[>+~]\s*$/.test(part.trim())) {
      throw new SyntaxErrorDOMException(`Invalid selector '${selector}'.`);
    }
    for (const link of chain) {
      assertValidCompound(link.compound, selector);
    }
  }
}
