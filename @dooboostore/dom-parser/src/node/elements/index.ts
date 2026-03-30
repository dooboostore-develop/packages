// Base Element interfaces and types
// export type { Element, DOMTokenList } from './Element';
export { HTMLCollectionImp, HTMLCollectionOfImp } from '../collection';



// Import all element classes
import { HTMLElement } from './HTMLElement';
import { ElementBase } from './ElementBase';
import { HTMLElementBase } from './HTMLElementBase';
import { HTMLAnchorElement } from './HTMLAnchorElement';
import { HTMLAreaElement } from './HTMLAreaElement';
import { HTMLAudioElement } from './HTMLAudioElement';
import { HTMLBaseElement } from './HTMLBaseElement';
import { HTMLBodyElement } from './HTMLBodyElement';
import { HTMLButtonElement } from './HTMLButtonElement';
import { HTMLCanvasElement } from './HTMLCanvasElement';
import { HTMLCaptionElement } from './HTMLCaptionElement';
import { HTMLDataElement } from './HTMLDataElement';
import { HTMLDataListElement } from './HTMLDataListElement';
import { HTMLDetailsElement } from './HTMLDetailsElement';
import { HTMLDialogElement } from './HTMLDialogElement';
import { HTMLDivElement } from './HTMLDivElement';
import { HTMLDListElement } from './HTMLDListElement';
import { HTMLEmbedElement } from './HTMLEmbedElement';
import { HTMLFieldSetElement } from './HTMLFieldSetElement';
import { HTMLFormElement } from './HTMLFormElement';
import { HTMLH1Element } from './HTMLH1Element';
import { HTMLHeadElement } from './HTMLHeadElement';
import { HTMLHRElement } from './HTMLHRElement';
import { HTMLHtmlElement } from './HTMLHtmlElement';
import { HTMLIFrameElement } from './HTMLIFrameElement';
import { HTMLImgElement } from './HTMLImgElement';
import { HTMLInputElement } from './HTMLInputElement';
import { HTMLLabelElement } from './HTMLLabelElement';
import { HTMLLegendElement } from './HTMLLegendElement';
import { HTMLLIElement } from './HTMLLIElement';
import { HTMLLinkElement } from './HTMLLinkElement';
import { HTMLMapElement } from './HTMLMapElement';
import { HTMLMetaElement } from './HTMLMetaElement';
import { HTMLMeterElement } from './HTMLMeterElement';
import { HTMLModElement } from './HTMLModElement';
import { HTMLObjectElement } from './HTMLObjectElement';
import { HTMLOListElement } from './HTMLOListElement';
import { HTMLOptGroupElement } from './HTMLOptGroupElement';
import { HTMLOptionElement } from './HTMLOptionElement';
import { HTMLOutputElement } from './HTMLOutputElement';
import { HTMLPElement } from './HTMLPElement';
import { HTMLParamElement } from './HTMLParamElement';
import { HTMLPictureElement } from './HTMLPictureElement';
import { HTMLPreElement } from './HTMLPreElement';
import { HTMLProgressElement } from './HTMLProgressElement';
import { HTMLQuoteElement } from './HTMLQuoteElement';
import { HTMLScriptElement } from './HTMLScriptElement';
import { HTMLSelectElement } from './HTMLSelectElement';
import { HTMLSlotElement } from './HTMLSlotElement';
import { HTMLSourceElement } from './HTMLSourceElement';
import { HTMLSpanElement } from './HTMLSpanElement';
import { HTMLStyleElement } from './HTMLStyleElement';
import { HTMLTableElement } from './HTMLTableElement';
import { HTMLTbodyElement } from './HTMLTbodyElement';
import { HTMLTdElement } from './HTMLTdElement';
import { HTMLTemplateElement } from './HTMLTemplateElement';
import { HTMLTextAreaElement } from './HTMLTextAreaElement';
import { HTMLTfootElement } from './HTMLTfootElement';
import { HTMLTheadElement } from './HTMLTheadElement';
import { HTMLThElement } from './HTMLThElement';
import { HTMLTimeElement } from './HTMLTimeElement';
import { HTMLTitleElement } from './HTMLTitleElement';
import { HTMLTrackElement } from './HTMLTrackElement';
import { HTMLTrElement } from './HTMLTrElement';
import { HTMLUListElement } from './HTMLUListElement';
import { HTMLVideoElement } from './HTMLVideoElement';
import { MathMLElement } from './MathMLElement';
import { SVGElement } from './SVGElement';
import { SVGCircleElement } from './SVGCircleElement';
import { SVGRectElement } from './SVGRectElement';

// Export all element classes
export {
  ElementBase,
  HTMLElementBase,
  HTMLElement,
  HTMLAnchorElement,
  HTMLAreaElement,
  HTMLAudioElement,
  HTMLBaseElement,
  HTMLBodyElement,
  HTMLButtonElement,
  HTMLCanvasElement,
  HTMLCaptionElement,
  HTMLDataElement,
  HTMLDataListElement,
  HTMLDetailsElement,
  HTMLDialogElement,
  HTMLDivElement,
  HTMLDListElement,
  HTMLEmbedElement,
  HTMLFieldSetElement,
  HTMLFormElement,
  HTMLH1Element,
  HTMLHeadElement,
  HTMLHRElement,
  HTMLHtmlElement,
  HTMLIFrameElement,
  HTMLImgElement,
  HTMLInputElement,
  HTMLLabelElement,
  HTMLLegendElement,
  HTMLLIElement,
  HTMLLinkElement,
  HTMLMapElement,
  HTMLMetaElement,
  HTMLMeterElement,
  HTMLModElement,
  HTMLObjectElement,
  HTMLOListElement,
  HTMLOptGroupElement,
  HTMLOptionElement,
  HTMLOutputElement,
  HTMLPElement,
  HTMLParamElement,
  HTMLPictureElement,
  HTMLPreElement,
  HTMLProgressElement,
  HTMLQuoteElement,
  HTMLScriptElement,
  HTMLSelectElement,
  HTMLSlotElement,
  HTMLSourceElement,
  HTMLSpanElement,
  HTMLStyleElement,
  HTMLTableElement,
  HTMLTbodyElement,
  HTMLTdElement,
  HTMLTemplateElement,
  HTMLTextAreaElement,
  HTMLTfootElement,
  HTMLTheadElement,
  HTMLThElement,
  HTMLTimeElement,
  HTMLTitleElement,
  HTMLTrackElement,
  HTMLTrElement,
  HTMLUListElement,
  HTMLVideoElement,
  MathMLElement,
  SVGElement,
  SVGCircleElement,
  SVGRectElement
};

// HTML Elements mapping
export const htmlElements = {
  a: HTMLAnchorElement,
  area: HTMLAreaElement,
  audio: HTMLAudioElement,
  base: HTMLBaseElement,
  body: HTMLBodyElement,
  button: HTMLButtonElement,
  canvas: HTMLCanvasElement,
  caption: HTMLCaptionElement,
  data: HTMLDataElement,
  datalist: HTMLDataListElement,
  details: HTMLDetailsElement,
  dialog: HTMLDialogElement,
  div: HTMLDivElement,
  dl: HTMLDListElement,
  embed: HTMLEmbedElement,
  fieldset: HTMLFieldSetElement,
  form: HTMLFormElement,
  h1: HTMLH1Element,
  head: HTMLHeadElement,
  hr: HTMLHRElement,
  html: HTMLHtmlElement,
  iframe: HTMLIFrameElement,
  img: HTMLImgElement,
  input: HTMLInputElement,
  label: HTMLLabelElement,
  legend: HTMLLegendElement,
  li: HTMLLIElement,
  link: HTMLLinkElement,
  map: HTMLMapElement,
  meta: HTMLMetaElement,
  meter: HTMLMeterElement,
  del: HTMLModElement,
  object: HTMLObjectElement,
  ol: HTMLOListElement,
  optgroup: HTMLOptGroupElement,
  option: HTMLOptionElement,
  output: HTMLOutputElement,
  p: HTMLPElement,
  param: HTMLParamElement,
  picture: HTMLPictureElement,
  pre: HTMLPreElement,
  progress: HTMLProgressElement,
  blockquote: HTMLQuoteElement,
  script: HTMLScriptElement,
  select: HTMLSelectElement,
  slot: HTMLSlotElement,
  source: HTMLSourceElement,
  span: HTMLSpanElement,
  style: HTMLStyleElement,
  table: HTMLTableElement,
  tbody: HTMLTbodyElement,
  td: HTMLTdElement,
  template: HTMLTemplateElement,
  textarea: HTMLTextAreaElement,
  tfoot: HTMLTfootElement,
  thead: HTMLTheadElement,
  th: HTMLThElement,
  time: HTMLTimeElement,
  title: HTMLTitleElement,
  track: HTMLTrackElement,
  tr: HTMLTrElement,
  ul: HTMLUListElement,
  video: HTMLVideoElement
} as const;

export const svgElements = {
  svg: SVGElement,
  circle: SVGCircleElement,
  rect: SVGRectElement
} as const;

export const mathmlElements = {
  annotation: MathMLElement,
  'annotation-xml': MathMLElement,
  maction: MathMLElement,
  math: MathMLElement,
  merror: MathMLElement,
  mfrac: MathMLElement,
  mi: MathMLElement,
  mmultiscripts: MathMLElement,
  mn: MathMLElement,
  mo: MathMLElement,
  mover: MathMLElement,
  mpadded: MathMLElement,
  mphantom: MathMLElement,
  mprescripts: MathMLElement,
  mroot: MathMLElement,
  mrow: MathMLElement,
  ms: MathMLElement,
  mspace: MathMLElement,
  msqrt: MathMLElement,
  mstyle: MathMLElement,
  msub: MathMLElement,
  msubsup: MathMLElement,
  msup: MathMLElement,
  mtable: MathMLElement,
  mtd: MathMLElement,
  mtext: MathMLElement,
  mtr: MathMLElement,
  munder: MathMLElement,
  munderover: MathMLElement,
  semantics: MathMLElement
} as const;

export type HTMLImageElement = HTMLImgElement;
export type HTMLParagraphElement = HTMLPElement;
export type HTMLHeadingElement = HTMLH1Element;
export type HTMLTableSectionElement = HTMLTbodyElement;
export type HTMLTableCellElement = HTMLTdElement;
export type HTMLTableRowElement = HTMLTrElement;
