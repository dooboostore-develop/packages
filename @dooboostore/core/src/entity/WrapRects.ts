import { Rect } from './Rect';
import { Size } from './Size';
import { ArrayUtils } from '../array/ArrayUtils';
import { Point2D } from './Point2D';
import { Ellipse } from './Ellipse';

export class WrapRects {
    public rects: Set<Rect>;
    public x: number;
    public y: number;
    public width: number;
    public height: number;

    constructor(x: number, y: number, width: number, height: number, rects: Rect[] = []) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.rects = new Set(rects);
    }

    private _calculateContentBounds(): Rect {
        if (this.rects.size === 0) {
            return new Rect(this.x, this.y, this.width, this.height);
        }

        let minX = this.x;
        let minY = this.y;
        let maxX = this.x + this.width;
        let maxY = this.y + this.height;

        for (const r of Array.from(this.rects)) {
            minX = Math.min(minX, r.x);
            minY = Math.min(minY, r.y);
            maxX = Math.max(maxX, r.x + r.width);
            maxY = Math.max(maxY, r.y + r.height);
        }

        return new Rect(minX, minY, maxX - minX, maxY - minY);
    }

    add(...newRects: Rect[]): void {
        newRects.forEach(rect => this.rects.add(rect));
        const contentBounds = this._calculateContentBounds();
        this.x = contentBounds.x;
        this.y = contentBounds.y;
        this.width = contentBounds.width;
        this.height = contentBounds.height;
    }

    remove(rectToRemove: Rect): void {
        this.rects.delete(rectToRemove);
        // Note: x, y, width, height are not automatically shrunk on remove.
        // A separate method like 'reFit()' would be needed for that.
    }

    getContainedRectsOverallBounds(): Rect {
        if (this.rects.size === 0) {
            return new Rect(0, 0, 0, 0);
        }

        let minX = Array.from(this.rects)[0].x;
        let minY = Array.from(this.rects)[0].y;
        let maxX = Array.from(this.rects)[0].x + Array.from(this.rects)[0].width;
        let maxY = Array.from(this.rects)[0].y + Array.from(this.rects)[0].height;

        for (const r of Array.from(this.rects.values())) {
            minX = Math.min(minX, r.x);
            minY = Math.min(minY, r.y);
            maxX = Math.max(maxX, r.x + r.width);
            maxY = Math.max(maxY, r.y + r.height);
        }

        return new Rect(minX, minY, maxX - minX, maxY - minY);
    }

    copy(): WrapRects {
        return new WrapRects(this.x, this.y, this.width, this.height, Array.from(this.rects).map(r => r.copy()));
    }

    filterRectsIn(targetRect: Rect): WrapRects {
        const filteredRects = Array.from(this.rects).filter(r => targetRect.isIn(r));
        return new WrapRects(this.x, this.y, this.width, this.height, filteredRects);
    }

    filterRectsOut(targetRect: Rect): WrapRects {
        const filteredRects = Array.from(this.rects).filter(r => !targetRect.isOverlap(r));
        return new WrapRects(this.x, this.y, this.width, this.height, filteredRects);
    }

    filterRectsOverlap(targetRect: Rect): WrapRects {
        const filteredRects = Array.from(this.rects).filter(r => targetRect.isOverlap(r));
        return new WrapRects(this.x, this.y, this.width, this.height, filteredRects);
    }

    findEmptySpace(size: Size, searchArea?: Rect): Rect | null {
        const bounds = searchArea || new Rect(this.x, this.y, this.width, this.height);
        const step = 1; // Check every 1 unit

        for (let y = bounds.y; y < bounds.y + bounds.height - size.height; y += step) {
            for (let x = bounds.x; x < bounds.x + bounds.width - size.width; x += step) {
                const candidateRect = new Rect(x, y, size.width, size.height);
                let overlaps = false;
                for (const existingRect of Array.from(this.rects)) {
                    if (candidateRect.isOverlap(existingRect)) {
                        overlaps = true;
                        break;
                    }
                }
                if (!overlaps) {
                    return candidateRect;
                }
            }
        }
        return null;
    }

    findRandomEmptySpace(size: Size, searchArea?: Rect, maxAttempts: number = 100): Rect | null {
        const bounds = searchArea || new Rect(this.x, this.y, this.width, this.height);

        for (let i = 0; i < maxAttempts; i++) {
            const randomX = Math.random() * (bounds.width - size.width) + bounds.x;
            const randomY = Math.random() * (bounds.height - size.height) + bounds.y;
            const candidateRect = new Rect(randomX, randomY, size.width, size.height);

            let overlaps = false;
            for (const existingRect of Array.from(this.rects.values())) {
                if (candidateRect.isOverlap(existingRect)) {
                    overlaps = true;
                    break;
                }
            }
            if (!overlaps) {
                return candidateRect;
            }
        }
        return null;
    }


    addRandomEmptySpaces(sizes: Size[], searchArea?: Rect, maxAttempts?: number) {
        const rs: Rect[] = [];
        sizes.forEach(size => {
            const emptySpace = this.findRandomEmptySpace(size, searchArea, maxAttempts);
            if (emptySpace) {
                this.add(emptySpace);
                rs.push(emptySpace);
            }
        });
        return rs;
    }
    addRandomEmptySpace(size: Size, searchArea?: Rect, maxAttempts?: number): Rect | null {
        const emptySpace = this.findRandomEmptySpace(size, searchArea, maxAttempts);
        if (emptySpace) {
            this.add(emptySpace);
        }
        return emptySpace;
    }

    isIn(point: Point2D): boolean {
        return this.toRect().isIn(point);
    }

    isOut(point: Point2D): boolean {
        return !this.isIn(point);
    }

    isOverlap(data: Point2D | Rect | Ellipse | WrapRects): boolean {
        if (data instanceof Point2D) {
            return this.isIn(data);
        }

        if (data instanceof Ellipse) {
            return data.isOverlap(this.toRect());
        }

        if (data instanceof Rect) {
            return this.toRect().isOverlap(data);
        }

        if (data instanceof WrapRects) {
            return this.toRect().isOverlap(data.toRect());
        }

        return false;
    }

    toRect(): Rect {
        return new Rect(this.x, this.y, this.width, this.height);
    }
}
