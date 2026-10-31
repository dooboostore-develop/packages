import { elementNamespaceForTag, childNamespaceForElement } from './utils/namespaces';

/**
 * Single-pass HTML parsing shared by the full-document parser (DomParser)
 * and the fragment parser (ElementBase.parseAndAppendHTML / innerHTML).
 *
 * Previously these were two independent loops that drifted apart
 * (tag-open checks, quote-aware tag ends, raw-text elements, template
 * inertness, whitespace handling). Every behavioral difference found during
 * the unification was verified against real browsers via Playwright, and
 * the unified version implements the browser behavior in all cases.
 */

const VOID_TAGS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
]);

const ENTITY_MAP: { [key: string]: string } = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&#34;': '"',
  '&apos;': "'",
  '&copy;': '©',
  '&reg;': '®',
  '&trade;': '™',
  '&nbsp;': ' ',
  '&hellip;': '…',
  '&mdash;': '—',
  '&ndash;': '–',
  '&lsquo;': '\u2018',
  '&rsquo;': '\u2019',
  '&ldquo;': '"',
  '&rdquo;': '"',
};

export function decodeHTMLEntities(str: string): string {
  return str.replace(/&[a-zA-Z0-9#]+;/g, entity => {
    if (ENTITY_MAP[entity]) {
      return ENTITY_MAP[entity];
    }
    if (entity.startsWith('&#') && entity.endsWith(';')) {
      // Hex entities like &#x27;
      if (entity.startsWith('&#x')) {
        const num = parseInt(entity.slice(3, -1), 16);
        if (!Number.isNaN(num)) return String.fromCharCode(num);
      } else {
        const num = parseInt(entity.slice(2, -1), 10);
        if (!Number.isNaN(num)) return String.fromCharCode(num);
      }
    }
    return entity;
  });
}

/**
 * Quote-aware tag-end scan: the first ">" outside single/double quotes.
 */
export function findTagEnd(html: string, startIndex: number): number {
  let i = startIndex + 1;
  let inQuotes = false;
  let quoteChar = '';
  while (i < html.length) {
    const char = html[i];
    if (!inQuotes) {
      if (char === '"' || char === "'") {
        inQuotes = true;
        quoteChar = char;
      } else if (char === '>') return i;
    } else if (char === quoteChar) {
      inQuotes = false;
    }
    i++;
  }
  return -1;
}

/**
 * Parses an attribute string into constructor options: the `is` value for
 * customized built-ins plus a pre-parsed attribute map, so getAttribute()
 * works during construction. Entity values are decoded (attributes are
 * stored decoded; serialization re-escapes them).
 */
export function extractIsAttr(
  attrStr: string,
  decode: (s: string) => string,
  useInert?: boolean,
  isInert?: boolean
): any {
  const match = attrStr ? attrStr.match(/(?:^|\s)is=(?:(['"])(.*?)\1|([^\s>]+))/i) : null;
  const options: any = match ? { is: match[2] || match[3] } : {};
  if (useInert) {
    options.inert = isInert;
    if (!attrStr) return options;
  } else if (!attrStr) {
    return undefined;
  }

  const parsedAttributes = new Map<string, string>();
  let pos = 0;
  const len = attrStr.length;
  while (pos < len) {
    while (pos < len && /\s/.test(attrStr[pos])) pos++;
    if (pos >= len) break;
    const nameStart = pos;
    while (pos < len && /[\w:-]/.test(attrStr[pos])) pos++;
    if (pos === nameStart) {
      pos++;
      continue;
    }
    const name = attrStr.substring(nameStart, pos);
    while (pos < len && /\s/.test(attrStr[pos])) pos++;
    let value = '';
    if (pos < len && attrStr[pos] === '=') {
      pos++;
      while (pos < len && /\s/.test(attrStr[pos])) pos++;
      if (pos < len) {
        const quote = attrStr[pos];
        if (quote === '"' || quote === "'") {
          pos++;
          const valueStart = pos;
          while (pos < len && attrStr[pos] !== quote) pos++;
          value = attrStr.substring(valueStart, pos);
          if (pos < len && attrStr[pos] === quote) pos++;
        } else {
          const valueStart = pos;
          while (pos < len && !/\s/.test(attrStr[pos])) pos++;
          value = attrStr.substring(valueStart, pos);
        }
      }
    }
    parsedAttributes.set(name, decode(value));
  }
  options.parsedAttributes = parsedAttributes;
  return options;
}

/**
 * Hooks that adapt the shared scanner to each call site. Both callers used
 * to carry their own copy of this loop; the only intentional behavioral
 * differences left are the ones carried here (inert flag, per-node text
 * fixups, and how nodes get constructed).
 */
export interface HtmlParseContext {
  /** Owner document for created nodes. */
  ownerDocument: any;
  /** Decode HTML entities in text/attribute values. */
  decode: (s: string) => string;
  /** Optional per-chunk text transform (innerHTML path fixes broken closing tags). */
  fixText?: (s: string) => string;
  createText(data: string): any;
  createComment(data: string): any;
  createElement(tagName: string, namespaceURI: string | null, options: any): any;
  appendChild(parent: any, child: any): void;
  /** Forwarded to the `is` options as `inert` (innerHTML path only). */
  inert?: boolean;
  /** Whether `<template>` content parses inert. */
  templateInert?: boolean;
}

/**
 * Attribute parsing with IDL synchronization and custom-element callback
 * handling shared by both call sites.
 */
function applyAttributes(attributeString: string, element: any, decode: (s: string) => string): void {
  let position = 0;
  const length = attributeString.length;
  while (position < length) {
    while (position < length && /\s/.test(attributeString[position])) position++;
    if (position >= length) break;
    const nameStart = position;
    while (position < length && /[\w:-]/.test(attributeString[position])) position++;
    if (position === nameStart) {
      position++;
      continue;
    }
    const name = attributeString.substring(nameStart, position);
    while (position < length && /\s/.test(attributeString[position])) position++;
    let value = '';
    if (position < length && attributeString[position] === '=') {
      position++;
      while (position < length && /\s/.test(attributeString[position])) position++;
      if (position < length) {
        const quote = attributeString[position];
        if (quote === '"' || quote === "'") {
          position++;
          const valueStart = position;
          while (position < length && attributeString[position] !== quote) position++;
          value = attributeString.substring(valueStart, position);
          if (position < length && attributeString[position] === quote) position++;
        } else {
          const valueStart = position;
          while (position < length && !/\s/.test(attributeString[position])) position++;
          value = attributeString.substring(valueStart, position);
        }
      }
    }

    const decodedValue = decode(value);
    const oldValue = element.getAttribute(name);
    // Always route through setAttribute: subclasses sync their IDL fields
    // (input.value/type/checked, etc.) inside their setAttribute override,
    // which the constructor's direct map injection bypasses.
    // setAttribute itself never fires callbacks (callers do), so this is
    // callback-neutral; the manual initial-parse trigger below fires once.
    element.setAttribute(name, decodedValue);
    if (oldValue === decodedValue) {
      // Values match: pre-populated during construction, so manually trigger
      // the callback since the construction phase doesn't trigger callbacks
      // per web standard. Instead of remove+set (which fires callback twice),
      // we directly fire the callback.
      if (typeof element.attributeChangedCallback === 'function') {
        const ctor = element.constructor;
        const observedAttributes = ctor.observedAttributes || [];
        if (observedAttributes.includes(name) || observedAttributes.includes(name.toLowerCase())) {
          element.attributeChangedCallback(name, null, decodedValue);
        }
      }
    }
  }
}

/**
 * Merge character data into the previous Text sibling instead of spawning
 * a new Text node ("insert a character"), so entities and bogus "<" runs
 * stay in a single node like browsers produce.
 */
function appendText(parent: any, rawText: string, ctx: HtmlParseContext): void {
  if (!rawText) return;
  const decoded = ctx.decode(rawText);
  const text = ctx.fixText ? ctx.fixText(decoded) : decoded;
  const last = (parent as any).lastChild as any;
  if (last && last.nodeType === 3 && typeof last.appendData === 'function') {
    last.appendData(text);
    return;
  }
  const node = ctx.createText(text);
  if (node) ctx.appendChild(parent, node);
}

/**
 * Single-pass HTML parser: scans `html` forward exactly once starting at
 * `pos`, appending nodes to `parent`. Stops after consuming this level's
 * `</stopTag>` (returns the position past it) or at end of input.
 */
export function parseNodes(
  html: string,
  pos: number,
  parent: any,
  parentNS: string | null,
  stopTag: string | null,
  ctx: HtmlParseContext
): number {
  const len = html.length;

  while (pos < len) {
    // Find next tag or comment
    const tagStart = html.indexOf('<', pos);

    if (tagStart === -1) {
      // No more tags, add remaining text if any
      // Per HTML spec ("insert a character"), character references are
      // decoded at parse time so Text.data holds decoded text.
      const remainingText = html.substring(pos);
      if (remainingText) {
        appendText(parent, remainingText, ctx);
      }
      return len;
    }

    // Add text before tag if any
    if (tagStart > pos) {
      const textContent = html.substring(pos, tagStart);
      if (textContent) {
        appendText(parent, textContent, ctx);
      }
    }

    // Check if this is a comment
    if (html.charCodeAt(tagStart + 1) === 33 /* ! */
      && html.charCodeAt(tagStart + 2) === 45 /* - */
      && html.charCodeAt(tagStart + 3) === 45 /* - */) {
      const commentEnd = html.indexOf('-->', tagStart + 4);
      if (commentEnd !== -1) {
        const commentContent = html.substring(tagStart + 4, commentEnd);
        ctx.appendChild(parent, ctx.createComment(commentContent));
        pos = commentEnd + 3;
        continue;
      }
      // Malformed (unterminated) comment: emit the literal "<!--" as text
      // and reconsume, so no input is lost.
      appendText(parent, html.substring(tagStart, tagStart + 4), ctx);
      pos = tagStart + 4;
      continue;
    }

    // Find tag end. Attribute values may contain ">" (e.g. title="a>b"),
    // so scan quote-aware instead of a naive indexOf('>').
    const tagEnd = findTagEnd(html, tagStart);
    if (tagEnd === -1) break;

    const tagContent = html.substring(tagStart + 1, tagEnd);

    // Check if it's a closing tag
    if (tagContent.charCodeAt(0) === 47 /* / */) {
      pos = tagEnd + 1;
      if (stopTag !== null) {
        // End of this element's content only when the tag matches;
        // stray closing tags are ignored per the HTML spec (the old
        // code dropped the rest of the input here).
        const closeName = tagContent.substring(1).trim().split(/\s+/, 1)[0];
        if (closeName !== undefined && closeName.toLowerCase() === stopTag) {
          return pos;
        }
        continue;
      }
      // Top level: stray closing tag, ignore and keep parsing.
      continue;
    }

    // Parse tag name and attributes
    const spaceIndex = tagContent.indexOf(' ');
    const tagName = spaceIndex === -1 ? tagContent.replace('/', '') : tagContent.substring(0, spaceIndex);

    if (!tagName) {
      // "<>" or "< ..." is not a tag per the HTML spec (tag open state:
      // anything but a letter, "!", "/" or "?" emits "<" as text).
      // Emit the "<" literally and resume right after it.
      appendText(parent, '<', ctx);
      pos = tagStart + 1;
      continue;
    }

    // "<3", "<%", ... is not a tag either: after the comment ("!")
    // and closing ("/") paths handled above, the tag open state only
    // accepts an ASCII letter. Anything else (e.g. "?") keeps its
    // previous path; other characters emit "<" as text and reconsume.
    const firstCode = tagContent.charCodeAt(0);
    const isAsciiLetter = (firstCode >= 65 && firstCode <= 90) || (firstCode >= 97 && firstCode <= 122);
    if (!isAsciiLetter && firstCode !== 33 /* ! */ && firstCode !== 63 /* ? */) {
      appendText(parent, '<', ctx);
      pos = tagStart + 1;
      continue;
    }

    let attributes = spaceIndex === -1 ? '' : tagContent.substring(spaceIndex + 1);

    // Only remove trailing slash for self-closing tags (not from attribute values)
    if (attributes.endsWith('/')) {
      attributes = attributes.slice(0, -1).trim();
    }

    // Check if it's a self-closing tag
    const isSelfClosing = tagContent.endsWith('/') || VOID_TAGS.has(tagName.toLowerCase());

    // Create element in the correct namespace: <svg>/<math> switch to
    // their foreign namespace, everything else inherits the parent context.
    // Per the DOM spec, tagName is upper-cased for HTML elements only,
    // so SVG elements keep their qualified names (issue #15).
    const elementNS = elementNamespaceForTag(tagName, parentNS);
    const elementOptions: any = { ...(extractIsAttr(attributes, (s) => ctx.decode(s), true, ctx.inert) as object), namespaceURI: elementNS };
    const element = ctx.createElement(tagName, elementNS, elementOptions);

    // Append to parent FIRST so parentElement/ownerDocument are available
    // during attributeChangedCallback and child parsing can find ancestors.
    ctx.appendChild(parent, element);

    // Parse attributes AFTER appending to DOM tree
    if (attributes.trim()) {
      applyAttributes(attributes, element, ctx.decode);
    }

    pos = tagEnd + 1;
    if (isSelfClosing) {
      continue;
    }

    // <style> and <script> are raw-text elements: their content is text,
    // never markup (verified against Chromium).
    const lowerTagName = tagName.toLowerCase();
    if (lowerTagName === 'style' || lowerTagName === 'script') {
      const closingTag = `</${lowerTagName}>`;
      const closingTagIndex = html.indexOf(closingTag, tagEnd + 1);
      if (closingTagIndex !== -1) {
        const content = html.substring(tagEnd + 1, closingTagIndex);
        if (content) {
          appendText(element, content, ctx);
        }
        pos = closingTagIndex + closingTag.length;
        continue;
      }
      // Unterminated raw-text element: treat the rest as text.
      const rest = html.substring(tagEnd + 1);
      if (rest) {
        appendText(element, rest, ctx);
      }
      return len;
    }

    // Children of <foreignObject> go back to the HTML namespace
    // (HTML integration point); otherwise they inherit this element.
    const childNS = childNamespaceForElement(tagName, elementNS);
    if (lowerTagName === 'template') {
      // For template elements, parse content into the content fragment.
      // Content may stay inert (matching innerHTML semantics).
      pos = parseNodes(html, pos, (element as any).content ?? element, childNS, 'template', {
        ...ctx,
        inert: ctx.templateInert ?? ctx.inert,
      });
    } else {
      pos = parseNodes(html, pos, element, childNS, lowerTagName, ctx);
    }
  }
  return pos;
}
