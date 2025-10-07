import { SVGElement } from './SVGElement';

/**
 * The **`SVGRectElement`** class represents an SVG `<rect>` element.
 * 
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/SVGRectElement)
 */
export class SVGRectElement extends SVGElement {
    private _x: number = 0;
    private _y: number = 0;
    private _width: number = 0;
    private _height: number = 0;

    constructor(tagName: string, ownerDocument?: any) {
        super(tagName, ownerDocument);
    }

    get x(): number {
        return this._x;
    }

    set x(value: number) {
        this._x = value;
        this.setAttribute('x', value.toString());
    }

    get y(): number {
        return this._y;
    }

    set y(value: number) {
        this._y = value;
        this.setAttribute('y', value.toString());
    }

    get width(): number {
        return this._width;
    }

    set width(value: number) {
        this._width = value;
        this.setAttribute('width', value.toString());
    }

    get height(): number {
        return this._height;
    }

    set height(value: number) {
        this._height = value;
        this.setAttribute('height', value.toString());
    }

    // Override setAttribute to sync with properties
    setAttribute(qualifiedName: string, value: string): void {
        super.setAttribute(qualifiedName, value);
        
        const name = qualifiedName.toLowerCase();
        switch (name) {
            case 'x':
                this._x = parseFloat(value) || 0;
                break;
            case 'y':
                this._y = parseFloat(value) || 0;
                break;
            case 'width':
                this._width = parseFloat(value) || 0;
                break;
            case 'height':
                this._height = parseFloat(value) || 0;
                break;
        }
    }
}