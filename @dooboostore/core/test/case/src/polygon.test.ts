import { Point2D } from '@dooboostore/core/entity/Point2D';
import { Polygon } from '@dooboostore/core/entity/Polygon';
import { WrapPolygons } from '@dooboostore/core/entity/WrapPolygons';
import { Rect } from '@dooboostore/core/entity/Rect';

export const polygonTest = () => {

  console.log('--- Polygon and WrapPolygons Test ---');

// Helper function to log test results
  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
    } else {
      console.error(`❌ FAIL: ${message}`);
    }
  }

// --- Test Point2D ---
  console.log('\n--- Testing Point2D ---');
  const p1 = new Point2D(0, 0);
  const p2 = new Point2D(10, 10);
  assert(p1.x === 0 && p1.y === 0, 'Point2D constructor and properties');
  assert(p2.x === 10 && p2.y === 10, 'Point2D constructor with values');
  const p1Copy = p1.copy();
  assert(p1Copy.x === p1.x && p1Copy.y === p1.y && p1Copy !== p1, 'Point2D copy method');

// --- Test Polygon ---
  console.log('\n--- Testing Polygon ---');
  const poly1Points = [
    new Point2D(0, 0),
    new Point2D(10, 0),
    new Point2D(10, 10),
    new Point2D(0, 10),
  ];
  const poly1 = new Polygon(poly1Points);

  assert(poly1.isIn(new Point2D(5, 5)), 'Polygon.isIn (inside)');
  assert(!poly1.isIn(new Point2D(15, 5)), 'Polygon.isIn (outside)');
  assert(poly1.isOut(new Point2D(15, 5)), 'Polygon.isOut (outside)');
  assert(!poly1.isOut(new Point2D(5, 5)), 'Polygon.isOut (inside)');

  const poly1Rect = poly1.toRect();
  assert(poly1Rect.x === 0 && poly1Rect.y === 0 && poly1Rect.width === 10 && poly1Rect.height === 10, 'Polygon.toRect');

  const poly1Copy = poly1.copy();
  assert(poly1Copy.isIn(new Point2D(5, 5)), 'Polygon.copy creates functional copy');
  assert(poly1Copy !== poly1, 'Polygon.copy creates new instance');

  console.log('\n--- All tests completed ---');



}