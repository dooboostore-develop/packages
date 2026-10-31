import type { ChainLink, SelectorMatcher } from './types';
import { splitTopLevel, splitCombinators, splitCompound, splitPseudo, cssUnescape, isHostComponent } from './parse';
import {
    TagMatcher,
    IdMatcher,
    ClassMatcher,
    UniversalMatcher,
    AttrMatcher,
    NegationMatcher,
    AnyMatcher,
    HasMatcher,
    PseudoMatcher,
    CompoundMatcher,
    NeverMatcher,
    type SimpleMatcher,
    type AttrOperator,
} from './matchers';
import { ComplexMatcher, SelectorListMatcher } from './complex';

const TAG_RE = /^[a-zA-Z][a-zA-Z0-9:-]*$/;
const ATTR_RE = /^([^=!*^$~|]+)(?:([=!*^$~|]+)(['"]?)([^'"]*)(['"]?))?$/;

/**
 * Selector factory: the only sanctioned way to build matchers.
 * Parsing is forgiving — anything unrecognized becomes a matcher
 * that matches nothing, never a throw.
 */
const COMPILED_CACHE_MAX = 500;
const compiledCache = new Map<string, SelectorMatcher>();

function buildMatcher(selector: string): SelectorMatcher {
    const parts = splitTopLevel(selector, ',').map(s => s.trim()).filter(Boolean);
    if (parts.length === 0) return new NeverMatcher();
    if (parts.length === 1) return createComplex(parts[0]);
    return new SelectorListMatcher(parts.map(createComplex));
}

/**
 * Cached entry point: compiled matchers are pure (match results are never
 * stored), so caching them is safe — unlike caching *results*, which goes
 * stale on DOM mutation (cf. happy-dom#2489).
 */
export function createMatcher(selector: string): SelectorMatcher {
    const cached = compiledCache.get(selector);
    if (cached) return cached;
    const built = buildMatcher(selector);
    if (compiledCache.size >= COMPILED_CACHE_MAX) {
        const oldest = compiledCache.keys().next();
        if (!oldest.done) compiledCache.delete(oldest.value);
    }
    compiledCache.set(selector, built);
    return built;
}

export function createComplex(selector: string): SelectorMatcher {
    const chain = splitCombinators(selector);
    if (chain.length === 0) return new NeverMatcher();
    return new ComplexMatcher(
        chain.map(({ compound, combinator }: ChainLink) => ({
            compound: createCompound(compound),
            combinator,
        })),
    );
}

export function createCompound(selector: string): CompoundMatcher {
    const parts: SimpleMatcher[] = [];
    const inners: SelectorMatcher[] = [];
    let hasHost = false;
    let hostContext = false;
    for (const component of splitCompound(selector)) {
        if (isHostComponent(component)) {
            hasHost = true;
            if (component.startsWith(':host-context(')) hostContext = true;
            if (component !== ':host') {
                const inner = component.slice(component.indexOf('(') + 1, -1);
                try {
                    inners.push(createMatcher(inner));
                } catch {
                    // Forgiving: drop unbuildable :host() arguments.
                }
            }
            continue;
        }
        parts.push(createSimple(component));
    }
    return new CompoundMatcher(parts, hasHost, hostContext, inners);
}

export function createSimple(component: string): SimpleMatcher {
    const c = component.trim();
    if (c === '*') return new UniversalMatcher();
    if (c.startsWith('#')) return new IdMatcher(cssUnescape(c.slice(1)));
    if (c.startsWith('.')) return new ClassMatcher(cssUnescape(c.slice(1)));
    if (c.startsWith('[') && c.endsWith(']')) return createAttr(c);
    if (c.startsWith(':')) {
        const { name, arg } = splitPseudo(c.slice(1));
        if (name === 'not') {
            if (arg === undefined || !arg.trim()) return new NeverMatcher();
            try {
                return new NegationMatcher(createMatcher(arg));
            } catch {
                return new NeverMatcher();
            }
        }
        if ((name === 'is' || name === 'where') && arg !== undefined) {
            const alternatives: SelectorMatcher[] = [];
            for (const part of splitTopLevel(arg, ',')) {
                const sel = part.trim();
                if (!sel) continue;
                try {
                    alternatives.push(createMatcher(sel));
                } catch {
                    // Forgiving: skip invalid branches.
                }
            }
            return new AnyMatcher(alternatives);
        }
        if (name === 'has' && arg !== undefined) {
            try {
                return new HasMatcher(createMatcher(arg));
            } catch {
                return new NeverMatcher();
            }
        }
        return new PseudoMatcher(name, arg);
    }
    const unescaped = cssUnescape(c);
    if (TAG_RE.test(unescaped)) return new TagMatcher(unescaped);
    return new NeverMatcher();
}

function createAttr(compound: string): SimpleMatcher {
    let attrContent = compound.slice(1, -1);
    let insensitive = false;
    const modMatch = attrContent.match(/^(.*?)\s+([iI])$/);
    if (modMatch && /[=!*^$~|]/.test(modMatch[1])) {
        insensitive = true;
        attrContent = modMatch[1];
    }
    const match = attrContent.match(ATTR_RE);
    if (!match) return new NeverMatcher();
    const name = cssUnescape(match[1].trim());
    const operator = (match[2] || '') as AttrOperator;
    const value = cssUnescape(match[4] || '');
    return new AttrMatcher(name, operator, value, insensitive);
}
