import { DocumentFragmentBase } from './DocumentFragmentBase';

/**
 * The **`ShadowRoot`** interface represents the root node of a shadow DOM subtree.
 */
// @ts-ignore
export class ShadowRootBase extends DocumentFragmentBase implements ShadowRoot {
  public readonly delegatesFocus: boolean;
  public readonly mode: ShadowRootMode;
  public readonly slotAssignment: SlotAssignmentMode;
  private _host: Element;

  constructor(host: Element, init: { mode: ShadowRootMode; delegatesFocus?: boolean; slotAssignment?: SlotAssignmentMode }, ownerDocument?: Document) {
    super(ownerDocument);
    this._host = host;
    this.mode = init.mode;
    this.delegatesFocus = init.delegatesFocus || false;
    this.slotAssignment = init.slotAssignment || 'manual';

    // Set nodeName to '#shadow-root'
    (this as any).nodeName = '#shadow-root';
  }

  clonable: boolean;
  onslotchange: (this: ShadowRoot, ev: Event) => any;
  serializable: boolean;
  getHTML(options?: GetHTMLOptions): string {
    throw new Error('Method not implemented.');
  }
  setHTMLUnsafe(html: string): void {
    throw new Error('Method not implemented.');
  }
  activeElement: Element;
  adoptedStyleSheets: CSSStyleSheet[];
  fullscreenElement: Element;
  pictureInPictureElement: Element;
  pointerLockElement: Element;
  styleSheets: StyleSheetList;
  elementFromPoint(x: number, y: number): Element | null {
    throw new Error('Method not implemented.');
  }
  elementsFromPoint(x: number, y: number): Element[] {
    throw new Error('Method not implemented.');
  }
  getAnimations(): Animation[] {
    throw new Error('Method not implemented.');
  }

  get host(): Element {
    return this._host;
  }

  /**
   * innerHTML for ShadowRoot
   */
  get innerHTML(): string {
    let html = '';
    for (const child of this._childNodesInternal) {
      if ((child as any).nodeType === 3) {
        // TEXT_NODE - escape text when serializing
        const text = (child as any).textContent ?? (child as any)._nodeValue ?? '';
        html += (this._host as any).escapeHTMLEntities(String(text));
      } else if ((child as any).nodeType === 1) {
        // ELEMENT_NODE
        html += (this._host as any).generateChildElementHTML(child as any);
      } else if ((child as any).nodeType === 8) {
        // COMMENT_NODE
        html += `<!--${(child as any).textContent || ''}-->`;
      }
    }
    return html;
  }

  set innerHTML(value: string) {
    // Clear existing children
    while (this._childNodesInternal.length > 0) {
      const child = this._childNodesInternal[0];
      if (child) {
        this.removeChild(child as unknown as Node);
      }
    }

    // Parse HTML and create child nodes
    if (value.trim()) {
      (this._host as any).parseAndAppendHTML(value, this);
    }

    // Trigger connectedCallback for newly added elements if host is connected
    if ((this._host as any).isConnected) {
      const ELEMENT_NODE = 1;
      const triggerConnected = (n: any) => {
        if (n.nodeType === ELEMENT_NODE && typeof n.connectedCallback === 'function') {
          n.connectedCallback();
        }
        for (const c of n._childNodesInternal || []) triggerConnected(c);
      };

      for (const child of this._childNodesInternal) {
        triggerConnected(child);
      }
    }
  }
}
