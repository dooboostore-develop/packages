import { Node } from './Node';
import { ParentNode } from './ParentNode';
import { Element } from './elements/Element';
import { HTMLElement } from './elements/HTMLElement';
import { HTMLCollection, HTMLCollectionOf } from './collection';
import {Comment} from "./Comment";
import {Text} from "./Text";
import { DocumentFragment } from './DocumentFragment';
import { HTMLElementTagNameMap, SVGElementTagNameMap, MathMLElementTagNameMap, HTMLElementDeprecatedTagNameMap, HTMLImageElement, HTMLAnchorElement, HTMLAreaElement, HTMLEmbedElement, HTMLFormElement, HTMLScriptElement, HTMLHeadElement, SVGElement, MathMLElement } from './elements';
import { NodeListOf } from './collection/NodeListOf';

// 추가 타입들 정의
export interface ElementCreationOptions {
    is?: string;
}

export interface ImportNodeOptions {
    deep?: boolean;
}

export interface CaretPositionFromPointOptions {
    shadowRoots?: ShadowRoot[];
}

export interface StartViewTransitionOptions {
    update?: ViewTransitionUpdateCallback;
}

export type DocumentReadyState = 'loading' | 'interactive' | 'complete';
export type DocumentVisibilityState = 'visible' | 'hidden' | 'prerender';
export type ViewTransitionUpdateCallback = () => void | Promise<void>;

// Import interfaces from separate files
export { Text } from './Text';
export { Comment } from './Comment';
export { DocumentFragment } from './DocumentFragment';

// Document 관련 인터페이스들 (간소화된 버전)
export interface DocumentOrShadowRoot { }
export interface FontFaceSource { }
export interface GlobalEventHandlers { }
export interface NonElementParentNode { }
export interface XPathEvaluatorBase { }
export interface DocumentAndElementEventHandlers { }
export interface HTMLAllCollection extends HTMLCollection { }
export interface DocumentType extends Node { }
export interface DOMImplementation { }
export interface FragmentDirective { }
export interface DocumentTimeline { }
export interface Location { href: string; }
export interface Selection { }
export interface Range { }
export interface NodeIterator { }
export interface TreeWalker { }
export interface ViewTransition { }
export interface CaretPosition { }
export interface NodeFilter { }
export interface ProcessingInstruction extends Node { }
export interface CDATASection extends Text { }
export interface Attr extends Node { }
export interface HTMLOrSVGScriptElement extends HTMLElement { }
export interface WindowProxy { }
export interface ShadowRoot { }

// Event interfaces
export interface Event { }
export interface AnimationEvent extends Event { }
export interface AnimationPlaybackEvent extends Event { }
export interface AudioProcessingEvent extends Event { }
export interface BeforeUnloadEvent extends Event { }
export interface BlobEvent extends Event { }
export interface ClipboardEvent extends Event { }
export interface CloseEvent extends Event { }
export interface CompositionEvent extends Event { }
export interface ContentVisibilityAutoStateChangeEvent extends Event { }
export interface CookieChangeEvent extends Event { }
export interface CustomEvent extends Event { }
export interface DeviceMotionEvent extends Event { }
export interface DeviceOrientationEvent extends Event { }
export interface DragEvent extends Event { }
export interface ErrorEvent extends Event { }
export interface FocusEvent extends Event { }
export interface FontFaceSetLoadEvent extends Event { }
export interface FormDataEvent extends Event { }
export interface GamepadEvent extends Event { }
export interface HashChangeEvent extends Event { }
export interface IDBVersionChangeEvent extends Event { }
export interface InputEvent extends Event { }
export interface KeyboardEvent extends Event { }
export interface MIDIConnectionEvent extends Event { }
export interface MIDIMessageEvent extends Event { }
export interface MediaEncryptedEvent extends Event { }
export interface MediaKeyMessageEvent extends Event { }
export interface MediaQueryListEvent extends Event { }
export interface MediaStreamTrackEvent extends Event { }
export interface MessageEvent extends Event { }
export interface MouseEvent extends Event { }
export interface OfflineAudioCompletionEvent extends Event { }
export interface PageRevealEvent extends Event { }
export interface PageSwapEvent extends Event { }
export interface PageTransitionEvent extends Event { }
export interface PaymentMethodChangeEvent extends Event { }
export interface PaymentRequestUpdateEvent extends Event { }
export interface PictureInPictureEvent extends Event { }
export interface PointerEvent extends Event { }
export interface PopStateEvent extends Event { }
export interface ProgressEvent extends Event { }
export interface PromiseRejectionEvent extends Event { }
export interface RTCDTMFToneChangeEvent extends Event { }
export interface RTCDataChannelEvent extends Event { }
export interface RTCErrorEvent extends Event { }
export interface RTCPeerConnectionIceErrorEvent extends Event { }
export interface RTCPeerConnectionIceEvent extends Event { }
export interface RTCTrackEvent extends Event { }
export interface SecurityPolicyViolationEvent extends Event { }
export interface SpeechSynthesisErrorEvent extends Event { }
export interface SpeechSynthesisEvent extends Event { }
export interface StorageEvent extends Event { }
export interface SubmitEvent extends Event { }
export interface TextEvent extends Event { }
export interface ToggleEvent extends Event { }
export interface TouchEvent extends Event { }
export interface TrackEvent extends Event { }
export interface TransitionEvent extends Event { }
export interface UIEvent extends Event { }
export interface WebGLContextEvent extends Event { }
export interface WheelEvent extends Event { }

export interface EventListenerOptions {
    capture?: boolean;
}

export interface AddEventListenerOptions extends EventListenerOptions {
    once?: boolean;
    passive?: boolean;
    signal?: AbortSignal;
}

export interface EventListenerOrEventListenerObject {
    (evt: Event): void;
}

export interface DocumentEventMap {
    [key: string]: Event;
}

export interface AbortSignal { }

/**
 * The **`Document`** interface represents any web page loaded in the browser and serves as an entry point into the web page's content, which is the DOM tree.
 * 
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document)
 */
export interface Document extends Node, NonElementParentNode, DocumentOrShadowRoot, ParentNode, XPathEvaluatorBase, GlobalEventHandlers, DocumentAndElementEventHandlers {
  /**
   * The **`URL`** read-only property of the Document interface returns the document location as a string.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/URL)
   */
  readonly URL: string;

  /**
   * Returns or sets the color of an active link in the document body.
   * @deprecated
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/alinkColor)
   */
  alinkColor: string;

  /**
   * The Document interface's read-only **`all`** property returns an HTMLAllCollection rooted at the document node.
   * @deprecated
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/all)
   */
  readonly all: HTMLAllCollection;

  /**
   * The **`anchors`** read-only property of the An HTMLCollection.
   * @deprecated
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/anchors)
   */
  readonly anchors: HTMLCollectionOf<HTMLAnchorElement>;

  /**
   * The **`applets`** property of the Document returns an empty HTMLCollection.
   * @deprecated
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/applets)
   */
  readonly applets: HTMLCollection;

  /**
   * The deprecated `bgColor` property gets or sets the background color of the current document.
   * @deprecated
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/bgColor)
   */
  bgColor: string;

  /**
   * The **`Document.body`** property represents the `null` if no such element exists.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/body)
   */
  body: HTMLElement;

  /**
   * The **`Document.characterSet`** read-only property returns the character encoding of the document that it's currently rendered with.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/characterSet)
   */
  readonly characterSet: string;

  /**
   * @deprecated This is a legacy alias of `characterSet`.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/characterSet)
   */
  readonly charset: string;

  /**
   * The **`Document.compatMode`** read-only property indicates whether the document is rendered in Quirks mode or Standards mode.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/compatMode)
   */
  readonly compatMode: string;

  /**
   * The **`Document.contentType`** read-only property returns the MIME type that the document is being rendered as.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/contentType)
   */
  readonly contentType: string;

  /**
   * The Document property `cookie` lets you read and write cookies associated with the document.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/cookie)
   */
  cookie: string;

  /**
   * The **`Document.currentScript`** property returns the script element whose script is currently being processed and isn't a JavaScript module.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/currentScript)
   */
  readonly currentScript: HTMLOrSVGScriptElement | null;

  /**
   * In browsers, **`document.defaultView`** returns the This property is read-only.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/defaultView)
   */
  readonly defaultView: (WindowProxy & typeof globalThis) | null;

  /**
   * **`document.designMode`** controls whether the entire document is editable.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/designMode)
   */
  designMode: string;

  /**
   * The **`Document.dir`** property is a string representing the directionality of the text of the document, whether left to right (default) or right to left.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/dir)
   */
  dir: string;

  /**
   * The **`doctype`** read-only property of the Document interface is a DocumentType object representing the Doctype associated with the current document.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/doctype)
   */
  readonly doctype: DocumentType | null;

  /**
   * The **`documentElement`** read-only property of the Document interface returns the example, the html element for HTML documents).
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/documentElement)
   */
  readonly documentElement: HTMLElement;

  /**
   * The **`documentURI`** read-only property of the A string.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/documentURI)
   */
  readonly documentURI: string;

  /**
   * The **`domain`** property of the Document interface gets/sets the domain portion of the origin of the current document, as used by the same-origin policy.
   * @deprecated
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/domain)
   */
  domain: string;

  /**
   * The **`embeds`** read-only property of the An HTMLCollection.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/embeds)
   */
  readonly embeds: HTMLCollectionOf<HTMLEmbedElement>;

  /**
   * **`fgColor`** gets/sets the foreground color, or text color, of the current document.
   * @deprecated
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/fgColor)
   */
  fgColor: string;

  /**
   * The **`forms`** read-only property of the Document interface returns an HTMLCollection listing all the form elements contained in the document.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/forms)
   */
  readonly forms: HTMLCollectionOf<HTMLFormElement>;

  /**
   * The **`fragmentDirective`** read-only property of the Document interface returns the FragmentDirective for the current document.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/fragmentDirective)
   */
  readonly fragmentDirective: FragmentDirective;

  /**
   * The obsolete Document interface's **`fullscreen`** read-only property reports whether or not the document is currently displaying content in fullscreen mode.
   * @deprecated
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/fullscreen)
   */
  readonly fullscreen: boolean;

  /**
   * The read-only **`fullscreenEnabled`** property on the Document interface indicates whether or not fullscreen mode is available.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/fullscreenEnabled)
   */
  readonly fullscreenEnabled: boolean;

  /**
   * The **`head`** read-only property of the Document interface returns the head element of the current document.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/head)
   */
  readonly head: HTMLHeadElement;

  /**
   * The **`Document.hidden`** read-only property returns a Boolean value indicating if the page is considered hidden or not.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/hidden)
   */
  readonly hidden: boolean;

  /**
   * The **`images`** read-only property of the Document interface returns a collection of the images in the current HTML document.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/images)
   */
  readonly images: HTMLCollectionOf<HTMLImageElement>;

  /**
   * The **`Document.implementation`** property returns a A DOMImplementation object.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/implementation)
   */
  readonly implementation: DOMImplementation;

  /**
   * @deprecated This is a legacy alias of `characterSet`.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/characterSet)
   */
  readonly inputEncoding: string;

  /**
   * The **`lastModified`** property of the Document interface returns a string containing the date and local time on which the current document was last modified.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/lastModified)
   */
  readonly lastModified: string;

  /**
   * The **`Document.linkColor`** property gets/sets the color of links within the document.
   * @deprecated
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/linkColor)
   */
  linkColor: string;

  /**
   * The **`links`** read-only property of the Document interface returns a collection of all area elements and a elements in a document with a value for the href attribute.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/links)
   */
  readonly links: HTMLCollectionOf<HTMLAnchorElement | HTMLAreaElement>;

  /**
   * The **`Document.location`** read-only property returns a and provides methods for changing that URL and loading another URL.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/location)
   */
  get location(): Location;
  set location(href: string);

  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/fullscreenchange_event) */
  onfullscreenchange: ((this: Document, ev: Event) => any) | null;

  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/fullscreenerror_event) */
  onfullscreenerror: ((this: Document, ev: Event) => any) | null;

  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/pointerlockchange_event) */
  onpointerlockchange: ((this: Document, ev: Event) => any) | null;

  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/pointerlockerror_event) */
  onpointerlockerror: ((this: Document, ev: Event) => any) | null;

  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/readystatechange_event) */
  onreadystatechange: ((this: Document, ev: Event) => any) | null;

  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/visibilitychange_event) */
  onvisibilitychange: ((this: Document, ev: Event) => any) | null;

  readonly ownerDocument: null;

  /**
   * The read-only **`pictureInPictureEnabled`** property of the available.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/pictureInPictureEnabled)
   */
  readonly pictureInPictureEnabled: boolean;

  /**
   * The **`plugins`** read-only property of the containing one or more HTMLEmbedElements representing the An HTMLCollection.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/plugins)
   */
  readonly plugins: HTMLCollectionOf<HTMLEmbedElement>;

  /**
   * The **`Document.readyState`** property describes the loading state of the document.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/readyState)
   */
  readonly readyState: DocumentReadyState;

  /**
   * The **`Document.referrer`** property returns the URI of the page that linked to this page.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/referrer)
   */
  readonly referrer: string;

  /**
   * **`Document.rootElement`** returns the Element that is the root element of the document if it is an documents.
   * @deprecated
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/rootElement)
   */
  readonly rootElement: SVGElement | null;

  /**
   * The **`scripts`** property of the Document interface returns a list of the script elements in the document.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/scripts)
   */
  readonly scripts: HTMLCollectionOf<HTMLScriptElement>;

  /**
   * The **`scrollingElement`** read-only property of the scrolls the document.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/scrollingElement)
   */
  readonly scrollingElement: Element | null;

  /**
   * The `timeline` readonly property of the Document interface represents the default timeline of the current document.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/timeline)
   */
  readonly timeline: DocumentTimeline;

  /**
   * The **`document.title`** property gets or sets the current title of the document.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/title)
   */
  title: string;

  /**
   * The **`Document.visibilityState`** read-only property returns the visibility of the document.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/visibilityState)
   */
  readonly visibilityState: DocumentVisibilityState;

  /**
   * The **`Document.vlinkColor`** property gets/sets the color of links that the user has visited in the document.
   * @deprecated
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/vlinkColor)
   */
  vlinkColor: string;

  /**
   * **`Document.adoptNode()`** transfers a node/dom from another Document into the method's document.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/adoptNode)
   */
  adoptNode<T extends Node>(node: T): T;

  /** @deprecated */
  captureEvents(): void;

  /**
   * The **`caretPositionFromPoint()`** method of the Document interface returns a CaretPosition object, containing the DOM node, along with the caret and caret's character offset within that node.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/caretPositionFromPoint)
   */
  caretPositionFromPoint(x: number, y: number, options?: CaretPositionFromPointOptions): CaretPosition | null;

  /** @deprecated */
  caretRangeFromPoint(x: number, y: number): Range | null;

  /**
   * The **`Document.clear()`** method does nothing, but doesn't raise any error.
   * @deprecated
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/clear)
   */
  clear(): void;

  /**
   * The **`Document.close()`** method finishes writing to a document, opened with Document.open().
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/close)
   */
  close(): void;

  /**
   * The **`Document.createAttribute()`** method creates a new attribute node, and returns it.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/createAttribute)
   */
  createAttribute(localName: string): Attr;

  /**
   * The **`Document.createAttributeNS()`** method creates a new attribute node with the specified namespace URI and qualified name, and returns it.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/createAttributeNS)
   */
  createAttributeNS(namespace: string | null, qualifiedName: string): Attr;

  /**
   * **`createCDATASection()`** creates a new CDATA section node, and returns it.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/createCDATASection)
   */
  createCDATASection(data: string): CDATASection;

  /**
   * **`createComment()`** creates a new comment node, and returns it.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/createComment)
   */
  createComment(data: string): Comment;

  /**
   * Creates a new empty DocumentFragment into which DOM nodes can be added to build an offscreen DOM tree.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/createDocumentFragment)
   */
  createDocumentFragment(): DocumentFragment;

  /**
   * In an HTML document, the **`document.createElement()`** method creates the HTML element specified by `localName`, or an HTMLUnknownElement if `localName` isn't recognized.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/createElement)
   */
  createElement<K extends keyof HTMLElementTagNameMap>(tagName: K, options?: ElementCreationOptions): HTMLElementTagNameMap[K];
  /** @deprecated */
  createElement<K extends keyof HTMLElementDeprecatedTagNameMap>(tagName: K, options?: ElementCreationOptions): HTMLElementDeprecatedTagNameMap[K];
  createElement(tagName: string, options?: ElementCreationOptions): HTMLElement;

  /**
   * Creates an element with the specified namespace URI and qualified name.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/createElementNS)
   */
  createElementNS(namespaceURI: "http://www.w3.org/1999/xhtml", qualifiedName: string): HTMLElement;
  createElementNS<K extends keyof SVGElementTagNameMap>(namespaceURI: "http://www.w3.org/2000/svg", qualifiedName: K): SVGElementTagNameMap[K];
  createElementNS(namespaceURI: "http://www.w3.org/2000/svg", qualifiedName: string): SVGElement;
  createElementNS<K extends keyof MathMLElementTagNameMap>(namespaceURI: "http://www.w3.org/1998/Math/MathML", qualifiedName: K): MathMLElementTagNameMap[K];
  createElementNS(namespaceURI: "http://www.w3.org/1998/Math/MathML", qualifiedName: string): MathMLElement;
  createElementNS(namespaceURI: string | null, qualifiedName: string, options?: ElementCreationOptions): Element;
  createElementNS(namespace: string | null, qualifiedName: string, options?: string | ElementCreationOptions): Element;

  /**
   * Creates an event of the type specified.
   * @deprecated
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/createEvent)
   */
  createEvent(eventInterface: "AnimationEvent"): AnimationEvent;
  createEvent(eventInterface: "AnimationPlaybackEvent"): AnimationPlaybackEvent;
  createEvent(eventInterface: "AudioProcessingEvent"): AudioProcessingEvent;
  createEvent(eventInterface: "BeforeUnloadEvent"): BeforeUnloadEvent;
  createEvent(eventInterface: "BlobEvent"): BlobEvent;
  createEvent(eventInterface: "ClipboardEvent"): ClipboardEvent;
  createEvent(eventInterface: "CloseEvent"): CloseEvent;
  createEvent(eventInterface: "CompositionEvent"): CompositionEvent;
  createEvent(eventInterface: "ContentVisibilityAutoStateChangeEvent"): ContentVisibilityAutoStateChangeEvent;
  createEvent(eventInterface: "CookieChangeEvent"): CookieChangeEvent;
  createEvent(eventInterface: "CustomEvent"): CustomEvent;
  createEvent(eventInterface: "DeviceMotionEvent"): DeviceMotionEvent;
  createEvent(eventInterface: "DeviceOrientationEvent"): DeviceOrientationEvent;
  createEvent(eventInterface: "DragEvent"): DragEvent;
  createEvent(eventInterface: "ErrorEvent"): ErrorEvent;
  createEvent(eventInterface: "Event"): Event;
  createEvent(eventInterface: "Events"): Event;
  createEvent(eventInterface: "FocusEvent"): FocusEvent;
  createEvent(eventInterface: "FontFaceSetLoadEvent"): FontFaceSetLoadEvent;
  createEvent(eventInterface: "FormDataEvent"): FormDataEvent;
  createEvent(eventInterface: "GamepadEvent"): GamepadEvent;
  createEvent(eventInterface: "HashChangeEvent"): HashChangeEvent;
  createEvent(eventInterface: "IDBVersionChangeEvent"): IDBVersionChangeEvent;
  createEvent(eventInterface: "InputEvent"): InputEvent;
  createEvent(eventInterface: "KeyboardEvent"): KeyboardEvent;
  createEvent(eventInterface: "MIDIConnectionEvent"): MIDIConnectionEvent;
  createEvent(eventInterface: "MIDIMessageEvent"): MIDIMessageEvent;
  createEvent(eventInterface: "MediaEncryptedEvent"): MediaEncryptedEvent;
  createEvent(eventInterface: "MediaKeyMessageEvent"): MediaKeyMessageEvent;
  createEvent(eventInterface: "MediaQueryListEvent"): MediaQueryListEvent;
  createEvent(eventInterface: "MediaStreamTrackEvent"): MediaStreamTrackEvent;
  createEvent(eventInterface: "MessageEvent"): MessageEvent;
  createEvent(eventInterface: "MouseEvent"): MouseEvent;
  createEvent(eventInterface: "MouseEvents"): MouseEvent;
  createEvent(eventInterface: "OfflineAudioCompletionEvent"): OfflineAudioCompletionEvent;
  createEvent(eventInterface: "PageRevealEvent"): PageRevealEvent;
  createEvent(eventInterface: "PageSwapEvent"): PageSwapEvent;
  createEvent(eventInterface: "PageTransitionEvent"): PageTransitionEvent;
  createEvent(eventInterface: "PaymentMethodChangeEvent"): PaymentMethodChangeEvent;
  createEvent(eventInterface: "PaymentRequestUpdateEvent"): PaymentRequestUpdateEvent;
  createEvent(eventInterface: "PictureInPictureEvent"): PictureInPictureEvent;
  createEvent(eventInterface: "PointerEvent"): PointerEvent;
  createEvent(eventInterface: "PopStateEvent"): PopStateEvent;
  createEvent(eventInterface: "ProgressEvent"): ProgressEvent;
  createEvent(eventInterface: "PromiseRejectionEvent"): PromiseRejectionEvent;
  createEvent(eventInterface: "RTCDTMFToneChangeEvent"): RTCDTMFToneChangeEvent;
  createEvent(eventInterface: "RTCDataChannelEvent"): RTCDataChannelEvent;
  createEvent(eventInterface: "RTCErrorEvent"): RTCErrorEvent;
  createEvent(eventInterface: "RTCPeerConnectionIceErrorEvent"): RTCPeerConnectionIceErrorEvent;
  createEvent(eventInterface: "RTCPeerConnectionIceEvent"): RTCPeerConnectionIceEvent;
  createEvent(eventInterface: "RTCTrackEvent"): RTCTrackEvent;
  createEvent(eventInterface: "SecurityPolicyViolationEvent"): SecurityPolicyViolationEvent;
  createEvent(eventInterface: "SpeechSynthesisErrorEvent"): SpeechSynthesisErrorEvent;
  createEvent(eventInterface: "SpeechSynthesisEvent"): SpeechSynthesisEvent;
  createEvent(eventInterface: "StorageEvent"): StorageEvent;
  createEvent(eventInterface: "SubmitEvent"): SubmitEvent;
  createEvent(eventInterface: "TextEvent"): TextEvent;
  createEvent(eventInterface: "ToggleEvent"): ToggleEvent;
  createEvent(eventInterface: "TouchEvent"): TouchEvent;
  createEvent(eventInterface: "TrackEvent"): TrackEvent;
  createEvent(eventInterface: "TransitionEvent"): TransitionEvent;
  createEvent(eventInterface: "UIEvent"): UIEvent;
  createEvent(eventInterface: "UIEvents"): UIEvent;
  createEvent(eventInterface: "WebGLContextEvent"): WebGLContextEvent;
  createEvent(eventInterface: "WheelEvent"): WheelEvent;
  createEvent(eventInterface: string): Event;

  /**
   * The **`Document.createNodeIterator()`** method returns a new `NodeIterator` object.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/createNodeIterator)
   */
  createNodeIterator(root: Node, whatToShow?: number, filter?: NodeFilter | null): NodeIterator;

  /**
   * `createProcessingInstruction()` generates a new processing instruction node and returns it.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/createProcessingInstruction)
   */
  createProcessingInstruction(target: string, data: string): ProcessingInstruction;

  /**
   * The **`Document.createRange()`** method returns a new ```js-nolint createRange() ``` None.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/createRange)
   */
  createRange(): Range;

  /**
   * Creates a new Text node.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/createTextNode)
   */
  createTextNode(data: string): Text;

  /**
   * The **`Document.createTreeWalker()`** creator method returns a newly created TreeWalker object.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/createTreeWalker)
   */
  createTreeWalker(root: Node, whatToShow?: number, filter?: NodeFilter | null): TreeWalker;

  /**
   * The **`execCommand`** method implements multiple different commands.
   * @deprecated
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/execCommand)
   */
  execCommand(commandId: string, showUI?: boolean, value?: string): boolean;

  /**
   * The Document method **`exitFullscreen()`** requests that the element on this document which is currently being presented in fullscreen mode be taken out of fullscreen mode, restoring the previous state of the screen.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/exitFullscreen)
   */
  exitFullscreen(): Promise<void>;

  /**
   * The **`exitPictureInPicture()`** method of the Document interface requests that a video contained in this document, which is currently floating, be taken out of picture-in-picture mode, restoring the previous state of the screen.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/exitPictureInPicture)
   */
  exitPictureInPicture(): Promise<void>;

  /**
   * The **`exitPointerLock()`** method of the Document interface asynchronously releases a pointer lock previously requested through Element.requestPointerLock.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/exitPointerLock)
   */
  exitPointerLock(): void;

  getElementById(elementId: string): HTMLElement | null;

  /**
   * The **`getElementsByClassName`** method of of all child elements which have all of the given class name(s).
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/getElementsByClassName)
   */
  getElementsByClassName(classNames: string): HTMLCollectionOf<Element>;

  /**
   * The **`getElementsByName()`** method of the Document object returns a NodeList Collection of elements with a given `name` attribute in the document.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/getElementsByName)
   */
  getElementsByName(elementName: string): NodeListOf<HTMLElement>;

  /**
   * The **`getElementsByTagName`** method of The complete document is searched, including the root node.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/getElementsByTagName)
   */
  getElementsByTagName<K extends keyof HTMLElementTagNameMap>(qualifiedName: K): HTMLCollectionOf<HTMLElementTagNameMap[K]>;
  getElementsByTagName<K extends keyof SVGElementTagNameMap>(qualifiedName: K): HTMLCollectionOf<SVGElementTagNameMap[K]>;
  getElementsByTagName<K extends keyof MathMLElementTagNameMap>(qualifiedName: K): HTMLCollectionOf<MathMLElementTagNameMap[K]>;
  /** @deprecated */
  getElementsByTagName<K extends keyof HTMLElementDeprecatedTagNameMap>(qualifiedName: K): HTMLCollectionOf<HTMLElementDeprecatedTagNameMap[K]>;
  getElementsByTagName(qualifiedName: string): HTMLCollectionOf<Element>;

  /**
   * Returns a list of elements with the given tag name belonging to the given namespace.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/getElementsByTagNameNS)
   */
  getElementsByTagNameNS(namespaceURI: "http://www.w3.org/1999/xhtml", localName: string): HTMLCollectionOf<HTMLElement>;
  getElementsByTagNameNS(namespaceURI: "http://www.w3.org/2000/svg", localName: string): HTMLCollectionOf<SVGElement>;
  getElementsByTagNameNS(namespaceURI: "http://www.w3.org/1998/Math/MathML", localName: string): HTMLCollectionOf<MathMLElement>;
  getElementsByTagNameNS(namespace: string | null, localName: string): HTMLCollectionOf<Element>;

  /**
   * The **`getSelection()`** method of the Document interface returns the Selection object associated with this document, representing the range of text selected by the user, or the current position of the caret.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/getSelection)
   */
  getSelection(): Selection | null;

  /**
   * The **`hasFocus()`** method of the Document interface returns a boolean value indicating whether the document or any element inside the document has focus.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/hasFocus)
   */
  hasFocus(): boolean;

  /**
   * The **`hasStorageAccess()`** method of the Document interface returns a Promise that resolves with a boolean value indicating whether the document has access to third-party, unpartitioned cookies.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/hasStorageAccess)
   */
  hasStorageAccess(): Promise<boolean>;

  /**
   * The Document object's **`importNode()`** method creates a copy of a inserted into the current document later.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/importNode)
   */
  importNode<T extends Node>(node: T, options?: boolean | ImportNodeOptions): T;

  /**
   * The **`Document.open()`** method opens a document for This does come with some side effects.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/open)
   */
  open(unused1?: string, unused2?: string): Document;
  open(url: string | URL, name: string, features: string): WindowProxy | null;

  /**
   * The **`Document.queryCommandEnabled()`** method reports whether or not the specified editor command is enabled by the browser.
   * @deprecated
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/queryCommandEnabled)
   */
  queryCommandEnabled(commandId: string): boolean;

  /** @deprecated */
  queryCommandIndeterm(commandId: string): boolean;

  /**
   * The **`queryCommandState()`** method will tell you if the current selection has a certain Document.execCommand() command applied.
   * @deprecated
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/queryCommandState)
   */
  queryCommandState(commandId: string): boolean;

  /**
   * The **`Document.queryCommandSupported()`** method reports whether or not the specified editor command is supported by the browser.
   * @deprecated
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/queryCommandSupported)
   */
  queryCommandSupported(commandId: string): boolean;

  /** @deprecated */
  queryCommandValue(commandId: string): string;

  /** @deprecated */
  releaseEvents(): void;

  /**
   * The **`requestStorageAccess()`** method of the Document interface allows content loaded in a third-party context (i.e., embedded in an iframe) to request access to third-party cookies and unpartitioned state.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/requestStorageAccess)
   */
  requestStorageAccess(): Promise<void>;

  /**
   * The **`startViewTransition()`** method of the Document interface starts a new same-document (SPA) view transition and returns a ViewTransition object to represent it.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/startViewTransition)
   */
  startViewTransition(callbackOptions?: ViewTransitionUpdateCallback | StartViewTransitionOptions): ViewTransition;

  /**
   * The **`write()`** method of the Document interface writes text in one or more TrustedHTML or string parameters to a document stream opened by document.open().
   * @deprecated
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/write)
   */
  write(...text: string[]): void;

  /**
   * The **`writeln()`** method of the Document interface writes text in one or more TrustedHTML or string parameters to a document stream opened by document.open(), followed by a newline character.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/writeln)
   */
  writeln(...text: string[]): void;

  /** [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent) */
  get textContent(): null;

  addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}