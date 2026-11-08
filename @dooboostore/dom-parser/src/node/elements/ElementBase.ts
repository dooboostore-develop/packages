import { NodeClassRegistry } from '../NodeClassRegistry';
import { ParentNodeBase } from '../ParentNodeBase';
import { HTMLCollectionImp, HTMLCollectionOfImp } from '../collection';
import { ELEMENT_NODE, TEXT_NODE, ATTRIBUTE_NODE } from '../Node';
import { CSSSelector } from '../../utils/CSSSelector';
import { parseNodes as parseSharedNodes, decodeHTMLEntities, type HtmlParseContext } from '../../parser';
import { serializeChildrenWithShadow, attachDeclarativeShadowRoots, shouldIncludeShadowRoot, shadowTemplateOpenTag, isHtmlRawTextParent, type GetHTMLOptions } from '../serialize';
import { serializeProcessingInstruction } from '../ProcessingInstruction';
import { SVG_NAMESPACE, MATHML_NAMESPACE, elementNamespaceForTag, childNamespaceForElement, normalizeAttributeName } from '../../utils/namespaces';
import { NodeBase } from '../NodeBase';
import { ShadowRootBase } from '../ShadowRootBase';
import { coerceNullableString } from '../../utils/coerce';
import { assertValidAttributeName } from '../../utils/attribute-name';
import { queueMutation, hasRegisteredObservers } from '../MutationObserver';

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
 * Attribute-name validation lives in utils/attribute-name (shared with
 * DocumentBase.createAttribute, which cannot import this module without a
 * cycle). See that file for the Chromium-measured rules.
 */
export { assertValidAttributeName };



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

  /**
   * Built-in element constructors, registered once from
   * `node/elements/index.ts` (which already imports every element class).
   * Used by the @@toStringTag getter below; kept off the imports here to
   * avoid a module cycle (index.ts imports ElementBase subclasses).
   */
  public static builtinElementCtors?: Set<Function>;

  /**
   * WebIDL @@toStringTag: reports the implemented interface
   * ("HTMLDivElement", "SVGElement", ...). Custom elements report their
   * built-in base ("HTMLElement"), resolved by walking up to the nearest
   * registered built-in class. Falls back to the constructor name when the
   * registry is unavailable (direct deep imports).
   */
  get [Symbol.toStringTag](): string {
    let ctor: any = this.constructor;
    const builtins = (ElementBase as any).builtinElementCtors as Set<Function> | undefined;
    if (builtins) {
      while (ctor && !builtins.has(ctor)) {
        ctor = Object.getPrototypeOf(ctor);
      }
      if (!ctor) return 'HTMLElement';
    }
    return ctor.name || 'HTMLElement';
  }

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
          const key = normalizeAttributeName(name, this.namespaceURI);
          this._attributes.set(key, value);
          if (key === 'id') this._id = value;
          else if (key === 'class') this._className = value;
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
    // Per the DOM spec, the qualified name is upper-cased only for elements
    // in the HTML namespace; SVG/MathML elements keep their case
    // (e.g. "path", "foreignObject"). See issue #15.
    const ns = this.namespaceURI;
    if (ns === SVG_NAMESPACE || ns === MATHML_NAMESPACE) {
      return this._tagName;
    }
    return this._tagName.toUpperCase();
  }

  get localName(): string {
    // Local names preserve case except for HTML elements, whose tag names
    // are ASCII-lowercased by the parser (stored upper-case here).
    const ns = this.namespaceURI;
    if (ns === SVG_NAMESPACE || ns === MATHML_NAMESPACE) {
      return this._tagName;
    }
    return this._tagName.toLowerCase();
  }

  /**
   * Tag name for serialization: lower-case for HTML elements,
   * qualified (spec) case for SVG/MathML elements.
   */
  protected get serializedTagName(): string {
    const ns = this.namespaceURI;
    if (ns === SVG_NAMESPACE || ns === MATHML_NAMESPACE) {
      return this._tagName;
    }
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
        // HTML-namespace style/script keep raw text; foreign ones escape
        if (isHtmlRawTextParent(this)) {
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
      } else if (child.nodeType === 7) {
        // PROCESSING_INSTRUCTION_NODE
        html += serializeProcessingInstruction(child);
      }
    }
    return html;
  }

  get innerText(): string {
    // innerText should return the decoded text content
    return this.textContent || '';
  }

  set innerText(value: string | null) {
    // Clear all children and store the literal text.
    // Escaping happens on serialization (innerHTML), not in storage.
    // null clears (matches browsers); everything else is String()-coerced.
    this._childNodesInternal = [];
    if (value !== null) {
      const stringValue = coerceNullableString(value);

      const { TextBase } = ElementBase.dependencies;
      if (TextBase) {
        const textNode = new TextBase(stringValue, this._ownerDocument);
        this._childNodesInternal.push(textNode);
        (textNode as any)._parentNodeInternal = this;
      }
    }
  }

  set innerHTML(value: string | null) {
    // Clear existing children
    while (this._childNodesInternal.length > 0) {
      const child = this._childNodesInternal[0];
      if (child) {
        this.removeChild(child);
      }
    }

    // Parse HTML and create child nodes
    // null clears like browsers; everything else is String()-coerced
    // (numbers become text, undefined becomes "undefined", etc.)
    const stringValue = coerceNullableString(value);
    if (stringValue.trim()) {
      const isInert = (this as any)._isInertHTMLParsing === true;
      this.parseAndAppendHTML(stringValue, this, isInert);
    }
  }

  /**
   * Serializes child nodes including declarative shadow DOM for
   * includable shadow roots (explicitly listed, or serializable ones
   * when options.serializableShadowRoots is set). Light-DOM-only
   * otherwise — matching browsers.
   */
  getHTML(options?: GetHTMLOptions): string {
    // The host's own shadow root serializes first (as a declarative shadow
    // DOM template when includable), followed by light-DOM children.
    let html = '';
    const ownShadow = (this as any).shadowRoot ?? (this as any)._shadowRoot ?? null;
    if (shouldIncludeShadowRoot(ownShadow, options)) {
      html += shadowTemplateOpenTag(ownShadow)
        + serializeChildrenWithShadow((ownShadow as any)._childNodesInternal ?? [], options)
        + '</template>';
    }
    return html + serializeChildrenWithShadow(this._childNodesInternal, options);
  }

  /**
   * Parses HTML and replaces children, converting declarative shadow DOM
   * `<template shadowrootmode=open>` children into attached shadow roots
   * (closed ones stay inert elements, like browsers).
   */
  setHTMLUnsafe(html: string, _options?: any): void {
    while (this._childNodesInternal.length > 0) {
      const child = this._childNodesInternal[0];
      if (child) {
        this.removeChild(child);
      }
    }
    const stringValue = String(html);
    if (!stringValue.trim()) return;
    const frag = (this._ownerDocument as any).createDocumentFragment();
    const isInert = (this as any)._isInertHTMLParsing === true;
    this.parseAndAppendHTML(stringValue, frag, isInert);
    attachDeclarativeShadowRoots(frag);
    for (const child of Array.from((frag.childNodes ?? []) as any)) {
      this.appendChild(child as unknown as Node);
    }
  }

  /**
   * Generate HTML for a child element without using outerHTML to avoid circular dependency
   */
  private generateChildElementHTML(element: any): string {
    // SVG/MathML elements serialize with their qualified (spec) case,
    // e.g. <foreignObject>, not <foreignobject>.
    const elementNS: string | null = element.namespaceURI ?? null;
    const tagName = (elementNS === SVG_NAMESPACE || elementNS === MATHML_NAMESPACE)
      ? element.tagName
      : element.tagName.toLowerCase();
    // Get attributes
    const attrs = Array.from(element._attributes?.entries() || [])
      .map(([name, value]: [string, string]) => (value === '' ? ` ${name}` : ` ${name}="${this.escapeAttributeValue(value)}"`))
      .join('');

    // Check if it's a self-closing tag
    const selfClosingTags = ['img', 'input', 'br', 'hr', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr'];
    const isSelfClosing = selfClosingTags.includes(tagName);

    if (isSelfClosing) {
      return `<${tagName}${attrs}>`;
    } else {
      // Generate innerHTML directly without calling element.innerHTML to avoid recursion
      let childHTML = '';

      // Add Declarative Shadow DOM if present (intentional: SSR emits
      // shadow content inline; use getHTML() for spec-exact output)
      if (element.shadowRoot) {
        childHTML += `<template shadowrootmode="${(element.shadowRoot as any).mode}">${(element.shadowRoot as any).innerHTML}</template>`;
      }

      // Special handling for HTMLTemplateElement - use .content instead of _childNodesInternal
      let nodesToIterate = element._childNodesInternal || [];
      if (tagName === 'template' && (element as any).content) {
        // For template elements, serialize content from the content fragment
        nodesToIterate = (element as any).content.childNodes || [];
      }

        for (const child of nodesToIterate) {
        if (child.nodeType === TEXT_NODE) {
          // HTML-namespace style/script keep raw text; foreign ones escape
          const text = (child as any).textContent ?? (child as any)._nodeValue ?? '';
          if (isHtmlRawTextParent(element)) {
            childHTML += String(text);
          } else {
            childHTML += this.escapeHTMLEntities(String(text));
          }
        } else if (child.nodeType === ELEMENT_NODE) {
          childHTML += this.generateChildElementHTML(child as any);
        } else if (child.nodeType === 8) {
          // COMMENT_NODE
          childHTML += `<!--${(child as any).textContent || ''}-->`;
        } else if (child.nodeType === 7) {
          // PROCESSING_INSTRUCTION_NODE
          childHTML += serializeProcessingInstruction(child);
        }
      }
      return `<${tagName}${attrs}>${childHTML}</${tagName}>`;
    }
  }

  /**
   * Improved HTML parser for innerHTML using a single-pass approach.
   * Delegates to parseNodesInto, which scans the input exactly once.
   */
  private parseAndAppendHTML(html: string, targetNode: Node = this, isInert: boolean = false): void {
    const { ElementFactory, TextBase, Comment } = ElementBase.dependencies;

    if (!ElementFactory) {
      // Fallback for direct library usage without entry point initialization
      console.error('SWC DOM Parser: ElementFactory dependency not injected.');
      return;
    }

    // Namespace context for newly parsed elements: derived from the target
    // node (<svg> children are SVG, except inside <foreignObject> which is
    // an HTML integration point).
    const targetNS: string | null = (targetNode as any)?.namespaceURI ?? null;
    const targetLocal: string = ((targetNode as any)?.localName ?? '') as string;
    const parentNS: string | null = childNamespaceForElement(targetLocal, targetNS);

    const ctx: HtmlParseContext = {
      ownerDocument: this._ownerDocument,
      decode: decodeHTMLEntities,
      fixText: (s) => this.fixBrokenClosingTags(s),
      createText: (data) => (TextBase ? new TextBase(data, this._ownerDocument) : null),
      createComment: (data) => (Comment ? new Comment(data, this._ownerDocument) : null),
      createElement: (tagName, namespaceURI, options) =>
        ElementFactory.createElement(tagName, this._ownerDocument, { ...(options as object), namespaceURI }),
      appendChild: (pp, child) => pp.appendChild(child),
      inert: isInert,
      templateInert: true,
    };
    parseSharedNodes(html, 0, targetNode, parentNS, null, ctx);
  }




  private fixBrokenClosingTags(text: string): string {
    return text.replace(/\/(\w+)>/g, '</$1>');
  }


  protected escapeHTMLEntities(str: string): string {
    const entityMap: any = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return str.replace(/[&<>"']/g, char => entityMap[char] || char);
  }

  /**
   * Escape an attribute value for double-quoted serialization.
   * Per the HTML fragment serialization algorithm, only `&`, U+00A0 and
   * `"` are escaped in attribute values (issue #16).
   */
  protected escapeAttributeValue(str: string): string {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\u00A0/g, '&nbsp;')
      .replace(/"/g, '&quot;');
  }


  get outerHTML(): string {
    const attrs = Array.from(this._attributes.entries())
      .map(([name, value]) => (value === '' ? ` ${name}` : ` ${name}="${this.escapeAttributeValue(value)}"`))
      .join('');
    const tagName = this.serializedTagName;
    const selfClosingTags = ['img', 'input', 'br', 'hr', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr'];
    const isSelfClosing = selfClosingTags.includes(tagName);
    return isSelfClosing ? `<${tagName}${attrs}>` : `<${tagName}${attrs}>${this.innerHTML}</${tagName}>`;
  }

  get namespaceURI(): string | null {
    return 'http://www.w3.org/1999/xhtml';
  }
  get prefix(): string | null {
    return null;
  }
  getAttribute(qualifiedName: string): string | null {
    return this._attributes.get(normalizeAttributeName(qualifiedName, this.namespaceURI)) ?? null;
  }
  setAttribute(qualifiedName: string, value: string): void {
    assertValidAttributeName(qualifiedName);
    const name = normalizeAttributeName(qualifiedName, this.namespaceURI);
    const oldValue = this.getAttribute(name);

    this._attributes.set(name, value);
    if (oldValue !== value) {
      if (hasRegisteredObservers()) queueMutation({
        type: 'attributes', target: this, addedNodes: [], removedNodes: [],
        previousSibling: null, nextSibling: null,
        attributeName: name, attributeNamespace: null, oldValue,
      });
    }
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
    const name = normalizeAttributeName(qualifiedName, this.namespaceURI);
    const oldValue = this.getAttribute(name);

    this._attributes.delete(name);
    if (oldValue !== null) {
      if (hasRegisteredObservers()) queueMutation({
        type: 'attributes', target: this, addedNodes: [], removedNodes: [],
        previousSibling: null, nextSibling: null,
        attributeName: name, attributeNamespace: null, oldValue,
      });
    }
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
    return this._attributes.has(normalizeAttributeName(qualifiedName, this.namespaceURI));
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
    return new (NamedNodeMapImpl as any)(this._attributes, this.namespaceURI);
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
    // Preserve the namespace so SVG/MathML clones keep their qualified names.
    const clone = ElementFactory.createElement(this.tagName, this._ownerDocument, {
      namespaceURI: (this as any).namespaceURI ?? null
    });
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
    if (force === undefined) {
      if (hasToken) {
        this.remove(token);
        return false;
      }
      this.add(token);
      return true;
    }
    // DOM Standard: coerce force to boolean first; when the element already
    // matches the forced state, return early WITHOUT touching the attribute
    // (no mutation record). Force-less toggling above always changes state.
    const forceValue = !!force;
    if (forceValue === hasToken) {
      return forceValue;
    }
    if (forceValue) {
      this.add(token);
      return true;
    }
    this.remove(token);
    return false;
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
  get [Symbol.toStringTag](): string {
    return 'Attr';
  }
  get localName(): string {
    return this.name;
  }
}

class NamedNodeMapImpl implements NamedNodeMap {
  constructor(private attributes: Map<string, string>, private namespaceURI: string | null = null) {}
  private normalize(name: string): string {
    return normalizeAttributeName(name, this.namespaceURI);
  }
  get length(): number {
    return this.attributes.size;
  }
  getNamedItem(qualifiedName: string): any {
    const value = this.attributes.get(this.normalize(qualifiedName));
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
    const value = this.attributes.get(this.normalize(qualifiedName));
    if (value !== undefined) {
      this.attributes.delete(this.normalize(qualifiedName));
      return new AttrImpl(qualifiedName, value);
    }
    throw new DOMException('The attribute is not found', 'NotFoundError');
  }
  removeNamedItemNS(_ns: string | null, localName: string): any {
    return this.removeNamedItem(localName);
  }
  setNamedItem(attr: any): any {
    const oldValue = this.attributes.get(this.normalize(attr.name));
    this.attributes.set(this.normalize(attr.name), attr.value);
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

NodeClassRegistry.ElementBase = ElementBase;
