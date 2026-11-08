import { createMatcher } from './selector/factory';
import { splitTopLevel } from './selector/parse';
import { assertValidSelector } from './selector/validate';

/**
 * CSS Selector entry point.
 *
 * This class is a thin facade: parsing lives in `./selector/parse`,
 * matching in duck-typed {@link import('./selector/matchers').SelectorMatcher}
 * implementations composed by {@link import('./selector/factory').createMatcher},
 * and tree walking in `./selector/tree` + `./selector/complex`.
 *
 * Matching semantics are unchanged (right-to-left, browser-verified):
 * only the structure moved from one static god-class to polymorphic matchers.
 */
export class CSSSelector {
    /**
     * Main method to check if an element matches a CSS selector.
     * Handles comma lists and combinators (descendant, >, +, ~);
     * matching runs right-to-left like browsers.
     */
    static matches(element: Element, selector: string, scope?: any): boolean {
        // Public entry point: malformed selectors throw SyntaxError like browsers.
        assertValidSelector(selector);
        const matcher = createMatcher(selector);
        return matcher.matches(element as any, { scope: scope ?? element });
    }

    /**
     * Split a selector list on top-level commas (ignoring commas inside
     * brackets, parens, quotes or escapes). Use this instead of a naive
     * split(',') anywhere functional pseudo-classes may appear.
     */
    static splitSelectorList(selector: string): string[] {
        return splitTopLevel(selector, ',');
    }
}
