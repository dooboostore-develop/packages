import { ReflectUtils } from '@dooboostore/core';
import { SpecialSelector, SwcQueryOptions, HelperHostSet, SwcFnSelector, SwcSelector } from '../types';

export interface AddEventListenerBaseOptions<TEvent extends Event = Event> extends EventListenerOptions {
  capture?: boolean;
  once?: boolean;
  passive?: boolean;
  stopPropagation?: boolean;
  stopImmediatePropagation?: boolean;
  preventDefault?: boolean;
  // removeOnDisconnected?: boolean;
  // delegate는 문자열 셀렉터 전용 → AddEventListenerQueryOptions에만 존재
  filter?: (target: Event | CustomEvent, meta:{currentThis: any, helper: HelperHostSet}) => boolean;
  // 리스너 제거(disconnected 또는 unmount) 시 호출되는 콜백. 첫 번째 인자는 바인딩된 타겟 element, 두 번째는 이 옵션이 속한 전체 옵션 객체(Base + SwcQuery + delegate).
  removeListener?: (target: Element, optionValue: AddEventListenerQueryOptions<TEvent>) => void;
  // RxJS operator options
  debounceTime?: number;
  throttleTime?: number;
  distinctUntilChanged?: boolean | ((prev: TEvent, curr: TEvent) => boolean);
}

export type EventListenerFnSelector = SwcFnSelector;
export type EventListenerSelector = SwcSelector;

export interface AddEventListenerMetadata<TEvent extends Event = Event> {
  propertyKey: string | symbol;
  selector: EventListenerSelector;
  type: string;
  options: AddEventListenerQueryOptions<TEvent>;
}

export const ADD_EVENT_LISTENER_METADATA_KEY = Symbol.for('simple-web-component:add-event-listener');

// root + delegate 허용 — 문자열 셀렉터는 컴포넌트 DOM 트리 안에서 탐색/델리게이션하므로 의미 있음
export type AddEventListenerQueryOptions<TEvent extends Event = Event> = AddEventListenerBaseOptions<TEvent> & SwcQueryOptions & { delegate?: boolean | 'this' | 'mutation' };
// root·delegate 비허용 — 함수 셀렉터는 이미 요소를 직접 반환하므로 root·delegate가 무의미함
export type AddEventListenerNonQueryOptions<TEvent extends Event = Event> = AddEventListenerBaseOptions<TEvent>;

// 셀렉터 종류에 따라 옵션 타입을 분기
export type AddEventListenerOptionsOf<S extends EventListenerSelector, TEvent extends Event = Event> =
  S extends string ? AddEventListenerQueryOptions<TEvent> : AddEventListenerNonQueryOptions<TEvent>;

export function addEventListener<TEvent extends Event = Event>(target: SpecialSelector, type: string, options?: AddEventListenerQueryOptions<TEvent>): MethodDecorator;
export function addEventListener<TEvent extends Event = Event>(selector: string, type: string, options?: AddEventListenerQueryOptions<TEvent>): MethodDecorator;
export function addEventListener<TEvent extends Event = Event>(selector: EventListenerFnSelector, type: string, options?: AddEventListenerNonQueryOptions<TEvent>): MethodDecorator;
/**
 * @addEventListener(type, options?) — 셀렉터 생략 시 $this(컴포넌트 자신)로 바인딩
 */
export function addEventListener<TEvent extends Event = Event>(type: string, options?: AddEventListenerQueryOptions<TEvent>): MethodDecorator;
/**
 * @addEventListener decorator to bind events to elements.
 */
export function addEventListener<TEvent extends Event = Event>(selectorOrType: EventListenerSelector | string, typeOrOptions?: string | AddEventListenerQueryOptions<TEvent>, maybeOptions?: AddEventListenerQueryOptions<TEvent>): MethodDecorator {
  return (targetObj: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    let selector: EventListenerSelector;
    let type: string;
    let opts: any = {};

    if (typeof typeOrOptions === 'string') {
      // (selector, type[, options]) form — 기존 호환
      selector = selectorOrType as EventListenerSelector;
      type = typeOrOptions;
      opts = maybeOptions ?? {};
    } else {
      // (type[, options]) form — selector 기본값 $this
      selector = '$this';
      type = selectorOrType as string;
      opts = typeOrOptions ?? {};
    }

    const constructor = targetObj.constructor;

    let listeners = ReflectUtils.getMetadata<AddEventListenerMetadata<TEvent>[]>(ADD_EVENT_LISTENER_METADATA_KEY, constructor);
    if (!listeners) {
      listeners = [];
      ReflectUtils.defineMetadata(ADD_EVENT_LISTENER_METADATA_KEY, listeners, constructor);
    }

    listeners.push({ propertyKey, selector, type, options: opts });
  };
}


export function addEventListenerDelegateLight<TEvent extends Event = Event>(selector: string, type: string, options?: Omit<AddEventListenerQueryOptions<TEvent>, 'delegate'>): MethodDecorator {
  return addEventListener<TEvent>(selector, type, {...options??{}, root:'light', delegate: true});
}

export function addEventListenerDelegateShadow<TEvent extends Event = Event>(selector: string, type: string, options?: Omit<AddEventListenerQueryOptions<TEvent>, 'delegate'>): MethodDecorator {
  return addEventListener<TEvent>(selector, type, {...options??{}, root:'shadow', delegate: true});
}
export function addEventListenerDelegateAll<TEvent extends Event = Event>(selector: string, type: string, options?: Omit<AddEventListenerQueryOptions<TEvent>, 'delegate'>): MethodDecorator {
  return addEventListener<TEvent>(selector, type, {...options??{}, root:'all', delegate: true});
}
export function addEventListenerDelegate<TEvent extends Event = Event>(selector: string, type: string, options?: Omit<AddEventListenerQueryOptions<TEvent>, 'delegate'>): MethodDecorator {
  return addEventListener<TEvent>(selector, type, {...options??{}, root:'auto', delegate: true});
}

export function addEventListenerMutationLight<TEvent extends Event = Event>(selector: string, type: string, options?: Omit<AddEventListenerQueryOptions<TEvent>, 'delegate'>): MethodDecorator {
  return addEventListener<TEvent>(selector, type, {...options??{}, root:'light', delegate: 'mutation'});
}

export function addEventListenerMutationShadow<TEvent extends Event = Event>(selector: string, type: string, options?: Omit<AddEventListenerQueryOptions<TEvent>, 'delegate'>): MethodDecorator {
  return addEventListener<TEvent>(selector, type, {...options??{}, root:'shadow', delegate: 'mutation'});
}

export function addEventListenerMutationAll<TEvent extends Event = Event>(selector: string, type: string, options?: Omit<AddEventListenerQueryOptions<TEvent>, 'delegate'>): MethodDecorator {
  return addEventListener<TEvent>(selector, type, {...options??{}, root:'all', delegate: 'mutation'});
}

export function addEventListenerMutation<TEvent extends Event = Event>(selector: string, type: string, options?: Omit<AddEventListenerQueryOptions<TEvent>, 'delegate'>): MethodDecorator {
  return addEventListener<TEvent>(selector, type, {...options??{}, root:'auto', delegate: 'mutation'});
}

// ─── root별 일반 헬퍼 (delegate 없음, 문자열 셀렉터 전용) ───

export function addEventListenerLight<TEvent extends Event = Event>(selector: string, type: string, options?: AddEventListenerQueryOptions<TEvent>): MethodDecorator {
  return addEventListener<TEvent>(selector, type, {...options??{}, root:'light'});
}

export function addEventListenerShadow<TEvent extends Event = Event>(selector: string, type: string, options?: AddEventListenerQueryOptions<TEvent>): MethodDecorator {
  return addEventListener<TEvent>(selector, type, {...options??{}, root:'shadow'});
}

export function addEventListenerAll<TEvent extends Event = Event>(selector: string, type: string, options?: AddEventListenerQueryOptions<TEvent>): MethodDecorator {
  return addEventListener<TEvent>(selector, type, {...options??{}, root:'all'});
}

/**
 * @addEventListenerThis decorator - simplified version of @addEventListener for $this selector
 */
export function addEventListenerThis<TEvent extends Event = Event>(type: string, options?: AddEventListenerQueryOptions<TEvent>): MethodDecorator {
  return addEventListener<TEvent>('$this', type, options);
}

/**
 * @addEventListenerAppHost decorator - simplified version of @addEventListener for $appHost selector
 */
export function addEventListenerAppHost<TEvent extends Event = Event>(type: string, options?: AddEventListenerQueryOptions<TEvent>): MethodDecorator {
  return addEventListener<TEvent>('$appHost', type, options);
}

export function addEventListenerWindow<TEvent extends Event = Event>(type: string, options?: AddEventListenerQueryOptions<TEvent>): MethodDecorator {
  return addEventListener<TEvent>('$window', type, options);
}
export function addEventListenerDocument<TEvent extends Event = Event>(type: string, options?: AddEventListenerQueryOptions<TEvent>): MethodDecorator {
  return addEventListener<TEvent>('$document', type, options);
}

// --- Aliases: event... ---
export const event = addEventListener;
export const eventDelegateLight = addEventListenerDelegateLight;
export const eventDelegateShadow = addEventListenerDelegateShadow;
export const eventDelegateAll = addEventListenerDelegateAll;
export const eventDelegate = addEventListenerDelegate;
export const eventMutationLight = addEventListenerMutationLight;
export const eventMutationShadow = addEventListenerMutationShadow;
export const eventMutationAll = addEventListenerMutationAll;
export const eventMutation = addEventListenerMutation;
export const eventLight = addEventListenerLight;
export const eventShadow = addEventListenerShadow;
export const eventAll = addEventListenerAll;
export const eventAppHost = addEventListenerAppHost;
export const eventWindow = addEventListenerWindow;
export const eventDocument = addEventListenerDocument;
export const eventThis = addEventListenerThis;

export const getAddEventListenerMetadata = (target: any): AddEventListenerMetadata<Event>[] | undefined => {
  const constructor = target instanceof Function ? target : target.constructor;
  return ReflectUtils.getMetadata(ADD_EVENT_LISTENER_METADATA_KEY, constructor);
};

// ─────────────────────────────────────────────────────────────────────────────
// EventListenerLifeCycler
// ─────────────────────────────────────────────────────────────────────────────
import { ElementDefineLifeCycler, MutationObserverSetEntry, OnConnectedResult } from '../types';
import { Subject } from '@dooboostore/core';
import { debounceTime, distinctUntilChanged, throttleTime } from '@dooboostore/core/message/operators';
import { SwcUtils } from '../utils/Utils';

export interface BoundListenerEntry {
  target: EventTarget;
  type: string;
  handler: EventListener;
  options: AddEventListenerOptions;
  onRemoves?: Array<{ fn: (target: EventTarget, optionValue: unknown) => void; opts: unknown }>;
  subscription?: { unsubscribe: () => void };
  meta?: AddEventListenerMetadata<Event>;
}

export class EventListenerLifeCycler implements ElementDefineLifeCycler {
  /** 인스턴스별 boundListeners 상태 (시클러는 elementDefine 시 1회 생성되어 공유되므로) */
  private readonly boundListenersMap = new WeakMap<Element, BoundListenerEntry[]>();
  /** 인스턴스별 delegate:'mutation' 바인딩 추적 WeakSet — MutationObserverLifeCycler 에서 참조 */
  private readonly eventBoundSetsMap = new WeakMap<Element, Map<AddEventListenerMetadata, WeakSet<Element>>>();

  // ── 외부(MutationObserverLifeCycler)에서 직접 사용하는 공개 헬퍼 ──

  /** 인스턴스별 boundListeners 를 반환한다 (없으면 생성). */
  getBoundListeners(inst: Element): BoundListenerEntry[] {
    let list = this.boundListenersMap.get(inst);
    if (!list) { list = []; this.boundListenersMap.set(inst, list); }
    return list;
  }

  /** 인스턴스별 eventBoundSets 를 반환한다 (없으면 생성). */
  getEventBoundSets(inst: Element): Map<AddEventListenerMetadata, WeakSet<Element>> {
    let map = this.eventBoundSetsMap.get(inst);
    if (!map) { map = new Map(); this.eventBoundSetsMap.set(inst, map); }
    return map;
  }

  /**
   * target 에 meta 이벤트를 직접 바인딩한다.
   * delegate:'mutation' 초기/동적 바인딩에서 호출된다.
   */
  bindDirect(helperHostSet: HelperHostSet, target: EventTarget, meta: AddEventListenerMetadata): void {
    const inst = helperHostSet.$this;
    const currentWin = helperHostSet.$w;
    const { type, options } = meta;
    const opts = { capture: options.capture, once: options.once, passive: options.passive };

    const handler = async (event: Event) => {
      if (options.filter) {
        const helper = SwcUtils.getHelperAndHostSet(currentWin, target as HTMLElement);
        if (!options.filter(event, { currentThis: inst, helper })) return;
      }
      if (options.stopPropagation) event.stopPropagation();
      if (options.stopImmediatePropagation) event.stopImmediatePropagation();
      if (options.preventDefault) event.preventDefault();
      const currentHostSet = SwcUtils.getHostSet(inst);
      await inst[meta.propertyKey](event, { currentHostSet, $matchedElement: event.currentTarget }, { event, ...currentHostSet, $el: target, $root: target });
    };

    const eventSubject = new Subject<Event>();
    let eventStream: any = eventSubject;
    if (options.debounceTime && options.debounceTime > 0)
      eventStream = eventStream.pipe(debounceTime(options.debounceTime));
    if (options.throttleTime && options.throttleTime > 0)
      eventStream = eventStream.pipe(throttleTime(options.throttleTime));
    if (options.distinctUntilChanged !== undefined && options.distinctUntilChanged !== false) {
      eventStream = typeof options.distinctUntilChanged === 'function'
        ? eventStream.pipe(distinctUntilChanged(options.distinctUntilChanged))
        : eventStream.pipe(distinctUntilChanged());
    }

    const subscription = eventStream.subscribe({
      next: (e: Event) => handler(e).catch((err: any) => console.error('Event handler error:', err)),
      error: (err: any) => console.error('Event stream error:', err),
    });

    const wrappedHandler = (event: Event) => eventSubject.next(event);
    target.addEventListener(type, wrappedHandler, opts);

    const onRemoves: Array<{ fn: any; opts: any }> =
      options.removeListener ? [{ fn: options.removeListener, opts: options }] : [];
    this.getBoundListeners(inst).push({ target, type, handler: wrappedHandler, options: opts, subscription, onRemoves, meta });
  }

  /** target + meta 조합 리스너를 제거한다. MutationObserver 추적 요소 제거 시 호출. */
  unbindDirect(helperHostSet: HelperHostSet, target: EventTarget, meta: AddEventListenerMetadata): void {
    const inst = helperHostSet.$this;
    const list = this.getBoundListeners(inst);
    for (let i = list.length - 1; i >= 0; i--) {
      const l = list[i];
      if (l.target === target && l.type === meta.type && l.meta === meta) {
        try { l.target.removeEventListener(l.type, l.handler, l.options); l.subscription?.unsubscribe?.(); }
        catch (e) { console.error('[SWC] unbindDirect error:', e); }
        for (const r of l.onRemoves ?? []) {
          try { r.fn(l.target, r.opts); } catch (e) { console.error('[SWC] unbindDirect removeListener error:', e); }
        }
        list.splice(i, 1);
      }
    }
  }

  /**
   * 메타데이터 목록을 delegate / mutationDelegate / nonDelegate 로 분류한다.
   * MutationObserverLifeCycler 에서 mutationDelegate 목록을 꺼낼 때 사용한다.
   */
  classifyListeners(metaList: AddEventListenerMetadata[]): {
    delegateListeners: AddEventListenerMetadata[];
    mutationDelegateListeners: AddEventListenerMetadata[];
    nonDelegateListeners: AddEventListenerMetadata[];
  } {
    const isSpecial = (sel: any) =>
      ['$window', '$document', '$host', '$appHost', '$firstHost', '$lastHost',
       '$firstAppHost', '$lastAppHost', '$hosts', '$appHosts', '$this', ''].includes(sel);

    const delegateListeners: AddEventListenerMetadata[] = [];
    const mutationDelegateListeners: AddEventListenerMetadata[] = [];
    const nonDelegateListeners: AddEventListenerMetadata[] = [];

    for (const meta of metaList) {
      const isStr = typeof meta.selector === 'string';
      const mode = meta.options.delegate;
      if (mode && isStr && !isSpecial(meta.selector)) {
        mode === 'mutation' ? mutationDelegateListeners.push(meta) : delegateListeners.push(meta);
      } else {
        nonDelegateListeners.push(meta);
      }
    }
    return { delegateListeners, mutationDelegateListeners, nonDelegateListeners };
  }

  // ── ElementDefineLifeCycler 구현 ──

  onConnected(helperHostSet: HelperHostSet): OnConnectedResult | void {
    const inst = helperHostSet.$this;
    const currentWin = helperHostSet.$w;

    this.boundListenersMap.delete(inst);
    this.eventBoundSetsMap.delete(inst);

    const allMeta = getAddEventListenerMetadata(inst) ?? [];
    const { delegateListeners, nonDelegateListeners, mutationDelegateListeners } = this.classifyListeners(allMeta);

    // ── delegate 리스너: type+root 키로 그룹핑 → unified handler ──
    const groups = new Map<string, AddEventListenerMetadata[]>();
    for (const meta of delegateListeners) {
      const key = `${meta.type}:${meta.options.root || 'auto'}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(meta);
    }

    groups.forEach((metaList, key) => {
      const ci = key.indexOf(':');
      const type = key.slice(0, ci);
      const r = key.slice(ci + 1);
      const opts = { capture: metaList[0].options.capture, once: metaList[0].options.once, passive: metaList[0].options.passive };

      const roots: (HTMLElement | ShadowRoot)[] = [];
      if (r === 'auto') roots.push(inst.shadowRoot || inst);
      else if (r === 'light') roots.push(inst);
      else if (r === 'shadow' && inst.shadowRoot) roots.push(inst.shadowRoot);
      else if (r === 'all') { roots.push(inst); if (inst.shadowRoot) roots.push(inst.shadowRoot); }

      for (const br of roots) {
        const sorted = [...metaList].sort((a, b) => (b.options.stopPropagation ? 1 : 0) - (a.options.stopPropagation ? 1 : 0));
        const handler = async (event: Event) => {
          for (const m of sorted) {
            const matchedEl = (event.target as HTMLElement)?.closest(m.selector as string);
            console.log('[DBG][delegate] type=', event.type, '| evtTarget=', (event.target as any)?.tagName, '| sel=', m.selector, '| matchedEl=', matchedEl?.className || matchedEl?.tagName, '| brContains=', (br as any).contains?.(matchedEl), '| brTag=', (br as any).tagName || (br as any).constructor?.name);
            if (matchedEl && (br as any).contains(matchedEl)) {
              if (m.options.filter) {
                const helper = SwcUtils.getHelperAndHostSet(currentWin, matchedEl as HTMLElement);
                if (!m.options.filter(event, { currentThis: inst, helper })) continue;
              }
              if (m.options.stopPropagation) event.stopPropagation();
              if (m.options.stopImmediatePropagation) event.stopImmediatePropagation();
              if (m.options.preventDefault) event.preventDefault();
              const hs = SwcUtils.getHostSet(inst);
              await inst[m.propertyKey](event, { ...hs, $matchedElement: matchedEl }, { event, ...hs, $el: matchedEl, $root: br });
              if ((event as any).cancelBubble) break;
            }
          }
        };
        br.addEventListener(type, handler, opts);
        if (type === 'click') {
          console.log('[DBG][eventCycler] bound click on br=', (br as any).tagName || (br as any).constructor?.name, '| inst=', (inst as any).tagName || (inst as any).constructor?.name, '| isSame=', br === inst);
        }
        const onRemoves: Array<{ fn: any; opts: any }> = sorted.filter(m => m.options.removeListener).map(m => ({ fn: m.options.removeListener, opts: m.options }));
        this.getBoundListeners(inst).push({ target: br, type, handler, options: opts, onRemoves });
      }
    });

    // ── non-delegate 리스너: 대상 요소 직접 탐색 → bindDirect ──
    for (const meta of nonDelegateListeners) {
      const { selector, options } = meta;
      const r = options.root || 'auto';
      const bindTargets: EventTarget[] = [];

      let resolvedSel: string | null = null;
      if (typeof selector === 'function') {
        const result = selector(inst, helperHostSet);
        if (typeof result === 'string') resolvedSel = result;
        else if (result instanceof currentWin.Element) bindTargets.push(result as EventTarget);
        else if (result instanceof currentWin.NodeList) bindTargets.push(...(Array.from(result) as EventTarget[]));
        else if (Array.isArray(result)) bindTargets.push(...(result as EventTarget[]));
      } else {
        resolvedSel = selector;
      }

      const applyRoot = (t: any) => {
        if (!t) return;
        if (r === 'auto') bindTargets.push(t.shadowRoot || t);
        else { if (r === 'light' || r === 'all') bindTargets.push(t); if ((r === 'shadow' || r === 'all') && t.shadowRoot) bindTargets.push(t.shadowRoot); }
      };

      if (resolvedSel) {
        if (resolvedSel === '$window') bindTargets.push(currentWin);
        else if (resolvedSel === '$document') bindTargets.push(currentWin.document);
        else if (resolvedSel === '$host') applyRoot(helperHostSet.$host);
        else if (resolvedSel === '$parentHost') applyRoot(helperHostSet.$parentHost);
        else if (resolvedSel === '$appHost') applyRoot(helperHostSet.$appHost);
        else if (resolvedSel === '$firstHost') applyRoot(helperHostSet.$firstHost);
        else if (resolvedSel === '$lastHost') applyRoot(helperHostSet.$lastHost);
        else if (resolvedSel === '$firstAppHost') applyRoot(helperHostSet.$firstAppHost);
        else if (resolvedSel === '$lastAppHost') applyRoot(helperHostSet.$lastAppHost);
        else if (resolvedSel === '$hosts') helperHostSet.$hosts.forEach(applyRoot);
        else if (resolvedSel === '$appHosts') helperHostSet.$appHosts.forEach(applyRoot);
        else if (resolvedSel === '$this' || !resolvedSel) applyRoot(inst);
        else {
          const searchRoots: (HTMLElement | ShadowRoot)[] = [];
          if (r === 'auto') searchRoots.push(inst.shadowRoot || inst);
          else if (r === 'light') searchRoots.push(inst);
          else if (r === 'shadow' && inst.shadowRoot) searchRoots.push(inst.shadowRoot);
          else if (r === 'all') { searchRoots.push(inst); if (inst.shadowRoot) searchRoots.push(inst.shadowRoot); }
          for (const sr of searchRoots) sr.querySelectorAll(resolvedSel).forEach(el => bindTargets.push(el));
        }
      }

      for (const t of bindTargets) this.bindDirect(helperHostSet, t, meta);
    }

    // ── delegate:'mutation' 리스너: MutationObserver 로 추가/제거된 요소를 추적해 직접 바인딩/해제 ──
    // 이벤트 리스너의 책임이므로 EventListenerLifeCycler 가 직접 처리하고,
    // mutationObserverSet 을 반환해 elementDefine 이 하나의 MutationObserver 로 생성하게 한다.
    if (mutationDelegateListeners.length > 0) {
      const shadowEventDelegates = mutationDelegateListeners.filter(m => {
        const r = m.options.root || 'auto';
        return inst.shadowRoot && (r === 'shadow' || r === 'all' || r === 'auto');
      });
      const lightEventDelegates = mutationDelegateListeners.filter(m => {
        const r = m.options.root || 'auto';
        return r === 'light' || r === 'all' || (!inst.shadowRoot && r === 'auto');
      });

      const buildMutationEntry = (
        root: HTMLElement | ShadowRoot,
        eventDelegates: AddEventListenerMetadata[],
      ): MutationObserverSetEntry | null => {
        if (eventDelegates.length === 0) return null;
        const boundSets = this.getEventBoundSets(inst);

        const callback = (mutations: MutationRecord[], obs: MutationObserver) => {
          for (const m of eventDelegates) {
            let boundSet = boundSets.get(m);
            if (!boundSet) { boundSet = new WeakSet<Element>(); boundSets.set(m, boundSet); }

            const isThis = m.selector === '$this' || m.selector === '';
            const matchesSel = (n: any) => {
              if (!n || n.nodeType !== 1) return false;
              if (isThis) return true;
              return typeof m.selector === 'string' && (n as HTMLElement).matches?.(m.selector);
            };
            const bindEl   = (el: Element) => { if (!boundSet!.has(el)) { this.bindDirect(helperHostSet, el, m); boundSet!.add(el); } };
            const unbindEl = (el: Element) => { if (boundSet!.has(el))  { this.unbindDirect(helperHostSet, el, m); boundSet!.delete(el); } };

            for (const mut of mutations) {
              Array.from(mut.addedNodes   || []).forEach(n => { if (n.nodeType !== 1) return; if (matchesSel(n)) bindEl(n as Element); else if (!isThis && typeof m.selector === 'string') (n as Element).querySelectorAll?.(m.selector).forEach(bindEl); });
              Array.from(mut.removedNodes || []).forEach(n => { if (n.nodeType !== 1) return; const el = n as Element; if (matchesSel(el)) unbindEl(el); else if (!isThis && typeof m.selector === 'string') el.querySelectorAll?.(m.selector).forEach(unbindEl); });
            }
          }
        };

        // delegate:'mutation' 초기 바인딩 (connected 시 이미 존재하는 요소)
        for (const m of eventDelegates) {
          let boundSet = boundSets.get(m);
          if (!boundSet) { boundSet = new WeakSet<Element>(); boundSets.set(m, boundSet); }
          if (typeof m.selector !== 'string') continue;
          if (m.selector === '$this' || m.selector === '') {
            this.bindDirect(helperHostSet, root as EventTarget, m);
            boundSet.add(root as Element);
          } else {
            root.querySelectorAll(m.selector).forEach(el => {
              if (!boundSet!.has(el)) { this.bindDirect(helperHostSet, el, m); boundSet!.add(el); }
            });
          }
        }

        return { target: root, options: { childList: true, subtree: true }, callback };
      };

      const shadowEntry = inst.shadowRoot ? buildMutationEntry(inst.shadowRoot, shadowEventDelegates) : null;
      const lightEntry = buildMutationEntry(inst as any, lightEventDelegates);
      const mutationObserverSet: MutationObserverSetEntry[] = [shadowEntry, lightEntry].filter(Boolean) as MutationObserverSetEntry[];
      if (mutationObserverSet.length > 0) return { mutationObserverSet };
    }

    return undefined;
  }

  onDisconnected(helperHostSet: HelperHostSet): void {
    const inst = helperHostSet.$this;
    const list = this.boundListenersMap.get(inst) ?? [];
    for (const l of list) {
      try { l.target.removeEventListener(l.type, l.handler, l.options); l.subscription?.unsubscribe?.(); }
      catch (e) { console.error('[SWC] EventListenerLifeCycler cleanup error:', e); }
      for (const r of l.onRemoves ?? []) {
        try { r.fn(l.target, r.opts); } catch (e) { console.error('[SWC] removeListener error:', e); }
      }
    }
    this.boundListenersMap.delete(inst);
    this.eventBoundSetsMap.delete(inst);
  }
}
