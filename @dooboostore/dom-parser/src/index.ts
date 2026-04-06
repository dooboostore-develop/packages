import {DomParser, DomParserOptions} from './DomParser';

// Main exports - what users actually need
export {DomParser};
export {NodeIterator} from './node/NodeIterator';
export {NodeFilter} from './node/NodeFilter'
export { HTMLElementBase } from './node/elements/HTMLElementBase';
export { ElementBase } from './node/elements/ElementBase';
export { HTMLElement } from './node/elements/HTMLElement';
export { NodeBase } from './node/NodeBase';
export { ParentNodeBase } from './node/ParentNodeBase';
export { ChildNodeBase } from './node/ChildNodeBase';
export { DocumentBase } from './node/DocumentBase';
export { DocumentFragmentBase } from './node/DocumentFragmentBase';
export { ShadowRootBase } from './node/ShadowRootBase';
export { WindowBase } from './window/WindowBase';
export { ElementFactory } from './factory/ElementFactory';
// export { HTMLTemplateElement } from './factory/HTMLTemplateElement';
// Utility function to parse HTML and return window object
export const parseHTML = (html: string, option?: DomParserOptions) => {
  const parser = new DomParser(html, option);
  return parser.window;
};

// Default export
export default {
  DomParser,
  parseHTML
};

// Internal exports (commented out - users don't need these)
// export { WindowBase } from './window/WindowBase';
// export { Window } from './window/Window';
// export { Document } from "./node/Document";
// export { NodeIterator, NodeFilter } from "./node/NodeIterator";
// export * from "./factory";
// export * from "./node/elements";
// export { DocumentBase } from "./node/DocumentBase";
// export * from "./node/DocumentFragment";
// export { DocumentFragmentBase } from "./node/DocumentFragmentBase";
// export * from "./node/Node";
