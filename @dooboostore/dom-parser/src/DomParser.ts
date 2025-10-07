import { DocumentBase } from './node/DocumentBase';
import { TextBase } from './node/TextBase';
import { Comment } from './node/Comment';
import { WindowBase } from './window/WindowBase';

export interface DomParserOptions {
    href?: string;
}

export class DomParser {
    private _window: Window;
    private _document: Document;

    constructor(html: string, option?: DomParserOptions) {
        // Create a new document instance
        const document = new DocumentBase();

        // Create WindowBase instance with the document
        const windowBase = new WindowBase(document, option?.href);
        
        this._window = windowBase as unknown as Window;
        this._document = document as any;

        // Parse the provided HTML string
        this.parseHTML(html);
        
        // Set up document references after parsing
        this.setupDocumentReferences();
        
        // Simulate document loading process
        if (document && (document as any).simulateLoading) {
            (document as any).simulateLoading();
        }
    }

    get window(): Window {
        return this._window;
    }

    get document(): Document {
        return this._document;
    }
    /**
     * Load new HTML content and replace the current document
     */
    loadHTML(html: string): void {
        // Clear current document content
        this.clearDocument();
        
        // Parse new HTML
        this.parseHTML(html);
        
        // Set up document references after parsing
        this.setupDocumentReferences();
    }

    private clearDocument(): void {
        // Clear document body and head content while preserving structure
        if (this.document.head) {
            while (this.document.head.firstChild) {
                this.document.head.removeChild(this.document.head.firstChild);
            }
        }
        
        if (this.document.body) {
            while (this.document.body.firstChild) {
                this.document.body.removeChild(this.document.body.firstChild);
            }
        }
    }

    parseHTML(html: string): void {
        // Simple HTML parsing implementation
        if (!html.trim()) {
            return;
        }

        // Basic HTML parsing - this is a simplified version
        // In a real implementation, you'd use a proper HTML parser
        this.parseHTMLString(html, this.document);
    }

    private parseHTMLString(html: string, parent: any): void {
        // Remove DOCTYPE if present
        html = html.replace(/<!DOCTYPE[^>]*>/i, '').trim();

        if (!html) return;

        // Handle template tags specially
        const templateRegex = /<template([^>]*)>(.*?)<\/template>/gs;
        html = html.replace(templateRegex, (match, attributes, content) => {
            const element = this.document.createElement('template');

            // Parse attributes
            if (attributes.trim()) {
                this.parseAttributes(attributes, element);
            }

            // Parse content directly into the template's content fragment
            if (content.trim()) {
                // Use internal method to avoid appendChild side effects
                this.parseHTMLString(content.trim(), element.content);
            }

            parent.appendChild(element);
            return ''; // Remove from HTML string
        });

        // Improved HTML parsing with proper nesting support
        this.parseHTMLRecursive(html, parent);
    }

    private parseHTMLRecursive(html: string, parent: any): void {
        let position = 0;

        while (position < html.length) {
            // Find next tag or comment
            const tagStart = html.indexOf('<', position);

            if (tagStart === -1) {
                // No more tags, add remaining text if any
                const remainingText = html.substring(position).trim();
                if (remainingText) {
                    const textNode = new TextBase(remainingText, this.document);
                    parent.appendChild(textNode);
                }
                break;
            }

            // Add text before tag if any
            if (tagStart > position) {
                const textContent = html.substring(position, tagStart).trim();
                if (textContent) {
                    const textNode = new TextBase(textContent, this.document);
                                parent.appendChild(textNode);
                }
            }

            // Check if this is a comment
            if (html.substring(tagStart, tagStart + 4) === '<!--') {
                const commentEnd = html.indexOf('-->', tagStart + 4);
                if (commentEnd !== -1) {
                    const commentContent = html.substring(tagStart + 4, commentEnd);
                    const commentNode = new Comment(commentContent, this.document);
                    parent.appendChild(commentNode);
                    position = commentEnd + 3;
                    continue;
                } else {
                    // Malformed comment, treat as text
                    const textNode = new TextBase(html.substring(tagStart, tagStart + 4), this.document);
                    parent.appendChild(textNode);
                    position = tagStart + 4;
                    continue;
                }
            }

            // Find tag end
            const tagEnd = html.indexOf('>', tagStart);
            if (tagEnd === -1) break;

            const tagContent = html.substring(tagStart + 1, tagEnd);

            // Check if it's a closing tag
            if (tagContent.startsWith('/')) {
                // This is a closing tag, we should return to parent
                position = tagEnd + 1;
                break;
            }

            // Check if it's a self-closing tag
            const isSelfClosing = tagContent.endsWith('/') || this.isSelfClosingTag(tagContent.split(/\s+/)[0]);

            // Parse tag name and attributes
            const spaceIndex = tagContent.indexOf(' ');
            const tagName = spaceIndex === -1 ? tagContent.replace('/', '') : tagContent.substring(0, spaceIndex);
            let attributes = spaceIndex === -1 ? '' : tagContent.substring(spaceIndex + 1);
            
            // Only remove trailing slash for self-closing tags (not from attribute values)
            if (attributes.endsWith('/')) {
                attributes = attributes.slice(0, -1).trim();
            }



            // Create element
            const element = this.document.createElement(tagName.toLowerCase());



            // Parse attributes
            if (attributes.trim()) {
                this.parseAttributes(attributes, element);
            }

            parent.appendChild(element);

            if (isSelfClosing) {
                position = tagEnd + 1;
            } else {
                // Find matching closing tag and parse content
                const closingTag = `</${tagName}>`;
                const closingTagIndex = this.findMatchingClosingTag(html, tagEnd + 1, tagName);

                if (closingTagIndex !== -1) {
                    const innerContent = html.substring(tagEnd + 1, closingTagIndex);
                    if (innerContent.trim()) {
                        this.parseHTMLRecursive(innerContent, element);
                    }
                    position = closingTagIndex + closingTag.length;
                } else {
                    // No matching closing tag found, treat as self-closing
                    position = tagEnd + 1;
                }
            }
        }
    }

    private findMatchingClosingTag(html: string, startPos: number, tagName: string): number {
        const openTag = `<${tagName}`;
        const closeTag = `</${tagName}>`;
        let depth = 1;
        let pos = startPos;

        while (pos < html.length && depth > 0) {
            const nextOpen = html.indexOf(openTag, pos);
            const nextClose = html.indexOf(closeTag, pos);

            if (nextClose === -1) {
                // No more closing tags
                return -1;
            }

            if (nextOpen !== -1 && nextOpen < nextClose) {
                // Found another opening tag before the closing tag
                depth++;
                pos = nextOpen + openTag.length;
            } else {
                // Found a closing tag
                depth--;
                if (depth === 0) {
                    return nextClose;
                }
                pos = nextClose + closeTag.length;
            }
        }

        return -1;
    }

    private parseAttributes(attributeString: string, element: any): void {
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
     * Decode HTML entities in a string
     */
    private decodeHTMLEntities(str: string): string {
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

    private isSelfClosingTag(tagName: string): boolean {
        const selfClosingTags = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
        return selfClosingTags.includes(tagName.toLowerCase());
    }

    /**
     * Set up document references after HTML parsing
     */
    private setupDocumentReferences(): void {
        // Find HTML, HEAD, and BODY elements
        const allHtmlElements = this.document.querySelectorAll('html');
        const allHeadElements = this.document.querySelectorAll('head');
        const allBodyElements = this.document.querySelectorAll('body');
        
        // Choose the HTML element with content, then attributes, then first one
        let htmlElement = null;
        // First priority: HTML with attributes (lang, data-theme 등)
        for (let i = 0; i < allHtmlElements.length; i++) {
            const html = allHtmlElements[i];
            if (html.attributes.length > 0) {
                htmlElement = html;
                break;
            }
        }
        // Second priority: HTML with child nodes (content)
        if (!htmlElement) {
            for (let i = 0; i < allHtmlElements.length; i++) {
                const html = allHtmlElements[i];
                if (html.childNodes.length > 0) {
                    htmlElement = html;
                    break;
                }
            }
        }
        // Last resort: first HTML
        if (!htmlElement && allHtmlElements.length > 0) {
            htmlElement = allHtmlElements[0];
        }
        
        // Choose the HEAD element with content, then attributes, then first one
        let headElement = null;
        // First priority: HEAD with child nodes (content)
        for (let i = 0; i < allHeadElements.length; i++) {
            const head = allHeadElements[i];
            if (head.childNodes.length > 0) {
                headElement = head;
                break;
            }
        }
        // Second priority: HEAD with attributes
        if (!headElement) {
            for (let i = 0; i < allHeadElements.length; i++) {
                const head = allHeadElements[i];
                if (head.attributes.length > 0) {
                    headElement = head;
                    break;
                }
            }
        }
        // Last resort: first HEAD
        if (!headElement && allHeadElements.length > 0) {
            headElement = allHeadElements[0];
        }
        
        // Choose the BODY element with content, then attributes, then first one
        let bodyElement = null;

        
        // First priority: BODY with child nodes (content)
        for (let i = 0; i < allBodyElements.length; i++) {
            const body = allBodyElements[i];
            if (body.childNodes.length > 0) {
                bodyElement = body;
                break;
            }
        }
        
        // Second priority: BODY with attributes
        if (!bodyElement) {
            for (let i = 0; i < allBodyElements.length; i++) {
                const body = allBodyElements[i];
                if (body.attributes.length > 0) {
                    bodyElement = body;
                    break;
                }
            }
        }
        
        // Last resort: first BODY
        if (!bodyElement && allBodyElements.length > 0) {
            bodyElement = allBodyElements[0];
        }
        

        
        // For now, just use the elements as they are parsed
        // TODO: Implement proper DOM structure reorganization later
        
        // Set document references
        if (htmlElement) {
            (this.document as any).documentElement = htmlElement;
        }
        if (headElement) {
            (this.document as any).head = headElement;
        }
        if (bodyElement) {
            (this.document as any).body = bodyElement;
        }
    }
}