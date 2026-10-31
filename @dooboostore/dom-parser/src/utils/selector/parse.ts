import type { ChainLink, Combinator } from './types';

/**
 * Selector text parsing. Pure functions, no DOM access.
 * Moved verbatim out of the old CSSSelector god-class.
 */

/**
 * Index just past the CSS escape starting at i (selector[i] === '\\').
 * Hex escapes (`\39 `) consume 1-6 hex digits plus one optional
 * whitespace; anything else consumes exactly one following character.
 */
export function consumeEscape(selector: string, i: number): number {
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
export function cssUnescape(s: string): string {
    let out = '';
    for (let i = 0; i < s.length; i++) {
        if (s[i] !== '\\' || i + 1 >= s.length) {
            out += s[i];
            continue;
        }
        const end = consumeEscape(s, i);
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
export function splitTopLevel(selector: string, delimiter: string): string[] {
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
            const end = consumeEscape(selector, i);
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
export function splitCombinators(selector: string): ChainLink[] {
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
            const end = consumeEscape(selector, i);
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
    const chain: ChainLink[] = [];
    let pending: Combinator = ' ';
    parts.forEach((part, index) => {
        if (index > 0) {
            const c = combinators[index - 1] as Combinator;
            if (c !== ' ') pending = c;
        }
        if (part.trim()) {
            chain.push({ compound: part.trim(), combinator: pending });
            pending = ' ';
        }
    });

    return chain;
}

/**
 * Split a compound selector into individual components
 * e.g., "div.user-panel[data-id='123']" -> ["div", ".user-panel", "[data-id='123']"]
 */
export function splitCompound(selector: string): string[] {
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
            const end = consumeEscape(selector, i);
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
 * Split "name(args)" into a [name, args] pair with balanced parens.
 * Returns arg === undefined when there is no parameter list.
 */
export function splitPseudo(selector: string): { name: string; arg: string | undefined } {
    const openParen = selector.indexOf('(');
    if (openParen === -1) {
        return { name: selector, arg: undefined };
    }
    const closeParen = selector.lastIndexOf(')');
    if (closeParen < openParen) {
        return { name: selector, arg: undefined };
    }
    return {
        name: selector.substring(0, openParen),
        arg: selector.substring(openParen + 1, closeParen),
    };
}

/** True for :host / :host(...) / :host-context(...) components. */
export function isHostComponent(component: string): boolean {
    return component === ':host' || component.startsWith(':host(') || component.startsWith(':host-context(');
}
