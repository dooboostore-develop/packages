import { ParentNodeBase } from './ParentNodeBase';
import {  DOCUMENT_NODE } from './Node';
import { HTMLCollectionOfImp } from './collection/HTMLCollectionOfImp';
import { NodeListOfImp } from './collection/NodeListOfImp';
import { ElementFactory } from '../factory/ElementFactory';

export class DocumentBase extends ParentNodeBase implements Document {
  [key: string]: any;
  private _readyState: DocumentReadyState = 'loading';
  private _window: any = null;
  public head!: any;
  public body!: any;
  public documentElement!: any;
  public location: any;
  get title(): string {
    const titleEl = this.querySelector('title');
    return titleEl ? titleEl.textContent || '' : this._title || '';
  }

  set title(value: string) {
    this._title = value;
    let titleEl = this.querySelector('title');
    if (!titleEl && this.head) {
      titleEl = this.createElement('title');
      this.head.appendChild(titleEl);
    }
    if (titleEl) {
      titleEl.textContent = value;
    }
  }

  private _title: string = '';
  public cookie: string = '';
  public designMode: string = 'off';
  public dir: string = 'ltr';
  public domain: string = '';
  public referrer: string = '';

  constructor() {
    super(DOCUMENT_NODE, '#document');
    this._ownerDocument = this as any;
  }

  get URL(): string {
    return this.location?.href || '';
  }
  get alinkColor(): string {
    return '';
  }
  set alinkColor(_: string) {}
  get all(): any {
    return [];
  }
  get anchors(): any {
    return [];
  }
  get applets(): any {
    return [];
  }
  get bgColor(): string {
    return '';
  }
  set bgColor(_: string) {}
  get characterSet(): string {
    return 'UTF-8';
  }
  get charset(): string {
    return 'UTF-8';
  }
  get compatMode(): string {
    return 'CSS1Compat';
  }
  get contentType(): string {
    return 'text/html';
  }
  get currentScript(): any {
    return null;
  }
  get defaultView(): any {
    return this._window;
  }
  get doctype(): any {
    return null;
  }
  get documentURI(): string {
    return this.URL;
  }
  get embeds(): any {
    return [];
  }
  get fgColor(): string {
    return '';
  }
  set fgColor(_: string) {}
  get forms(): any {
    return [];
  }
  get fragmentDirective(): any {
    return {};
  }
  get fullscreen(): boolean {
    return false;
  }
  get fullscreenEnabled(): boolean {
    return false;
  }
  get hidden(): boolean {
    return false;
  }
  get images(): any {
    return [];
  }
  get implementation(): any {
    return {};
  }
  get inputEncoding(): string {
    return 'UTF-8';
  }
  get lastModified(): string {
    return new Date().toISOString();
  }
  get linkColor(): string {
    return '';
  }
  set linkColor(_: string) {}
  get links(): any {
    return [];
  }
  get ownerDocument(): null {
    return null;
  }
  get pictureInPictureEnabled(): boolean {
    return false;
  }
  get plugins(): any {
    return [];
  }
  get readyState(): DocumentReadyState {
    return this._readyState;
  }
  get rootElement(): any {
    return null;
  }
  get scripts(): any {
    return [];
  }
  get scrollingElement(): any {
    return this.body;
  }
  get timeline(): any {
    return {};
  }
  get visibilityState(): any {
    return 'visible';
  }
  get vlinkColor(): string {
    return '';
  }
  set vlinkColor(_: string) {}
  get textContent(): null {
    return null;
  }

  adoptNode<T extends Node>(node: T): T {
    const nodeBase = node as any;
    if (nodeBase.nodeType === 9) { // DOCUMENT_NODE
      throw new Error('NotSupportedError: Cannot adopt document node');
    }
    
    if (nodeBase._parentNodeInternal) {
      nodeBase._parentNodeInternal.removeChild(nodeBase);
    }
    
    const oldDocument = nodeBase._ownerDocument;
    const newDocument = this;
    const documentChanged = oldDocument && newDocument && oldDocument !== newDocument;

    const updateDocument = (n: any) => {
      const prevDoc = n._ownerDocument;
      n._ownerDocument = newDocument;
      if (documentChanged && prevDoc && prevDoc !== newDocument && n.nodeType === 1 && typeof n.adoptedCallback === 'function') {
        n.adoptedCallback(prevDoc, newDocument);
      }
      for (const c of n._childNodesInternal || []) updateDocument(c);
    };
    updateDocument(nodeBase);
    
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
    return { name: localName, value: '', nodeType: 2 };
  }

  createAttributeNS(_ns: string | null, qualifiedName: string): any {
    return this.createAttribute(qualifiedName);
  }

  createCDATASection(data: string): any {
    return { data, nodeType: 4 };
  }

  createComment(data: string): any {
    const { Comment } = require('./Comment');
    return new Comment(data, this);
  }

  createDocumentFragment(): any {
    const { DocumentFragmentBase } = require('./DocumentFragmentBase');
    return new DocumentFragmentBase(this);
  }

  createElement<K extends keyof HTMLElementTagNameMap>(tagName: K, options?: ElementCreationOptions): HTMLElementTagNameMap[K];
  createElement(tagName: string, options?: ElementCreationOptions): HTMLElement;
  createElement(tagName: string, options?: ElementCreationOptions): HTMLElement {
    return ElementFactory.createElement(tagName, this, options) as any;
  }

  createElementNS(_ns: string | null, qualifiedName: string, options?: ElementCreationOptions): any {
    return this.createElement(qualifiedName as any, options);
  }

  createEvent(_eventInterface: string): any {
    return { type: _eventInterface };
  }

  createNodeIterator(root: Node, whatToShow: number = 0xffffffff, filter: any = null): any {
    const { NodeIterator } = require('./NodeIterator');
    return new NodeIterator(root, whatToShow, filter);
  }

  createProcessingInstruction(target: string, data: string): any {
    return { target, data, nodeType: 7 };
  }

  createRange(): any {
    return {};
  }

  createTextNode(data: string): any {
    const { TextBase } = require('./TextBase');
    return new TextBase(data, this);
  }

  createTreeWalker(root: Node, whatToShow: number = 0xffffffff, filter: any = null): any {
    const { TreeWalker } = require('./TreeWalker');
    return new TreeWalker(root, whatToShow, filter);
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
    return elements.length > 0 ? (elements[0] as HTMLElement) : null;
  }

  getElementsByClassName(classNames: string): HTMLCollectionOf<Element> {
    const elements = this.querySelectorAll(`.${classNames.split(' ').join('.')}`);
    return new HTMLCollectionOfImp(Array.from(elements)) as unknown as HTMLCollectionOf<Element>;
  }

  // @ts-ignore
  getElementsByName(elementName: string): NodeListOfImp<HTMLElement> {
    const elements = this.querySelectorAll(`[name="${elementName}"]`);
    return new NodeListOfImp<HTMLElement>(Array.from(elements) as unknown as HTMLElement[]) as unknown as NodeListOfImp<HTMLElement>;
  }

  // @ts-ignore
  getElementsByTagName<K extends keyof HTMLElementTagNameMap>(qualifiedName: K): HTMLCollectionOf<HTMLElementTagNameMap[K]>;
  getElementsByTagName(qualifiedName: string): HTMLCollectionOfImp<Element>;
  getElementsByTagName(qualifiedName: string): HTMLCollectionOfImp<Element> {
    const elements = this.querySelectorAll<Element>(qualifiedName);
    return new HTMLCollectionOfImp(Array.from(elements));
  }

  // @ts-ignore
  getElementsByTagNameNS(_ns: string | null, localName: string): HTMLCollectionOf<Element> {
    return this.getElementsByTagName(localName) as unknown as HTMLCollectionOf<Element>;
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
    const cloned = (node as any).cloneNode(typeof _options === 'boolean' ? _options : (_options as any)?.deep);
    
    // Recursively set _ownerDocument for the imported node
    const setOwnerDoc = (n: any) => {
      n._ownerDocument = this;
      for (const c of n._childNodesInternal || []) {
        setOwnerDoc(c);
      }
    };
    setOwnerDoc(cloned);
    
    return cloned;
  }

  open(_unused1?: string, _unused2?: string): any {
    return this;
  }

  queryCommandEnabled(_commandId: string): boolean {
    return false;
  }

  queryCommandSupported(_commandId: string): boolean {
    return false;
  }

  releaseEvents(): void {}

  requestStorageAccess(): Promise<void> {
    return Promise.resolve();
  }

  startViewTransition(_callbackOptions?: ViewTransitionUpdateCallback | StartViewTransitionOptions): any {
    return {};
  }

  write(...text: string[]): void {
    // console.log('Document.write:', text.join(''));
  }

  writeln(...text: string[]): void {
    this.write(...text, '\n');
  }

  addEventListener(type: string, listener: any, options?: any): void {
    this._eventListeners.push({ type, listener, options });
  }

  removeEventListener(type: string, listener: any, options?: any): void {
    this._eventListeners = this._eventListeners.filter(l => !(l.type === type && l.listener === listener));
  }

  setWindow(window: any): void {
    this._window = window;
  }

  setReadyState(state: DocumentReadyState): void {
    if (this._readyState === state) return;
    this._readyState = state;
    this.dispatchEvent({ type: 'readystatechange', target: this });
    if (state === 'interactive') {
      this.dispatchEvent({ type: 'DOMContentLoaded', target: this });
    }
    if (state === 'complete' && this._window) {
      setTimeout(() => {
        if (this._window && this._window.dispatchEvent) {
          this._window.dispatchEvent({ type: 'load', target: this._window });
        }
      }, 0);
    }
  }

  simulateLoading(): void {
    // Start with a small delay to allow test listeners to be added
    setTimeout(() => {
      this.setReadyState('interactive');
      setTimeout(() => {
        this.setReadyState('complete');
      }, 10);
    }, 10);
  }

  setLocation(location: any): void {
    this.location = location;
  }
}
