/**
 * Namespace URIs and helpers for HTML/SVG/MathML element handling.
 * Per WHATWG DOM/HTML specs.
 */

export const HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml';
export const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
export const MATHML_NAMESPACE = 'http://www.w3.org/1998/Math/MathML';

/**
 * SVG tag name adjustments, per the HTML spec
 * (https://html.spec.whatwg.org/multipage/parsing.html#parsing-main-inforeign).
 * Maps the ASCII-lowercased tag name to the correct camelCase qualified name.
 */
export const svgTagFixups: Record<string, string> = {
  altglyph: 'altGlyph',
  altglyphdef: 'altGlyphDef',
  altglyphitem: 'altGlyphItem',
  animatecolor: 'animateColor',
  animatemotion: 'animateMotion',
  animatetransform: 'animateTransform',
  clippath: 'clipPath',
  feblend: 'feBlend',
  fecolormatrix: 'feColorMatrix',
  fecomponenttransfer: 'feComponentTransfer',
  fecomposite: 'feComposite',
  feconvolvematrix: 'feConvolveMatrix',
  fediffuselighting: 'feDiffuseLighting',
  fedisplacementmap: 'feDisplacementMap',
  fedistantlight: 'feDistantLight',
  fedropshadow: 'feDropShadow',
  feflood: 'feFlood',
  fefunca: 'feFuncA',
  fefuncb: 'feFuncB',
  fefuncg: 'feFuncG',
  fefuncr: 'feFuncR',
  fegaussianblur: 'feGaussianBlur',
  feimage: 'feImage',
  femerge: 'feMerge',
  femergenode: 'feMergeNode',
  femorphology: 'feMorphology',
  feoffset: 'feOffset',
  fepointlight: 'fePointLight',
  fespecularlighting: 'feSpecularLighting',
  fespotlight: 'feSpotLight',
  fetile: 'feTile',
  feturbulence: 'feTurbulence',
  foreignobject: 'foreignObject',
  lineargradient: 'linearGradient',
  radialgradient: 'radialGradient',
  textpath: 'textPath'
};

/**
 * SVG attribute name adjustments, per the HTML spec
 * (https://html.spec.whatwg.org/multipage/parsing.html#adjust-svg-attributes).
 * Maps the ASCII-lowercased name to the correct camelCase qualified name.
 */
export const svgAttrFixups: Record<string, string> = {
  attributename: 'attributeName',
  attributetype: 'attributeType',
  basefrequency: 'baseFrequency',
  baseprofile: 'baseProfile',
  calcmode: 'calcMode',
  clippathunits: 'clipPathUnits',
  diffuseconstant: 'diffuseConstant',
  edgemode: 'edgeMode',
  filterunits: 'filterUnits',
  glyphref: 'glyphRef',
  gradienttransform: 'gradientTransform',
  gradientunits: 'gradientUnits',
  kernelmatrix: 'kernelMatrix',
  kernelunitlength: 'kernelUnitLength',
  keypoints: 'keyPoints',
  keysplines: 'keySplines',
  keytimes: 'keyTimes',
  lengthadjust: 'lengthAdjust',
  limitingconeangle: 'limitingConeAngle',
  markerheight: 'markerHeight',
  markerunits: 'markerUnits',
  markerwidth: 'markerWidth',
  maskcontentunits: 'maskContentUnits',
  maskunits: 'maskUnits',
  numoctaves: 'numOctaves',
  pathlength: 'pathLength',
  patterncontentunits: 'patternContentUnits',
  patterntransform: 'patternTransform',
  patternunits: 'patternUnits',
  pointsatx: 'pointsAtX',
  pointsaty: 'pointsAtY',
  pointsatz: 'pointsAtZ',
  preservealpha: 'preserveAlpha',
  preserveaspectratio: 'preserveAspectRatio',
  primitiveunits: 'primitiveUnits',
  refx: 'refX',
  refy: 'refY',
  repeatcount: 'repeatCount',
  repeatdur: 'repeatDur',
  requiredextensions: 'requiredExtensions',
  requiredfeatures: 'requiredFeatures',
  specularconstant: 'specularConstant',
  specularexponent: 'specularExponent',
  spreadmethod: 'spreadMethod',
  startoffset: 'startOffset',
  stddeviation: 'stdDeviation',
  stitchtiles: 'stitchTiles',
  surfacescale: 'surfaceScale',
  systemlanguage: 'systemLanguage',
  tablevalues: 'tableValues',
  targetx: 'targetX',
  targety: 'targetY',
  textlength: 'textLength',
  viewbox: 'viewBox',
  viewtarget: 'viewTarget',
  xchannelselector: 'xChannelSelector',
  ychannelselector: 'yChannelSelector',
  zoomandpan: 'zoomAndPan',
};

/**
 * Returns the qualified (case-correct) tag name for an SVG element.
 */
export function adjustSVGTagName(tagName: string): string {
  const lower = tagName.toLowerCase();
  return svgTagFixups[lower] ?? lower;
}

/**
 * Normalizes a storage key for attributes: SVG elements keep the adjusted
 * camelCase qualified name, everything else is ASCII-lowercased — matching
 * what browsers store and serialize.
 */
export function normalizeAttributeName(name: string, namespaceURI: string | null): string {
  if (namespaceURI === SVG_NAMESPACE) {
    return svgAttrFixups[name.toLowerCase()] ?? name.toLowerCase();
  }
  return name.toLowerCase();
}

/**
 * Determines the namespace for a newly parsed child element tag.
 * - `<svg>` in an HTML context switches to the SVG namespace.
 * - `<math>` in an HTML context switches to the MathML namespace.
 * - Otherwise the parent context is inherited.
 */
export function elementNamespaceForTag(tagName: string, parentNS: string | null): string | null {
  const lower = tagName.toLowerCase();
  if (lower === 'svg' && parentNS !== SVG_NAMESPACE) {
    return SVG_NAMESPACE;
  }
  if (lower === 'math' && parentNS !== MATHML_NAMESPACE) {
    return MATHML_NAMESPACE;
  }
  return parentNS;
}

/**
 * Determines the namespace context for an element's *children*.
 * `<foreignObject>` is an HTML integration point: its children are HTML.
 */
export function childNamespaceForElement(localName: string, elementNS: string | null): string | null {
  if (elementNS === SVG_NAMESPACE && localName.toLowerCase() === 'foreignobject') {
    return null;
  }
  return elementNS;
}
