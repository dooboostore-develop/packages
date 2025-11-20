import { ElementBase } from './ElementBase';
import { HTMLElement, FocusOptions, CSSStyleDeclaration, DOMStringMap, ElementCSSInlineStyle, StylePropertyMap } from './HTMLElement';
import { Text } from '../Text';
import { ElementFactory } from '../../factory';

/**
 * Base implementation for all HTML elements
 */
export abstract class HTMLElementBase extends ElementBase implements HTMLElement, ElementCSSInlineStyle {
    private _title: string = '';
    private _lang: string = '';
    private _dir: string = '';
    private _hidden: boolean = false;
    private _tabIndex: number = -1;
    private _accessKey: string = '';
    private _contentEditable: string = 'inherit';
    private _innerText: string = '';
    private _outerText: string = '';

    constructor(tagName: string, ownerDocument?: any) {
        super(tagName, ownerDocument);
    }

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
        console.log(`Clicked on ${this.tagName} element`);
    }

    focus(options?: FocusOptions): void {
    }

    blur(): void {
        // Remove focus state
        this.removeAttribute('data-focused');
        console.log(`Blurred ${this.tagName} element`);
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

    get style(): CSSStyleDeclaration {
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
            this.style.cssText = value;
        }
    }

    private _attributeStyleMap: StylePropertyMap | null = null;

    get attributeStyleMap(): StylePropertyMap {
        if (!this._attributeStyleMap) {
            this._attributeStyleMap = new StylePropertyMapImpl(this);
        }
        return this._attributeStyleMap;
    }

    get dataset(): DOMStringMap {
        if (!this._dataset) {
            this._dataset = new Proxy({}, {
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
            });
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

    constructor(private element: HTMLElementBase) { }

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

// StylePropertyMap implementation
class StylePropertyMapImpl implements StylePropertyMap {
    [key: string]: any;

    constructor(private element: HTMLElementBase) { }

    set(property: string, ...values: (string | any)[]): void {
        const value = values[0];
        this.element.style.setProperty(property, String(value));
    }

    append(property: string, ...values: (string | any)[]): void {
        this.set(property, ...values);
    }

    delete(property: string): void {
        this.element.style.removeProperty(property);
    }

    clear(): void {
        this.element.style.cssText = '';
    }
}