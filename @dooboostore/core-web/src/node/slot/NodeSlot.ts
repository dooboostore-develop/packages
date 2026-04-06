/**
 * NodeSlot
 *
 * A simple slot-like container implemented with comment anchors.
 * Usage:
 *  const slot = new NodeSlot(hostElement, 'my-slot-id');
 *  slot.append(node1, node2);
 *  slot.prepend(node3);
 *  slot.clear();
 *  slot.findAll(n => n.nodeType === Node.ELEMENT_NODE);
 *  slot.querySelector('.foo');
 */
import {RandomUtils} from '@dooboostore/core';
import {Slot} from './Slot';

export class NodeSlot {
  private readonly host: HTMLElement;
  private readonly id: string;
  private readonly startMarkerData: string;
  private readonly endMarkerData: string;

  constructor(host: HTMLElement, id: string) {
    if (!host) throw new Error('host node is required');
    if (!id) throw new Error('id is required');
    this.host = host;
    this.id = id;
    const markerData = NodeSlot.startEndMarkerData(id);
    this.startMarkerData = markerData.start;
    this.endMarkerData = markerData.end;

    // Do not search or create anchors here. Anchors may be added later.
    // Anchors will be resolved lazily when operations require them.
  }

  static startEndMarkerData(id: string, targetId?: string) {
    const baseStart = `__slot_start__:${id}`;
    const baseEnd = `__slot_end__:${id}`;
    if (!targetId) {
      return { start: baseStart, end: baseEnd };
    }
    return { start: `${baseStart}:${targetId}`, end: `${baseEnd}:${targetId}` };
  }

  static slotIds(id, targetId?: string) {
    const uid = RandomUtils.uuid();
    const markerData = NodeSlot.startEndMarkerData(id, targetId);
    return {start:`${markerData.start}:${uid}`, end: `${markerData.end}:${uid}`};

  }
  static slot(id: string, targetId?: string) {
    const uid = RandomUtils.uuid();
    const markerData = NodeSlot.startEndMarkerData(id, targetId);
    const start = `<!--${markerData.start}:${uid}-->`;
    const end = `<!--${markerData.end}:${uid}-->`;
    return `${start}${end}`;
  }
  /**
   * Return HTML comment string pair for embedding into templates.
   * Example: host.innerHTML = `<div>...${nodeSlot}...</div>`
   */
  get slot(): string {
   return NodeSlot.slot(this.id);
  }

  /**
   * Return a slot marker pair for a specific targetId. Useful when the same
   * slot id must be targeted to different logical consumers. The produced
   * marker will look like: <!--__slot_start__:id:targetId:uid-->
   */
  public slotFor(targetId?: string): string {
    return NodeSlot.slot(this.id, targetId);
  }

  // startCommentString and endCommentString getters removed — use slot() which
  // generates the full start/end comment pair including a unique uid per
  // insertion to ensure correct pairing when multiple slots with the same id
  // are inserted into the DOM.

  // toString removed intentionally to avoid accidental implicit string coercion.

  // Note: Symbol.toPrimitive removed to avoid custom primitive coercion logic.

  // valueOf and Symbol.toStringTag removed — prefer explicit use of slot getter/string conversion.

  public findSlots(targetId?: string): Slot[] {
    const result: Slot[] = [];
    const doc = (this.host as any).ownerDocument || (typeof document !== 'undefined' ? document : undefined);
    const win = doc?.defaultView as any;
    if (!doc || !win) return result;

    const find = (target: Node) => {
      const walker = doc.createTreeWalker(target, win.NodeFilter.SHOW_COMMENT, null, false);
      let node = walker.nextNode() as Comment | null;
      // startPrefix without uid. If targetId provided, include it in the
      // prefix so we only match target-specific markers.
      const markerData = targetId ? NodeSlot.startEndMarkerData(this.id, targetId) : { start: this.startMarkerData, end: this.endMarkerData };
      const startPrefix = markerData.start + ':'; // e.g. __slot_start__:id:targetId:
      while (node) {
        const data = node.data;
        if (data && data.indexOf(startPrefix) === 0) {
          // extract uid (part after the prefix)
          const uid = data.substring(startPrefix.length);
          const expectedEnd = `${markerData.end}:${uid}`;
          // search siblings after start for an end with the same uid
          let sibling = node.nextSibling;
          let foundEnd: Comment | null = null;
          while (sibling) {
            if (sibling.nodeType === win.Node.COMMENT_NODE && (sibling as Comment).data === expectedEnd && sibling.parentNode === node.parentNode) {
              foundEnd = sibling as Comment;
              break;
            }
            sibling = sibling.nextSibling;
          }
          result.push(new Slot(node as Comment, foundEnd));
        }
        node = walker.nextNode() as Comment | null;
      }
    }


    if (this.host.shadowRoot) {
      find(this.host.shadowRoot);
    }
    find(this.host);


    return result;
  }


  /**
   * Return an array of node arrays — for each found slot pair (via findSlots())
   * returns the nodes between its start and end (exclusive). Uses sibling
   * traversal (nextSibling) because findSlots pairs only same-parent markers.
   */
  nodes(): Node[][] {
    const slots = this.findSlots();
    return slots.map(s => s.nodes());
  }

  append(...items: Array<Node | string>): void;
  append(targetId: string | undefined, ...items: Array<Node | string>): void;
  append(...args: any[]): void {
    // signature: append(...items) OR append(targetId, ...items)
    let targetId: string | undefined;
    let items: Array<Node | string> = [];
    if (typeof args[0] === 'string' && args.length > 1) {
      targetId = args[0];
      items = args.slice(1) as Array<Node | string>;
    } else {
      items = args as Array<Node | string>;
    }
    if (!items || items.length === 0) return;
    const slots = this.findSlots(targetId);
    if (!slots || slots.length === 0) return;
    for (const s of slots) {
      s.append(...items);
    }
  }

  appendHtml(...items: Array<Node | string>): void;
  appendHtml(targetId: string | undefined, ...items: Array<Node | string>): void;
  appendHtml(...args: any[]): void {
    let targetId: string | undefined;
    let items: Array<Node | string> = [];
    if (typeof args[0] === 'string' && args.length > 1) {
      targetId = args[0];
      items = args.slice(1) as Array<Node | string>;
    } else {
      items = args as Array<Node | string>;
    }
    const slots = this.findSlots(targetId);
    for (const s of slots) s.appendHtml(...items);
  }

  appendText(...items: Array<Node | string>): void;
  appendText(targetId: string | undefined, ...items: Array<Node | string>): void;
  appendText(...args: any[]): void {
    let targetId: string | undefined;
    let items: Array<Node | string> = [];
    if (typeof args[0] === 'string' && args.length > 1) {
      targetId = args[0];
      items = args.slice(1) as Array<Node | string>;
    } else {
      items = args as Array<Node | string>;
    }
    const slots = this.findSlots(targetId);
    for (const s of slots) s.appendText(...items);
  }

  /**
   * Append copies of the provided items into each found slot.
   */
  appendCopy(...items: Array<Node | string>): void;
  appendCopy(targetId: string | undefined, ...items: Array<Node | string>): void;
  appendCopy(...args: any[]): void {
    let targetId: string | undefined;
    let items: Array<Node | string> = [];
    if (typeof args[0] === 'string' && args.length > 1) {
      targetId = args[0];
      items = args.slice(1) as Array<Node | string>;
    } else {
      items = args as Array<Node | string>;
    }
    if (!items || items.length === 0) return;
    const slots = this.findSlots(targetId);
    if (!slots || slots.length === 0) return;
    for (const s of slots) {
      s.appendCopy(...items);
    }
  }

  prepend(...items: Array<Node | string>): void;
  prepend(targetId: string | undefined, ...items: Array<Node | string>): void;
  prepend(...args: any[]): void {
    let targetId: string | undefined;
    let items: Array<Node | string> = [];
    if (typeof args[0] === 'string' && args.length > 1) {
      targetId = args[0];
      items = args.slice(1) as Array<Node | string>;
    } else {
      items = args as Array<Node | string>;
    }
    if (!items || items.length === 0) return;
    const slots = this.findSlots(targetId);
    if (!slots || slots.length === 0) return;
    for (const s of slots) {
      s.prepend(...items);
    }
  }

  prependHtml(...items: Array<Node | string>): void;
  prependHtml(targetId: string | undefined, ...items: Array<Node | string>): void;
  prependHtml(...args: any[]): void {
    let targetId: string | undefined;
    let items: Array<Node | string> = [];
    if (typeof args[0] === 'string' && args.length > 1) {
      targetId = args[0];
      items = args.slice(1) as Array<Node | string>;
    } else {
      items = args as Array<Node | string>;
    }
    const slots = this.findSlots(targetId);
    for (const s of slots) s.prependHtml(...items);
  }

  prependText(...items: Array<Node | string>): void;
  prependText(targetId: string | undefined, ...items: Array<Node | string>): void;
  prependText(...args: any[]): void {
    let targetId: string | undefined;
    let items: Array<Node | string> = [];
    if (typeof args[0] === 'string' && args.length > 1) {
      targetId = args[0];
      items = args.slice(1) as Array<Node | string>;
    } else {
      items = args as Array<Node | string>;
    }
    const slots = this.findSlots(targetId);
    for (const s of slots) s.prependText(...items);
  }

  /**
   * Prepend copies of the provided items into each found slot.
   */
  prependCopy(...items: Array<Node | string>): void;
  prependCopy(targetId: string | undefined, ...items: Array<Node | string>): void;
  prependCopy(...args: any[]): void {
    let targetId: string | undefined;
    let items: Array<Node | string> = [];
    if (typeof args[0] === 'string' && args.length > 1) {
      targetId = args[0];
      items = args.slice(1) as Array<Node | string>;
    } else {
      items = args as Array<Node | string>;
    }
    if (!items || items.length === 0) return;
    const slots = this.findSlots(targetId);
    if (!slots || slots.length === 0) return;
    for (const s of slots) {
      s.prependCopy(...items);
    }
  }


  /**
   * Clear contents of slots. If targetId is provided, only clears slots that
   * were created with that targetId segment. Otherwise clears all slots for
   * this id.
   */
  clear(targetId?: string): void {
    const slots = this.findSlots(targetId);
    for (const s of slots) {
      s.clear();
    }
  }

  /**
   * Replace children inside each found slot with the provided items.
   * Items can be Node or string (HTML).
   */
  replaceChildren(...items: Array<Node | string>): void;
  replaceChildren(targetId: string | undefined, ...items: Array<Node | string>): void;
  replaceChildren(...args: any[]): void {
    // signature: replaceChildren(...items) OR replaceChildren(targetId, ...items)
    let targetId: string | undefined;
    let items: Array<Node | string> = [];
    if (typeof args[0] === 'string' && args.length > 1) {
      targetId = args[0];
      items = args.slice(1) as Array<Node | string>;
    } else {
      items = args as Array<Node | string>;
    }
    const slots = this.findSlots(targetId);
    if (!slots || slots.length === 0) return;
    for (const s of slots) {
      s.replaceChildren(...items);
    }
  }

  replaceChildrenHtml(...items: Array<Node | string>): void;
  replaceChildrenHtml(targetId: string | undefined, ...items: Array<Node | string>): void;
  replaceChildrenHtml(...args: any[]): void {
    let targetId: string | undefined;
    let items: Array<Node | string> = [];
    if (typeof args[0] === 'string' && args.length > 1) {
      targetId = args[0];
      items = args.slice(1) as Array<Node | string>;
    } else {
      items = args as Array<Node | string>;
    }
    const slots = this.findSlots(targetId);
    if (!slots || slots.length === 0) return;
    for (const s of slots) {
      s.replaceChildrenHtml(...items);
    }
  }

  replaceChildrenText(...items: Array<Node | string>): void;
  replaceChildrenText(targetId: string | undefined, ...items: Array<Node | string>): void;
  replaceChildrenText(...args: any[]): void {
    let targetId: string | undefined;
    let items: Array<Node | string> = [];
    if (typeof args[0] === 'string' && args.length > 1) {
      targetId = args[0];
      items = args.slice(1) as Array<Node | string>;
    } else {
      items = args as Array<Node | string>;
    }
    const slots = this.findSlots(targetId);
    if (!slots || slots.length === 0) return;
    for (const s of slots) {
      s.replaceChildrenText(...items);
    }
  }

  findAll(predicate?: (node: Node) => boolean): Node[];
  findAll(targetId?: string, predicate?: (node: Node) => boolean): Node[];
  findAll(...args: any[]): Node[] {
    // overloads: findAll(predicate) OR findAll(targetId, predicate)
    let targetId: string | undefined;
    let predicate: ((node: Node) => boolean) | undefined;
    if (typeof args[0] === 'string') {
      targetId = args[0];
      predicate = args[1];
    } else {
      predicate = args[0];
    }
    // flatten nodes across all slot pairs for the given targetId
    const groups = this.nodesForTarget(targetId);
    const flat: Node[] = groups.reduce((acc, cur) => acc.concat(cur), [] as Node[]);
    if (!predicate) return flat;
    return flat.filter(predicate);
  }

  querySelector(selector: string): Element | null;
  querySelector(targetId: string, selector: string): Element | null;
  querySelector(...args: any[]): Element | null {
    let targetId: string | undefined;
    let selector: string;
    if (args.length === 1) {
      selector = args[0];
    } else {
      targetId = args[0];
      selector = args[1];
    }
    if (!selector) return null;
    const groups = this.nodesForTarget(targetId);
    for (const nodes of groups) {
      for (const n of nodes) {
        if (n.nodeType === Node.ELEMENT_NODE) {
          const el = n as Element;
          if ((el as Element).matches && (el as Element).matches(selector)) return el;
          const found = el.querySelector(selector);
          if (found) return found;
        }
      }
    }
    return null;
  }

  querySelectorAll(selector: string): Element[];
  querySelectorAll(targetId: string, selector: string): Element[];
  querySelectorAll(...args: any[]): Element[] {
    let targetId: string | undefined;
    let selector: string;
    if (args.length === 1) {
      selector = args[0];
    } else {
      targetId = args[0];
      selector = args[1];
    }
    if (!selector) return [];
    const out: Element[] = [];
    const groups = this.nodesForTarget(targetId);
    for (const nodes of groups) {
      for (const n of nodes) {
        if (n.nodeType === Node.ELEMENT_NODE) {
          const el = n as Element;
          if ((el as Element).matches && (el as Element).matches(selector)) out.push(el);
          const found = el.querySelectorAll(selector);
          if (found && found.length) out.push(...Array.from(found));
        }
      }
    }
    return out;
  }

  // helper to get nodes for a specific targetId or all nodes when targetId undefined
  private nodesForTarget(targetId?: string): Node[][] {
    if (targetId) {
      const slots = this.findSlots(targetId);
      return slots.map(s => s.nodes());
    }
    return this.nodes();
  }

}
