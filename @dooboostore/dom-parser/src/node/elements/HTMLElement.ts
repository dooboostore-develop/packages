import { Element } from './Element';

/**
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/ElementCSSInlineStyle)
 */
export interface ElementCSSInlineStyle {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/attributeStyleMap) */
    readonly attributeStyleMap: StylePropertyMap;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/style) */
    style: CSSStyleDeclaration | string;
}

export interface StylePropertyMap {
    append(property: string, ...values: (string | any)[]): void;
    clear(): void;
    delete(property: string): void;
    set(property: string, ...values: (string | any)[]): void;
    [key: string]: any;
}

/**
 * The **`HTMLElement`** interface represents any HTML element.
 * 
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement)
 */
export interface HTMLElement extends Element, ElementCSSInlineStyle {
    /**
     * Returns the value of element's title content attribute. Can be set to change it.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/title)
     */
    title: string;

    /**
     * Returns the value of element's lang content attribute. Can be set to change it.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/lang)
     */
    lang: string;

    /**
     * Returns the value of element's dir content attribute. Can be set to change it.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/dir)
     */
    dir: string;

    /**
     * Returns the value of element's hidden content attribute. Can be set to change it.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/hidden)
     */
    hidden: boolean;

    /**
     * Returns the value of element's tabindex content attribute. Can be set to change it.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/tabIndex)
     */
    tabIndex: number;

    /**
     * Returns the value of element's accesskey content attribute. Can be set to change it.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/accessKey)
     */
    accessKey: string;

    /**
     * Returns the value of element's contenteditable content attribute. Can be set to change it.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/contentEditable)
     */
    contentEditable: string;

    /**
     * Returns whether the element is editable.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/isContentEditable)
     */
    readonly isContentEditable: boolean;

    /**
     * Returns the element's inner text content.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/innerText)
     */
    innerText: string;

    /**
     * Returns the element's outer text content.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/outerText)
     */
    outerText: string;

    /**
     * Simulates a mouse click on an element.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/click)
     */
    click(): void;

    /**
     * Makes the element take focus.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/focus)
     */
    focus(options?: FocusOptions): void;

    /**
     * Makes the element lose focus.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/blur)
     */
    blur(): void;
}


// 기본 타입들
export interface FocusOptions {
    preventScroll?: boolean;
}

export interface CSSStyleDeclaration {
    cssText: string;
    length: number;
    parentRule: any;
    getPropertyPriority(property: string): string;
    getPropertyValue(property: string): string;
    item(index: number): string;
    removeProperty(property: string): string;
    setProperty(property: string, value: string | null, priority?: string): void;
    [index: number]: string;
    [key: string]: any;
}

export interface DOMStringMap {
    [key: string]: string | undefined;
}