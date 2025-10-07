import { HTMLElementBase, HTMLGenericElement, htmlElements, svgElements, mathmlElements } from '../node/elements';

/**
 * Factory for creating HTML elements based on tag names
 */
export class ElementFactory {
    /**
     * Creates an HTML element based on the tag name
     */
    static createElement(tagName: string, ownerDocument?: any): HTMLElementBase {
        const normalizedTagName = tagName.toLowerCase();
        
        // Check HTML elements
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
        return [
            ...ElementFactory.getSupportedHTMLTagNames(),
            ...ElementFactory.getSupportedSVGTagNames(),
            ...ElementFactory.getSupportedMathMLTagNames()
        ];
    }
}