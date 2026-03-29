// import { Window, Location, History, Navigator } from './Window';
// import { CustomElementRegistry } from './CustomElementRegistry';
// import { Document } from '../node/Document';
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

class LocationBase implements Location {
  private _href: string = 'about:blank';
  private _protocol: string = 'about:';
  private _host: string = '';
  private _hostname: string = '';
  private _port: string = '';
  private _pathname: string = 'blank';
  private _search: string = '';
  private _hash: string = '';
  private _origin: string = 'null';
  private urlChangeCallback?: (url: string) => void;

  constructor(initialUrl: string = 'about:blank', urlChangeCallback?: (url: string) => void) {
    this.urlChangeCallback = urlChangeCallback;
    this.parseUrl(initialUrl);
  }

  ancestorOrigins: DOMStringList;

  get href(): string {
    return this._href;
  }

  set href(url: string) {
    const oldHref = this._href;
    this.parseUrl(url);

    if (this._href !== oldHref && this.urlChangeCallback) {
      this.urlChangeCallback(this._href);
    }
  }

  get protocol(): string {
    return this._protocol;
  }
  set protocol(value: string) {
    if (!value.endsWith(':')) value += ':';
    this._protocol = value;
    this.reconstructUrl();
  }

  get host(): string {
    return this._host;
  }
  set host(value: string) {
    this._host = value;
    const colonIndex = value.lastIndexOf(':');
    if (colonIndex !== -1 && colonIndex > value.lastIndexOf(']')) {
      this._hostname = value.substring(0, colonIndex);
      this._port = value.substring(colonIndex + 1);
    } else {
      this._hostname = value;
      this._port = '';
    }
    this.reconstructUrl();
  }

  get hostname(): string {
    return this._hostname;
  }
  set hostname(value: string) {
    this._hostname = value;
    this._host = this._port ? `${value}:${this._port}` : value;
    this.reconstructUrl();
  }

  get port(): string {
    return this._port;
  }
  set port(value: string) {
    this._port = value;
    this._host = value ? `${this._hostname}:${value}` : this._hostname;
    this.reconstructUrl();
  }

  get pathname(): string {
    return this._pathname;
  }
  set pathname(value: string) {
    if (!value.startsWith('/')) value = '/' + value;
    this._pathname = value;
    this.reconstructUrl();
  }

  get search(): string {
    return this._search;
  }
  set search(value: string) {
    if (value && !value.startsWith('?')) value = '?' + value;
    this._search = value;
    this.reconstructUrl();
  }

  get hash(): string {
    return this._hash;
  }
  set hash(value: string) {
    if (value && !value.startsWith('#')) value = '#' + value;
    this._hash = value;
    this.reconstructUrl();
  }

  get origin(): string {
    return this._origin;
  }

  assign(url: string): void {
    const oldHref = this._href;
    this.parseUrl(url);
    if (this._href !== oldHref && this.urlChangeCallback) {
      this.urlChangeCallback(this._href);
    }
  }

  replace(url: string): void {
    this.assign(url);
  }

  reload(_forcedReload?: boolean): void {}

  toString(): string {
    return this._href;
  }

  private parseUrl(url: string): void {
    try {
      let parsedUrl: URL;
      if (url.startsWith('//')) {
        parsedUrl = new URL(this._protocol + url);
      } else if (url.startsWith('/')) {
        parsedUrl = new URL(url, `${this._protocol}//${this._host}`);
      } else if (url.includes('://')) {
        parsedUrl = new URL(url);
      } else {
        const base = `${this._protocol}//${this._host}${this._pathname}`;
        parsedUrl = new URL(url, base);
      }
      this._href = parsedUrl.href;
      this._protocol = parsedUrl.protocol;
      this._host = parsedUrl.host;
      this._hostname = parsedUrl.hostname;
      this._port = parsedUrl.port;
      this._pathname = parsedUrl.pathname;
      this._search = parsedUrl.search;
      this._hash = parsedUrl.hash;
      this._origin = parsedUrl.origin;
    } catch (e) {
      if (url === 'about:blank') {
        this._href = 'about:blank';
        this._protocol = 'about:';
        this._host = '';
        this._hostname = '';
        this._port = '';
        this._pathname = 'blank';
        this._search = '';
        this._hash = '';
        this._origin = 'null';
      }
    }
  }

  private reconstructUrl(): void {
    try {
      let url = this._protocol;
      if (this._protocol !== 'about:' && this._protocol !== 'data:') {
        url += '//';
        if (this._host) url += this._host;
      }
      url += this._pathname;
      url += this._search;
      url += this._hash;
      const testUrl = new URL(url);
      this._href = testUrl.href;
      this._origin = testUrl.origin;
    } catch (e) {}
  }
}

class HistoryBase implements History {
  length: number = 1;
  state: any = null;
  private window: WindowBase;
  private historyStack: Array<{ state: any; title: string; url?: string }> = [];
  private currentIndex: number = -1;

  constructor(window: WindowBase) {
    this.window = window;
  }

  scrollRestoration: ScrollRestoration;

  back(): void {
    this.go(-1);
  }
  forward(): void {
    this.go(1);
  }
  go(delta?: number): void {
    if (!delta || this.historyStack.length === 0) return;
    const newIndex = this.currentIndex + delta;
    if (newIndex >= 0 && newIndex < this.historyStack.length) {
      this.currentIndex = newIndex;
      const entry = this.historyStack[this.currentIndex];
      this.state = entry.state;
      if (entry.url && this.window.location) {
        (this.window.location as any)._href = entry.url;
        (this.window.location as any).parseUrl(entry.url);
      }
      (this.window as any).dispatchPopStateEvent(entry.state, entry.url);
    }
  }

  pushState(data: any, title: string, url?: string): void {
    this.historyStack = this.historyStack.slice(0, this.currentIndex + 1);
    this.historyStack.push({ state: data, title, url });
    this.currentIndex = this.historyStack.length - 1;
    this.state = data;
    this.length = this.historyStack.length;
    if (url && this.window.location) {
      const oldHref = (this.window.location as any)._href;
      (this.window.location as any)._href = url;
      (this.window.location as any).parseUrl(url);
      if (url !== oldHref && (this.window.location as any).urlChangeCallback) {
        (this.window.location as any).urlChangeCallback(url);
      }
    }
  }

  replaceState(data: any, title: string, url?: string): void {
    if (this.currentIndex >= 0 && this.currentIndex < this.historyStack.length) {
      this.historyStack[this.currentIndex] = { state: data, title, url };
    } else {
      this.historyStack = [{ state: data, title, url }];
      this.currentIndex = 0;
      this.length = 1;
    }
    this.state = data;
    if (url && this.window.location) {
      const oldHref = (this.window.location as any)._href;
      (this.window.location as any)._href = url;
      (this.window.location as any).parseUrl(url);
      if (url !== oldHref && (this.window.location as any).urlChangeCallback) {
        (this.window.location as any).urlChangeCallback(url);
      }
    }
  }
}

class NavigatorBase implements Navigator {
  clipboard: Clipboard;
  credentials: CredentialsContainer;
  doNotTrack: string;
  geolocation: Geolocation;
  login: NavigatorLogin;
  maxTouchPoints: number;
  mediaCapabilities: MediaCapabilities;
  mediaDevices: MediaDevices;
  mediaSession: MediaSession;
  permissions: Permissions;
  serviceWorker: ServiceWorkerContainer;
  userActivation: UserActivation;
  wakeLock: WakeLock;
  canShare(data?: ShareData): boolean {
    throw new Error('Method not implemented.');
  }
  getGamepads(): (Gamepad | null)[] {
    throw new Error('Method not implemented.');
  }
  requestMIDIAccess(options?: MIDIOptions): Promise<MIDIAccess> {
    throw new Error('Method not implemented.');
  }
  requestMediaKeySystemAccess(keySystem: unknown, supportedConfigurations: unknown): Promise<MediaKeySystemAccess> {
    throw new Error('Method not implemented.');
  }
  sendBeacon(url: string | URL, data?: BodyInit | null): boolean {
    throw new Error('Method not implemented.');
  }
  share(data?: ShareData): Promise<void> {
    throw new Error('Method not implemented.');
  }
  vibrate(pattern: unknown): boolean {
    throw new Error('Method not implemented.');
  }
  webdriver: boolean;
  clearAppBadge(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  setAppBadge(contents?: number): Promise<void> {
    throw new Error('Method not implemented.');
  }
  hardwareConcurrency: number;
  registerProtocolHandler(scheme: string, url: string | URL): void {
    throw new Error('Method not implemented.');
  }
  appCodeName: string;
  appName: string;
  appVersion: string;
  product: string;
  productSub: string;
  vendor: string;
  vendorSub: string;
  locks: LockManager;
  mimeTypes: MimeTypeArray;
  pdfViewerEnabled: boolean;
  plugins: PluginArray;
  javaEnabled(): boolean {
    throw new Error('Method not implemented.');
  }
  storage: StorageManager;
  userAgent: string = 'Mozilla/5.0 (Server-Side Rendering)';
  language: string = 'en-US';
  languages: readonly string[] = ['en-US', 'en'];
  platform: string = 'Server';
  cookieEnabled: boolean = false;
  onLine: boolean = true;
}

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
  readonly clientInformation: Navigator;
  private _closed: boolean = false;

  get closed(): boolean {
    return this._closed;
  }

  readonly cookieStore: any = {};
  readonly customElements: CustomElementRegistry;
  readonly devicePixelRatio: number = 1;
  readonly document: Document;
  readonly history: History;
  readonly navigator: Navigator;
  readonly self: any = this;
  readonly window: any = this;

  private _location: Location;
  get location(): Location {
    return this._location;
  }
  set location(href: string | Location) {
    if (typeof href === 'string') this._location.href = href;
    else this._location.href = href.href;
  }

  // Global constructors
  Event = class Event {
    constructor(public type: string) {}
  };
  CustomEvent = class CustomEvent extends this.Event {
    constructor(
      type: string,
      public detail: any
    ) {
      super(type);
    }
  };

  // All HTML element constructors
  Node = NodeBase;
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

  // Type Aliases
  HTMLImageElement = HTMLImgElement;
  HTMLParagraphElement = HTMLPElement;
  HTMLHeadingElement = HTMLH1Element;
  HTMLTableSectionElement = HTMLTbodyElement;
  HTMLTableCellElement = HTMLTdElement;
  HTMLTableRowElement = HTMLTrElement;

  constructor(config?: { initialUrl?: string }) {
    const documentBase = new DocumentBase();
    if (documentBase && (documentBase as any).setWindow) {
      (documentBase as any).setWindow(this);
    }
    this._location = new LocationBase(config?.initialUrl);
    documentBase.setLocation(this._location);
    this.document = documentBase as unknown as Document;
    const customElementRegistryImp = new CustomElementRegistryImp();
    customElementRegistryImp.setWindow(this);
    this.customElements = customElementRegistryImp as unknown as CustomElementRegistry;
    this.history = new HistoryBase(this);
    this.navigator = new NavigatorBase();
    this.clientInformation = this.navigator;
  }

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
  blur(): void {
    throw new Error('Method not implemented.');
  }
  cancelIdleCallback(handle: number): void {
    throw new Error('Method not implemented.');
  }
  captureEvents(): void {
    throw new Error('Method not implemented.');
  }
  confirm(message?: string): boolean {
    throw new Error('Method not implemented.');
  }
  focus(): void {
    throw new Error('Method not implemented.');
  }
  getComputedStyle(elt: Element, pseudoElt?: string | null): CSSStyleDeclaration {
    throw new Error('Method not implemented.');
  }
  getSelection(): Selection | null {
    throw new Error('Method not implemented.');
  }
  matchMedia(query: string): MediaQueryList {
    throw new Error('Method not implemented.');
  }
  moveBy(x: number, y: number): void {
    throw new Error('Method not implemented.');
  }
  moveTo(x: number, y: number): void {
    throw new Error('Method not implemented.');
  }
  open(url?: string | URL, target?: string, features?: string): WindowProxy | null {
    throw new Error('Method not implemented.');
  }
  postMessage(message: unknown, targetOrigin?: unknown, transfer?: unknown): void {
    throw new Error('Method not implemented.');
  }
  print(): void {
    throw new Error('Method not implemented.');
  }
  prompt(message?: string, _default?: string): string | null {
    throw new Error('Method not implemented.');
  }
  releaseEvents(): void {
    throw new Error('Method not implemented.');
  }
  requestIdleCallback(callback: IdleRequestCallback, options?: IdleRequestOptions): number {
    throw new Error('Method not implemented.');
  }
  resizeBy(x: number, y: number): void {
    throw new Error('Method not implemented.');
  }
  resizeTo(width: number, height: number): void {
    throw new Error('Method not implemented.');
  }
  scroll(x?: unknown, y?: unknown): void {
    throw new Error('Method not implemented.');
  }
  scrollBy(x?: unknown, y?: unknown): void {
    throw new Error('Method not implemented.');
  }
  scrollTo(x?: unknown, y?: unknown): void {
    throw new Error('Method not implemented.');
  }
  stop(): void {
    throw new Error('Method not implemented.');
  }
  cancelAnimationFrame(handle: number): void {
    throw new Error('Method not implemented.');
  }
  requestAnimationFrame(callback: FrameRequestCallback): number {
    throw new Error('Method not implemented.');
  }
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
  localStorage: Storage;
  caches: CacheStorage;
  crossOriginIsolated: boolean;
  crypto: Crypto;
  indexedDB: IDBFactory;
  isSecureContext: boolean;
  origin: string;
  performance: Performance;
  atob(data: string): string {
    throw new Error('Method not implemented.');
  }
  btoa(data: string): string {
    throw new Error('Method not implemented.');
  }
  createImageBitmap(image: unknown, sx?: unknown, sy?: unknown, sw?: unknown, sh?: unknown, options?: unknown): Promise<ImageBitmap> {
    throw new Error('Method not implemented.');
  }
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    throw new Error('Method not implemented.');
  }
  queueMicrotask(callback: VoidFunction): void {
    throw new Error('Method not implemented.');
  }
  reportError(e: any): void {
    throw new Error('Method not implemented.');
  }
  structuredClone<T = any>(value: T, options?: StructuredSerializeOptions): T {
    throw new Error('Method not implemented.');
  }
  sessionStorage: Storage;

  alert(_message?: any): void {}
  close(): void {
    if (this._closed) return;
    this._closed = true;
    this._timers.forEach(id => clearTimeout(id));
    this._intervals.forEach(id => clearInterval(id));
    this._eventListeners.length = 0;
  }

  setTimeout(callback: Function, delay?: number, ...args: any[]): number {
    const id = setTimeout(() => {
      this._timers.delete(id as any);
      callback(...args);
    }, delay) as any;
    this._timers.add(id);
    return id;
  }
  clearTimeout(id: number): void {
    clearTimeout(id);
    this._timers.delete(id);
  }
  setInterval(callback: Function, delay?: number, ...args: any[]): number {
    const id = setInterval(callback, delay, ...args) as any;
    this._intervals.add(id);
    return id;
  }
  clearInterval(id: number): void {
    clearInterval(id);
    this._intervals.delete(id);
  }

  addEventListener(type: string, listener: any, options?: any): void {
    // Basic support for major window events
    this._eventListeners.push({
      type,
      listener: typeof listener === 'function' ? listener : listener?.handleEvent,
      options
    });
  }

  removeEventListener(type: string, listener: any): void {
    const targetListener = typeof listener === 'function' ? listener : listener?.handleEvent;
    this._eventListeners = this._eventListeners.filter(l => !(l.type === type && l.listener === targetListener));
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
    return true;
  }

  private dispatchPopStateEvent(state: any, url?: string): void {
    this.dispatchEvent({ type: 'popstate', state, url });
  }
}
