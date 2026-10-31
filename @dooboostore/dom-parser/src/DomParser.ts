import './node/registerNodeClasses';
import { DocumentBase } from './node/DocumentBase';
import { TextBase } from './node/TextBase';
import { Comment } from './node/Comment';
import { WindowBase } from './window/WindowBase';
import { ElementBase } from './node/elements/ElementBase';
import { ElementFactory } from './factory/ElementFactory';
import {HTMLTemplateElement} from "./node";
import { elementNamespaceForTag, childNamespaceForElement } from './utils/namespaces';

// Inject dependencies into ElementBase to break circular references
// without using 'require' or 'global' injection magic.
ElementBase.dependencies = {
  ElementFactory,
  TextBase,
  Comment
};

export interface DomParserOptions {
  href?: string;
  onUrlChange?: (url: string) => void;
  fetch?: typeof globalThis.fetch;
}

/**
 * Parses an attribute string into constructor options: the `is` value for
 * customized built-ins plus a pre-parsed attribute map, so getAttribute()
 * works during construction. Entity values are decoded (attribute values
 * are stored decoded; serialization re-escapes them).
 */
function extractIsAttr(attrStr: string, decode: (s: string) => string): any {
  if (!attrStr) return undefined;
  const match = attrStr.match(/(?:^|\s)is=(?:(['"])(.*?)\1|([^\s>]+))/i);
  const options: any = match ? { is: match[2] || match[3] } : {};

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

export class DomParser {
  private _window: Window | null;
  private _document: Document | null;

  constructor(html: string, option?: DomParserOptions) {
    // Create WindowBase instance with the document
    const windowBase = new WindowBase({ initialUrl: option?.href, onUrlChange: option?.onUrlChange, fetch: option?.fetch });
    this._window = windowBase as unknown as Window;
    this._document = windowBase.document as any;

    // Parse the provided HTML string
    this.parseHTML(html);

    // Set up document references after parsing
    this.setupDocumentReferences();

    // Simulate document loading process
    if (this._document && (this._document as any).simulateLoading) {
      (this._document as any).simulateLoading();
    }
  }

  get window(): Window {
    if (!this._window) {
      throw new Error('DomParser has been destroyed');
    }
    return this._window;
  }

  get document(): Document {
    if (!this._document) {
      throw new Error('DomParser has been destroyed');
    }
    return this._document;
  }

  /**
   * Destroy the DomParser instance and free memory
   */
  destroy(): void {
    if (this._window) {
      this._window.close();
      this._window = null;
    }

    this._document = null;
  }

  /**
   * Load new HTML content and replace the current document
   */
  loadHTML(html: string): void {
    if (!this._document) {
      throw new Error('DomParser has been destroyed');
    }

    // Clear current document content
    this.clearDocument();

    // Parse new HTML
    this.parseHTML(html);

    // Set up document references after parsing
    this.setupDocumentReferences();
  }

  private clearDocument(): void {
    if (!this._document) return;

    // Clear document body and head content while preserving structure
    if (this._document.head) {
      while (this._document.head.firstChild) {
        this._document.head.removeChild(this._document.head.firstChild);
      }
    }

    if (this._document.body) {
      while (this._document.body.firstChild) {
        this._document.body.removeChild(this._document.body.firstChild);
      }
    }
  }

  parseHTML(html: string): void {
    if (!this._document) {
      throw new Error('DomParser has been destroyed');
    }

    // Ensure basic HTML structure if input is empty or lacks it
    if (!html.trim()) {
      html = '<html><head></head><body></body></html>';
    } else if (!/<html/i.test(html)) {
      // If it's just a fragment, we still need html/head/body for a full document
      // but only if it's not explicitly intended to be a fragment?
      // Actually, standard DOMParser.parseFromString always creates them.
      html = `<html><head></head><body>${html}</body></html>`;
    }

    // Basic HTML parsing - this is a simplified version
    this.parseHTMLString(html, this.document);
  }

  private parseHTMLString(html: string, parent: any): void {
    // Remove DOCTYPE if present
    html = html.replace(/<!DOCTYPE[^>]*>/i, '').trim();

    if (!html) return;

    // Derive the initial namespace context from the parent (usually HTML).
    const parentNS: string | null = (parent as any)?.namespaceURI ?? null;
    this.parseHTMLRecursive(html, parent, parentNS);
  }

  // HTML void elements (no end tag, no children).
  private static readonly VOID_TAGS = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'param', 'source', 'track', 'wbr'
  ]);

  private parseHTMLRecursive(html: string, parent: any, parentNS: string | null = null): void {
    this.parseNodes(html, 0, parent, parentNS, null);
  }

  /**
   * Spec "insert a character": consecutive character data merges into the
   * previous Text sibling instead of spawning a new Text node.
   */
  private appendText(parent: any, rawText: string): void {
    const decoded = this.decodeHTMLEntities(rawText);
    const last = parent.lastChild as any;
    if (last && last.nodeType === 3 /* TEXT_NODE */ && typeof last.appendData === 'function') {
      last.appendData(decoded);
      return;
    }
    parent.appendChild(new TextBase(decoded, this.document));
  }

  /**
   * Single-pass HTML parser: scans `html` forward exactly once starting at
   * `pos`, appending nodes to `parent`. Stops after consuming this level's
   * `</stopTag>` (returns the position past it) or at end of input.
   *
   * Unlike the previous find-matching-close + substring + recurse design
   * (O(depth x size)), every character is examined a constant number of
   * times, so parsing is linear in input size.
   */
  private parseNodes(
    html: string,
    pos: number,
    parent: any,
    parentNS: string | null,
    stopTag: string | null
  ): number {
    const len = html.length;

    while (pos < len) {
      // Find next tag or comment
      const tagStart = html.indexOf('<', pos);

      if (tagStart === -1) {
        // No more tags, add remaining text if any
        // Per HTML spec ("insert a character"), character references are
        // decoded at parse time so Text.data holds decoded text.
        // Only all-whitespace chunks are dropped; other text is kept exactly.
        const remainingText = html.substring(pos);
        if (remainingText.trim()) {
          this.appendText(parent, remainingText);
        }
        return len;
      }

      // Add text before tag if any
      if (tagStart > pos) {
        const textContent = html.substring(pos, tagStart);
        if (textContent.trim()) {
          this.appendText(parent, textContent);
        }
      }

      // Check if this is a comment
      if (html.charCodeAt(tagStart + 1) === 33 /* ! */
        && html.charCodeAt(tagStart + 2) === 45 /* - */
        && html.charCodeAt(tagStart + 3) === 45 /* - */) {
        const commentEnd = html.indexOf('-->', tagStart + 4);
        if (commentEnd !== -1) {
          const commentContent = html.substring(tagStart + 4, commentEnd);
          const commentNode = new Comment(commentContent, this.document);
          parent.appendChild(commentNode);
          pos = commentEnd + 3;
          continue;
        } else {
          // Malformed comment, treat as text
          const textNode = new TextBase(html.substring(tagStart, tagStart + 4), this.document);
          parent.appendChild(textNode);
          pos = tagStart + 4;
          continue;
        }
      }

      // Find tag end
      const tagEnd = html.indexOf('>', tagStart);
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
        this.appendText(parent, '<');
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
        this.appendText(parent, '<');
        pos = tagStart + 1;
        continue;
      }

      let attributes = spaceIndex === -1 ? '' : tagContent.substring(spaceIndex + 1);

      // Only remove trailing slash for self-closing tags (not from attribute values)
      if (attributes.endsWith('/')) {
        attributes = attributes.slice(0, -1).trim();
      }

      // Check if it's a self-closing tag
      const isSelfClosing = tagContent.endsWith('/') || DomParser.VOID_TAGS.has(tagName.toLowerCase());

      // Create element in the correct namespace: <svg>/<math> switch to
      // their foreign namespace, everything else inherits the parent context.
      // Per the DOM spec, tagName is upper-cased for HTML elements only,
      // so SVG elements keep their qualified names (issue #15).
      const elementNS = elementNamespaceForTag(tagName, parentNS);
      const elementOptions: any = { ...(extractIsAttr(attributes, (s) => this.decodeHTMLEntities(s)) as object), namespaceURI: elementNS };
      const element = (this.document as any).createElementNS(elementNS, tagName.toLowerCase(), elementOptions);

      // 1. Append to parent FIRST so parentElement is available during attributeChangedCallback
      parent.appendChild(element);

      // 2. Parse attributes AFTER appending to DOM tree
      if (attributes.trim()) {
        this.parseAttributes(attributes, element);
      }

      pos = tagEnd + 1;
      if (isSelfClosing) {
        continue;
      }

      // Children of <foreignObject> go back to the HTML namespace
      // (HTML integration point); otherwise they inherit this element.
      const childNS = childNamespaceForElement(tagName, elementNS);
      if (tagName.toLowerCase() === 'template') {
        // For template elements, parse content into the content fragment
        pos = this.parseNodes(html, pos, (element as HTMLTemplateElement).content, childNS, 'template');
      } else {
        pos = this.parseNodes(html, pos, element, childNS, tagName.toLowerCase());
      }
    }
    return pos;
  }

  private parseAttributes(attributeString: string, element: any): void {
    // Improved attribute parsing that handles complex JavaScript expressions
    let position = 0;
    const length = attributeString.length;

    while (position < length) {
      // Skip whitespace
      while (position < length && /\s/.test(attributeString[position])) {
        position++;
      }

      if (position >= length) break;

      // Find attribute name
      const nameStart = position;
      while (position < length && /[\w:-]/.test(attributeString[position])) {
        position++;
      }

      if (position === nameStart) {
        // Invalid character, skip it
        position++;
        continue;
      }

      const name = attributeString.substring(nameStart, position);

      // Skip whitespace
      while (position < length && /\s/.test(attributeString[position])) {
        position++;
      }

      let value = '';

      // Check if there's an equals sign
      if (position < length && attributeString[position] === '=') {
        position++; // Skip '='

        // Skip whitespace
        while (position < length && /\s/.test(attributeString[position])) {
          position++;
        }

        if (position < length) {
          const quote = attributeString[position];

          if (quote === '"' || quote === "'") {
            // Quoted value - find matching closing quote
            position++; // Skip opening quote
            const valueStart = position;

            while (position < length && attributeString[position] !== quote) {
              position++;
            }

            value = attributeString.substring(valueStart, position);

            if (position < length && attributeString[position] === quote) {
              position++; // Skip closing quote
            }
          } else {
            // Unquoted value - read until whitespace or end
            const valueStart = position;
            while (position < length && !/\s/.test(attributeString[position])) {
              position++;
            }
            value = attributeString.substring(valueStart, position);
          }
        }
      }

      // Decode HTML entities in attribute values
      value = this.decodeHTMLEntities(value);

      // Force trigger attributeChangedCallback if the element is already created
      // Note: we can't just check if it's identical because the oldValue might be null
      // in the context of attributeChangedCallback, but getAttribute() might return the value
      // we already injected during construction.
      const oldValue = element.getAttribute(name);

      // If we already set it during construction, we still need to trigger the callback
      // since the construction phase doesn't trigger callbacks (per web standard)
      if (oldValue !== value) {
        element.setAttribute(name, value);
      } else {
        // Values match, meaning it was pre-populated during constructor.
        // We must manually trigger setAttribute to fire the callback.
        // Instead of remove+set (which fires callback twice), we directly fire the callback
        if (typeof element.attributeChangedCallback === 'function') {
          const ctor = element.constructor;
          const observedAttributes = ctor.observedAttributes || [];
          if (observedAttributes.includes(name) || observedAttributes.includes(name.toLowerCase())) {
            element.attributeChangedCallback(name, null, value);
          }
        }
      }
    }
  }

  /**
   * Decode HTML entities in a string
   */
  private decodeHTMLEntities(str: string): string {
    const entityMap: { [key: string]: string } = {
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
      '&nbsp;': ' ',
      '&hellip;': '…',
      '&mdash;': '—',
      '&ndash;': '–',
      '&lsquo;': '\u2018',
      '&rsquo;': '\u2019',
      '&ldquo;': '"',
      '&rdquo;': '"'
    };

    return str.replace(/&[a-zA-Z0-9#]+;/g, entity => {
      // Handle named entities
      if (entityMap[entity]) {
        return entityMap[entity];
      }

      // Handle numeric entities like &#39; &#34;
      if (entity.startsWith('&#') && entity.endsWith(';')) {
        const numStr = entity.slice(2, -1);
        const num = parseInt(numStr, 10);
        if (!isNaN(num)) {
          return String.fromCharCode(num);
        }
      }

      // Handle hex entities like &#x27;
      if (entity.startsWith('&#x') && entity.endsWith(';')) {
        const hexStr = entity.slice(3, -1);
        const num = parseInt(hexStr, 16);
        if (!isNaN(num)) {
          return String.fromCharCode(num);
        }
      }

      // Return original if not recognized
      return entity;
    });
  }

  /**
   * Set up document references after HTML parsing.
   * Collects html/head/body in a single O(n) walk instead of three
   * full-tree querySelectorAll passes.
   */
  private setupDocumentReferences(): void {
    // Find HTML, HEAD, and BODY elements
    const allHtmlElements: any[] = [];
    const allHeadElements: any[] = [];
    const allBodyElements: any[] = [];
    const stack: any[] = [this.document];
    while (stack.length > 0) {
      const node = stack.pop();
      const children = (node as any)._childNodesInternal ?? [];
      for (let i = children.length - 1; i >= 0; i--) {
        const child = children[i];
        if (child.nodeType === 1) {
          const tag = (child.tagName || '').toLowerCase();
          if (tag === 'html') allHtmlElements.push(child);
          else if (tag === 'head') allHeadElements.push(child);
          else if (tag === 'body') allBodyElements.push(child);
          stack.push(child);
        }
      }
    }

    // Choose the HTML element with content, then attributes, then first one
    let htmlElement = null;
    // First priority: HTML with attributes (lang, data-theme 등)
    for (let i = 0; i < allHtmlElements.length; i++) {
      const html = allHtmlElements[i];
      if (html.attributes.length > 0) {
        htmlElement = html;
        break;
      }
    }
    // Second priority: HTML with child nodes (content)
    if (!htmlElement) {
      for (let i = 0; i < allHtmlElements.length; i++) {
        const html = allHtmlElements[i];
        if (html.childNodes.length > 0) {
          htmlElement = html;
          break;
        }
      }
    }
    // Last resort: first HTML
    if (!htmlElement && allHtmlElements.length > 0) {
      htmlElement = allHtmlElements[0];
    }

    // Choose the HEAD element with content, then attributes, then first one
    let headElement = null;
    // First priority: HEAD with child nodes (content)
    for (let i = 0; i < allHeadElements.length; i++) {
      const head = allHeadElements[i];
      if (head.childNodes.length > 0) {
        headElement = head;
        break;
      }
    }
    // Second priority: HEAD with attributes
    if (!headElement) {
      for (let i = 0; i < allHeadElements.length; i++) {
        const head = allHeadElements[i];
        if (head.attributes.length > 0) {
          headElement = head;
          break;
        }
      }
    }
    // Last resort: first HEAD
    if (!headElement && allHeadElements.length > 0) {
      headElement = allHeadElements[0];
    }

    // Choose the BODY element with content, then attributes, then first one
    let bodyElement = null;

    // First priority: BODY with child nodes (content)
    for (let i = 0; i < allBodyElements.length; i++) {
      const body = allBodyElements[i];
      if (body.childNodes.length > 0) {
        bodyElement = body;
        break;
      }
    }

    // Second priority: BODY with attributes
    if (!bodyElement) {
      for (let i = 0; i < allBodyElements.length; i++) {
        const body = allBodyElements[i];
        if (body.attributes.length > 0) {
          bodyElement = body;
          break;
        }
      }
    }

    // Last resort: first BODY
    if (!bodyElement && allBodyElements.length > 0) {
      bodyElement = allBodyElements[0];
    }

    // Set document references
    if (htmlElement) {
      (this.document as any).documentElement = htmlElement;
    }
    if (headElement) {
      (this.document as any).head = headElement;
    }
    if (bodyElement) {
      (this.document as any).body = bodyElement;
    }
  }
}
