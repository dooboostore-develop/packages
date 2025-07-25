import { Polygon } from './Polygon';
import { Rect } from './Rect';
import { Point2D } from './Point2D';
import { Ellipse } from './Ellipse';

/**
 * Manages a collection of Polygon objects, providing methods for aggregation and spatial queries.
 * It also maintains an overall bounding box for the contained polygons.
 */
export class WrapPolygons {
  private _polygons: Set<Polygon>;
  private _x: number;
  private _y: number;
  private _width: number;
  private _height: number;
  private _initialX: number; // Added
  private _initialY: number; // Added
  private _initialWidth: number; // Added
  private _initialHeight: number; // Added

  /**
   * Creates a new WrapPolygons instance.
   * @param x The initial x-coordinate of the overall bounding box.
   * @param y The initial y-coordinate of the overall bounding box.
   * @param width The initial width of the overall bounding box.
   * @param height The initial height of the overall bounding box.
   * @param polygons An array of Polygon objects to initialize the collection.
   */
  constructor(
    x: number = 0,
    y: number = 0,
    width: number = 0,
    height: number = 0,
    polygons: Polygon[] = []
  ) {
    this._polygons = new Set(polygons);

    // Store the initial bounds provided
    this._initialX = x; // Stored
    this._initialY = y; // Stored
    this._initialWidth = width; // Stored
    this._initialHeight = height; // Stored

    // Initialize _x, _y, _width, _height with the provided initial bounds.
    // These will be updated by _calculateOverallBounds based on actual polygons.
    this._x = x;
    this._y = y;
    this._width = width;
    this._height = height;

    // Calculate and set the initial overall bounds based on the provided polygons and initial bounds.
    this._calculateOverallBounds();
  }

  get polygons() {
    return Array.from(this._polygons.values());
  }

  get x() {
    return this._x;
  }

  set x(value: number) {
    if (this._x === value) return;
    const offsetX = value - this._x;
    this._x = value;
    this._applyTranslationToPoints(offsetX, 0);
  }

  get y() {
    return this._y;
  }

  set y(value: number) {
    if (this._y === value) return;
    const offsetY = value - this._y;
    this._y = value;
    this._applyTranslationToPoints(0, offsetY);
  }

  get width() {
    return this._width;
  }

  set width(value: number) {
    if (this._width === value) return;
    const oldWidth = this._width;
    this._width = value;

    if (oldWidth === 0) {
      console.warn("Cannot scale polygons proportionally if old width was 0.");
      return;
    }
    const scaleX = this._width / oldWidth;
    this._applyScalingToPoints(scaleX, 1, this._x, this._y);
  }

  get height() {
    return this._height;
  }

  set height(value: number) {
    if (this._height === value) return;
    const oldHeight = this._height;
    this._height = value;

    if (oldHeight === 0) {
      console.warn("Cannot scale polygons proportionally if old height was 0.");
      return;
    }
    const scaleY = this._height / oldHeight;
    this._applyScalingToPoints(1, scaleY, this._x, this._y);
  }

  /**
   * Recalculates the overall bounding box (x, y, width, height) of all contained polygons.
   * This method should be called after adding or removing polygons if the bounds need to be updated.
   * @private
   */
  private _calculateOverallBounds(): void {
    if (this.polygons.length === 0) {
      // If no polygons, revert to initial bounds
      this._x = this._initialX;
      this._y = this._initialY;
      this._width = this._initialWidth;
      this._height = this._initialHeight;
      return;
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const polygon of this.polygons) {
      const rect = polygon.toRect();
      minX = Math.min(minX, rect.x);
      minY = Math.min(minY, rect.y);
      maxX = Math.max(maxX, rect.x + rect.width);
      maxY = Math.max(maxY, rect.y + rect.height);
    }

    // Ensure the bounds are at least as large as the initial bounds
    minX = Math.min(minX, this._initialX);
    minY = Math.min(minY, this._initialY);
    maxX = Math.max(maxX, this._initialX + this._initialWidth);
    maxY = Math.max(maxY, this._initialY + this._initialHeight);

    this._x = minX;
    this._y = minY;
    this._width = maxX - minX;
    this._height = maxY - minY;
  }

  /**
   * Applies translation to all Point2D objects within the polygons.
   * @param offsetX The amount to translate along the x-axis.
   * @param offsetY The amount to translate along the y-axis.
   * @private
   */
  private _applyTranslationToPoints(offsetX: number, offsetY: number): void {
    if (offsetX === 0 && offsetY === 0) return;
    for (const polygon of Array.from(this.polygons)) {
      // Assuming Polygon has a private 'point2ds' property which is a Point2ds object
      // And Point2ds has a 'points' array of Point2D objects
      for (const point of polygon['point2ds']) {
        point.x += offsetX;
        point.y += offsetY;
      }
    }
  }

  /**
   * Applies scaling to all Point2D objects within the polygons relative to a given origin.
   * @param scaleX The scaling factor along the x-axis.
   * @param scaleY The scaling factor along the y-axis.
   * @param originX The x-coordinate of the scaling origin.
   * @param originY The y-coordinate of the scaling origin.
   * @private
   */
  private _applyScalingToPoints(scaleX: number, scaleY: number, originX: number, originY: number): void {
    if (scaleX === 1 && scaleY === 1) return;
    for (const polygon of Array.from(this.polygons)) {
      for (const point of polygon['point2ds']) {
        // Translate point so origin is at (0,0)
        const translatedX = point.x - originX;
        const translatedY = point.y - originY;

        // Scale
        const scaledX = translatedX * scaleX;
        const scaledY = translatedY * scaleY;

        // Translate back
        point.x = scaledX + originX;
        point.y = scaledY + originY;
      }
    }
  }

  /**
   * Adds one or more polygons to the collection and updates the overall bounds.
   * @param newPolygons The Polygon objects to add. 
   */
  add(...newPolygons: Polygon[]): void {
    newPolygons.forEach(polygon => this._polygons.add(polygon));
    this._calculateOverallBounds();
  }

  /**
   * Removes a specific polygon from the collection and updates the overall bounds.
   * @param polygonToRemove The Polygon object to remove.
   */
  remove(polygonToRemove: Polygon): void {
    if (this._polygons.delete(polygonToRemove)) {
      this._calculateOverallBounds();
    }
  }

  /**
   * Creates a deep copy of this WrapPolygons instance, including copies of all contained polygons.
   * @returns A new WrapPolygons instance.
   */
  copy(): WrapPolygons {
    return new WrapPolygons(
      this._initialX,
      this._initialY,
      this._initialWidth,
      this._initialHeight,
      Array.from(this.polygons).map(p => p.copy())
    );
  }

  /**
   * Checks if a given point is inside any of the polygons in the collection.
   * @param point The point to check.
   * @returns True if the point is inside at least one polygon, false otherwise.
   */
  isIn(point: Point2D): boolean {
    for (const polygon of Array.from(this.polygons)) {
      if (polygon.isIn(point)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Checks if a given point is outside all polygons in the collection.
   * @param point The point to check.
   * @returns True if the point is outside all polygons, false otherwise.
   */
  isOut(point: Point2D): boolean {
    return !this.isIn(point);
  }

  /**
   * Checks for overlap between this collection of polygons and another geometric shape.
   * @param data The geometric shape to check for overlap with (Point2D, Rect, Ellipse, or another WrapPolygons).
   * @returns True if any polygon in the collection overlaps with the given shape, false otherwise.
   */
  isOverlap(data: Point2D | Rect | Ellipse | WrapPolygons): boolean {
    if (data instanceof Point2D) {
      return this.isIn(data);
    }

    if (data instanceof WrapPolygons) {
      for (const p1 of Array.from(this.polygons)) {
        for (const p2 of Array.from(data.polygons)) {
          if (p1.isOverlap(p2)) {
            return true;
          }
        }
      }
      return false;
    }

    // For other shapes, check each polygon individually
    for (const polygon of Array.from(this.polygons)) {
      if (polygon.isOverlap(data)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Returns a Rect representing the overall axis-aligned bounding box of all polygons in the collection.
   * @returns A Rect object.
   */
  toRect(): Rect {
    return new Rect(this.x, this.y, this.width, this.height);
  }

  /**
   * Returns a Rect representing the overall axis-aligned bounding box of only the contained polygons,
   * without considering the initial bounds of the WrapPolygons instance.
   * @returns A Rect object. Returns a Rect at (0,0) with 0 width/height if no polygons are present.
   */
  getContainedPolygonsOverallBounds(): Rect {
    if (this._polygons.size === 0) {
      return new Rect(0, 0, 0, 0);
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const polygon of Array.from(this._polygons)) {
      const rect = polygon.toRect();
      minX = Math.min(minX, rect.x);
      minY = Math.min(minY, rect.y);
      maxX = Math.max(maxX, rect.x + rect.width);
      maxY = Math.max(maxY, rect.y + rect.height);
    }

    return new Rect(minX, minY, maxX - minX, maxY - minY);
  }

  /**
   * Filters the polygons in the collection, returning a new WrapPolygons instance
   * containing only those polygons that are entirely contained within the target Rect.
   * @param targetRect The Rect to check containment against.
   * @returns A new WrapPolygons instance with filtered polygons.
   */
  filterPolygonsIn(targetRect: Rect): WrapPolygons {
    const filtered = Array.from(this.polygons).filter(p => targetRect.isIn(p.toRect())); // Simplified: checks bounding box containment
    return new WrapPolygons(
      this._initialX,
      this._initialY,
      this._initialWidth,
      this._initialHeight,
      filtered
    );
  }

  /**
   * Filters the polygons in the collection, returning a new WrapPolygons instance
   * containing only those polygons that do not overlap with the target Rect.
   * @param targetRect The Rect to check non-overlap against.
   * @returns A new WrapPolygons instance with filtered polygons.
   */
  filterPolygonsOut(targetRect: Rect): WrapPolygons {
    const filtered = Array.from(this.polygons).filter(p => !p.isOverlap(targetRect));
    return new WrapPolygons(
      this._initialX,
      this._initialY,
      this._initialWidth,
      this._initialHeight,
      filtered
    );
  }

  /**
   * Filters the polygons in the collection, returning a new WrapPolygons instance
   * containing only those polygons that overlap with the target Rect.
   * @param targetRect The Rect to check overlap against.
   * @returns A new WrapPolygons instance with filtered polygons.
   */
  filterPolygonsOverlap(targetRect: Rect): WrapPolygons {
    const filtered = Array.from(this.polygons).filter(p => p.isOverlap(targetRect));
    return new WrapPolygons(
      this._initialX,
      this._initialY,
      this._initialWidth,
      this._initialHeight,
      filtered
    );
  }

  /**
   * Merges a new polygon with existing polygons in the collection if they overlap or are within a certain proximity.
   * If no overlap/proximity is found, the new polygon is simply added.
   * @param newPolygon The Polygon to merge or add. 
   * @param mergeThresholdPx The maximum distance (in pixels) for polygons to be considered for merging. Default is 0.
   */
  merge(newPolygon: Polygon, mergeThresholdPx: number = 0): boolean {
    const newPolygonRect = newPolygon.toRect();
    // Expand the new polygon's bounding box by the threshold for proximity check
    const expandedNewPolygonRect = new Rect(
      newPolygonRect.x - mergeThresholdPx,
      newPolygonRect.y - mergeThresholdPx,
      newPolygonRect.width + (2 * mergeThresholdPx),
      newPolygonRect.height + (2 * mergeThresholdPx)
    );

    let merged = false;
    const polygonsToMerge: Polygon[] = [];
    const remainingPolygons: Polygon[] = [];

    // Find all existing polygons that overlap with the expanded newPolygonRect
    for (const existingPolygon of Array.from(this.polygons)) {
      if (existingPolygon.isOverlap(expandedNewPolygonRect)) {
        polygonsToMerge.push(existingPolygon);
      } else {
        remainingPolygons.push(existingPolygon);
      }
    }

    if (polygonsToMerge.length > 0) {
      // If there are polygons to merge, combine all their points with the newPolygon's points
      let allPoints: Point2D[] = [];
      // Add points from the new polygon
      // Accessing private point2ds directly for its points array
      allPoints.push(...newPolygon['point2ds']);

      // Add points from all overlapping existing polygons
      for (const p of polygonsToMerge) {
        allPoints.push(...p['point2ds']);
      }

      // Create a new Polygon from the combined points
      // Note: This simple combination of points might not result in a geometrically correct union
      // for complex polygons (e.g., self-intersections, holes).
      // For a robust solution, a dedicated polygon union algorithm would be needed.
      const combinedPolygon = new Polygon(allPoints);

      // Clear existing polygons and add the new combined one
      this._polygons.clear();
      this.add(...remainingPolygons, combinedPolygon); // Add remaining and the new combined polygon
      merged = true;
    } else {
      // No overlap/proximity, just add the new polygon
      this.add(newPolygon);
    }

    this._calculateOverallBounds(); // Recalculate overall bounds after merge/add
    return merged;
  }
}