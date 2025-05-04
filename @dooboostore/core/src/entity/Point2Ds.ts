import { Point2D } from './Point2D';
import { Rect } from './Rect';
import { Ellipse } from './Ellipse';

export class Point2Ds {
    public points: Point2D[];

    constructor(points: Point2D[]) {
        this.points = points;
    }

    copy() {
        return new Point2Ds(this.points.map(p => p.copy()));
    }

    isIn(point: Point2D): boolean {
        let isInside = false;
        const n = this.points.length;

        for (let i = 0, j = n - 1; i < n; j = i++) {
            const p1 = this.points[i];
            const p2 = this.points[j];

            const intersect = ((p1.y > point.y) !== (p2.y > point.y))
                && (point.x < (p2.x - p1.x) * (point.y - p1.y) / (p2.y - p1.y) + p1.x);

            if (intersect) {
                isInside = !isInside;
            }
        }

        return isInside;
    }

    isOut(point: Point2D): boolean {
        return !this.isIn(point);
    }

    isOverlap(data: Point2D | Point2Ds | Rect | Ellipse): boolean {
        if (data instanceof Point2D) {
            return this.isIn(data);
        }

        if (data instanceof Ellipse) {
            return data.isOverlap(this);
        }

        const targetPoints = data instanceof Rect ? [data.leftTop, data.rightTop, data.rightBottom, data.leftBottom] : data.points;

        for (const point of targetPoints) {
            if (this.isIn(point)) {
                return true;
            }
        }

        for (const point of this.points) {
            if (data.isIn(point)) {
                return true;
            }
        }

        return false;
    }

    toRect(): Rect {
        if (this.points.length === 0) {
            return new Rect(0, 0, 0, 0);
        }

        let minX = this.points[0].x;
        let minY = this.points[0].y;
        let maxX = this.points[0].x;
        let maxY = this.points[0].y;

        for (let i = 1; i < this.points.length; i++) {
            const p = this.points[i];
            minX = Math.min(minX, p.x);
            minY = Math.min(minY, p.y);
            maxX = Math.max(maxX, p.x);
            maxY = Math.max(maxY, p.y);
        }

        return new Rect(minX, minY, maxX - minX, maxY - minY);
    }
}