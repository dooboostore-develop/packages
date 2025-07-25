import { Point2D } from './Point2D';
import { MathUtil } from '../math/MathUtil';
import AngleUnitType = MathUtil.AngleUnitType;
import { isSizeType, SizeType } from './SizeType';
import { Point2DType } from './Point2DType';

type ValueLinkControl<T> = { value: T, noLink: boolean | Rect };
const isValueLinkControl = <T = any>(data: any): data is ValueLinkControl<T> => {
  return typeof data === 'object' && 'value' in data && 'noLink' in data;
  // return data.value !== undefined && data.noLink !== undefined && typeof data.value === 'object' && typeof data.noLink === 'boolean';
}

export class Rect {
  private _start: Point2D;
  private _width: number
  private _height: number
  private linkRects?: Set<Rect>;

  constructor(size: SizeType);
  constructor(point: Point2DType, endPoint: Point2DType);
  constructor(point: Point2D, endPoint: Point2D);
  constructor(point: Point2D, width?: number, height?: number);
  constructor(x: number, y: number, width?: number, height?: number);
  constructor(xOrPoint: number | Point2D | { x: number, y: number } | SizeType, yOrPointOrWidth?: number | Point2D | { x: number, y: number }, widthOrHeight = 0, heightOrUndefined = 0) {
    if (isSizeType(xOrPoint)) {
      this._start = new Point2D(0, 0);
      this._width = xOrPoint.width;
      this._height = xOrPoint.height;
    } else if (typeof xOrPoint === 'object' && typeof yOrPointOrWidth === 'object') {
      this._start = xOrPoint instanceof Point2D ? xOrPoint : new Point2D(xOrPoint.x, xOrPoint.y);
      this.end = yOrPointOrWidth instanceof Point2D ? yOrPointOrWidth : new Point2D(yOrPointOrWidth.x, yOrPointOrWidth.y);
    } else if (typeof xOrPoint === 'object' && typeof yOrPointOrWidth === 'number') {
      this._start = xOrPoint instanceof Point2D ? xOrPoint : new Point2D(xOrPoint.x, xOrPoint.y);
      this._width = yOrPointOrWidth;
      this._height = widthOrHeight
    } else if (typeof xOrPoint === 'number' && typeof yOrPointOrWidth === 'number') {
      this._start = new Point2D(xOrPoint, yOrPointOrWidth);
      this._width = widthOrHeight;
      this._height = heightOrUndefined;
    }
  }


  private valueLinkControl<T>(value: T | ValueLinkControl<T>) {
    let v: T;
    let noLink: boolean | Rect = false;
    if (isValueLinkControl(value)) {
      v = value.value;
      noLink = value.noLink;
    } else {
      v = value;
    }
    return {value: v, noLink};
  }

  get width(): number {
    return this._width;
  }

  get height(): number {
    return this._height;
  }

  get start(): Point2D {
    return this._start.copy();
  }

  ////////////////////

  set width(width: number) {
    this.setWidth(width);
  }

  public setWidth(width: number | ValueLinkControl<number>) {
    let {value, noLink} = this.valueLinkControl(width);
    const percentDiff = MathUtil.getPercentByTotal(this._width, value);
    this._width = value;
    this.applyWidthPercentLinks({value: percentDiff, noLink});
  }


  set height(height: number) {
    this.setHeight(height);
  }

  public setHeight(height: number | ValueLinkControl<number>) {
    let {value, noLink} = this.valueLinkControl(height);
    const percentDiff = MathUtil.getPercentByTotal(this._height, value);
    this._height = value;
    this.applyHeightPercentLinks({value: percentDiff, noLink});
  }

  set start(inputValue: Point2D) {
    let {value, noLink} = this.valueLinkControl(inputValue);
    const percentDiff = new Point2D({x: MathUtil.getPercentByTotal(this._start.x, value.x), y: MathUtil.getPercentByTotal(this._start.y, value.y)});
    this._start = value;
    this.applyStartPercentLinks({value: percentDiff, noLink});
  }

  // 언제쓰는거지 ㅡㅡ?
  setWidthFromEnd(inputValue: number | ValueLinkControl<number>) {
    let {value, noLink} = this.valueLinkControl(inputValue);
    const percentDiff = MathUtil.getPercentByTotal(this.start.x, value);
    this._start.x = this.end.x - value;
    this.applyStartXPercentLinks({value: percentDiff, noLink});
  }

  set widthFromEnd(inputValue: number) {
    this.setWidthFromEnd(inputValue);
  }

  // 언제쓰는거지 ㅡㅡ?
  setHeightFromEnd(inputValue: number | ValueLinkControl<number>) {
    let {value, noLink} = this.valueLinkControl(inputValue);
    const diff = this.end.y - value;
    const percentDiff = MathUtil.getPercentByTotal(this.start.y, diff);
    this._start.y = diff;
    this.applyStartYPercentLinks({value: percentDiff, noLink});
  }

  set heightFromEnd(inputValue: number) {
    this.setHeightFromEnd(inputValue);
  }

  setWidthFromCenter(inputValue: number | ValueLinkControl<number>) {
    let {value, noLink} = this.valueLinkControl(inputValue);
    const diff = this.center.x - (value / 2);
    const percentDiff = MathUtil.getPercentByTotal(this.start.x, diff);
    this._start.x = diff;
    this.applyStartXPercentLinks(percentDiff);
  }

  set widthFromCenter(inputValue: number) {
    this.setWidthFromCenter(inputValue);
  }

  setHeightFromCenter(inputValue: number | ValueLinkControl<number>) {
    let {value, noLink} = this.valueLinkControl(inputValue);
    const diff = this.center.y - (value / 2);
    const percentDiff = MathUtil.getPercentByTotal(this.start.y, diff);
    this._start.y = diff;
    this.applyStartYPercentLinks(percentDiff);
  }

  set heightFromCenter(inputValue: number | ValueLinkControl<number>) {
    let {value, noLink} = this.valueLinkControl(inputValue);
    const diff = this.center.y - (value / 2);
    const percentDiff = MathUtil.getPercentByTotal(this.start.y, diff);
    this._start.y = diff;
    this.applyStartYPercentLinks(percentDiff);
  }

  set x(inputValue: number) {
    this.setX(inputValue);
  }

  public setX(inputValue: number | ValueLinkControl<number>) {
    let {value, noLink} = this.valueLinkControl(inputValue);
    const diff = value - this._start.x;
    const percentDiff = MathUtil.getPercentByTotal(this.width, diff);
    this._start.x = value;
    this.applyStartXPercentLinks({value: percentDiff, noLink});
  }

  set y(inputValue: number) {
    this.setY(inputValue);
  }

  public setY(inputValue: number | ValueLinkControl<number>) {
    let {value, noLink} = this.valueLinkControl(inputValue);
    const diff = value - this._start.y;
    const percentDiff = MathUtil.getPercentByTotal(this.height, diff);
    this._start.y = value;
    this.applyStartYPercentLinks({value: percentDiff, noLink});
  }

  ////////////////////////////

  applyWidthPercentLinks(widthPercent: number | ValueLinkControl<number>) {
    let {value, noLink} = this.valueLinkControl(widthPercent);
    if (this.linkRects && (typeof noLink === 'boolean' ? !noLink : true)) {
      Array.from(this.linkRects.values()).filter(it => {
        return typeof noLink === 'boolean' ? true : it !== noLink;
      }).forEach(it => {
        it.setWidthByWidthPercent({value: value, noLink: this});
      })
    }
  }

  applyHeightPercentLinks(heightPercent: number | ValueLinkControl<number>) {
    let {value, noLink} = this.valueLinkControl(heightPercent);
    if (this.linkRects && (typeof noLink === 'boolean' ? !noLink : true)) {
      Array.from(this.linkRects.values()).filter(it => {
        return typeof noLink === 'boolean' ? true : it !== noLink;
      }).forEach(it => {
        it.setHeightByHeightPercent({value: value, noLink: this});
      })
    }
  }

  applyStartPercentLinks(startPercent: Point2D | ValueLinkControl<Point2D>) {
    let {value, noLink} = this.valueLinkControl(startPercent);
    this.applyStartXPercentLinks({value: value.x, noLink});
    this.applyStartYPercentLinks({value: value.y, noLink});
  }

  applyStartXPercentLinks(xPercent: number | ValueLinkControl<number>) {
    let {value, noLink} = this.valueLinkControl(xPercent);
    if (this.linkRects && (typeof noLink === 'boolean' ? !noLink : true)) {
      Array.from(this.linkRects.values()).filter(it => {
        return typeof noLink === 'boolean' ? true : it !== noLink;
      }).forEach(it => {
        it.addXByWidthPercent({value: value, noLink: this});
      })
    }
  }

  applyStartYPercentLinks(yPercent: number | ValueLinkControl<number>) {
    let {value, noLink} = this.valueLinkControl(yPercent);
    if (this.linkRects && (typeof noLink === 'boolean' ? !noLink : true)) {
      Array.from(this.linkRects.values()).filter(it => {
        return typeof noLink === 'boolean' ? true : it !== noLink;
      }).forEach(it => {
        it.addYByHeightPercent({value: value, noLink: this});
      })
    }
  }

  hasLink(rect: Rect) {
    return this.linkRects?.has(rect)
  }

  isLinked() {
    return !!this.linkRects?.size;
  }

  addLink(...rect: Rect[]) {
    this.linkRects ??= new Set<Rect>();
    rect.filter(it => !this.linkRects?.has(it)).forEach(it => {
      this.linkRects?.add(it);
      it.addLink(this);
    })
  }

  setLinks(rects: Rect[]) {
    this.unLinkAll();
    this.addLink(...rects);
  }

  unLinkAll() {
    if (this.linkRects) {
      Array.from(this.linkRects.values()).forEach(it => {
        this.unLink(it);
      })
      this.linkRects.clear();
    }
  }

  unLink(rect: Rect | ValueLinkControl<Rect>) {
    let {value, noLink} = this.valueLinkControl(rect);
    if (this.linkRects) {
      this.linkRects.delete(value);
    }
    if (!noLink)
      value.unLink({value: this, noLink: this});
  }

  addWidthPercent(wPercent: number | ValueLinkControl<number>) {
    let {value, noLink} = this.valueLinkControl(wPercent);
    this.setWidth({value: this.width + MathUtil.getValueByTotalInPercent(this.width, value), noLink});
  }

  addHeightPercent(hPercent: number | ValueLinkControl<number>) {
    let {value, noLink} = this.valueLinkControl(hPercent);
    this.setHeight({value: this.height + MathUtil.getValueByTotalInPercent(this.height, value), noLink});
  }

  addWidthRatio(wRatio: number) {
    this.width = this.width + MathUtil.getValueByTotalInRatio(this.width, wRatio);
  }

  addHeightRatio(hRatio: number) {
    this.height = this.height + MathUtil.getValueByTotalInRatio(this.height, hRatio);
  }

  addXPercent(wPercent: number | ValueLinkControl<number>) {
    let {value, noLink} = this.valueLinkControl(wPercent);
    this.setX({value: this.x + MathUtil.getValueByTotalInPercent(this.width, value), noLink});
  }

  addYPercent(hPercent: number | ValueLinkControl<number>) {
    let {value, noLink} = this.valueLinkControl(hPercent);
    this.setY({value: this.y + MathUtil.getValueByTotalInPercent(this.height, value), noLink});
  }

  addXRatio(wRatio: number | ValueLinkControl<number>) {
    let {value, noLink} = this.valueLinkControl(wRatio);
    this.setX({value: this.x + MathUtil.getValueByTotalInRatio(this.width, value), noLink});
  }

  addYRatio(hRatio: number | ValueLinkControl<number>) {
    let {value, noLink} = this.valueLinkControl(hRatio);
    this.setY({value: this.y + MathUtil.getValueByTotalInRatio(this.height, value), noLink});
  }

  ////////////

  set endX(value: number) {
    const diff = value - this.x;
    this.width = diff;
  }

  set endXPercent(endXPercent: number) {
    this.endX = MathUtil.getValueByTotalInPercent(this.width, endXPercent);
  }

  set endYPercent(endYPercent: number) {
    this.endY = MathUtil.getValueByTotalInPercent(this.height, endYPercent);
  }

  set endY(value: number) {
    this.height = value - this.y;
  }

  set end(value: Point2D) {
    this.width = value.x - this.x;
    this.height = value.y - this.y;
  }

  get x(): number {
    return this.start.x;
  }

  get y(): number {
    return this.start.y;
  }

  get endX(): number {
    return this.end.x;
  }

  get endY(): number {
    return this.end.y;
  }

  to(startPoint: Point2D) {
    const r = this.copy();
    r.start = startPoint;
    return r;
  }

  toRotate(r: number, {rotatePoint = this.center, type = 'degreeAngle'}: { rotatePoint?: { x: number, y: number }, type?: AngleUnitType }): Point2D[] {
    const angle = MathUtil.radians(r, {type});
    const centerPoint = rotatePoint instanceof Point2D ? rotatePoint : new Point2D(rotatePoint.x, rotatePoint.y);

    const points = [
      this.leftTop,
      this.rightTop,
      this.rightBottom,
      this.leftBottom
    ];

    return points.map(p => MathUtil.rotatePoint(p, centerPoint, angle));
  }

  get center(): Point2D {
    return new Point2D(this.start.x + (this.width / 2), this.start.y + (this.height / 2));
  }

  get end(): Point2D {
    return new Point2D(this.start.x + this.width, this.start.y + this.height);
  }

  get leftTop(): Point2D {
    return this.start.copy();
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

  public copy(): Rect {
    return new Rect(this.x, this.y, this.width, this.height);
  }

  /////////////////

  getWidthPercent(width: number) {
    return MathUtil.getPercentByTotal(this.width, width);
  }

  getWidthRatio(width: number) {
    return MathUtil.getRatioByTotal(this.width, width);
  }

  getWidthByPercent(percent: number) {
    return MathUtil.getValueByTotalInPercent(this.width, percent);
  }

  getWidthByRatio(percent: number) {
    return MathUtil.getValueByTotalInRatio(this.width, percent);
  }

  getHeightPercent(height: number) {
    return MathUtil.getPercentByTotal(this.height, height);
  }

  getHeightRatio(height: number) {
    return MathUtil.getRatioByTotal(this.height, height);
  }

  getHeightByPercent(percentY: number) {
    return MathUtil.getValueByTotalInPercent(this.height, percentY);
  }

  getHeightByRatio(ratio: number) {
    return MathUtil.getValueByTotalInRatio(this.height, ratio);
  }

  getXPercent(x: number) {
    return MathUtil.getPercentByTotal(this.width, x - this.x)
  }

  getXRatio(x: number) {
    return MathUtil.getRatioByTotal(this.width, x - this.x)
  }

  getXByPercent(xPercent: number) {
    return this.x + MathUtil.getValueByTotalInPercent(this.width, xPercent);
  }

  getXByRatio(ratio: number) {
    return this.x + MathUtil.getValueByTotalInRatio(this.width, ratio);
  }

  getYPercent(y: number) {
    return MathUtil.getPercentByTotal(this.height, y - this.y);
  }

  getYRatio(y: number) {
    return MathUtil.getRatioByTotal(this.height, y - this.y);
  }

  getYByPercent(yPercent: number) {
    return this.y + MathUtil.getValueByTotalInPercent(this.height, yPercent);
  }

  getYByRatio(ratio: number) {
    return this.y + MathUtil.getValueByTotalInRatio(this.height, ratio);
  }

  getPercent(point: { x: number, y: number }): Point2D {
    return new Point2D(
      this.getXPercent(point.x),
      this.getYPercent(point.y),
    );
  }

  /**
   * 주어진 width에 맞춰 비율에 따라 height를 스케일링하여 새로운 Rect를 반환합니다.
   * @param width 새로운 width 값
   * @returns 비율에 맞게 height가 조정된 Rect
   */
  toScaleByWidth(width: number): Rect {
    const ratio = this.height / this.width;
    return new Rect(this.x, this.y, width, width * ratio);
  }
  /**
   * 주어진 height에 맞춰 비율에 따라 width를 스케일링하여 새로운 Rect를 반환합니다.
   * @param height 새로운 height 값
   * @returns 비율에 맞게 width가 조정된 Rect
   */
  toScaleByHeight(height: number): Rect {
    const ratio = this.width / this.height;
    return new Rect(this.x, this.y, height * ratio, height);
  }

  toRatio(point: Rect | { x: number, y: number, w: number, h: number }): Rect {
    return new Rect(
      this.getXRatio(point.x),
      this.getYRatio(point.y),
      this.getWidthRatio(point instanceof Rect ? point.width : point.w),
      this.getHeightRatio(point instanceof Rect ? point.height : point.h),
    );
  }

  getRatio(point: { x: number, y: number }) {
    return new Point2D(
      this.getXRatio(point.x),
      this.getYRatio(point.y),
    );
  }

  getByPercent(percent: { x: number, y: number }): Point2D {
    return new Point2D(
      this.getXByPercent(percent.x),
      this.getYByPercent(percent.y),
    );
  }

  getByRatio(ratio: { x: number, y: number }) {
    return new Point2D(
      this.getXByRatio(ratio.x),
      this.getYByRatio(ratio.y),
    );
  }

  getDiffX(x: number) {
    return x - this.x;
  }

  getDiffY(y: number) {
    return y - this.y;
  }

  getDiffLeft(x: number) {
   this.getDiffX(x);
  }

  getDiffTop(y: number) {
    this.getDiffY(y);
  }

  getDiffRight(x: number) {
      return x - this.end.x;
    }

    getDiffBottom(y: number) {
      return y - this.end.y;
    }

  getDiffWidth(width: number) {
    return width - this.width;
  }

  getDiffHeight(height: number) {
    return height - this.height;
  }

  toDiff(rect: Rect) {
    return new Rect(
      rect.x - this.x,
      rect.y - this.y,
      rect.width - this.width,
      rect.height - this.height,
    );
  }

  setXByWidthPercent(wPercent: number | ValueLinkControl<number>) {
    let {value, noLink} = this.valueLinkControl(wPercent);
    this.setX({value: MathUtil.getValueByTotalInPercent(this.width, value), noLink});
  }

  set xByWidthPercent(wPercent: number) {
    this.setXByWidthPercent(wPercent);
  }

  setXByWidthRatio(wRatio: number | ValueLinkControl<number>) {
    let {value, noLink} = this.valueLinkControl(wRatio);
    this.setX({value: MathUtil.getValueByTotalInRatio(this.width, value), noLink});
  }

  set xByWidthRatio(wRatio: number) {
    this.setXByWidthRatio(wRatio);
  }

  setYByHeightPercent(hPercent: number | ValueLinkControl<number>) {
    let {value, noLink} = this.valueLinkControl(hPercent);
    this.setY({value: MathUtil.getValueByTotalInPercent(this.height, value), noLink});
  }

  set yByHeightPercent(hPercent: number) {
    this.setYByHeightPercent(hPercent);
  }

  setYByHeightRatio(ratio: number | ValueLinkControl<number>) {
    let {value, noLink} = this.valueLinkControl(ratio);
    this.setY({value: MathUtil.getValueByTotalInRatio(this.height, value), noLink});
  }

  set yByHeightRatio(ratio: number) {
    this.setYByHeightRatio(ratio);
  }

  addXByWidthPercent(wPercent: number | ValueLinkControl<number>) {
    let {value, noLink} = this.valueLinkControl(wPercent);
    this.setX({value: this.x + MathUtil.getValueByTotalInPercent(this.width, value), noLink});
  }

  addXByWidthRatio(wRatio: number | ValueLinkControl<number>) {
    let {value, noLink} = this.valueLinkControl(wRatio);
    this.setX({value: this.x + MathUtil.getValueByTotalInRatio(this.width, value), noLink});
  }

  addYByHeightPercent(hPercent: number | ValueLinkControl<number>) {
    let {value, noLink} = this.valueLinkControl(hPercent);
    this.setY({value: this.y + MathUtil.getValueByTotalInPercent(this.height, value), noLink});
  }

  addYByHeightRatio(ratio: number | ValueLinkControl<number>) {
    let {value, noLink} = this.valueLinkControl(ratio);
    this.setY({value: this.y + MathUtil.getValueByTotalInRatio(this.height, value), noLink});
  }

  setWidthByWidthPercent(wPercent: number | ValueLinkControl<number>) {
    let {value, noLink} = this.valueLinkControl(wPercent);
    this.setWidth({value: MathUtil.getValueByTotalInPercent(this.width, value), noLink});
  }

  set widthByWidthPercent(wPercent: number) {
    this.setWidthByWidthPercent(wPercent);
  }

  setWidthByWidthRatio(wRatio: number | ValueLinkControl<number>) {
    let {value, noLink} = this.valueLinkControl(wRatio);
    this.setWidth({value: MathUtil.getValueByTotalInRatio(this.width, value), noLink});
  }

  set widthByWidthRatio(wRatio: number) {
    this.setWidthByWidthRatio(wRatio);
  }

  setHeightByHeightPercent(hPercent: number | ValueLinkControl<number>) {
    let {value, noLink} = this.valueLinkControl(hPercent);
    this.setHeight({value: MathUtil.getValueByTotalInPercent(this.height, value), noLink});
  }

  set heightByHeightPercent(hPercent: number) {
    this.setHeightByHeightPercent(hPercent);
  }

  setHeightByHeightRatio(hRatio: number | ValueLinkControl<number>) {
    let {value, noLink} = this.valueLinkControl(hRatio);
    this.setHeight({value: MathUtil.getValueByTotalInRatio(this.height, value), noLink});
  }

  set heightByHeightRatio(hRatio: number) {
    this.setHeightByHeightRatio(hRatio);
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
      MathUtil.getValueByTotalInPercent(this.width, percentOrX),
      MathUtil.getValueByTotalInPercent(this.height, percentY ?? percentOrX)
    );
  }

  public copyByRatio(ratio: number): Rect;
  public copyByRatio(ratioX: number, ratioY?: number): Rect ;
  public copyByRatio(ratioOrX: number, ratioY?: number): Rect {
    return new Rect(this.x, this.y,
      MathUtil.getValueByTotalInRatio(this.width, ratioOrX),
      MathUtil.getValueByTotalInRatio(this.height, ratioY ?? ratioOrX)
    );
  }

  public isIn(data: { x: number, y: number }): boolean;
  public isIn(data: Point2D): boolean;
  public isIn(data: Rect): boolean
  public isIn(data: Point2D | Rect | { x: number, y: number }): boolean {
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
      return !this.isOverlap(data);
    } else {
      return !this.isIn(data);
    }
  }

  public isOverlap(data: Point2D): boolean;
  public isOverlap(data: Rect): boolean;
  public isOverlap(data: Point2D | Rect) {
    if (data instanceof Rect) {
      /*
 새로운 로직은 반대로 "겹치지 않는 조건"을 찾고, 그 조건에 해당하지 않으면 "겹친다"고 판단하는
  방식입니다. 이 방법이 훨씬 간단하고 모든 경우를 처리할 수 있습니다.

  두 사각형(A와 B)이 겹치지 않으려면, 다음 네 가지 조건 중 하나라도 만족해야 합니다.
   1. A가 B의 완전히 왼쪽에 있을 때
       * A의 오른쪽 끝(this.endX)이 B의 왼쪽 시작(data.x)보다 왼쪽에 있는 경우
       * 코드: this.endX < data.x


   2. A가 B의 완전히 오른쪽에 있을 때
       * A의 왼쪽 시작(this.x)이 B의 오른쪽 끝(data.endX)보다 오른쪽에 있는 경우
       * 코드: this.x > data.endX


   3. A가 B의 완전히 위쪽에 있을 때
       * A의 아래쪽 끝(this.endY)이 B의 위쪽 시작(data.y)보다 위쪽에 있는 경우
       * 코드: this.endY < data.y


   4. A가 B의 완전히 아래쪽에 있을 때
       * A의 위쪽 시작(this.y)이 B의 아래쪽 끝(data.endY)보다 아래쪽에 있는 경우
       * 코드: this.y > data.endY
       */
      const noOverlap = this.endX < data.x ||
        this.x > data.endX ||
        this.endY < data.y ||
        this.y > data.endY;
      return !noOverlap;
      // return (
      //   this.isOverlap(data.leftTop) ||
      //   this.isOverlap(data.rightTop) ||
      //   this.isOverlap(data.rightBottom) ||
      //   this.isOverlap(data.leftBottom)) ||
      //   (
      //     data.start.x < this.x && data.start.y < this.y &&
      //     data.end.x > this.end.x && data.end.y > this.end.y
      //   );
    } else {
      return this.isIn(data);
    }
  }

  public toString(): string {
    return `x:${this.x}, y:${this.y}, width: ${this.width}, height: ${this.height}`;
  }

}
