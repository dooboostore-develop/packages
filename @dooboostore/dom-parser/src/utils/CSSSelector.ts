
/**
 * CSS Selector Parser and Matcher
 * Supports various CSS selector types including complex selectors
 */
export class CSSSelector {
    /**
     * Main method to check if an element matches a CSS selector.
     * Handles comma lists and combinators (descendant, >, +, ~);
     * matching runs right-to-left like browsers.
     */
    static matches(element: Element, selector: string): boolean {
        for (const part of this.splitTopLevel(selector.trim(), ',')) {
            const sel = part.trim();
            if (sel && this.matchesComplex(element as any, sel)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Match a complex selector (compound selector + combinators) against an element
     */
    private static matchesComplex(element: any, selector: string): boolean {
        const chain = this.splitCombinators(selector);
        if (chain.length === 0) return false;

        let current: any = element;
        let i = chain.length - 1;
        if (!this.matchesCompound(current, chain[i].compound)) return false;

        while (i > 0) {
            const combinator = chain[i].combinator;
            const prev = chain[i - 1].compound;

            if (combinator === '>') {
                current = current.parentNode;
                if (!current || current.nodeType !== 1 || !this.matchesCompound(current, prev)) return false;
            } else if (combinator === '+') {
                current = this.previousElementSibling(current);
                if (!current || !this.matchesCompound(current, prev)) return false;
            } else if (combinator === '~') {
                current = this.findMatchingSibling(current, prev);
                if (!current) return false;
            } else {
                // Descendant combinator
                current = this.findMatchingAncestor(current, prev);
                if (!current) return false;
            }
            i--;
        }

        return true;
    }

    /**
     * Match a single compound selector (e.g., "meta[charset]", "div.class", "input#id")
     */
    private static matchesCompound(element: any, selector: string): boolean {
        // Handle compound selectors (e.g., "meta[charset]", "div.class", "input#id")
        const components = this.parseSelector(selector);

        // All components must match for the selector to match
        for (const component of components) {
            if (!this.matchesSingleSelector(element, component)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Split a selector on a top-level delimiter, ignoring delimiters inside
     * brackets, parens, quotes, or behind a backslash escape
     */
    private static splitTopLevel(selector: string, delimiter: string): string[] {
        const parts: string[] = [];
        let current = '';
        let depthBracket = 0;
        let depthParen = 0;
        let inQuotes = false;
        let quoteChar = '';

        for (let i = 0; i < selector.length; i++) {
            const char = selector[i];

            if (inQuotes) {
                current += char;
                if (char === quoteChar && selector[i - 1] !== '\\') {
                    inQuotes = false;
                    quoteChar = '';
                }
                continue;
            }

            if (char === '"' || char === "'") {
                inQuotes = true;
                quoteChar = char;
                current += char;
                continue;
            }

            if (char === '\\') {
                current += char + (selector[i + 1] ?? '');
                i++;
                continue;
            }

            if (char === '[') depthBracket++;
            else if (char === ']') depthBracket--;
            else if (char === '(') depthParen++;
            else if (char === ')') depthParen--;

            if (char === delimiter && depthBracket === 0 && depthParen === 0) {
                parts.push(current);
                current = '';
                continue;
            }

            current += char;
        }

        parts.push(current);
        return parts;
    }

    /**
     * Split a complex selector into compounds joined by combinators.
     * Whitespace around explicit combinators (>, +, ~) is ignored;
     * a bare whitespace run is the descendant combinator.
     */
    private static splitCombinators(selector: string): { compound: string; combinator: ' ' | '>' | '+' | '~' }[] {
        const parts: string[] = [];
        const combinators: string[] = [];
        let current = '';
        let depthBracket = 0;
        let depthParen = 0;
        let inQuotes = false;
        let quoteChar = '';

        const push = () => {
            parts.push(current);
            current = '';
        };

        for (let i = 0; i < selector.length; i++) {
            const char = selector[i];

            if (inQuotes) {
                current += char;
                if (char === quoteChar && selector[i - 1] !== '\\') {
                    inQuotes = false;
                    quoteChar = '';
                }
                continue;
            }

            if (char === '"' || char === "'") {
                inQuotes = true;
                quoteChar = char;
                current += char;
                continue;
            }

            if (char === '\\') {
                current += char + (selector[i + 1] ?? '');
                i++;
                continue;
            }

            if (char === '[') depthBracket++;
            else if (char === ']') depthBracket--;
            else if (char === '(') depthParen++;
            else if (char === ')') depthParen--;

            if (depthBracket === 0 && depthParen === 0) {
                if (char === '>' || char === '+' || char === '~') {
                    push();
                    combinators.push(char);
                    continue;
                }
                if (/\s/.test(char)) {
                    push();
                    combinators.push(' ');
                    while (i + 1 < selector.length && /\s/.test(selector[i + 1])) i++;
                    continue;
                }
            }

            current += char;
        }
        push();

        // Drop empty compounds (whitespace around explicit combinators);
        // an explicit combinator wins over an adjacent descendant one.
        const chain: { compound: string; combinator: ' ' | '>' | '+' | '~' }[] = [];
        let pending: ' ' | '>' | '+' | '~' = ' ';
        parts.forEach((part, index) => {
            if (index > 0) {
                const c = combinators[index - 1] as ' ' | '>' | '+' | '~';
                if (c !== ' ') pending = c;
            }
            if (part.trim()) {
                chain.push({ compound: part.trim(), combinator: pending });
                pending = ' ';
            }
        });

        return chain;
    }

    private static previousElementSibling(element: any): any {
        let sibling = element.previousSibling;
        while (sibling) {
            if (sibling.nodeType === 1) return sibling;
            sibling = sibling.previousSibling;
        }
        return null;
    }

    private static findMatchingSibling(element: any, compound: string): any {
        let sibling = this.previousElementSibling(element);
        while (sibling) {
            if (this.matchesCompound(sibling, compound)) return sibling;
            sibling = this.previousElementSibling(sibling);
        }
        return null;
    }

    private static findMatchingAncestor(element: any, compound: string): any {
        let ancestor = element.parentNode;
        while (ancestor) {
            if (ancestor.nodeType === 1 && this.matchesCompound(ancestor, compound)) return ancestor;
            ancestor = ancestor.parentNode;
        }
        return null;
    }

    /**
     * Parse a selector into individual components
     * e.g., "div.user-panel[data-id='123']" -> ["div", ".user-panel", "[data-id='123']"]
     */
    private static parseSelector(selector: string): string[] {
        const components: string[] = [];
        let current = '';
        let inBrackets = false;
        let inQuotes = false;
        let quoteChar = '';

        for (let i = 0; i < selector.length; i++) {
            const char = selector[i];
            const prevChar = i > 0 ? selector[i - 1] : '';

            if (inQuotes) {
                current += char;
                if (char === quoteChar && prevChar !== '\\') {
                    inQuotes = false;
                    quoteChar = '';
                }
                continue;
            }

            if (char === '"' || char === "'") {
                inQuotes = true;
                quoteChar = char;
                current += char;
                continue;
            }

            if (char === '[') {
                inBrackets = true;
                if (current) {
                    components.push(current);
                    current = '';
                }
                current += char;
            } else if (char === ']') {
                inBrackets = false;
                current += char;
                components.push(current);
                current = '';
            } else if (!inBrackets && (char === '.' || char === '#')) {
                if (current) {
                    components.push(current);
                    current = '';
                }
                current += char;
            } else if (!inBrackets && char === ':' && prevChar !== '\\') {
                // Only treat colon as pseudo-class separator if it's not escaped
                if (current) {
                    components.push(current);
                    current = '';
                }
                current += char;
            } else {
                current += char;
            }
        }

        if (current) {
            components.push(current);
        }

        return components;
    }

    /**
     * Match a single selector component against an element
     */
    private static matchesSingleSelector(element: Element, selector: string): boolean {
        selector = selector.trim();

        // Tag selector (e.g., "div", "dr-wow", "wow\\:zz")
        // Handle escaped colons in tag names
        const unescapedSelector = selector.replace(/\\:/g, ':');
        if (unescapedSelector.match(/^[a-zA-Z][a-zA-Z0-9:-]*$/)) {
            return element.tagName.toLowerCase() === unescapedSelector.toLowerCase();
        }

        // ID selector (e.g., "#myId")
        if (selector.startsWith('#')) {
            const id = selector.substring(1);
            return element.id === id;
        }

        // Class selector (e.g., ".myClass")
        if (selector.startsWith('.')) {
            const className = selector.substring(1);
            return element.className.split(/\s+/).includes(className);
        }

        // Pseudo-class selectors
        if (selector.startsWith(':')) {
            return this.matchesPseudoClass(element, selector);
        }

        // Attribute selector (e.g., "[type='text']", "[disabled]", "[value*='test']")
        if (selector.startsWith('[') && selector.endsWith(']')) {
            return this.matchesAttributeSelector(element, selector);
        }

        // Universal selector
        if (selector === '*') {
            return true;
        }

        // Unsupported selector
        return false;
    }

    /**
     * Match attribute selectors with various operators
     */
    private static matchesAttributeSelector(element: Element, selector: string): boolean {
        const attrContent = selector.slice(1, -1); // Remove [ and ]

        // Parse attribute selector: attr, attr=value, attr*=value, etc.
        const match = attrContent.match(/^([^=!*^$~|]+)(?:([=!*^$~|]+)(['"]?)([^'"]*)(['"]?))?$/);

        if (!match) return false;

        let attrName = match[1].trim();
        const operator = match[2] || '';
        const attrValue = match[4] || '';

        // Handle escaped colons in attribute names
        attrName = attrName.replace(/\\:/g, ':');

        if (!operator) {
            // Just check if attribute exists: [disabled]
            return element.hasAttribute(attrName);
        }

        const elementValue = element.getAttribute(attrName);
        if (elementValue === null) return false;

        switch (operator) {
            case '=':
                // Exact match: [type="text"]
                return elementValue === attrValue;

            case '!=':
                // Not equal: [value!="test"]
                return elementValue !== attrValue;

            case '*=':
                // Contains: [value*="test"]
                return elementValue.includes(attrValue);

            case '^=':
                // Starts with: [value^="test"]
                return elementValue.startsWith(attrValue);

            case '$=':
                // Ends with: [value$="test"]
                return elementValue.endsWith(attrValue);

            case '~=':
                // Word match: [class~="test"]
                return elementValue.split(/\s+/).includes(attrValue);

            case '|=':
                // Language match: [lang|="en"]
                return elementValue === attrValue || elementValue.startsWith(attrValue + '-');

            default:
                return false;
        }
    }

    /**
     * Match pseudo-class selectors
     */
    private static matchesPseudoClass(element: Element, selector: string): boolean {
        const pseudoClass = selector.substring(1); // Remove :

        // Parse pseudo-class with parameters: nth-child(2), contains('text')
        const match = pseudoClass.match(/^([^(]+)(?:\(([^)]*)\))?$/);
        if (!match) return false;

        const pseudoName = match[1];
        const pseudoParam = match[2];

        switch (pseudoName) {
            case 'checked':
                // :checked - for input elements
                return this.isInputElement(element) &&
                    (element.getAttribute('checked') !== null ||
                        element.getAttribute('selected') !== null);

            case 'disabled':
                // :disabled
                return element.hasAttribute('disabled');

            case 'enabled':
                // :enabled
                return !element.hasAttribute('disabled');

            case 'focus':
                // :focus - check if element has focus (autofocus attribute or programmatically focused)
                return element.hasAttribute('autofocus') ||
                    element.getAttribute('data-focused') === 'true';

            case 'first':
            case 'first-child':
                // :first or :first-child
                return this.isFirstChild(element);

            case 'last':
            case 'last-child':
                // :last or :last-child
                return this.isLastChild(element);

            case 'even':
                // :even (0-based indexing)
                return this.getChildIndex(element) % 2 === 0;

            case 'odd':
                // :odd (0-based indexing)
                return this.getChildIndex(element) % 2 === 1;

            case 'nth-child':
                // :nth-child(n)
                if (pseudoParam) {
                    const n = parseInt(pseudoParam, 10);
                    return this.getChildIndex(element) === n - 1; // Convert to 0-based
                }
                return false;

            case 'eq':
                // :eq(n) - jQuery-style
                if (pseudoParam) {
                    const n = parseInt(pseudoParam, 10);
                    return this.getChildIndex(element) === n;
                }
                return false;

            case 'gt':
                // :gt(n) - jQuery-style
                if (pseudoParam) {
                    const n = parseInt(pseudoParam, 10);
                    return this.getChildIndex(element) > n;
                }
                return false;

            case 'lt':
                // :lt(n) - jQuery-style
                if (pseudoParam) {
                    const n = parseInt(pseudoParam, 10);
                    return this.getChildIndex(element) < n;
                }
                return false;

            case 'contains':
                // :contains('text')
                if (pseudoParam) {
                    const text = pseudoParam.replace(/^['"]|['"]$/g, ''); // Remove quotes
                    return (element.textContent || '').includes(text);
                }
                return false;

            case 'visible':
                // :visible - simplified check
                return !element.hasAttribute('hidden') &&
                    element.getAttribute('style')?.includes('display:none') !== true;

            case 'hidden':
                // :hidden
                return element.hasAttribute('hidden') ||
                    element.getAttribute('style')?.includes('display:none') === true;

            case 'has':
                // :has(selector) - simplified implementation
                if (pseudoParam && 'querySelector' in element) {
                    try {
                        return (element as any).querySelector(pseudoParam) !== null;
                    } catch {
                        return false;
                    }
                }
                return false;

            case 'not':
                // :not(selector) - simplified implementation
                if (pseudoParam) {
                    return !CSSSelector.matches(element, pseudoParam);
                }
                return false;

            default:
                // Unsupported pseudo-class
                return false;
        }
    }

    /**
     * Helper methods for pseudo-class matching
     */
    private static isInputElement(element: Element): boolean {
        const tagName = element.tagName.toLowerCase();
        return tagName === 'input' || tagName === 'select' || tagName === 'textarea';
    }

    private static isFirstChild(element: Element): boolean {
        const parent = element.parentNode;
        if (!parent || !('children' in parent)) return false;

        const children = (parent as any).children;
        return children.length > 0 && children[0] === element;
    }

    private static isLastChild(element: Element): boolean {
        const parent = element.parentNode;
        if (!parent || !('children' in parent)) return false;

        const children = (parent as any).children;
        return children.length > 0 && children[children.length - 1] === element;
    }

    private static getChildIndex(element: Element): number {
        const parent = element.parentNode;
        if (!parent || !('children' in parent)) return -1;

        const children = (parent as any).children;
        for (let i = 0; i < children.length; i++) {
            if (children[i] === element) {
                return i;
            }
        }
        return -1;
    }
}