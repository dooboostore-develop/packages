import type { ChainLink, Combinator, SelectorContext, SelectorMatcher } from './types';
import {
    getTreeRoot,
    previousElementSibling,
    findMatchingSibling,
    findMatchingAncestor,
} from './tree';
import type { CompoundMatcher } from './matchers';

/**
 * A full complex selector: rightmost compound plus combinator-linked
 * compounds to its left. Matching runs right-to-left like browsers.
 * Duck-typed traversal: ancestor/sibling walks accept predicate callbacks.
 */
export class ComplexMatcher implements SelectorMatcher {
    constructor(private readonly chain: { compound: CompoundMatcher; combinator: Combinator }[]) {}

    matches(element: any, ctx: SelectorContext): boolean {
        const chain = this.chain;
        if (chain.length === 0) return false;

        let current: any = element;
        let i = chain.length - 1;
        if (!chain[i].compound.matches(current, ctx)) return false;

        while (i > 0) {
            const combinator = chain[i].combinator;
            const prev = chain[i - 1].compound;
            if (combinator === '>') {
                current = current.parentNode;
                if (!current || (current !== ctx.scope && current.nodeType !== 1) || !this.matchCompound(prev, current, ctx)) return false;
            } else if (combinator === '+') {
                current = previousElementSibling(current);
                if (!current || !this.matchCompound(prev, current, ctx)) return false;
            } else if (combinator === '~') {
                current = findMatchingSibling(current, n => this.matchCompound(prev, n, ctx));
                if (!current) return false;
            } else {
                current = this.matchAncestor(current, prev, ctx);
                if (!current) return false;
            }
            i--;
        }

        // A leading explicit combinator (relative selector, e.g. inside :has())
        // constrains the element against the relative base: the :has() anchor
        // when one is active, otherwise the query scope.
        const relativeBase = ctx.hasBoundary ?? ctx.scope;
        const first = chain[0].combinator;
        if (first === '>') {
            if (!current || current.parentNode !== relativeBase) return false;
        } else if (first === '+') {
            if (!current || previousElementSibling(current) !== relativeBase) return false;
        } else if (first === '~') {
            let sibling = current ? previousElementSibling(current) : null;
            let found = false;
            while (sibling) {
                if (sibling === relativeBase) { found = true; break; }
                sibling = previousElementSibling(sibling);
            }
            if (!found) return false;
        }

        return true;
    }

    private matchCompound(compound: CompoundMatcher, node: any, ctx: SelectorContext): boolean {
        // :has() anchors are exclusive boundaries: no compound in the
        // argument may match the anchor itself.
        if (ctx.hasBoundary !== undefined && node === ctx.hasBoundary) return false;
        return compound.matches(node, ctx);
    }

    private matchAncestor(current: any, compound: CompoundMatcher, ctx: SelectorContext): any {
        if (compound.hasHost) {
            const root = getTreeRoot(current);
            const host = root && root.nodeType === 11 && (root as any).host ? (root as any).host : null;
            if (!host) return null;
            if (compound.matchHostCandidate(host, ctx)) return host;
            // :host-context() additionally tests the host's light-DOM ancestors.
            if (compound.hostContext) {
                let ancestor = host.parentNode;
                while (ancestor) {
                    if (ancestor.nodeType === 1 && compound.matchHostCandidate(ancestor, ctx)) return ancestor;
                    ancestor = ancestor.parentNode;
                }
            }
            return null;
        }
        return findMatchingAncestor(current, n => compound.matches(n, ctx), ctx.scope, ctx.hasBoundary);
    }
}

/**
 * Comma-separated selector list: matches when any alternative matches.
 * All alternatives are prebuilt by the factory (forgiving: an unbuildable
 * branch is dropped, never fatal).
 */
export class SelectorListMatcher implements SelectorMatcher {
    constructor(private readonly alternatives: SelectorMatcher[]) {}

    matches(element: any, ctx: SelectorContext): boolean {
        return this.alternatives.some(m => {
            try {
                return m.matches(element, ctx);
            } catch {
                return false;
            }
        });
    }
}
