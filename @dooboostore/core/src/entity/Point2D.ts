import { Vector } from './Vector';

export class Point2D {
    public x: number;
    public y: number;

    constructor(data: {x?: number, y?: number});
    constructor(x?: number, y?: number);
    constructor(x?: number | {x?: number, y?: number} | Vector , y?: number) {
        if (typeof x === 'object') {
            this.x = x.x ?? 0;
            this.y = x.y ?? 0;
        } else {
            this.x = x ?? 0;
            this.y = y ?? 0;
        }
    }

    copy() {
        return new Point2D(this.x, this.y);
    }
}
