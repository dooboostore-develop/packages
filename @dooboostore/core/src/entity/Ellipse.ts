import { Point2D } from './Point2D';
import { Rect } from './Rect';
import { Point2Ds } from './Point2Ds';

export class Ellipse extends Point2D {
    public radiusX: number;
    public radiusY: number;
    public rotation: number; // in radians
    public startAngle: number; // in radians
    public endAngle: number; // in radians

    constructor(x: number, y: number, radiusX: number, radiusY: number, rotation: number = 0, startAngle: number = 0, endAngle: number = 2 * Math.PI) {
        super(x, y);
        this.radiusX = radiusX;
        this.radiusY = radiusY;
        this.rotation = rotation;
        this.startAngle = startAngle;
        this.endAngle = endAngle;
    }

    isIn(point: Point2D): boolean {
        if (this.radiusX <= 0 || this.radiusY <= 0) {
            return false;
        }

        // 1. Translate point to ellipse's local coordinates
        const translatedX = point.x - this.x;
        const translatedY = point.y - this.y;

        // 2. Rotate the translated point backwards by the ellipse's rotation
        const cos = Math.cos(-this.rotation);
        const sin = Math.sin(-this.rotation);
        const localX = translatedX * cos - translatedY * sin;
        const localY = translatedX * sin + translatedY * cos;

        // 3. Check if the point is within the ellipse equation
        const isInsideEllipse = (localX * localX) / (this.radiusX * this.radiusX) + (localY * localY) / (this.radiusY * this.radiusY) <= 1;

        if (!isInsideEllipse) {
            return false;
        }

        // 4. Check if the point is within the start and end angles (for arcs)
        const angle = Math.atan2(localY, localX);

        // Normalize angle to be between 0 and 2*PI
        const normalizedAngle = angle < 0 ? angle + 2 * Math.PI : angle;

        if (this.startAngle < this.endAngle) {
            return normalizedAngle >= this.startAngle && normalizedAngle <= this.endAngle;
        } else { // For arcs that cross the 0-radian line (e.g., from 3/2 PI to 1/2 PI)
            return normalizedAngle >= this.startAngle || normalizedAngle <= this.endAngle;
        }
    }

    isOut(point: Point2D): boolean {
        return !this.isIn(point);
    }

    isOverlap(data: Point2D | Rect | Point2Ds | Ellipse): boolean {
        if (data instanceof Point2D) {
            return this.isIn(data);
        } else if (data instanceof Rect) {
            // This is a simplified check. For full accuracy, polygon-ellipse collision is needed.
            const rectAsPoints = new Point2Ds([data.leftTop, data.rightTop, data.rightBottom, data.leftBottom]);
            if (rectAsPoints.isOverlap(this)) return true;
            return this.toRect().isOverlap(data); // Check bounding boxes
        } else if (data instanceof Point2Ds) {
            return data.isOverlap(this);
        } else if ((data as any) instanceof Ellipse) {
            // This is a simplified check and doesn't handle all rotation cases perfectly.
            const distance = Math.sqrt(Math.pow(this.x - (data as Ellipse).x, 2) + Math.pow(this.y - (data as Ellipse).y, 2));
            const avgRadius1 = (this.radiusX + this.radiusY) / 2;
            const avgRadius2 = ((data as Ellipse).radiusX + (data as Ellipse).radiusY) / 2;
            return distance <= (avgRadius1 + avgRadius2);
        }
        return false;
    }

    toRect(): Rect {
        // Returns the axis-aligned bounding box for the ellipse (including rotation)
        if (this.rotation === 0) {
            return new Rect(this.x - this.radiusX, this.y - this.radiusY, this.radiusX * 2, this.radiusY * 2);
        }
        const angle = this.rotation;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const w = this.radiusX;
        const h = this.radiusY;

        const extentsX = Math.sqrt(w * w * cos * cos + h * h * sin * sin);
        const extentsY = Math.sqrt(w * w * sin * sin + h * h * cos * cos);

        return new Rect(this.x - extentsX, this.y - extentsY, extentsX * 2, extentsY * 2);
    }
}
