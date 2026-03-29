import { HTMLElementBase, HTMLGenericElement, htmlElements, svgElements, mathmlElements } from '../node/elements';

/**
 * Factory for creating HTML elements based on tag names
 */
export class ElementFactory {
  /**
   * Creates an HTML element based on the tag name
   */
  static createElement(tagName: string, ownerDocument?: any, options?: any): HTMLElementBase {
    const normalizedTagName = tagName.toLowerCase();
    const customElements = (ownerDocument as any)?.defaultView?.customElements;

    // 1. Check for Customized Built-in Elements (is="")
    const isAttribute = typeof options === 'string' ? options : options?.is;
    if (isAttribute && customElements && typeof customElements.get === 'function') {
      const CustomElementClass = customElements.get(isAttribute);
      if (CustomElementClass) {
        const element = new CustomElementClass() as any;
        element._tagName = tagName.toUpperCase();
        element.nodeName = tagName.toUpperCase();
        element._ownerDocument = ownerDocument;
        if (element.setAttribute) {
          element.setAttribute('is', isAttribute);
        }
        return element;
      }
    }

    // 2. Check for Autonomous Custom Elements
    if (normalizedTagName.includes('-') && customElements && typeof customElements.get === 'function') {
      const CustomElementClass = customElements.get(normalizedTagName);
      if (CustomElementClass) {
        const element = new CustomElementClass() as any;
        element._tagName = tagName.toUpperCase();
        element.nodeName = tagName.toUpperCase();
        element._ownerDocument = ownerDocument;
        return element;
      }
    }

    // 3. Check HTML elements

    for (const [tag, ElementClass] of Object.entries(htmlElements)) {
      if (tag === normalizedTagName) {
        return new ElementClass(tagName.toUpperCase(), ownerDocument) as HTMLElementBase;
      }
    }

    // Check SVG elements
    for (const [tag, ElementClass] of Object.entries(svgElements)) {
      if (tag === normalizedTagName) {
        return new ElementClass(tagName.toUpperCase(), ownerDocument) as HTMLElementBase;
      }
    }

    // Check MathML elements
    for (const [tag, ElementClass] of Object.entries(mathmlElements)) {
      if (tag === normalizedTagName) {
        return new ElementClass(tagName.toUpperCase(), ownerDocument) as HTMLElementBase;
      }
    }

    // For unknown elements, create a generic HTMLElement
    return new HTMLGenericElement(tagName.toUpperCase(), ownerDocument);
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
