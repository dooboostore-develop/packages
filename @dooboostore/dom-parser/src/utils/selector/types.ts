/**
 * Shared types for the selector engine.
 * Matching is polymorphic: every selector node implements {@link SelectorMatcher},
 * and construction goes through the factory (`./factory`).
 */

export interface SelectorContext {
  /** The scoping root: queried element, document element, or shadow host tree root. */
  scope?: any;
}

export interface SelectorMatcher {
  matches(element: any, ctx: SelectorContext): boolean;
}

export type Combinator = ' ' | '>' | '+' | '~';

export interface ChainLink {
  compound: string;
  combinator: Combinator;
}
