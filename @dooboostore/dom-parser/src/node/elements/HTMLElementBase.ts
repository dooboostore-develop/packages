import { ElementBase } from './ElementBase';
import { HTMLElement, FocusOptions } from './HTMLElement';
import { Text } from '../Text';
import { ElementFactory } from '../../factory';

/**
 * Base implementation for all HTML elements
 */
export abstract class HTMLElementBase extends ElementBase implements HTMLElement {
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
        // Set focus state using data attribute
        this.setAttribute('data-focused', 'true');
        console.log(`Focused on ${this.tagName} element`);
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
}