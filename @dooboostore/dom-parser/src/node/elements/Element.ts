import { Node } from '../Node';
import { ChildNode } from '../ChildNode';
import { ParentNode } from '../ParentNode';
import { HTMLCollectionOf } from '../collection/HTMLCollectionOf';
import { HTMLElement } from './HTMLElement';
import { SVGElement } from './SVGElement';
import { MathMLElement } from './MathMLElement';
import { HTMLElementTagNameMap, SVGElementTagNameMap, MathMLElementTagNameMap } from '../index';
// Forward declarations for types that will be implemented later
export interface NamedNodeMap {
    readonly length: number;
    getNamedItem(qualifiedName: string): Attr | null;
    getNamedItemNS(namespace: string | null, localName: string): Attr | null;
    item(index: number): Attr | null;
    removeNamedItem(qualifiedName: string): Attr;
    removeNamedItemNS(namespace: string | null, localName: string): Attr;
    setNamedItem(attr: Attr): Attr | null;
    setNamedItemNS(attr: Attr): Attr | null;
    [index: number]: Attr;
}

export interface Attr extends Node {
    readonly localName: string;
    readonly name: string;
    readonly namespaceURI: string | null;
    readonly ownerElement: Element | null;
    readonly prefix: string | null;
    readonly specified: boolean;
    value: string;
}

export interface DOMRect {
    readonly bottom: number;
    readonly height: number;
    readonly left: number;
    readonly right: number;
    readonly top: number;
    readonly width: number;
    readonly x: number;
    readonly y: number;
    toJSON(): any;
}

export interface DOMRectList {
    readonly length: number;
    item(index: number): DOMRect | null;
    [index: number]: DOMRect;
}

export interface ShadowRoot extends DocumentFragment {
    readonly delegatesFocus: boolean;
    readonly host: Element;
    readonly mode: ShadowRootMode;
    readonly slotAssignment: SlotAssignmentMode;
}

export interface ShadowRootInit {
    delegatesFocus?: boolean;
    mode: ShadowRootMode;
    slotAssignment?: SlotAssignmentMode;
}

export type ShadowRootMode = "closed" | "open";
export type SlotAssignmentMode = "manual" | "named";

export interface CheckVisibilityOptions {
    checkOpacity?: boolean;
    checkVisibilityCSS?: boolean;
    contentVisibilityAuto?: boolean;
    opacityProperty?: boolean;
    visibilityProperty?: boolean;
}

export interface StylePropertyMapReadOnly {
    readonly size: number;
    entries(): IterableIterator<[string, CSSStyleValue[]]>;
    forEach(callbackfn: (value: CSSStyleValue[], key: string, parent: StylePropertyMapReadOnly) => void, thisArg?: any): void;
    get(property: string): CSSStyleValue | undefined;
    getAll(property: string): CSSStyleValue[];
    has(property: string): boolean;
    keys(): IterableIterator<string>;
    values(): IterableIterator<CSSStyleValue[]>;
}

export interface CSSStyleValue {
    toString(): string;
}

export interface GetHTMLOptions {
    serializableShadowRoots?: boolean;
    shadowRoots?: ShadowRoot[];
}

export type InsertPosition = "afterbegin" | "afterend" | "beforebegin" | "beforeend";

export interface FullscreenOptions {
    navigationUI?: FullscreenNavigationUI;
}

export type FullscreenNavigationUI = "auto" | "hide" | "show";

export interface PointerLockOptions {
    unadjustedMovement?: boolean;
}

export interface ScrollToOptions {
    behavior?: ScrollBehavior;
    left?: number;
    top?: number;
}

export interface ScrollIntoViewOptions extends ScrollToOptions {
    block?: ScrollLogicalPosition;
    inline?: ScrollLogicalPosition;
}

export type ScrollBehavior = "auto" | "instant" | "smooth";
export type ScrollLogicalPosition = "center" | "end" | "nearest" | "start";

export interface ElementEventMap extends GlobalEventHandlersEventMap {
    "fullscreenchange": Event;
    "fullscreenerror": Event;
}

export interface GlobalEventHandlersEventMap {
    "abort": UIEvent;
    "animationcancel": AnimationEvent;
    "animationend": AnimationEvent;
    "animationiteration": AnimationEvent;
    "animationstart": AnimationEvent;
    "auxclick": MouseEvent;
    "beforeinput": InputEvent;
    "blur": FocusEvent;
    "canplay": Event;
    "canplaythrough": Event;
    "change": Event;
    "click": MouseEvent;
    "close": Event;
    "compositionend": CompositionEvent;
    "compositionstart": CompositionEvent;
    "compositionupdate": CompositionEvent;
    "contextmenu": MouseEvent;
    "copy": ClipboardEvent;
    "cuechange": Event;
    "cut": ClipboardEvent;
    "dblclick": MouseEvent;
    "drag": DragEvent;
    "dragend": DragEvent;
    "dragenter": DragEvent;
    "dragleave": DragEvent;
    "dragover": DragEvent;
    "dragstart": DragEvent;
    "drop": DragEvent;
    "durationchange": Event;
    "emptied": Event;
    "ended": Event;
    "error": ErrorEvent;
    "focus": FocusEvent;
    "focusin": FocusEvent;
    "focusout": FocusEvent;
    "formdata": FormDataEvent;
    "gotpointercapture": PointerEvent;
    "input": Event;
    "invalid": Event;
    "keydown": KeyboardEvent;
    "keypress": KeyboardEvent;
    "keyup": KeyboardEvent;
    "load": Event;
    "loadeddata": Event;
    "loadedmetadata": Event;
    "loadstart": Event;
    "lostpointercapture": PointerEvent;
    "mousedown": MouseEvent;
    "mouseenter": MouseEvent;
    "mouseleave": MouseEvent;
    "mousemove": MouseEvent;
    "mouseout": MouseEvent;
    "mouseover": MouseEvent;
    "mouseup": MouseEvent;
    "paste": ClipboardEvent;
    "pause": Event;
    "play": Event;
    "playing": Event;
    "pointercancel": PointerEvent;
    "pointerdown": PointerEvent;
    "pointerenter": PointerEvent;
    "pointerleave": PointerEvent;
    "pointermove": PointerEvent;
    "pointerout": PointerEvent;
    "pointerover": PointerEvent;
    "pointerup": PointerEvent;
    "progress": ProgressEvent;
    "ratechange": Event;
    "reset": Event;
    "resize": UIEvent;
    "scroll": Event;
    "securitypolicyviolation": SecurityPolicyViolationEvent;
    "seeked": Event;
    "seeking": Event;
    "select": Event;
    "selectionchange": Event;
    "selectstart": Event;
    "slotchange": Event;
    "stalled": Event;
    "submit": SubmitEvent;
    "suspend": Event;
    "timeupdate": Event;
    "toggle": Event;
    "touchcancel": TouchEvent;
    "touchend": TouchEvent;
    "touchmove": TouchEvent;
    "touchstart": TouchEvent;
    "transitioncancel": TransitionEvent;
    "transitionend": TransitionEvent;
    "transitionrun": TransitionEvent;
    "transitionstart": TransitionEvent;
    "volumechange": Event;
    "waiting": Event;
    "webkitanimationend": Event;
    "webkitanimationiteration": Event;
    "webkitanimationstart": Event;
    "webkittransitionend": Event;
    "wheel": WheelEvent;
}

// Event interfaces (simplified declarations)
export interface Event {
    readonly type: string;
    readonly target: EventTarget | null;
    readonly currentTarget: EventTarget | null;
    readonly bubbles: boolean;
    readonly cancelable: boolean;
    readonly defaultPrevented: boolean;
    preventDefault(): void;
    stopPropagation(): void;
    stopImmediatePropagation(): void;
}

export interface UIEvent extends Event { }
export interface MouseEvent extends UIEvent { }
export interface KeyboardEvent extends UIEvent { }
export interface FocusEvent extends UIEvent { }
export interface InputEvent extends UIEvent { }
export interface WheelEvent extends MouseEvent { }
export interface PointerEvent extends MouseEvent { }
export interface TouchEvent extends UIEvent { }
export interface DragEvent extends MouseEvent { }
export interface ClipboardEvent extends Event { }
export interface AnimationEvent extends Event { }
export interface TransitionEvent extends Event { }
export interface CompositionEvent extends UIEvent { }
export interface FormDataEvent extends Event { }
export interface ProgressEvent extends Event { }
export interface SecurityPolicyViolationEvent extends Event { }
export interface SubmitEvent extends Event { }
export interface ErrorEvent extends Event { }

export interface EventTarget {
    addEventListener(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions): void;
    dispatchEvent(event: Event): boolean;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | EventListenerOptions): void;
}

export interface EventListenerOptions {
    capture?: boolean;
}

export interface AddEventListenerOptions extends EventListenerOptions {
    once?: boolean;
    passive?: boolean;
    signal?: AbortSignal;
}

export interface EventListener {
    (evt: Event): void;
}

export interface EventListenerObject {
    handleEvent(object: Event): void;
}

export type EventListenerOrEventListenerObject = EventListener | EventListenerObject;

export interface AbortSignal extends EventTarget {
    readonly aborted: boolean;
    readonly reason: any;
}

/**
 * **`Element`** is the most general base class from which all element objects (i.e. objects that represent elements) in a Document inherit.
 * 
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element)
 */
export interface Element extends Node, ChildNode, ParentNode, EventTarget {
    /**
     * Returns the namespace-aware tag name of the element.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/tagName)
     */
    readonly tagName: string;

    /**
     * Returns the value of element's id content attribute. Can be set to change it.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/id)
     */
    id: string;

    /**
     * Returns the value of element's class content attribute. Can be set to change it.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/className)
     */
    className: string;

    /**
     * Returns the value of element's class content attribute as a DOMTokenList.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/classList)
     */
    readonly classList: DOMTokenList;

    /**
     * Returns a string representation of the markup of the element's content.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/innerHTML)
     */
    innerHTML: string;

    /**
     * Returns a string representation of the element and its descendants.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/outerHTML)
     */
    outerHTML: string;

    /**
     * Returns the local part of the qualified name of the element.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/localName)
     */
    readonly localName: string;

    /**
     * Returns the namespace URI of the element, or null if it is no namespace.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/namespaceURI)
     */
    readonly namespaceURI: string | null;

    /**
     * Returns the namespace prefix of the element, or null if no prefix is specified.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/prefix)
     */
    readonly prefix: string | null;

    /**
     * Returns the value of a specified attribute on the element.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/getAttribute)
     */
    getAttribute(qualifiedName: string): string | null;

    /**
     * Sets the value of an attribute on the specified element.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/setAttribute)
     */
    setAttribute(qualifiedName: string, value: string): void;

    /**
     * Removes an attribute from the specified element.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/removeAttribute)
     */
    removeAttribute(qualifiedName: string): void;

    /**
     * Returns a Boolean value indicating whether the specified element has the specified attribute or not.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/hasAttribute)
     */
    hasAttribute(qualifiedName: string): boolean;

    /**
     * Returns the closest ancestor element (including the element itself) that matches the specified CSS selector.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/closest)
     */
    closest<K extends keyof HTMLElementTagNameMap>(selector: K): HTMLElementTagNameMap[K] | null;
    closest<K extends keyof SVGElementTagNameMap>(selector: K): SVGElementTagNameMap[K] | null;
    closest<K extends keyof MathMLElementTagNameMap>(selector: K): MathMLElementTagNameMap[K] | null;
    closest<E extends Element = Element>(selectors: string): E | null;

    /**
     * Returns true if the element would be selected by the specified CSS selector; otherwise, returns false.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/matches)
     */
    matches(selectors: string): boolean;

    // Additional Element properties and methods

    /**
     * The **`Element.attributes`** property returns a live collection of all attribute nodes registered to the specified node.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/attributes)
     */
    readonly attributes: NamedNodeMap;

    /**
     * The **`clientHeight`** read-only property of the Element interface is zero for elements with no CSS or inline layout boxes; otherwise, it's the inner height of an element in pixels.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/clientHeight)
     */
    readonly clientHeight: number;

    /**
     * The **`clientLeft`** read-only property of the Element interface returns the width of the left border of an element in pixels.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/clientLeft)
     */
    readonly clientLeft: number;

    /**
     * The **`clientTop`** read-only property of the Element interface returns the width of the top border of an element in pixels.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/clientTop)
     */
    readonly clientTop: number;

    /**
     * The **`clientWidth`** read-only property of the Element interface is zero for inline elements and elements with no CSS; otherwise, it's the inner width of an element in pixels.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/clientWidth)
     */
    readonly clientWidth: number;

    /**
     * The **`currentCSSZoom`** read-only property of the Element interface provides the 'effective' CSS `zoom` of an element, taking into account the zoom applied to the element and all its parent elements.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/currentCSSZoom)
     */
    readonly currentCSSZoom: number;

    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/fullscreenchange_event) */
    onfullscreenchange: ((this: Element, ev: Event) => any) | null;

    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/fullscreenerror_event) */
    onfullscreenerror: ((this: Element, ev: Event) => any) | null;

    /**
     * The **`part`** property of the Element interface represents the part identifier(s) of the element (i.e., set using the `part` attribute), returned as a DOMTokenList.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/part)
     */
    readonly part: DOMTokenList;

    /**
     * The **`scrollHeight`** read-only property of the Element interface is a measurement of the height of an element's content, including content not visible on the screen due to overflow.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/scrollHeight)
     */
    readonly scrollHeight: number;

    /**
     * The **`scrollLeft`** property of the Element interface gets or sets the number of pixels by which an element's content is scrolled from its left edge.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/scrollLeft)
     */
    scrollLeft: number;

    /**
     * The **`scrollTop`** property of the Element interface gets or sets the number of pixels by which an element's content is scrolled from its top edge.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/scrollTop)
     */
    scrollTop: number;

    /**
     * The **`scrollWidth`** read-only property of the Element interface is a measurement of the width of an element's content, including content not visible on the screen due to overflow.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/scrollWidth)
     */
    readonly scrollWidth: number;

    /**
     * The `Element.shadowRoot` read-only property represents the shadow root hosted by the element.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/shadowRoot)
     */
    readonly shadowRoot: ShadowRoot | null;

    /**
     * The **`slot`** property of the Element interface returns the name of the shadow DOM slot the element is inserted in.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/slot)
     */
    slot: string;

    // Methods

    /**
     * The **`Element.attachShadow()`** method attaches a shadow DOM tree to the specified element and returns a reference to its ShadowRoot.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/attachShadow)
     */
    attachShadow(init: ShadowRootInit): ShadowRoot;

    /**
     * The **`checkVisibility()`** method of the Element interface checks whether the element is visible.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/checkVisibility)
     */
    checkVisibility(options?: CheckVisibilityOptions): boolean;

    /**
     * The **`computedStyleMap()`** method of the Element interface returns a StylePropertyMapReadOnly interface which provides a read-only representation of a CSS declaration block that is an alternative to CSSStyleDeclaration.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/computedStyleMap)
     */
    computedStyleMap(): StylePropertyMapReadOnly;

    /**
     * The **`getAttributeNS()`** method of the Element interface returns the string value of the attribute with the specified namespace and name.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/getAttributeNS)
     */
    getAttributeNS(namespace: string | null, localName: string): string | null;

    /**
     * The **`getAttributeNames()`** method of the Element interface returns the attribute names of the element as an Array of strings.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/getAttributeNames)
     */
    getAttributeNames(): string[];

    /**
     * Returns the specified attribute of the specified element, as an Attr node.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/getAttributeNode)
     */
    getAttributeNode(qualifiedName: string): Attr | null;

    /**
     * The **`getAttributeNodeNS()`** method of the Element interface returns the namespaced Attr node of an element.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/getAttributeNodeNS)
     */
    getAttributeNodeNS(namespace: string | null, localName: string): Attr | null;

    /**
     * The **`Element.getBoundingClientRect()`** method returns a DOMRect object providing information about the size of an element and its position relative to the viewport.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/getBoundingClientRect)
     */
    getBoundingClientRect(): DOMRect;

    /**
     * The **`getClientRects()`** method of the Element interface returns a collection of DOMRect objects that indicate the bounding rectangles for each CSS border box in a client.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/getClientRects)
     */
    getClientRects(): DOMRectList;

    /**
     * The Element method **`getElementsByClassName()`** returns a live HTMLCollectionOf which contains every descendant element which has the specified class name or names.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/getElementsByClassName)
     */
    getElementsByClassName(classNames: string): HTMLCollectionOf<Element>;

    /**
     * The **`Element.getElementsByTagName()`** method returns a live HTMLCollectionOf of elements with the given tag name.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/getElementsByTagName)
     */
    getElementsByTagName<K extends keyof HTMLElementTagNameMap>(qualifiedName: K): HTMLCollectionOf<HTMLElementTagNameMap[K]>;
    getElementsByTagName<K extends keyof SVGElementTagNameMap>(qualifiedName: K): HTMLCollectionOf<SVGElementTagNameMap[K]>;
    getElementsByTagName<K extends keyof MathMLElementTagNameMap>(qualifiedName: K): HTMLCollectionOf<MathMLElementTagNameMap[K]>;
    getElementsByTagName(qualifiedName: string): HTMLCollectionOf<Element>;

    /**
     * The **`Element.getElementsByTagNameNS()`** method returns a live HTMLCollectionOf of elements with the given tag name belonging to the given namespace.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/getElementsByTagNameNS)
     */
    getElementsByTagNameNS(namespaceURI: "http://www.w3.org/1999/xhtml", localName: string): HTMLCollectionOf<HTMLElement>;
    getElementsByTagNameNS(namespaceURI: "http://www.w3.org/2000/svg", localName: string): HTMLCollectionOf<SVGElement>;
    getElementsByTagNameNS(namespaceURI: "http://www.w3.org/1998/Math/MathML", localName: string): HTMLCollectionOf<MathMLElement>;
    getElementsByTagNameNS(namespace: string | null, localName: string): HTMLCollectionOf<Element>;

    /**
     * The **`getHTML()`** method of the Element interface is used to serialize an element's DOM to an HTML string.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/getHTML)
     */
    getHTML(options?: GetHTMLOptions): string;

    /**
     * The **`hasAttributeNS()`** method of the Element interface returns a boolean value indicating whether the current element has the specified attribute with the specified namespace.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/hasAttributeNS)
     */
    hasAttributeNS(namespace: string | null, localName: string): boolean;

    /**
     * The **`hasAttributes()`** method of the Element interface returns a boolean value indicating whether the current element has any attributes or not.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/hasAttributes)
     */
    hasAttributes(): boolean;

    /**
     * The **`hasPointerCapture()`** method of the Element interface checks whether the element on which it is invoked has pointer capture for the pointer identified by the given pointer ID.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/hasPointerCapture)
     */
    hasPointerCapture(pointerId: number): boolean;

    /**
     * The **`insertAdjacentElement()`** method of the Element interface inserts a given element node at a given position relative to the element it is invoked upon.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/insertAdjacentElement)
     */
    insertAdjacentElement(where: InsertPosition, element: Element): Element | null;

    /**
     * The **`insertAdjacentHTML()`** method of the Element interface parses the specified text as HTML or XML and inserts the resulting nodes into the DOM tree at a specified position.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/insertAdjacentHTML)
     */
    insertAdjacentHTML(position: InsertPosition, string: string): void;

    /**
     * The **`insertAdjacentText()`** method of the Element interface, given a relative position and a string, inserts a new text node at the given position relative to the element it is called from.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/insertAdjacentText)
     */
    insertAdjacentText(where: InsertPosition, data: string): void;

    /**
     * The **`releasePointerCapture()`** method of the Element interface releases (stops) pointer capture that was previously set for a specific PointerEvent.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/releasePointerCapture)
     */
    releasePointerCapture(pointerId: number): void;

    /**
     * The **`removeAttributeNS()`** method of the Element interface removes the specified attribute from an element.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/removeAttributeNS)
     */
    removeAttributeNS(namespace: string | null, localName: string): void;

    /**
     * The **`removeAttributeNode()`** method of the Element interface removes the specified Attr node from the element.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/removeAttributeNode)
     */
    removeAttributeNode(attr: Attr): Attr;

    /**
     * The **`Element.requestFullscreen()`** method issues an asynchronous request to make the element be displayed in fullscreen mode.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/requestFullscreen)
     */
    requestFullscreen(options?: FullscreenOptions): Promise<void>;

    /**
     * The **`requestPointerLock()`** method of the Element interface lets you asynchronously ask for the pointer to be locked on the given element.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/requestPointerLock)
     */
    requestPointerLock(options?: PointerLockOptions): Promise<void>;

    /**
     * The **`scroll()`** method of the Element interface scrolls the element to a particular set of coordinates inside a given element.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/scroll)
     */
    scroll(options?: ScrollToOptions): void;
    scroll(x: number, y: number): void;

    /**
     * The **`scrollBy()`** method of the Element interface scrolls an element by the given amount.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/scrollBy)
     */
    scrollBy(options?: ScrollToOptions): void;
    scrollBy(x: number, y: number): void;

    /**
     * The Element interface's **`scrollIntoView()`** method scrolls the element's ancestor containers such that the element on which `scrollIntoView()` is called is visible to the user.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/scrollIntoView)
     */
    scrollIntoView(arg?: boolean | ScrollIntoViewOptions): void;

    /**
     * The **`scrollTo()`** method of the Element interface scrolls to a particular set of coordinates inside a given element.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/scrollTo)
     */
    scrollTo(options?: ScrollToOptions): void;
    scrollTo(x: number, y: number): void;

    /**
     * `setAttributeNS` adds a new attribute or changes the value of an attribute with the given namespace and name.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/setAttributeNS)
     */
    setAttributeNS(namespace: string | null, qualifiedName: string, value: string): void;

    /**
     * The **`setAttributeNode()`** method of the Element interface adds a new Attr node to the specified element.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/setAttributeNode)
     */
    setAttributeNode(attr: Attr): Attr | null;

    /**
     * The **`setAttributeNodeNS()`** method of the Element interface adds a new namespaced Attr node to an element.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/setAttributeNodeNS)
     */
    setAttributeNodeNS(attr: Attr): Attr | null;

    /**
     * The **`setHTMLUnsafe()`** method of the Element interface is used to parse a string of HTML into a DocumentFragment, optionally filtering out unwanted elements and attributes, and those that don't belong in the context, and then using it to replace the element's subtree in the DOM.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/setHTMLUnsafe)
     */
    setHTMLUnsafe(html: string): void;

    /**
     * The **`setPointerCapture()`** method of the Element interface is used to designate a specific element as the capture target of future pointer events.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/setPointerCapture)
     */
    setPointerCapture(pointerId: number): void;

    /**
     * The **`toggleAttribute()`** method of the Element interface toggles a Boolean attribute (removing it if it is present and adding it if it is not present) on the given element.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/toggleAttribute)
     */
    toggleAttribute(qualifiedName: string, force?: boolean): boolean;

    /**
     * @deprecated This is a legacy alias of `matches`.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/matches)
     */
    webkitMatchesSelector(selectors: string): boolean;
}

// 기본 타입들 정의
export interface DOMTokenList {
    readonly length: number;
    value: string;
    add(...tokens: string[]): void;
    remove(...tokens: string[]): void;
    contains(token: string): boolean;
    toggle(token: string, force?: boolean): boolean;
    replace(oldToken: string, newToken: string): boolean;
    item(index: number): string | null;
    [index: number]: string;
}

// Export Element as the main interface