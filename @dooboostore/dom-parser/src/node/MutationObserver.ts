/**
 * A working MutationObserver: childList / attributes / characterData,
 * `subtree`, microtask delivery, and transient registered observers so
 * mutations inside a just-removed subtree are still reported (DOM Standard
 * "remove" steps; verified against Chromium).
 *
 * Everything short-circuits when no observer is registered, so parsing only
 * pays one Map lookup per mutation point.
 */

export interface MutationRecordLike {
  type: 'childList' | 'attributes' | 'characterData';
  target: any;
  addedNodes: any[];
  removedNodes: any[];
  previousSibling: any;
  nextSibling: any;
  attributeName: string | null;
  attributeNamespace: string | null;
  oldValue: string | null;
}

interface Registration {
  observer: MutationObserverImpl;
  options: MutationObserverInit;
  transient: boolean;
}

const registrations = new WeakMap<object, Set<Registration>>();
const pendingObservers = new Set<MutationObserverImpl>();
let registrationCount = 0;
let deliveryScheduled = false;

export function hasRegisteredObservers(): boolean {
  return registrationCount > 0;
}

function scheduleDelivery(): void {
  if (deliveryScheduled) return;
  deliveryScheduled = true;
  queueMicrotask(() => {
    deliveryScheduled = false;
    const observers = [...pendingObservers];
    pendingObservers.clear();
    for (const observer of observers) observer.deliver();
  });
}

function nodesInSubtree(node: any, out: any[] = []): any[] {
  out.push(node);
  const children = node?._childNodesInternal || node?.childNodes || [];
  for (let i = 0; i < children.length; i++) nodesInSubtree(children[i], out);
  return out;
}

function matchesOptions(record: MutationRecordLike, options: MutationObserverInit): boolean {
  if (record.type === 'childList' && !options.childList) return false;
  if (record.type === 'attributes' && !options.attributes) return false;
  if (record.type === 'characterData' && !options.characterData) return false;
  if (record.type === 'attributes' && options.attributeFilter && record.attributeName) {
    const filter = options.attributeFilter;
    const caseSensitive = filter.some((n: string) => n.toLowerCase() !== n);
    const needle = caseSensitive ? record.attributeName : record.attributeName.toLowerCase();
    return filter.some((n: string) => (caseSensitive ? n === needle : n.toLowerCase() === needle));
  }
  return true;
}

function deliverTo(target: any, record: MutationRecordLike, direct: boolean): void {
  const set = registrations.get(target);
  if (!set) return;
  for (const reg of set) {
    if (!direct && !reg.options.subtree) continue;
    if (!matchesOptions(record, reg.options)) continue;
    reg.observer.enqueue(record);
  }
}

/** Queue a record for the target and (subtree) ancestors. */
export function queueMutation(record: MutationRecordLike): void {
  if (!hasRegisteredObservers()) return;
  deliverTo(record.target, record, true);
  let ancestor = record.target?.parentNode;
  while (ancestor) {
    deliverTo(ancestor, record, false);
    ancestor = ancestor.parentNode;
  }
}

/**
 * DOM "remove" steps: each subtree:true registration on an inclusive
 * ancestor gets a transient registration on every node of the removed
 * subtree, so mutations there are reported until the next delivery.
 */
export function addTransientObservers(removedNode: any): void {
  if (!hasRegisteredObservers()) return;
  const targets = nodesInSubtree(removedNode);
  let ancestor = removedNode?.parentNode;
  while (ancestor) {
    const set = registrations.get(ancestor);
    if (set) {
      for (const reg of [...set]) {
        if (!reg.options.subtree || reg.transient) continue;
        for (const target of targets) {
          let targetSet = registrations.get(target);
          if (!targetSet) {
            targetSet = new Set();
            registrations.set(target, targetSet);
          }
          targetSet.add({ observer: reg.observer, options: reg.options, transient: true });
          registrationCount++;
          reg.observer.trackTransient(target, reg.options);
        }
      }
    }
    ancestor = ancestor.parentNode;
  }
}

export class MutationObserverImpl {
  private _records: MutationRecordLike[] = [];
  private _transient: { target: any; options: MutationObserverInit }[] = [];
  private _observations: { target: any }[] = [];

  constructor(private readonly _callback: (records: MutationRecordLike[], observer: any) => void) {}

  observe(target: any, options: MutationObserverInit = {}): void {
    if (!target) return;
    let set = registrations.get(target);
    if (!set) {
      set = new Set();
      registrations.set(target, set);
    }
    set.add({ observer: this, options: { ...options }, transient: false });
    registrationCount++;
    this._observations.push({ target });
  }

  disconnect(): void {
    const drop = (target: any) => {
      const set = registrations.get(target);
      if (!set) return;
      for (const reg of [...set]) {
        if (reg.observer === this) {
          set.delete(reg);
          registrationCount--;
        }
      }
    };
    for (const { target } of this._observations) drop(target);
    for (const { target } of this._transient) drop(target);
    this._observations = [];
    this._transient = [];
    this._records = [];
  }

  takeRecords(): MutationRecordLike[] {
    const records = this._records;
    this._records = [];
    return records;
  }

  /** @internal */
  enqueue(record: MutationRecordLike): void {
    this._records.push(record);
    pendingObservers.add(this);
    scheduleDelivery();
  }

  /** @internal */
  trackTransient(target: any, options: MutationObserverInit): void {
    this._transient.push({ target, options });
  }

  /** @internal */
  deliver(): void {
    // Transient registrations expire at delivery time.
    for (const { target } of this._transient) {
      const set = registrations.get(target);
      if (!set) continue;
      for (const reg of [...set]) {
        if (reg.observer === this && reg.transient) {
          set.delete(reg);
          registrationCount--;
        }
      }
    }
    this._transient = [];
    if (this._records.length > 0) {
      const records = this._records;
      this._records = [];
      this._callback(records, this);
    }
  }
}

export function createMutationObserver(callback: (records: MutationRecordLike[], observer: any) => void): any {
  return new MutationObserverImpl(callback);
}
