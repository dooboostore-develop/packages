import { ELEMENT_NODE, ATTRIBUTE_NODE, TEXT_NODE, CDATA_SECTION_NODE, ENTITY_REFERENCE_NODE, ENTITY_NODE, PROCESSING_INSTRUCTION_NODE, COMMENT_NODE, DOCUMENT_NODE, DOCUMENT_TYPE_NODE, DOCUMENT_FRAGMENT_NODE, NOTATION_NODE, DOCUMENT_POSITION_DISCONNECTED, DOCUMENT_POSITION_PRECEDING, DOCUMENT_POSITION_FOLLOWING, DOCUMENT_POSITION_CONTAINS, DOCUMENT_POSITION_CONTAINED_BY, DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC } from './Node';
import { NodeListOfImp } from './collection/NodeListOfImp';
import { GetRootNodeOptions } from './GetRootNodeOptions';

/**
 * Base implementation of the Node interface
 */
export abstract class NodeBase implements Node {
  // Node constants as instance properties
  static readonly ELEMENT_NODE = ELEMENT_NODE;
  static readonly ATTRIBUTE_NODE = ATTRIBUTE_NODE;
  static readonly TEXT_NODE = TEXT_NODE;
  static readonly CDATA_SECTION_NODE = CDATA_SECTION_NODE;
  static readonly ENTITY_REFERENCE_NODE = ENTITY_REFERENCE_NODE;
  static readonly ENTITY_NODE = ENTITY_NODE;
  static readonly PROCESSING_INSTRUCTION_NODE = PROCESSING_INSTRUCTION_NODE;
  static readonly COMMENT_NODE = COMMENT_NODE;
  static readonly DOCUMENT_NODE = DOCUMENT_NODE;
  static readonly DOCUMENT_TYPE_NODE = DOCUMENT_TYPE_NODE;
  static readonly DOCUMENT_FRAGMENT_NODE = DOCUMENT_FRAGMENT_NODE;
  static readonly NOTATION_NODE = NOTATION_NODE;
  static readonly DOCUMENT_POSITION_DISCONNECTED = DOCUMENT_POSITION_DISCONNECTED;
  static readonly DOCUMENT_POSITION_PRECEDING = DOCUMENT_POSITION_PRECEDING;
  static readonly DOCUMENT_POSITION_FOLLOWING = DOCUMENT_POSITION_FOLLOWING;
  static readonly DOCUMENT_POSITION_CONTAINS = DOCUMENT_POSITION_CONTAINS;
  static readonly DOCUMENT_POSITION_CONTAINED_BY = DOCUMENT_POSITION_CONTAINED_BY;
  static readonly DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC = DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC;

  ELEMENT_NODE: typeof ELEMENT_NODE;
  ATTRIBUTE_NODE: typeof ATTRIBUTE_NODE;
  TEXT_NODE: typeof TEXT_NODE;
  CDATA_SECTION_NODE: typeof CDATA_SECTION_NODE;
  ENTITY_REFERENCE_NODE: typeof ENTITY_REFERENCE_NODE;
  ENTITY_NODE: typeof ENTITY_NODE;
  PROCESSING_INSTRUCTION_NODE: typeof PROCESSING_INSTRUCTION_NODE;
  COMMENT_NODE: typeof COMMENT_NODE;
  DOCUMENT_NODE: typeof DOCUMENT_NODE;
  DOCUMENT_TYPE_NODE: typeof DOCUMENT_TYPE_NODE;
  DOCUMENT_FRAGMENT_NODE: typeof DOCUMENT_FRAGMENT_NODE;
  NOTATION_NODE: typeof NOTATION_NODE;
  DOCUMENT_POSITION_DISCONNECTED: typeof DOCUMENT_POSITION_DISCONNECTED;
  DOCUMENT_POSITION_PRECEDING: typeof DOCUMENT_POSITION_PRECEDING;
  DOCUMENT_POSITION_FOLLOWING: typeof DOCUMENT_POSITION_FOLLOWING;
  DOCUMENT_POSITION_CONTAINS: typeof DOCUMENT_POSITION_CONTAINS;
  DOCUMENT_POSITION_CONTAINED_BY: typeof DOCUMENT_POSITION_CONTAINED_BY;
  DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC: typeof DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC;
  // Internal properties (for Base class implementations)
  protected _childNodesInternal: NodeBase[] = [];
  public _parentNodeInternal: NodeBase | null = null; // Internal parent reference
  public _ownerDocument: Document | null = null; // Made public for ChildNodeBase access
  protected _nodeValue: string | null = null;
  protected _textContent: string | null = null;
  protected _eventListeners: Array<{ type: string; listener: any; options?: any }> = [];

  constructor(
    public nodeType: number,
    public nodeName: string,
    ownerDocument?: Document | null
  ) {
    this._ownerDocument = ownerDocument || null;
  }

  addEventListener(type: string, listener: any, options?: any): void {
    this._eventListeners.push({
      type,
      listener: typeof listener === 'function' ? listener : listener?.handleEvent,
      options
    });
  }

  removeEventListener(type: string, listener: any, _options?: any): void {
    const targetListener = typeof listener === 'function' ? listener : listener?.handleEvent;
    this._eventListeners = this._eventListeners.filter(l => !(l.type === type && l.listener === targetListener));
  }

  dispatchEvent(event: any): boolean {
    // Simple implementation: only trigger listeners on this node (no bubbling for now)
    const type = typeof event === 'string' ? event : event.type;
    const listeners = this._eventListeners.filter(l => l.type === type);
    for (const l of listeners) {
      try {
        if (typeof l.listener === 'function') {
          l.listener.call(this, event);
        } else if (l.listener && typeof l.listener.handleEvent === 'function') {
          l.listener.handleEvent(event);
        }

        if (l.options?.once) {
          this.removeEventListener(type, l.listener, l.options);
        }
      } catch (e) {
        console.error(`Error in event listener for ${type}:`, e);
      }
    }
    return true;
  }

  // Node interface implementation
  get baseURI(): string {
    return this._ownerDocument?.URL || '';
  }

  // External interface - returns proper Node interface types
  get childNodes(): NodeListOf<ChildNode> {
    return new NodeListOfImp<ChildNode>(this._childNodesInternal as unknown as ChildNode[]) as unknown as NodeListOf<ChildNode>;
  }

  get firstChild(): ChildNode | null {
    return this._childNodesInternal.length > 0 ? (this._childNodesInternal[0] as unknown as ChildNode) : null;
  }

  get lastChild(): ChildNode | null {
    const length = this._childNodesInternal.length;
    return length > 0 ? (this._childNodesInternal[length - 1] as unknown as ChildNode) : null;
  }

  get nextSibling(): ChildNode | null {
    if (!this._parentNodeInternal) return null;
    const siblings = this._parentNodeInternal._childNodesInternal;
    const index = this._findIndexInParent();
    return index !== -1 && index < siblings.length - 1 ? (siblings[index + 1] as unknown as ChildNode) : null;
  }

  get previousSibling(): ChildNode | null {
    if (!this._parentNodeInternal) return null;
    const siblings = this._parentNodeInternal._childNodesInternal;
    const index = this._findIndexInParent();
    return index > 0 ? (siblings[index - 1] as unknown as ChildNode) : null;
  }

  get parentNode(): ParentNode | null {
    return this._parentNodeInternal as unknown as ParentNode | null;
  }

  get parentElement(): HTMLElement | null {
    return this._parentNodeInternal && this._parentNodeInternal.nodeType === ELEMENT_NODE ? (this._parentNodeInternal as unknown as HTMLElement) : null;
  }

  get ownerDocument(): Document | null {
    return this._ownerDocument;
  }

  get isConnected(): boolean {
    let node: Node | null = this;
    while (node) {
      if (node.nodeType === DOCUMENT_NODE) return true;
      // Handle ShadowRoot traversal
      if (node.nodeType === DOCUMENT_FRAGMENT_NODE && (node as any).host) {
        node = (node as any).host;
        continue;
      }
      node = node.parentNode;
    }
    return false;
  }

  get nodeValue(): string | null {
    return this._nodeValue;
  }

  set nodeValue(value: string | null) {
    this._nodeValue = value;
  }

  get textContent(): string | null {
    if (this.nodeType === TEXT_NODE || this.nodeType === COMMENT_NODE) {
      // For text nodes, decode HTML entities to return original text
      return this._nodeValue ? this.decodeHTMLEntities(this._nodeValue) : this._nodeValue;
    }

    // For elements, return the stored original text content if available
    if (this._textContent !== undefined && this._textContent !== null) {
      return this._textContent;
    }

    // Fallback: collect from children (for HTML parsed content)
    let text = '';
    for (const child of this._childNodesInternal) {
      const childText = child.textContent;
      if (childText !== null && childText !== undefined) {
        text += childText;
      }
    }
    return text.length > 0 ? text : null;
  }

  set textContent(value: string | null) {
    // Convert to string (including null and undefined)
    const stringValue = String(value);
    // Store original text content
    this._textContent = stringValue;
    // Clear all children and add a single text node
    this._childNodesInternal = [];
    if (stringValue) {
      // Create text node implementation with escaped value for innerHTML
      const escapedValue = this.escapeHTMLEntities(stringValue);
      const { TextBase } = require('./TextBase');
      const textNode = new TextBase(escapedValue, this._ownerDocument);
      this._childNodesInternal.push(textNode);
      textNode._parentNodeInternal = this;
    }
  }

  /**
   * Escape HTML entities in a string to prevent XSS
   */
  protected escapeHTMLEntities(str: string): string {
    const entityMap: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };

    return str.replace(/[&<>"']/g, char => {
      return entityMap[char] || char;
    });
  }

  /**
   * Decode HTML entities in a string
   */
  protected decodeHTMLEntities(str: string): string {
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

  // Node methods - external interface uses Node types, internal uses NodeBase
  appendChild<T extends Node>(node: T): T {
    const nodeBase = node as any as NodeBase; // Internal cast

    // Special handling for DocumentFragment
    if (nodeBase.nodeType === DOCUMENT_FRAGMENT_NODE) {
      // When appending a DocumentFragment, move its children instead
      const fragment = nodeBase;

      // Move all children from fragment to this node
      while (fragment._childNodesInternal.length > 0) {
        const child = fragment._childNodesInternal[0];
        if (child) {
          fragment.removeChild(child);
          this.appendChild(child);
        }
      }

      return node;
    }

    if (nodeBase._parentNodeInternal) {
      nodeBase._parentNodeInternal.removeChild(nodeBase);
    }

    this._childNodesInternal.push(nodeBase);
    nodeBase._parentNodeInternal = this;

    // Update ownerDocument recursively and trigger adoptedCallback
    const oldDocument = nodeBase._ownerDocument;
    const newDocument = this._ownerDocument;
    const documentChanged = oldDocument && newDocument && oldDocument !== newDocument;

    const updateDocument = (n: any) => {
      const prevDoc = n._ownerDocument;
      n._ownerDocument = newDocument;
      if (documentChanged && prevDoc && prevDoc !== newDocument && n.nodeType === 1 && typeof n.adoptedCallback === 'function') {
        n.adoptedCallback(prevDoc, newDocument);
      }
      for (const c of n._childNodesInternal || []) updateDocument(c);
    };
    updateDocument(nodeBase);

    // Trigger connectedCallback recursively if connected to document
    if (this.isConnected) {
      // console.log('[DEBUG] appendChild: Parent is connected, triggering connectedCallback for:', nodeBase.constructor.name);
      const ELEMENT_NODE = 1;
      const triggerConnected = (n: any) => {
        // Upgrade custom element if it was created inertly
        if (n.nodeType === ELEMENT_NODE && n.tagName && n.tagName.includes('-') && n.constructor.name === 'HTMLElement') {
          const customElements = (this._ownerDocument as any)?.defaultView?.customElements;
          if (customElements && typeof customElements.upgrade === 'function') {
            // console.log(`[DEBUG] UPGRADING inert element: ${n.tagName}`);
            customElements.upgrade(n);
          }
        }

        if (n.nodeType === ELEMENT_NODE && typeof n.connectedCallback === 'function') {
          // console.log('[DEBUG] appendChild: triggering connectedCallback for:', n.constructor.name);
          const doc = this._ownerDocument as any;
          if (doc && doc._isParsingHTML) {
            // HTML 문자열 파싱 중에는 DOM 트리에 부착만 하고 콜백은 파싱이 100% 끝나면 실행되도록 지연시킵니다!
            // 그래야 속성(attributes)이나 자식(childNodes)이 없는 상태에서 불리는 버그를 막을 수 있습니다.
            if (!doc._connectedCallbackQueue) doc._connectedCallbackQueue = [];
            doc._connectedCallbackQueue.push(() => n.connectedCallback());
          } else {
            n.connectedCallback();
          }
        }
        for (const c of n._childNodesInternal || []) triggerConnected(c);
      };
      triggerConnected(nodeBase);
    } else {
      // console.log('[DEBUG] appendChild: Parent is NOT connected, skipping connectedCallback');
    }

    return node;
  }

  removeChild<T extends Node>(child: T): T {
    const childBase = child as any as NodeBase; // Internal cast
    const index = this._findChildIndex(childBase);
    if (index === -1) {
      throw new Error('Node not found');
    }

    const wasConnected = childBase.isConnected;

    this._childNodesInternal.splice(index, 1);
    childBase._parentNodeInternal = null;

    // Trigger disconnectedCallback recursively if it was connected
    if (wasConnected) {
      const triggerDisconnected = (n: any) => {
        if (n.nodeType === 1 && typeof n.disconnectedCallback === 'function') {
          n.disconnectedCallback();
        }
        for (const c of n._childNodesInternal || []) triggerDisconnected(c);
      };
      triggerDisconnected(childBase);
    }

    return child;
  }

  insertBefore<T extends Node>(node: T, child: Node | null): T {
    if (child === null) {
      return this.appendChild(node);
    }

    const nodeBase = node as any as NodeBase; // Internal cast
    const childBase = child as any as NodeBase; // Internal cast
    const index = this._findChildIndex(childBase);
    if (index === -1) {
      throw new Error('Reference node not found');
    }

    // Handle DocumentFragment - move all its children
    if (nodeBase.nodeType === DOCUMENT_FRAGMENT_NODE) {
      const fragment = nodeBase as any;
      const children = [...fragment._childNodesInternal]; // Copy array to avoid modification during iteration

      let insertIndex = index;
      for (const fragmentChild of children) {
        // Remove from fragment
        fragment.removeChild(fragmentChild);
        // Insert at the current insert position
        this._childNodesInternal.splice(insertIndex, 0, fragmentChild);
        fragmentChild._parentNodeInternal = this;
        fragmentChild._ownerDocument = this._ownerDocument;
        // Increment insert index for next child to maintain order
        insertIndex++;
      }

      // Trigger connectedCallback for fragment's children if parent is connected
      if (this.isConnected) {
        // console.log('[DEBUG] insertBefore: Parent is connected, triggering connectedCallback for fragment children');
        const ELEMENT_NODE = 1;
        const triggerConnected = (n: any) => {
          // Upgrade custom element if it was created inertly
          if (n.nodeType === ELEMENT_NODE && n.tagName && n.tagName.includes('-') && n.constructor.name === 'HTMLElement') {
            const customElements = (this._ownerDocument as any)?.defaultView?.customElements;
            if (customElements && typeof customElements.upgrade === 'function') {
              // console.log(`[DEBUG] UPGRADING inert element: ${n.tagName}`);
              customElements.upgrade(n);
            }
          }

          if (n.nodeType === ELEMENT_NODE && typeof n.connectedCallback === 'function') {
            // console.log('[DEBUG] triggering connectedCallback for:', n.constructor.name);
            const doc = this._ownerDocument as any;
            if (doc && doc._isParsingHTML) {
              if (!doc._connectedCallbackQueue) doc._connectedCallbackQueue = [];
              doc._connectedCallbackQueue.push(() => n.connectedCallback());
            } else {
              n.connectedCallback();
            }
          }
          for (const c of n._childNodesInternal || []) triggerConnected(c);
        };
        for (const fragmentChild of children) {
          // console.log('[DEBUG] Processing fragment child:', fragmentChild.constructor.name);
          triggerConnected(fragmentChild);
        }
      } else {
        // console.log('[DEBUG] insertBefore: Parent is NOT connected, skipping connectedCallback');
      }

      return node;
    }

    if (nodeBase._parentNodeInternal) {
      nodeBase._parentNodeInternal.removeChild(nodeBase);
    }

    this._childNodesInternal.splice(index, 0, nodeBase);
    nodeBase._parentNodeInternal = this;

    // Update ownerDocument recursively and trigger adoptedCallback
    const oldDocument = nodeBase._ownerDocument;
    const newDocument = this._ownerDocument;
    const documentChanged = oldDocument && newDocument && oldDocument !== newDocument;

    const updateDocument = (n: any) => {
      const prevDoc = n._ownerDocument;
      n._ownerDocument = newDocument;
      if (documentChanged && prevDoc && prevDoc !== newDocument && n.nodeType === 1 && typeof n.adoptedCallback === 'function') {
        n.adoptedCallback(prevDoc, newDocument);
      }
      for (const c of n._childNodesInternal || []) updateDocument(c);
    };
    updateDocument(nodeBase);

    // Trigger connectedCallback recursively if connected to document
    if (this.isConnected) {
      // console.log('[DEBUG] insertBefore (non-fragment): Parent is connected, triggering connectedCallback for:', nodeBase.constructor.name);
      const ELEMENT_NODE = 1;
      const triggerConnected = (n: any) => {
        // Upgrade custom element if it was created inertly
        if (n.nodeType === ELEMENT_NODE && n.tagName && n.tagName.includes('-') && n.constructor.name === 'HTMLElement') {
          const customElements = (this._ownerDocument as any)?.defaultView?.customElements;
          if (customElements && typeof customElements.upgrade === 'function') {
            // console.log(`[DEBUG] UPGRADING inert element: ${n.tagName}`);
            customElements.upgrade(n);
          }
        }

        if (n.nodeType === ELEMENT_NODE && typeof n.connectedCallback === 'function') {
          // console.log('[DEBUG] insertBefore (non-fragment): triggering connectedCallback for:', n.constructor.name);
          const doc = this._ownerDocument as any;
          if (doc && doc._isParsingHTML) {
            if (!doc._connectedCallbackQueue) doc._connectedCallbackQueue = [];
            doc._connectedCallbackQueue.push(() => n.connectedCallback());
          } else {
            n.connectedCallback();
          }
        }
        for (const c of n._childNodesInternal || []) triggerConnected(c);
      };
      triggerConnected(nodeBase);
    } else {
      // console.log('[DEBUG] insertBefore (non-fragment): Parent is NOT connected');
    }

    return node;
  }

  replaceChild<T extends Node>(node: Node, child: T): T {
    this.insertBefore(node, child);
    this.removeChild(child);
    return child;
  }

  cloneNode(deep?: boolean): Node {
    // Basic clone implementation - would need to be overridden by specific node types
    throw new Error('cloneNode must be implemented by subclasses');
  }

  hasChildNodes(): boolean {
    return this._childNodesInternal.length > 0;
  }

  contains(other: Node | null): boolean {
    if (!other || other === this) return other === this;

    let node: Node | null = other;
    while (node) {
      if (node.parentNode === (this as unknown as ParentNode)) return true;
      node = node.parentNode;
    }
    return false;
  }

  compareDocumentPosition(other: Node): number {
    if (this === other) return 0;

    const otherBase = other as any as NodeBase;

    // Check if nodes are disconnected (not in same tree)
    const thisRoot = this.getRootNode();
    const otherRoot = otherBase.getRootNode();
    if (thisRoot !== otherRoot) {
      return DOCUMENT_POSITION_DISCONNECTED;
    }

    // Check containment relationships
    if (this.contains(other)) return DOCUMENT_POSITION_CONTAINED_BY;
    if (other.contains(this)) return DOCUMENT_POSITION_CONTAINS;

    // Find document order by traversing up to common ancestor
    const thisAncestors = this._getAncestors();
    const otherAncestors = otherBase._getAncestors();

    // Find common ancestor
    let commonAncestor: NodeBase | null = null;
    for (let i = 0; i < thisAncestors.length; i++) {
      if (otherAncestors.includes(thisAncestors[i])) {
        commonAncestor = thisAncestors[i];
        break;
      }
    }

    if (!commonAncestor) {
      return DOCUMENT_POSITION_DISCONNECTED;
    }

    // Compare positions within common ancestor
    const thisChild = this._getChildInAncestor(commonAncestor);
    const otherChild = otherBase._getChildInAncestor(commonAncestor);

    if (thisChild && otherChild && commonAncestor._childNodesInternal) {
      const thisIndex = commonAncestor._childNodesInternal.indexOf(thisChild);
      const otherIndex = commonAncestor._childNodesInternal.indexOf(otherChild);

      if (thisIndex < otherIndex) {
        return DOCUMENT_POSITION_FOLLOWING;
      } else if (thisIndex > otherIndex) {
        return DOCUMENT_POSITION_PRECEDING;
      }
    }

    return DOCUMENT_POSITION_DISCONNECTED;
  }

  getRootNode(options?: GetRootNodeOptions): Node {
    let root: Node = this;
    while (root.parentNode) {
      root = root.parentNode;
    }
    // Handle composed option for crossing shadow boundaries
    if (options?.composed && root.nodeType === DOCUMENT_FRAGMENT_NODE && (root as any).host) {
      return (root as any).host.getRootNode(options);
    }
    return root;
  }

  isEqualNode(otherNode: Node | null): boolean {
    if (!otherNode) return false;
    if (this === otherNode) return true;
    if (this.nodeType !== otherNode.nodeType) return false;
    if (this.nodeName !== otherNode.nodeName) return false;
    return true; // Simplified comparison
  }

  isSameNode(otherNode: Node | null): boolean {
    return this === otherNode;
  }

  isDefaultNamespace(namespace: string | null): boolean {
    // Simplified implementation
    return namespace === null || namespace === 'http://www.w3.org/1999/xhtml';
  }

  lookupNamespaceURI(prefix: string | null): string | null {
    // Simplified implementation
    if (prefix === null || prefix === '') {
      return 'http://www.w3.org/1999/xhtml';
    }
    return null;
  }

  lookupPrefix(namespace: string | null): string | null {
    // Simplified implementation
    return null;
  }

  normalize(): void {
    // Merge adjacent text nodes
    for (let i = this._childNodesInternal.length - 1; i >= 0; i--) {
      const child = this._childNodesInternal[i];
      if (child && child.nodeType === TEXT_NODE) {
        const nextSibling = child.nextSibling;
        if (nextSibling && nextSibling.nodeType === TEXT_NODE) {
          child.nodeValue = (child.nodeValue || '') + (nextSibling.nodeValue || '');
          this.removeChild(nextSibling);
        }
      }
    }
  }

  // Helper methods
  private _findIndexInParent(): number {
    if (!this._parentNodeInternal) return -1;
    return this._parentNodeInternal._childNodesInternal.indexOf(this);
  }

  private _findChildIndex(child: NodeBase): number {
    return this._childNodesInternal.indexOf(child);
  }

  private _getAncestors(): NodeBase[] {
    const ancestors: NodeBase[] = [];
    let current: NodeBase | null = this._parentNodeInternal;
    while (current) {
      ancestors.push(current);
      current = current._parentNodeInternal;
    }
    return ancestors;
  }

  private _getChildInAncestor(ancestor: NodeBase): NodeBase | null {
    let current: NodeBase = this;
    while (current._parentNodeInternal && current._parentNodeInternal !== ancestor) {
      current = current._parentNodeInternal;
    }
    return current._parentNodeInternal === ancestor ? current : null;
  }
}
