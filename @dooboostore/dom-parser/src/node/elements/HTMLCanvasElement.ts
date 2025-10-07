import { HTMLElementBase } from './HTMLElementBase';

export class HTMLCanvasElement extends HTMLElementBase {
    private _width: number = 300;
    private _height: number = 150;

    constructor(tagName: string = 'canvas', ownerDocument?: any) {
        super(tagName, ownerDocument);
    }

    get width(): number {
        const widthAttr = this.getAttribute('width');
        if (widthAttr !== null) {
            const parsed = parseInt(widthAttr, 10);
            return isNaN(parsed) ? 300 : parsed;
        }
        return this._width;
    }

    set width(value: number) {
        this._width = value;
        this.setAttribute('width', value.toString());
    }

    get height(): number {
        const heightAttr = this.getAttribute('height');
        if (heightAttr !== null) {
            const parsed = parseInt(heightAttr, 10);
            return isNaN(parsed) ? 150 : parsed;
        }
        return this._height;
    }

    set height(value: number) {
        this._height = value;
        this.setAttribute('height', value.toString());
    }

    // Canvas context methods - return null for server-side rendering
    getContext(contextId: string, options?: any): any {
        // In server-side environment, we can't provide real canvas context
        // Return null to indicate context is not available
        return null;
    }

    toDataURL(type?: string, quality?: any): string {
        // Return empty data URL for server-side rendering
        return 'data:,';
    }

    toBlob(callback: (blob: Blob | null) => void, type?: string, quality?: any): void {
        // Call callback with null blob for server-side rendering
        setTimeout(() => callback(null), 0);
    }

    // Canvas size methods
    getBoundingClientRect(): DOMRect {
        // Return a basic DOMRect for server-side rendering
        return {
            x: 0,
            y: 0,
            width: this.width,
            height: this.height,
            top: 0,
            right: this.width,
            bottom: this.height,
            left: 0,
            toJSON: () => ({})
        } as DOMRect;
    }
}