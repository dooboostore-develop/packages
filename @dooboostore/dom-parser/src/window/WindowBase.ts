import { Window, Location, History, Navigator } from './Window';
import { Document } from '../node/Document';
import { DocumentBase } from '../node/DocumentBase';
import { NodeBase } from '../node/NodeBase';
import { ElementBase } from '../node/elements/ElementBase';

// Import all element classes
import { HTMLAnchorElement } from '../node/elements/HTMLAnchorElement';
import { HTMLBodyElement } from '../node/elements/HTMLBodyElement';
import { HTMLButtonElement } from '../node/elements/HTMLButtonElement';
import { HTMLCanvasElement } from '../node/elements/HTMLCanvasElement';
import { HTMLDivElement } from '../node/elements/HTMLDivElement';
import { HTMLH1Element } from '../node/elements/HTMLH1Element';
import { HTMLHeadElement } from '../node/elements/HTMLHeadElement';
import { HTMLHtmlElement } from '../node/elements/HTMLHtmlElement';
import { HTMLImgElement } from '../node/elements/HTMLImgElement';
import { HTMLInputElement } from '../node/elements/HTMLInputElement';
import { HTMLPElement } from '../node/elements/HTMLPElement';
import { HTMLSpanElement } from '../node/elements/HTMLSpanElement';
import { HTMLTitleElement } from '../node/elements/HTMLTitleElement';
import { HTMLLinkElement } from '../node/elements/HTMLLinkElement';
import { HTMLScriptElement } from '../node/elements/HTMLScriptElement';
import { HTMLStyleElement } from '../node/elements/HTMLStyleElement';
import { HTMLFormElement } from '../node/elements/HTMLFormElement';
import { HTMLTableElement } from '../node/elements/HTMLTableElement';
import { HTMLUListElement } from '../node/elements/HTMLUListElement';
import { HTMLOListElement } from '../node/elements/HTMLOListElement';
import { HTMLLIElement } from '../node/elements/HTMLLIElement';
import { HTMLMetaElement } from '../node/elements/HTMLMetaElement';
import { HTMLTemplateElement } from '../node/elements/HTMLTemplateElement';
import { HTMLTheadElement } from '../node/elements/HTMLTheadElement';
import { HTMLTfootElement } from '../node/elements/HTMLTfootElement';
import { HTMLTrElement } from '../node/elements/HTMLTrElement';
import { HTMLTdElement } from '../node/elements/HTMLTdElement';
import { HTMLThElement } from '../node/elements/HTMLThElement';
import { HTMLCaptionElement } from '../node/elements/HTMLCaptionElement';
import { HTMLTbodyElement } from '../node/elements/HTMLTbodyElement';

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

    get href(): string {
        return this._href;
    }

    set href(url: string) {
        const oldHref = this._href;
        this.parseUrl(url);

        // Call URL change callback if URL actually changed
        if (this._href !== oldHref && this.urlChangeCallback) {
            this.urlChangeCallback(this._href);
        }
    }

    get protocol(): string {
        return this._protocol;
    }

    set protocol(value: string) {
        if (!value.endsWith(':')) {
            value += ':';
        }
        this._protocol = value;
        this.reconstructUrl();
    }

    get host(): string {
        return this._host;
    }

    set host(value: string) {
        this._host = value;
        // Parse hostname and port from host
        const colonIndex = value.lastIndexOf(':');
        if (colonIndex !== -1 && colonIndex > value.lastIndexOf(']')) {
            // IPv6 addresses are enclosed in brackets, so check if colon is after the closing bracket
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
        if (!value.startsWith('/')) {
            value = '/' + value;
        }
        this._pathname = value;
        this.reconstructUrl();
    }

    get search(): string {
        return this._search;
    }

    set search(value: string) {
        if (value && !value.startsWith('?')) {
            value = '?' + value;
        }
        this._search = value;
        this.reconstructUrl();
    }

    get hash(): string {
        return this._hash;
    }

    set hash(value: string) {
        if (value && !value.startsWith('#')) {
            value = '#' + value;
        }
        this._hash = value;
        this.reconstructUrl();
    }

    get origin(): string {
        return this._origin;
    }

    assign(url: string): void {
        const oldHref = this._href;
        this.parseUrl(url);

        // Call URL change callback if URL actually changed
        if (this._href !== oldHref && this.urlChangeCallback) {
            this.urlChangeCallback(this._href);
        }
    }

    replace(url: string): void {
        const oldHref = this._href;
        this.parseUrl(url);

        // Call URL change callback if URL actually changed
        if (this._href !== oldHref && this.urlChangeCallback) {
            this.urlChangeCallback(this._href);
        }
    }

    reload(forcedReload?: boolean): void {
        // No-op in server-side environment
        // In a real browser, this would reload the page
    }

    toString(): string {
        return this._href;
    }

    private parseUrl(url: string): void {
        try {
            // Handle relative URLs by creating a base URL
            let parsedUrl: URL;

            if (url.startsWith('//')) {
                // Protocol-relative URL
                parsedUrl = new URL(this._protocol + url);
            } else if (url.startsWith('/')) {
                // Absolute path
                parsedUrl = new URL(url, `${this._protocol}//${this._host}`);
            } else if (url.includes('://')) {
                // Absolute URL
                parsedUrl = new URL(url);
            } else {
                // Relative URL
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
            // Invalid URL, handle special cases
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
            // For other invalid URLs, keep current values
        }
    }

    private reconstructUrl(): void {
        try {
            // Reconstruct the URL from components
            let url = this._protocol;

            if (this._protocol !== 'about:' && this._protocol !== 'data:') {
                url += '//';
                if (this._host) {
                    url += this._host;
                }
            }

            url += this._pathname;
            url += this._search;
            url += this._hash;

            // Validate the reconstructed URL
            const testUrl = new URL(url);
            this._href = testUrl.href;
            this._origin = testUrl.origin;
        } catch (e) {
            // If reconstruction fails, keep the current href
        }
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

            // Update location if URL is provided
            if (entry.url && this.window.location) {
                (this.window.location as any)._href = entry.url;
                (this.window.location as any).parseUrl(entry.url);
            }

            // Dispatch popstate event
            (this.window as any).dispatchPopStateEvent(entry.state, entry.url);
        }
    }

    pushState(data: any, title: string, url?: string): void {
        // Remove any forward history when pushing new state
        this.historyStack = this.historyStack.slice(0, this.currentIndex + 1);

        // Add new state
        this.historyStack.push({ state: data, title, url });
        this.currentIndex = this.historyStack.length - 1;
        this.state = data;
        this.length = this.historyStack.length;

        // Update location if URL is provided
        if (url && this.window.location) {
            const oldHref = (this.window.location as any)._href;
            (this.window.location as any)._href = url;
            (this.window.location as any).parseUrl(url);

            // Trigger URL change callback for dynamic HTML loading
            if (url !== oldHref && (this.window.location as any).urlChangeCallback) {
                (this.window.location as any).urlChangeCallback(url);
            }
        }

        // Note: pushState does NOT dispatch popstate event (per HTML spec)
    }

    replaceState(data: any, title: string, url?: string): void {
        if (this.currentIndex >= 0 && this.currentIndex < this.historyStack.length) {
            // Replace current state
            this.historyStack[this.currentIndex] = { state: data, title, url };
        } else {
            // No current state, create one
            this.historyStack = [{ state: data, title, url }];
            this.currentIndex = 0;
            this.length = 1;
        }

        this.state = data;

        // Update location if URL is provided
        if (url && this.window.location) {
            const oldHref = (this.window.location as any)._href;
            (this.window.location as any)._href = url;
            (this.window.location as any).parseUrl(url);

            // Trigger URL change callback for dynamic HTML loading
            if (url !== oldHref && (this.window.location as any).urlChangeCallback) {
                (this.window.location as any).urlChangeCallback(url);
            }
        }

        // Note: replaceState does NOT dispatch popstate event (per HTML spec)
    }
}

class NavigatorBase implements Navigator {
    userAgent: string = 'Mozilla/5.0 (Server-Side Rendering)';
    language: string = 'en-US';
    languages: readonly string[] = ['en-US', 'en'];
    platform: string = 'Server';
    cookieEnabled: boolean = false;
    onLine: boolean = true;
}

// Simple event system for WindowBase
interface EventListener {
    type: string;
    listener: (event: any) => void;
    options?: boolean | AddEventListenerOptions;
}

interface PopStateEvent {
    type: 'popstate';
    state: any;
    url?: string;
}

export class WindowBase {
    // Suppress type errors for complex event handler types
    [key: string]: any;

    // Event system
    private _eventListeners: EventListener[] = [];
    // Properties
    readonly clientInformation: Navigator;
    readonly closed: boolean = false;
    readonly cookieStore: CookieStore = {} as CookieStore;
    readonly customElements: CustomElementRegistry = {} as CustomElementRegistry;
    readonly devicePixelRatio: number = 1;
    readonly document: Document;
    readonly event: Event | undefined = undefined;
    readonly external: External = {} as External;
    readonly frameElement: Element | null = null;
    readonly frames: WindowProxy = {} as WindowProxy;
    readonly history: History;
    readonly innerHeight: number = 768;
    readonly innerWidth: number = 1024;
    readonly length: number = 0;
    readonly locationbar: BarProp = {} as BarProp;
    readonly menubar: BarProp = {} as BarProp;
    name: string = '';
    readonly navigator: Navigator;
    ondevicemotion: ((this: Window, ev: DeviceMotionEvent) => any) | null = null;
    ondeviceorientation: ((this: Window, ev: DeviceOrientationEvent) => any) | null = null;
    ondeviceorientationabsolute: ((this: Window, ev: DeviceOrientationEvent) => any) | null = null;
    onorientationchange: ((this: Window, ev: Event) => any) | null = null;
    opener: any = null;
    readonly orientation: number = 0;
    readonly originAgentCluster: boolean = false;
    readonly outerHeight: number = 768;
    readonly outerWidth: number = 1024;
    readonly pageXOffset: number = 0;
    readonly pageYOffset: number = 0;
    readonly parent: WindowProxy = {} as WindowProxy;
    readonly personalbar: BarProp = {} as BarProp;
    readonly screen: Screen = {} as Screen;
    readonly screenLeft: number = 0;
    readonly screenTop: number = 0;
    readonly screenX: number = 0;
    readonly screenY: number = 0;
    readonly scrollX: number = 0;
    readonly scrollY: number = 0;
    readonly scrollbars: BarProp = {} as BarProp;
    readonly self: Window & typeof globalThis = this as any;
    readonly speechSynthesis: SpeechSynthesis = {} as SpeechSynthesis;
    status: string = '';
    readonly statusbar: BarProp = {} as BarProp;
    readonly toolbar: BarProp = {} as BarProp;
    readonly top: WindowProxy | null = null;
    readonly visualViewport: VisualViewport | null = null;
    readonly window: Window & typeof globalThis = this as any;

    // Location property with getter/setter
    private _location: Location;
    get location(): Location {
        return this._location;
    }
    set location(href: string | Location) {
        if (typeof href === 'string') {
            this._location.href = href;
        } else {
            this._location.href = href.href;
        }
    }

    // Global constructors
    Node = NodeBase;
    Element = ElementBase;
    HTMLElement = ElementBase;
    Event = class Event { };
    PopStateEvent = class PopStateEvent extends this.Event { };
    IntersectionObserver = class IntersectionObserver { };
    NodeFilter = class NodeFilter { };
    DocumentFragment = class DocumentFragment { };
    HTMLMetaElement = HTMLMetaElement;
    HTMLCanvasElement = HTMLCanvasElement;
    CanvasRenderingContext2D = class CanvasRenderingContext2D { };
    CanvasPattern = class CanvasPattern { };
    CanvasGradient = class CanvasGradient { };
    Path2D = class Path2D { };
    ImageData = class ImageData { };

    // HTML element constructors
    HTMLAnchorElement = HTMLAnchorElement;
    HTMLBodyElement = HTMLBodyElement;
    HTMLButtonElement = HTMLButtonElement;
    HTMLDivElement = HTMLDivElement;
    HTMLH1Element = HTMLH1Element;
    HTMLHeadElement = HTMLHeadElement;
    HTMLHtmlElement = HTMLHtmlElement;
    HTMLImgElement = HTMLImgElement;
    HTMLInputElement = HTMLInputElement;
    HTMLPElement = HTMLPElement;
    HTMLSpanElement = HTMLSpanElement;
    HTMLTitleElement = HTMLTitleElement;
    HTMLLinkElement = HTMLLinkElement;
    HTMLScriptElement = HTMLScriptElement;
    HTMLStyleElement = HTMLStyleElement;
    HTMLFormElement = HTMLFormElement;
    HTMLTableElement = HTMLTableElement;
    HTMLUListElement = HTMLUListElement;
    HTMLOListElement = HTMLOListElement;
    HTMLLIElement = HTMLLIElement;
    HTMLTemplateElement = HTMLTemplateElement;
    HTMLTheadElement = HTMLTheadElement;
    HTMLTfootElement = HTMLTfootElement;
    HTMLTrElement = HTMLTrElement;
    HTMLTdElement = HTMLTdElement;
    HTMLThElement = HTMLThElement;
    HTMLCaptionElement = HTMLCaptionElement;
    HTMLTbodyElement = HTMLTbodyElement;

    constructor(document?: Document, initialUrl?: string) {
        this.document = document || new DocumentBase();
        
        // Set window reference in document for load event
        if (this.document && (this.document as any).setWindow) {
            (this.document as any).setWindow(this);
        }
        
        this._location = new LocationBase(initialUrl);
        this.history = new HistoryBase(this);
        this.navigator = new NavigatorBase();
        this.clientInformation = this.navigator;

        // Return a Proxy to handle the [index: number]: Window signature
        return new Proxy(this, {
            get(target: WindowBase, prop: string | symbol): any {
                // Handle numeric indices - return the window itself
                if (typeof prop === 'string' && /^\d+$/.test(prop)) {
                    return target;
                }
                // Return the actual property
                return (target as any)[prop];
            },

            set(target: WindowBase, prop: string | symbol, value: any): boolean {
                // Handle numeric indices - ignore setting
                if (typeof prop === 'string' && /^\d+$/.test(prop)) {
                    return true;
                }
                // Set the actual property
                (target as any)[prop] = value;
                return true;
            },

            has(target: WindowBase, prop: string | symbol): boolean {
                // Handle numeric indices
                if (typeof prop === 'string' && /^\d+$/.test(prop)) {
                    return true;
                }
                // Check if property exists
                return prop in target;
            },

            ownKeys(target: WindowBase): ArrayLike<string | symbol> {
                // Get all own keys plus numeric indices for length
                const keys = Object.getOwnPropertyNames(target);
                // Add numeric indices based on length property
                for (let i = 0; i < target.length; i++) {
                    keys.push(i.toString());
                }
                return keys;
            },

            getOwnPropertyDescriptor(target: WindowBase, prop: string | symbol): PropertyDescriptor | undefined {
                // Handle numeric indices
                if (typeof prop === 'string' && /^\d+$/.test(prop)) {
                    return {
                        enumerable: true,
                        configurable: true,
                        value: target
                    };
                }
                // Return actual property descriptor
                return Object.getOwnPropertyDescriptor(target, prop);
            }
        });
    }

    // Window methods - all with empty implementations for server-side
    alert(message?: any): void { }

    blur(): void { }

    cancelIdleCallback(handle: number): void { }

    captureEvents(): void { }

    close(): void { }

    confirm(message?: string): boolean {
        return false;
    }

    focus(): void { }

    getComputedStyle(elt: Element, pseudoElt?: string | null): CSSStyleDeclaration {
        return {} as CSSStyleDeclaration;
    }

    getSelection(): Selection | null {
        return null;
    }

    matchMedia(query: string): MediaQueryList {
        return {} as MediaQueryList;
    }

    moveBy(x: number, y: number): void { }

    moveTo(x: number, y: number): void { }

    open(url?: string | URL, target?: string, features?: string): WindowProxy | null {
        return null;
    }

    postMessage(message: any, targetOrigin: string, transfer?: Transferable[]): void;
    postMessage(message: any, options?: WindowPostMessageOptions): void;
    postMessage(message: any, targetOriginOrOptions?: string | WindowPostMessageOptions, transfer?: Transferable[]): void { }

    print(): void { }

    prompt(message?: string, _default?: string): string | null {
        return null;
    }

    releaseEvents(): void { }

    requestIdleCallback(callback: IdleRequestCallback, options?: IdleRequestOptions): number {
        return 0;
    }

    resizeBy(x: number, y: number): void { }

    resizeTo(width: number, height: number): void { }

    scroll(options?: ScrollToOptions): void;
    scroll(x: number, y: number): void;
    scroll(optionsOrX?: ScrollToOptions | number, y?: number): void { }

    scrollBy(options?: ScrollToOptions): void;
    scrollBy(x: number, y: number): void;
    scrollBy(optionsOrX?: ScrollToOptions | number, y?: number): void { }

    scrollTo(options?: ScrollToOptions): void;
    scrollTo(x: number, y: number): void;
    scrollTo(optionsOrX?: ScrollToOptions | number, y?: number): void { }

    stop(): void { }

    // Timer methods
    setTimeout(callback: Function, delay?: number, ...args: any[]): number {
        return setTimeout(callback, delay, ...args) as any;
    }

    clearTimeout(id: number): void {
        clearTimeout(id);
    }

    setInterval(callback: Function, delay?: number, ...args: any[]): number {
        return setInterval(callback, delay, ...args) as any;
    }

    clearInterval(id: number): void {
        clearInterval(id);
    }

    // Animation methods
    requestAnimationFrame(callback: FrameRequestCallback): number {
        return this.setTimeout(callback, 16) as number;
    }

    cancelAnimationFrame(id: number): void {
        this.clearTimeout(id);
    }

    // Event methods
    addEventListener<K extends keyof WindowEventMap>(type: K, listener: (this: Window, ev: WindowEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: any, listener: any, options?: any): void {
        // Support popstate, load, unload, and beforeunload events
        if (type === 'popstate' || type === 'load' || type === 'unload' || type === 'beforeunload') {
            this._eventListeners.push({
                type,
                listener: typeof listener === 'function' ? listener : listener.handleEvent,
                options
            });
        }
    }

    removeEventListener<K extends keyof WindowEventMap>(type: K, listener: (this: Window, ev: WindowEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: any, listener: any, options?: any): void {
        if (type === 'popstate' || type === 'load' || type === 'unload' || type === 'beforeunload') {
            const targetListener = typeof listener === 'function' ? listener : listener.handleEvent;
            this._eventListeners = this._eventListeners.filter(
                eventListener => !(eventListener.type === type && eventListener.listener === targetListener)
            );
        }
    }

    dispatchEvent(event: any): boolean {
        const eventListeners = this._eventListeners.filter(listener => listener.type === event.type);

        for (const eventListener of eventListeners) {
            try {
                eventListener.listener.call(this, event);

                // Handle 'once' option
                if (eventListener.options && typeof eventListener.options === 'object' && eventListener.options.once) {
                    this.removeEventListener(event.type, eventListener.listener);
                }
            } catch (error) {
                console.error('Error in event listener:', error);
            }
        }

        return true;
    }

    /**
     * Dispatch a popstate event to registered listeners
     */
    private dispatchPopStateEvent(state: any, url?: string): void {
        const popStateEvent: PopStateEvent = {
            type: 'popstate',
            state,
            url
        };

        this.dispatchEvent(popStateEvent);
    }

    // EventTarget methods (inherited)
    // These are already covered by addEventListener/removeEventListener/dispatchEvent

    // GlobalEventHandlers - empty implementations
    onabort: ((this: GlobalEventHandlers, ev: UIEvent) => any) | null = null;
    onanimationcancel: ((this: GlobalEventHandlers, ev: AnimationEvent) => any) | null = null;
    onanimationend: ((this: GlobalEventHandlers, ev: AnimationEvent) => any) | null = null;
    onanimationiteration: ((this: GlobalEventHandlers, ev: AnimationEvent) => any) | null = null;
    onanimationstart: ((this: GlobalEventHandlers, ev: AnimationEvent) => any) | null = null;
    onauxclick: ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null = null;
    onbeforeinput: ((this: GlobalEventHandlers, ev: InputEvent) => any) | null = null;
    onblur: ((this: GlobalEventHandlers, ev: FocusEvent) => any) | null = null;
    oncancel: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
    oncanplay: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
    oncanplaythrough: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
    onchange: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
    onclick: ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null = null;
    onclose: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
    oncontextmenu: ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null = null;
    oncopy: ((this: GlobalEventHandlers, ev: ClipboardEvent) => any) | null = null;
    oncuechange: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
    oncut: ((this: GlobalEventHandlers, ev: ClipboardEvent) => any) | null = null;
    ondblclick: ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null = null;
    ondrag: ((this: GlobalEventHandlers, ev: DragEvent) => any) | null = null;
    ondragend: ((this: GlobalEventHandlers, ev: DragEvent) => any) | null = null;
    ondragenter: ((this: GlobalEventHandlers, ev: DragEvent) => any) | null = null;
    ondragleave: ((this: GlobalEventHandlers, ev: DragEvent) => any) | null = null;
    ondragover: ((this: GlobalEventHandlers, ev: DragEvent) => any) | null = null;
    ondragstart: ((this: GlobalEventHandlers, ev: DragEvent) => any) | null = null;
    ondrop: ((this: GlobalEventHandlers, ev: DragEvent) => any) | null = null;
    ondurationchange: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
    onemptied: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
    onended: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
    onerror: OnErrorEventHandler = null;
    onfocus: ((this: GlobalEventHandlers, ev: FocusEvent) => any) | null = null;
    onformdata: ((this: GlobalEventHandlers, ev: FormDataEvent) => any) | null = null;
    ongotpointercapture: ((this: GlobalEventHandlers, ev: PointerEvent) => any) | null = null;
    oninput: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
    oninvalid: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
    onkeydown: ((this: GlobalEventHandlers, ev: KeyboardEvent) => any) | null = null;
    onkeypress: ((this: GlobalEventHandlers, ev: KeyboardEvent) => any) | null = null;
    onkeyup: ((this: GlobalEventHandlers, ev: KeyboardEvent) => any) | null = null;
    onload: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
    onloadeddata: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
    onloadedmetadata: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
    onloadstart: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
    onlostpointercapture: ((this: GlobalEventHandlers, ev: PointerEvent) => any) | null = null;
    onmousedown: ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null = null;
    onmouseenter: ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null = null;
    onmouseleave: ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null = null;
    onmousemove: ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null = null;
    onmouseout: ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null = null;
    onmouseover: ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null = null;
    onmouseup: ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null = null;
    onpaste: ((this: GlobalEventHandlers, ev: ClipboardEvent) => any) | null = null;
    onpause: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
    onplay: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
    onplaying: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
    onpointercancel: ((this: GlobalEventHandlers, ev: PointerEvent) => any) | null = null;
    onpointerdown: ((this: GlobalEventHandlers, ev: PointerEvent) => any) | null = null;
    onpointerenter: ((this: GlobalEventHandlers, ev: PointerEvent) => any) | null = null;
    onpointerleave: ((this: GlobalEventHandlers, ev: PointerEvent) => any) | null = null;
    onpointermove: ((this: GlobalEventHandlers, ev: PointerEvent) => any) | null = null;
    onpointerout: ((this: GlobalEventHandlers, ev: PointerEvent) => any) | null = null;
    onpointerover: ((this: GlobalEventHandlers, ev: PointerEvent) => any) | null = null;
    onpointerup: ((this: GlobalEventHandlers, ev: PointerEvent) => any) | null = null;
    onprogress: ((this: GlobalEventHandlers, ev: ProgressEvent<EventTarget>) => any) | null = null;
    onratechange: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
    onreset: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
    onresize: ((this: GlobalEventHandlers, ev: UIEvent) => any) | null = null;
    onscroll: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
    onscrollend: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
    onsecuritypolicyviolation: ((this: GlobalEventHandlers, ev: SecurityPolicyViolationEvent) => any) | null = null;
    onseeked: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
    onseeking: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
    onselect: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
    onselectionchange: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
    onselectstart: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
    onslotchange: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
    onstalled: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
    onsubmit: ((this: GlobalEventHandlers, ev: SubmitEvent) => any) | null = null;
    onsuspend: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
    ontimeupdate: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
    ontoggle: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
    ontouchcancel?: ((this: GlobalEventHandlers, ev: TouchEvent) => any) | null = null;
    ontouchend?: ((this: GlobalEventHandlers, ev: TouchEvent) => any) | null = null;
    ontouchmove?: ((this: GlobalEventHandlers, ev: TouchEvent) => any) | null = null;
    ontouchstart?: ((this: GlobalEventHandlers, ev: TouchEvent) => any) | null = null;
    ontransitioncancel: ((this: GlobalEventHandlers, ev: TransitionEvent) => any) | null = null;
    ontransitionend: ((this: GlobalEventHandlers, ev: TransitionEvent) => any) | null = null;
    ontransitionrun: ((this: GlobalEventHandlers, ev: TransitionEvent) => any) | null = null;
    ontransitionstart: ((this: GlobalEventHandlers, ev: TransitionEvent) => any) | null = null;
    onvolumechange: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
    onwaiting: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
    onwebkitanimationend: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
    onwebkitanimationiteration: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
    onwebkitanimationstart: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
    onwebkittransitionend: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
    onwheel: ((this: GlobalEventHandlers, ev: WheelEvent) => any) | null = null;

    // WindowEventHandlers - empty implementations
    onafterprint: ((this: WindowEventHandlers, ev: Event) => any) | null = null;
    onbeforeprint: ((this: WindowEventHandlers, ev: Event) => any) | null = null;
    onbeforeunload: ((this: WindowEventHandlers, ev: BeforeUnloadEvent) => any) | null = null;
    onhashchange: ((this: WindowEventHandlers, ev: HashChangeEvent) => any) | null = null;
    onlanguagechange: ((this: WindowEventHandlers, ev: Event) => any) | null = null;
    onmessage: ((this: WindowEventHandlers, ev: MessageEvent) => any) | null = null;
    onmessageerror: ((this: WindowEventHandlers, ev: MessageEvent) => any) | null = null;
    onoffline: ((this: WindowEventHandlers, ev: Event) => any) | null = null;
    ononline: ((this: WindowEventHandlers, ev: Event) => any) | null = null;
    onpagehide: ((this: WindowEventHandlers, ev: PageTransitionEvent) => any) | null = null;
    onpageshow: ((this: WindowEventHandlers, ev: PageTransitionEvent) => any) | null = null;
    onpopstate: ((this: WindowEventHandlers, ev: PopStateEvent) => any) | null = null;
    onrejectionhandled: ((this: WindowEventHandlers, ev: PromiseRejectionEvent) => any) | null = null;
    onstorage: ((this: WindowEventHandlers, ev: StorageEvent) => any) | null = null;
    onunhandledrejection: ((this: WindowEventHandlers, ev: PromiseRejectionEvent) => any) | null = null;
    onunload: ((this: WindowEventHandlers, ev: Event) => any) | null = null;

    // WindowLocalStorage
    readonly localStorage: Storage = {} as Storage;

    // WindowOrWorkerGlobalScope - empty implementations
    readonly caches: CacheStorage = {} as CacheStorage;
    readonly crossOriginIsolated: boolean = false;
    readonly crypto: Crypto = {} as Crypto;
    readonly indexedDB: IDBFactory = {} as IDBFactory;
    readonly isSecureContext: boolean = false;
    readonly origin: string = 'null';
    readonly performance: Performance = {} as Performance;

    atob(data: string): string { return ''; }
    btoa(data: string): string { return ''; }
    createImageBitmap(image: ImageBitmapSource, options?: ImageBitmapOptions): Promise<ImageBitmap>;
    createImageBitmap(image: ImageBitmapSource, sx: number, sy: number, sw: number, sh: number, options?: ImageBitmapOptions): Promise<ImageBitmap>;
    createImageBitmap(...args: any[]): Promise<ImageBitmap> { return Promise.resolve({} as ImageBitmap); }

    fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> { return Promise.resolve({} as Response); }
    queueMicrotask(callback: VoidFunction): void { }
    reportError(e: any): void { }
    structuredClone(value: any, options?: StructuredSerializeOptions): any { return value; }

    // WindowSessionStorage
    readonly sessionStorage: Storage = {} as Storage;

    // AnimationFrameProvider - already implemented above

    // Index signature - getter implementation
    [index: number]: Window;



    /**
     * Recursive HTML parsing
     */
    private parseHTMLRecursive(html: string, parent: any): void {
        let position = 0;

        while (position < html.length) {
            const tagStart = html.indexOf('<', position);

            if (tagStart === -1) {
                const remainingText = html.substring(position).trim();
                if (remainingText) {
                    const textNode = this.document.createTextNode(remainingText);
                    parent.appendChild(textNode);
                }
                break;
            }

            if (tagStart > position) {
                const textContent = html.substring(position, tagStart).trim();
                if (textContent) {
                    const textNode = this.document.createTextNode(textContent);
                    parent.appendChild(textNode);
                }
            }

            const tagEnd = html.indexOf('>', tagStart);
            if (tagEnd === -1) break;

            const tagContent = html.substring(tagStart + 1, tagEnd);

            if (tagContent.startsWith('/')) {
                position = tagEnd + 1;
                break;
            }

            const isSelfClosing = tagContent.endsWith('/') || this.isSelfClosingTag(tagContent.split(/\s+/)[0]);
            const spaceIndex = tagContent.indexOf(' ');
            const tagName = spaceIndex === -1 ? tagContent.replace('/', '') : tagContent.substring(0, spaceIndex);
            const attributes = spaceIndex === -1 ? '' : tagContent.substring(spaceIndex + 1).replace('/', '');

            const element = this.document.createElement(tagName.toLowerCase());

            if (attributes.trim()) {
                this.parseAttributes(attributes, element);
            }

            // Handle special HTML structure tags
            if (tagName.toLowerCase() === 'html') {
                // Replace documentElement
                (this.document as any).documentElement = element;
                this.document.appendChild(element);
            } else if (tagName.toLowerCase() === 'head') {
                (this.document as any).head = element;
                if (this.document.documentElement) {
                    this.document.documentElement.appendChild(element);
                } else {
                    parent.appendChild(element);
                }
            } else if (tagName.toLowerCase() === 'body') {
                (this.document as any).body = element;
                if (this.document.documentElement) {
                    this.document.documentElement.appendChild(element);
                } else {
                    parent.appendChild(element);
                }
            } else {
                parent.appendChild(element);
            }

            if (isSelfClosing) {
                position = tagEnd + 1;
            } else {
                const closingTag = `</${tagName}>`;
                const closingTagIndex = this.findMatchingClosingTag(html, tagEnd + 1, tagName);

                if (closingTagIndex !== -1) {
                    const innerContent = html.substring(tagEnd + 1, closingTagIndex);
                    if (innerContent.trim()) {
                        this.parseHTMLRecursive(innerContent, element);
                    }
                    position = closingTagIndex + closingTag.length;
                } else {
                    position = tagEnd + 1;
                }
            }
        }
    }

    private findMatchingClosingTag(html: string, startPos: number, tagName: string): number {
        const openTag = `<${tagName}`;
        const closeTag = `</${tagName}>`;
        let depth = 1;
        let pos = startPos;

        while (pos < html.length && depth > 0) {
            const nextOpen = html.indexOf(openTag, pos);
            const nextClose = html.indexOf(closeTag, pos);

            if (nextClose === -1) return -1;

            if (nextOpen !== -1 && nextOpen < nextClose) {
                depth++;
                pos = nextOpen + openTag.length;
            } else {
                depth--;
                if (depth === 0) return nextClose;
                pos = nextClose + closeTag.length;
            }
        }

        return -1;
    }

    private parseAttributes(attributeString: string, element: any): void {
        // Updated regex to handle hyphenated attribute names like dr-for-of, data-bind, etc.
        const attrRegex = /([\w:-]+)(?:\s*=\s*(['"])(.*?)\2)?/g;
        let match;

        while ((match = attrRegex.exec(attributeString)) !== null) {
            const name = match[1];
            let value = match[3] || ''; // match[3] is the content between quotes
            element.setAttribute(name, value);
        }
    }

    private isSelfClosingTag(tagName: string): boolean {
        const selfClosingTags = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
        return selfClosingTags.includes(tagName.toLowerCase());
    }

    /**
     * Clear current document content
     */
    private clearDocumentContent(): void {
        const doc = this.document as any;

        // Clear head content
        if (doc.head) {
            while (doc.head.firstChild) {
                doc.head.removeChild(doc.head.firstChild);
            }
        }

        // Clear body content
        if (doc.body) {
            while (doc.body.firstChild) {
                doc.body.removeChild(doc.body.firstChild);
            }
        }
    }


}