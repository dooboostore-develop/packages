// Base Element interfaces and types
export { Element, DOMTokenList } from './Element';
export { HTMLCollection, HTMLCollectionOf } from '../collection';

// Base Element implementations
export { ElementBase } from './ElementBase';
export { HTMLElementBase } from './HTMLElementBase';
export { HTMLGenericElement } from './HTMLGenericElement';

// Import all element classes
import { HTMLAnchorElement } from './HTMLAnchorElement';
import { HTMLBodyElement } from './HTMLBodyElement';
import { HTMLDivElement } from './HTMLDivElement';
import { HTMLSpanElement } from './HTMLSpanElement';
import { HTMLPElement } from './HTMLPElement';
import { HTMLImgElement } from './HTMLImgElement';
import { HTMLButtonElement } from './HTMLButtonElement';
import { HTMLCanvasElement } from './HTMLCanvasElement';
import { HTMLInputElement } from './HTMLInputElement';
import { HTMLH1Element } from './HTMLH1Element';
import { HTMLHeadElement } from './HTMLHeadElement';
import { HTMLHtmlElement } from './HTMLHtmlElement';
import { HTMLTitleElement } from './HTMLTitleElement';
import { HTMLLinkElement } from './HTMLLinkElement';
import { HTMLScriptElement } from './HTMLScriptElement';
import { HTMLStyleElement } from './HTMLStyleElement';
import { HTMLFormElement } from './HTMLFormElement';
import { HTMLTableElement } from './HTMLTableElement';
import { HTMLUListElement } from './HTMLUListElement';
import { HTMLOListElement } from './HTMLOListElement';
import { HTMLLIElement } from './HTMLLIElement';
import { SVGElement } from './SVGElement';
import { SVGCircleElement } from './SVGCircleElement';
import { SVGRectElement } from './SVGRectElement';
import { HTMLMetaElement } from './HTMLMetaElement';
import { HTMLTemplateElement } from './HTMLTemplateElement';
import { HTMLTheadElement } from './HTMLTheadElement';
import { HTMLTfootElement } from './HTMLTfootElement';
import { HTMLTrElement } from './HTMLTrElement';
import { HTMLTdElement } from './HTMLTdElement';
import { HTMLThElement } from './HTMLThElement';
import { HTMLCaptionElement } from './HTMLCaptionElement';
import { HTMLTbodyElement } from './HTMLTbodyElement';
import { HTMLEmbedElement } from './HTMLEmbedElement';
import { HTMLAreaElement } from './HTMLAreaElement';
import { HTMLBaseElement } from './HTMLBaseElement';
import { MathMLElement } from './MathMLElement';

// Export all element classes
export {
    HTMLAnchorElement,
    HTMLBodyElement,
    HTMLDivElement,
    HTMLHeadElement,
    HTMLHtmlElement,
    HTMLSpanElement,
    HTMLPElement,
    HTMLImgElement,
    HTMLButtonElement,
    HTMLCanvasElement,
    HTMLInputElement,
    HTMLH1Element,
    HTMLTitleElement,
    HTMLLinkElement,
    HTMLScriptElement,
    HTMLStyleElement,
    HTMLFormElement,
    HTMLTableElement,
    HTMLUListElement,
    HTMLOListElement,
    HTMLLIElement,
    SVGElement,
    SVGCircleElement,
    SVGRectElement,
    HTMLMetaElement,
    HTMLTemplateElement,
    HTMLTheadElement,
    HTMLTfootElement,
    HTMLTrElement,
    HTMLTdElement,
    HTMLThElement,
    HTMLCaptionElement,
    HTMLTbodyElement,
    HTMLEmbedElement,
    HTMLAreaElement,
    HTMLBaseElement,
    MathMLElement,
};

// HTML Elements mapping with explicit string keys for proper type inference
export const htmlElements = {
    'a': HTMLAnchorElement,
    'body': HTMLBodyElement,
    'button': HTMLButtonElement,
    'canvas': HTMLCanvasElement,
    'div': HTMLDivElement,
    'h1': HTMLH1Element,
    'head': HTMLHeadElement,
    'html': HTMLHtmlElement,
    'img': HTMLImgElement,
    'input': HTMLInputElement,
    'p': HTMLPElement,
    'meta': HTMLMetaElement,
    'span': HTMLSpanElement,
    'title': HTMLTitleElement,
    'link': HTMLLinkElement,
    'script': HTMLScriptElement,
    'style': HTMLStyleElement,
    'form': HTMLFormElement,
    'table': HTMLTableElement,
    'ul': HTMLUListElement,
    'ol': HTMLOListElement,
    'li': HTMLLIElement,
    'template': HTMLTemplateElement,
    'thead': HTMLTheadElement,
    'tfoot': HTMLTfootElement,
    'tr': HTMLTrElement,
    'td': HTMLTdElement,
    'th': HTMLThElement,
    'caption': HTMLCaptionElement,
    'tbody': HTMLTbodyElement,
    'embed': HTMLEmbedElement,
    'area': HTMLAreaElement,
    'base': HTMLBaseElement,
} as const;

// SVG Elements mapping with explicit string keys
export const svgElements = {
    'svg': SVGElement,
    'circle': SVGCircleElement,
    'rect': SVGRectElement,
} as const;

// MathML Elements mapping - all use MathMLElement
export const mathmlElements = {
    'annotation': MathMLElement,
    'annotation-xml': MathMLElement,
    'maction': MathMLElement,
    'math': MathMLElement,
    'merror': MathMLElement,
    'mfrac': MathMLElement,
    'mi': MathMLElement,
    'mmultiscripts': MathMLElement,
    'mn': MathMLElement,
    'mo': MathMLElement,
    'mover': MathMLElement,
    'mpadded': MathMLElement,
    'mphantom': MathMLElement,
    'mprescripts': MathMLElement,
    'mroot': MathMLElement,
    'mrow': MathMLElement,
    'ms': MathMLElement,
    'mspace': MathMLElement,
    'msqrt': MathMLElement,
    'mstyle': MathMLElement,
    'msub': MathMLElement,
    'msubsup': MathMLElement,
    'msup': MathMLElement,
    'mtable': MathMLElement,
    'mtd': MathMLElement,
    'mtext': MathMLElement,
    'mtr': MathMLElement,
    'munder': MathMLElement,
    'munderover': MathMLElement,
    'semantics': MathMLElement,
} as const;

// Type-safe tag name mappings - back to the working approach
export type HTMLElementTagNameMap = {
    [K in keyof typeof htmlElements]: InstanceType<typeof htmlElements[K]>;
};

export type SVGElementTagNameMap = {
    [K in keyof typeof svgElements]: InstanceType<typeof svgElements[K]>;
};

export type MathMLElementTagNameMap = {
    [K in keyof typeof mathmlElements]: InstanceType<typeof mathmlElements[K]>;
};

export interface HTMLElementDeprecatedTagNameMap {
    // deprecated 태그들
}

// Type aliases for Document interface compatibility
export type HTMLImageElement = HTMLImgElement;