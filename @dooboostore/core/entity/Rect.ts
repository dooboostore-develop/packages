import { Point2D } from './Point2D';
import { MathUtil } from '../math/MathUtil';

export class Rect {
    private _start: Point2D;
    private _width: number
    private _height: number
    constructor(point: Point2D, endPoint: Point2D);
    constructor(point: Point2D, width?:number, height?:number);
    constructor(x:number , y :number, width? :number, height?:number);
    constructor(xOrPoint:number | Point2D , yOrPointOrWidth: number | Point2D, widthOrHeight = 0, heightOrUndefined = 0) {
        if (xOrPoint instanceof Point2D && yOrPointOrWidth instanceof Point2D) {
            this._start = xOrPoint;
            this.end = yOrPointOrWidth;
        } else if (xOrPoint instanceof Point2D && typeof yOrPointOrWidth === 'number') {
            this._start = xOrPoint;
            this._width = yOrPointOrWidth;
            this._height = widthOrHeight
        } else if (typeof xOrPoint === 'number' && typeof yOrPointOrWidth === 'number') {
            this._start = new Point2D(xOrPoint, yOrPointOrWidth);
            this._width = widthOrHeight;
            this._height = heightOrUndefined;
        }
    }

    get x(): number {
        return this.start.x;
    }

    set x(x: number) {
        this.start.x = x;
    }

    get y(): number {
        return this.start.y;
    }

    set y(y: number) {
        this.start.y = y;
    }



    get endX(): number {
        return this.end.x;
    }

    set endX(value: number) {
        this.width = value - this.x;
    }

    set endXPercent(endXPercent: number) {
        this.endX = MathUtil.getValueByTotInPercent(this.width, endXPercent);
    }

    get endY(): number {
        return this.end.y;
    }

    set endYPercent(endYPercent: number) {
        this.endY = MathUtil.getValueByTotInPercent(this.height, endYPercent);
    }

    set endY(value: number) {
        this.height = value - this.y;
    }

    get startCopy(): Point2D {
        return this._start.copy();
    }

    get start(): Point2D {
        return this._start;
    }

    set start(value: Point2D) {
        this._start = value;
    }

    get center(): Point2D {
        return new Point2D(this.start.x + (this.width / 2), this.start.y + (this.height / 2));
    }

    get end(): Point2D {
        return new Point2D(this.start.x + this.width, this.start.y + this.height);
    }

    set end(value: Point2D) {
        this.width = value.x - this.x;
        this.height = value.y - this.y;
    }

    get leftTop(): Point2D {
        return this.start;
    }

    get leftBottom(): Point2D {
        return new Point2D(this.start.x, this.end.y);
    }

    get rightTop(): Point2D {
        return new Point2D(this.end.x, this.start.y);
    }

    get rightBottom(): Point2D {
        return this.end;
    }

    set width(value: number) {
        this._width = value;
    }

    get width(): number {
        return this._width;
    }

    set height(value: number) {
        this._height = value;
    }

    get height(): number {
        return this._height;
    }


    set widthFromEnd(value: number) {
        this.start.x = this.end.x - value;

    }

    set heightFromEnd(value: number) {
        this.start.y = this.end.y - value;
    }

    set widthFromCenter(value: number) {
        this.start.x = this.center.x - (value / 2);
    }

    set heightFromCenter(value: number) {
        this.start.y = this.center.y - (value / 2);
    }

    public copy(): Rect {
        return new Rect(this.x, this.y, this.width, this.height);
    }

    /////////////////

    getWidthPercent(width: number) {
        return MathUtil.getPercentByTot(this.width, width);
    }

    getWidthByPercent(percent: number) {
        return MathUtil.getValueByTotInPercent(this.width, percent);
    }

    getHeightPercent(height: number) {
        return MathUtil.getPercentByTot(this.height, height);
    }

    getHeightByPercent(percentY: number) {
        return MathUtil.getValueByTotInPercent(this.height, percentY);
    }


    getXPercent(x: number) {
        return MathUtil.getPercentByTot(this.width, x - this.x)
    }

    getXByPercent(xPercent: number) {
        return this.x + MathUtil.getValueByTotInPercent(this.width, xPercent);
    }

    getYPercent(y: number) {
        return MathUtil.getPercentByTot(this.height, y - this.y);
    }

    getYByPercent(yPercent: number) {
        return this.y + MathUtil.getValueByTotInPercent(this.height, yPercent);
    }

    set xByWidthPercent(wPercent: number) {
        this.y = MathUtil.getValueByTotInPercent(this.width, wPercent);
    }

    set yByHeightPercent(hPercent: number) {
        this.y = MathUtil.getValueByTotInPercent(this.height, hPercent);
    }

    set widthByWidthPercent(wPercent: number) {
        this.width = MathUtil.getValueByTotInPercent(this.width, wPercent);
    }

    set heightByHeightPercent(hPercent: number) {
        this.height = MathUtil.getValueByTotInPercent(this.height, hPercent);
    }


    // getWidthHeightPercentByPoint(point: Point2D): Point2D {
    //     return new Point2D(this.getWidthPercent(point.x),this.getHeightPercent(point.y));
    // }
    //
    // getByPercent(point: Point2D): Point2D {
    //     return new Point2D(this.getWidthByPercent(point.x),this.getHeightByPercent(point.y));
    // }

    ///////

    public copyByPercent(percent: number): Rect;
    public copyByPercent(percentX: number, percentY?: number): Rect ;
    public copyByPercent(percentOrX: number, percentY?: number): Rect {
        return new Rect(this.x, this.y,
          MathUtil.getValueByTotInPercent(this.width, percentOrX),
          MathUtil.getValueByTotInPercent(this.height, percentY ?? percentOrX)
          );
    }

    public isIn(data: Point2D): boolean;
    public isIn(data: Rect): boolean
    public isIn(data: Point2D | Rect):boolean {
        if (data instanceof Rect) {
            return this.isIn(data.start) && this.isIn(data.end);
        } else {
            return data.x >= this.start.x && data.x <= this.end.x && data.y >= this.start.y && data.y <= this.end.y;
        }
    }

    public isOut(data: Point2D): boolean;
    public isOut(data: Rect): boolean;
    public isOut(data: Point2D | Rect) {
        if (data instanceof Rect) {
            return !this.isIn(data.start) && !this.isIn(data.end);
        } else {
            return !this.isIn(data);
        }
    }

    public isOverlap(data: Point2D): boolean;
    public isOverlap(data: Rect): boolean;
    public isOverlap(data: Point2D | Rect) {
        if (data instanceof Rect) {
            return (this.isOverlap(data.leftTop) || this.isOverlap(data.rightTop) || this.isOverlap(data.rightBottom) || this.isOverlap(data.leftBottom)) ||  (data.start.x < this.x && data.start.y < this.y && data.end.x > this.end.x && data.end.y > this.end.y);
        } else {
            return this.isIn(data);
        }
    }




}
