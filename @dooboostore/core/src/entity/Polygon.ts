import { Point2D } from './Point2D';
import { Rect } from './Rect';
import { Ellipse } from './Ellipse';
import { Point2Ds } from './Point2Ds';

/**
 * Represents a polygon, a closed shape defined by a sequence of connected points.
 * This class uses the Point2Ds class for its core geometric calculations.
 */
export class Polygon {
    /**
     * An instance of Point2Ds used for geometric calculations.
     * @private
     */
    private _point2ds: Point2Ds;

    /**
     * Creates a new Polygon instance.
     * @param points An array of Point2D objects representing the vertices of the polygon in order.
     */
    constructor(points: Point2D[]) {
        this._point2ds = new Point2Ds(points);
    }

    get point2ds() {
        return this._point2ds.points;
    }


    /**
     * Creates a deep copy of this polygon.
     * @returns A new Polygon instance with the same points.
     */
    copy(): Polygon {
        return new Polygon(this._point2ds.points.map(p => p.copy()));
    }

    /**
     * Checks if a given point is inside the polygon.
     * Uses the ray-casting algorithm.
     * @param point The point to check.
     * @returns True if the point is inside the polygon, false otherwise.
     */
    isIn(point: Point2D): boolean {
        return this._point2ds.isIn(point);
    }

    /**
     * Checks if a given point is outside the polygon.
     * @param point The point to check.
     * @returns True if the point is outside the polygon, false otherwise.
     */
    isOut(point: Point2D): boolean {
        return !this.isIn(point);
    }

    /**
     * Checks if this polygon overlaps with another geometric shape.
     * This check is based on vertex containment and may not cover all edge-crossing scenarios without vertex containment.
     * @param data The geometric shape to check for overlap with (Point2D, Rect, Ellipse, or another Polygon).
     * @returns True if the shapes overlap, false otherwise.
     */
    isOverlap(data: Point2D | Rect | Ellipse | Polygon): boolean {
        if (data instanceof Polygon) {
            // Check for overlap with another Polygon by using their underlying Point2Ds instances.
            return this._point2ds.isOverlap(data._point2ds);
        }
        // For other shapes, delegate the check to the Point2Ds instance.
        return this._point2ds.isOverlap(data);
    }

    /**
     * Calculates the axis-aligned bounding box of the polygon.
     * @returns A Rect representing the smallest rectangle that contains all vertices of the polygon.
     */
    toRect(): Rect {
        return this._point2ds.toRect();
    }
}
