import { SVGElement } from './SVGElement';

/**
 * The **`SVGCircleElement`** class represents an SVG `<circle>` element.
 * 
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/SVGCircleElement)
 */
export class SVGCircleElement extends SVGElement {
    private _cx: number = 0;
    private _cy: number = 0;
    private _r: number = 0;

    constructor(tagName: string, ownerDocument?: any) {
        super(tagName, ownerDocument);
    }

    get cx(): number {
        return this._cx;
    }

    set cx(value: number) {
        this._cx = value;
        this.setAttribute('cx', value.toString());
    }

    get cy(): number {
        return this._cy;
    }

    set cy(value: number) {
        this._cy = value;
        this.setAttribute('cy', value.toString());
    }

    get r(): number {
        return this._r;
    }

    set r(value: number) {
        this._r = value;
        this.setAttribute('r', value.toString());
    }

    // Override setAttribute to sync with properties
    setAttribute(qualifiedName: string, value: string): void {
        super.setAttribute(qualifiedName, value);
        
        const name = qualifiedName.toLowerCase();
        switch (name) {
            case 'cx':
                this._cx = parseFloat(value) || 0;
                break;
            case 'cy':
                this._cy = parseFloat(value) || 0;
                break;
            case 'r':
                this._r = parseFloat(value) || 0;
                break;
        }
    }
}