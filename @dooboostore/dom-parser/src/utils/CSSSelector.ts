
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
    static matches(element: Element, selector: string, scope?: any): boolean {
        const scopeEl = scope ?? element;
        for (const part of this.splitTopLevel(selector.trim(), ',')) {
            const sel = part.trim();
            if (sel && this.matchesComplex(element as any, sel, scopeEl)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Match a complex selector (compound selector + combinators) against an element
     */
    private static matchesComplex(element: any, selector: string, scope?: any): boolean {
        const chain = this.splitCombinators(selector);
        if (chain.length === 0) return false;

        let current: any = element;
        let i = chain.length - 1;
        if (!this.matchesCompound(current, chain[i].compound, scope)) return false;

        while (i > 0) {
            const combinator = chain[i].combinator;
            const prev = chain[i - 1].compound;

            if (combinator === '>') {
                current = current.parentNode;
                if (!current || (current !== scope && current.nodeType !== 1) || !this.matchesCompound(current, prev, scope)) return false;
            } else if (combinator === '+') {
                current = this.previousElementSibling(current);
                if (!current || !this.matchesCompound(current, prev, scope)) return false;
            } else if (combinator === '~') {
                current = this.findMatchingSibling(current, prev, scope);
                if (!current) return false;
            } else {
                // Descendant combinator
                current = this.findMatchingAncestor(current, prev, scope);
                if (!current) return false;
            }
            i--;
        }

        // A leading explicit combinator (relative selector, e.g. inside :has())
        // constrains the element against the scope itself.
        const first = chain[0].combinator;
        if (first === '>') {
            if (!current || current.parentNode !== scope) return false;
        } else if (first === '+') {
            if (!current || this.previousElementSibling(current) !== scope) return false;
        } else if (first === '~') {
            let sibling = current ? this.previousElementSibling(current) : null;
            let found = false;
            while (sibling) {
                if (sibling === scope) { found = true; break; }
                sibling = this.previousElementSibling(sibling);
            }
            if (!found) return false;
        }

        return true;
    }

    /**
     * Match a single compound selector (e.g., "meta[charset]", "div.class", "input#id")
     */
    private static matchesCompound(element: any, selector: string, scope?: any): boolean {
        // Handle compound selectors (e.g., "meta[charset]", "div.class", "input#id")
        const components = this.parseSelector(selector);

        // All components must match for the selector to match
        for (const component of components) {
            if (!this.matchesSingleSelector(element, component, scope)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Split a selector list on top-level commas (ignoring commas inside
     * brackets, parens, quotes or escapes). Use this instead of a naive
     * split(',') anywhere functional pseudo-classes may appear.
     */
    static splitSelectorList(selector: string): string[] {
        return this.splitTopLevel(selector, ',');
    }

    /**
     * Index just past the CSS escape starting at i (selector[i] === '\\').
     * Hex escapes (`\39 `) consume 1-6 hex digits plus one optional
     * whitespace; anything else consumes exactly one following character.
     */
    private static consumeEscape(selector: string, i: number): number {
        let j = i + 1;
        let hex = 0;
        while (j < selector.length && hex < 6 && /[0-9a-fA-F]/.test(selector[j])) {
            j++;
            hex++;
        }
        if (hex > 0) {
            if (selector[j] === '\r' && selector[j + 1] === '\n') j += 2;
            else if (selector[j] === ' ' || selector[j] === '\t' || selector[j] === '\n' || selector[j] === '\r' || selector[j] === '\f') j++;
            return j;
        }
        return Math.min(j + 1, selector.length);
    }

    /**
     * Decode CSS escape sequences (`\39 ` → '9', `\:` → ':').
     */
    private static cssUnescape(s: string): string {
        let out = '';
        for (let i = 0; i < s.length; i++) {
            if (s[i] !== '\\' || i + 1 >= s.length) {
                out += s[i];
                continue;
            }
            const end = this.consumeEscape(s, i);
            const body = s.slice(i + 1, end);
            const hexMatch = body.match(/^[0-9a-fA-F]{1,6}/);
            if (hexMatch) {
                const cp = parseInt(hexMatch[0], 16);
                out += (cp === 0 || cp > 0x10FFFF || (cp >= 0xD800 && cp <= 0xDFFF)) ? '�' : String.fromCodePoint(cp);
            } else if (body !== '\n' && body !== '\r' && body !== '\r\n' && body !== '\f' && body !== '') {
                out += body;
            }
            i = end - 1;
        }
        return out;
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
                const end = this.consumeEscape(selector, i);
                current += selector.slice(i, end);
                i = end - 1;
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
                const end = this.consumeEscape(selector, i);
                current += selector.slice(i, end);
                i = end - 1;
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

    private static findMatchingSibling(element: any, compound: string, scope?: any): any {
        let sibling = this.previousElementSibling(element);
        while (sibling) {
            if (this.matchesCompound(sibling, compound, scope)) return sibling;
            sibling = this.previousElementSibling(sibling);
        }
        return null;
    }

    private static findMatchingAncestor(element: any, compound: string, scope?: any): any {
        // :host / :host() / :host-context() refer to the shadow host of the
        // element's own tree — the only sanctioned way to cross a shadow
        // boundary upward. :host-context() additionally tests the host's
        // light-DOM ancestors.
        const components = this.parseSelector(compound);
        const isHostComp = (c: string) => c === ':host' || c.startsWith(':host(') || c.startsWith(':host-context(');
        const hostComps = components.filter(isHostComp);
        if (hostComps.length > 0) {
            const root = this.getTreeRoot(element);
            const host = root && root.nodeType === 11 && (root as any).host ? (root as any).host : null;
            if (!host) return null;
            const rest = components.filter(c => !isHostComp(c));
            const contexts: any[] = [host];
            if (hostComps.some(c => c.startsWith(':host-context('))) {
                let above = host.parentNode;
                while (above) {
                    if (above.nodeType === 1) contexts.push(above);
                    above = above.parentNode;
                }
            }
            const inners: string[] = [];
            for (const h of hostComps) {
                if (h === ':host') continue;
                inners.push(h.slice(h.indexOf('(') + 1, -1));
            }
            for (const ctx of contexts) {
                if (!rest.every(c => this.matchesSingleSelector(ctx, c, scope))) continue;
                let ok = true;
                for (const inner of inners) {
                    try {
                        if (!CSSSelector.matches(ctx, inner, scope)) { ok = false; break; }
                    } catch {
                        ok = false;
                        break;
                    }
                }
                if (ok) return ctx;
            }
            return null;
        }
        // Normal compounds never cross a shadow boundary (#2554 class):
        // selectors are scoped to the tree under evaluation. The scope root
        // itself (document, fragment, or queried element) always matches.
        let ancestor = element.parentNode;
        while (ancestor) {
            if (ancestor === scope) {
                if (this.matchesCompound(ancestor, compound, scope)) return ancestor;
                return null;
            }
            if (ancestor.nodeType === 11) return null;
            if (ancestor.nodeType === 1 && this.matchesCompound(ancestor, compound, scope)) return ancestor;
            ancestor = ancestor.parentNode;
        }
        return null;
    }

    private static getTreeRoot(element: any): any {
        let node = element;
        while (node && node.parentNode) {
            node = node.parentNode;
        }
        return node;
    }

    /**
     * Parse a selector into individual components
     * e.g., "div.user-panel[data-id='123']" -> ["div", ".user-panel", "[data-id='123']"]
     */
    private static parseSelector(selector: string): string[] {
        const components: string[] = [];
        let current = '';
        let inBrackets = false;
        let depthParen = 0;
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

            // Escaped characters (.:#[] and hex escapes like \39 ) never split.
            if (char === '\\') {
                const end = this.consumeEscape(selector, i);
                current += selector.slice(i, end);
                i = end - 1;
                continue;
            }

            // Inside functional pseudo-classes (:not(...), :has(...)) nothing
            // splits a compound — brackets belong to the inner selector.
            if (char === '(') {
                depthParen++;
                current += char;
                continue;
            }
            if (char === ')') {
                if (depthParen > 0) depthParen--;
                current += char;
                continue;
            }
            if (depthParen > 0) {
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
    private static matchesSingleSelector(element: Element, selector: string, scope?: any): boolean {
        selector = selector.trim();

        // :scope matches the scoping element only (nwsapi#144 class: a cached
        // or missing scope makes every scoped selector wrong, so there is no cache).
        if (selector === ':scope') {
            return element === scope;
        }

        // Tag selector (e.g., "div", "dr-wow", "wow\:zz", "q\:template")
        // Full CSS escape decoding (single-char and \HHHHHH hex escapes).
        const unescapedSelector = this.cssUnescape(selector);
        if (unescapedSelector.match(/^[a-zA-Z][a-zA-Z0-9:-]*$/)) {
            return element.tagName.toLowerCase() === unescapedSelector.toLowerCase();
        }

        // ID selector (e.g., "#myId", "#\39 abc" from CSS.escape())
        if (selector.startsWith('#')) {
            const id = this.cssUnescape(selector.substring(1));
            return element.id === id;
        }

        // Class selector (e.g., ".myClass", ".\39 abc")
        if (selector.startsWith('.')) {
            const className = this.cssUnescape(selector.substring(1));
            return element.className.split(/\s+/).includes(className);
        }

        // Pseudo-class selectors
        if (selector.startsWith(':')) {
            return this.matchesPseudoClass(element, selector, scope);
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
        let attrContent = selector.slice(1, -1); // Remove [ and ]

        // Case-insensitive modifier ([attr="v" i]): a trailing i/I,
        // whitespace-separated from a complete name[op]value.
        let insensitive = false;
        const modMatch = attrContent.match(/^(.*?)\s+([iI])$/);
        if (modMatch && /[=!*^$~|]/.test(modMatch[1])) {
            insensitive = true;
            attrContent = modMatch[1];
        }

        // Parse attribute selector: attr, attr=value, attr*=value, etc.
        const match = attrContent.match(/^([^=!*^$~|]+)(?:([=!*^$~|]+)(['"]?)([^'"]*)(['"]?))?$/);

        if (!match) return false;

        let attrName = this.cssUnescape(match[1].trim());
        const operator = match[2] || '';
        const attrValue = this.cssUnescape(match[4] || '');

        if (!operator) {
            // Just check if attribute exists: [disabled]
            return element.hasAttribute(attrName);
        }

        // Empty-string values never match for substring operators (spec).
        if (attrValue === '' && (operator === '^=' || operator === '$=' || operator === '*=')) {
            return false;
        }

        const elementValue = element.getAttribute(attrName);
        if (elementValue === null) return false;

        const lhs = insensitive ? elementValue.toLowerCase() : elementValue;
        const rhs = insensitive ? attrValue.toLowerCase() : attrValue;

        switch (operator) {
            case '=':
                // Exact match: [type="text"]
                return lhs === rhs;

            case '!=':
                // Not equal: [value!="test"]
                return lhs !== rhs;

            case '*=':
                // Contains: [value*="test"]
                return lhs.includes(rhs);

            case '^=':
                // Starts with: [value^="test"]
                return lhs.startsWith(rhs);

            case '$=':
                // Ends with: [value$="test"]
                return lhs.endsWith(rhs);

            case '~=':
                // Word match: [class~="test"]
                return lhs.split(/\s+/).includes(rhs);

            case '|=':
                // Language match: [lang|="en"]
                return lhs === rhs || lhs.startsWith(rhs + '-');

            default:
                return false;
        }
    }

    /**
     * Match pseudo-class selectors
     */
    private static matchesPseudoClass(element: Element, selector: string, scope?: any): boolean {
        // Split "name(param)" with balanced parens (nested functionals allowed).
        const openParen = selector.indexOf('(');
        let pseudoName: string;
        let pseudoParam: string | undefined;
        if (openParen === -1) {
            pseudoName = selector.substring(1); // Remove :
            pseudoParam = undefined;
        } else {
            const closeParen = selector.lastIndexOf(')');
            if (closeParen < openParen) return false;
            pseudoName = selector.substring(1, openParen);
            pseudoParam = selector.substring(openParen + 1, closeParen);
        }

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
            // :nth-child(an+b) — full microsyntax: odd/even/integer/n-steps
            if (pseudoParam) {
                return this.matchesNth(this.getChildIndex(element), pseudoParam);
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
                    return !CSSSelector.matches(element, pseudoParam, scope);
                }
                return false;

            case 'is':
            case 'where':
                // :is(...) / :where(...) — forgiving selector list, any match wins
                if (pseudoParam) {
                    for (const part of this.splitTopLevel(pseudoParam, ',')) {
                        const sel = part.trim();
                        if (!sel) continue;
                        try {
                            if (CSSSelector.matches(element, sel, scope)) return true;
                        } catch {
                            continue;
                        }
                    }
                    return false;
                }
                return false;

            case 'nth-of-type':
                // :nth-of-type(an+b) — position among same-tag siblings
                if (pseudoParam) {
                    return this.matchesNth(this.getChildIndexOfType(element), pseudoParam);
                }
                return false;

            case 'nth-last-child':
                // :nth-last-child(an+b) — position from the end among element siblings
                if (pseudoParam) {
                    return this.matchesNth(this.getChildIndexFromEnd(element), pseudoParam);
                }
                return false;

            case 'nth-last-of-type':
                // :nth-last-of-type(an+b) — position from the end among same-tag siblings
                if (pseudoParam) {
                    return this.matchesNth(this.getChildIndexOfTypeFromEnd(element), pseudoParam);
                }
                return false;

            case 'first-of-type':
                return this.getChildIndexOfType(element) === 0;

            case 'last-of-type':
                    return this.getChildIndexOfTypeFromEnd(element) === 0;

                case 'empty':
                    // :empty — no element children and no non-whitespace text
                    // (comments/PIs don't disqualify; whitespace-only text doesn't either)
                    for (const child of (element as any).childNodes ?? []) {
                        if (child.nodeType === 1) return false;
                        if ((child.nodeType === 3 || child.nodeType === 4)
                            && typeof child.data === 'string' && child.data.trim() !== '') return false;
                    }
                    return true;

                case 'root':
                    // :root — the document element
                    return (element as any).ownerDocument?.documentElement === element;

            case 'only-child':
                return this.getChildIndex(element) === 0 && this.getElementSiblingCount(element) === 1;

            case 'only-of-type':
                return this.getChildIndexOfType(element) === 0 && this.getChildIndexOfTypeFromEnd(element) === 0;

                case 'lang': {
                    // :lang(tag) — own or inherited language equals tag (case-insensitive),
                    // or starts with tag + '-'. Empty lang defers to ancestors.
                    if (!pseudoParam) return false;
                    const wanted = pseudoParam.trim();
                    let node: any = element;
                    while (node) {
                        const lang = node.getAttribute ? (node.getAttribute('lang') ?? node.getAttribute('xml:lang')) : null;
                        if (lang) {
                            if (wanted === '*') return true;
                            const lower = lang.toLowerCase();
                            const w = wanted.toLowerCase();
                            return lower === w || lower.startsWith(w + '-');
                        }
                        node = node.parentNode;
                    }
                    return false;
                }

                case 'link': {
                    // :link — a/area/link with an href (unvisited; no history here).
                    const tag = (element.tagName || '').toLowerCase();
                    return (tag === 'a' || tag === 'area' || tag === 'link') && element.hasAttribute('href');
                }

                case 'visited':
                    // :visited never matches from page CSS (privacy): no history to consult.
                    return false;

                case 'required': {
                    // :required — requirable control carrying a required attribute.
                    // (input type=hidden is barred from validation, buttons never qualify.)
                    const tag = (element.tagName || '').toLowerCase();
                    const type = (element.getAttribute?.('type') || '').toLowerCase();
                    const requirable = tag === 'select' || tag === 'textarea'
                        || (tag === 'input' && type !== 'hidden');
                    return requirable && element.hasAttribute('required');
                }

                case 'optional': {
                    // :optional — button, or input/select/textarea that isn't :required.
                    const tag = (element.tagName || '').toLowerCase();
                    const type = (element.getAttribute?.('type') || '').toLowerCase();
                    if (tag === 'button') return true;
                    const requirable = tag === 'select' || tag === 'textarea'
                        || (tag === 'input' && type !== 'hidden');
                    if (tag === 'input' && type === 'hidden') return true;
                    return requirable && !element.hasAttribute('required');
                }

                case 'read-write':
                    return this.isReadWrite(element);

                case 'read-only':
                    return !this.isReadWrite(element);

                case 'target': {
                    // :target — element whose id equals the document URL fragment.
                    const doc: any = (element as any).ownerDocument;
                    const href: string = doc?.URL ?? doc?.location?.href ?? '';
                    const hashIndex = href.indexOf('#');
                    if (hashIndex === -1) return false;
                    let frag = href.slice(hashIndex + 1);
                    if (!frag) return false;
                    try {
                        frag = decodeURIComponent(frag);
                    } catch {
                        // Keep the raw fragment on malformed escapes.
                    }
                    return (element as any).id === frag;
                }

            default:
                // Unsupported pseudo-class
                return false;
        }
    }

    /**
     * Match a 0-based element index against an :nth-child() an+b expression.
     * Supports odd/even, plain integers and an+b steps (2n, 2n+1, -n+2, n ...).
     */
    private static matchesNth(index: number, expr: string): boolean {
        const s = expr.toLowerCase().replace(/\s+/g, '');
        let a: number;
        let b: number;
        if (s === 'odd') {
            a = 2; b = 1;
        } else if (s === 'even') {
            a = 2; b = 0;
        } else {
            const intMatch = s.match(/^([+-]?\d+)$/);
            if (intMatch) {
                a = 0; b = parseInt(intMatch[1], 10);
            } else {
                const nMatch = s.match(/^([+-]?\d*)n([+-]\d+)?$/);
                if (!nMatch) return false;
                const aStr = nMatch[1];
                a = aStr === '' || aStr === '+' ? 1 : aStr === '-' ? -1 : parseInt(aStr, 10);
                b = nMatch[2] ? parseInt(nMatch[2], 10) : 0;
            }
        }
        const p = index + 1; // 1-based position
        if (a === 0) return p === b;
        const d = p - b;
        if (a > 0) return d >= 0 && d % a === 0;
        return d <= 0 && d % a === 0;
    }

    /**
     * Input types whose value is user-mutable text (verified against Chromium;
     * hidden/checkbox/radio/button/submit/reset/image/file/color/range are not).
     */
    private static readonly MUTABLE_INPUT_TYPES: ReadonlySet<string> = new Set([
        'text', 'search', 'tel', 'url', 'password',
        'number', 'date', 'month', 'week', 'time', 'datetime-local', 'email',
    ]);

    /**
     * Whether the element is user-alterable: mutable text-like inputs and
     * textareas (not readonly/disabled), or contenteditable hosts.
     */
    private static isReadWrite(element: Element): boolean {
        const tag = ((element.tagName || '') as string).toLowerCase();
        const hasAttr = (n: string): boolean => typeof (element as any).hasAttribute === 'function' && (element as any).hasAttribute(n);
        if (tag === 'textarea') return !hasAttr('disabled') && !hasAttr('readonly');
        if (tag === 'input') {
            if (hasAttr('disabled') || hasAttr('readonly')) return false;
            const type = (((element as any).getAttribute?.('type') as string | null) ?? 'text').toLowerCase();
            return CSSSelector.MUTABLE_INPUT_TYPES.has(type);
        }
        const ce = typeof (element as any).getAttribute === 'function' ? (element as any).getAttribute('contenteditable') : null;
        return ce !== null && (ce as string).toLowerCase() !== 'false';
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

    private static elementSiblings(element: Element): any[] {
        const parent = element.parentNode as any;
        if (!parent || !('children' in parent)) return [];
        return Array.from(parent.children);
    }

    private static getChildIndexOfType(element: Element): number {
        const tag = (element.tagName || '').toLowerCase();
        let index = 0;
        for (const sibling of this.elementSiblings(element)) {
            if (sibling === element) return index;
            if (((sibling.tagName || '') as string).toLowerCase() === tag) index++;
        }
        return -1;
    }

    private static getChildIndexFromEnd(element: Element): number {
        const siblings = this.elementSiblings(element);
        const i = siblings.indexOf(element as any);
        return i === -1 ? -1 : siblings.length - 1 - i;
    }

    private static getChildIndexOfTypeFromEnd(element: Element): number {
        const tag = (element.tagName || '').toLowerCase();
        const same = this.elementSiblings(element).filter(s => ((s.tagName || '') as string).toLowerCase() === tag);
        const i = same.indexOf(element as any);
        return i === -1 ? -1 : same.length - 1 - i;
    }

    private static getElementSiblingCount(element: Element): number {
        return this.elementSiblings(element).length;
    }
}