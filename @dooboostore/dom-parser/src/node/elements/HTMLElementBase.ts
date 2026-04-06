import {ElementBase} from './ElementBase';
import {StylePropertyMapImpl} from "../collection/StylePropertyMapImpl";

// import { HTMLElement, FocusOptions, CSSStyleDeclaration, DOMStringMap, ElementCSSInlineStyle, StylePropertyMap } from './HTMLElement';

/**
 * Base implementation for all HTML elements
 */
// @ts-ignore
export abstract class HTMLElementBase extends ElementBase implements HTMLElement, ElementCSSInlineStyle {
  [key: string]: any;
  private _title: string = '';
  private _lang: string = '';
  private _dir: string = '';
  private _hidden: boolean = false;
  private _tabIndex: number = -1;
  private _accessKey: string = '';
  private _contentEditable: string = 'inherit';
  private _innerText: string = '';
  private _outerText: string = '';

  constructor(tagName: string = 'DIV', ownerDocument?: any) {
    const ctor = new.target as any;
    const resolvedTagName = tagName || ctor?.__domParserExtendsTagName || ctor?.__domParserTagName || 'DIV';
    super(resolvedTagName, ownerDocument);
  }
  // constructor(tagName?: string , ownerDocument?: any) {
  //   super(tagName, ownerDocument);
  //   console.log('vvvvvvvvv', tagName)
  // }

  accessKeyLabel: string;
    autocapitalize: string;
    autocorrect: boolean;
    draggable: boolean;
    inert: boolean;
    offsetHeight: number;
    offsetLeft: number;
    offsetParent: Element;
    offsetTop: number;
    offsetWidth: number;
    popover: string;
    spellcheck: boolean;
    translate: boolean;
    writingSuggestions: string;
    attachInternals(): ElementInternals {
        throw new Error("Method not implemented.");
    }
    hidePopover(): void {
        throw new Error("Method not implemented.");
    }
    showPopover(): void {
        throw new Error("Method not implemented.");
    }
    togglePopover(options?: boolean): boolean {
        throw new Error("Method not implemented.");
    }
    enterKeyHint: string;
    inputMode: string;
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
    autofocus: boolean;

  // HTMLElement interface implementation
  get title(): string {
    return this._title;
  }

  set title(value: string) {
    this._title = value;
    this.setAttribute('title', value);
  }

  get lang(): string {
    return this._lang;
  }

  set lang(value: string) {
    this._lang = value;
    this.setAttribute('lang', value);
  }

  get dir(): string {
    return this._dir;
  }

  set dir(value: string) {
    this._dir = value;
    this.setAttribute('dir', value);
  }

  get hidden(): boolean {
    return this._hidden;
  }

  set hidden(value: boolean) {
    this._hidden = value;
    if (value) {
      this.setAttribute('hidden', '');
    } else {
      this.removeAttribute('hidden');
    }
  }

  get tabIndex(): number {
    return this._tabIndex;
  }

  set tabIndex(value: number) {
    this._tabIndex = value;
    this.setAttribute('tabindex', value.toString());
  }

  get accessKey(): string {
    return this._accessKey;
  }

  set accessKey(value: string) {
    this._accessKey = value;
    this.setAttribute('accesskey', value);
  }

  get contentEditable(): string {
    return this._contentEditable;
  }

  set contentEditable(value: string) {
    this._contentEditable = value;
    this.setAttribute('contenteditable', value);
  }

  get isContentEditable(): boolean {
    return this._contentEditable === 'true';
  }

  get innerText(): string {
    return this._innerText || this.textContent || '';
  }

  set innerText(value: string) {
    this._innerText = value;
    this.textContent = value;
  }

  get outerText(): string {
    return this._outerText || this.innerText;
  }

  set outerText(value: string) {
    this._outerText = value;
    if (this.parentNode) {
      const { TextBase } = require('../TextBase');
      const textNode = new TextBase(value, this._ownerDocument);
      this.parentNode.replaceChild(textNode, this);
    }
  }

  // innerHTML functionality is inherited from ElementBase

  // HTMLElement methods
  click(): void {
    // Simulate click event - in a real implementation, this would dispatch events
    // console.log(`Clicked on ${this.tagName} element`);
  }

  focus(options?: FocusOptions): void {}

  blur(): void {
    // Remove focus state
    this.removeAttribute('data-focused');
    // console.log(`Blurred ${this.tagName} element`);
  }

  // Override setAttribute to sync with properties
  setAttribute(qualifiedName: string, value: string): void {
    super.setAttribute(qualifiedName, value);

    // Sync with properties
    const name = qualifiedName.toLowerCase();
    switch (name) {
      case 'title':
        this._title = value;
        break;
      case 'lang':
        this._lang = value;
        break;
      case 'dir':
        this._dir = value;
        break;
      case 'hidden':
        this._hidden = true;
        break;
      case 'tabindex':
        this._tabIndex = parseInt(value, 10) || -1;
        break;
      case 'accesskey':
        this._accessKey = value;
        break;
      case 'contenteditable':
        this._contentEditable = value;
        break;
    }
  }

  // Override removeAttribute to sync with properties
  removeAttribute(qualifiedName: string): void {
    super.removeAttribute(qualifiedName);

    const name = qualifiedName.toLowerCase();
    switch (name) {
      case 'title':
        this._title = '';
        break;
      case 'lang':
        this._lang = '';
        break;
      case 'dir':
        this._dir = '';
        break;
      case 'hidden':
        this._hidden = false;
        break;
      case 'tabindex':
        this._tabIndex = -1;
        break;
      case 'accesskey':
        this._accessKey = '';
        break;
      case 'contenteditable':
        this._contentEditable = 'inherit';
        break;
    }
  }

  // New implementations for style, dataset, nonce
  private _style: CSSStyleDeclaration | null = null;
  private _dataset: DOMStringMap | null = null;

  get style(): any {
    if (!this._style) {
      this._style = new Proxy(new CSSStyleDeclarationImpl(this), {
        get: (target, prop: string | symbol) => {
          if (typeof prop === 'string' && !(prop in target)) {
            // Convert camelCase to kebab-case for CSS properties
            const cssProp = prop.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
            return target.getPropertyValue(cssProp);
          }
          return (target as any)[prop];
        },
        set: (target, prop: string | symbol, value: any) => {
          if (typeof prop === 'string' && !(prop in target)) {
            // Convert camelCase to kebab-case for CSS properties
            const cssProp = prop.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
            target.setProperty(cssProp, String(value));
            return true;
          }
          (target as any)[prop] = value;
          return true;
        }
      }) as unknown as CSSStyleDeclaration;
    }
    return this._style;
  }

  set style(value: string | CSSStyleDeclaration) {
    if (typeof value === 'string') {
      (this.style as any).cssText = value;
    }
  }

  private _attributeStyleMap: StylePropertyMap | null = null;

  get attributeStyleMap(): any {
    if (!this._attributeStyleMap) {
      this._attributeStyleMap = new StylePropertyMapImpl(this) as unknown as StylePropertyMap;
    }
    return this._attributeStyleMap;
  }

  get dataset(): any {
    if (!this._dataset) {
      this._dataset = new Proxy(
        {},
        {
          get: (target, prop: string | symbol) => {
            if (typeof prop === 'string') {
              // Convert camelCase to kebab-case: fooBar -> data-foo-bar
              const attrName = 'data-' + prop.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
              return this.getAttribute(attrName);
            }
            return undefined;
          },
          set: (target, prop: string | symbol, value: any) => {
            if (typeof prop === 'string') {
              // Convert camelCase to kebab-case: fooBar -> data-foo-bar
              const attrName = 'data-' + prop.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
              this.setAttribute(attrName, String(value));
              return true;
            }
            return false;
          },
          deleteProperty: (target, prop: string | symbol) => {
            if (typeof prop === 'string') {
              const attrName = 'data-' + prop.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
              this.removeAttribute(attrName);
              return true;
            }
            return false;
          }
        }
      );
    }
    return this._dataset;
  }

  get nonce(): string {
    return this.getAttribute('nonce') || '';
  }

  set nonce(value: string) {
    this.setAttribute('nonce', value);
  }
}

// CSSStyleDeclaration implementation
class CSSStyleDeclarationImpl {
  [key: string]: any;

  constructor(private element: HTMLElementBase) {}

  parentRule: any = null;

  getPropertyPriority(property: string): string {
    return '';
  }

  get cssText(): string {
    return this.element.getAttribute('style') || '';
  }

  set cssText(value: string) {
    this.element.setAttribute('style', value);
  }

  get length(): number {
    return this.parseStyle(this.cssText).size;
  }

  getPropertyValue(property: string): string {
    const style = this.parseStyle(this.cssText);
    return style.get(property) || '';
  }

  setProperty(property: string, value: string | null, priority: string = ''): void {
    const style = this.parseStyle(this.cssText);
    if (value === null || value === '') {
      style.delete(property);
    } else {
      style.set(property, value); // TODO: handle priority
    }
    this.cssText = this.serializeStyle(style);
  }

  removeProperty(property: string): string {
    const style = this.parseStyle(this.cssText);
    const value = style.get(property) || '';
    style.delete(property);
    this.cssText = this.serializeStyle(style);
    return value;
  }

  item(index: number): string {
    const style = this.parseStyle(this.cssText);
    return Array.from(style.keys())[index] || '';
  }

  private parseStyle(cssText: string): Map<string, string> {
    const style = new Map<string, string>();
    if (!cssText) return style;

    cssText.split(';').forEach(declaration => {
      const part = declaration.trim();
      if (!part) return;

      const colonIndex = part.indexOf(':');
      if (colonIndex !== -1) {
        const property = part.substring(0, colonIndex).trim();
        const value = part.substring(colonIndex + 1).trim();
        if (property && value) {
          style.set(property, value);
        }
      }
    });
    return style;
  }

  private serializeStyle(style: Map<string, string>): string {
    return Array.from(style.entries())
      .map(([property, value]) => `${property}: ${value}`)
      .join('; ');
  }
}

