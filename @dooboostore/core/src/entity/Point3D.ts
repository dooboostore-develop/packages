import { Vector } from './Vector';
import { Point2D } from './Point2D';

export class Point3D extends Point2D {
    public z: number;

    constructor(data: Vector);
    constructor(data: {x?: number, y?: number, z?: number});
    constructor(x?: number, y?: number, z?: number);
    constructor(x?: number | {x?: number, y?: number, z?: number} | Vector, y?: number, z?: number) {
        if (x instanceof Vector) {
            super(x.x, x.y);
            this.z = x.z;
        } else if (typeof x === 'object') {
            super({x: x.x ?? 0, y: x.y ?? 0})
            this.z = x.z ?? 0;
        } else {
            super(x,y)
            this.z = z ?? 0;
        }
    }

    copy() {
        return new Point3D(this.x, this.y, this.z);
    }
}
