import { HTMLElementBase, htmlElements, svgElements, mathmlElements, HTMLElement, SVGElement, MathMLElement } from '../node/elements';
import { SVG_NAMESPACE, MATHML_NAMESPACE, adjustSVGTagName } from '../utils/namespaces';

// Global construction stack to pass attributes down to HTMLElementBase constructor
export const constructionStack: any[] = [];

/**
 * Factory for creating HTML elements based on tag names
 */
export class ElementFactory {
  static constructionStack = constructionStack;
  /**
   * Creates an SVG/MathML element with the spec-correct qualified name.
   * `adjustCase` maps the input to the stored qualified name
   * (e.g. "foreignObject" for SVG, lowercase for MathML).
   */
  private static createForeignElement(
    tagName: string,
    ownerDocument: any,
    options: any,
    table: Record<string, any>,
    FallbackClass: any,
    adjustCase: (t: string) => string
  ): HTMLElementBase {
    const qualifiedName = adjustCase(tagName);
    const ElementClass = (table as any)[tagName.toLowerCase()] ?? FallbackClass;
    const element = new ElementClass(qualifiedName, ownerDocument) as any;
    // getAttribute() must work right after construction (custom elements,
    // attributeChangedCallback), so apply parsed attributes immediately.
    if (options && typeof options === 'object' && options.parsedAttributes) {
      for (const [name, value] of options.parsedAttributes.entries()) {
        element._attributes.set(name, value);
        if (name === 'id') element._id = value;
        else if (name === 'class') element._className = value;
      }
    }
    return element as HTMLElementBase;
  }
  /**
   * Creates an HTML element based on the tag name
   */
  static createElement(tagName: string, ownerDocument?: any, options?: any): HTMLElementBase {
    const normalizedTagName = tagName.toLowerCase();
    const customElements = (ownerDocument as any)?.defaultView?.customElements;
    const namespaceURI: string | null =
      (options && typeof options === 'object' ? options.namespaceURI : undefined) ?? null;

    // Foreign namespaces before custom-element/HTML handling: the qualified
    // name keeps its spec case (e.g. "path", "foreignObject") so that
    // tagName is NOT upper-cased for SVG/MathML elements.
    if (namespaceURI === SVG_NAMESPACE) {
      return ElementFactory.createForeignElement(
        tagName, ownerDocument, options, svgElements, SVGElement, adjustSVGTagName
      );
    }
    if (namespaceURI === MATHML_NAMESPACE) {
      return ElementFactory.createForeignElement(
        tagName, ownerDocument, options, mathmlElements, MathMLElement, (t: string) => t.toLowerCase()
      );
    }

    // Prepare construction data
    const constructionData = {
      tagName: tagName.toUpperCase(),
      ownerDocument,
      parsedAttributes: options?.parsedAttributes
    };

    // Get 'is' attribute for customized built-ins
    const isAttribute = typeof options === 'string' ? options : options?.is;
    const isInert = typeof options === 'object' && options?.inert === true;

    // 1. Check for Customized Built-in Elements (is="")
    // For customized built-ins, we need to create the BASE native element first,
    // then let customElements.upgrade() convert it to the custom element later.
    // We should NOT create a new custom element instance here, because that breaks
    // the identity for native elements like body, head, html.
    if (isAttribute) {
      // For now, if is="" is present, still create the custom element directly
      // (This is for when customElements is already registered before createElement is called)
      if (!isInert && customElements && typeof customElements.get === 'function') {
        const CustomElementClass = customElements.get(isAttribute);
        if (CustomElementClass) {
          constructionStack.push(constructionData);
          try {
            const element = new CustomElementClass() as any;
            // Apply attributes immediately so getAttribute works after constructor
            if (options && options.parsedAttributes) {
              for (const [name, value] of options.parsedAttributes.entries()) {
                element._attributes.set(name, value);
                if (name === 'id') element._id = value;
                else if (name === 'class') element._className = value;
              }
            }
            if (element.setAttribute) {
              element._attributes.set('is', isAttribute); // Set internal directly
            }
            return element;
          } finally {
            constructionStack.pop();
          }
        }
      }

      // FALLBACK: If 'is' is provided but the element is not registered in customElements,
      // create the native element and set the is attribute.
      // customElements.upgrade() will be called later when the custom element is registered.
      // This is the correct behavior for customized built-in elements.
    }

    // 2. Check for Autonomous Custom Elements (or preserve unknown custom tags)
    if (normalizedTagName.includes('-')) {
      const ce = customElements?.get(normalizedTagName);
      if (normalizedTagName === 'center-threads-page') {
        // console.log(`[DEBUG ElementFactory] center-threads-page! isInert: ${isInert}, hasCustomElements: ${!!customElements}, ceClass: ${!!ce}`);
      }

      if (!isInert && customElements && typeof customElements.get === 'function') {
        const CustomElementClass = customElements.get(normalizedTagName);
        if (CustomElementClass) {
          constructionStack.push(constructionData);
          try {
            const element = new CustomElementClass() as any;
            if (options && options.parsedAttributes) {
              for (const [name, value] of options.parsedAttributes.entries()) {
                element._attributes.set(name, value);
                if (name === 'id') element._id = value;
                else if (name === 'class') element._className = value;
              }
            }
            return element;
          } finally {
            constructionStack.pop();
          }
        }
      }
      // No registered custom element yet – keep the tag name intact.
      const el = new HTMLElement(tagName.toUpperCase(), ownerDocument) as any;
      if (options && options.parsedAttributes) {
        for (const [name, value] of options.parsedAttributes.entries()) {
          el._attributes.set(name, value);
          if (name === 'id') el._id = value;
          else if (name === 'class') el._className = value;
        }
      }
      return el;
    }

    // 3. Check HTML elements
    for (const [tag, ElementClass] of Object.entries(htmlElements)) {
      if (tag === normalizedTagName) {
        const element = new ElementClass(tagName.toUpperCase(), ownerDocument) as HTMLElementBase;
        // Apply attributes including 'is' if present
        if (options && options.parsedAttributes) {
          for (const [name, value] of options.parsedAttributes.entries()) {
            (element as any)._attributes.set(name, value);
            if (name === 'id') (element as any)._id = value;
            else if (name === 'class') (element as any)._className = value;
          }
        }
        // Set is attribute if present
        if (isAttribute) {
          (element as any)._attributes.set('is', isAttribute);
        }
        return element;
      }
    }

    // NOTE: no SVG/MathML table lookup here on purpose. Per the DOM spec,
    // document.createElement() always creates HTML-namespace elements, so
    // an SVG-named tag in an HTML context is an unknown element with an
    // upper-cased tagName (e.g. "PATH"), exactly like browsers.
    // SVG/MathML elements are created via the namespace-aware path above
    // (parser context or createElementNS), which keeps the spec case.

    // For unknown elements, create a generic HTMLElement
    return new HTMLElement(tagName.toUpperCase(), ownerDocument);
  }

  /**
   * Get all supported HTML tag names
   */
  static getSupportedHTMLTagNames(): string[] {
    return Object.keys(htmlElements);
  }

  /**
   * Get all supported SVG tag names
   */
  static getSupportedSVGTagNames(): string[] {
    return Object.keys(svgElements);
  }

  /**
   * Get all supported MathML tag names
   */
  static getSupportedMathMLTagNames(): string[] {
    return Object.keys(mathmlElements);
  }

  /**
   * Get all supported tag names
   */
  static getSupportedTagNames(): string[] {
    return [...ElementFactory.getSupportedHTMLTagNames(), ...ElementFactory.getSupportedSVGTagNames(), ...ElementFactory.getSupportedMathMLTagNames()];
  }
}
