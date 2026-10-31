/**
 * Shared types for the selector engine.
 * Matching is polymorphic: every selector node implements {@link SelectorMatcher},
 * and construction goes through the factory (`./factory`).
 */

export interface SelectorContext {
  /** The scoping root: queried element, document element, or shadow host tree root. */
  scope?: any;
  /**
   * The `:has()` anchor currently being tested. While set, compound matching
   * must never succeed against the anchor itself (the absolutized `:scope`
   * only binds the leading relative combinator), and an explicit `:scope`
   * matches nothing (verified Chromium behavior).
   */
  hasBoundary?: any;
}

export interface SelectorMatcher {
  matches(element: any, ctx: SelectorContext): boolean;
}

export type Combinator = ' ' | '>' | '+' | '~';

export interface ChainLink {
  compound: string;
  combinator: Combinator;
}
