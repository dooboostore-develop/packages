import { ParentNodeBase } from '../ParentNodeBase';
import { ChildNodeBase } from '../ChildNodeBase';
import { HTMLCollection } from "../collection";
import { Text } from "../Text";
import { ElementFactory } from "../../factory/ElementFactory";
import { Element, DOMTokenList, Attr, NamedNodeMap } from './Element';
import { ELEMENT_NODE, TEXT_NODE, ATTRIBUTE_NODE } from '../Node';
import { CSSSelector } from '../../utils/CSSSelector';
import { HTMLElementTagNameMap } from "./index";
import { NodeBase } from '../NodeBase';

// InsertPosition type for insertAdjacent methods
type InsertPosition = 'beforebegin' | 'afterbegin' | 'beforeend' | 'afterend';

// Simple DOMException class for error handling
class DOMException extends Error {
    constructor(message: string, public name: string = 'DOMException') {
        super(message);
        this.name = name;
    }
}
/**
 * Base implementation of the Element interface
 */
export abstract class ElementBase extends ParentNodeBase implements Element {
    private _id: string = '';
    private _className: string = '';
    private _attributes: Map<string, string> = new Map();

    constructor(
        public _tagName: string,
        ownerDocument?: any
    ) {
        super(ELEMENT_NODE, _tagName.toUpperCase(), ownerDocument);
    }

    get tagName(): string {
        return this._tagName.toUpperCase();
    }

    get localName(): string {
        return this._tagName.toLowerCase();
    }

    // Element interface implementation
    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
        this._attributes.set('id', value);
    }

    get className(): string {
        return this._className;
    }

    set className(value: string) {
        this._className = value;
        this._attributes.set('class', value);
    }

    get classList(): DOMTokenList {
        return new DOMTokenListImpl(this);
    }

    get innerHTML(): string {
        // Generate innerHTML from actual child nodes
        let html = '';
        for (const child of this._childNodesInternal) {
            if (child.nodeType === TEXT_NODE) {
                // For text nodes, use the escaped content stored in _nodeValue
                html += (child as any)._nodeValue || '';
            } else if (child.nodeType === ELEMENT_NODE) {
                // Generate outerHTML directly to avoid circular dependency
                html += this.generateChildElementHTML(child as any);
            } else if (child.nodeType === 8) { // COMMENT_NODE
                html += `<!--${(child as any).textContent || ''}-->`;
            }
        }
        return html;
    }

    get innerText(): string {
        // innerText should return the decoded text content
        return this.textContent || '';
    }

    set innerText(value: string | null) {
        // Clear all children and add escaped text content
        this._childNodesInternal = [];
        if (value !== null && value !== undefined) {
            const stringValue = String(value);
            const escapedValue = this.escapeHTMLEntities(stringValue);
            // Create text node with escaped content
            const { TextBase } = require('../TextBase');
            const textNode = new TextBase(escapedValue, this._ownerDocument);
            this._childNodesInternal.push(textNode);
            textNode._parentNodeInternal = this;
        }
    }

    set innerHTML(value: string) {
        // Clear existing children
        while (this._childNodesInternal.length > 0) {
            const child = this._childNodesInternal[0];
            if (child) {
                this.removeChild(child);
            }
        }

        // Parse HTML and create child nodes
        if (value.trim()) {
            this.parseAndAppendHTML(value);
        }
    }

    /**
     * Generate HTML for a child element without using outerHTML to avoid circular dependency
     */
    private generateChildElementHTML(element: any): string {
        const tagName = element.tagName.toLowerCase();
        
        // Get attributes
        const attrs = Array.from(element._attributes?.entries() || [])
            .map(([name, value]: [string, string]) => value === '' ? ` ${name}` : ` ${name}="${value.replace(/"/g, '&quot;')}"`)
            .join('');

        // Check if it's a self-closing tag
        const selfClosingTags = ['img', 'input', 'br', 'hr', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr'];
        const isSelfClosing = selfClosingTags.includes(tagName);

        if (isSelfClosing) {
            return `<${tagName}${attrs} />`;
        } else {
            // Generate innerHTML directly without calling element.innerHTML to avoid recursion
            let childHTML = '';
            for (const child of element._childNodesInternal || []) {
                if (child.nodeType === TEXT_NODE) {
                    childHTML += (child as any)._nodeValue || '';
                } else if (child.nodeType === ELEMENT_NODE) {
                    childHTML += this.generateChildElementHTML(child as any);
                } else if (child.nodeType === 8) { // COMMENT_NODE
                    childHTML += `<!--${(child as any).textContent || ''}-->`;
                }
            }
            return `<${tagName}${attrs}>${childHTML}</${tagName}>`;
        }
    }

    /**
     * Improved HTML parser for innerHTML using a stack-based approach
     */
    private parseAndAppendHTML(html: string): void {
        const ElementFactory = require('../../factory/ElementFactory').ElementFactory;
        
        let i = 0;
        const length = html.length;
        
        while (i < length) {
            const nextTagStart = html.indexOf('<', i);
            
            // Handle text content before next tag
            if (nextTagStart === -1) {
                // No more tags, rest is text
                let text = html.substring(i).trim();
                if (text) {
                    // Fix broken closing tags (e.g., "/div>" -> "</div>")
                    text = this.fixBrokenClosingTags(text);
                    const { TextBase } = require('../TextBase');
                    const textNode = new TextBase(text, this._ownerDocument);
                    this.appendChild(textNode);
                }
                break;
            } else if (nextTagStart > i) {
                // Text content before the tag
                let text = html.substring(i, nextTagStart).trim();
                if (text) {
                    // Fix broken closing tags (e.g., "/div>" -> "</div>")
                    text = this.fixBrokenClosingTags(text);
                    const { TextBase } = require('../TextBase');
                    const textNode = new TextBase(text, this._ownerDocument);
                    this.appendChild(textNode);
                }
            }
            
            i = nextTagStart;
            
            // Parse the tag - find the real tag end, considering quoted attributes
            const tagEnd = this.findTagEnd(html, i);
            if (tagEnd === -1) break;
            
            const tagContent = html.substring(i + 1, tagEnd);
            
            // Handle comments
            if (tagContent.startsWith('!--')) {
                const commentEnd = html.indexOf('-->', i);
                if (commentEnd !== -1) {
                    const commentContent = html.substring(i + 4, commentEnd);
                    const { Comment } = require('../Comment');
                    const commentNode = new Comment(commentContent, this._ownerDocument);
                    this.appendChild(commentNode);
                    i = commentEnd + 3;
                    continue;
                }
            }
            
            // Handle self-closing tags
            if (tagContent.endsWith('/')) {
                const parts = tagContent.slice(0, -1).trim().split(/\s+/);
                const tagName = parts[0];
                const attributeString = tagContent.slice(tagName.length, -1).trim();
                
                const element = ElementFactory.createElement(tagName, this._ownerDocument);
                this.parseAttributes(element, attributeString);
                this.appendChild(element);
                i = tagEnd + 1;
                continue;
            }
            
            // Handle closing tags - if they don't have matching opening tags, treat as text
            if (tagContent.startsWith('/')) {
                // For now, treat unmatched closing tags as text content
                const closingTagText = `<${tagContent}>`;
                const { TextBase } = require('../TextBase');
                const textNode = new TextBase(closingTagText, this._ownerDocument);
                this.appendChild(textNode);
                i = tagEnd + 1;
                continue;
            }
            
            // Handle opening tags
            const parts = tagContent.split(/\s+/);
            const tagName = parts[0];
            const attributeString = tagContent.slice(tagName.length).trim();
            
            // Special handling for style and script tags
            if (tagName === 'style' || tagName === 'script') {
                const closingTag = `</${tagName}>`;
                const closingTagIndex = html.indexOf(closingTag, tagEnd + 1);
                
                if (closingTagIndex !== -1) {
                    const element = ElementFactory.createElement(tagName, this._ownerDocument);
                    this.parseAttributes(element, attributeString);
                    
                    const content = html.substring(tagEnd + 1, closingTagIndex);
                    if (content) {
                        const { TextBase } = require('../TextBase');
                        const textNode = new TextBase(content, this._ownerDocument);
                        element.appendChild(textNode);
                    }
                    
                    this.appendChild(element);
                    i = closingTagIndex + closingTag.length;
                    continue;
                }
            }
            
            // Handle regular opening tags with content
            const closingTag = `</${tagName}>`;
            const closingTagIndex = this.findMatchingClosingTag(html, tagName, tagEnd + 1);
            
            if (closingTagIndex !== -1) {
                const element = ElementFactory.createElement(tagName, this._ownerDocument);
                this.parseAttributes(element, attributeString);
                
                const content = html.substring(tagEnd + 1, closingTagIndex);
                if (content.trim()) {
                    element.innerHTML = content;
                }
                
                this.appendChild(element);
                i = closingTagIndex + closingTag.length;
            } else {
                // No matching closing tag found, treat as self-closing
                const element = ElementFactory.createElement(tagName, this._ownerDocument);
                this.parseAttributes(element, attributeString);
                this.appendChild(element);
                i = tagEnd + 1;
            }
        }
    }
    
    /**
     * Find the real end of a tag, considering quoted attributes
     */
    private findTagEnd(html: string, startIndex: number): number {
        let i = startIndex + 1; // Skip the '<'
        let inQuotes = false;
        let quoteChar = '';
        
        while (i < html.length) {
            const char = html[i];
            
            if (!inQuotes) {
                if (char === '"' || char === "'") {
                    inQuotes = true;
                    quoteChar = char;
                } else if (char === '>') {
                    return i;
                }
            } else {
                if (char === quoteChar) {
                    inQuotes = false;
                    quoteChar = '';
                }
            }
            
            i++;
        }
        
        return -1; // No closing '>' found
    }

    /**
     * Fix broken closing tags in text content
     * Converts patterns like "/div>" to "</div>"
     */
    private fixBrokenClosingTags(text: string): string {
        // Pattern to match broken closing tags: /tagname>
        return text.replace(/\/(\w+)>/g, '</$1>');
    }

    /**
     * Find the matching closing tag, accounting for nested tags of the same type
     */
    private findMatchingClosingTag(html: string, tagName: string, startIndex: number): number {
        const openTag = `<${tagName}`;
        const closeTag = `</${tagName}>`;
        let depth = 1;
        let i = startIndex;
        
        while (i < html.length && depth > 0) {
            const nextOpen = html.indexOf(openTag, i);
            const nextClose = html.indexOf(closeTag, i);
            
            if (nextClose === -1) {
                return -1; // No closing tag found
            }
            
            if (nextOpen !== -1 && nextOpen < nextClose) {
                // Found another opening tag before the closing tag
                // Make sure it's a complete tag (not just a substring)
                const afterTag = html.charAt(nextOpen + openTag.length);
                if (afterTag === ' ' || afterTag === '>' || afterTag === '/') {
                    depth++;
                }
                i = nextOpen + openTag.length;
            } else {
                // Found a closing tag
                depth--;
                if (depth === 0) {
                    return nextClose;
                }
                i = nextClose + closeTag.length;
            }
        }
        
        return -1;
    }

    /**
     * Parse attributes from attribute string
     */
    private parseAttributes(element: any, attributeString: string): void {
        // Improved attribute parsing that handles complex JavaScript expressions
        let position = 0;
        const length = attributeString.length;

        while (position < length) {
            // Skip whitespace
            while (position < length && /\s/.test(attributeString[position])) {
                position++;
            }

            if (position >= length) break;

            // Find attribute name
            const nameStart = position;
            while (position < length && /[\w:-]/.test(attributeString[position])) {
                position++;
            }

            if (position === nameStart) {
                // Invalid character, skip it
                position++;
                continue;
            }

            const name = attributeString.substring(nameStart, position);

            // Skip whitespace
            while (position < length && /\s/.test(attributeString[position])) {
                position++;
            }

            let value = '';

            // Check if there's an equals sign
            if (position < length && attributeString[position] === '=') {
                position++; // Skip '='

                // Skip whitespace
                while (position < length && /\s/.test(attributeString[position])) {
                    position++;
                }

                if (position < length) {
                    const quote = attributeString[position];
                    
                    if (quote === '"' || quote === "'") {
                        // Quoted value - find matching closing quote
                        position++; // Skip opening quote
                        const valueStart = position;
                        
                        while (position < length && attributeString[position] !== quote) {
                            position++;
                        }
                        
                        value = attributeString.substring(valueStart, position);
                        
                        if (position < length && attributeString[position] === quote) {
                            position++; // Skip closing quote
                        }
                    } else {
                        // Unquoted value - read until whitespace or end
                        const valueStart = position;
                        while (position < length && !/\s/.test(attributeString[position])) {
                            position++;
                        }
                        value = attributeString.substring(valueStart, position);
                    }
                }
            }

            // Decode HTML entities in attribute values
            value = this.decodeHTMLEntities(value);
            
            element.setAttribute(name, value);
        }
    }

    /**
     * Escape HTML entities in a string to prevent XSS
     */
    protected escapeHTMLEntities(str: string): string {
        const entityMap: { [key: string]: string } = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };

        return str.replace(/[&<>"']/g, (char) => {
            return entityMap[char] || char;
        });
    }

    /**
     * Decode HTML entities in a string
     */
    protected decodeHTMLEntities(str: string): string {
        const entityMap: { [key: string]: string } = {
            '&amp;': '&',
            '&lt;': '<',
            '&gt;': '>',
            '&quot;': '"',
            '&#39;': "'",
            '&#34;': '"',
            '&apos;': "'",
            '&copy;': '©',
            '&reg;': '®',
            '&trade;': '™',
            '&nbsp;': ' ',
            '&hellip;': '…',
            '&mdash;': '—',
            '&ndash;': '–',
            '&lsquo;': '\u2018',
            '&rsquo;': '\u2019',
            '&ldquo;': '"',
            '&rdquo;': '"'
        };

        return str.replace(/&[a-zA-Z0-9#]+;/g, (entity) => {
            // Handle named entities
            if (entityMap[entity]) {
                return entityMap[entity];
            }
            
            // Handle numeric entities like &#39; &#34;
            if (entity.startsWith('&#') && entity.endsWith(';')) {
                const numStr = entity.slice(2, -1);
                const num = parseInt(numStr, 10);
                if (!isNaN(num)) {
                    return String.fromCharCode(num);
                }
            }
            
            // Handle hex entities like &#x27;
            if (entity.startsWith('&#x') && entity.endsWith(';')) {
                const hexStr = entity.slice(3, -1);
                const num = parseInt(hexStr, 16);
                if (!isNaN(num)) {
                    return String.fromCharCode(num);
                }
            }
            
            // Return original if not recognized
            return entity;
        });
    }

    get outerHTML(): string {
        const attrs = Array.from(this._attributes.entries())
            .map(([name, value]) => value === '' ? ` ${name}` : ` ${name}="${value.replace(/"/g, '&quot;')}"`)
            .join('');

        // Check if it's a self-closing tag
        const selfClosingTags = ['img', 'input', 'br', 'hr', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr'];
        const isSelfClosing = selfClosingTags.includes(this.tagName.toLowerCase());

        if (isSelfClosing) {
            return `<${this.tagName.toLowerCase()}${attrs} />`;
        } else {
            return `<${this.tagName.toLowerCase()}${attrs}>${this.innerHTML}</${this.tagName.toLowerCase()}>`;
        }
    }

    get namespaceURI(): string | null {
        return 'http://www.w3.org/1999/xhtml';
    }

    get prefix(): string | null {
        return null;
    }

    // Attribute methods
    getAttribute(qualifiedName: string): string | null {
        const value = this._attributes.get(qualifiedName.toLowerCase());
        return value !== undefined ? value : null;
    }

    setAttribute(qualifiedName: string, value: string): void {
        const name = qualifiedName.toLowerCase();
        this._attributes.set(name, value);

        // Update special properties
        if (name === 'id') {
            this._id = value;
        } else if (name === 'class') {
            this._className = value;
        }
    }

    removeAttribute(qualifiedName: string): void {
        const name = qualifiedName.toLowerCase();
        this._attributes.delete(name);

        // Update special properties
        if (name === 'id') {
            this._id = '';
        } else if (name === 'class') {
            this._className = '';
        }
    }

    hasAttribute(qualifiedName: string): boolean {
        return this._attributes.has(qualifiedName.toLowerCase());
    }

    /**
     * Returns the closest ancestor element (including the element itself) that matches the specified CSS selector.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/closest)
     */
    closest<K extends keyof HTMLElementTagNameMap>(selector: K): HTMLElementTagNameMap[K] | null;
    closest<K extends keyof SVGElementTagNameMap>(selector: K): SVGElementTagNameMap[K] | null;
    closest<K extends keyof MathMLElementTagNameMap>(selector: K): MathMLElementTagNameMap[K] | null;
    closest<E extends Element = Element>(selectors: string): E | null;
    closest(selectors: string): Element | null {
        let element: Element | null = this as any;

        while (element) {
            if (element.matches && element.matches(selectors)) {
                return element;
            }
            element = element.parentElement;
        }

        return null;
    }

    /**
     * Returns true if the element would be selected by the specified CSS selector; otherwise, returns false.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/matches)
     */
    matches(selectors: string): boolean {
        return CSSSelector.matches(this as any, selectors);
    }

    // ChildNode methods are inherited from ParentNodeBase -> ChildNodeBase

    // Additional Element properties and methods - Not implemented yet

    get attributes(): NamedNodeMap {
        return new NamedNodeMapImpl(this._attributes);
    }

    get clientHeight(): number {
        throw new Error('Element.clientHeight is not implemented yet');
    }

    get clientLeft(): number {
        throw new Error('Element.clientLeft is not implemented yet');
    }

    get clientTop(): number {
        throw new Error('Element.clientTop is not implemented yet');
    }

    get clientWidth(): number {
        throw new Error('Element.clientWidth is not implemented yet');
    }

    get currentCSSZoom(): number {
        throw new Error('Element.currentCSSZoom is not implemented yet');
    }

    onfullscreenchange: ((this: Element, ev: Event) => any) | null = null;
    onfullscreenerror: ((this: Element, ev: Event) => any) | null = null;

    get part(): any {
        throw new Error('Element.part is not implemented yet');
    }

    get scrollHeight(): number {
        throw new Error('Element.scrollHeight is not implemented yet');
    }

    get scrollLeft(): number {
        throw new Error('Element.scrollLeft is not implemented yet');
    }

    set scrollLeft(value: number) {
        throw new Error('Element.scrollLeft setter is not implemented yet');
    }

    get scrollTop(): number {
        throw new Error('Element.scrollTop is not implemented yet');
    }

    set scrollTop(value: number) {
        throw new Error('Element.scrollTop setter is not implemented yet');
    }

    get scrollWidth(): number {
        throw new Error('Element.scrollWidth is not implemented yet');
    }

    get shadowRoot(): any {
        throw new Error('Element.shadowRoot is not implemented yet');
    }

    get slot(): string {
        throw new Error('Element.slot is not implemented yet');
    }

    set slot(value: string) {
        throw new Error('Element.slot setter is not implemented yet');
    }

    // Methods - Not implemented yet

    attachShadow(init: any): any {
        throw new Error('Element.attachShadow() is not implemented yet');
    }

    checkVisibility(options?: any): boolean {
        throw new Error('Element.checkVisibility() is not implemented yet');
    }

    computedStyleMap(): any {
        throw new Error('Element.computedStyleMap() is not implemented yet');
    }

    getAttributeNS(namespace: string | null, localName: string): string | null {
        // For simplicity, we'll ignore namespace and use localName
        return this.getAttribute(localName);
    }

    getAttributeNames(): string[] {
        return Array.from(this._attributes.keys());
    }

    getAttributeNode(qualifiedName: string): Attr | null {
        const value = this.getAttribute(qualifiedName);
        if (value !== null) {
            return new AttrImpl(qualifiedName, value);
        }
        return null;
    }

    getAttributeNodeNS(namespace: string | null, localName: string): Attr | null {
        // For simplicity, we'll ignore namespace and use localName
        return this.getAttributeNode(localName);
    }

    getBoundingClientRect(): any {
        throw new Error('Element.getBoundingClientRect() is not implemented yet');
    }

    getClientRects(): any {
        throw new Error('Element.getClientRects() is not implemented yet');
    }

    getElementsByClassName(classNames: string): HTMLCollection {
        const result: Element[] = [];
        const classNameList = classNames.trim().split(/\s+/);

        // Helper function to check if element has all specified classes
        const hasAllClasses = (element: Element, classes: string[]): boolean => {
            const elementClasses = element.className.trim().split(/\s+/);
            return classes.every(cls => elementClasses.includes(cls));
        };

        // Recursive function to traverse all descendants
        const traverse = (node: any) => {
            if (node.nodeType === ELEMENT_NODE) {
                const element = node as Element;
                if (hasAllClasses(element, classNameList)) {
                    result.push(element);
                }
            }

            // Traverse children
            for (let i = 0; i < node.childNodes.length; i++) {
                traverse(node.childNodes[i]);
            }
        };

        // Start traversal from this element's children
        for (let i = 0; i < this.childNodes.length; i++) {
            traverse(this.childNodes[i]);
        }

        return new HTMLCollection(result);
    }

    getElementsByTagName(qualifiedName: string): HTMLCollection {
        const result: Element[] = [];
        const tagName = qualifiedName.toLowerCase();
        const isWildcard = tagName === '*';

        // Recursive function to traverse all descendants
        const traverse = (node: any) => {
            if (node.nodeType === ELEMENT_NODE) {
                const element = node as Element;
                if (isWildcard || element.localName === tagName) {
                    result.push(element);
                }
            }

            // Traverse children
            for (let i = 0; i < node.childNodes.length; i++) {
                traverse(node.childNodes[i]);
            }
        };

        // Start traversal from this element's children
        for (let i = 0; i < this.childNodes.length; i++) {
            traverse(this.childNodes[i]);
        }

        return new HTMLCollection(result);
    }

    getElementsByTagNameNS(namespace: string | null, localName: string): any {
        // For simplicity, we'll implement this similar to getElementsByTagName
        // In a full implementation, namespace handling would be more complex
        return this.getElementsByTagName(localName);
    }

    getHTML(options?: any): string {
        throw new Error('Element.getHTML() is not implemented yet');
    }

    hasAttributeNS(namespace: string | null, localName: string): boolean {
        // For simplicity, we'll ignore namespace and use localName
        return this.hasAttribute(localName);
    }

    hasAttributes(): boolean {
        return this._attributes.size > 0;
    }

    hasPointerCapture(pointerId: number): boolean {
        throw new Error('Element.hasPointerCapture() is not implemented yet');
    }

    insertAdjacentElement(where: InsertPosition, element: Element): Element | null {
        const position = where.toLowerCase();

        switch (position) {
            case 'beforebegin':
                // Insert before this element
                if (this.parentNode) {
                    this.parentNode.insertBefore(element as any, this as any);
                    return element;
                }
                return null;

            case 'afterbegin':
                // Insert as first child of this element
                if (this.firstChild) {
                    this.insertBefore(element as any, this.firstChild);
                } else {
                    this.appendChild(element as any);
                }
                return element;

            case 'beforeend':
                // Insert as last child of this element
                this.appendChild(element as any);
                return element;

            case 'afterend':
                // Insert after this element
                if (this.parentNode) {
                    if (this.nextSibling) {
                        this.parentNode.insertBefore(element as any, this.nextSibling);
                    } else {
                        this.parentNode.appendChild(element as any);
                    }
                    return element;
                }
                return null;

            default:
                throw new DOMException(`Invalid position: ${where}`, 'SyntaxError');
        }
    }

    insertAdjacentHTML(position: InsertPosition, html: string): void {
        const pos = position.toLowerCase();

        // Parse HTML string into elements
        const tempDiv = this._ownerDocument.createElement('div');
        tempDiv.innerHTML = html;

        // Move all parsed nodes to the target position
        const fragment = this._ownerDocument.createDocumentFragment();
        while (tempDiv.firstChild) {
            fragment.appendChild(tempDiv.firstChild);
        }

        switch (pos) {
            case 'beforebegin':
                if (this.parentNode) {
                    this.parentNode.insertBefore(fragment, this as any);
                }
                break;

            case 'afterbegin':
                if (this.firstChild) {
                    this.insertBefore(fragment, this.firstChild);
                } else {
                    this.appendChild(fragment);
                }
                break;

            case 'beforeend':
                this.appendChild(fragment);
                break;

            case 'afterend':
                if (this.parentNode) {
                    if (this.nextSibling) {
                        this.parentNode.insertBefore(fragment, this.nextSibling);
                    } else {
                        this.parentNode.appendChild(fragment);
                    }
                }
                break;

            default:
                throw new DOMException(`Invalid position: ${position}`, 'SyntaxError');
        }
    }

    insertAdjacentText(where: InsertPosition, data: string): void {
        const position = where.toLowerCase();

        // Create text node
        const textNode = this._ownerDocument.createTextNode(data);

        switch (position) {
            case 'beforebegin':
                if (this.parentNode) {
                    this.parentNode.insertBefore(textNode, this as any);
                }
                break;

            case 'afterbegin':
                if (this.firstChild) {
                    this.insertBefore(textNode, this.firstChild);
                } else {
                    this.appendChild(textNode);
                }
                break;

            case 'beforeend':
                this.appendChild(textNode);
                break;

            case 'afterend':
                if (this.parentNode) {
                    if (this.nextSibling) {
                        this.parentNode.insertBefore(textNode, this.nextSibling);
                    } else {
                        this.parentNode.appendChild(textNode);
                    }
                }
                break;

            default:
                throw new DOMException(`Invalid position: ${where}`, 'SyntaxError');
        }
    }

    releasePointerCapture(pointerId: number): void {
        // throw new Error('Element.releasePointerCapture() is not implemented yet');
    }

    removeAttributeNS(namespace: string | null, localName: string): void {
        // For simplicity, we'll ignore namespace and use localName
        this.removeAttribute(localName);
    }

    removeAttributeNode(attr: Attr): Attr {
        const oldValue = this.getAttribute(attr.name);
        if (oldValue !== null) {
            this.removeAttribute(attr.name);
            return new AttrImpl(attr.name, oldValue);
        }
        throw new DOMException('The attribute node is not an attribute of this element', 'NotFoundError');
    }

    requestFullscreen(options?: any): Promise<void> {
        throw new Error('Element.requestFullscreen() is not implemented yet');
    }

    requestPointerLock(options?: any): Promise<void> {
        throw new Error('Element.requestPointerLock() is not implemented yet');
    }

    scroll(options?: any): void;
    scroll(x: number, y: number): void;
    scroll(optionsOrX?: any, y?: number): void {
        // throw new Error('Element.scroll() is not implemented yet');
    }

    scrollBy(options?: any): void;
    scrollBy(x: number, y: number): void;
    scrollBy(optionsOrX?: any, y?: number): void {
        // throw new Error('Element.scrollBy() is not implemented yet');
    }

    scrollIntoView(arg?: boolean | any): void {
        // throw new Error('Element.scrollIntoView() is not implemented yet');
    }

    scrollTo(options?: any): void;
    scrollTo(x: number, y: number): void;
    scrollTo(optionsOrX?: any, y?: number): void {
        // throw new Error('Element.scrollTo() is not implemented yet');
    }

    setAttributeNS(namespace: string | null, qualifiedName: string, value: string): void {
        // For simplicity, we'll ignore namespace and use qualifiedName
        this.setAttribute(qualifiedName, value);
    }

    setAttributeNode(attr: Attr): Attr | null {
        const oldAttr = this.getAttributeNode(attr.name);
        this.setAttribute(attr.name, attr.value);
        return oldAttr;
    }

    setAttributeNodeNS(attr: Attr): Attr | null {
        // For simplicity, we'll ignore namespace
        return this.setAttributeNode(attr);
    }

    setHTMLUnsafe(html: string): void {
        // throw new Error('Element.setHTMLUnsafe() is not implemented yet');
    }

    setPointerCapture(pointerId: number): void {
        // throw new Error('Element.setPointerCapture() is not implemented yet');
    }

    toggleAttribute(qualifiedName: string, force?: boolean): boolean {
        const hasAttr = this.hasAttribute(qualifiedName);

        if (force === true || (force === undefined && !hasAttr)) {
            this.setAttribute(qualifiedName, '');
            return true;
        } else if (force === false || (force === undefined && hasAttr)) {
            this.removeAttribute(qualifiedName);
            return false;
        }

        return hasAttr;
    }

    webkitMatchesSelector(selectors: string): boolean {
        // throw new Error('Element.webkitMatchesSelector() is not implemented yet');
        return false;
    }

    // EventTarget methods - Not implemented yet
    addEventListener(type: string, listener: any, options?: any): void {
        // throw new Error('Element.addEventListener() is not implemented yet');
    }

    removeEventListener(type: string, listener: any, options?: any): void {
        // throw new Error('Element.removeEventListener() is not implemented yet');
    }

    dispatchEvent(event: any): boolean {
        // throw new Error('Element.dispatchEvent() is not implemented yet');
        return true;
    }

    cloneNode(deep?: boolean): ElementBase {
        // Use ElementFactory to create the correct element type
        const clone = ElementFactory.createElement(this.tagName, this._ownerDocument);

        // Copy attributes
        for (const [name, value] of this._attributes) {
            clone.setAttribute(name, value);
        }

        // Copy children if deep clone
        if (deep) {
            for (const child of this._childNodesInternal) {
                if (child && 'cloneNode' in child) {
                    clone.appendChild((child as any).cloneNode(true));
                }
            }
        }

        return clone;
    }
}

// DOMTokenList implementation
class DOMTokenListImpl implements DOMTokenList {
    constructor(private element: ElementBase) { }

    get length(): number {
        return this.element.className.split(/\s+/).filter(c => c.length > 0).length;
    }

    get value(): string {
        return this.element.className;
    }

    set value(value: string) {
        this.element.className = value;
    }

    add(...tokens: string[]): void {
        const classes = new Set(this.element.className.split(/\s+/).filter(c => c.length > 0));
        for (const token of tokens) {
            classes.add(token);
        }
        this.element.className = Array.from(classes).join(' ');
    }

    remove(...tokens: string[]): void {
        const classes = new Set(this.element.className.split(/\s+/).filter(c => c.length > 0));
        for (const token of tokens) {
            classes.delete(token);
        }
        this.element.className = Array.from(classes).join(' ');
    }

    contains(token: string): boolean {
        return this.element.className.split(/\s+/).includes(token);
    }

    toggle(token: string, force?: boolean): boolean {
        const hasToken = this.contains(token);

        if (force === true || (force === undefined && !hasToken)) {
            this.add(token);
            return true;
        } else {
            this.remove(token);
            return false;
        }
    }

    replace(oldToken: string, newToken: string): boolean {
        if (this.contains(oldToken)) {
            this.remove(oldToken);
            this.add(newToken);
            return true;
        }
        return false;
    }

    item(index: number): string | null {
        const classes = this.element.className.split(/\s+/).filter(c => c.length > 0);
        return index >= 0 && index < classes.length ? classes[index] : null;
    }

    [index: number]: string;
}



// Attr implementation
class AttrImpl extends NodeBase implements Attr {
    public ownerElement: Element | null = null;
    public namespaceURI: string | null = null;
    public prefix: string | null = null;
    public specified: boolean = true;

    constructor(public name: string, public value: string) {
        super(ATTRIBUTE_NODE, name);
    }

    get localName(): string {
        return this.name;
    }
}

// NamedNodeMap implementation
class NamedNodeMapImpl implements NamedNodeMap {
    constructor(private attributes: Map<string, string>) { }

    get length(): number {
        return this.attributes.size;
    }

    getNamedItem(qualifiedName: string): Attr | null {
        const value = this.attributes.get(qualifiedName.toLowerCase());
        return value !== undefined ? new AttrImpl(qualifiedName, value) : null;
    }

    getNamedItemNS(namespace: string | null, localName: string): Attr | null {
        // For simplicity, ignore namespace
        return this.getNamedItem(localName);
    }

    item(index: number): Attr | null {
        const keys = Array.from(this.attributes.keys());
        if (index >= 0 && index < keys.length) {
            const key = keys[index];
            const value = this.attributes.get(key)!;
            return new AttrImpl(key, value);
        }
        return null;
    }

    removeNamedItem(qualifiedName: string): Attr {
        const value = this.attributes.get(qualifiedName.toLowerCase());
        if (value !== undefined) {
            this.attributes.delete(qualifiedName.toLowerCase());
            return new AttrImpl(qualifiedName, value);
        }
        throw new DOMException('The attribute is not found', 'NotFoundError');
    }

    removeNamedItemNS(namespace: string | null, localName: string): Attr {
        // For simplicity, ignore namespace
        return this.removeNamedItem(localName);
    }

    setNamedItem(attr: Attr): Attr | null {
        const oldValue = this.attributes.get(attr.name.toLowerCase());
        this.attributes.set(attr.name.toLowerCase(), attr.value);
        return oldValue !== undefined ? new AttrImpl(attr.name, oldValue) : null;
    }

    setNamedItemNS(attr: Attr): Attr | null {
        // For simplicity, ignore namespace
        return this.setNamedItem(attr);
    }

    // Iterator implementation
    *[Symbol.iterator](): IterableIterator<Attr> {
        const keys = Array.from(this.attributes.keys());
        for (const key of keys) {
            const value = this.attributes.get(key)!;
            yield new AttrImpl(key, value);
        }
    }

    // Additional iterator methods for compatibility
    keys(): IterableIterator<string> {
        return this.attributes.keys();
    }

    values(): IterableIterator<Attr> {
        const self = this;
        return (function* () {
            for (const [key, value] of self.attributes) {
                yield new AttrImpl(key, value);
            }
        })();
    }

    entries(): IterableIterator<[string, Attr]> {
        const self = this;
        return (function* () {
            for (const [key, value] of self.attributes) {
                yield [key, new AttrImpl(key, value)] as [string, Attr];
            }
        })();
    }

    // forEach method for compatibility
    forEach(callback: (attr: Attr, index: number, map: NamedNodeMap) => void, thisArg?: any): void {
        const keys = Array.from(this.attributes.keys());
        keys.forEach((key, index) => {
            const value = this.attributes.get(key)!;
            const attr = new AttrImpl(key, value);
            callback.call(thisArg, attr, index, this);
        });
    }

    [index: number]: Attr;
}