import { Rect } from './Rect';
import { SizeType } from './SizeType';
import { ArrayUtils } from '../array/ArrayUtils';
import { Point2D } from './Point2D';
import { Ellipse } from './Ellipse';

export class WrapRects {
  public rects: Set<Rect>;
  private _x: number;
  private _y: number;
  private _width: number;
  private _height: number;
  private _initialX: number;
  private _initialY: number;
  private _initialWidth: number;
  private _initialHeight: number;

  constructor(x: number, y: number, width: number, height: number, rects: Rect[] = []) {
    this._initialX = x;
    this._initialY = y;
    this._initialWidth = width;
    this._initialHeight = height;

    // Initialize _x, _y, _width, _height with the provided initial bounds.
    // These will be updated by _updateContentBounds based on actual rects.
    this._x = x;
    this._y = y;
    this._width = width;
    this._height = height;

    this.rects = new Set();
    // Add rects directly without transformation in the constructor
    rects.forEach(rect => this.rects.add(rect));

    // Ensure the overall bounds are correctly set after initial rects are processed
    // This will calculate the actual bounds of the contained rects and ensure they are not smaller than initial bounds.
    const currentOverallBounds = this._updateContentBounds();
    this._x = currentOverallBounds.x;
    this._y = currentOverallBounds.y;
    this._width = currentOverallBounds.width;
    this._height = currentOverallBounds.height;
  }

  private _updateContentBounds(): Rect {
    if (this.rects.size === 0) {
      // If no rects, revert to initial bounds
      return new Rect(this._initialX, this._initialY, this._initialWidth, this._initialHeight);
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const r of Array.from(this.rects)) {
      minX = Math.min(minX, r.x);
      minY = Math.min(minY, r.y);
      maxX = Math.max(maxX, r.x + r.width);
      maxY = Math.max(maxY, r.y + r.height);
    }

    // Ensure the bounds are at least as large as the initial bounds
    minX = Math.min(minX, this._initialX);
    minY = Math.min(minY, this._initialY);
    maxX = Math.max(maxX, this._initialX + this._initialWidth);
    maxY = Math.max(maxY, this._initialY + this._initialHeight);

    return new Rect(minX, minY, maxX - minX, maxY - minY);
  }

  get x() {
    return this._x;
  }

  set x(value: number) {
    if (this._x === value) return;
    const offsetX = value - this._x;
    this._x = value;
    this._applyTranslationToRects(offsetX, 0);
  }

  get y() {
    return this._y;
  }

  set y(value: number) {
    if (this._y === value) return;
    const offsetY = value - this._y;
    this._y = value;
    this._applyTranslationToRects(0, offsetY);
  }

  get width() {
    return this._width;
  }

  set width(value: number) {
    if (this._width === value) return;
    const oldWidth = this._width;
    this._width = value;

    if (oldWidth === 0) {
      console.warn("Cannot scale rects proportionally if old width was 0.");
      return;
    }
    const scaleX = this._width / oldWidth;
    this._applyScalingToRects(scaleX, 1, this._x, this._y);
  }

  get height() {
    return this._height;
  }

  set height(value: number) {
    if (this._height === value) return;
    const oldHeight = this._height;
    this._height = value;

    if (oldHeight === 0) {
      console.warn("Cannot scale rects proportionally if old height was 0.");
      return;
    }
    const scaleY = this._height / oldHeight;
    this._applyScalingToRects(1, scaleY, this._x, this._y);
  }

  private _applyTranslationToRects(offsetX: number, offsetY: number): void {
    if (offsetX === 0 && offsetY === 0) return;
    for (const rect of Array.from(this.rects)) {
      rect.x += offsetX;
      rect.y += offsetY;
    }
  }

  private _applyScalingToRects(scaleX: number, scaleY: number, originX: number, originY: number): void {
    if (scaleX === 1 && scaleY === 1) return;
    for (const rect of Array.from(this.rects)) {
      // Translate rect so origin is at (0,0)
      const translatedX = rect.x - originX;
      const translatedY = rect.y - originY;

      // Scale position
      const scaledX = translatedX * scaleX;
      const scaledY = translatedY * scaleY;

      // Scale dimensions
      rect.width *= scaleX;
      rect.height *= scaleY;

      // Translate back
      rect.x = scaledX + originX;
      rect.y = scaledY + originY;
    }
  }

  add(...newRects: Rect[]): void {
    newRects.forEach(rect => this.rects.add(rect));
    // Note: _updateContentBounds now only calculates and returns the bounds, it doesn't set this.x,y,width,height
    // The setters for x,y,width,height are responsible for applying transformations to internal rects.
    // So, after adding new rects, we need to ensure the overall bounds are updated.
    const currentOverallBounds = this._updateContentBounds();
    this._x = currentOverallBounds.x;
    this._y = currentOverallBounds.y;
    this._width = currentOverallBounds.width;
    this._height = currentOverallBounds.height;
  }

  remove(rectToRemove: Rect): void {
    if (this.rects.delete(rectToRemove)) {
      const currentOverallBounds = this._updateContentBounds();
      this._x = currentOverallBounds.x;
      this._y = currentOverallBounds.y;
      this._width = currentOverallBounds.width;
      this._height = currentOverallBounds.height;
    }
  }

  getContainedRectsOverallBounds(): Rect {
    if (this.rects.size === 0) {
      return new Rect(0, 0, 0, 0);
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const r of Array.from(this.rects)) {
      minX = Math.min(minX, r.x);
      minY = Math.min(minY, r.y);
      maxX = Math.max(maxX, r.x + r.width);
      maxY = Math.max(maxY, r.y + r.height);
    }

    return new Rect(minX, minY, maxX - minX, maxY - minY);
  }

  copy(): WrapRects {
    return new WrapRects(
      this._initialX,
      this._initialY,
      this._initialWidth,
      this._initialHeight,
      Array.from(this.rects).map(r => r.copy())
    );
  }

  // 정확하게 나의 안쪽에 서만 있는거
  toFilterRectsIn(targetRect: Rect): WrapRects {
    const filteredRects = Array.from(this.rects).filter(r => targetRect.isIn(r));
    return new WrapRects(
      this._initialX,
      this._initialY,
      this._initialWidth,
      this._initialHeight,
      filteredRects
    );
  }

  toFilterRectsOut(targetRect: Rect): WrapRects {
    const filteredRects = Array.from(this.rects).filter(r => !targetRect.isOverlap(r));
    return new WrapRects(
      this._initialX,
      this._initialY,
      this._initialWidth,
      this._initialHeight,
      filteredRects
    );
  }

  // 내가 포함한곳에 겹쳐있는거
  toFilterRectsOverlap(targetRect: Rect): WrapRects {
    const filteredRects = Array.from(this.rects).filter(r => targetRect.isOverlap(r));
    return new WrapRects(
      this._initialX,
      this._initialY,
      this._initialWidth,
      this._initialHeight,
      filteredRects
    );
  }

  findEmptySpace(size: SizeType, searchArea?: Rect): Rect | null {
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

  findRandomEmptySpace(size: SizeType, searchArea?: Rect, maxAttempts: number = 100): Rect | null {
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


  addRandomEmptySpaces(sizes: SizeType[], searchArea?: Rect, maxAttempts?: number) {
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

  addRandomEmptySpace(size: SizeType, searchArea?: Rect, maxAttempts?: number): Rect | null {
    const emptySpace = this.findRandomEmptySpace(size, searchArea, maxAttempts);
    if (emptySpace) {
      this.add(emptySpace);
    }
    return emptySpace;
  }

  addRandomSpace(size: SizeType, searchArea?: Rect): Rect {
    const bounds = searchArea || new Rect(this.x, this.y, this.width, this.height);
    const randomX = Math.random() * (bounds.width - size.width) + bounds.x;
    const randomY = Math.random() * (bounds.height - size.height) + bounds.y;
    const newRect = new Rect(randomX, randomY, size.width, size.height);
    this.add(newRect);
    return newRect;
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