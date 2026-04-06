import { ParentNodeBase } from '../ParentNodeBase';
import { HTMLCollectionImp, HTMLCollectionOfImp } from '../collection';
import { ELEMENT_NODE, TEXT_NODE, ATTRIBUTE_NODE } from '../Node';
import { CSSSelector } from '../../utils/CSSSelector';
import { NodeBase } from '../NodeBase';
import { ShadowRootBase } from '../ShadowRootBase';

// Simple DOMException class for error handling
class DOMException extends Error {
  constructor(
    message: string,
    public name: string = 'DOMException'
  ) {
    super(message);
    this.name = name;
  }
}

/**
 * Base implementation of the Element interface
 */
// @ts-ignore
export abstract class ElementBase extends ParentNodeBase implements Element {
  /**
   * Static dependencies to break circular references without using 'require' or 'global'.
   * These are injected by the main DomParser entry point.
   */
  public static dependencies: {
    ElementFactory?: any;
    TextBase?: any;
    Comment?: any;
  } = {};

  private _id: string = '';
  private _className: string = '';
  private _attributes: Map<string, string> = new Map();
  private _shadowRoot: ShadowRoot | null = null;

  constructor(
    public _tagName: string = 'DIV',
    ownerDocument?: any
  ) {
    super(ELEMENT_NODE, _tagName.toUpperCase(), ownerDocument);

    // Check if we are being constructed by ElementFactory with pre-parsed attributes
    // This is necessary for Custom Elements where constructor is called directly
    // and needs to read attributes via getAttribute() right away (like innerHTML does in browsers)
    const factory = (ElementBase.dependencies as any).ElementFactory;
    if (factory && factory.constructionStack && factory.constructionStack.length > 0) {
      const data = factory.constructionStack[factory.constructionStack.length - 1];
      this._tagName = data.tagName;
      this.nodeName = data.tagName;
      this._ownerDocument = data.ownerDocument;

      if (data.parsedAttributes) {
        for (const [name, value] of data.parsedAttributes.entries()) {
          this._attributes.set(name, value);
          if (name === 'id') this._id = value;
          else if (name === 'class') this._className = value;
        }
      }
    }
  }

  ariaActiveDescendantElement: Element;
  ariaAtomic: string;
  ariaAutoComplete: string;
  ariaBrailleLabel: string;
  ariaBrailleRoleDescription: string;
  ariaBusy: string;
  ariaChecked: string;
  ariaColCount: string;
  ariaColIndex: string;
  ariaColIndexText: string;
  ariaColSpan: string;
  ariaControlsElements: readonly Element[];
  ariaCurrent: string;
  ariaDescribedByElements: readonly Element[];
  ariaDescription: string;
  ariaDetailsElements: readonly Element[];
  ariaDisabled: string;
  ariaErrorMessageElements: readonly Element[];
  ariaExpanded: string;
  ariaFlowToElements: readonly Element[];
  ariaHasPopup: string;
  ariaHidden: string;
  ariaInvalid: string;
  ariaKeyShortcuts: string;
  ariaLabel: string;
  ariaLabelledByElements: readonly Element[];
  ariaLevel: string;
  ariaLive: string;
  ariaModal: string;
  ariaMultiLine: string;
  ariaMultiSelectable: string;
  ariaOrientation: string;
  ariaOwnsElements: readonly Element[];
  ariaPlaceholder: string;
  ariaPosInSet: string;
  ariaPressed: string;
  ariaReadOnly: string;
  ariaRelevant: string;
  ariaRequired: string;
  ariaRoleDescription: string;
  ariaRowCount: string;
  ariaRowIndex: string;
  ariaRowIndexText: string;
  ariaRowSpan: string;
  ariaSelected: string;
  ariaSetSize: string;
  ariaSort: string;
  ariaValueMax: string;
  ariaValueMin: string;
  ariaValueNow: string;
  ariaValueText: string;
  role: string;
  animate(keyframes: Keyframe[] | PropertyIndexedKeyframes | null, options?: number | KeyframeAnimationOptions): Animation {
    throw new Error('Method not implemented.');
  }
  getAnimations(options?: GetAnimationsOptions): Animation[] {
    throw new Error('Method not implemented.');
  }

  get tagName(): string {
    return this._tagName.toUpperCase();
  }

  get localName(): string {
    return this._tagName.toLowerCase();
  }

  // Element interface implementation
  get id(): string {
    return this._id;
  }

  set id(value: string) {
    this._id = value;
    this._attributes.set('id', value);
  }

  get className(): string {
    return this._className;
  }

  set className(value: string) {
    this._className = value;
    this._attributes.set('class', value);
  }

  get classList(): DOMTokenList {
    return new (DOMTokenListImpl as any)(this);
  }

  get innerHTML(): string {
    // Generate innerHTML from actual child nodes
    let html = '';
    for (const child of this._childNodesInternal) {
      if (child.nodeType === TEXT_NODE) {
        // For text nodes, escape their text content when serializing to innerHTML
        const text = (child as any).textContent ?? (child as any)._nodeValue ?? '';
        // For style and script tags, do not escape the text content — keep raw
        if (this._tagName === 'style' || this._tagName === 'script') {
          html += String(text);
        } else {
          html += this.escapeHTMLEntities(String(text));
        }
      } else if (child.nodeType === ELEMENT_NODE) {
        // Generate outerHTML directly to avoid circular dependency
        html += this.generateChildElementHTML(child as any);
      } else if (child.nodeType === 8) {
        // COMMENT_NODE
        html += `<!--${(child as any).textContent || ''}-->`;
      }
    }
    return html;
  }

  get innerText(): string {
    // innerText should return the decoded text content
    return this.textContent || '';
  }

  set innerText(value: string | null) {
    // Clear all children and add escaped text content
    this._childNodesInternal = [];
    if (value !== null && value !== undefined) {
      const stringValue = String(value);
      const escapedValue = this.escapeHTMLEntities(stringValue);

      const { TextBase } = ElementBase.dependencies;
      if (TextBase) {
        const textNode = new TextBase(escapedValue, this._ownerDocument);
        this._childNodesInternal.push(textNode);
        (textNode as any)._parentNodeInternal = this;
      }
    }
  }

  set innerHTML(value: string) {
    // Clear existing children
    while (this._childNodesInternal.length > 0) {
      const child = this._childNodesInternal[0];
      if (child) {
        this.removeChild(child);
      }
    }

    // Parse HTML and create child nodes
    if (value.trim()) {
      const isInert = (this as any)._isInertHTMLParsing === true;
      this.parseAndAppendHTML(value, this, isInert);
    }
  }

  /**
   * Generate HTML for a child element without using outerHTML to avoid circular dependency
   */
  private generateChildElementHTML(element: any): string {
    const tagName = element.tagName.toLowerCase();
    // Get attributes
    const attrs = Array.from(element._attributes?.entries() || [])
      .map(([name, value]: [string, string]) => (value === '' ? ` ${name}` : ` ${name}="${String(value).replace(/"/g, '&quot;')}"`))
      .join('');

    // Check if it's a self-closing tag
    const selfClosingTags = ['img', 'input', 'br', 'hr', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr'];
    const isSelfClosing = selfClosingTags.includes(tagName);

    if (isSelfClosing) {
      return `<${tagName}${attrs} />`;
    } else {
      // Generate innerHTML directly without calling element.innerHTML to avoid recursion
      let childHTML = '';

      // Add Declarative Shadow DOM if present
      if (element.shadowRoot) {
        childHTML += `<template shadowrootmode="${element.shadowRoot.mode}">${element.shadowRoot.innerHTML}</template>`;
      }

      // Special handling for HTMLTemplateElement - use .content instead of _childNodesInternal
      let nodesToIterate = element._childNodesInternal || [];
      if (tagName === 'template' && (element as any).content) {
        // For template elements, serialize content from the content fragment
        nodesToIterate = (element as any).content.childNodes || [];
      }

        for (const child of nodesToIterate) {
        if (child.nodeType === TEXT_NODE) {
          // For style/script children, preserve raw text. Otherwise escape.
          const text = (child as any).textContent ?? (child as any)._nodeValue ?? '';
          if (tagName === 'style' || tagName === 'script') {
            childHTML += String(text);
          } else {
            childHTML += this.escapeHTMLEntities(String(text));
          }
        } else if (child.nodeType === ELEMENT_NODE) {
          childHTML += this.generateChildElementHTML(child as any);
        } else if (child.nodeType === 8) {
          // COMMENT_NODE
          childHTML += `<!--${(child as any).textContent || ''}-->`;
        }
      }
      return `<${tagName}${attrs}>${childHTML}</${tagName}>`;
    }
  }

  /**
   * Improved HTML parser for innerHTML using a stack-based approach
   */
  private parseAndAppendHTML(html: string, targetNode: Node = this, isInert: boolean = false): void {
    const { ElementFactory, TextBase, Comment } = ElementBase.dependencies;

    if (!ElementFactory) {
      // Fallback for direct library usage without entry point initialization
      console.error('SWC DOM Parser: ElementFactory dependency not injected.');
      return;
    }

    let i = 0;
    const length = html.length;

    while (i < length) {
      const nextTagStart = html.indexOf('<', i);

      // Handle text content before next tag
      if (nextTagStart === -1) {
        let text = html.substring(i).trim();
        if (text) {
          text = this.fixBrokenClosingTags(text);
          if (TextBase) targetNode.appendChild(new TextBase(text, this._ownerDocument));
        }
        break;
      } else if (nextTagStart > i) {
        let text = html.substring(i, nextTagStart).trim();
        if (text) {
          text = this.fixBrokenClosingTags(text);
          if (TextBase) targetNode.appendChild(new TextBase(text, this._ownerDocument));
        }
      }

      i = nextTagStart;
      const tagEnd = this.findTagEnd(html, i);
      if (tagEnd === -1) break;

      const tagContent = html.substring(i + 1, tagEnd);

      // Handle comments
      if (tagContent.startsWith('!--')) {
        const commentEnd = html.indexOf('-->', i);
        if (commentEnd !== -1) {
          const commentContent = html.substring(i + 4, commentEnd);
          if (Comment) targetNode.appendChild(new Comment(commentContent, this._ownerDocument));
          i = commentEnd + 3;
          continue;
        }
      }

      const extractIsAttr = (attrStr: string) => {
        const match = attrStr ? attrStr.match(/(?:^|\s)is=(?:(['"])(.*?)\1|([^\s>]+))/i) : null;
        const options: any = match ? { is: match[2] || match[3] } : {};

        options.inert = isInert; // Always set inert, regardless of attributes

        if (!attrStr) return options; // If no attributes, return options with just inert flag

        // Parse all attributes beforehand to pass into constructor
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
          parsedAttributes.set(name, this.decodeHTMLEntities(value));
        }

        options.parsedAttributes = parsedAttributes;
        return options;
      };

      // Handle self-closing tags
      if (tagContent.endsWith('/')) {
        const parts = tagContent.slice(0, -1).trim().split(/\s+/);
        const tagName = parts[0];
        const attributeString = tagContent.slice(tagName.length, -1).trim();
        const options = extractIsAttr(attributeString);
        const element = ElementFactory.createElement(tagName, this._ownerDocument, options);
        this.parseAttributes(element, attributeString);
        targetNode.appendChild(element); // Append LAST
        i = tagEnd + 1;
        continue;
      }

      // Handle closing tags
      if (tagContent.startsWith('/')) {
        const closingTagText = `<${tagContent}>`;
        if (TextBase) targetNode.appendChild(new TextBase(closingTagText, this._ownerDocument));
        i = tagEnd + 1;
        continue;
      }

      // Handle opening tags
      const parts = tagContent.split(/\s+/);
      const tagName = parts[0];
      const attributeString = tagContent.slice(tagName.length).trim();
      const options = extractIsAttr(attributeString);

      // Special handling for style and script tags
      if (tagName === 'style' || tagName === 'script') {
        const closingTag = `</${tagName}>`;
        const closingTagIndex = html.indexOf(closingTag, tagEnd + 1);

        if (closingTagIndex !== -1) {
          const element = ElementFactory.createElement(tagName, this._ownerDocument, options);
          this.parseAttributes(element, attributeString);
          
          // IMPORTANT: Append element to parent FIRST
          // This ensures we're part of the connected tree before adding text content
          targetNode.appendChild(element);
          
          const content = html.substring(tagEnd + 1, closingTagIndex);
          // For style/script preserve raw content without escaping
          if (content && TextBase) {
            element.appendChild(new TextBase(content, this._ownerDocument));
          }
          i = closingTagIndex + closingTag.length;
          continue;
        }
      }

      // Handle regular opening tags with content
      const closingTagIndex = this.findMatchingClosingTag(html, tagName, tagEnd + 1);

      if (closingTagIndex !== -1) {
        const element = ElementFactory.createElement(tagName, this._ownerDocument, options);
        this.parseAttributes(element, attributeString);
        
        // IMPORTANT: Append element to parent FIRST, before setting innerHTML.
        // This ensures that when child elements are created via innerHTML, 
        // they can find their parent in the DOM tree (for getRootNode().parentElement, etc.)
        targetNode.appendChild(element);
        
        const content = html.substring(tagEnd + 1, closingTagIndex);
        if (content.trim()) {
          // Pass the inert state down to all recursive children
          if (isInert) {
            (element as any)._isInertHTMLParsing = true;
          }
          element.innerHTML = content;
          if (isInert) {
            delete (element as any)._isInertHTMLParsing;
          }
        }
        i = closingTagIndex + (tagName.length + 3); // </tagName>
      } else {
        const element = ElementFactory.createElement(tagName, this._ownerDocument, options);
        this.parseAttributes(element, attributeString);
        targetNode.appendChild(element); // Append LAST
        i = tagEnd + 1;
      }
    }
  }

  private findTagEnd(html: string, startIndex: number): number {
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
      } else {
        if (char === quoteChar) {
          inQuotes = false;
          quoteChar = '';
        }
      }
      i++;
    }
    return -1;
  }

  private fixBrokenClosingTags(text: string): string {
    return text.replace(/\/(\w+)>/g, '</$1>');
  }

  private findMatchingClosingTag(html: string, tagName: string, startIndex: number): number {
    const openTag = `<${tagName}`;
    const closeTag = `</${tagName}>`;
    let depth = 1;
    let i = startIndex;
    while (i < html.length && depth > 0) {
      const nextOpen = html.indexOf(openTag, i);
      const nextClose = html.indexOf(closeTag, i);
      if (nextClose === -1) return -1;
      if (nextOpen !== -1 && nextOpen < nextClose) {
        const afterTag = html.charAt(nextOpen + openTag.length);
        if (afterTag === ' ' || afterTag === '>' || afterTag === '/') depth++;
        i = nextOpen + openTag.length;
      } else {
        depth--;
        if (depth === 0) return nextClose;
        i = nextClose + closeTag.length;
      }
    }
    return -1;
  }

  private parseAttributes(element: any, attributeString: string): void {
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

      const decodedValue = this.decodeHTMLEntities(value);
      // Force trigger attributeChangedCallback if the element is already created
      // Note: we can't just check if it's identical because the oldValue might be null
      // in the context of attributeChangedCallback, but getAttribute() might return the value
      // we already injected during construction.
      const oldValue = element.getAttribute(name);

      // If we already set it during construction, we still need to trigger the callback
      // since the construction phase doesn't trigger callbacks (per web standard)
      if (oldValue !== decodedValue) {
        element.setAttribute(name, decodedValue);
      } else {
        // Values match, meaning it was pre-populated during constructor.
        // We must manually trigger setAttribute to fire the callback.
        // Instead of remove+set (which fires callback twice), we directly fire the callback
        if (typeof element.attributeChangedCallback === 'function') {
          const ctor = element.constructor;
          const observedAttributes = ctor.observedAttributes || [];
          if (observedAttributes.includes(name) || observedAttributes.includes(name.toLowerCase())) {
            // 💡 Call without old value since it's the initial parsing
            element.attributeChangedCallback(name, null, decodedValue);
          }
        }
      }
    }
  }

  protected escapeHTMLEntities(str: string): string {
    const entityMap: any = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return str.replace(/[&<>"']/g, char => entityMap[char] || char);
  }

  protected decodeHTMLEntities(str: string): string {
    const entityMap: any = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&#34;': '"', '&apos;': "'", '&copy;': '©', '&reg;': '®', '&trade;': '™', '&nbsp;': ' ', '&hellip;': '…', '&mdash;': '—', '&ndash;': '–', '&lsquo;': '\u2018', '&rsquo;': '\u2019', '&ldquo;': '"', '&rdquo;': '"' };
    return str.replace(/&[a-zA-Z0-9#]+;/g, entity => {
      if (entityMap[entity]) return entityMap[entity];
      if (entity.startsWith('&#') && entity.endsWith(';')) {
        const num = parseInt(entity.slice(2, -1), 10);
        return isNaN(num) ? entity : String.fromCharCode(num);
      }
      if (entity.startsWith('&#x') && entity.endsWith(';')) {
        const num = parseInt(entity.slice(3, -1), 16);
        return isNaN(num) ? entity : String.fromCharCode(num);
      }
      return entity;
    });
  }

  get outerHTML(): string {
    const attrs = Array.from(this._attributes.entries())
      .map(([name, value]) => (value === '' ? ` ${name}` : ` ${name}="${value.replace(/"/g, '&quot;')}"`))
      .join('');
    const selfClosingTags = ['img', 'input', 'br', 'hr', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr'];
    const isSelfClosing = selfClosingTags.includes(this.tagName.toLowerCase());
    return isSelfClosing ? `<${this.tagName.toLowerCase()}${attrs} />` : `<${this.tagName.toLowerCase()}${attrs}>${this.innerHTML}</${this.tagName.toLowerCase()}>`;
  }

  get namespaceURI(): string | null {
    return 'http://www.w3.org/1999/xhtml';
  }
  get prefix(): string | null {
    return null;
  }
  getAttribute(qualifiedName: string): string | null {
    return this._attributes.get(qualifiedName.toLowerCase()) ?? null;
  }
  setAttribute(qualifiedName: string, value: string): void {
    const name = qualifiedName.toLowerCase();
    const oldValue = this.getAttribute(name);

    this._attributes.set(name, value);
    if (name === 'id') this._id = value;
    else if (name === 'class') this._className = value;

    // Trigger attributeChangedCallback for custom elements
    if (oldValue !== value && typeof (this as any).attributeChangedCallback === 'function') {
      const ctor = this.constructor as any;
      const observedAttributes = ctor.observedAttributes || [];

      // 웹 표준을 엄격하게 지키기 위해 customElements 레지스트리에 등록된 컴포넌트인지 검증
      const registry = this._ownerDocument?.defaultView?.customElements;
      const isAttr = this.getAttribute('is');
      const isRegistered = registry && (registry.get(this.localName) === ctor || (isAttr && registry.get(isAttr) === ctor));

      if (isRegistered && (observedAttributes.includes(name) || observedAttributes.includes(qualifiedName))) {
        (this as any).attributeChangedCallback(name, oldValue, value);
      }
    }
  }
  removeAttribute(qualifiedName: string): void {
    const name = qualifiedName.toLowerCase();
    const oldValue = this.getAttribute(name);

    this._attributes.delete(name);
    if (name === 'id') this._id = '';
    else if (name === 'class') this._className = '';

    // Trigger attributeChangedCallback for custom elements
    if (oldValue !== null && typeof (this as any).attributeChangedCallback === 'function') {
      const ctor = this.constructor as any;
      const observedAttributes = ctor.observedAttributes || [];

      // 웹 표준을 엄격하게 지키기 위해 customElements 레지스트리에 등록된 컴포넌트인지 검증
      const registry = this._ownerDocument?.defaultView?.customElements;
      const isAttr = this.getAttribute('is');
      const isRegistered = registry && (registry.get(this.localName) === ctor || (isAttr && registry.get(isAttr) === ctor));

      if (isRegistered && (observedAttributes.includes(name) || observedAttributes.includes(qualifiedName))) {
        (this as any).attributeChangedCallback(name, oldValue, null);
      }
    }
  }
  hasAttribute(qualifiedName: string): boolean {
    return this._attributes.has(qualifiedName.toLowerCase());
  }
  closest(selectors: string): any {
    let element: Element | null = this as any;
    while (element) {
      if (element.matches && element.matches(selectors)) return element;
      element = element.parentElement;
    }
    return null;
  }
  matches(selectors: string): boolean {
    return CSSSelector.matches(this as any, selectors);
  }
  get attributes(): any {
    return new (NamedNodeMapImpl as any)(this._attributes);
  }
  get clientHeight(): number {
    return 0;
  }
  get clientLeft(): number {
    return 0;
  }
  get clientTop(): number {
    return 0;
  }
  get clientWidth(): number {
    return 0;
  }
  get currentCSSZoom(): number {
    return 1;
  }
  onfullscreenchange: any = null;
  onfullscreenerror: any = null;
  get part(): any {
    return { length: 0, value: '', add: () => {}, remove: () => {}, contains: () => false, toggle: () => false, replace: () => false, item: () => null };
  }
  get scrollHeight(): number {
    return 0;
  }
  get scrollLeft(): number {
    return 0;
  }
  set scrollLeft(_: number) {}
  get scrollTop(): number {
    return 0;
  }
  set scrollTop(_: number) {}
  get scrollWidth(): number {
    return 0;
  }
  get shadowRoot(): ShadowRoot | null {
    return this._shadowRoot;
  }
  get slot(): string {
    return this.getAttribute('slot') || '';
  }
  set slot(value: string) {
    this.setAttribute('slot', value);
  }
  attachShadow(init: ShadowRootInit): ShadowRoot {
    if (this._shadowRoot) throw new DOMException('Shadow root already attached', 'NotSupportedError');
    this._shadowRoot = new ShadowRootBase(this as any, init, this._ownerDocument) as unknown as ShadowRoot;
    return this._shadowRoot;
  }
  checkVisibility(_options?: any): boolean {
    return true;
  }
  computedStyleMap(): any {
    return new Map();
  }
  getAttributeNS(_ns: string | null, localName: string): string | null {
    return this.getAttribute(localName);
  }
  getAttributeNames(): string[] {
    return Array.from(this._attributes.keys());
  }
  getAttributeNode(qualifiedName: string): any {
    const value = this.getAttribute(qualifiedName);
    return value !== null ? new AttrImpl(qualifiedName, value) : null;
  }
  getAttributeNodeNS(_ns: string | null, localName: string): any {
    return this.getAttributeNode(localName);
  }
  getBoundingClientRect(): any {
    return { bottom: 0, height: 0, left: 0, right: 0, top: 0, width: 0, x: 0, y: 0, toJSON: () => ({}) };
  }
  getClientRects(): any {
    return { length: 0, item: () => null, [Symbol.iterator]: function* () {} };
  }

  getElementsByClassName(classNames: string): HTMLCollectionOf<Element> {
    const result: Element[] = [];
    const classNameList = classNames.trim().split(/\s+/);
    const hasAllClasses = (element: Element, classes: string[]): boolean => {
      const elementClasses = element.className.trim().split(/\s+/);
      return classes.every(cls => elementClasses.includes(cls));
    };
    const traverse = (node: any) => {
      if (node.nodeType === ELEMENT_NODE && hasAllClasses(node as Element, classNameList)) result.push(node as Element);
      for (let i = 0; i < node.childNodes.length; i++) traverse(node.childNodes[i]);
    };
    for (let i = 0; i < this.childNodes.length; i++) traverse(this.childNodes[i]);
    // @ts-ignore
    return new HTMLCollectionOfImp(result);
  }

  getElementsByTagName(qualifiedName: string): HTMLCollection {
    const result: Element[] = [];
    const tagName = qualifiedName.toLowerCase();
    const isWildcard = tagName === '*';
    const traverse = (node: any) => {
      if (node.nodeType === ELEMENT_NODE && (isWildcard || node.localName === tagName)) result.push(node as Element);
      for (let i = 0; i < node.childNodes.length; i++) traverse(node.childNodes[i]);
    };
    for (let i = 0; i < this.childNodes.length; i++) traverse(this.childNodes[i]);
    // @ts-ignore
    return new HTMLCollectionImp(result);
  }
  getElementsByTagNameNS(_ns: string | null, localName: string): any {
    return this.getElementsByTagName(localName);
  }
  getHTML(_options?: any): string {
    return this.outerHTML;
  }
  hasAttributeNS(_ns: string | null, localName: string): boolean {
    return this.hasAttribute(localName);
  }
  hasAttributes(): boolean {
    return this._attributes.size > 0;
  }
  hasPointerCapture(_id: number): boolean {
    return false;
  }
  insertAdjacentElement(where: InsertPosition, element: Element): Element | null {
    const position = where.toLowerCase();
    switch (position) {
      case 'beforebegin':
        if (this.parentNode) {
          this.parentNode.insertBefore(element as any, this as any);
          return element;
        }
        return null;
      case 'afterbegin':
        if (this.firstChild) this.insertBefore(element as any, this.firstChild);
        else this.appendChild(element as any);
        return element;
      case 'beforeend':
        this.appendChild(element as any);
        return element;
      case 'afterend':
        if (this.parentNode) {
          if (this.nextSibling) this.parentNode.insertBefore(element as any, this.nextSibling);
          else this.parentNode.appendChild(element as any);
          return element;
        }
        return null;
      default:
        throw new DOMException(`Invalid position: ${where}`, 'SyntaxError');
    }
  }
  insertAdjacentHTML(position: InsertPosition, html: string): void {
    const pos = position.toLowerCase();
    const tempDiv = this._ownerDocument.createElement('div');
    tempDiv.innerHTML = html;
    const fragment = this._ownerDocument.createDocumentFragment();
    while (tempDiv.firstChild) fragment.appendChild(tempDiv.firstChild);
    switch (pos) {
      case 'beforebegin':
        if (this.parentNode) this.parentNode.insertBefore(fragment, this as any);
        break;
      case 'afterbegin':
        if (this.firstChild) this.insertBefore(fragment, this.firstChild);
        else this.appendChild(fragment);
        break;
      case 'beforeend':
        this.appendChild(fragment);
        break;
      case 'afterend':
        if (this.parentNode) {
          if (this.nextSibling) this.parentNode.insertBefore(fragment, this.nextSibling);
          else this.parentNode.appendChild(fragment);
        }
        break;
      default:
        throw new DOMException(`Invalid position: ${position}`, 'SyntaxError');
    }
  }
  insertAdjacentText(where: InsertPosition, data: string): void {
    const position = where.toLowerCase();
    const textNode = this._ownerDocument.createTextNode(data);
    switch (position) {
      case 'beforebegin':
        if (this.parentNode) this.parentNode.insertBefore(textNode, this as any);
        break;
      case 'afterbegin':
        if (this.firstChild) this.insertBefore(textNode, this.firstChild);
        else this.appendChild(textNode);
        break;
      case 'beforeend':
        this.appendChild(textNode);
        break;
      case 'afterend':
        if (this.parentNode) {
          if (this.nextSibling) this.parentNode.insertBefore(textNode, this.nextSibling);
          else this.parentNode.appendChild(textNode);
        }
        break;
      default:
        throw new DOMException(`Invalid position: ${where}`, 'SyntaxError');
    }
  }
  releasePointerCapture(_id: number): void {}
  removeAttributeNS(_ns: string | null, localName: string): void {
    this.removeAttribute(localName);
  }
  removeAttributeNode(attr: any): any {
    const oldValue = this.getAttribute(attr.name);
    if (oldValue !== null) {
      this.removeAttribute(attr.name);
      return new AttrImpl(attr.name, oldValue);
    }
    throw new DOMException('The attribute node is not an attribute of this element', 'NotFoundError');
  }
  requestFullscreen(_opt?: any): Promise<void> {
    return Promise.resolve();
  }
  requestPointerLock(_opt?: any): Promise<void> {
    return Promise.resolve();
  }
  scroll(_x?: any, _y?: any): void {}
  scrollBy(_x?: any, _y?: any): void {}
  scrollIntoView(_arg?: any): void {}
  scrollTo(_x?: any, _y?: any): void {}
  setAttributeNS(_ns: string | null, qualifiedName: string, value: string): void {
    this.setAttribute(qualifiedName, value);
  }
  setAttributeNode(attr: any): any {
    const oldAttr = this.getAttributeNode(attr.name);
    this.setAttribute(attr.name, attr.value);
    return oldAttr;
  }
  setAttributeNodeNS(attr: any): any {
    return this.setAttributeNode(attr);
  }
  setHTMLUnsafe(html: string): void {
    this.innerHTML = html;
  }
  setPointerCapture(_id: number): void {}
  toggleAttribute(qualifiedName: string, force?: boolean): boolean {
    const hasAttr = this.hasAttribute(qualifiedName);
    if (force === true || (force === undefined && !hasAttr)) {
      this.setAttribute(qualifiedName, '');
      return true;
    } else if (force === false || (force === undefined && hasAttr)) {
      this.removeAttribute(qualifiedName);
      return false;
    }
    return hasAttr;
  }
  webkitMatchesSelector(selectors: string): boolean {
    return this.matches(selectors);
  }
  addEventListener(type: string, listener: any, options?: any): void {}
  removeEventListener(type: string, listener: any, options?: any): void {}
  dispatchEvent(_event: any): boolean {
    return true;
  }
  cloneNode(deep?: boolean): any {
    const { ElementFactory } = ElementBase.dependencies;
    const clone = ElementFactory.createElement(this.tagName, this._ownerDocument);
    for (const [name, value] of this._attributes) clone.setAttribute(name, value);
    if (deep) for (const child of this._childNodesInternal) if (child && 'cloneNode' in child) clone.appendChild((child as any).cloneNode(true));
    return clone;
  }
}

//@ts-ignore
class DOMTokenListImpl implements DOMTokenList {
  constructor(private element: ElementBase) {}

  get length(): number {
    return this.element.className.split(/\s+/).filter(c => c.length > 0).length;
  }
  get value(): string {
    return this.element.className;
  }
  set value(value: string) {
    this.element.className = value;
  }
  add(...tokens: string[]): void {
    const classes = new Set(this.element.className.split(/\s+/).filter(c => c.length > 0));
    tokens.forEach(t => classes.add(t));
    this.element.className = Array.from(classes).join(' ');
  }
  remove(...tokens: string[]): void {
    const classes = new Set(this.element.className.split(/\s+/).filter(c => c.length > 0));
    tokens.forEach(t => classes.delete(t));
    this.element.className = Array.from(classes).join(' ');
  }
  contains(token: string): boolean {
    return this.element.className.split(/\s+/).includes(token);
  }
  toggle(token: string, force?: boolean): boolean {
    const hasToken = this.contains(token);
    if (force === true || (force === undefined && !hasToken)) {
      this.add(token);
      return true;
    } else {
      this.remove(token);
      return false;
    }
  }
  replace(oldToken: string, newToken: string): boolean {
    if (this.contains(oldToken)) {
      this.remove(oldToken);
      this.add(newToken);
      return true;
    }
    return false;
  }
  item(index: number): string | null {
    const classes = this.element.className.split(/\s+/).filter(c => c.length > 0);
    return index >= 0 && index < classes.length ? classes[index] : null;
  }
  [index: number]: string;
}

//@ts-ignore
class AttrImpl extends NodeBase implements Attr {
  public ownerElement: Element | null = null;
  public namespaceURI: string | null = null;
  public prefix: string | null = null;
  public specified: boolean = true;
  constructor(
    public name: string,
    public value: string
  ) {
    super(ATTRIBUTE_NODE, name);
  }
  get localName(): string {
    return this.name;
  }
}

class NamedNodeMapImpl implements NamedNodeMap {
  constructor(private attributes: Map<string, string>) {}
  get length(): number {
    return this.attributes.size;
  }
  getNamedItem(qualifiedName: string): any {
    const value = this.attributes.get(qualifiedName.toLowerCase());
    return value !== undefined ? new AttrImpl(qualifiedName, value) : null;
  }
  getNamedItemNS(_ns: string | null, localName: string): any {
    return this.getNamedItem(localName);
  }
  item(index: number): any {
    const keys = Array.from(this.attributes.keys());
    if (index >= 0 && index < keys.length) return new AttrImpl(keys[index], this.attributes.get(keys[index])!);
    return null;
  }
  removeNamedItem(qualifiedName: string): any {
    const value = this.attributes.get(qualifiedName.toLowerCase());
    if (value !== undefined) {
      this.attributes.delete(qualifiedName.toLowerCase());
      return new AttrImpl(qualifiedName, value);
    }
    throw new DOMException('The attribute is not found', 'NotFoundError');
  }
  removeNamedItemNS(_ns: string | null, localName: string): any {
    return this.removeNamedItem(localName);
  }
  setNamedItem(attr: any): any {
    const oldValue = this.attributes.get(attr.name.toLowerCase());
    this.attributes.set(attr.name.toLowerCase(), attr.value);
    return oldValue !== undefined ? new AttrImpl(attr.name, oldValue) : null;
  }
  setNamedItemNS(attr: any): any {
    return this.setNamedItem(attr);
  }
  *[Symbol.iterator](): any {
    for (const [key, value] of this.attributes) yield new AttrImpl(key, value);
  }
  keys(): any {
    return this.attributes.keys();
  }
  values(): any {
    const self = this;
    return (function* () {
      for (const [key, value] of self.attributes) yield new AttrImpl(key, value);
    })();
  }
  entries(): any {
    const self = this;
    return (function* () {
      for (const [key, value] of self.attributes) yield [key, new AttrImpl(key, value)];
    })();
  }
  forEach(callback: any, thisArg?: any): void {
    const keys = Array.from(this.attributes.keys());
    keys.forEach((key, index) => callback.call(thisArg, new AttrImpl(key, this.attributes.get(key)!), index, this));
  }
  [index: number]: any;
}
