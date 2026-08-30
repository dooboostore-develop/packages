import { DocumentBase } from '../node/DocumentBase';
import { NodeBase } from '../node/NodeBase';
import { ElementBase } from '../node/elements/ElementBase';

// Import all element classes
import {
  HTMLElement,
  HTMLElementBase,
  HTMLAnchorElement,
  HTMLAreaElement,
  HTMLAudioElement,
  HTMLBaseElement,
  HTMLBodyElement,
  HTMLButtonElement,
  HTMLCanvasElement,
  HTMLCaptionElement,
  HTMLDataElement,
  HTMLDataListElement,
  HTMLDetailsElement,
  HTMLDialogElement,
  HTMLDivElement,
  HTMLDListElement,
  HTMLEmbedElement,
  HTMLFieldSetElement,
  HTMLFormElement,
  HTMLH1Element,
  HTMLHeadElement,
  HTMLHRElement,
  HTMLHtmlElement,
  HTMLIFrameElement,
  HTMLImgElement,
  HTMLInputElement,
  HTMLLabelElement,
  HTMLLegendElement,
  HTMLLIElement,
  HTMLLinkElement,
  HTMLMapElement,
  HTMLMetaElement,
  HTMLMeterElement,
  HTMLModElement,
  HTMLObjectElement,
  HTMLOListElement,
  HTMLOptGroupElement,
  HTMLOptionElement,
  HTMLOutputElement,
  HTMLPElement,
  HTMLParamElement,
  HTMLPictureElement,
  HTMLPreElement,
  HTMLProgressElement,
  HTMLQuoteElement,
  HTMLScriptElement,
  HTMLSelectElement,
  HTMLSlotElement,
  HTMLSourceElement,
  HTMLSpanElement,
  HTMLStyleElement,
  HTMLTableElement,
  HTMLTbodyElement,
  HTMLTdElement,
  HTMLTemplateElement,
  HTMLTextAreaElement,
  HTMLTfootElement,
  HTMLTheadElement,
  HTMLThElement,
  HTMLTimeElement,
  HTMLTitleElement,
  HTMLTrackElement,
  HTMLTrElement,
  HTMLUListElement,
  HTMLVideoElement
} from '../node/elements';
import { CustomElementRegistryImp } from './CustomElementRegistryImp';
import { ShadowRootBase } from '../node/ShadowRootBase';
import { NodeFilter } from '../node/NodeFilter';
import { NodeList } from '../node';
import { LocationBase } from './LocationBase';
import { HistoryBase } from './HistoryBase';
import { NavigatorBase } from './NavigatorBase';
import { UrlUtils } from '@dooboostore/core';

interface WindowEventListener {
  type: string;
  listener: (event: any) => void;
  options?: any;
}

export class WindowBase implements Window {
  [key: string]: any;

  private _eventListeners: WindowEventListener[] = [];
  private _timers: Set<number> = new Set();
  private _intervals: Set<number> = new Set();
  private _animationFrames: Set<number> = new Set();
  private _closed: boolean = false;

  readonly clientInformation: Navigator;
  readonly cookieStore: any = {};
  readonly customElements: CustomElementRegistry;
  readonly devicePixelRatio: number = 1;
  readonly document: Document;
  readonly history: History;
  readonly navigator: Navigator;
  readonly self: any = this;
  readonly window: any = this;

  private _location: LocationBase;
  get location(): Location {
    return this._location;
  }
  set location(href: string | Location) {
    if (typeof href === 'string') this._location.href = href;
    else this._location.href = href.href;
  }

  console = console;

  // ── Observer stubs (no-op in SSR) ────────────────────────────────────────
  IntersectionObserver = class {
    observe(_target: Element, _options?: any): void {}
    unobserve(_target: Element): void {}
    disconnect(): void {}
    takeRecords(): IntersectionObserverEntry[] { return []; }
  };
  MutationObserver = class {
    observe(_target: Node, _options?: MutationObserverInit): void {}
    disconnect(): void {}
    takeRecords(): MutationRecord[] { return []; }
  };
  ResizeObserver = class {
    observe(_target: Element, _options?: ResizeObserverOptions): void {}
    unobserve(_target: Element): void {}
    disconnect(): void {}
  };

  // ── Global event constructors ─────────────────────────────────────────────
  Event = class Event {
    constructor(public type: string) {}
  };
  CustomEvent = class CustomEvent extends this.Event {
    constructor(type: string, public detail: any) {
      super(type);
    }
  };

  // ── DOM type references ───────────────────────────────────────────────────
  Node = NodeBase;
  NodeList = NodeList;
  Element = ElementBase;
  HTMLElement = HTMLElement;
  HTMLAnchorElement = HTMLAnchorElement;
  HTMLAreaElement = HTMLAreaElement;
  HTMLAudioElement = HTMLAudioElement;
  HTMLBaseElement = HTMLBaseElement;
  HTMLBodyElement = HTMLBodyElement;
  HTMLButtonElement = HTMLButtonElement;
  HTMLCanvasElement = HTMLCanvasElement;
  HTMLCaptionElement = HTMLCaptionElement;
  HTMLDataElement = HTMLDataElement;
  HTMLDataListElement = HTMLDataListElement;
  HTMLDetailsElement = HTMLDetailsElement;
  HTMLDialogElement = HTMLDialogElement;
  HTMLDivElement = HTMLDivElement;
  HTMLDListElement = HTMLDListElement;
  HTMLEmbedElement = HTMLEmbedElement;
  HTMLFieldSetElement = HTMLFieldSetElement;
  HTMLFormElement = HTMLFormElement;
  HTMLH1Element = HTMLH1Element;
  HTMLHeadElement = HTMLHeadElement;
  HTMLHRElement = HTMLHRElement;
  HTMLHtmlElement = HTMLHtmlElement;
  HTMLIFrameElement = HTMLIFrameElement;
  HTMLImgElement = HTMLImgElement;
  HTMLInputElement = HTMLInputElement;
  HTMLLabelElement = HTMLLabelElement;
  HTMLLegendElement = HTMLLegendElement;
  HTMLLIElement = HTMLLIElement;
  HTMLLinkElement = HTMLLinkElement;
  HTMLMapElement = HTMLMapElement;
  HTMLMetaElement = HTMLMetaElement;
  HTMLMeterElement = HTMLMeterElement;
  HTMLModElement = HTMLModElement;
  HTMLObjectElement = HTMLObjectElement;
  HTMLOListElement = HTMLOListElement;
  HTMLOptGroupElement = HTMLOptGroupElement;
  HTMLOptionElement = HTMLOptionElement;
  HTMLOutputElement = HTMLOutputElement;
  HTMLPElement = HTMLPElement;
  HTMLParamElement = HTMLParamElement;
  HTMLPictureElement = HTMLPictureElement;
  HTMLPreElement = HTMLPreElement;
  HTMLProgressElement = HTMLProgressElement;
  HTMLQuoteElement = HTMLQuoteElement;
  HTMLScriptElement = HTMLScriptElement;
  HTMLSelectElement = HTMLSelectElement;
  HTMLSlotElement = HTMLSlotElement;
  HTMLSourceElement = HTMLSourceElement;
  HTMLSpanElement = HTMLSpanElement;
  HTMLStyleElement = HTMLStyleElement;
  HTMLTableElement = HTMLTableElement;
  HTMLTbodyElement = HTMLTbodyElement;
  HTMLTdElement = HTMLTdElement;
  HTMLTemplateElement = HTMLTemplateElement;
  HTMLTextAreaElement = HTMLTextAreaElement;
  HTMLTfootElement = HTMLTfootElement;
  HTMLTheadElement = HTMLTheadElement;
  HTMLThElement = HTMLThElement;
  HTMLTimeElement = HTMLTimeElement;
  HTMLTitleElement = HTMLTitleElement;
  HTMLTrackElement = HTMLTrackElement;
  HTMLTrElement = HTMLTrElement;
  HTMLUListElement = HTMLUListElement;
  HTMLVideoElement = HTMLVideoElement;

  // Type aliases for common alternate names
  HTMLImageElement = HTMLImgElement;
  HTMLParagraphElement = HTMLPElement;
  HTMLHeadingElement = HTMLH1Element;
  HTMLTableSectionElement = HTMLTbodyElement;
  HTMLTableCellElement = HTMLTdElement;
  HTMLTableRowElement = HTMLTrElement;
  ShadowRoot = ShadowRootBase;
  NodeFilter = NodeFilter;

  private _config: { initialUrl?: string; onUrlChange?: (url: string) => void; fetch?: typeof globalThis.fetch } = {};

  constructor(config?: {
    initialUrl?: string;
    onUrlChange?: (url: string) => void;
    fetch?: typeof globalThis.fetch;
  }) {
    this._config = config ?? {};
    const documentBase = new DocumentBase();
    if (documentBase && (documentBase as any).setWindow) {
      (documentBase as any).setWindow(this);
    }
    this._location = new LocationBase(config?.initialUrl, config?.onUrlChange);
    this._location.setHashChangeCallback((oldUrl, newUrl) => {
      this.dispatchEvent({
        type: 'hashchange',
        oldURL: oldUrl,
        newURL: newUrl,
        target: this,
        currentTarget: this,
        bubbles: true,
        cancelable: false,
      });
    });
    documentBase.setLocation(this._location);
    this.document = documentBase as unknown as Document;

    const customElementRegistryImp = new CustomElementRegistryImp();
    customElementRegistryImp.setWindow(this);
    this.customElements = customElementRegistryImp as unknown as CustomElementRegistry;

    this.history = new HistoryBase(this);
    this.navigator = new NavigatorBase();
    this.clientInformation = this.navigator;
  }

  // ── Window interface stub fields ──────────────────────────────────────────
  [index: number]: Window;
  event: Event;
  external: External;
  frameElement: Element;
  frames: Window;
  innerHeight: number;
  innerWidth: number;
  length: number;
  locationbar: BarProp;
  menubar: BarProp;
  name: string;
  ondevicemotion: (this: Window, ev: DeviceMotionEvent) => any;
  ondeviceorientation: (this: Window, ev: DeviceOrientationEvent) => any;
  ondeviceorientationabsolute: (this: Window, ev: DeviceOrientationEvent) => any;
  onorientationchange: (this: Window, ev: Event) => any;
  opener: any;
  orientation: number;
  originAgentCluster: boolean;
  outerHeight: number;
  outerWidth: number;
  pageXOffset: number;
  pageYOffset: number;
  parent: Window;
  personalbar: BarProp;
  screen: Screen;
  screenLeft: number;
  screenTop: number;
  screenX: number;
  screenY: number;
  scrollX: number;
  scrollY: number;
  scrollbars: BarProp;
  speechSynthesis: SpeechSynthesis;
  status: string;
  statusbar: BarProp;
  toolbar: BarProp;
  top: Window;
  visualViewport: VisualViewport;
  localStorage: Storage;
  sessionStorage: Storage;
  caches: CacheStorage;
  crossOriginIsolated: boolean;
  crypto: Crypto;
  indexedDB: IDBFactory;
  isSecureContext: boolean;
  origin: string;
  performance: Performance;

  // ── GlobalEventHandlers stubs ─────────────────────────────────────────────
  onabort: (this: GlobalEventHandlers, ev: UIEvent) => any;
  onanimationcancel: (this: GlobalEventHandlers, ev: AnimationEvent) => any;
  onanimationend: (this: GlobalEventHandlers, ev: AnimationEvent) => any;
  onanimationiteration: (this: GlobalEventHandlers, ev: AnimationEvent) => any;
  onanimationstart: (this: GlobalEventHandlers, ev: AnimationEvent) => any;
  onauxclick: (this: GlobalEventHandlers, ev: PointerEvent) => any;
  onbeforeinput: (this: GlobalEventHandlers, ev: InputEvent) => any;
  onbeforematch: (this: GlobalEventHandlers, ev: Event) => any;
  onbeforetoggle: (this: GlobalEventHandlers, ev: ToggleEvent) => any;
  onblur: (this: GlobalEventHandlers, ev: FocusEvent) => any;
  oncancel: (this: GlobalEventHandlers, ev: Event) => any;
  oncanplay: (this: GlobalEventHandlers, ev: Event) => any;
  oncanplaythrough: (this: GlobalEventHandlers, ev: Event) => any;
  onchange: (this: GlobalEventHandlers, ev: Event) => any;
  onclick: (this: GlobalEventHandlers, ev: PointerEvent) => any;
  onclose: (this: GlobalEventHandlers, ev: Event) => any;
  oncontextlost: (this: GlobalEventHandlers, ev: Event) => any;
  oncontextmenu: (this: GlobalEventHandlers, ev: PointerEvent) => any;
  oncontextrestored: (this: GlobalEventHandlers, ev: Event) => any;
  oncopy: (this: GlobalEventHandlers, ev: ClipboardEvent) => any;
  oncuechange: (this: GlobalEventHandlers, ev: Event) => any;
  oncut: (this: GlobalEventHandlers, ev: ClipboardEvent) => any;
  ondblclick: (this: GlobalEventHandlers, ev: MouseEvent) => any;
  ondrag: (this: GlobalEventHandlers, ev: DragEvent) => any;
  ondragend: (this: GlobalEventHandlers, ev: DragEvent) => any;
  ondragenter: (this: GlobalEventHandlers, ev: DragEvent) => any;
  ondragleave: (this: GlobalEventHandlers, ev: DragEvent) => any;
  ondragover: (this: GlobalEventHandlers, ev: DragEvent) => any;
  ondragstart: (this: GlobalEventHandlers, ev: DragEvent) => any;
  ondrop: (this: GlobalEventHandlers, ev: DragEvent) => any;
  ondurationchange: (this: GlobalEventHandlers, ev: Event) => any;
  onemptied: (this: GlobalEventHandlers, ev: Event) => any;
  onended: (this: GlobalEventHandlers, ev: Event) => any;
  onerror: OnErrorEventHandlerNonNull;
  onfocus: (this: GlobalEventHandlers, ev: FocusEvent) => any;
  onformdata: (this: GlobalEventHandlers, ev: FormDataEvent) => any;
  ongotpointercapture: (this: GlobalEventHandlers, ev: PointerEvent) => any;
  oninput: (this: GlobalEventHandlers, ev: Event) => any;
  oninvalid: (this: GlobalEventHandlers, ev: Event) => any;
  onkeydown: (this: GlobalEventHandlers, ev: KeyboardEvent) => any;
  onkeypress: (this: GlobalEventHandlers, ev: KeyboardEvent) => any;
  onkeyup: (this: GlobalEventHandlers, ev: KeyboardEvent) => any;
  onload: (this: GlobalEventHandlers, ev: Event) => any;
  onloadeddata: (this: GlobalEventHandlers, ev: Event) => any;
  onloadedmetadata: (this: GlobalEventHandlers, ev: Event) => any;
  onloadstart: (this: GlobalEventHandlers, ev: Event) => any;
  onlostpointercapture: (this: GlobalEventHandlers, ev: PointerEvent) => any;
  onmousedown: (this: GlobalEventHandlers, ev: MouseEvent) => any;
  onmouseenter: (this: GlobalEventHandlers, ev: MouseEvent) => any;
  onmouseleave: (this: GlobalEventHandlers, ev: MouseEvent) => any;
  onmousemove: (this: GlobalEventHandlers, ev: MouseEvent) => any;
  onmouseout: (this: GlobalEventHandlers, ev: MouseEvent) => any;
  onmouseover: (this: GlobalEventHandlers, ev: MouseEvent) => any;
  onmouseup: (this: GlobalEventHandlers, ev: MouseEvent) => any;
  onpaste: (this: GlobalEventHandlers, ev: ClipboardEvent) => any;
  onpause: (this: GlobalEventHandlers, ev: Event) => any;
  onplay: (this: GlobalEventHandlers, ev: Event) => any;
  onplaying: (this: GlobalEventHandlers, ev: Event) => any;
  onpointercancel: (this: GlobalEventHandlers, ev: PointerEvent) => any;
  onpointerdown: (this: GlobalEventHandlers, ev: PointerEvent) => any;
  onpointerenter: (this: GlobalEventHandlers, ev: PointerEvent) => any;
  onpointerleave: (this: GlobalEventHandlers, ev: PointerEvent) => any;
  onpointermove: (this: GlobalEventHandlers, ev: PointerEvent) => any;
  onpointerout: (this: GlobalEventHandlers, ev: PointerEvent) => any;
  onpointerover: (this: GlobalEventHandlers, ev: PointerEvent) => any;
  onpointerrawupdate: (this: GlobalEventHandlers, ev: Event) => any;
  onpointerup: (this: GlobalEventHandlers, ev: PointerEvent) => any;
  onprogress: (this: GlobalEventHandlers, ev: ProgressEvent) => any;
  onratechange: (this: GlobalEventHandlers, ev: Event) => any;
  onreset: (this: GlobalEventHandlers, ev: Event) => any;
  onresize: (this: GlobalEventHandlers, ev: UIEvent) => any;
  onscroll: (this: GlobalEventHandlers, ev: Event) => any;
  onscrollend: (this: GlobalEventHandlers, ev: Event) => any;
  onsecuritypolicyviolation: (this: GlobalEventHandlers, ev: SecurityPolicyViolationEvent) => any;
  onseeked: (this: GlobalEventHandlers, ev: Event) => any;
  onseeking: (this: GlobalEventHandlers, ev: Event) => any;
  onselect: (this: GlobalEventHandlers, ev: Event) => any;
  onselectionchange: (this: GlobalEventHandlers, ev: Event) => any;
  onselectstart: (this: GlobalEventHandlers, ev: Event) => any;
  onslotchange: (this: GlobalEventHandlers, ev: Event) => any;
  onstalled: (this: GlobalEventHandlers, ev: Event) => any;
  onsubmit: (this: GlobalEventHandlers, ev: SubmitEvent) => any;
  onsuspend: (this: GlobalEventHandlers, ev: Event) => any;
  ontimeupdate: (this: GlobalEventHandlers, ev: Event) => any;
  ontoggle: (this: GlobalEventHandlers, ev: ToggleEvent) => any;
  ontouchcancel?: (this: GlobalEventHandlers, ev: TouchEvent) => any;
  ontouchend?: (this: GlobalEventHandlers, ev: TouchEvent) => any;
  ontouchmove?: (this: GlobalEventHandlers, ev: TouchEvent) => any;
  ontouchstart?: (this: GlobalEventHandlers, ev: TouchEvent) => any;
  ontransitioncancel: (this: GlobalEventHandlers, ev: TransitionEvent) => any;
  ontransitionend: (this: GlobalEventHandlers, ev: TransitionEvent) => any;
  ontransitionrun: (this: GlobalEventHandlers, ev: TransitionEvent) => any;
  ontransitionstart: (this: GlobalEventHandlers, ev: TransitionEvent) => any;
  onvolumechange: (this: GlobalEventHandlers, ev: Event) => any;
  onwaiting: (this: GlobalEventHandlers, ev: Event) => any;
  onwebkitanimationend: (this: GlobalEventHandlers, ev: Event) => any;
  onwebkitanimationiteration: (this: GlobalEventHandlers, ev: Event) => any;
  onwebkitanimationstart: (this: GlobalEventHandlers, ev: Event) => any;
  onwebkittransitionend: (this: GlobalEventHandlers, ev: Event) => any;
  onwheel: (this: GlobalEventHandlers, ev: WheelEvent) => any;

  // ── WindowEventHandlers stubs ─────────────────────────────────────────────
  onafterprint: (this: WindowEventHandlers, ev: Event) => any;
  onbeforeprint: (this: WindowEventHandlers, ev: Event) => any;
  onbeforeunload: (this: WindowEventHandlers, ev: BeforeUnloadEvent) => any;
  ongamepadconnected: (this: WindowEventHandlers, ev: GamepadEvent) => any;
  ongamepaddisconnected: (this: WindowEventHandlers, ev: GamepadEvent) => any;
  onhashchange: (this: WindowEventHandlers, ev: HashChangeEvent) => any;
  onlanguagechange: (this: WindowEventHandlers, ev: Event) => any;
  onmessage: (this: WindowEventHandlers, ev: MessageEvent) => any;
  onmessageerror: (this: WindowEventHandlers, ev: MessageEvent) => any;
  onoffline: (this: WindowEventHandlers, ev: Event) => any;
  ononline: (this: WindowEventHandlers, ev: Event) => any;
  onpagehide: (this: WindowEventHandlers, ev: PageTransitionEvent) => any;
  onpagereveal: (this: WindowEventHandlers, ev: PageRevealEvent) => any;
  onpageshow: (this: WindowEventHandlers, ev: PageTransitionEvent) => any;
  onpageswap: (this: WindowEventHandlers, ev: PageSwapEvent) => any;
  onpopstate: (this: WindowEventHandlers, ev: PopStateEvent) => any;
  onrejectionhandled: (this: WindowEventHandlers, ev: PromiseRejectionEvent) => any;
  onstorage: (this: WindowEventHandlers, ev: StorageEvent) => any;
  onunhandledrejection: (this: WindowEventHandlers, ev: PromiseRejectionEvent) => any;
  onunload: (this: WindowEventHandlers, ev: Event) => any;

  // ── Window methods ────────────────────────────────────────────────────────
  get closed(): boolean {
    return this._closed;
  }

  alert(_message?: any): void {}

  blur(): void {}

  cancelIdleCallback(_handle: number): void {}

  captureEvents(): void {}

  close(): void {
    if (this._closed) return;
    // spec: beforeunload is skippable in SSR, but fire pagehide then unload
    this.dispatchPageHide(false);
    this.dispatchUnload();
    this._closed = true;
    this._timers.forEach(id => clearTimeout(id));
    this._intervals.forEach(id => clearInterval(id));
    this._eventListeners.length = 0;
  }

  confirm(_message?: string): boolean {
    return false;
  }

  focus(): void {}

  getComputedStyle(_elt: Element, _pseudoElt?: string | null): CSSStyleDeclaration {
    // SSR: return a minimal no-op CSSStyleDeclaration so property reads are safe.
    const emptyStyle: any = {
      parentRule: null,
      cssText: '',
      length: 0,
      getPropertyValue: () => '',
      getPropertyPriority: () => '',
      setProperty: () => {},
      removeProperty: () => '',
      item: () => '',
    };
    return emptyStyle as CSSStyleDeclaration;
  }

  getSelection(): Selection | null {
    return null;
  }

  matchMedia(query: string): MediaQueryList {
    // SSR: media queries cannot be evaluated; return a safe non-matching stub.
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    };
  }

  moveBy(_x: number, _y: number): void {}
  moveTo(_x: number, _y: number): void {}

  open(_url?: string | URL, _target?: string, _features?: string): WindowProxy | null {
    return null;
  }

  postMessage(_message: unknown, _targetOrigin?: unknown, _transfer?: unknown): void {}

  print(): void {}

  prompt(_message?: string, _default?: string): string | null {
    return null;
  }

  releaseEvents(): void {}

  requestIdleCallback(_callback: IdleRequestCallback, _options?: IdleRequestOptions): number {
    return 0;
  }

  resizeBy(_x: number, _y: number): void {}
  resizeTo(_width: number, _height: number): void {}
  scroll(_x?: unknown, _y?: unknown): void {}
  scrollBy(_x?: unknown, _y?: unknown): void {}
  scrollTo(_x?: unknown, _y?: unknown): void {}
  stop(): void {}

  cancelAnimationFrame(_handle: number): void {}

  requestAnimationFrame(callback: FrameRequestCallback): number {
    // SSR: delegate to setTimeout as rAF is unavailable.
    return this.setTimeout(() => callback(Date.now()), 16) as number;
  }

  atob(_data: string): string {
    return '';
  }

  btoa(_data: string): string {
    return '';
  }

  createImageBitmap(
    _image: unknown,
    _sx?: unknown,
    _sy?: unknown,
    _sw?: unknown,
    _sh?: unknown,
    _options?: unknown
  ): Promise<ImageBitmap> {
    return Promise.resolve({} as ImageBitmap);
  }

  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const resolvedInput = UrlUtils.toAbsoluteRequest(input, this._location.href);
    if (this._config.fetch) {
      return this._config.fetch(resolvedInput, init);
    }
    return Promise.resolve(new Response('', { status: 200 }));
  }

  queueMicrotask(callback: VoidFunction): void {
    globalThis.queueMicrotask(callback);
  }

  reportError(e: any): void {
    console.error(e);
  }

  structuredClone<T = any>(value: T, _options?: StructuredSerializeOptions): T {
    return JSON.parse(JSON.stringify(value));
  }

  // ── Timer helpers ─────────────────────────────────────────────────────────
  setTimeout(callback: Function, delay?: number, ...args: any[]): number {
    const id = globalThis.setTimeout(() => {
      this._timers.delete(id as any);
      callback(...args);
    }, delay) as any;
    this._timers.add(id);
    return id;
  }

  clearTimeout(id: number): void {
    globalThis.clearTimeout(id);
    this._timers.delete(id);
  }

  setInterval(callback: Function, delay?: number, ...args: any[]): number {
    const id = globalThis.setInterval(callback, delay, ...args);
    this._intervals.add(id);
    return id;
  }

  clearInterval(id: number): void {
    globalThis.clearInterval(id);
    this._intervals.delete(id);
  }

  // ── Event system ──────────────────────────────────────────────────────────
  addEventListener(type: string, listener: any, options?: any): void {
    this._eventListeners.push({
      type,
      listener: typeof listener === 'function' ? listener : listener?.handleEvent,
      options,
    });
  }

  removeEventListener(type: string, listener: any): void {
    const targetListener = typeof listener === 'function' ? listener : listener?.handleEvent;
    this._eventListeners = this._eventListeners.filter(
      l => !(l.type === type && l.listener === targetListener)
    );
  }

  dispatchEvent(event: any): boolean {
    const type = typeof event === 'string' ? event : event.type;
    const listeners = [...this._eventListeners.filter(l => l.type === type)];

    for (const l of listeners) {
      try {
        l.listener.call(this, event);
        if (l.options?.once) {
          this.removeEventListener(type, l.listener);
        }
      } catch (e) {
        console.error(`Error in Window event listener for ${type}:`, e);
      }
    }

    // Also invoke on* property handler (e.g. onpageshow, onbeforeunload).
    const onHandler = (this as any)['on' + type];
    if (typeof onHandler === 'function') {
      try {
        onHandler.call(this, event);
      } catch (e) {
        console.error(`Error in Window on${type} handler:`, e);
      }
    }

    // beforeunload: treat non-empty returnValue as cancelled.
    if (type === 'beforeunload' && event) {
      if (event.returnValue !== undefined && event.returnValue !== '' && event.returnValue !== null) {
        event.defaultPrevented = true;
      }
      return !event.defaultPrevented;
    }
    return !(event && event.defaultPrevented);
  }

  // ── Page lifecycle ────────────────────────────────────────────────────────
  private _createPageTransitionEvent(type: 'pageshow' | 'pagehide', persisted: boolean): any {
    return {
      type,
      persisted,
      target: this,
      currentTarget: this,
      bubbles: false,
      cancelable: false,
      defaultPrevented: false,
      timeStamp: Date.now(),
      preventDefault() { (this as any).defaultPrevented = true; },
    };
  }

  dispatchPageShow(persisted = false): void {
    this.dispatchEvent(this._createPageTransitionEvent('pageshow', persisted));
  }

  dispatchPageHide(persisted = false): void {
    this.dispatchEvent(this._createPageTransitionEvent('pagehide', persisted));
  }

  dispatchBeforeUnload(): boolean {
    const event: any = {
      type: 'beforeunload',
      target: this,
      currentTarget: this,
      cancelable: true,
      defaultPrevented: false,
      returnValue: '',
      preventDefault() { (this as any).defaultPrevented = true; },
    };
    return this.dispatchEvent(event);
  }

  dispatchUnload(): void {
    this.dispatchEvent({
      type: 'unload',
      target: this,
      currentTarget: this,
      bubbles: false,
      cancelable: false,
    });
  }

  dispatchPopState(state: any, url?: string): void {
    this.dispatchEvent({ type: 'popstate', state, url, target: this, currentTarget: this });
  }

  // ── Convenience aliases for testing ──────────────────────────────────────
  simulatePageShow(persisted = false): void { this.dispatchPageShow(persisted); }
  simulatePageHide(persisted = false): void { this.dispatchPageHide(persisted); }
  simulateBeforeUnload(): boolean { return this.dispatchBeforeUnload(); }
  simulateUnload(): void { this.dispatchUnload(); }
  simulatePopState(state: any, url?: string): void { this.dispatchPopState(state, url); }
}
