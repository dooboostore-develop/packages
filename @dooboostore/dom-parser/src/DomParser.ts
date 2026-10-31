import './node/registerNodeClasses';
import { DocumentBase } from './node/DocumentBase';
import { TextBase } from './node/TextBase';
import { Comment } from './node/Comment';
import { WindowBase } from './window/WindowBase';
import { ElementBase } from './node/elements/ElementBase';
import { ElementFactory } from './factory/ElementFactory';
import { elementNamespaceForTag, childNamespaceForElement } from './utils/namespaces';
import { parseNodes as parseSharedNodes, decodeHTMLEntities, type HtmlParseContext } from './parser';

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


  private parseHTMLRecursive(html: string, parent: any, parentNS: string | null = null): void {
    this.parseNodes(html, 0, parent, parentNS, null);
  }



  /**
   * Single-pass HTML parser: scans `html` forward exactly once starting at
   * `pos`, appending nodes to `parent`. Delegates to the shared implementation
   * in ./parser (which ElementBase.parseNodesInto also uses).
   */
  private parseNodes(
    html: string,
    pos: number,
    parent: any,
    parentNS: string | null,
    stopTag: string | null
  ): number {
    const ctx: HtmlParseContext = {
      ownerDocument: this.document,
      decode: decodeHTMLEntities,
      createText: (data) => new TextBase(data, this.document),
      createComment: (data) => new Comment(data, this.document),
      createElement: (tagName, namespaceURI, options) =>
        (this.document as any).createElementNS(namespaceURI, tagName.toLowerCase(), options),
      appendChild: (p, c) => p.appendChild(c),
      templateInert: false,
    };
    return parseSharedNodes(html, pos, parent, parentNS, stopTag, ctx);
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
