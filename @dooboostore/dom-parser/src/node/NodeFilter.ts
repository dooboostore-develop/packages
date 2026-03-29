// import { Node } from './Node';

/**
 * NodeFilter interface for filtering nodes in NodeIterator and TreeWalker
 */
// export interface NodeFilter {
//   acceptNode(node: Node): number;
// }

/**
 * NodeFilter constants and static methods
 */
export const NodeFilter: {
  readonly FILTER_ACCEPT: number;
  readonly FILTER_REJECT: number;
  readonly FILTER_SKIP: number;
  readonly SHOW_ALL: number;
  readonly SHOW_ELEMENT: number;
  readonly SHOW_ATTRIBUTE: number;
  readonly SHOW_TEXT: number;
  readonly SHOW_CDATA_SECTION: number;
  readonly SHOW_ENTITY_REFERENCE: number;
  readonly SHOW_ENTITY: number;
  readonly SHOW_PROCESSING_INSTRUCTION: number;
  readonly SHOW_COMMENT: number;
  readonly SHOW_DOCUMENT: number;
  readonly SHOW_DOCUMENT_TYPE: number;
  readonly SHOW_DOCUMENT_FRAGMENT: number;
  readonly SHOW_NOTATION: number;
} = {
  // Constants for acceptNode return values
  FILTER_ACCEPT: 1,
  FILTER_REJECT: 2,
  FILTER_SKIP: 3,

  // Constants for whatToShow
  SHOW_ALL: 0xffffffff,
  SHOW_ELEMENT: 0x1,
  SHOW_ATTRIBUTE: 0x2,
  SHOW_TEXT: 0x4,
  SHOW_CDATA_SECTION: 0x8,
  SHOW_ENTITY_REFERENCE: 0x10,
  SHOW_ENTITY: 0x20,
  SHOW_PROCESSING_INSTRUCTION: 0x40,
  SHOW_COMMENT: 0x80,
  SHOW_DOCUMENT: 0x100,
  SHOW_DOCUMENT_TYPE: 0x200,
  SHOW_DOCUMENT_FRAGMENT: 0x400,
  SHOW_NOTATION: 0x800
};
