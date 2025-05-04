import { Point3D } from './Point3D';
import { Rect } from './Rect';

export class Point3Ds {
    public points: Point3D[];

    constructor(points: Point3D[]) {
        this.points = points;
    }

    copy(): Point3Ds {
        return new Point3Ds(this.points.map(p => p.copy()));
    }

    /**
     * Calculates the Axis-Aligned Bounding Box of the points.
     * An Axis-Aligned Bounding Box is the smallest box that contains all the points, aligned with the coordinate axes.
     * @returns An object with the minimum and maximum corner points of the box.
     */
    getAxisAlignedBoundingBox(): { min: Point3D, max: Point3D } {
        if (this.points.length === 0) {
            return { min: new Point3D(0, 0, 0), max: new Point3D(0, 0, 0) };
        }

        const min = this.points[0].copy();
        const max = this.points[0].copy();

        for (let i = 1; i < this.points.length; i++) {
            const p = this.points[i];
            min.x = Math.min(min.x, p.x);
            min.y = Math.min(min.y, p.y);
            min.z = Math.min(min.z, p.z);
            max.x = Math.max(max.x, p.x);
            max.y = Math.max(max.y, p.y);
            max.z = Math.max(max.z, p.z);
        }

        return { min, max };
    }

    /**
     * Checks if a point is inside the Axis-Aligned Bounding Box of this set of points.
     * Note: This is a check against the bounding box, not the exact shape of the polyhedron.
     * @param point The point to check.
     * @returns True if the point is inside the bounding box, false otherwise.
     */
    isIn(point: Point3D): boolean {
        if (this.points.length === 0) {
            return false;
        }
        const { min, max } = this.getAxisAlignedBoundingBox();
        return (
            point.x >= min.x && point.x <= max.x &&
            point.y >= min.y && point.y <= max.y &&
            point.z >= min.z && point.z <= max.z
        );
    }

    /**
     * Checks if a point is outside the Axis-Aligned Bounding Box of this set of points.
     * @param point The point to check.
     * @returns True if the point is outside the bounding box, false otherwise.
     */
    isOut(point: Point3D): boolean {
        return !this.isIn(point);
    }

    /**
     * Checks for overlap with another 3D object based on their Axis-Aligned Bounding Boxes.
     * @param data The object to check for overlap with (Point3D or Point3Ds).
     * @returns True if their bounding boxes overlap, false otherwise.
     */
    isOverlap(data: Point3D | Point3Ds): boolean {
        if (data instanceof Point3D) {
            return this.isIn(data);
        }

        if (data instanceof Point3Ds) {
            if (this.points.length === 0 || data.points.length === 0) {
                return false;
            }
            const a = this.getAxisAlignedBoundingBox();
            const b = data.getAxisAlignedBoundingBox();

            // Check for overlap on each axis
            const xOverlap = a.min.x <= b.max.x && a.max.x >= b.min.x;
            const yOverlap = a.min.y <= b.max.y && a.max.y >= b.min.y;
            const zOverlap = a.min.z <= b.max.z && a.max.z >= b.min.z;

            return xOverlap && yOverlap && zOverlap;
        }

        return false;
    }

    toRect(): Rect {
        if (this.points.length === 0) {
            return new Rect(0, 0, 0, 0);
        }

        const { min, max } = this.getAxisAlignedBoundingBox();
        return new Rect(min.x, min.y, max.x - min.x, max.y - min.y);
    }
}
