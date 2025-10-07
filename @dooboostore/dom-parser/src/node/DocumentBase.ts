import {ParentNodeBase} from './ParentNodeBase';
import {DOCUMENT_NODE, Node} from './Node';
import {Document, ElementCreationOptions, DocumentReadyState, DocumentVisibilityState, ImportNodeOptions, CaretPositionFromPointOptions, StartViewTransitionOptions, ViewTransitionUpdateCallback} from './Document';
import {Comment} from './Comment';
import {Text} from './Text';
import {DocumentFragment} from './DocumentFragment';
import {DocumentFragmentBase} from './DocumentFragmentBase';
import {Element} from './elements/Element';
import {HTMLElement} from './elements/HTMLElement';
import {HTMLCollection, HTMLCollectionOf} from './collection';
import {HTMLElementTagNameMap, SVGElementTagNameMap, MathMLElementTagNameMap, HTMLElementDeprecatedTagNameMap} from './elements';
import {NodeListOf} from './collection/NodeListOf';
import {ElementFactory} from '../factory';
import {NodeIterator, NodeFilter} from './NodeIterator';

// Document event listener interface
interface DocumentEventListener {
    type: string;
    listener: (event: any) => void;
    options?: boolean | AddEventListenerOptions;
}

/**
 * The **`DocumentBase`** class is the concrete implementation of the Document interface.
 */
export class DocumentBase extends ParentNodeBase implements Document {
    // Event system
    private _eventListeners: DocumentEventListener[] = [];
    private _readyState: DocumentReadyState = 'uninitialized' as any;
    private _window: any = null; // Reference to window for load event
    // Properties
    readonly URL: string = 'about:blank';
    alinkColor: string = '';
    readonly all: any = null;
    readonly anchors: HTMLCollectionOf<any> = new HTMLCollectionOf([]);
    readonly applets: HTMLCollection = new HTMLCollection([]);
    bgColor: string = '';
    body: HTMLElement = null as any;
    readonly characterSet: string = 'UTF-8';
    readonly charset: string = 'UTF-8';
    readonly compatMode: string = 'CSS1Compat';
    readonly contentType: string = 'text/html';
    cookie: string = '';
    readonly currentScript: any = null;
    readonly defaultView: any = null;
    designMode: string = 'off';
    dir: string = '';
    readonly doctype: any = null;
    readonly documentElement: HTMLElement = null as any;
    readonly documentURI: string = 'about:blank';
    domain: string = '';
    readonly embeds: HTMLCollectionOf<any> = new HTMLCollectionOf([]);
    fgColor: string = '';
    readonly forms: HTMLCollectionOf<any> = new HTMLCollectionOf([]);
    readonly fragmentDirective: any = null;
    readonly fullscreen: boolean = false;
    readonly fullscreenEnabled: boolean = false;
    readonly head: any = null;
    readonly hidden: boolean = false;
    readonly images: HTMLCollectionOf<any> = new HTMLCollectionOf([]);
    readonly implementation: any = null;
    readonly inputEncoding: string = 'UTF-8';
    readonly lastModified: string = new Date().toString();
    linkColor: string = '';
    readonly links: HTMLCollectionOf<any> = new HTMLCollectionOf([]);
    
    // Location property - simple implementation for Document
    private _location: any = {
        href: 'about:blank',
        protocol: 'about:',
        host: '',
        hostname: '',
        port: '',
        pathname: 'blank',
        search: '',
        hash: '',
        origin: 'null',
        assign: (url: string) => { this._location.href = url; },
        replace: (url: string) => { this._location.href = url; },
        reload: () => {},
        toString: () => this._location.href
    };
    
    get location(): any {
        return this._location;
    }
    
    set location(href: string) {
        this._location.href = href;
        // Simple URL parsing for document location
        try {
            const url = new URL(href);
            this._location.protocol = url.protocol;
            this._location.host = url.host;
            this._location.hostname = url.hostname;
            this._location.port = url.port;
            this._location.pathname = url.pathname;
            this._location.search = url.search;
            this._location.hash = url.hash;
            this._location.origin = url.origin;
        } catch (e) {
            // Keep defaults for invalid URLs
        }
    }
    
    // Event handlers
    onfullscreenchange: ((this: Document, ev: Event) => any) | null = null;
    onfullscreenerror: ((this: Document, ev: Event) => any) | null = null;
    onpointerlockchange: ((this: Document, ev: Event) => any) | null = null;
    onpointerlockerror: ((this: Document, ev: Event) => any) | null = null;
    onreadystatechange: ((this: Document, ev: Event) => any) | null = null;
    onvisibilitychange: ((this: Document, ev: Event) => any) | null = null;
    
    get ownerDocument(): null {
        return null;
    }
    readonly pictureInPictureEnabled: boolean = false;
    readonly plugins: HTMLCollectionOf<any> = new HTMLCollectionOf([]);
    get readyState(): DocumentReadyState {
        return this._readyState;
    }
    readonly referrer: string = '';
    readonly rootElement: any = null;
    readonly scripts: HTMLCollectionOf<any> = new HTMLCollectionOf([]);
    readonly scrollingElement: Element | null = null;
    readonly timeline: any = null;
    get title(): string {
        const titleElement = this.querySelector('title');
        return titleElement ? titleElement.textContent || '' : '';
    }
    
    set title(value: string) {
        let titleElement = this.querySelector('title');
        if (!titleElement) {
            // Create title element if it doesn't exist
            titleElement = this.createElement('title');
            const head = this.head || this.querySelector('head');
            if (head) {
                head.appendChild(titleElement);
            }
        }
        titleElement.textContent = value;
    }
    readonly visibilityState: DocumentVisibilityState = 'visible';
    vlinkColor: string = '';

    constructor() {
        super(DOCUMENT_NODE, '#document');
        this._ownerDocument = null;

        // Create basic document structure
        const documentElement = this.createElement('html') as HTMLElement;
        const head = this.createElement('head') as HTMLElement;
        const body = this.createElement('body') as HTMLElement;

        documentElement.appendChild(head);
        documentElement.appendChild(body);
        this.appendChild(documentElement);

        // Set readonly properties
        (this as any).documentElement = documentElement;
        (this as any).head = head;
        this.body = body;
    }

    get textContent(): null {
        return null;
    }

    // Methods
    adoptNode<T extends Node>(node: T): T {
        (node as any)._ownerDocument = this;
        return node;
    }

    captureEvents(): void {}

    caretPositionFromPoint(_x: number, _y: number, _options?: CaretPositionFromPointOptions): any {
        return null;
    }

    caretRangeFromPoint(_x: number, _y: number): any {
        return null;
    }

    clear(): void {}

    close(): void {}

    createAttribute(localName: string): any {
        return { name: localName, value: '' };
    }

    createAttributeNS(_namespace: string | null, qualifiedName: string): any {
        return { name: qualifiedName, value: '' };
    }

    createCDATASection(data: string): any {
        return { data, nodeType: 4 };
    }

    createComment(data: string): Comment {
        return new Comment(data, this);
    }

    createDocumentFragment(): DocumentFragment {
        return new DocumentFragmentBase(this);
    }

    createElement<K extends keyof HTMLElementTagNameMap>(tagName: K, _options?: ElementCreationOptions): HTMLElementTagNameMap[K];
    createElement<K extends keyof HTMLElementDeprecatedTagNameMap>(tagName: K, _options?: ElementCreationOptions): HTMLElementDeprecatedTagNameMap[K];
    createElement(tagName: string, _options?: ElementCreationOptions): HTMLElement;
    createElement(tagName: string, _options?: ElementCreationOptions): HTMLElement {
        return ElementFactory.createElement(tagName, this);
    }

    createElementNS(namespaceURI: "http://www.w3.org/1999/xhtml", qualifiedName: string): HTMLElement;
    createElementNS<K extends keyof SVGElementTagNameMap>(namespaceURI: "http://www.w3.org/2000/svg", qualifiedName: K): SVGElementTagNameMap[K];
    createElementNS(namespaceURI: "http://www.w3.org/2000/svg", qualifiedName: string): any;
    createElementNS<K extends keyof MathMLElementTagNameMap>(namespaceURI: "http://www.w3.org/1998/Math/MathML", qualifiedName: K): MathMLElementTagNameMap[K];
    createElementNS(namespaceURI: "http://www.w3.org/1998/Math/MathML", qualifiedName: string): any;
    createElementNS(namespaceURI: string | null, qualifiedName: string, options?: ElementCreationOptions): Element;
    createElementNS(_namespace: string | null, qualifiedName: string, _options?: string | ElementCreationOptions): Element;
    createElementNS(_namespaceURI: string | null, qualifiedName: string, _options?: ElementCreationOptions | string): Element {
        return ElementFactory.createElement(qualifiedName, this);
    }

    createEvent(_eventInterface: string): any {
        return {};
    }

    createNodeIterator(root: Node, whatToShow: number = NodeFilter.SHOW_ALL, filter: NodeFilter | null = null): NodeIterator {
        return new NodeIterator(root, whatToShow, filter);
    }

    createProcessingInstruction(target: string, data: string): any {
        return { target, data, nodeType: 7 };
    }

    createRange(): any {
        return {};
    }

    createTextNode(data: string): Text {
        const { TextBase } = require('./TextBase');
        return new TextBase(data, this);
    }

    createTreeWalker(_root: Node, _whatToShow?: number, _filter?: any): any {
        return {};
    }

    execCommand(_commandId: string, _showUI?: boolean, _value?: string): boolean {
        return false;
    }

    exitFullscreen(): Promise<void> {
        return Promise.resolve();
    }

    exitPictureInPicture(): Promise<void> {
        return Promise.resolve();
    }

    exitPointerLock(): void {}

    getElementById(elementId: string): HTMLElement | null {
        const elements = this.querySelectorAll(`#${elementId}`);
        return elements.length > 0 ? elements[0] as HTMLElement : null;
    }

    getElementsByClassName(classNames: string): HTMLCollectionOf<Element> {
        const elements = this.querySelectorAll(`.${classNames.split(' ').join('.')}`);
        return new HTMLCollectionOf(Array.from(elements));
    }

    getElementsByName(elementName: string): NodeListOf<HTMLElement> {
        const elements = this.querySelectorAll(`[name="${elementName}"]`);
        return new NodeListOf(Array.from(elements) as HTMLElement[]);
    }

    getElementsByTagName<K extends keyof HTMLElementTagNameMap>(qualifiedName: K): HTMLCollectionOf<HTMLElementTagNameMap[K]>;
    getElementsByTagName<K extends keyof SVGElementTagNameMap>(qualifiedName: K): HTMLCollectionOf<SVGElementTagNameMap[K]>;
    getElementsByTagName<K extends keyof MathMLElementTagNameMap>(qualifiedName: K): HTMLCollectionOf<MathMLElementTagNameMap[K]>;
    getElementsByTagName<K extends keyof HTMLElementDeprecatedTagNameMap>(qualifiedName: K): HTMLCollectionOf<HTMLElementDeprecatedTagNameMap[K]>;
    getElementsByTagName(qualifiedName: string): HTMLCollectionOf<Element>;
    getElementsByTagName(qualifiedName: string): HTMLCollectionOf<Element> {
        const elements = this.querySelectorAll<Element>(qualifiedName);
        return new HTMLCollectionOf(Array.from(elements));
    }

    getElementsByTagNameNS(namespaceURI: "http://www.w3.org/1999/xhtml", localName: string): HTMLCollectionOf<HTMLElement>;
    getElementsByTagNameNS(namespaceURI: "http://www.w3.org/2000/svg", localName: string): HTMLCollectionOf<any>;
    getElementsByTagNameNS(namespaceURI: "http://www.w3.org/1998/Math/MathML", localName: string): HTMLCollectionOf<any>;
    getElementsByTagNameNS(_namespace: string | null, localName: string): HTMLCollectionOf<Element>;
    getElementsByTagNameNS(_namespace: string | null, localName: string): HTMLCollectionOf<Element> {
        return this.getElementsByTagName(localName);
    }

    getSelection(): any {
        return null;
    }

    hasFocus(): boolean {
        return false;
    }

    hasStorageAccess(): Promise<boolean> {
        return Promise.resolve(false);
    }

    importNode<T extends Node>(node: T, _options?: boolean | ImportNodeOptions): T {
        const cloned = (node as any).cloneNode(typeof _options === 'boolean' ? _options : _options?.deep);
        (cloned as any)._ownerDocument = this;
        return cloned;
    }

    open(_unused1?: string, _unused2?: string): Document;
    open(_url: string | URL, _name: string, _features: string): any;
    open(_arg1?: string | URL, _arg2?: string, _arg3?: string): Document | any {
        if (arguments.length <= 2) {
            return this;
        }
        return null;
    }

    queryCommandEnabled(_commandId: string): boolean {
        return false;
    }

    queryCommandIndeterm(_commandId: string): boolean {
        return false;
    }

    queryCommandState(_commandId: string): boolean {
        return false;
    }

    queryCommandSupported(_commandId: string): boolean {
        return false;
    }

    queryCommandValue(_commandId: string): string {
        return '';
    }

    releaseEvents(): void {}

    requestStorageAccess(): Promise<void> {
        return Promise.resolve();
    }

    startViewTransition(_callbackOptions?: ViewTransitionUpdateCallback | StartViewTransitionOptions): any {
        return {};
    }

    write(...text: string[]): void {
        console.log('Document.write:', text.join(''));
    }

    writeln(...text: string[]): void {
        this.write(...text, '\n');
    }

    addEventListener(type: string, listener: any, options?: boolean | any): void {
        // Support DOMContentLoaded and readystatechange events
        if (type === 'DOMContentLoaded' || type === 'readystatechange') {
            this._eventListeners.push({
                type,
                listener: typeof listener === 'function' ? listener : listener.handleEvent,
                options
            });
        }
    }

    removeEventListener(type: string, listener: any, options?: boolean | any): void {
        if (type === 'DOMContentLoaded' || type === 'readystatechange') {
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
                console.error('Error in document event listener:', error);
            }
        }
        
        return true;
    }

    /**
     * Set window reference for load event dispatching
     */
    setWindow(window: any): void {
        this._window = window;
    }

    /**
     * Change document ready state and dispatch events
     */
    setReadyState(state: DocumentReadyState): void {
        if (this._readyState === state) return;
        
        this._readyState = state;
        
        // Dispatch readystatechange event
        this.dispatchEvent({
            type: 'readystatechange',
            target: this,
            readyState: state
        });
        
        // Dispatch DOMContentLoaded when interactive
        if (state === 'interactive') {
            this.dispatchEvent({
                type: 'DOMContentLoaded',
                target: this
            });
        }
        
        // Dispatch load event on window when complete
        if (state === 'complete' && this._window) {
            // Use setTimeout to ensure it's dispatched after current execution
            setTimeout(() => {
                if (this._window && this._window.dispatchEvent) {
                    this._window.dispatchEvent({
                        type: 'load',
                        target: this._window
                    });
                }
            }, 0);
        }
    }

    /**
     * Simulate document loading process
     */
    simulateLoading(): void {
        // Start with loading state
        this.setReadyState('loading');
        
        // Simulate DOM parsing completion
        setTimeout(() => {
            this.setReadyState('interactive');
            
            // Simulate resource loading completion
            setTimeout(() => {
                this.setReadyState('complete');
            }, 10);
        }, 5);
    }
}