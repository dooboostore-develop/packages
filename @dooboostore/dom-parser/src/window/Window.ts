import { Document } from '../node/Document';
import { NodeBase } from '../node/NodeBase';
import { ElementBase } from '../node/elements/ElementBase';

export interface Window {
    /**
     * @deprecated This is a legacy alias of `navigator`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/navigator)
     */
    readonly clientInformation: Navigator;
    
    /**
     * The **`Window.closed`** read-only property indicates whether the referenced window is closed or not.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/closed)
     */
    readonly closed: boolean;
    
    /**
     * The **`cookieStore`** read-only property of the Window interface returns a reference to the CookieStore object for the current document context.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/cookieStore)
     */
    readonly cookieStore: CookieStore;
    
    /**
     * The **`customElements`** read-only property of the Window interface returns a reference to the CustomElementRegistry object, which can be used to register new custom elements and get information about previously registered custom elements.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/customElements)
     */
    readonly customElements: CustomElementRegistry;
    
    /**
     * The **`devicePixelRatio`** of Window interface returns the ratio of the resolution in _physical pixels_ to the resolution in _CSS pixels_ for the current display device.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/devicePixelRatio)
     */
    readonly devicePixelRatio: number;
    
    /**
     * **`window.document`** returns a reference to the document contained in the window.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/document)
     */
    readonly document: Document;
    
    /**
     * The read-only Window property **`event`** returns the Event which is currently being handled by the site's code.
     * @deprecated
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/event)
     */
    readonly event: Event | undefined;
    
    /**
     * The `external` property of the Window API returns an instance of the `External` interface, which was intended to contain functions related to adding external search providers to the browser.
     * @deprecated
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/external)
     */
    readonly external: External;
    
    /**
     * The **`Window.frameElement`** property returns the element (such as iframe or object) in which the window is embedded.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/frameElement)
     */
    readonly frameElement: Element | null;
    
    /**
     * Returns the window itself, which is an array-like object, listing the direct sub-frames of the current window.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/frames)
     */
    readonly frames: WindowProxy;
    
    /**
     * The `Window.history` read-only property returns a reference to the History object, which provides an interface for manipulating the browser _session history_ (pages visited in the tab or frame that the current page is loaded in).
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/history)
     */
    readonly history: History;
    
    /**
     * The read-only **`innerHeight`** property of the including the height of the horizontal scroll bar, if present.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/innerHeight)
     */
    readonly innerHeight: number;
    
    /**
     * The read-only Window property **`innerWidth`** returns the interior width of the window in pixels (that is, the width of the window's layout viewport).
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/innerWidth)
     */
    readonly innerWidth: number;
    
    /**
     * Returns the number of frames (either frame or A number.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/length)
     */
    readonly length: number;
    
    /**
     * The **`Window.location`** read-only property returns a Location object with information about the current location of the document.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/location)
     */
    get location(): Location;
    set location(href: string);
    
    /**
     * Returns the `locationbar` object.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/locationbar)
     */
    readonly locationbar: BarProp;
    
    /**
     * Returns the `menubar` object.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/menubar)
     */
    readonly menubar: BarProp;
    
    /**
     * The `Window.name` property gets/sets the name of the window's browsing context.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/name)
     */
    name: string;
    
    /**
     * The **`Window.navigator`** read-only property returns a reference to the Navigator object, which has methods and properties about the application running the script.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/navigator)
     */
    readonly navigator: Navigator;
    
    /**
     * Available only in secure contexts.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/devicemotion_event)
     */
    ondevicemotion: ((this: Window, ev: DeviceMotionEvent) => any) | null;
    
    /**
     * Available only in secure contexts.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/deviceorientation_event)
     */
    ondeviceorientation: ((this: Window, ev: DeviceOrientationEvent) => any) | null;
    
    /**
     * Available only in secure contexts.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/deviceorientationabsolute_event)
     */
    ondeviceorientationabsolute: ((this: Window, ev: DeviceOrientationEvent) => any) | null;
    
    /**
     * @deprecated
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/orientationchange_event)
     */
    onorientationchange: ((this: Window, ev: Event) => any) | null;
    
    /**
     * The Window interface's **`opener`** property returns a reference to the window that opened the window, either with Window.open, or by navigating a link with a `target` attribute.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/opener)
     */
    opener: any;
    
    /**
     * Returns the orientation in degrees (in 90-degree increments) of the viewport relative to the device's natural orientation.
     * @deprecated
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/orientation)
     */
    readonly orientation: number;
    
    /**
     * The **`originAgentCluster`** read-only property of the Window interface returns `true` if this window belongs to an _origin-keyed agent cluster_: this means that the operating system has provided dedicated resources (for example an operating system process) to this window's origin that are not shared with windows from other origins.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/originAgentCluster)
     */
    readonly originAgentCluster: boolean;
    
    /**
     * The **`Window.outerHeight`** read-only property returns the height in pixels of the whole browser window, including any sidebar, window chrome, and window-resizing borders/handles.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/outerHeight)
     */
    readonly outerHeight: number;
    
    /**
     * **`Window.outerWidth`** read-only property returns the width of the outside of the browser window.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/outerWidth)
     */
    readonly outerWidth: number;
    
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/scrollX) */
    readonly pageXOffset: number;
    
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/scrollY) */
    readonly pageYOffset: number;
    
    /**
     * The **`Window.parent`** property is a reference to the parent of the current window or subframe.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/parent)
     */
    readonly parent: WindowProxy;
    
    /**
     * Returns the `personalbar` object.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/personalbar)
     */
    readonly personalbar: BarProp;
    
    /**
     * The Window property **`screen`** returns a reference to the screen object associated with the window.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/screen)
     */
    readonly screen: Screen;
    
    /**
     * The **`Window.screenLeft`** read-only property returns the horizontal distance, in CSS pixels, from the left border of the user's browser viewport to the left side of the screen.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/screenLeft)
     */
    readonly screenLeft: number;
    
    /**
     * The **`Window.screenTop`** read-only property returns the vertical distance, in CSS pixels, from the top border of the user's browser viewport to the top side of the screen.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/screenTop)
     */
    readonly screenTop: number;
    
    /**
     * The **`Window.screenX`** read-only property returns the horizontal distance, in CSS pixels, of the left border of the user's browser viewport to the left side of the screen.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/screenX)
     */
    readonly screenX: number;
    
    /**
     * The **`Window.screenY`** read-only property returns the vertical distance, in CSS pixels, of the top border of the user's browser viewport to the top edge of the screen.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/screenY)
     */
    readonly screenY: number;
    
    /**
     * The read-only **`scrollX`** property of the Window interface returns the number of pixels by which the document is currently scrolled horizontally.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/scrollX)
     */
    readonly scrollX: number;
    
    /**
     * The read-only **`scrollY`** property of the Window interface returns the number of pixels by which the document is currently scrolled vertically.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/scrollY)
     */
    readonly scrollY: number;
    
    /**
     * Returns the `scrollbars` object.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/scrollbars)
     */
    readonly scrollbars: BarProp;
    
    /**
     * The **`Window.self`** read-only property returns the window itself, as a WindowProxy.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/self)
     */
    readonly self: Window & typeof globalThis;
    
    /**
     * The `speechSynthesis` read-only property of the Window object returns a SpeechSynthesis object, which is the entry point into using Web Speech API speech synthesis functionality.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/speechSynthesis)
     */
    readonly speechSynthesis: SpeechSynthesis;
    
    /**
     * The **`status`** property of the bar at the bottom of the browser window.
     * @deprecated
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/status)
     */
    status: string;
    
    /**
     * Returns the `statusbar` object.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/statusbar)
     */
    readonly statusbar: BarProp;
    
    /**
     * Returns the `toolbar` object.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/toolbar)
     */
    readonly toolbar: BarProp;
    
    /**
     * Returns a reference to the topmost window in the window hierarchy.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/top)
     */
    readonly top: WindowProxy | null;
    
    /**
     * The **`visualViewport`** read-only property of the Window interface returns a VisualViewport object representing the visual viewport for a given window, or `null` if current document is not fully active.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/visualViewport)
     */
    readonly visualViewport: VisualViewport | null;
    
    /**
     * The **`window`** property of a Window object points to the window object itself.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/window)
     */
    readonly window: Window & typeof globalThis;
    
    /**
     * `window.alert()` instructs the browser to display a dialog with an optional message, and to wait until the user dismisses the dialog.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/alert)
     */
    alert(message?: any): void;
    
    /**
     * The **`Window.blur()`** method does nothing.
     * @deprecated
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/blur)
     */
    blur(): void;
    
    /**
     * The **`window.cancelIdleCallback()`** method cancels a callback previously scheduled with window.requestIdleCallback().
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/cancelIdleCallback)
     */
    cancelIdleCallback(handle: number): void;
    
    /**
     * The **`Window.captureEvents()`** method does nothing.
     * @deprecated
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/captureEvents)
     */
    captureEvents(): void;
    
    /**
     * The **`Window.close()`** method closes the current window, or the window on which it was called.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/close)
     */
    close(): void;
    
    /**
     * `window.confirm()` instructs the browser to display a dialog with an optional message, and to wait until the user either confirms or cancels the dialog.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/confirm)
     */
    confirm(message?: string): boolean;
    
    /**
     * Makes a request to bring the window to the front.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/focus)
     */
    focus(): void;
    
    /**
     * The **`Window.getComputedStyle()`** method returns an object containing the values of all CSS properties of an element, after applying active stylesheets and resolving any basic computation those values may contain.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/getComputedStyle)
     */
    getComputedStyle(elt: Element, pseudoElt?: string | null): CSSStyleDeclaration;
    
    /**
     * The **`getSelection()`** method of the Window interface returns the Selection object associated with the window's document, representing the range of text selected by the user or the current position of the caret.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/getSelection)
     */
    getSelection(): Selection | null;
    
    /**
     * The Window interface's **`matchMedia()`** method returns a new MediaQueryList object that can then be used to determine if the document matches the media query string, as well as to monitor the document to detect when it matches (or stops matching) that media query.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/matchMedia)
     */
    matchMedia(query: string): MediaQueryList;
    
    /**
     * The **`moveBy()`** method of the Window interface moves the current window by a specified amount.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/moveBy)
     */
    moveBy(x: number, y: number): void;
    
    /**
     * The **`moveTo()`** method of the Window interface moves the current window to the specified coordinates.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/moveTo)
     */
    moveTo(x: number, y: number): void;
    
    /**
     * The **`open()`** method of the `Window` interface loads a specified resource into a new or existing browsing context (that is, a tab, a window, or an iframe) under a specified name.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/open)
     */
    open(url?: string | URL, target?: string, features?: string): WindowProxy | null;
    
    /**
     * The **`window.postMessage()`** method safely enables cross-origin communication between Window objects; _e.g.,_ between a page and a pop-up that it spawned, or between a page and an iframe embedded within it.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/postMessage)
     */
    postMessage(message: any, targetOrigin: string, transfer?: Transferable[]): void;
    postMessage(message: any, options?: WindowPostMessageOptions): void;
    
    /**
     * Opens the print dialog to print the current document.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/print)
     */
    print(): void;
    
    /**
     * `window.prompt()` instructs the browser to display a dialog with an optional message prompting the user to input some text, and to wait until the user either submits the text or cancels the dialog.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/prompt)
     */
    prompt(message?: string, _default?: string): string | null;
    
    /**
     * Releases the window from trapping events of a specific type.
     * @deprecated
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/releaseEvents)
     */
    releaseEvents(): void;
    
    /**
     * The **`window.requestIdleCallback()`** method queues a function to be called during a browser's idle periods.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/requestIdleCallback)
     */
    requestIdleCallback(callback: IdleRequestCallback, options?: IdleRequestOptions): number;
    
    /**
     * The **`Window.resizeBy()`** method resizes the current window by a specified amount.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/resizeBy)
     */
    resizeBy(x: number, y: number): void;
    
    /**
     * The **`Window.resizeTo()`** method dynamically resizes the window.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/resizeTo)
     */
    resizeTo(width: number, height: number): void;
    
    /**
     * The **`Window.scroll()`** method scrolls the window to a particular place in the document.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/scroll)
     */
    scroll(options?: ScrollToOptions): void;
    scroll(x: number, y: number): void;
    
    /**
     * The **`Window.scrollBy()`** method scrolls the document in the window by the given amount.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/scrollBy)
     */
    scrollBy(options?: ScrollToOptions): void;
    scrollBy(x: number, y: number): void;
    
    /**
     * **`Window.scrollTo()`** scrolls to a particular set of coordinates in the document.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/scrollTo)
     */
    scrollTo(options?: ScrollToOptions): void;
    scrollTo(x: number, y: number): void;
    
    /**
     * The **`window.stop()`** stops further resource loading in the current browsing context, equivalent to the stop button in the browser.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/stop)
     */
    stop(): void;
    
    addEventListener<K extends keyof WindowEventMap>(type: K, listener: (this: Window, ev: WindowEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof WindowEventMap>(type: K, listener: (this: Window, ev: WindowEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
    
    [index: number]: Window;
    
    // Additional event handlers that might be missing
    onbeforematch?: ((this: Window, ev: Event) => any) | null;
    onbeforetoggle?: ((this: Window, ev: Event) => any) | null;
    oncontextlost?: ((this: Window, ev: Event) => any) | null;
    oncontextrestored?: ((this: Window, ev: Event) => any) | null;
    onscrollsnapchange?: ((this: Window, ev: Event) => any) | null;
    onscrollsnapchanging?: ((this: Window, ev: Event) => any) | null;
    onpointerrawupdate?: ((this: Window, ev: Event) => any) | null;
    ongamepadconnected?: ((this: Window, ev: Event) => any) | null;
    ongamepaddisconnected?: ((this: Window, ev: Event) => any) | null;
    onpagereveal?: ((this: Window, ev: Event) => any) | null;
    onpageswap?: ((this: Window, ev: Event) => any) | null;
    
    // Basic event handlers
    onabort?: ((this: Window, ev: Event) => any) | null;
    onblur?: ((this: Window, ev: Event) => any) | null;
    oncancel?: ((this: Window, ev: Event) => any) | null;
    oncanplay?: ((this: Window, ev: Event) => any) | null;
    oncanplaythrough?: ((this: Window, ev: Event) => any) | null;
    onchange?: ((this: Window, ev: Event) => any) | null;
    onclick?: ((this: Window, ev: Event) => any) | null;
    onclose?: ((this: Window, ev: Event) => any) | null;
    oncontextmenu?: ((this: Window, ev: Event) => any) | null;
    oncuechange?: ((this: Window, ev: Event) => any) | null;
    ondblclick?: ((this: Window, ev: Event) => any) | null;
    ondrag?: ((this: Window, ev: Event) => any) | null;
    ondragend?: ((this: Window, ev: Event) => any) | null;
    ondragenter?: ((this: Window, ev: Event) => any) | null;
    ondragleave?: ((this: Window, ev: Event) => any) | null;
    ondragover?: ((this: Window, ev: Event) => any) | null;
    ondragstart?: ((this: Window, ev: Event) => any) | null;
    ondrop?: ((this: Window, ev: Event) => any) | null;
    ondurationchange?: ((this: Window, ev: Event) => any) | null;
    onemptied?: ((this: Window, ev: Event) => any) | null;
    onended?: ((this: Window, ev: Event) => any) | null;
    onerror?: ((this: Window, ev: Event) => any) | null;
    onfocus?: ((this: Window, ev: Event) => any) | null;
    oninput?: ((this: Window, ev: Event) => any) | null;
    oninvalid?: ((this: Window, ev: Event) => any) | null;
    onkeydown?: ((this: Window, ev: Event) => any) | null;
    onkeypress?: ((this: Window, ev: Event) => any) | null;
    onkeyup?: ((this: Window, ev: Event) => any) | null;
    onload?: ((this: Window, ev: Event) => any) | null;
    onloadeddata?: ((this: Window, ev: Event) => any) | null;
    onloadedmetadata?: ((this: Window, ev: Event) => any) | null;
    onloadstart?: ((this: Window, ev: Event) => any) | null;
    onmousedown?: ((this: Window, ev: Event) => any) | null;
    onmouseenter?: ((this: Window, ev: Event) => any) | null;
    onmouseleave?: ((this: Window, ev: Event) => any) | null;
    onmousemove?: ((this: Window, ev: Event) => any) | null;
    onmouseout?: ((this: Window, ev: Event) => any) | null;
    onmouseover?: ((this: Window, ev: Event) => any) | null;
    onmouseup?: ((this: Window, ev: Event) => any) | null;
    onpause?: ((this: Window, ev: Event) => any) | null;
    onplay?: ((this: Window, ev: Event) => any) | null;
    onplaying?: ((this: Window, ev: Event) => any) | null;
    onprogress?: ((this: Window, ev: Event) => any) | null;
    onratechange?: ((this: Window, ev: Event) => any) | null;
    onreset?: ((this: Window, ev: Event) => any) | null;
    onresize?: ((this: Window, ev: Event) => any) | null;
    onscroll?: ((this: Window, ev: Event) => any) | null;
    onseeked?: ((this: Window, ev: Event) => any) | null;
    onseeking?: ((this: Window, ev: Event) => any) | null;
    onselect?: ((this: Window, ev: Event) => any) | null;
    onstalled?: ((this: Window, ev: Event) => any) | null;
    onsubmit?: ((this: Window, ev: Event) => any) | null;
    onsuspend?: ((this: Window, ev: Event) => any) | null;
    ontimeupdate?: ((this: Window, ev: Event) => any) | null;
    onvolumechange?: ((this: Window, ev: Event) => any) | null;
    onwaiting?: ((this: Window, ev: Event) => any) | null;
    
    // Window-specific event handlers
    onafterprint?: ((this: Window, ev: Event) => any) | null;
    onbeforeprint?: ((this: Window, ev: Event) => any) | null;
    onbeforeunload?: ((this: Window, ev: Event) => any) | null;
    onhashchange?: ((this: Window, ev: Event) => any) | null;
    onlanguagechange?: ((this: Window, ev: Event) => any) | null;
    onmessage?: ((this: Window, ev: Event) => any) | null;
    onmessageerror?: ((this: Window, ev: Event) => any) | null;
    onoffline?: ((this: Window, ev: Event) => any) | null;
    ononline?: ((this: Window, ev: Event) => any) | null;
    onpagehide?: ((this: Window, ev: Event) => any) | null;
    onpageshow?: ((this: Window, ev: Event) => any) | null;
    onpopstate?: ((this: Window, ev: Event) => any) | null;
    onrejectionhandled?: ((this: Window, ev: Event) => any) | null;
    onstorage?: ((this: Window, ev: Event) => any) | null;
    onunhandledrejection?: ((this: Window, ev: Event) => any) | null;
    onunload?: ((this: Window, ev: Event) => any) | null;
    
    // Storage
    localStorage?: Storage;
    sessionStorage?: Storage;
    
    // Additional properties
    caches?: CacheStorage;
    crossOriginIsolated?: boolean;
    crypto?: Crypto;
    indexedDB?: IDBFactory;
    isSecureContext?: boolean;
    origin?: string;
    performance?: Performance;
    
    // Additional methods
    atob?: (data: string) => string;
    btoa?: (data: string) => string;
    createImageBitmap?: (...args: any[]) => Promise<ImageBitmap>;
    fetch?: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
    queueMicrotask?: (callback: VoidFunction) => void;
    reportError?: (e: any) => void;
    structuredClone?: (value: any, options?: StructuredSerializeOptions) => any;
    
    // Global constructors
    Node: typeof NodeBase;
    Element: typeof ElementBase;
    HTMLElement: typeof ElementBase;
    Event: any;
    PopStateEvent: any;
    IntersectionObserver: any;
    NodeFilter: any;
    DocumentFragment: any;
    HTMLMetaElement: any;
    HTMLCanvasElement: any;
    CanvasRenderingContext2D: any;
    CanvasPattern: any;
    CanvasGradient: any;
    Path2D: any;
    ImageData: any;
    
    // Additional HTML element constructors
    HTMLAnchorElement: any;
    HTMLBodyElement: any;
    HTMLButtonElement: any;
    HTMLDivElement: any;
    HTMLH1Element: any;
    HTMLHeadElement: any;
    HTMLHtmlElement: any;
    HTMLImgElement: any;
    HTMLInputElement: any;
    HTMLPElement: any;
    HTMLSpanElement: any;
    HTMLTitleElement: any;
    HTMLLinkElement: any;
    HTMLScriptElement: any;
    HTMLStyleElement: any;
    HTMLFormElement: any;
    HTMLTableElement: any;
    HTMLUListElement: any;
    HTMLOListElement: any;
    HTMLLIElement: any;
    HTMLTemplateElement: any;
    HTMLTheadElement: any;
    HTMLTfootElement: any;
    HTMLTrElement: any;
    HTMLTdElement: any;
    HTMLThElement: any;
    HTMLCaptionElement: any;
    HTMLTbodyElement: any;
}

// Location interface for server-side rendering
export interface Location {
    href: string;
    protocol: string;
    host: string;
    hostname: string;
    port: string;
    pathname: string;
    search: string;
    hash: string;
    origin: string;
    assign: (url: string) => void;
    replace: (url: string) => void;
    reload: (forcedReload?: boolean) => void;
}

// History interface for server-side rendering
export interface History {
    length: number;
    state: any;
    back: () => void;
    forward: () => void;
    go: (delta?: number) => void;
    pushState: (data: any, title: string, url?: string) => void;
    replaceState: (data: any, title: string, url?: string) => void;
}

// Navigator interface for server-side rendering
export interface Navigator {
    userAgent: string;
    language: string;
    languages: readonly string[];
    platform: string;
    cookieEnabled: boolean;
    onLine: boolean;
}