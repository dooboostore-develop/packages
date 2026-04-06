export class Slot {
  private readonly start: Comment;
  private readonly end: Comment | null;

  constructor(start: Comment, end: Comment | null) {
    this.start = start;
    this.end = end;
  }

  // Parse mixed Node|string items into Node[] within the context of this slot's
  // document. This is a private helper that uses the slot's start comment to
  // resolve the ownerDocument. mode: 'html'|'text'|'auto'
  private parseItems(items: Array<Node | string>, mode: 'html' | 'text' | 'auto' = 'html'): Node[] {
    const out: Node[] = [];
    const host = this.start as any;
    const doc = host && host.ownerDocument ? host.ownerDocument : (typeof document !== 'undefined' ? document : undefined);
    if (!doc) return out;
    for (const it of items) {
      if (typeof it === 'string') {
        if (mode === 'text') {
          out.push(doc.createTextNode(it));
        } else {
          // html or auto
          const template = doc.createElement('template');
          template.innerHTML = it;
          const childNodes = Array.from<Node>(template.content.childNodes);
          out.push(...childNodes);
        }
      } else {
        out.push(it as Node);
      }
    }
    return out;
  }

  // Return nodes between start and end (exclusive) using nextSibling traversal
  nodes(): Node[] {
    const out: Node[] = [];
    let cur: Node | null = this.start.nextSibling;
    while (cur && cur !== this.end) {
      out.push(cur);
      cur = cur.nextSibling;
    }
    return out;
  }

  append(...items: Array<Node | string>): void {
    if (!items || items.length === 0) return;
    const nodesToInsert = this.parseItems(items);

    if (nodesToInsert.length === 0) return;
    const parent = this.end ? this.end.parentNode! : this.start.parentNode!;
    const ref = this.end || null;
    for (const n of nodesToInsert) {
      if (ref) parent.insertBefore(n, ref);
      else parent.appendChild(n);
    }
  }

  // Explicit HTML/text variants
  appendHtml(...items: Array<Node | string>): void {
    // existing append treats strings as HTML via parseItems, so delegate
    this.append(...items);
  }

  appendText(...items: Array<Node | string>): void {
    const nodesToInsert = this.parseItems(items, 'text');
    if (!nodesToInsert || nodesToInsert.length === 0) return;
    // delegate to append to avoid duplicating insertion logic
    this.append(...nodesToInsert);
  }

  prepend(...items: Array<Node | string>): void {
    if (!items || items.length === 0) return;
    const nodesToInsert = this.parseItems(items);

    if (nodesToInsert.length === 0) return;
    const parent = this.start.parentNode!;
    const before = this.start.nextSibling;
    // insert in reverse order so the provided order is preserved when prepending
    for (let i = nodesToInsert.length - 1; i >= 0; i--) {
      const n = nodesToInsert[i];
      parent.insertBefore(n, before);
    }
  }

  prependHtml(...items: Array<Node | string>): void {
    this.prepend(...items);
  }

  prependText(...items: Array<Node | string>): void {
    const nodesToInsert = this.parseItems(items, 'text');
    if (!nodesToInsert || nodesToInsert.length === 0) return;
    // delegate to prepend to avoid duplicating insertion logic
    this.prepend(...nodesToInsert);
  }

  clear(): void {
    let cur: Node | null = this.start.nextSibling;
    while (cur && cur !== this.end) {
      const next = cur.nextSibling;
      if (('remove' in cur) && typeof cur.remove === 'function')
        cur.remove();
      cur = next;
    }
  }

  // Replace all children between start and end with provided items.
  // Items can be Node or string (HTML/text). Uses parseItems to create
  // insertion nodes and then appends them (after clearing existing children).
  replaceChildren(...items: Array<Node | string>): void {
    // remove existing
    this.clear();
    if (!items || items.length === 0) return;
    const nodesToInsert = this.parseItems(items);
    if (!nodesToInsert || nodesToInsert.length === 0) return;
    // delegate to append which handles inserting before end (or appending if no end)
    this.append(...nodesToInsert);
  }

  /**
   * Explicit HTML variant of replaceChildren — alias for replaceChildren
   * to make intent clear.
   */
  replaceChildrenHtml(...items: Array<Node | string>): void {
    this.replaceChildren(...items);
  }

  /**
   * Explicit text variant of replaceChildren — parses strings as text nodes
   * and replaces the children with those text nodes.
   */
  replaceChildrenText(...items: Array<Node | string>): void {
    // remove existing
    this.clear();
    if (!items || items.length === 0) return;
    const nodesToInsert = this.parseItems(items, 'text');
    if (!nodesToInsert || nodesToInsert.length === 0) return;
    this.append(...nodesToInsert);
  }

  findAll(predicate: (node: Node) => boolean): Node[] {
    if (!predicate) return this.nodes();
    return this.nodes().filter(predicate);
  }

  querySelector(selector: string): Element | null {
    if (!selector) return null;
    for (const n of this.nodes()) {
      if (n.nodeType === Node.ELEMENT_NODE) {
        const el = n as Element;
        if ((el as Element).matches && (el as Element).matches(selector)) return el;
        const found = el.querySelector(selector);
        if (found) return found;
      }
    }
    return null;
  }

  querySelectorAll(selector: string): Element[] {
    if (!selector) return [];
    const out: Element[] = [];
    for (const n of this.nodes()) {
      if (n.nodeType === Node.ELEMENT_NODE) {
        const el = n as Element;
        if ((el as Element).matches && (el as Element).matches(selector)) out.push(el);
        const found = el.querySelectorAll(selector);
        if (found && found.length) out.push(...Array.from(found));
      }
    }
    return out;
  }

  /**
   * Append clones of provided items into this slot.
   * Strings will be parsed and resulting nodes cloned; Node items will be cloned.
   */
  appendCopy(...items: Array<Node | string>): void {
    const parsed = this.parseItems(items);
    if (!parsed || parsed.length === 0) return;
    const clones = parsed.map(n => n.cloneNode(true) as Node);
    if (clones.length === 0) return;
    this.append(...clones);
  }

  /**
   * Prepend clones of provided items into this slot.
   */
  prependCopy(...items: Array<Node | string>): void {
    const parsed = this.parseItems(items);
    if (!parsed || parsed.length === 0) return;
    const clones = parsed.map(n => n.cloneNode(true) as Node);
    if (clones.length === 0) return;
    this.prepend(...clones);
  }

}
