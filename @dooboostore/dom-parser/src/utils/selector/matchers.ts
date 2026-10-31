import type { SelectorContext, SelectorMatcher } from './types';
import { splitCombinators } from './parse';
import { cssUnescape } from './parse';
import {
    isInputElement,
    isFirstChild,
    isLastChild,
    getChildIndex,
    getChildIndexOfType,
    getChildIndexFromEnd,
    getChildIndexOfTypeFromEnd,
    getElementSiblingCount,
    matchesNth,
    isReadWrite,
    rangeState,
    PLACEHOLDER_INPUT_TYPES,
} from './tree';

/**
 * Duck-typed matcher hierarchy: every selector node implements
 * {@link SelectorMatcher} and compound/complex nodes compose them.
 * Construction goes through `./factory` — never `new` directly outside it.
 */

export class TagMatcher implements SelectorMatcher {
    constructor(private readonly tagName: string) {}
    matches(element: any, _ctx: SelectorContext): boolean {
        return (element.tagName || '').toLowerCase() === this.tagName.toLowerCase();
    }
}

export class IdMatcher implements SelectorMatcher {
    constructor(private readonly id: string) {}
    matches(element: any, _ctx: SelectorContext): boolean {
        return element.id === this.id;
    }
}

export class ClassMatcher implements SelectorMatcher {
    constructor(private readonly className: string) {}
    matches(element: any, _ctx: SelectorContext): boolean {
        return (element.className || '').split(/\s+/).includes(this.className);
    }
}

export class UniversalMatcher implements SelectorMatcher {
    matches(_element: any, _ctx: SelectorContext): boolean {
        return true;
    }
}

export class NeverMatcher implements SelectorMatcher {
    matches(_element: any, _ctx: SelectorContext): boolean {
        return false;
    }
}

export type AttrOperator = '=' | '!=' | '*=' | '^=' | '$=' | '~=' | '|=' | '';

export class AttrMatcher implements SelectorMatcher {
    constructor(
        private readonly name: string,
        private readonly operator: AttrOperator,
        private readonly value: string,
        private readonly insensitive: boolean,
    ) {}

    matches(element: any, _ctx: SelectorContext): boolean {
        if (!this.operator) {
            return element.hasAttribute(this.name);
        }
        if (this.value === '' && (this.operator === '~=' || this.operator === '^=' || this.operator === '$=' || this.operator === '*=')) {
            return false;
        }
        const elementValue = element.getAttribute(this.name);
        if (elementValue === null) return false;
        const lhs = this.insensitive ? elementValue.toLowerCase() : elementValue;
        const rhs = this.insensitive ? this.value.toLowerCase() : this.value;
        switch (this.operator) {
            case '=':
                return lhs === rhs;
            case '!=':
                return lhs !== rhs;
            case '*=':
                return lhs.includes(rhs);
            case '^=':
                return lhs.startsWith(rhs);
            case '$=':
                return lhs.endsWith(rhs);
            case '~=':
                return lhs.split(/\s+/).includes(rhs);
            case '|=':
                return lhs === rhs || lhs.startsWith(rhs + '-');
            default:
                return false;
        }
    }
}

/**
 * Matches when the wrapped matcher does NOT match.
 * The content is absolute (whole-document, never relativized): inside a
 * :has() argument it evaluates with neither scope nor boundary, so ancestor
 * walks are unbounded while an explicit :scope still matches nothing
 * (the anchor is gone from the context entirely).
 */
export class NegationMatcher implements SelectorMatcher {
    constructor(private readonly inner: SelectorMatcher) {}
    matches(element: any, ctx: SelectorContext): boolean {
        return !this.inner.matches(element, NegationMatcher.absoluteCtx(ctx));
    }
    /** Strip :has()-relative evaluation state; top-level contexts pass through. */
    static absoluteCtx(ctx: SelectorContext): SelectorContext {
        if (ctx.hasBoundary === undefined) return ctx;
        return { ...ctx, scope: undefined, hasBoundary: undefined };
    }
}

/**
 * Matches when ANY of the inner matchers matches (forgiving: an
 * unbuildable branch is skipped, never fatal).
 * Contents are absolute (whole-document), so a :has() boundary never
 * propagates into them.
 */
export class AnyMatcher implements SelectorMatcher {
    constructor(private readonly alternatives: SelectorMatcher[]) {}
    matches(element: any, ctx: SelectorContext): boolean {
        const innerCtx = NegationMatcher.absoluteCtx(ctx);
        return this.alternatives.some(m => {
            try {
                return m.matches(element, innerCtx);
            } catch {
                return false;
            }
        });
    }
}

/**
 * `:nth-child(an+b [of S]?)` / `:nth-last-child(...)`: position counted
 * only among siblings matching S (1-based, from the start or the end).
 */
export class NthChildOfMatcher implements SelectorMatcher {
    constructor(
        private readonly anb: string,
        private readonly filter: SelectorMatcher,
        private readonly fromEnd: boolean,
    ) {}
    matches(element: any, ctx: SelectorContext): boolean {
        const parent = element ? element.parentNode : null;
        if (!parent) return false;
        const siblings = parent._childNodesInternal || parent.childNodes || [];
        const matching: any[] = [];
        for (let i = 0; i < siblings.length; i++) {
            const node = siblings[i];
            if (node && node.nodeType === 1) {
                try {
                    if (this.filter.matches(node, ctx)) matching.push(node);
                } catch {
                    // Forgiving: unmatchable siblings are skipped.
                }
            }
        }
        const index = matching.indexOf(element);
        if (index === -1) return false;
        const position = this.fromEnd ? matching.length - 1 - index : index;
        return matchesNth(position, this.anb);
    }
}

/**
 * `:has()`: true when a strict-relative of the element matches.
 * The argument is precompiled by the factory; evaluation runs it against
 * strict descendants with the anchor as an exclusive boundary, so the
 * anchor itself can never satisfy a compound (absolutized `:scope` binds
 * only the leading relative combinator) and an explicit `:scope` inside
 * never matches — both verified against Chromium.
 * Sibling-axis arguments (`+`/`~`) evaluate against following siblings
 * and their subtrees; `:is()`/`:where()`/`:not()` contents stay absolute
 * (whole-document, never relativized to the anchor).
 */
export class HasMatcher implements SelectorMatcher {
    constructor(
        private readonly inner: SelectorMatcher,
        private readonly raw: string,
    ) {}
    matches(element: any, ctx: SelectorContext): boolean {
        if (!element) return false;
        const hasCtx: SelectorContext = { ...ctx, scope: element, hasBoundary: element };
        const queue: any[] = HasMatcher.relativeRoots(element, this.raw);
        for (let head = 0; head < queue.length; head++) {
            const node = queue[head];
            if (!node) continue;
            if (node.nodeType === 1) {
                try {
                    if (this.inner.matches(node, hasCtx)) return true;
                } catch {
                    // Forgiving: an unmatchable candidate never matches.
                }
            }
            const children = node._childNodesInternal || node.childNodes;
            if (children) {
                for (let i = 0; i < children.length; i++) queue.push(children[i]);
            }
        }
        return false;
    }
    /** Candidate roots: strict descendants, or following siblings (+ subtrees) for sibling axes. */
    private static relativeRoots(element: any, raw: string): any[] {
        const children = element._childNodesInternal || element.childNodes || [];
        let leading: string | undefined;
        try {
            leading = splitCombinators(raw)[0]?.combinator;
        } catch {
            leading = undefined;
        }
        if (leading !== '+' && leading !== '~') {
            return [...children];
        }
        const roots: any[] = [];
        let sibling = element.nextSibling;
        while (sibling) {
            if (sibling.nodeType === 1) roots.push(sibling);
            sibling = sibling.nextSibling;
        }
        return roots;
    }
}

/**
 * A single compound component that is NOT a functional pseudo-class with
 * prebuilt semantics (tag/id/class/attr/universal/never).
 */
export type SimpleMatcher = TagMatcher | IdMatcher | ClassMatcher | UniversalMatcher | AttrMatcher | NeverMatcher | PseudoMatcher;

/**
 * A compound selector: every part must match. A compound containing
 * `:host*` never matches an element directly (verified browser semantics) —
 * it only resolves through the ancestor walk (see ComplexMatcher).
 */
export class CompoundMatcher implements SelectorMatcher {
    constructor(
        private readonly parts: SimpleMatcher[],
        readonly hasHost: boolean,
        readonly hostContext: boolean,
        private readonly hostInners: SelectorMatcher[],
    ) {}

    matches(element: any, ctx: SelectorContext): boolean {
        if (this.hasHost) return false;
        return this.parts.every(p => p.matches(element, ctx));
    }

    /** Test a resolved shadow host (or light-DOM ancestor for :host-context). */
    matchHostCandidate(candidate: any, ctx: SelectorContext): boolean {
        if (!this.parts.every(p => p.matches(candidate, ctx))) return false;
        for (const inner of this.hostInners) {
            try {
                if (!inner.matches(candidate, ctx)) return false;
            } catch {
                return false;
            }
        }
        return true;
    }
}

/**
 * A single pseudo-class component (e.g. ":nth-child(2n)", ":lang(en)").
 * Functional forms needing inner selectors (:not, :is, :where, :has) are
 * built as dedicated matchers by the factory instead.
 */
export class PseudoMatcher implements SelectorMatcher {
    constructor(
        private readonly name: string,
        private readonly arg: string | undefined,
    ) {}

    matches(element: any, ctx: SelectorContext): boolean {
        const pseudoName = this.name;
        const pseudoParam = this.arg;

        switch (pseudoName) {
            case 'scope':
                // :scope matches the scoping root itself (nwsapi#144 class:
                // no caches anywhere, so the scope can never go stale).
                // Inside :has(), an explicit :scope never matches (Chromium:
                // :has(:scope), :has(:scope .b), :has(> :scope) are all false).
                if (ctx.hasBoundary) return false;
                return element === ctx.scope;

            case 'checked':
                return isInputElement(element) &&
                    (element.getAttribute('checked') !== null ||
                        element.getAttribute('selected') !== null);

            case 'disabled':
                return element.hasAttribute('disabled');

            case 'enabled':
                return !element.hasAttribute('disabled');

            case 'focus':
                return element.hasAttribute('autofocus') ||
                    element.getAttribute('data-focused') === 'true';

            case 'first':
            case 'first-child':
                return isFirstChild(element);

            case 'last':
            case 'last-child':
                return isLastChild(element);

            case 'even':
                return getChildIndex(element) % 2 === 0;

            case 'odd':
                return getChildIndex(element) % 2 === 1;

            case 'nth-child':
                if (pseudoParam) {
                    return matchesNth(getChildIndex(element), pseudoParam);
                }
                return false;

            case 'eq':
                if (pseudoParam) {
                    const n = parseInt(pseudoParam, 10);
                    return getChildIndex(element) === n;
                }
                return false;

            case 'gt':
                if (pseudoParam) {
                    const n = parseInt(pseudoParam, 10);
                    return getChildIndex(element) > n;
                }
                return false;

            case 'lt':
                if (pseudoParam) {
                    const n = parseInt(pseudoParam, 10);
                    return getChildIndex(element) < n;
                }
                return false;

            case 'contains':
                if (pseudoParam) {
                    const text = pseudoParam.replace(/^['"]|['"]$/g, '');
                    return (element.textContent || '').includes(text);
                }
                return false;

            case 'visible':
                return !element.hasAttribute('hidden') &&
                    element.getAttribute('style')?.includes('display:none') !== true;

            case 'hidden':
                return element.hasAttribute('hidden') ||
                    element.getAttribute('style')?.includes('display:none') === true;

            case 'nth-of-type':
                if (pseudoParam) {
                    return matchesNth(getChildIndexOfType(element), pseudoParam);
                }
                return false;

            case 'nth-last-child':
                if (pseudoParam) {
                    return matchesNth(getChildIndexFromEnd(element), pseudoParam);
                }
                return false;

            case 'nth-last-of-type':
                if (pseudoParam) {
                    return matchesNth(getChildIndexOfTypeFromEnd(element), pseudoParam);
                }
                return false;

            case 'first-of-type':
                return getChildIndexOfType(element) === 0;

            case 'last-of-type':
                return getChildIndexOfTypeFromEnd(element) === 0;

            case 'empty': {
                for (const child of (element as any).childNodes ?? []) {
                    if (child.nodeType === 1) return false;
                    if ((child.nodeType === 3 || child.nodeType === 4) &&
                        typeof child.data === 'string' && child.data.trim() !== '') return false;
                }
                return true;
            }

            case 'root':
                return (element as any).ownerDocument?.documentElement === element;

            case 'only-child':
                return getChildIndex(element) === 0 && getElementSiblingCount(element) === 1;

            case 'only-of-type':
                return getChildIndexOfType(element) === 0 && getChildIndexOfTypeFromEnd(element) === 0;

            case 'lang': {
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
                const tag = (element.tagName || '').toLowerCase();
                return (tag === 'a' || tag === 'area' || tag === 'link') && element.hasAttribute('href');
            }

            case 'visited':
                return false;

            case 'required': {
                const tag = (element.tagName || '').toLowerCase();
                const type = (element.getAttribute?.('type') || '').toLowerCase();
                const requirable = tag === 'select' || tag === 'textarea' ||
                    (tag === 'input' && type !== 'hidden');
                return requirable && element.hasAttribute('required');
            }

            case 'optional': {
                const tag = (element.tagName || '').toLowerCase();
                const type = (element.getAttribute?.('type') || '').toLowerCase();
                if (tag === 'button') return true;
                if (tag === 'input' && type === 'hidden') return true;
                const requirable = tag === 'select' || tag === 'textarea' ||
                    (tag === 'input' && type !== 'hidden');
                return requirable && !element.hasAttribute('required');
            }

            case 'read-write':
                return isReadWrite(element);

            case 'read-only':
                return !isReadWrite(element);

            case 'placeholder-shown': {
                if (typeof (element as any).getAttribute !== 'function') return false;
                if ((element as any).getAttribute('placeholder') === null) return false;
                const tag = ((element.tagName || '') as string).toLowerCase();
                if (tag === 'textarea') {
                    return ((element as any).textContent ?? '') === '';
                }
                if (tag !== 'input') return false;
                const type = (((element as any).getAttribute('type') as string | null) ?? 'text').toLowerCase();
                if (!PLACEHOLDER_INPUT_TYPES.has(type)) return false;
                // NOTE: read the content attribute, not the IDL field —
                // the parser populates the attribute map directly and
                // IDL fields only sync on later setAttribute() calls.
                return ((element as any).getAttribute('value') ?? '') === '';
            }

            case 'target': {
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

            case 'in-range':
                return rangeState(element) === 'in';

            case 'out-of-range':
                return rangeState(element) === 'out';

            default:
                return false;
        }
    }
}
